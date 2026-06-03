# Hệ thống tự động đọc PHIẾU CÂN → Google Sheet (NM Gạo Thạnh Hương)

Workflow n8n tự động đọc ảnh phiếu cân (chụp & upload qua Google Form vào Drive),
dùng **Claude Vision (Anthropic)** trích xuất thông tin — kể cả chữ viết tay — rồi
ghi tổng hợp vào **Google Sheet**. Phiếu nào AI không chắc chắn (hoặc số cân không
khớp logic) sẽ được **đánh dấu "Cần kiểm tra = CÓ"** để người duyệt xác nhận.

File workflow: `phieu-can-ocr-thanh-huong.json`

---

## 1. Luồng hoạt động

```
[Google Form] nhân viên chụp phiếu cân → ảnh lưu vào thư mục Drive
        │
        ▼
[1] Drive Trigger  – phát hiện ảnh mới trong thư mục "PHIẾU CÂN (File responses)"
[2] Filter         – chỉ xử lý file ảnh (bỏ qua file khác)
[3] Google Drive   – tải ảnh về (binary)
[4] Code           – chuyển ảnh sang base64 + dựng prompt tiếng Việt
[5] HTTP → Claude  – Claude Vision đọc ảnh, trả JSON các trường
[6] Code           – tách trường + KIỂM TRA: |xe vào − xe ra| ≈ TL hàng?
                     → tự gắn cờ "Cần kiểm tra" nếu lệch hoặc AI không chắc
[7] Google Sheets  – ghi 1 dòng/phiếu vào sheet tổng hợp
```

## 2. Các trường được trích xuất (cột trong Google Sheet)

Tạo 1 sheet (tab) tên **`PHIEU_CAN`** với hàng tiêu đề (hàng 1) gồm **đúng** các cột sau:

| Cột | Ý nghĩa |
|-----|---------|
| Thời gian xử lý | Thời điểm hệ thống đọc phiếu |
| Tên file | Tên ảnh trên Drive |
| Link ảnh | Link mở ảnh gốc để đối chiếu |
| Ngày phiếu | Ngày trên phiếu |
| Số phiếu | Số phiếu / chứng từ |
| Người bán / Khách hàng | Nhà cung cấp / người bán / khách hàng |
| Loại hàng / lúa | Loại lúa hoặc loại hàng (lúa tươi, OM5451, cám, trấu...) |
| Số xe | Biển số xe |
| TL xe vào (kg) | Trọng lượng xe có hàng |
| TL xe ra (kg) | Trọng lượng xe không |
| TL hàng (kg) | Trọng lượng hàng (tịnh) |
| Độ ẩm (%) | Độ ẩm nếu có |
| Kiểu cân | NHẬP / XUẤT |
| Ghi chú chất lượng | Ghi chú tạp chất, sâu mọt, chất lượng... |
| Người cân | Tên người cân |
| Độ tin cậy | cao / trung bình / thấp (do AI tự đánh giá) |
| **Cần kiểm tra** | **CÓ / Không** — lọc cột này để duyệt thủ công |
| Lý do kiểm tra | Vì sao cần kiểm tra (lệch cân, chữ mờ...) |

> Mẹo: tô màu / lọc các dòng **Cần kiểm tra = CÓ** để người phụ trách xác nhận trước
> khi đưa vào sổ chính thức.

## 3. Cách cài đặt (import vào n8n)

### Bước 1 — Import workflow
1. Mở n8n → góc phải trên **⋯ → Import from File**.
2. Chọn file `phieu-can-ocr-thanh-huong.json`.

### Bước 2 — Tạo & gắn credential

**a) Google (Drive + Sheets)** — node "Drive: ảnh phiếu mới", "Tải ảnh phiếu", "Ghi vào Google Sheet"
- Tạo credential **Google API** (OAuth2 hoặc Service Account) có quyền Drive + Sheets.
- Nếu dùng Service Account: nhớ **chia sẻ** thư mục Drive và Google Sheet cho email service account.

**b) Anthropic (Claude)** — node "Claude đọc ảnh (Vision)"
- Tạo credential kiểu **Header Auth**:
  - **Name:** `x-api-key`
  - **Value:** API key Anthropic của bạn (lấy ở https://console.anthropic.com).
- Gắn credential này vào node HTTP Request.

### Bước 3 — Trỏ đúng thư mục & Sheet
- Node **"Drive: ảnh phiếu mới"**: đã trỏ sẵn thư mục
  `PHIẾU CÂN (File responses)` (ID `1r7ltl3SUJz-...`). Đổi nếu bạn dùng thư mục khác.
- Node **"Ghi vào Google Sheet"**: thay `REPLACE_SHEET_ID` bằng ID Google Sheet của bạn,
  và đảm bảo tên tab là `PHIEU_CAN` (hoặc đổi cho khớp).

### Bước 4 — Chạy thử
1. Bấm **Execute Workflow** rồi upload 1 ảnh phiếu mới vào thư mục để test;
   hoặc dùng **"Listen for event"** trên node trigger.
2. Kiểm tra dòng mới xuất hiện trong Google Sheet.
3. Khi ổn định, bật **Active** để chạy tự động (kiểm tra mỗi phút).

## 4. Lưu ý độ chính xác (đã kiểm chứng trên phiếu thật)

- **Chữ in / số máy in** (đặc biệt **trọng lượng**): chính xác rất cao.
- **Chữ viết tay** (ô tài xế, ghi chú tay, chữ ký): dễ sai → các phiếu này thường bị
  gắn cờ **Cần kiểm tra**. Đây là cơ chế an toàn, **không** ghi thẳng số sai vào sổ.
- Bước "kiểm tra số cân" tự động đối chiếu `|TL xe vào − TL xe ra| ≈ TL hàng`
  (sai số cho phép 20 kg hoặc 1%). Lệch quá → gắn cờ ngay, kể cả khi AI đọc tự tin.

## 5. Tuỳ chỉnh thêm (khi cần)

- **Đổi mô hình Claude**: sửa `model` trong node "Chuẩn bị yêu cầu Claude"
  (vd `claude-opus-4-8` để chính xác hơn, hoặc `claude-haiku-4-5` để rẻ/nhanh hơn).
- **Cảnh báo khi cần kiểm tra**: thêm node Gmail/Zalo/Telegram sau node Code để gửi
  thông báo khi `Cần kiểm tra = CÓ`.
- **Tách 2 loại phiếu** (thu mua lúa vào / bán cám–trấu ra): có thể thêm node IF dựa
  trên cột "Kiểu cân" để ghi sang 2 sheet khác nhau.
