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

---

# Workflow #2 — Nối phiếu cân sang SỔ KẾ TOÁN (Nhập kho + Công nợ phải trả)

File: `phieu-can-to-ketoan.json`

Tự động lấy các dòng **mua lúa** trong `PHIEU_CAN`, tra đơn giá, rồi ghi sang
**`SO_NHAP_KHO`** (dữ liệu cho Phiếu nhập kho F08) và **`SO_CONG_NO`** (công nợ
**phải trả** nhà cung cấp), đồng thời đánh dấu lại dòng phiếu cân là *đã ghi sổ*
để **không bị ghi trùng**.

> ⚠️ **Nguyên tắc thiết kế:** KHÔNG ghi thẳng vào biểu mẫu in F08/F09 (có ô gộp,
> số dòng cố định, công thức TỔNG, ô chữ ký → sẽ vỡ layout). Thay vào đó ghi vào
> các **sổ dữ liệu cộng dồn** (`SO_NHAP_KHO`, `SO_CONG_NO`); khi cần in phiếu F08
> thì lọc/lấy dữ liệu từ sổ này.

## Luồng

```
[Theo lịch 10 phút]
   → Đọc BANG_GIA (bảng giá theo loại lúa)
   → Đọc PHIEU_CAN
   → Code: bỏ dòng đã ghi sổ; chỉ giữ phiếu MUA LÚA (loại hàng = lúa/thóc...,
            không phải cám/trấu/gạo); tra đơn giá → tính thành tiền;
            sinh "Số phiếu NK"; tính hạn thanh toán (mặc định +30 ngày)
   → ghi song song:
        ├─ SO_NHAP_KHO   (1 dòng/phiếu nhập)
        ├─ SO_CONG_NO    (1 dòng công nợ phải trả NCC)
        └─ PHIEU_CAN     (đánh dấu "Đã ghi sổ KT = CÓ" + đơn giá/thành tiền/số NK)
```

## Cần chuẩn bị (tạo thêm các tab)

**1) Thêm 4 cột vào tab `PHIEU_CAN`** (sau các cột cũ):
`Đơn giá (đ/kg)` · `Thành tiền (đồng)` · `Số phiếu NK` · `Đã ghi sổ KT`

**2) Tab `BANG_GIA`** (bạn cập nhật giá khi thị trường đổi):
`Loại hàng / lúa` · `Đơn giá (đ/kg)` · `Đơn vị` · `Cập nhật ngày` · `Ghi chú`
> Tra giá theo *gần đúng* tên loại lúa (không phân biệt hoa thường/dấu). Loại nào
> chưa có giá → để trống thành tiền và gắn cờ **"Cần nhập đơn giá"** trong Ghi chú.

**3) Tab `SO_NHAP_KHO`** (header hàng 1):
`Ngày nhập` · `Số phiếu NK` · `Loại nhập` · `Nhà cung cấp` · `Số chứng từ gốc` ·
`Người giao hàng` · `Tên hàng / lúa` · `ĐVT` · `SL thực nhập` · `Đơn giá (đồng)` ·
`Thành tiền (đồng)` · `KCS / Chất lượng` · `Cần kiểm tra` · `Ghi chú` · `Link phiếu cân`

**4) Tab `SO_CONG_NO`** (công nợ phải trả – header hàng 1):
`Ngày` · `Loại công nợ` · `Số phiếu NK` · `Nhà cung cấp / KH` · `Diễn giải` ·
`Giá trị (đồng)` · `Đã trả/thu (đồng)` · `Còn nợ (đồng)` · `Hạn thanh toán` ·
`Trạng thái` · `Link phiếu cân`

## Cài đặt
1. Import `phieu-can-to-ketoan.json` vào n8n.
2. Gắn credential Google (dùng lại của workflow #1).
3. Thay placeholder:
   - `REPLACE_PHIEUCAN_SHEET_ID` → ID Google Sheet chứa `PHIEU_CAN`
   - `REPLACE_KETOAN_SHEET_ID` → ID file kế toán chứa `BANG_GIA`, `SO_NHAP_KHO`, `SO_CONG_NO`
     (có thể là **cùng 1 file** với PHIEU_CAN — khi đó điền cùng ID).
4. Execute thử → kiểm tra dữ liệu sang 2 sổ và cột "Đã ghi sổ KT" = CÓ.
5. Bật **Active** để chạy tự động mỗi 10 phút.

## Quy ước nghiệp vụ đã cài
- **Chỉ xử lý MUA LÚA** (loại hàng là lúa/thóc/OM.../ST...). Phiếu bán cám/trấu/gạo
  sẽ bị **bỏ qua** (ngoài phạm vi nhập kho).
- **Công nợ phải TRẢ**: mua lúa → công ty nợ NCC. `Còn nợ = Thành tiền`, `Đã trả = 0`,
  trạng thái `Chưa trả`. Khi chi tiền, kế toán cập nhật cột "Đã trả".
- **Chuyển tất cả phiếu**, kể cả phiếu *Cần kiểm tra* — nhưng cột `Cần kiểm tra`
  và ghi chú được mang sang sổ để kế toán biết dòng nào cần soát lại.
- **Chống ghi trùng**: dựa vào cột `Đã ghi sổ KT` trong PHIEU_CAN (đối chiếu theo
  `Link ảnh`). Dòng đã = CÓ sẽ không xử lý lại.
- **Hạn thanh toán** mặc định = ngày phiếu + 30 ngày (đổi biến `DUE_DAYS` trong node Code).

## Tuỳ chỉnh thường gặp
- **Cảnh báo công nợ tới hạn**: thêm workflow đọc `SO_CONG_NO`, lọc `Hạn thanh toán`
  gần đến → gửi Zalo/Telegram/email cho kế toán.
- **In Phiếu nhập kho F08**: tạo Apps Script/looker lấy theo `Số phiếu NK` từ `SO_NHAP_KHO`.
