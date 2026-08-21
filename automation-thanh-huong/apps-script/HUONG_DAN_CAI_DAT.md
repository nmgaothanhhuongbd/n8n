# 🌾 Mini App Thạnh Hương — chạy trên Google Apps Script (MIỄN PHÍ VĨNH VIỄN)

Thay thế n8n. Không tốn tiền, không hết hạn, không cần server.
Giao diện kiểu **ứng dụng**: bấm nút, bot hỏi từng bước, xem thẻ rồi bấm Lưu.
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
24. Gõ **`/start`** → hiện màn hình chính với các nút
25. Bấm **🪪 Thêm căn cước** → gửi 1 ảnh → bot đọc xong hiện **thẻ thông tin** → bấm **✅ Lưu vào sổ**
26. Mở Google Sheet **CCCD_DATA** kiểm tra dòng mới

---

## 🎮 CÁCH DÙNG (kiểu ứng dụng — không cần nhớ cú pháp)

Mọi thao tác đều **bấm nút**. Bot hỏi từng câu, trả lời xong hiện **thẻ xem lại**, ưng thì bấm Lưu.

### 🪪 Thêm căn cước
1. Bấm **🪪 Thêm căn cước**
2. Gửi ảnh căn cước
3. Bot hiện thẻ: họ tên, số CCCD, ngày sinh, địa chỉ...
4. Bấm **✅ Lưu vào sổ** — hoặc **✏️ Sửa lại** nếu AI đọc sai ô nào

### ⚖️ Phiếu cân
Y hệt: bấm nút → gửi ảnh → xem thẻ → Lưu.
Nếu số cân bị lệch, bot tự cảnh báo ngay trên thẻ.

### 🌾 Ghi mua lúa — bot hỏi 4 câu
1. Bấm **🌾 Ghi mua lúa**
2. **Người bán?** → bấm chọn tên đã mua gần đây, hoặc "✍️ Nhập tên khác"
3. **Loại lúa?** → bấm chọn (OM5451, Đài Thơm 8, IR50404, ST24...) hoặc nhập
4. **Bao nhiêu kg?** → gõ số
5. **Đơn giá?** → bấm chọn giá cũ hoặc gõ số
6. Bot hiện thẻ đã **tự tính thành tiền** + **tự điền căn cước** người bán → bấm **✅ Lưu**

### 📊 Báo cáo
Bấm **📊 Báo cáo** → chọn **Hôm nay / Tuần này / Tháng này**.
Xem được cả phiếu cân lẫn tiền mua lúa.

### 🔎 Tra người bán
Bấm **🔎 Tra cứu** → gõ tên (không dấu cũng được) hoặc số CCCD → bấm vào kết quả để xem chi tiết.

### ✏️ Sửa khi AI đọc sai
Trên thẻ bấm **✏️ Sửa lại** → chọn ô cần sửa → gõ lại → thẻ tự cập nhật → **✅ Lưu**.

> 💡 **Không có gì phải học thuộc.** Không cú pháp, không dấu gạch đứng. Cứ bấm nút và trả lời.

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

### 🔧 Trước tiên: chạy TỰ KIỂM TRA
Trong Apps Script, chọn hàm **`kiemTra`** → bấm **▶ Run** → xem khung *Execution log*.
Nó kiểm tra: token bot, webhook, 3 bảng tính, khoá Gemini, danh sách nhân viên —
và chỉ rõ chỗ nào hỏng.

### 🔁 Bot nhắn lặp lại nhiều lần
Gần như luôn là do **webhook trỏ tới bản deploy CŨ** (code mới không chạy).
1. Chạy **`kiemTra`** → nếu thấy dòng ❌ *"LỆCH! Webhook trỏ bản deploy CŨ"*
2. Chạy hàm **`xoaTinTonDong`** (xoá hàng tin cũ đang dồn)
3. Chạy lại hàm **`setWebhook`**

### 📸 Gửi ảnh mà không thấy dữ liệu vào Sheet
1. **Nhớ bấm nút ✅ Lưu vào sổ** trên thẻ — ảnh KHÔNG tự ghi, phải xác nhận
2. Nếu bot báo *"Không đọc được thông tin từ ảnh"* → chụp lại gần hơn, đủ sáng, mỗi lần 1 giấy tờ
3. Nếu bot báo lỗi Gemini → chạy `kiemTra` xem khoá còn dùng được không

| Hiện tượng | Cách xử lý |
|---|---|
| Bot im lặng hoàn toàn | Chạy `kiemTra`; kiểm tra Deploy đã chọn **Anyone** chưa |
| Báo lỗi quyền Sheet | Chạy `kiemTra` 1 lần để Google xin quyền Sheet |
| Đổi khoá Gemini / thêm nhân viên | Sửa → Ctrl+S → **Deploy → Manage deployments → New version** |
| Muốn tắt bot tạm | Chạy hàm `deleteWebhook` |

> ⛔ **BẪY HAY GẶP NHẤT:** Mỗi lần sửa code phải vào
> **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**.
> Nếu bấm **"New deployment"** thì sẽ ra **URL MỚI** và webhook vẫn trỏ URL cũ
> → code mới không bao giờ chạy. Lỡ làm vậy thì chạy lại **`setWebhook`**.

---

## 💚 Ưu điểm so với n8n

- ✅ **Miễn phí vĩnh viễn** — không giới hạn ngày dùng thử
- ✅ **Không cần service account** — ghi Sheet thẳng, hết cực khổ chia quyền
- ✅ Chạy trên máy chủ Google, 24/7, không cần bật máy
- ✅ Sửa code = mở web, sửa, Ctrl+S

**Giới hạn miễn phí:** ~20.000 lượt gọi/ngày và 90 phút chạy/ngày — nhà máy dùng cả đời không hết.

---
*Biên soạn: Phan Tấn Phương · CÔNG TY TNHH TM DV XNK THÀNH HƯNG*
