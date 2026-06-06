# Biểu mẫu cần dùng — Thạnh Hương (tạo nhanh)

Thư mục này gồm mọi biểu mẫu để khởi tạo hệ thống:

| File | Dùng để |
|------|---------|
| `Setup_BieuMau_ThanhHuong.gs` | **Tự dựng cả 5 tab + tiêu đề cột + định dạng** trong Google Sheet (1 cú bấm) |
| `csv/PHIEU_CAN.csv` … (5 file) | Bản mẫu từng tab để **import thủ công / đối chiếu** |

> Có **2 thứ** cần tạo: (A) **Google Sheet** chứa 5 tab dữ liệu, và (B) **chỗ nộp ảnh phiếu**
> (Google Form hoặc thư mục Drive). Làm theo thứ tự dưới đây.

---

## A. TẠO GOOGLE SHEET + 5 BIỂU MẪU (chọn 1 trong 2 cách)

### Cách 1 — Tự động bằng script (khuyến nghị, nhanh & không sợ gõ sai)
1. Vào [sheets.new](https://sheets.new) tạo 1 file mới → đặt tên **"KẾ TOÁN THẠNH HƯƠNG"**.
2. **Extensions ▸ Apps Script**.
3. Xoá code mẫu, **dán toàn bộ** nội dung `Setup_BieuMau_ThanhHuong.gs` ▸ **Save** (💾).
4. Ở thanh chọn hàm, chọn **`taoToanBoBieuMau`** ▸ bấm **Run** ▸ lần đầu bấm **Cấp quyền / Authorize**.
5. Quay lại Sheet → đã có đủ **5 tab**: `PHIEU_CAN`, `BANG_GIA`, `SO_NHAP_KHO`, `SO_XUAT_KHO`, `SO_CONG_NO`
   (tiêu đề cột chuẩn, cố định hàng 1, tự tô đỏ dòng *Cần kiểm tra = CÓ*).
6. **Điền giá** vào tab `BANG_GIA` (đã gợi ý sẵn tên loại hàng, bạn chỉ cần điền cột *Đơn giá*).
7. Copy **ID của file** (đoạn giữa `/d/` và `/edit` trên thanh địa chỉ) — sẽ dán vào n8n.

> 💡 Script chạy lại được nhiều lần, **không xoá dữ liệu** — chỉ ghi lại tiêu đề.
> Có thể dán **chung** với file `KeToan_ThanhHuong.gs` (Dashboard/in phiếu) trong cùng 1 dự án Apps Script.

### Cách 2 — Import thủ công bằng CSV
Với **mỗi** file trong `csv/`:
1. Trong Google Sheet tạo 1 tab, đặt tên **đúng** = tên file (vd `PHIEU_CAN`).
2. **File ▸ Import ▸ Upload** → chọn file `.csv` tương ứng.
3. Mục *Import location* chọn **"Replace current sheet"**, *Separator* để **Detect automatically** ▸ **Import**.
4. Lặp lại cho đủ 5 tab. (Tab `BANG_GIA.csv` đã có sẵn 7 dòng loại hàng mẫu — điền giá vào.)

---

## B. TẠO CHỖ NỘP ẢNH PHIẾU (chọn 1 trong 2)

> ⚠️ Google **không cho** tạo câu hỏi "Tải tệp lên" bằng script, nên Form phải tạo tay
> (chỉ ~5 click). Nếu muốn gọn hơn nữa, dùng **Cách 2 (thư mục Drive)**.

### Cách 1 — Google Form (nhân viên quen dùng điện thoại)
1. Vào [forms.new](https://forms.new) → đặt tên **"NỘP PHIẾU CÂN — Thạnh Hương"**.
2. Thêm câu hỏi, đổi loại câu hỏi thành **"Tải tệp lên" (File upload)** → bấm **Got it** nếu hỏi.
   - Tiêu đề câu hỏi: *"Chụp ảnh phiếu cân"*.
   - **Allowed file types:** chỉ **Image**. **Maximum number of files:** 1 (hoặc 3).
   - Bật **Required** (bắt buộc).
3. (Tuỳ chọn) thêm câu *"Người nộp"* kiểu trả lời ngắn để biết ai gửi.
4. Bấm **Send** → chia sẻ link/QR cho nhân viên hiện trường.
5. Khi có người nộp, Google tự tạo **thư mục Drive** tên *"NỘP PHIẾU CÂN — Thạnh Hương (File responses)"*.
   - Mở thư mục đó, copy **ID thư mục** (trên thanh địa chỉ) → dán vào node **"Drive: ảnh phiếu mới"** trong workflow #1.

### Cách 2 — Thư mục Drive dùng chung (đơn giản nhất)
1. Tạo 1 thư mục Drive tên **"PHIEU_CAN_ANH"** → chia sẻ cho nhân viên (quyền *Người chỉnh sửa*).
2. Nhân viên cài app **Google Drive** trên điện thoại → vào thư mục → **+ ▸ Tải lên ▸ Chụp ảnh**.
3. Copy **ID thư mục** → dán vào node **"Drive: ảnh phiếu mới"** trong workflow #1.

---

## C. NỐI VÀO n8n (điền ID vừa lấy)

| Chỗ điền trong n8n | Giá trị |
|--------------------|---------|
| Node **Drive: ảnh phiếu mới** → Folder | ID thư mục ảnh (mục B) |
| `REPLACE_SHEET_ID` (workflow #1) | ID file KẾ TOÁN (mục A) |
| `REPLACE_PHIEUCAN_SHEET_ID` (workflow #2, #3) | ID file chứa tab `PHIEU_CAN` |
| `REPLACE_KETOAN_SHEET_ID` (workflow #2, #3) | ID file chứa `BANG_GIA / SO_*` (thường cùng 1 file) |

Sau khi điền xong → **Execute thử** từng workflow → bật **Active**. Xong!

---

## Tóm tắt tiêu đề cột (để kiểm tra nhanh)

- **PHIEU_CAN** (22): Thời gian xử lý · Tên file · Link ảnh · Ngày phiếu · Số phiếu · Người bán / Khách hàng · Loại hàng / lúa · Số xe · TL xe vào (kg) · TL xe ra (kg) · TL hàng (kg) · Độ ẩm (%) · Kiểu cân · Ghi chú chất lượng · Người cân · Độ tin cậy · Cần kiểm tra · Lý do kiểm tra · Đơn giá (đ/kg) · Thành tiền (đồng) · Số phiếu NK · Đã ghi sổ KT
- **BANG_GIA** (5): Loại hàng / lúa · Đơn giá (đ/kg) · Đơn vị · Cập nhật ngày · Ghi chú
- **SO_NHAP_KHO** (15): Ngày nhập · Số phiếu NK · Loại nhập · Nhà cung cấp · Số chứng từ gốc · Người giao hàng · Tên hàng / lúa · ĐVT · SL thực nhập · Đơn giá (đồng) · Thành tiền (đồng) · KCS / Chất lượng · Cần kiểm tra · Ghi chú · Link phiếu cân
- **SO_XUAT_KHO** (15): Ngày xuất · Số phiếu XK · Loại xuất · Khách hàng · Số chứng từ gốc · Người giao / cân · Tên hàng · ĐVT · SL thực xuất · Đơn giá (đồng) · Thành tiền (đồng) · Mục đích · Cần kiểm tra · Ghi chú · Link phiếu cân
- **SO_CONG_NO** (11): Ngày · Loại công nợ · Số phiếu NK · Nhà cung cấp / KH · Diễn giải · Giá trị (đồng) · Đã trả/thu (đồng) · Còn nợ (đồng) · Hạn thanh toán · Trạng thái · Link phiếu cân
