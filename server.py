import http.server
import socketserver
import json
import base64
import os
import cv2
import numpy as np

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def scan_omr_image(image_base64, keys, total_questions=25):
    """
    1:1 Pure Port of Android Java OMRProcessor.java
    Melokalisasi grid tabel LJK dan mendeteksi jawaban via Pixel Densitometry
    """
    try:
        # Strip header
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]

        image_data = base64.b64decode(image_base64)
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return None

        # 1. Pra-proses gambar untuk menemukan blok jawaban (findAndCropAnswerGrid)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (11, 11), 0)
        binary = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 51, 15)

        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (20, 10))
        dilated = cv2.dilate(binary, kernel, iterations=4)

        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return None

        main_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(main_contour)
        padding = int(h * 0.05)
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(img.shape[1] - x, w + 2 * padding)
        h = min(img.shape[0] - y, h + 2 * padding)

        cropped = img[y:y+h, x:x+w]

        # 2. Deteksi blok kolom jawaban (detectAnswers)
        crop_gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)
        crop_blurred = cv2.GaussianBlur(crop_gray, (7, 7), 0)
        crop_binary = cv2.adaptiveThreshold(crop_blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)

        crop_contours, _ = cv2.findContours(crop_binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        candidate_blocks = []
        for c in crop_contours:
            area = cv2.contourArea(c)
            bx, by, bw, bh = cv2.boundingRect(c)
            ratio = bw / float(bh)
            if area > 3000 and 0.5 < ratio < 2.5:
                candidate_blocks.append((bx, by, bw, bh))

        if len(candidate_blocks) >= 5:
            candidate_blocks.sort(key=lambda r: r[1])
            y_tolerance = int(candidate_blocks[0][3] * 0.5)
            y_groups = {}
            for b in candidate_blocks:
                added = False
                for k in y_groups:
                    if abs(k - b[1]) < y_tolerance:
                        y_groups[k].append(b)
                        added = True
                        break
                if not added:
                    y_groups[b[1]] = [b]
            question_blocks = max(y_groups.values(), key=len)
            question_blocks.sort(key=lambda r: r[0])
        else:
            col_w = cropped.shape[1] // 5
            question_blocks = [(c * col_w, 0, col_w, cropped.shape[0]) for c in range(5)]

        # 3. Densitometri piksel opsi A, B, C, D (1:1 persis mobile OMRProcessor.java)
        OPTIONS = ["A", "B", "C", "D"]
        NUM_OPTIONS = 4
        NUM_QUESTIONS_PER_COLUMN = 5

        detected_answers = []
        correct_count = 0
        wrong_count = 0
        num_q = int(total_questions) if total_questions else len(keys)

        for i, block in enumerate(question_blocks[:5]):
            bx, by, bw, bh = block
            num_col_w = int(bw * 0.15)
            cell_w = (bw - num_col_w) // NUM_OPTIONS
            cell_h = bh // NUM_QUESTIONS_PER_COLUMN

            for j in range(NUM_QUESTIONS_PER_COLUMN):
                q_num = i * NUM_QUESTIONS_PER_COLUMN + j + 1
                if q_num > num_q:
                    continue

                scores = []
                for k in range(NUM_OPTIONS):
                    cell_x = bx + num_col_w + (k * cell_w)
                    cell_y = by + (j * cell_h)
                    pad_x = int(cell_w * 0.15)
                    pad_y = int(cell_h * 0.15)

                    roi = crop_binary[cell_y+pad_y : cell_y+cell_h-pad_y, cell_x+pad_x : cell_x+cell_w-pad_x]
                    score = int(cv2.countNonZero(roi)) if roi.size > 0 else 0
                    scores.append(score)

                max_score = max(scores)
                max_idx = scores.index(max_score)
                ans = OPTIONS[max_idx] if max_score > 20 else "A"

                key_ans = keys[q_num - 1] if q_num - 1 < len(keys) else "A"
                is_correct = (ans.upper() == key_ans.upper())

                if is_correct:
                    correct_count += 1
                else:
                    wrong_count += 1

                detected_answers.append({
                    "questionNumber": q_num,
                    "studentAnswer": ans,
                    "correctAnswer": key_ans,
                    "isCorrect": is_correct,
                    "scores": scores
                })

        score_pct = int(round((correct_count / float(num_q)) * 100))

        return {
            "detectedAnswers": detected_answers,
            "totalQuestions": num_q,
            "correctCount": correct_count,
            "wrongCount": wrong_count,
            "score": score_pct
        }
    except Exception as e:
        print("Error scan_omr:", e)
        return None


class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/scan_omr':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                img_b64 = data.get('image', '')
                keys = data.get('keys', [])
                total_q = data.get('totalQuestions', len(keys) or 25)

                result = scan_omr_image(img_b64, keys, total_q)

                if result:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps(result).encode('utf-8'))
                else:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Failed to detect OMR"}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()


if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
            print(f"============================================================")
            print(f"SMARTEVAL OMR BACKEND SERVER (OPENCV NATIVE)")
            print(f"Running on: http://localhost:{PORT}")
            print(f"Endpoints : POST /api/scan_omr (1:1 Android OMR Logic)")
            print(f"============================================================")
            httpd.serve_forever()
    except OSError as e:
        if e.winerror == 10048 or "Address already in use" in str(e):
            print(f"[INFO] Server port {PORT} sudah berjalan aktif di latar belakang.")
        else:
            raise e
