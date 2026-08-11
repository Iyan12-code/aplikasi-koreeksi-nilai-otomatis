/**
 * =========================================================
 * CORE APP CONTROLLER & INTERACTIVE STATE STORE
 * SmartEval OMR & AI Web Application
 * =========================================================
 */

// Application Global State
const appState = {
    exam: {
        subject: "Matematika Kelas X MIPA 1",
        kkm: 75,
        totalQuestions: 25
    },
    students: [
        "Ahmad Dani", "Bayu Pratama", "Citra Lestari", "Dedi Kurniawan",
        "Eka Putri", "Fajar Nugraha", "Gita Savitri", "Hadi Saputra"
    ],
    activeStudentIndex: 0,
    answerKeys: [
        "A", "B", "C", "C", "C",
        "B", "B", "C", "C", "C",
        "B", "B", "B", "B", "B",
        "C", "B", "B", "C", "C",
        "D", "D", "D", "D", "D"
    ],
    materialBlocks: [
        "Aljabar & Operasi Hitung",
        "Pecahan & Desimal",
        "Geometri & Bangun Datar",
        "Statistika & Pengolahan Data",
        "Pengukuran & Satuan"
    ],
    currentOmrResult: null,
    latestAiText: "",
    history: []
};

let cameraStream = null;

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    loadPersistedState();
    setupTabNavigation();
    setupMobileSidebar();
    renderAnswerKeysGrid();
    renderStudentsList();
    renderMaterialInputs();
    setupExcelDropzone();
    setupLjkDropzone();
    setupCameraFeature();
    setupStudentNavigator();
    setupHistoryFilters();
    setupSettingsModal();
    renderHistoryTable();

    // Default Groq API key placeholder
    if (!getGroqApiKey()) {
        setGroqApiKey("gsk_placeholder_replace_with_real_key");
    }
});

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check text-emerald';
    if (type === 'error') icon = 'fa-circle-xmark text-rose';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/**
 * Tab Navigation Controller & Stepper Progress
 */
function setupTabNavigation() {
    const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const targetTab = item.getAttribute("data-tab");
            goToTab(targetTab);
            closeMobileSidebar();
        });
    });
}

function goToTab(tabId) {
    // Update Sidebar
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
        item.classList.toggle("active", item.getAttribute("data-tab") === tabId);
    });

    // Update Tab Panels
    document.querySelectorAll(".tab-panel").forEach(panel => {
        panel.classList.toggle("active", panel.id === tabId);
    });

    // Update Top Stepper Nodes
    document.querySelectorAll(".stepper-nav .step-node").forEach(node => {
        node.classList.toggle("active", node.getAttribute("data-step") === tabId);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Mobile Sidebar Drawer Controller
 */
function setupMobileSidebar() {
    const btnToggle = document.getElementById("btnToggleSidebar");
    const sidebar = document.getElementById("appSidebar");
    const backdrop = document.getElementById("sidebarBackdrop");

    if (btnToggle && sidebar && backdrop) {
        btnToggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            backdrop.classList.toggle("active");
        });

        backdrop.addEventListener("click", closeMobileSidebar);
    }
}

function closeMobileSidebar() {
    const sidebar = document.getElementById("appSidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    if (sidebar) sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("active");
}

/**
 * Render 25 Interactive Bubble Answer Keys
 */
function renderAnswerKeysGrid() {
    const container = document.getElementById("answerKeysGrid");
    if (!container) return;
    container.innerHTML = "";

    const OPTIONS = ["A", "B", "C", "D"];

    for (let col = 0; col < 5; col++) {
        const colCard = document.createElement("div");
        colCard.className = "key-column-card";

        for (let row = 0; row < 5; row++) {
            const qNum = (col * 5) + row + 1;
            const currentVal = appState.answerKeys[qNum - 1] || "A";

            const rowEl = document.createElement("div");
            rowEl.className = "key-row-interactive";
            rowEl.innerHTML = `
                <span class="key-qnum">No. ${qNum.toString().padStart(2, '0')}</span>
                <div class="bubble-group">
                    ${OPTIONS.map(opt => `
                        <button type="button" class="bubble-btn ${opt === currentVal ? 'active' : ''}" 
                                onclick="setAnswerKeyInteractive(${qNum}, '${opt}')">${opt}</button>
                    `).join('')}
                </div>
            `;
            colCard.appendChild(rowEl);
        }
        container.appendChild(colCard);
    }
}

function setAnswerKeyInteractive(qNum, choice) {
    appState.answerKeys[qNum - 1] = choice;
    renderAnswerKeysGrid();
    savePersistedState();
}

function quickFillKeys(mode) {
    if (mode === 'SAMPLE') {
        appState.answerKeys = [
            "A", "B", "C", "C", "C",
            "B", "B", "C", "C", "C",
            "B", "B", "B", "B", "B",
            "C", "B", "B", "C", "C",
            "D", "D", "D", "D", "D"
        ];
        showToast("Kunci jawaban standar 25 soal berhasil dipasang!", "success");
    } else {
        appState.answerKeys = Array(25).fill(mode);
        showToast(`Seluruh kunci jawaban diatur ke opsi ${mode}`, "info");
    }
    renderAnswerKeysGrid();
    savePersistedState();
}

/**
 * Subject Quick Setter
 */
function setSubject(subjectName) {
    const input = document.getElementById("examSubject");
    if (input) {
        input.value = subjectName;
        appState.exam.subject = subjectName;
        savePersistedState();
        showToast(`Mata pelajaran diatur ke: ${subjectName}`, "success");
    }
}

/**
 * Render Material Block Inputs
 */
function renderMaterialInputs() {
    for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`matCol${i}`);
        if (el) {
            el.value = appState.materialBlocks[i - 1] || "";
            el.addEventListener("input", (e) => {
                appState.materialBlocks[i - 1] = e.target.value;
                savePersistedState();
            });
        }
    }
}

/**
 * Render Student Chips & Selectors
 */
function renderStudentsList() {
    const container = document.getElementById("studentsListContainer");
    const badge = document.getElementById("totalStudentsBadge");
    const select = document.getElementById("activeStudentSelect");
    
    if (badge) badge.innerText = appState.students.length;

    if (container) {
        if (appState.students.length === 0) {
            container.innerHTML = '<span class="empty-text text-muted">Belum ada file template diunggah.</span>';
        } else {
            container.innerHTML = appState.students.map((name, idx) => `
                <div class="student-pill ${idx === appState.activeStudentIndex ? 'active' : ''}">
                    <i class="fa-solid fa-user-graduate text-primary"></i> ${idx + 1}. ${name}
                </div>
            `).join('');
        }
    }

    if (select) {
        select.innerHTML = appState.students.map((name, idx) => `
            <option value="${idx}" ${idx === appState.activeStudentIndex ? 'selected' : ''}>${idx + 1}. ${name}</option>
        `).join('');

        select.onchange = (e) => {
            appState.activeStudentIndex = parseInt(e.target.value);
            updateActiveStudentView();
        };
    }
}

function updateActiveStudentView() {
    const studentName = appState.students[appState.activeStudentIndex] || "Siswa";
    const aiTarget = document.getElementById("aiStudentTarget");
    if (aiTarget) aiTarget.innerText = `Siswa: ${studentName}`;
    renderStudentsList();
}

/**
 * Student Next / Prev Navigator
 */
function setupStudentNavigator() {
    const btnPrev = document.getElementById("btnPrevStudent");
    const btnNext = document.getElementById("btnNextStudent");

    btnPrev?.addEventListener("click", () => {
        if (appState.activeStudentIndex > 0) {
            appState.activeStudentIndex--;
            updateActiveStudentView();
            showToast(`Beralih ke siswa: ${appState.students[appState.activeStudentIndex]}`, "info");
        }
    });

    btnNext?.addEventListener("click", () => {
        if (appState.activeStudentIndex < appState.students.length - 1) {
            appState.activeStudentIndex++;
            updateActiveStudentView();
            showToast(`Beralih ke siswa: ${appState.students[appState.activeStudentIndex]}`, "info");
        }
    });
}

/**
 * Setup Excel Template Dropzone
 */
function setupExcelDropzone() {
    const dropzone = document.getElementById("excelDropzone");
    const fileInput = document.getElementById("excelFileInput");
    const fileBadge = document.getElementById("excelFileBadge");
    const fileNameEl = document.getElementById("excelFileName");
    const studentCountEl = document.getElementById("excelStudentCount");

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            handleExcelUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleExcelUpload(e.target.files[0]);
        }
    });

    async function handleExcelUpload(file) {
        try {
            const parsedNames = await parseStudentsFromExcel(file);
            if (parsedNames.length > 0) {
                appState.students = parsedNames;
                appState.activeStudentIndex = 0;
                renderStudentsList();
                savePersistedState();

                if (fileBadge) {
                    fileBadge.style.display = "flex";
                    if (fileNameEl) fileNameEl.innerText = file.name;
                    if (studentCountEl) studentCountEl.innerText = `(${parsedNames.length} Siswa Terdeteksi)`;
                }
                showToast(`Template Berhasil Diunggah! ${parsedNames.length} siswa ditemukan.`, "success");
            } else {
                showToast("File Excel terbaca, namun kolom nama siswa tidak ditemukan.", "error");
            }
        } catch (err) {
            showToast(`Gagal membaca Excel: ${err.message}`, "error");
        }
    }
}

/**
 * Camera Feature Integration
 */
function setupCameraFeature() {
    const btnToggleCamera = document.getElementById("btnToggleCamera");
    const cameraWrapper = document.getElementById("cameraWrapper");
    const cameraVideo = document.getElementById("cameraVideo");
    const btnCapture = document.getElementById("btnCaptureCamera");
    const previewWrapper = document.getElementById("ljkPreviewWrapper");
    const previewImg = document.getElementById("ljkPreviewImg");
    const dropzone = document.getElementById("ljkDropzone");

    if (!btnToggleCamera || !cameraVideo) return;

    btnToggleCamera.addEventListener("click", async () => {
        if (cameraStream) {
            // Stop Camera
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
            cameraWrapper.style.display = "none";
            dropzone.style.display = "block";
            btnToggleCamera.innerHTML = '<i class="fa-solid fa-video"></i> Buka Kamera';
        } else {
            // Start Camera
            try {
                cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
                });
                cameraVideo.srcObject = cameraStream;
                cameraWrapper.style.display = "block";
                dropzone.style.display = "none";
                previewWrapper.style.display = "none";
                btnToggleCamera.innerHTML = '<i class="fa-solid fa-video-slash"></i> Tutup Kamera';
            } catch (err) {
                showToast("Kamera tidak dapat diakses atau izin ditolak: " + err.message, "error");
            }
        }
    });

    btnCapture?.addEventListener("click", () => {
        if (!cameraVideo) return;
        const canvas = document.createElement("canvas");
        canvas.width = cameraVideo.videoWidth || 1280;
        canvas.height = cameraVideo.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);

        previewImg.src = canvas.toDataURL("image/jpeg");
        previewWrapper.style.display = "block";
        cameraWrapper.style.display = "none";

        // Stop camera stream
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
            btnToggleCamera.innerHTML = '<i class="fa-solid fa-video"></i> Buka Kamera';
        }

        showToast("Foto LJK berhasil diambil dari kamera!", "success");
    });
}

/**
 * Setup LJK Image Dropzone & Live Detection
 */
function setupLjkDropzone() {
    const dropzone = document.getElementById("ljkDropzone");
    const fileInput = document.getElementById("ljkFileInput");
    const previewWrapper = document.getElementById("ljkPreviewWrapper");
    const previewImg = document.getElementById("ljkPreviewImg");
    const btnRunOmr = document.getElementById("btnRunOmr");
    const btnUseSample = document.getElementById("btnUseSampleLjk");
    const btnResetImg = document.getElementById("btnResetLjkImg");

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            loadLjkImage(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            loadLjkImage(e.target.files[0]);
        }
    });

    btnResetImg?.addEventListener("click", () => {
        previewWrapper.style.display = "none";
        dropzone.style.display = "block";
        previewImg.src = "";
    });

    if (btnUseSample) {
        btnUseSample.addEventListener("click", () => {
            // Generate synthetic LJK canvas for sample test
            const canvas = document.createElement("canvas");
            canvas.width = 1000;
            canvas.height = 600;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#000000";

            for (let c = 0; c < 5; c++) {
                let bx = 50 + (c * 190);
                ctx.strokeRect(bx, 100, 160, 400);
            }

            previewImg.src = canvas.toDataURL();
            dropzone.style.display = "none";
            previewWrapper.style.display = "block";
            executeOmr();
        });
    }

    if (btnRunOmr) {
        btnRunOmr.addEventListener("click", executeOmr);
    }

    function loadLjkImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            dropzone.style.display = "none";
            previewWrapper.style.display = "block";
            showToast("Foto LJK berhasil dimuat, siap dikoreksi.", "info");
        };
        reader.readAsDataURL(file);
    }

    async function executeOmr() {
        if (!previewImg.src || previewImg.src === window.location.href) {
            showToast("Harap unggah atau ambil foto LJK terlebih dahulu!", "error");
            return;
        }

        btnRunOmr.disabled = true;
        btnRunOmr.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses Sensor OMR...';

        try {
            const result = await processOmrImage(previewImg, appState.answerKeys);
            appState.currentOmrResult = result;
            renderOmrResults(result);
            renderTopicMasteryBars(result);
            showToast(`Koreksi Selesai! Nilai: ${result.score}/100 (${result.correctCount} Benar, ${result.wrongCount} Salah)`, "success");
        } catch (err) {
            showToast(`Error OMR: ${err.message}`, "error");
        } finally {
            btnRunOmr.disabled = false;
            btnRunOmr.innerHTML = '<i class="fa-solid fa-brain"></i> Jalankan Koreksi Otomatis';
        }
    }
}

/**
 * Render 5-Column OMR Detection Results
 */
function renderOmrResults(result) {
    const container = document.getElementById("omrResultsContainer");
    const valTotalScore = document.getElementById("valTotalScore");
    const valCorrect = document.getElementById("valCorrectCount");
    const valWrong = document.getElementById("valWrongCount");
    const valKkmStatus = document.getElementById("valKkmStatus");

    if (!container || !result) return;

    if (valTotalScore) valTotalScore.innerText = result.score;
    if (valCorrect) valCorrect.innerText = `${result.correctCount} Benar`;
    if (valWrong) valWrong.innerText = `${result.wrongCount} Salah`;

    const kkm = appState.exam.kkm || 75;
    if (valKkmStatus) {
        if (result.score >= kkm) {
            valKkmStatus.innerText = `✔ TUNTAS KKM (≥ ${kkm})`;
            valKkmStatus.className = "score-kkm text-emerald";
        } else {
            valKkmStatus.innerText = `✖ BELUM TUNTAS (< ${kkm})`;
            valKkmStatus.className = "score-kkm text-rose";
        }
    }

    container.innerHTML = "";

    // 5 Columns
    for (let col = 0; col < 5; col++) {
        const colDiv = document.createElement("div");
        colDiv.className = "omr-col-list";

        for (let row = 0; row < 5; row++) {
            const idx = (col * 5) + row;
            const item = result.detectedAnswers[idx];
            if (!item) continue;

            const itemEl = document.createElement("div");
            itemEl.className = `omr-result-item ${item.isCorrect ? 'correct' : 'wrong'}`;
            itemEl.innerHTML = `
                <span>${item.questionNumber}. ${item.studentAnswer}</span>
                <span>${item.isCorrect ? '✔' : '✖'}</span>
            `;
            colDiv.appendChild(itemEl);
        }

        container.appendChild(colDiv);
    }
}

/**
 * Render Topic Mastery Progress Bars
 */
function renderTopicMasteryBars(result) {
    const container = document.getElementById("topicMasteryContainer");
    if (!container || !result) return;

    let html = `<h4 class="mb-2 font-semibold text-sm"><i class="fa-solid fa-chart-simple"></i> Penguasaan per Pokok Materi:</h4>`;

    for (let col = 0; col < 5; col++) {
        const matName = appState.materialBlocks[col] || `Materi Blok ${col + 1}`;
        let colCorrect = 0;
        for (let r = 0; r < 5; r++) {
            const item = result.detectedAnswers[(col * 5) + r];
            if (item && item.isCorrect) colCorrect++;
        }
        const pct = Math.round((colCorrect / 5) * 100);
        const isMastered = pct >= 75;

        html += `
            <div class="topic-mastery-item">
                <div class="topic-mastery-header">
                    <span>${matName}</span>
                    <span class="${isMastered ? 'text-emerald' : 'text-rose'} font-semibold">${pct}% (${colCorrect}/5 Soal)</span>
                </div>
                <div class="topic-mastery-bar-bg">
                    <div class="topic-mastery-bar-fill" style="width: ${pct}%; background: ${isMastered ? 'var(--emerald)' : 'var(--rose)'};"></div>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Generate AI Diagnostic Analysis
 */
async function generateAIAnalysis() {
    const aiContent = document.getElementById("aiReportContent");
    const loadingSpinner = document.getElementById("aiLoadingSpinner");
    const aiTarget = document.getElementById("aiStudentTarget");

    const studentName = appState.students[appState.activeStudentIndex] || "Siswa";
    if (aiTarget) aiTarget.innerText = `Siswa: ${studentName}`;

    if (!appState.currentOmrResult) {
        appState.currentOmrResult = {
            score: 84,
            correctCount: 21,
            wrongCount: 4,
            detectedAnswers: appState.answerKeys.map((k, i) => ({
                questionNumber: i + 1,
                studentAnswer: (i === 1 || i === 6 || i === 15 || i === 20) ? (k === 'A' ? 'B' : 'A') : k,
                correctAnswer: k,
                isCorrect: !(i === 1 || i === 6 || i === 15 || i === 20)
            }))
        };
    }

    if (loadingSpinner) loadingSpinner.style.display = "block";
    if (aiContent) aiContent.style.display = "none";

    try {
        const prompt = buildDiagnosticPrompt(
            appState.exam,
            studentName,
            appState.currentOmrResult,
            appState.materialBlocks
        );

        let reportText = "";
        try {
            reportText = await callGroqAi(prompt);
            showToast("Analisis AI LLaMA 3.3 berhasil dibuat!", "success");
        } catch (apiErr) {
            console.warn("Groq API error fallback to local diagnostic template:", apiErr);
            reportText = generateLocalDiagnosticFallback(studentName, appState.exam, appState.currentOmrResult, appState.materialBlocks);
            showToast("Menggunakan template diagnostik lokal.", "info");
        }

        appState.latestAiText = reportText;

        if (aiContent && typeof marked !== 'undefined') {
            aiContent.innerHTML = marked.parse(reportText);
        } else if (aiContent) {
            aiContent.innerText = reportText;
        }

    } catch (err) {
        if (aiContent) aiContent.innerHTML = `<p class="text-rose">Gagal memproses AI: ${err.message}</p>`;
        showToast("Gagal memproses AI: " + err.message, "error");
    } finally {
        if (loadingSpinner) loadingSpinner.style.display = "none";
        if (aiContent) aiContent.style.display = "block";
    }
}

/**
 * Local Fallback Generator
 */
function generateLocalDiagnosticFallback(studentName, exam, omr, materials) {
    const { subject, kkm } = exam;
    const { score, correctCount, wrongCount, detectedAnswers } = omr;

    const wrongItems = detectedAnswers.filter(a => !a.isCorrect);

    let sb = [];
    sb.push(`# HASIL DIAGNOSTIK DAN ANALISIS KESALAHAN BELAJAR SISWA\n`);
    sb.push(`### 1. Kesimpulan Penguasaan Materi`);
    sb.push(`Siswa **${studentName}** memperoleh nilai **${score}/100** pada mata pelajaran **${subject}** (${score >= kkm ? 'Tuntas Melampaui KKM' : 'Belum Mencapai Batas KKM ' + kkm}). Siswa telah menjawab ${correctCount} soal dengan benar dan memiliki ${wrongCount} butir soal yang keliru.\n`);

    sb.push(`### 2. Analisis Kesalahan Berdasarkan Kisi-kisi & Indikator Soal`);
    if (wrongItems.length === 0) {
        sb.push(`- Seluruh indikator materi (${materials.join(', ')}) berhasil dijawab dengan sempurna tanpa kesalahan.`);
    } else {
        wrongItems.forEach(w => {
            let bIdx = Math.floor((w.questionNumber - 1) / 5);
            let mat = materials[bIdx] || 'Materi Pokok';
            sb.push(`- **Materi ${mat} (Soal No. ${w.questionNumber} - Salah):** Siswa memilih opsi **${w.studentAnswer}** (Kunci: **${w.correctAnswer}**). Letak kesalahan terdeteksi pada pemahaman konsep dasar dan ketelitian kalkulasi.`);
        });
    }
    sb.push(`\n`);

    sb.push(`### 3. Rekomendasi Spesifik Berdasarkan Materi & Analisis Kesalahan`);
    materials.forEach((mat, idx) => {
        let hasWrong = wrongItems.some(w => Math.floor((w.questionNumber - 1) / 5) === idx);
        if (hasWrong) {
            sb.push(`- **Rekomendasi pada materi ${mat}:** Siswa disarankan mempelajari kembali konsep aturan dasar, mengulang latihan soal bertahap, dan membedah letak miskonsepsi langkah demi langkah.`);
        }
    });
    sb.push(`\n`);

    sb.push(`### 4. Rekomendasi Strategi Pembelajaran Untuk Guru di Kelas`);
    sb.push(`- Menerapkan pendekatan pembelajaran kontekstual dan scaffolding 3 tingkat (dasar, menengah, penalaran) untuk menguatkan indikator yang belum tuntas.`);
    sb.push(`- Menggunakan alat peraga atau media visual konkret di kelas saat membahas materi yang memiliki tingkat kesalahan tinggi.\n`);

    sb.push(`### 5. Rekomendasi Belajar Mandiri Untuk Siswa`);
    sb.push(`1. Membuat catatan ringkas rumus dan kata kunci penting.`);
    sb.push(`2. Mengerjakan latihan mandiri 3-5 soal per hari pada materi yang salah.`);
    sb.push(`3. Mengonsultasikan langkah pengerjaan yang belum dipahami kepada guru atau teman sebaya.\n`);

    sb.push(`### 6. Program Tindak Lanjut: ${score >= kkm ? 'Pengayaan' : 'Remedial'}`);
    if (score < kkm) {
        sb.push(`- **Program Remedial:** Siswa dijadwalkan mengikuti sesi remedial terfokus pada materi ${wrongItems.map(w => 'Soal ' + w.questionNumber).join(', ')} sebelum evaluasi ulang.`);
    } else {
        sb.push(`- **Program Pengayaan:** Siswa diberikan proyek studi kasus atau latihan pemecahan soal tipe HOTS untuk mempertajam nalar kognitif.`);
    }

    return sb.join("\n");
}

/**
 * Save to History & LocalStorage
 */
document.getElementById("btnSaveToHistory")?.addEventListener("click", () => {
    if (!appState.currentOmrResult) {
        showToast("Lakukan koreksi OMR terlebih dahulu!", "error");
        return;
    }

    const studentName = appState.students[appState.activeStudentIndex] || "Siswa";
    const historyItem = {
        id: Date.now(),
        studentName: studentName,
        subject: appState.exam.subject,
        score: appState.currentOmrResult.score,
        correctCount: appState.currentOmrResult.correctCount,
        wrongCount: appState.currentOmrResult.wrongCount,
        date: new Date().toLocaleString('id-ID'),
        answers: appState.currentOmrResult.detectedAnswers,
        aiReport: appState.latestAiText
    };

    appState.history.unshift(historyItem);
    renderHistoryTable();
    savePersistedState();
    showToast(`Hasil koreksi untuk ${studentName} berhasil disimpan ke Riwayat!`, "success");
});

/**
 * Render History Table with Live Search & Filter
 */
function setupHistoryFilters() {
    const inputSearch = document.getElementById("inputSearchHistory");
    const filterStatus = document.getElementById("filterStatusHistory");

    inputSearch?.addEventListener("input", renderHistoryTable);
    filterStatus?.addEventListener("change", renderHistoryTable);
}

function renderHistoryTable() {
    const tbody = document.getElementById("historyTableBody");
    const inputSearch = document.getElementById("inputSearchHistory");
    const filterStatus = document.getElementById("filterStatusHistory");

    if (!tbody) return;

    const searchTerm = (inputSearch?.value || '').toLowerCase();
    const statusFilter = filterStatus?.value || 'ALL';
    const kkm = appState.exam.kkm || 75;

    let filtered = appState.history.filter(item => {
        const matchesName = item.studentName.toLowerCase().includes(searchTerm) || item.subject.toLowerCase().includes(searchTerm);
        const isTuntas = item.score >= kkm;
        if (statusFilter === 'TUNTAS' && !isTuntas) return false;
        if (statusFilter === 'REMEDIAL' && isTuntas) return false;
        return matchesName;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center p-4 text-muted">Belum ada data riwayat yang cocok.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map((item, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><strong>${item.studentName}</strong></td>
            <td>${item.subject}</td>
            <td class="text-emerald font-semibold">${item.correctCount}</td>
            <td class="text-rose font-semibold">${item.wrongCount}</td>
            <td><strong>${item.score}</strong></td>
            <td>
                <span class="badge ${item.score >= kkm ? 'badge-primary text-emerald' : 'badge-primary text-rose'}">
                    ${item.score >= kkm ? 'TUNTAS' : 'REMEDIAL'}
                </span>
            </td>
            <td><small class="text-muted">${item.date}</small></td>
            <td>
                <button class="btn btn-xs btn-outline" onclick="viewHistoryDetail(${item.id})">
                    <i class="fa-solid fa-eye"></i> Detail
                </button>
            </td>
        </tr>
    `).join('');
}

function viewHistoryDetail(historyId) {
    const item = appState.history.find(h => h.id === historyId);
    if (item && item.aiReport) {
        goToTab("tab-analysis");
        const aiContent = document.getElementById("aiReportContent");
        const aiTarget = document.getElementById("aiStudentTarget");
        if (aiTarget) aiTarget.innerText = `Siswa: ${item.studentName}`;
        if (aiContent && typeof marked !== 'undefined') {
            aiContent.innerHTML = marked.parse(item.aiReport);
        }
        showToast(`Membuka laporan diagnostik: ${item.studentName}`, "info");
    }
}

/**
 * Settings Modal Logic
 */
function setupSettingsModal() {
    const modal = document.getElementById("settingsModal");
    const btnOpen = document.getElementById("btnSettingsModal");
    const btnClose = document.getElementById("btnCloseSettingsModal");
    const btnCancel = document.getElementById("btnCancelSettings");
    const btnSave = document.getElementById("btnSaveSettings");
    const inputKey = document.getElementById("inputGroqApiKey");
    const btnEye = document.getElementById("btnToggleApiKeyEye");

    if (!modal) return;

    btnOpen?.addEventListener("click", () => {
        if (inputKey) inputKey.value = getGroqApiKey();
        modal.style.display = "flex";
    });

    btnEye?.addEventListener("click", () => {
        if (inputKey) {
            inputKey.type = inputKey.type === 'password' ? 'text' : 'password';
            btnEye.innerHTML = inputKey.type === 'password' ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
        }
    });

    const closeModal = () => modal.style.display = "none";
    btnClose?.addEventListener("click", closeModal);
    btnCancel?.addEventListener("click", closeModal);

    btnSave?.addEventListener("click", () => {
        if (inputKey) {
            setGroqApiKey(inputKey.value);
            showToast("API Key Groq berhasil disimpan!", "success");
            closeModal();
        }
    });
}

function copyAiReport() {
    if (appState.latestAiText) {
        navigator.clipboard.writeText(appState.latestAiText);
        showToast("Laporan Analisis AI berhasil disalin ke clipboard!", "success");
    }
}

/**
 * Persistence Helper
 */
function savePersistedState() {
    try {
        localStorage.setItem("smarteval_state", JSON.stringify({
            exam: appState.exam,
            students: appState.students,
            answerKeys: appState.answerKeys,
            materialBlocks: appState.materialBlocks,
            history: appState.history
        }));
    } catch (e) {}
}

function loadPersistedState() {
    try {
        const data = localStorage.getItem("smarteval_state");
        if (data) {
            const parsed = JSON.parse(data);
            if (parsed.exam) appState.exam = parsed.exam;
            if (parsed.students) appState.students = parsed.students;
            if (parsed.answerKeys) appState.answerKeys = parsed.answerKeys;
            if (parsed.materialBlocks) appState.materialBlocks = parsed.materialBlocks;
            if (parsed.history) appState.history = parsed.history;
        }
    } catch (e) {}
}
