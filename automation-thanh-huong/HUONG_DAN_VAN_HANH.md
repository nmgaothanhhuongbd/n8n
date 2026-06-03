# 🗺️ CẨM NANG VẬN HÀNH — Hệ thống tự động Phiếu cân → Kế toán (Thạnh Hương)

Tài liệu này gom **tất cả các bước**, làm theo đúng thứ tự là chạy được.

```
📱 Chụp phiếu cân (Google Form)
   → ① Claude Vision đọc ảnh        → PHIEU_CAN
   → ② Mua lúa                      → SO_NHAP_KHO + công nợ PHẢI TRẢ
   → ③ Bán cám/trấu/gạo             → SO_XUAT_KHO + công nợ PHẢI THU
   → ④ DASHBOARD tổng hợp + In F08/F09 (PDF)
```

Các file đã có trong thư mục `automation-thanh-huong/`:
- `phieu-can-ocr-thanh-huong.json` — Workflow #1 (đọc ảnh)
- `phieu-can-to-ketoan.json` — Workflow #2 (nhập kho + phải trả)
- `phieu-can-to-ketoan-xuat.json` — Workflow #3 (xuất kho + phải thu)
- `KeToan_ThanhHuong.gs` — Apps Script (Dashboard + in phiếu)

---

## GIAI ĐOẠN A — CHUẨN BỊ (làm 1 lần)

### Bước 1. Chuẩn bị tài khoản & khoá
- [ ] Tài khoản **Google** (đang dùng Drive `nmgaothanhhuongbd@gmail.com`).
- [ ] **API key Anthropic (Claude)** — tạo tại https://console.anthropic.com → mục API Keys.
      Nạp một ít credit để dùng (đọc ảnh tốn rất ít, ~vài trăm đồng/phiếu).
- [ ] Một bản **n8n** đang chạy (n8n Cloud hoặc tự cài). Nếu chưa có, dùng n8n Cloud cho nhanh.

### Bước 2. Tạo Google Sheet "SỔ KẾ TOÁN" và các tab
Tạo **1 file Google Sheet** (đặt tên ví dụ `SO_KE_TOAN_THANH_HUONG`) gồm các tab sau.
Hàng 1 của mỗi tab là **tiêu đề cột** — gõ đúng tên cột (copy từ đây):

**Tab `PHIEU_CAN`**
```
Thời gian xử lý | Tên file | Link ảnh | Ngày phiếu | Số phiếu | Người bán / Khách hàng |
Loại hàng / lúa | Số xe | TL xe vào (kg) | TL xe ra (kg) | TL hàng (kg) | Độ ẩm (%) |
Kiểu cân | Ghi chú chất lượng | Người cân | Độ tin cậy | Cần kiểm tra | Lý do kiểm tra |
Đơn giá (đ/kg) | Thành tiền (đồng) | Số phiếu NK | Đã ghi sổ KT
```

**Tab `BANG_GIA`** (bạn tự nhập giá; dùng chung cho cả mua & bán)
```
Loại hàng / lúa | Đơn giá (đ/kg) | Đơn vị | Cập nhật ngày | Ghi chú
```
> Ví dụ dòng: `Lúa OM5451 | 7500 | kg | 01/06/2026 |` ; `Cám gạo | 6000 | kg | ... |`

**Tab `SO_NHAP_KHO`**
```
Ngày nhập | Số phiếu NK | Loại nhập | Nhà cung cấp | Số chứng từ gốc | Người giao hàng |
Tên hàng / lúa | ĐVT | SL thực nhập | Đơn giá (đồng) | Thành tiền (đồng) |
KCS / Chất lượng | Cần kiểm tra | Ghi chú | Link phiếu cân
```

**Tab `SO_XUAT_KHO`**
```
Ngày xuất | Số phiếu XK | Loại xuất | Khách hàng | Số chứng từ gốc | Người giao / cân |
Tên hàng | ĐVT | SL thực xuất | Đơn giá (đồng) | Thành tiền (đồng) |
Mục đích | Cần kiểm tra | Ghi chú | Link phiếu cân
```

**Tab `SO_CONG_NO`** (dùng chung cho cả phải trả & phải thu)
```
Ngày | Loại công nợ | Số phiếu NK | Nhà cung cấp / KH | Diễn giải |
Giá trị (đồng) | Đã trả/thu (đồng) | Còn nợ (đồng) | Hạn thanh toán | Trạng thái | Link phiếu cân
```

> 👉 Ghi lại **ID** của file Sheet này (phần trong URL giữa `/d/` và `/edit`). Gọi là `KETOAN_SHEET_ID`.
> Ở đây `PHIEU_CAN` để chung file → `PHIEUCAN_SHEET_ID` = `KETOAN_SHEET_ID`.

### Bước 3. Kiểm tra Google Form & thư mục ảnh
- [ ] Form chụp/upload phiếu cân đã đổ ảnh vào thư mục Drive **"PHIẾU CÂN (File responses)"**.
- [ ] Workflow #1 đã trỏ sẵn ID thư mục này. (Nếu đổi form, cập nhật lại folder ID trong node trigger.)

---

## GIAI ĐOẠN B — CÀI WORKFLOW TRONG n8n (làm 1 lần)

### Bước 4. Tạo credential trong n8n
- [ ] **Google API** (OAuth2 hoặc Service Account) có quyền **Drive + Sheets**.
      Nếu dùng Service Account: **chia sẻ** thư mục ảnh + file Sheet cho email service account.
- [ ] **Header Auth** cho Anthropic: Name = `x-api-key`, Value = API key Claude.

### Bước 5. Import & cấu hình Workflow #1 (đọc ảnh)
1. n8n → **Import from File** → `phieu-can-ocr-thanh-huong.json`.
2. Gắn credential **Google** cho 3 node Drive/Sheets; credential **Header Auth** cho node Claude.
3. Node "Ghi vào Google Sheet": thay `REPLACE_SHEET_ID` = `KETOAN_SHEET_ID`, tab = `PHIEU_CAN`.
4. **Execute Workflow** → upload thử 1 ảnh phiếu vào thư mục → kiểm tra có dòng mới trong `PHIEU_CAN`.
5. Bật **Active**.

### Bước 6. Import & cấu hình Workflow #2 (nhập kho + phải trả)
1. Import `phieu-can-to-ketoan.json`.
2. Gắn credential Google cho các node Sheets.
3. Thay `REPLACE_PHIEUCAN_SHEET_ID` và `REPLACE_KETOAN_SHEET_ID` (ở đây cùng 1 ID).
4. Execute thử → kiểm tra `SO_NHAP_KHO`, `SO_CONG_NO` có dòng; `PHIEU_CAN` cột "Đã ghi sổ KT" = CÓ.
5. Bật **Active**.

### Bước 7. Import & cấu hình Workflow #3 (xuất kho + phải thu)
1. Import `phieu-can-to-ketoan-xuat.json`. Làm y hệt Bước 6.
2. Bật **Active**.

### Bước 8. Cài Apps Script (Dashboard + In phiếu)
1. Mở file Sheet kế toán → **Extensions ▸ Apps Script**.
2. Dán toàn bộ `KeToan_ThanhHuong.gs` → **Save**.
3. Tải lại trang Sheet → có menu **"⚙️ Kế toán Thạnh Hương"**.
4. Chạy thử **🔄 Cập nhật Dashboard** → bấm **Authorize** cấp quyền lần đầu.

> ✅ Xong phần cài đặt. Từ giờ chỉ còn vận hành hàng ngày.

---

## GIAI ĐOẠN C — VẬN HÀNH HÀNG NGÀY

### Bước 9. Nhập liệu (nhân viên cân/kho)
- 📸 Mỗi lần cân: **chụp phiếu → submit qua Google Form**. Hết việc.
- Hệ thống tự: đọc ảnh → ghi `PHIEU_CAN` → (sau ≤10 phút) chuyển vào sổ kho + công nợ.

### Bước 10. Soát phiếu (kế toán) — làm 1–2 lần/ngày
1. Mở tab `PHIEU_CAN`, **lọc cột "Cần kiểm tra" = CÓ**.
2. Mở "Link ảnh" đối chiếu, sửa lại ô sai (nhất là **số cân**, **người bán**, **loại lúa**).
3. Đảm bảo **`BANG_GIA`** đã có đơn giá cho loại hàng đó (nếu sổ báo "Cần nhập đơn giá").

### Bước 11. Cập nhật khi thu/chi tiền
- Khi **trả tiền NCC** hoặc **thu tiền khách**: vào `SO_CONG_NO`, cập nhật cột
  **"Đã trả/thu"** và **"Còn nợ"** (Còn nợ = Giá trị − Đã trả/thu), đổi **Trạng thái**.

### Bước 12. In phiếu khi cần
- Menu **🖨️ In Phiếu NHẬP kho (F08)** hoặc **XUẤT kho (F09)** → nhập số phiếu → mở **link PDF** để in.

---

## GIAI ĐOẠN D — CUỐI THÁNG

### Bước 13. Xem báo cáo
1. Mở tab `DASHBOARD`, nhập **B2 = tháng**, **B3 = năm**, **B4 = lúa đưa vào sản xuất (kg)**.
2. Chạy menu **🔄 Cập nhật Dashboard**.
3. Đọc: tồn kho lúa · doanh thu phụ phẩm theo loại · công nợ 2 chiều + quá hạn.

> (Tuỳ chọn) Đặt **Trigger** chạy `capNhatDashboard` tự động mỗi sáng.

---

## ⚠️ XỬ LÝ SỰ CỐ NHANH

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Phiếu không lên `PHIEU_CAN` | Workflow #1 chưa Active / sai credential / ảnh chưa vào đúng thư mục | Kiểm tra node trigger, Executions log trong n8n |
| Không sang sổ kho/công nợ | #2/#3 chưa Active, sai Sheet ID, hoặc loại hàng không nhận diện được | Xem Executions; kiểm tra cột "Loại hàng / lúa" |
| Thành tiền trống, ghi chú "Cần nhập đơn giá" | Loại hàng chưa có trong `BANG_GIA` | Thêm dòng giá vào `BANG_GIA` |
| Ghi trùng dòng | Sửa tay cột "Đã ghi sổ KT" về trống | Để hệ thống tự quản cột này; không xoá tay |
| Số cân/loại sai | Chữ viết tay/ảnh mờ | Phiếu đã bị gắn cờ "Cần kiểm tra" → sửa tay theo Bước 10 |
| In PDF báo lỗi quyền | Chưa Authorize Apps Script | Chạy lại menu, bấm Authorize |

## 📌 GHI NHỚ
- Robot **không tự xoá/sửa** số liệu cũ — kế toán vẫn là người chốt.
- Mọi phiếu **đều vào sổ** kể cả khi "Cần kiểm tra" = CÓ (để không sót), nên **phải soát** cờ đỏ.
- "Tồn kho lúa" cần nhập tay ô "lúa đưa vào SX" (chưa có sổ tiêu hao sản xuất).
