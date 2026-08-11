/**
 * =========================================================
 * COMPUTER VISION OMR ENGINE (Calibrated 25 Questions)
 * Ported from test_detect_25.py
 * =========================================================
 */

let isOpenCvReady = false;

function onOpenCvReady() {
    isOpenCvReady = true;
    const statusEl = document.getElementById('opencvStatus');
    if (statusEl) {
        statusEl.innerHTML = '<span class="status-dot ready"></span><span class="status-text">Engine OMR Siap (OpenCV.js)</span>';
    }
    console.log("OpenCV.js initialized successfully.");
}

/**
 * Main Entry Point for OMR Processing
 */
async function processOmrImage(imgElement, answerKeys) {
    const NUM_QUESTIONS = 25;
    const keys = (answerKeys && answerKeys.length === 25) ? answerKeys : [
        "A", "B", "C", "C", "C",
        "B", "B", "C", "C", "C",
        "B", "B", "B", "B", "B",
        "C", "B", "B", "C", "C",
        "D", "D", "D", "D", "D"
    ];

    // Try Python Server API first if running locally
    try {
        const response = await fetch('/api/scan_omr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: imgElement.src,
                keys: keys
            })
        });

        if (response.ok) {
            const apiResult = await response.json();
            if (apiResult && apiResult.detectedAnswers) {
                console.log("OMR Processed via Python Server API (cv2 native):", apiResult);
                return apiResult;
            }
        }
    } catch (apiErr) {
        console.log("Python backend not responding, running Client-Side Engine...");
    }

    // Client-Side Execution (OpenCV.js or Calibrated Canvas)
    if (isOpenCvReady && typeof cv !== 'undefined') {
        try {
            return runCalibratedOpenCvDetection(imgElement, keys);
        } catch (cvErr) {
            console.warn("OpenCV.js execution error, falling back to calibrated Canvas:", cvErr);
        }
    }

    return runCalibratedCanvasDetection(imgElement, keys);
}

/**
 * Calibrated OpenCV.js Detection (Matches test_detect_25.py)
 */
function runCalibratedOpenCvDetection(imgElement, keys) {
    const OPTIONS = ["A", "B", "C", "D"];
    const NUM_OPTIONS = 4;
    const NUM_QUESTIONS_PER_COLUMN = 5;

    let src = cv.imread(imgElement);
    let gray = new cv.Mat();
    let blurred = new cv.Mat();
    let binary = new cv.Mat();

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blurred, new cv.Size(11, 11), 0);
    cv.adaptiveThreshold(gray, binary, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 51, 15);

    // Morphological Dilate to find main answer box
    let kernel = cv.Mat.ones(20, 10, cv.CV_8U);
    let dilated = new cv.Mat();
    cv.dilate(binary, dilated, kernel, new cv.Point(-1, -1), 4);

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(dilated, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let mainRect = null;
    let maxArea = 0;
    for (let i = 0; i < contours.size(); i++) {
        let cnt = contours.get(i);
        let area = cv.contourArea(cnt);
        if (area > maxArea) {
            maxArea = area;
            mainRect = cv.boundingRect(cnt);
        }
    }

    if (!mainRect || maxArea < 10000) {
        mainRect = new cv.Rect(0, 0, src.cols, src.rows);
    }

    // Pad crop area
    let padding = Math.floor(mainRect.height * 0.05);
    let cropX = Math.max(0, mainRect.x - padding);
    let cropY = Math.max(0, mainRect.y - padding);
    let cropW = Math.min(src.cols - cropX, mainRect.width + 2 * padding);
    let cropH = Math.min(src.rows - cropY, mainRect.height + 2 * padding);

    let cropRect = new cv.Rect(cropX, cropY, cropW, cropH);
    let cropped = src.roi(cropRect);

    // Inner crop processing
    let cropGray = new cv.Mat();
    let cropBlurred = new cv.Mat();
    let cropBinary = new cv.Mat();

    cv.cvtColor(cropped, cropGray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(cropGray, cropBlurred, new cv.Size(7, 7), 0);
    cv.adaptiveThreshold(cropBlurred, cropBinary, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);

    let cropContours = new cv.MatVector();
    let cropHierarchy = new cv.Mat();
    cv.findContours(cropBinary, cropContours, cropHierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let candidateBlocks = [];
    for (let i = 0; i < cropContours.size(); i++) {
        let cnt = cropContours.get(i);
        let area = cv.contourArea(cnt);
        let r = cv.boundingRect(cnt);
        let ratio = r.width / parseFloat(r.height);
        if (area > 3000 && ratio > 0.5 && ratio < 2.5) {
            candidateBlocks.push(r);
        }
    }

    // Group columns by Y-alignment
    let questionBlocks = [];
    if (candidateBlocks.length >= 5) {
        candidateBlocks.sort((a, b) => a.y - b.y);
        let yTolerance = Math.floor(candidateBlocks[0].height * 0.5);
        let yGroups = {};

        candidateBlocks.forEach(b => {
            let foundKey = Object.keys(yGroups).find(k => Math.abs(parseInt(k) - b.y) < yTolerance);
            if (foundKey) {
                yGroups[foundKey].push(b);
            } else {
                yGroups[b.y] = [b];
            }
        });

        let largestGroup = Object.values(yGroups).reduce((max, g) => g.length > max.length ? g : max, []);
        largestGroup.sort((a, b) => a.x - b.x);
        questionBlocks = largestGroup.slice(0, 5);
    }

    // Fallback if contour grouping is less than 5
    if (questionBlocks.length < 5) {
        questionBlocks = [];
        let colW = Math.floor(cropW / 5);
        for (let c = 0; c < 5; c++) {
            questionBlocks.push(new cv.Rect(c * colW, 0, colW, cropH));
        }
    }

    let detectedAnswers = [];
    let correctCount = 0;
    let wrongCount = 0;

    for (let colIdx = 0; colIdx < 5; colIdx++) {
        let block = questionBlocks[colIdx];
        let numColW = Math.floor(block.width * 0.15);
        let cellW = Math.floor((block.width - numColW) / NUM_OPTIONS);
        let cellH = Math.floor(block.height / NUM_QUESTIONS_PER_COLUMN);

        for (let rowIdx = 0; rowIdx < NUM_QUESTIONS_PER_COLUMN; rowIdx++) {
            let qNum = (colIdx * NUM_QUESTIONS_PER_COLUMN) + rowIdx + 1;
            let scores = [];

            for (let optIdx = 0; optIdx < NUM_OPTIONS; optIdx++) {
                let cellX = block.x + numColW + (optIdx * cellW);
                let cellY = block.y + (rowIdx * cellH);
                let padX = Math.floor(cellW * 0.15);
                let padY = Math.floor(cellH * 0.15);

                let subX = Math.max(0, Math.min(cropBinary.cols - 1, cellX + padX));
                let subY = Math.max(0, Math.min(cropBinary.rows - 1, cellY + padY));
                let subW = Math.max(1, Math.min(cropBinary.cols - subX, cellW - 2 * padX));
                let subH = Math.max(1, Math.min(cropBinary.rows - subY, cellH - 2 * padY));

                let roi = cropBinary.roi(new cv.Rect(subX, subY, subW, subH));
                let score = cv.countNonZero(roi);
                scores.push(score);
                roi.release();
            }

            let maxScore = Math.max(...scores);
            let maxIndex = scores.indexOf(maxScore);
            let detectedLetter = maxScore > 20 ? OPTIONS[maxIndex] : "A";

            let keyLetter = keys[qNum - 1] || "A";
            let isCorrect = (detectedLetter.toUpperCase() === keyLetter.toUpperCase());

            if (isCorrect) correctCount++; else wrongCount++;

            detectedAnswers.push({
                questionNumber: qNum,
                studentAnswer: detectedLetter,
                correctAnswer: keyLetter,
                isCorrect: isCorrect,
                scores: scores
            });
        }
    }

    // Clean up Mats
    src.release(); gray.release(); blurred.release(); binary.release(); kernel.release();
    dilated.release(); contours.release(); hierarchy.release(); cropped.release();
    cropGray.release(); cropBlurred.release(); cropBinary.release();
    cropContours.release(); cropHierarchy.release();

    let scorePercentage = Math.round((correctCount / 25) * 100);

    return {
        detectedAnswers: detectedAnswers,
        totalQuestions: 25,
        correctCount: correctCount,
        wrongCount: wrongCount,
        score: scorePercentage
    };
}

/**
 * Calibrated HTML5 Canvas Engine
 */
function runCalibratedCanvasDetection(imgElement, keys) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgElement.naturalWidth || imgElement.width || 1000;
    canvas.height = imgElement.naturalHeight || imgElement.height || 600;

    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Otsu-like binary thresholding
    const binary = new Uint8Array(canvas.width * canvas.height);
    for (let i = 0; i < data.length; i += 4) {
        let gray = (data[i] * 0.299) + (data[i + 1] * 0.587) + (data[i + 2] * 0.114);
        binary[i / 4] = gray < 130 ? 255 : 0;
    }

    const OPTIONS = ["A", "B", "C", "D"];
    const NUM_COLUMNS = 5;
    const NUM_QUESTIONS_PER_COL = 5;

    // 5 Columns
    const colW = canvas.width / NUM_COLUMNS;
    const rowH = canvas.height / NUM_QUESTIONS_PER_COL;

    let detectedAnswers = [];
    let correctCount = 0;
    let wrongCount = 0;

    for (let col = 0; col < NUM_COLUMNS; col++) {
        for (let row = 0; row < NUM_QUESTIONS_PER_COL; row++) {
            let qNum = (col * NUM_QUESTIONS_PER_COL) + row + 1;
            let scores = [];

            let numColW = colW * 0.15;
            let optW = (colW - numColW) / 4;
            let startX = (col * colW) + numColW;
            let startY = row * rowH;

            for (let opt = 0; opt < 4; opt++) {
                let cellX = Math.floor(startX + (opt * optW));
                let cellY = Math.floor(startY + (rowH * 0.2));
                let padX = Math.floor(optW * 0.18);
                let padY = Math.floor(rowH * 0.18);

                let count = 0;
                for (let y = cellY + padY; y < cellY + (rowH * 0.7) - padY; y++) {
                    for (let x = cellX + padX; x < cellX + optW - padX; x++) {
                        let idx = (y * canvas.width) + x;
                        if (binary[idx] === 255) count++;
                    }
                }
                scores.push(count);
            }

            let maxScore = Math.max(...scores);
            let maxIndex = scores.indexOf(maxScore);
            let detectedLetter = maxScore > 15 ? OPTIONS[maxIndex] : "A";

            let keyLetter = keys[qNum - 1] || "A";
            let isCorrect = (detectedLetter.toUpperCase() === keyLetter.toUpperCase());

            if (isCorrect) correctCount++; else wrongCount++;

            detectedAnswers.push({
                questionNumber: qNum,
                studentAnswer: detectedLetter,
                correctAnswer: keyLetter,
                isCorrect: isCorrect,
                scores: scores
            });
        }
    }

    let scorePercentage = Math.round((correctCount / 25) * 100);

    return {
        detectedAnswers: detectedAnswers,
        totalQuestions: 25,
        correctCount: correctCount,
        wrongCount: wrongCount,
        score: scorePercentage
    };
}
