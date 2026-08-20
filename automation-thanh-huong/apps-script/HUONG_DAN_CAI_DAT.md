# 🌾 Mini App Thạnh Hương — chạy trên Google Apps Script (MIỄN PHÍ VĨNH VIỄN)

Thay thế n8n. Không tốn tiền, không hết hạn, không cần server.
Chạy ngay trên tài khoản Google của công ty.

---

## 🟦 PHẦN A — Tạo dự án Apps Script

1. Mở trình duyệt, vào: **https://script.google.com**
2. Đăng nhập bằng Gmail **nmgaothanhhuongbd@gmail.com**
3. Bấm **New project** (Dự án mới) — góc trên bên trái
4. Bấm vào chữ **"Untitled project"** ở trên cùng → đổi tên thành: `Mini App Thanh Huong`

---

## 🟩 PHẦN B — Dán code

5. Trong khung code bên phải, bấm chuột vào vùng code
6. Nhấn **Ctrl+A** (chọn hết) rồi **Delete** (xóa sạch code mẫu)
7. Mở file **Code.gs** (file kèm theo) → chọn hết → copy
8. Quay lại Apps Script → **dán** vào (Ctrl+V)
9. Nhấn **Ctrl+S** để lưu

---

## 🟨 PHẦN C — Điền 2 chìa khóa

Nhìn lên đầu code, có 2 dòng cần điền:

```javascript
const BOT_TOKEN  = 'DAN_TOKEN_BOT_VAO_DAY';
const GEMINI_KEY = 'DAN_KHOA_GEMINI_AQ_VAO_DAY';
```

### 10. Lấy TOKEN BOT:
- Mở Telegram → tìm **@BotFather**
- Gõ: `/mybots` → chọn bot **ThạnhHương** → bấm **API Token**
- Copy dãy token (dạng `8123456789:AAF...`)
- Về Apps Script, thay `DAN_TOKEN_BOT_VAO_DAY` bằng token đó
  (nhớ **giữ nguyên 2 dấu nháy** `'...'`)

### 11. Lấy KHÓA GEMINI:
- Đây chính là khóa `AQ...` ông đã tạo hồi trước
- Vào **https://aistudio.google.com/app/apikey** → bấm vào khóa → **Copy key**
- Thay `DAN_KHOA_GEMINI_AQ_VAO_DAY` bằng khóa đó

### 12. Nhấn **Ctrl+S** lưu lại

---

## 🟧 PHẦN D — Triển khai (Deploy)

13. Góc trên bên phải, bấm nút xanh **Deploy** → chọn **New deployment**
14. Bấm biểu tượng **bánh răng ⚙️** (cạnh chữ "Select type") → chọn **Web app**
15. Điền:
    - **Description**: `Mini App Thanh Huong`
    - **Execute as**: **Me** (chính tôi)
    - **Who has access**: **Anyone** ⚠️ *(bắt buộc chọn Anyone thì Telegram mới gọi được)*
16. Bấm **Deploy**
17. Lần đầu Google sẽ hỏi quyền:
    - Bấm **Authorize access** → chọn tài khoản Gmail
    - Hiện màn hình cảnh báo → bấm **Advanced** (Nâng cao)
    - Bấm **Go to Mini App Thanh Huong (unsafe)** — *yên tâm, đây là code của chính mình*
    - Bấm **Allow** (Cho phép)
18. Deploy xong → bấm **Done**

---

## 🟪 PHẦN E — Nối bot với Telegram

19. Ở thanh trên cùng của khung code, có ô chọn hàm (mặc định ghi `doGet`)
20. Bấm vào ô đó → chọn hàm **`setWebhook`**
21. Bấm nút **▶ Run** (Chạy)
22. Chờ vài giây → nhìn khung **Execution log** phía dưới, thấy chữ:
    ```
    {"ok":true,"result":true,"description":"Webhook was set"}
    ```
    → **XONG!** 🎉

> ⚠️ **Nếu log báo "URL này KHÔNG kết thúc bằng /exec"** thì làm cách chắc ăn hơn:
> 1. Bấm **Deploy → Manage deployments** → copy đường link **Web app URL** (kết thúc bằng `/exec`)
> 2. Trong code, tìm hàm `setWebhookManual`, thay `DAN_URL_EXEC_VAO_DAY` bằng link vừa copy
> 3. Ctrl+S → chọn hàm **`setWebhookManual`** → bấm **▶ Run**

---

## 📱 PHẦN F — Thử nghiệm

23. Mở **Telegram** → vào bot **ThạnhHương**
24. Gõ **`/start`** → menu 4 nút hiện ra
25. Bấm **🪪 Thêm CCCD** → gửi 1 ảnh căn cước → chờ ~15 giây → bot báo "✅ Đã lưu CCCD"
26. Mở Google Sheet **CCCD_DATA** kiểm tra dòng mới

---

## 👥 Thêm nhân viên mới

1. Nhân viên nhắn bot → bot trả "⛔ chưa được cấp quyền, **Mã của bạn: 123456789**"
2. Nhân viên gửi mã đó cho quản lý
3. Mở Apps Script, tìm đoạn:
```javascript
const ALLOWED = [
  8594134233,   // Sếp (chủ)
];
```
4. Thêm dòng mới (nhớ dấu phẩy):
```javascript
const ALLOWED = [
  8594134233,   // Sếp (chủ)
  123456789,    // Anh Ba - bốc vác
];
```
5. **Ctrl+S** → xong ngay (KHÔNG cần deploy lại)

---

## 🔄 Khi sửa code thì làm gì?

| Sửa gì | Cần làm |
|---|---|
| Thêm/bớt nhân viên (ALLOWED) | Chỉ **Ctrl+S** |
| Đổi token, khóa, câu chữ | Chỉ **Ctrl+S** |
| Sửa logic lớn / thêm chức năng | **Ctrl+S** → Deploy → **Manage deployments** → bút chì ✏️ → Version: **New version** → **Deploy** |

---

## ⚠️ Xử lý sự cố

| Hiện tượng | Cách xử lý |
|---|---|
| Bot không trả lời | Chạy lại hàm **`webhookInfo`** xem báo lỗi gì. Kiểm tra Deploy đã chọn **Anyone** chưa |
| Báo lỗi quyền Sheet | Chạy thử hàm `handleBaoCao` 1 lần để Google xin quyền Sheet |
| Đổi khóa Gemini | Sửa `GEMINI_KEY` → Ctrl+S (không cần deploy lại) |
| Muốn tắt bot tạm | Chạy hàm **`deleteWebhook`** |

---

## 💚 Ưu điểm so với n8n

- ✅ **Miễn phí vĩnh viễn** — không giới hạn ngày dùng thử
- ✅ **Không cần service account** — ghi Sheet thẳng, hết cực khổ chia quyền
- ✅ Chạy trên máy chủ Google, 24/7, không cần bật máy
- ✅ Sửa code = mở web, sửa, Ctrl+S

**Giới hạn miễn phí:** ~20.000 lượt gọi/ngày và 90 phút chạy/ngày — nhà máy dùng cả đời không hết.

---
*Biên soạn: Phan Tấn Phương · CÔNG TY TNHH TM DV XNK THÀNH HƯNG*
