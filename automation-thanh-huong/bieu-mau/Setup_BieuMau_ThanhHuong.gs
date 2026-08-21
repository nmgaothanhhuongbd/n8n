/**
 * ============================================================================
 *  THẠNH HƯƠNG — TỰ DỰNG TOÀN BỘ BIỂU MẪU (Google Sheet)
 * ----------------------------------------------------------------------------
 *  Chạy 1 lần để tạo sẵn 5 tab với ĐÚNG tiêu đề cột mà các workflow n8n cần:
 *    PHIEU_CAN · BANG_GIA · SO_NHAP_KHO · SO_XUAT_KHO · SO_CONG_NO
 *  Kèm: cố định hàng tiêu đề, định dạng số tiền, tô đỏ dòng "Cần kiểm tra = CÓ".
 *
 *  CÁCH DÙNG:
 *   1. Tạo (hoặc mở) file Google Sheet sẽ dùng làm "FILE KẾ TOÁN".
 *   2. Extensions ▸ Apps Script → dán toàn bộ file này ▸ Save.
 *   3. Chọn hàm  taoToanBoBieuMau  ▸ Run ▸ cấp quyền lần đầu.
 *   4. Quay lại Sheet: đã có đủ 5 tab. Copy ID file (trên thanh địa chỉ) để điền
 *      REPLACE_SHEET_ID / REPLACE_KETOAN_SHEET_ID / REPLACE_PHIEUCAN_SHEET_ID trong n8n.
 *
 *  Ghi chú: chạy lại an toàn — tab nào đã có sẽ chỉ ghi lại tiêu đề, KHÔNG xoá dữ liệu.
 * ============================================================================
 */

var HEADERS = {
  PHIEU_CAN: [
    'Thời gian xử lý', 'Tên file', 'Link ảnh', 'Ngày phiếu', 'Số phiếu',
    'Người bán / Khách hàng', 'Loại hàng / lúa', 'Số xe',
    'TL xe vào (kg)', 'TL xe ra (kg)', 'TL hàng (kg)', 'Độ ẩm (%)',
    'Kiểu cân', 'Ghi chú chất lượng', 'Người cân', 'Độ tin cậy',
    'Cần kiểm tra', 'Lý do kiểm tra',
    'Đơn giá (đ/kg)', 'Thành tiền (đồng)', 'Số phiếu NK', 'Đã ghi sổ KT'
  ],
  BANG_GIA: [
    'Loại hàng / lúa', 'Đơn giá (đ/kg)', 'Đơn vị', 'Cập nhật ngày', 'Ghi chú'
  ],
  SO_NHAP_KHO: [
    'Ngày nhập', 'Số phiếu NK', 'Loại nhập', 'Nhà cung cấp', 'Số chứng từ gốc',
    'Người giao hàng', 'Tên hàng / lúa', 'ĐVT', 'SL thực nhập', 'Đơn giá (đồng)',
    'Thành tiền (đồng)', 'KCS / Chất lượng', 'Cần kiểm tra', 'Ghi chú', 'Link phiếu cân'
  ],
  SO_XUAT_KHO: [
    'Ngày xuất', 'Số phiếu XK', 'Loại xuất', 'Khách hàng', 'Số chứng từ gốc',
    'Người giao / cân', 'Tên hàng', 'ĐVT', 'SL thực xuất', 'Đơn giá (đồng)',
    'Thành tiền (đồng)', 'Mục đích', 'Cần kiểm tra', 'Ghi chú', 'Link phiếu cân'
  ],
  SO_CONG_NO: [
    'Ngày', 'Loại công nợ', 'Số phiếu NK', 'Nhà cung cấp / KH', 'Diễn giải',
    'Giá trị (đồng)', 'Đã trả/thu (đồng)', 'Còn nợ (đồng)', 'Hạn thanh toán',
    'Trạng thái', 'Link phiếu cân'
  ]
};

// Loại hàng mẫu cho BANG_GIA — tên đặt khớp với bộ đọc phiếu (để trống giá, bạn tự điền)
var BANG_GIA_MAU = [
  ['Lúa tươi OM5451', '', 'đ/kg', '', 'Giá MUA — cập nhật theo thị trường'],
  ['Lúa tươi Đài Thơm 8', '', 'đ/kg', '', 'Giá MUA'],
  ['Lúa khô', '', 'đ/kg', '', 'Giá MUA'],
  ['Cám gạo', '', 'đ/kg', '', 'Giá BÁN'],
  ['Trấu', '', 'đ/kg', '', 'Giá BÁN'],
  ['Gạo', '', 'đ/kg', '', 'Giá BÁN'],
  ['Tấm', '', 'đ/kg', '', 'Giá BÁN']
];

function taoToanBoBieuMau() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(function (name) {
    _taoTab(ss, name, HEADERS[name]);
  });

  // Đổ loại hàng mẫu vào BANG_GIA nếu đang trống
  var bg = ss.getSheetByName('BANG_GIA');
  if (bg && bg.getLastRow() < 2) {
    bg.getRange(2, 1, BANG_GIA_MAU.length, 5).setValues(BANG_GIA_MAU);
  }

  // Tô đỏ dòng "Cần kiểm tra = CÓ" trong PHIEU_CAN
  _toMauCanKiemTra(ss.getSheetByName('PHIEU_CAN'), 'Q'); // cột Q = "Cần kiểm tra"

  // Xoá tab "Sheet1"/"Trang tính1" mặc định nếu còn trống
  ['Sheet1', 'Trang tính1'].forEach(function (n) {
    var s = ss.getSheetByName(n);
    if (s && s.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s);
  });

  SpreadsheetApp.getUi().alert(
    '✅ Đã tạo xong 5 biểu mẫu:\n\n' +
    '• PHIEU_CAN (22 cột)\n• BANG_GIA (đã gợi ý loại hàng — bạn điền giá)\n' +
    '• SO_NHAP_KHO\n• SO_XUAT_KHO\n• SO_CONG_NO\n\n' +
    'Bước tiếp: copy ID của file này (trên thanh địa chỉ) để điền vào các workflow n8n.'
  );
}

/** Tạo 1 tab + ghi tiêu đề + định dạng cơ bản (không xoá dữ liệu cũ) */
function _taoTab(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  // Ghi/cập nhật hàng tiêu đề
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  var head = sh.getRange(1, 1, 1, headers.length);
  head.setFontWeight('bold').setBackground('#1155cc').setFontColor('#ffffff')
      .setVerticalAlignment('middle').setWrap(true);
  sh.setFrozenRows(1);
  sh.setRowHeight(1, 38);
  // Độ rộng cột dễ nhìn
  for (var c = 1; c <= headers.length; c++) {
    var w = String(headers[c - 1]).length > 18 ? 180 : 130;
    sh.setColumnWidth(c, w);
  }
  // Định dạng số cho các cột tiền/khối lượng
  for (var i = 0; i < headers.length; i++) {
    var h = headers[i];
    if (/\(kg\)|\(đồng\)|\(đ\/kg\)|Giá trị|Còn nợ|Đã trả|Thành tiền|Đơn giá|SL /.test(h)) {
      sh.getRange(2, i + 1, sh.getMaxRows() - 1, 1).setNumberFormat('#,##0');
    }
  }
  return sh;
}

/** Quy tắc tô đỏ khi cột chỉ định = "CÓ" */
function _toMauCanKiemTra(sh, colLetter) {
  if (!sh) return;
  var rng = sh.getRange('A2:V' + sh.getMaxRows());
  var rule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=UPPER($' + colLetter + '2)="CÓ"')
    .setBackground('#fde0e0')
    .setRanges([rng])
    .build();
  var rules = sh.getConditionalFormatRules();
  rules.push(rule);
  sh.setConditionalFormatRules(rules);
}
