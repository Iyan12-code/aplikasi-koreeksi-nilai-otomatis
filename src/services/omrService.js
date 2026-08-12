/**
 * ============================================================================
 * CLASS OMRProcessor (100% PURE JAVASCRIPT PORT OF Android OMRProcessor.java)
 * ============================================================================
 * Melokalisasi grid jawaban dan mendeteksi bulatan jawaban OMR
 * menggunakan teknik computer vision murni sesuai kode sumber Java Android.
 */

const NUM_QUESTIONS_PER_COLUMN = 5;
const NUM_OPTIONS = 4;
const NUM_COLUMNS = 5;
const OPTIONS = ["A", "B", "C", "D"];

/**
 * Memastikan OpenCV.js siap dieksekusi di browser
 */
async function waitForOpenCvReady() {
  if (typeof cv !== 'undefined' && cv.Mat && cv.getStructuringElement) {
    return true;
  }
  return new Promise((resolve) => {
    let checks = 0;
    const interval = setInterval(() => {
      checks++;
      if (typeof cv !== 'undefined' && cv.Mat && cv.getStructuringElement) {
        clearInterval(interval);
        resolve(true);
      } else if (checks > 30) {
        clearInterval(interval);
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Entry point utama pemrosesan OMR
 */
export async function processOmrImage(imgElement, answerKeys) {
  const keys = (answerKeys && answerKeys.length > 0) ? answerKeys : Array(25).fill('A');
  const numQuestions = keys.length;

  // 1. Pastikan gambar sudah termuat utuh
  if (!imgElement.complete || imgElement.naturalWidth === 0) {
    await new Promise((resolve) => {
      imgElement.onload = resolve;
      imgElement.onerror = resolve;
      setTimeout(resolve, 500);
    });
  }

  const naturalWidth = imgElement.naturalWidth || imgElement.width || 1024;
  const naturalHeight = imgElement.naturalHeight || imgElement.height || 576;

  // Konversi gambar ke base64
  let base64Data = imgElement.src;
  if (!base64Data || !base64Data.startsWith('data:image')) {
    const c = document.createElement('canvas');
    c.width = naturalWidth;
    c.height = naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(imgElement, 0, 0, naturalWidth, naturalHeight);
    base64Data = c.toDataURL('image/jpeg', 0.95);
  }

  // 2. Coba endpoint Python Backend jika berjalan lokal (/api/scan_omr)
  try {
    const response = await fetch('/api/scan_omr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64Data,
        keys: keys,
        totalQuestions: numQuestions,
      }),
    });

    if (response.ok) {
      const apiResult = await response.json();
      if (apiResult && apiResult.detectedAnswers && apiResult.detectedAnswers.length === numQuestions) {
        console.log(`[OMRProcessor] Sukses via Python Backend Native:`, apiResult);
        return apiResult;
      }
    }
  } catch (e) {
    // Mode standalone di Vercel atau tanpa python server
  }

  // 3. Eksekusi Browser OpenCV.js (Port Murni 1:1 OMRProcessor.java)
  const isCvReady = await waitForOpenCvReady();
  if (isCvReady) {
    try {
      const result = executeJavaOmrPipeline(imgElement, keys, naturalWidth, naturalHeight);
      if (result && result.detectedAnswers && result.detectedAnswers.length === numQuestions) {
        console.log(`[OMRProcessor] Sukses via In-Browser OpenCV.js Engine:`, result);
        return result;
      }
    } catch (err) {
      console.warn("[OMRProcessor] OpenCV.js processing warning:", err);
    }
  }

  // 4. Fallback: Eksekusi Canvas Densitometry Engine (1:1 Formula)
  console.log(`[OMRProcessor] Menjalankan Canvas Densitometry Pipeline...`);
  return executeCanvasOmrPipeline(imgElement, keys, naturalWidth, naturalHeight);
}

/**
 * 1:1 Port dari processAnswerSheet(), findAndCropAnswerGrid(), detectAnswers(), compareAnswers()
 */
function executeJavaOmrPipeline(imgElement, keys, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgElement, 0, 0, width, height);

  let fullImageMat = cv.imread(canvas);

  try {
    // --- Step 1: findAndCropAnswerGrid(fullImageMat) ---
    let croppedGridMat = findAndCropAnswerGrid(fullImageMat);

    // --- Step 2: detectAnswers(croppedGridMat) ---
    let { detectedAnswersMap, scoresMap } = detectAnswers(croppedGridMat);

    // --- Step 3: compareAnswers(detectedAnswersMap, keys) ---
    let result = compareAnswers(detectedAnswersMap, keys, scoresMap);

    croppedGridMat.release();
    return result;
  } finally {
    fullImageMat.release();
  }
}

/**
 * 1:1 Port of findAndCropAnswerGrid(Mat fullImageMat)
 */
function findAndCropAnswerGrid(fullImageMat) {
  let grayMat = new cv.Mat();
  let binaryMat = new cv.Mat();
  let kernel = new cv.Mat();
  let blurredMat = new cv.Mat();
  let hierarchy = new cv.Mat();
  let contours = new cv.MatVector();

  try {
    // 1. Pra-proses gambar untuk menemukan blok jawaban
    cv.cvtColor(fullImageMat, grayMat, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(grayMat, blurredMat, new cv.Size(11, 11), 0);
    cv.adaptiveThreshold(grayMat, binaryMat, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 51, 15);

    // 2. Operasi morfologi kernel (20, 10), dilate 4 iterasi
    kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(20, 10));
    cv.dilate(binaryMat, binaryMat, kernel, new cv.Point(-1, -1), 4);

    // 3. Cari kontur blob terbesar (mainGridContour)
    cv.findContours(binaryMat, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let maxArea = 0;
    let maxIdx = -1;
    for (let i = 0; i < contours.size(); i++) {
      let cnt = contours.get(i);
      let area = cv.contourArea(cnt);
      if (area > maxArea) {
        maxArea = area;
        maxIdx = i;
      }
    }

    if (maxIdx === -1 || maxArea < 5000) {
      return fullImageMat.roi(new cv.Rect(0, 0, fullImageMat.cols, fullImageMat.rows));
    }

    // 4. Bounding rect dengan padding 5%
    let mainGridContour = contours.get(maxIdx);
    let gridBounds = cv.boundingRect(mainGridContour);
    let padding = Math.floor(gridBounds.height * 0.05);
    let cropX = Math.max(0, gridBounds.x - padding);
    let cropY = Math.max(0, gridBounds.y - padding);
    let cropW = Math.min(fullImageMat.cols - cropX, gridBounds.width + (2 * padding));
    let cropH = Math.min(fullImageMat.rows - cropY, gridBounds.height + (2 * padding));

    let rect = new cv.Rect(cropX, cropY, cropW, cropH);
    return fullImageMat.roi(rect);
  } finally {
    grayMat.release();
    blurredMat.release();
    binaryMat.release();
    kernel.release();
    hierarchy.release();
    contours.release();
  }
}

/**
 * 1:1 Port of detectAnswers(Mat imageMat)
 */
function detectAnswers(imageMat) {
  let detectedAnswersMap = {};
  let scoresMap = {};
  let grayMat = new cv.Mat();
  let blurredMat = new cv.Mat();
  let binaryMat = new cv.Mat();
  let hierarchy = new cv.Mat();
  let contours = new cv.MatVector();

  try {
    // 1. Grayscale & Blur (7, 7) & Adaptive Threshold (11, 2)
    cv.cvtColor(imageMat, grayMat, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(grayMat, blurredMat, new cv.Size(7, 7), 0);
    cv.adaptiveThreshold(blurredMat, binaryMat, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);

    // 2. Cari kontur kandidat kolom (area > 3000, 0.5 < ratio < 2.5)
    cv.findContours(binaryMat, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let candidateBlocks = [];
    for (let i = 0; i < contours.size(); i++) {
      let cnt = contours.get(i);
      let area = cv.contourArea(cnt);
      let boundingRect = cv.boundingRect(cnt);
      let ratio = boundingRect.width / parseFloat(boundingRect.height);

      if (area > 3000 && ratio > 0.5 && ratio < 2.5) {
        candidateBlocks.push(boundingRect);
      }
    }

    // 3. Kelompokkan berdasarkan koordinat Y
    let questionBlocks = [];
    if (candidateBlocks.length >= NUM_COLUMNS) {
      candidateBlocks.sort((a, b) => a.y - b.y);
      let yTolerance = Math.floor(candidateBlocks[0].height * 0.5);
      let yGroups = {};

      for (let block of candidateBlocks) {
        let addedToGroup = false;
        for (let key of Object.keys(yGroups)) {
          if (Math.abs(parseInt(key) - block.y) < yTolerance) {
            yGroups[key].push(block);
            addedToGroup = true;
            break;
          }
        }
        if (!addedToGroup) {
          yGroups[block.y] = [block];
        }
      }

      let largestGroup = Object.values(yGroups).reduce((max, g) => g.length > max.length ? g : max, []);
      if (largestGroup.length >= NUM_COLUMNS) {
        questionBlocks = largestGroup.slice(0, NUM_COLUMNS);
      }
    }

    // Fallback jika blok kontur kurang dari 5
    if (questionBlocks.length < NUM_COLUMNS) {
      questionBlocks = [];
      let colW = Math.floor(imageMat.cols / NUM_COLUMNS);
      for (let c = 0; c < NUM_COLUMNS; c++) {
        questionBlocks.push({ x: c * colW, y: 0, width: colW, height: imageMat.rows });
      }
    }

    // Urutkan 5 blok dari kiri ke kanan (berdasarkan X)
    questionBlocks.sort((a, b) => a.x - b.x);

    // 4. Hitung densitometri setiap opsi jawaban A, B, C, D
    for (let i = 0; i < questionBlocks.length; i++) {
      let block = questionBlocks[i];
      let numColWidth = Math.floor(block.width * 0.15);
      let cellWidth = Math.floor((block.width - numColWidth) / NUM_OPTIONS);
      let cellHeight = Math.floor(block.height / NUM_QUESTIONS_PER_COLUMN);

      for (let j = 0; j < NUM_QUESTIONS_PER_COLUMN; j++) {
        let scores = [];
        for (let k = 0; k < NUM_OPTIONS; k++) {
          let cellX = block.x + numColWidth + (k * cellWidth);
          let cellY = block.y + (j * cellHeight);
          let paddingX = Math.floor(cellWidth * 0.15);
          let paddingY = Math.floor(cellHeight * 0.15);

          let rectW = Math.max(1, cellWidth - (2 * paddingX));
          let rectH = Math.max(1, cellHeight - (2 * paddingY));
          let subX = Math.max(0, Math.min(binaryMat.cols - rectW, cellX + paddingX));
          let subY = Math.max(0, Math.min(binaryMat.rows - rectH, cellY + paddingY));

          let cellRoi = binaryMat.roi(new cv.Rect(subX, subY, rectW, rectH));
          let score = cv.countNonZero(cellRoi);
          scores.push(score);
          cellRoi.release();
        }

        let maxIndex = -1;
        let maxScore = -1;
        for (let s = 0; s < scores.length; s++) {
          if (scores[s] > maxScore) {
            maxScore = scores[s];
            maxIndex = s;
          }
        }

        let questionNumber = i * NUM_QUESTIONS_PER_COLUMN + j + 1;
        scoresMap[questionNumber] = scores;

        if (maxIndex !== -1 && maxScore > 20) {
          detectedAnswersMap[questionNumber] = OPTIONS[maxIndex];
        } else {
          detectedAnswersMap[questionNumber] = "A";
        }
      }
    }

    return { detectedAnswersMap, scoresMap };
  } finally {
    grayMat.release();
    blurredMat.release();
    binaryMat.release();
    hierarchy.release();
    contours.release();
  }
}

/**
 * 1:1 Port of compareAnswers(Map<Integer, String> detectedAnswers, Map<Integer, String> answerKey)
 */
function compareAnswers(detectedAnswersMap, keys, scoresMap) {
  let detectedAnswers = [];
  let correctCount = 0;
  let wrongCount = 0;
  const numQuestions = keys.length;

  for (let i = 1; i <= numQuestions; i++) {
    let userAnswer = detectedAnswersMap[i] || "A";
    let correctAnswer = keys[i - 1] || "A";
    let isCorrect = userAnswer.toUpperCase() === correctAnswer.toUpperCase();

    if (isCorrect) correctCount++;
    else wrongCount++;

    detectedAnswers.push({
      questionNumber: i,
      studentAnswer: userAnswer,
      correctAnswer: correctAnswer,
      isCorrect: isCorrect,
      scores: scoresMap[i] || [0, 0, 0, 0],
    });
  }

  let scorePercentage = Math.round((correctCount / numQuestions) * 100);

  return {
    detectedAnswers,
    totalQuestions: numQuestions,
    correctCount,
    wrongCount,
    score: scorePercentage,
  };
}

/**
 * Fallback Canvas Densitometry Pipeline
 */
function executeCanvasOmrPipeline(imgElement, keys, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgElement, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const gray = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = Math.floor(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
  }

  // Integral Image
  const integral = new Float64Array((width + 1) * (height + 1));
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      rowSum += gray[y * width + x];
      integral[(y + 1) * (width + 1) + (x + 1)] = integral[y * (width + 1) + (x + 1)] + rowSum;
    }
  }

  const binary = new Uint8Array(width * height);
  const S = 25;
  const C = 15;

  for (let y = 0; y < height; y++) {
    const y1 = Math.max(0, y - S);
    const y2 = Math.min(height, y + S + 1);
    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - S);
      const x2 = Math.min(width, x + S + 1);
      const count = (x2 - x1) * (y2 - y1);
      const sum = integral[y2 * (width + 1) + x2] - integral[y1 * (width + 1) + x2] - integral[y2 * (width + 1) + x1] + integral[y1 * (width + 1) + x1];
      const mean = sum / count;
      binary[y * width + x] = (gray[y * width + x] < mean - C) ? 255 : 0;
    }
  }

  const vProj = new Int32Array(width);
  const hProj = new Int32Array(height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (binary[y * width + x] === 255) {
        vProj[x]++;
        hProj[y]++;
      }
    }
  }

  let minX = 0, maxX = width - 1, minY = 0, maxY = height - 1;
  const avgH = (width * height) / height * 0.08;
  const avgV = (width * height) / width * 0.08;

  for (let x = 0; x < width; x++) { if (vProj[x] > avgV) { minX = x; break; } }
  for (let x = width - 1; x >= 0; x--) { if (vProj[x] > avgV) { maxX = x; break; } }
  for (let y = 0; y < height; y++) { if (hProj[y] > avgH) { minY = y; break; } }
  for (let y = height - 1; y >= 0; y--) { if (hProj[y] > avgH) { maxY = y; break; } }

  let tableW = Math.max(100, maxX - minX);
  let tableH = Math.max(100, maxY - minY);
  let colW = tableW / NUM_COLUMNS;
  let rowH = tableH / NUM_QUESTIONS_PER_COLUMN;

  let detectedAnswersMap = {};
  let scoresMap = {};

  for (let col = 0; col < NUM_COLUMNS; col++) {
    for (let row = 0; row < NUM_QUESTIONS_PER_COLUMN; row++) {
      let qNum = (col * NUM_QUESTIONS_PER_COLUMN) + row + 1;
      let numColW = colW * 0.15;
      let optW = (colW - numColW) / NUM_OPTIONS;
      let startX = minX + (col * colW) + numColW;
      let startY = minY + (row * rowH);

      let scores = [];
      for (let opt = 0; opt < NUM_OPTIONS; opt++) {
        let cellX = Math.floor(startX + (opt * optW));
        let cellY = Math.floor(startY + (rowH * 0.15));
        let padX = Math.floor(optW * 0.15);
        let padY = Math.floor(rowH * 0.15);

        let count = 0;
        for (let y = cellY + padY; y < cellY + (rowH * 0.7) - padY; y++) {
          for (let x = cellX + padX; x < cellX + optW - padX; x++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
              if (binary[y * width + x] === 255) count++;
            }
          }
        }
        scores.push(count);
      }

      let maxScore = Math.max(...scores);
      let maxIndex = scores.indexOf(maxScore);
      detectedAnswersMap[qNum] = (maxIndex !== -1 && maxScore > 20) ? OPTIONS[maxIndex] : "A";
      scoresMap[qNum] = scores;
    }
  }

  return compareAnswers(detectedAnswersMap, keys, scoresMap);
}
