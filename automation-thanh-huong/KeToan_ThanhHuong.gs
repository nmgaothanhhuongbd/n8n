/**
 * ============================================================================
 *  KẾ TOÁN THẠNH HƯƠNG — Dashboard tổng hợp + In phiếu F08/F09 (PDF)
 * ----------------------------------------------------------------------------
 *  Cài đặt: mở file Google Sheet KẾ TOÁN (chứa SO_NHAP_KHO, SO_XUAT_KHO,
 *  SO_CONG_NO) → Extensions ▸ Apps Script → dán toàn bộ file này ▸ Save.
 *  Tải lại trang Sheet, sẽ có menu "⚙️ Kế toán Thạnh Hương".
 *
 *  Tab dữ liệu cần có (do 3 workflow n8n tạo): SO_NHAP_KHO, SO_XUAT_KHO, SO_CONG_NO
 *  Tab tự tạo khi chạy: DASHBOARD, IN_PHIEU
 * ============================================================================
 */

var CONFIG = {
  TEN_CTY: 'CÔNG TY TNHH SX TM DV THẠNH HƯƠNG',
  DIA_CHI: 'Xóm 4, Thôn Quảng Nghiệp, Xã Tuy Phước Bắc, Tỉnh Gia Lai',
  MST: '4101665953',
  SHEET_NHAP: 'SO_NHAP_KHO',
  SHEET_XUAT: 'SO_XUAT_KHO',
  SHEET_CONGNO: 'SO_CONG_NO',
  SHEET_DASHBOARD: 'DASHBOARD',
  SHEET_IN: 'IN_PHIEU',
  FOLDER_PDF: 'PHIEU_IN'
};

/** Menu khi mở file */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚙️ Kế toán Thạnh Hương')
    .addItem('🔄 Cập nhật Dashboard', 'capNhatDashboard')
    .addSeparator()
    .addItem('🖨️ In Phiếu NHẬP kho (F08)…', 'inPhieuNhapKho')
    .addItem('🖨️ In Phiếu XUẤT kho (F09)…', 'inPhieuXuatKho')
    .addToUi();
}

/* ============================ Tiện ích chung ============================ */

function _sheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  return sh;
}

/** Đọc 1 sheet thành mảng object theo header hàng 1. Trả [] nếu không có. */
function _readTable(name) {
  var sh = _sheet(name);
  if (!sh) return [];
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0].map(function (h) { return String(h).trim(); });
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    var empty = true;
    for (var c = 0; c < headers.length; c++) {
      if (!headers[c]) continue;
      obj[headers[c]] = values[i][c];
      if (values[i][c] !== '' && values[i][c] !== null) empty = false;
    }
    if (!empty) rows.push(obj);
  }
  return rows;
}

/** Số từ chuỗi/ô bất kỳ (bỏ 'kg', dấu phẩy nghìn...) */
function _num(v) {
  if (v === '' || v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  var n = Number(String(v).replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

/** Parse ngày: hỗ trợ Date object hoặc text DD/MM/YYYY */
function _parseDate(v) {
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  var m = String(v || '').match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (!m) return null;
  var d = +m[1], mo = +m[2], y = +m[3];
  if (y < 100) y += 2000;
  var dt = new Date(y, mo - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
}

function _fmtMoney(n) { return Math.round(_num(n)).toLocaleString('vi-VN'); }
function _fmtDate(dt) {
  if (!dt) return '';
  return ('0' + dt.getDate()).slice(-2) + '/' + ('0' + (dt.getMonth() + 1)).slice(-2) + '/' + dt.getFullYear();
}

/* ============================ DASHBOARD ============================ */

function capNhatDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(CONFIG.SHEET_DASHBOARD);
  if (!sh) sh = ss.insertSheet(CONFIG.SHEET_DASHBOARD, 0);

  // --- Lấy kỳ báo cáo: ô B2 = Tháng, B3 = Năm (mặc định tháng hiện tại) ---
  var now = new Date();
  var thang = _num(sh.getRange('B2').getValue()) || (now.getMonth() + 1);
  var nam = _num(sh.getRange('B3').getValue()) || now.getFullYear();
  var luaSX = _num(sh.getRange('B4').getValue()); // Lúa đưa vào sản xuất (kg) - nhập tay
  var endOfMonth = new Date(nam, thang, 0, 23, 59, 59);

  var nhap = _readTable(CONFIG.SHEET_NHAP);
  var xuat = _readTable(CONFIG.SHEET_XUAT);
  var congno = _readTable(CONFIG.SHEET_CONGNO);

  var inMonth = function (dt) { return dt && dt.getMonth() + 1 === thang && dt.getFullYear() === nam; };

  // --- A. Tồn kho lúa ---
  var luaNhapThang = 0, luaNhapLuyKe = 0, giaTriNhapThang = 0;
  nhap.forEach(function (r) {
    var dt = _parseDate(r['Ngày nhập']);
    var sl = _num(r['SL thực nhập']);
    if (dt && dt <= endOfMonth) luaNhapLuyKe += sl;
    if (inMonth(dt)) { luaNhapThang += sl; giaTriNhapThang += _num(r['Thành tiền (đồng)']); }
  });
  var tonKhoLua = luaNhapLuyKe - luaSX;

  // --- B. Doanh thu bán phụ phẩm + theo loại ---
  var doanhThuThang = 0, slBanThang = 0;
  var theoLoai = {}; // ten -> {kg, tien}
  xuat.forEach(function (r) {
    var dt = _parseDate(r['Ngày xuất']);
    if (!inMonth(dt)) return;
    var sl = _num(r['SL thực xuất']);
    var tien = _num(r['Thành tiền (đồng)']);
    doanhThuThang += tien; slBanThang += sl;
    var ten = String(r['Tên hàng'] || 'Khác').trim();
    if (!theoLoai[ten]) theoLoai[ten] = { kg: 0, tien: 0 };
    theoLoai[ten].kg += sl; theoLoai[ten].tien += tien;
  });

  // --- C. Công nợ 2 chiều ---
  var phaiTra = 0, phaiThu = 0, quaHanTra = 0, quaHanThu = 0;
  var psTraThang = 0, psThuThang = 0;
  var today = new Date(); today.setHours(0, 0, 0, 0);
  congno.forEach(function (r) {
    var loai = String(r['Loại công nợ'] || '').toLowerCase();
    var conNo = _num(r['Còn nợ (đồng)']);
    var giaTri = _num(r['Giá trị (đồng)']);
    var han = _parseDate(r['Hạn thanh toán']);
    var dt = _parseDate(r['Ngày']);
    var laTra = loai.indexOf('trả') >= 0 || loai.indexOf('tra') >= 0;
    var laThu = loai.indexOf('thu') >= 0;
    if (laTra) {
      phaiTra += conNo;
      if (han && han < today && conNo > 0) quaHanTra += conNo;
      if (inMonth(dt)) psTraThang += giaTri;
    } else if (laThu) {
      phaiThu += conNo;
      if (han && han < today && conNo > 0) quaHanThu += conNo;
      if (inMonth(dt)) psThuThang += giaTri;
    }
  });

  // --- Vẽ Dashboard ---
  sh.clear();
  var data = [];
  data.push([CONFIG.TEN_CTY, '', '', '']);
  data.push(['BẢNG ĐIỀU KHIỂN TỔNG HỢP — Kỳ:', thang + '/' + nam, '', '']);
  data.push(['Tháng (nhập số):', thang, 'Lúa đưa vào SX lũy kế (kg):', luaSX]);
  data.push(['Năm (nhập số):', nam, 'Cập nhật lúc:', _fmtDate(now) + ' ' + ('0'+now.getHours()).slice(-2)+':'+('0'+now.getMinutes()).slice(-2)]);
  data.push(['', '', '', '']);

  data.push(['📦 TỒN KHO LÚA', '', '', '']);
  data.push(['Lúa nhập trong tháng (kg):', luaNhapThang, 'Giá trị nhập tháng (đ):', giaTriNhapThang]);
  data.push(['Lúa nhập lũy kế (kg):', luaNhapLuyKe, 'Lúa đưa vào SX (kg):', luaSX]);
  data.push(['➡️ TỒN KHO LÚA ƯỚC TÍNH (kg):', tonKhoLua, '', '']);
  data.push(['', '', '', '']);

  data.push(['💰 DOANH THU BÁN PHỤ PHẨM (tháng)', '', '', '']);
  data.push(['Tổng doanh thu (đ):', doanhThuThang, 'Tổng SL bán (kg):', slBanThang]);
  data.push(['— Chi tiết theo loại —', 'Số lượng (kg)', 'Thành tiền (đ)', '']);
  Object.keys(theoLoai).sort().forEach(function (ten) {
    data.push([ten, theoLoai[ten].kg, theoLoai[ten].tien, '']);
  });
  data.push(['', '', '', '']);

  data.push(['🧾 CÔNG NỢ 2 CHIỀU', 'Còn lại (đ)', 'Trong đó QUÁ HẠN (đ)', 'Phát sinh tháng (đ)']);
  data.push(['Phải TRẢ nhà cung cấp (mua lúa):', phaiTra, quaHanTra, psTraThang]);
  data.push(['Phải THU khách hàng (bán hàng):', phaiThu, quaHanThu, psThuThang]);
  data.push(['Chênh lệch (Thu − Trả) (đ):', phaiThu - phaiTra, '', '']);

  sh.getRange(1, 1, data.length, 4).setValues(data);

  // Định dạng nhanh
  sh.getRange('A1:D1').merge().setFontSize(13).setFontWeight('bold').setHorizontalAlignment('center');
  sh.getRange('A2').setFontWeight('bold').setFontSize(11);
  [6, 10, 15].forEach(function (r) {
    sh.getRange(r, 1, 1, 4).setBackground('#1155cc').setFontColor('#ffffff').setFontWeight('bold');
  });
  sh.getRange('A8:B8').setFontWeight('bold').setBackground('#fff2cc');
  // Định dạng số tiền/khối lượng
  sh.getRange(6, 2, data.length, 3).setNumberFormat('#,##0');
  sh.getRange('B2:B4').setBackground('#fff2cc'); // ô nhập liệu kỳ + lúa SX
  sh.getRange('D3').setBackground('#fff2cc');
  sh.setColumnWidth(1, 320); sh.setColumnWidth(2, 160); sh.setColumnWidth(3, 200); sh.setColumnWidth(4, 160);

  SpreadsheetApp.getUi().alert('✅ Đã cập nhật Dashboard cho kỳ ' + thang + '/' + nam +
    '.\n\nMẹo: sửa ô B2 (tháng), B3 (năm), B4 (lúa đưa vào SX) rồi chạy lại menu để xem kỳ khác.');
}

/* ============================ IN PHIẾU F08 / F09 ============================ */

function inPhieuNhapKho() { _inPhieu('NHAP'); }
function inPhieuXuatKho() { _inPhieu('XUAT'); }

function _inPhieu(loai) {
  var ui = SpreadsheetApp.getUi();
  var laNhap = (loai === 'NHAP');
  var sheetData = laNhap ? CONFIG.SHEET_NHAP : CONFIG.SHEET_XUAT;
  var colSo = laNhap ? 'Số phiếu NK' : 'Số phiếu XK';
  var tieuDe = laNhap ? 'PHIẾU NHẬP KHO' : 'PHIẾU XUẤT KHO';
  var maBM = laNhap ? 'TH-KT-F08' : 'TH-KT-F09';

  var resp = ui.prompt('In ' + tieuDe,
    'Nhập "' + colSo + '" cần in (vd: ' + (laNhap ? 'NK-' : 'XK-') + '...):', ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  var soPhieu = String(resp.getResponseText()).trim();
  if (!soPhieu) { ui.alert('Chưa nhập số phiếu.'); return; }

  var rows = _readTable(sheetData).filter(function (r) {
    return String(r[colSo]).trim() === soPhieu;
  });
  if (!rows.length) { ui.alert('Không tìm thấy phiếu "' + soPhieu + '" trong ' + sheetData + '.'); return; }

  var pdfUrl = laNhap ? _buildVoucher(rows, 'NHAP', tieuDe, maBM, soPhieu)
                      : _buildVoucher(rows, 'XUAT', tieuDe, maBM, soPhieu);

  var html = HtmlService.createHtmlOutput(
    '<p>✅ Đã tạo PDF cho phiếu <b>' + soPhieu + '</b>.</p>' +
    '<p><a href="' + pdfUrl + '" target="_blank">👉 Mở / tải PDF để in</a></p>' +
    '<p style="color:#666">PDF cũng được lưu trong thư mục Drive "' + CONFIG.FOLDER_PDF + '".</p>'
  ).setWidth(420).setHeight(180);
  ui.showModalDialog(html, 'In ' + tieuDe);
}

/** Dựng sheet IN_PHIEU theo dữ liệu rồi xuất PDF, trả về URL */
function _buildVoucher(rows, loai, tieuDe, maBM, soPhieu) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(CONFIG.SHEET_IN);
  if (!sh) sh = ss.insertSheet(CONFIG.SHEET_IN);
  sh.clear();
  sh.getDataRange().setBackground(null);

  var laNhap = (loai === 'NHAP');
  var r0 = rows[0];
  var ngay = laNhap ? r0['Ngày nhập'] : r0['Ngày xuất'];
  var doiTac = laNhap ? (r0['Nhà cung cấp'] || '') : (r0['Khách hàng'] || '');
  var nhanLabel = laNhap ? 'Nhà cung cấp / Nguồn:' : 'Khách hàng:';
  var slCol = laNhap ? 'SL thực nhập' : 'SL thực xuất';

  var out = [];
  out.push([CONFIG.TEN_CTY, '', '', '', '']);
  out.push([CONFIG.DIA_CHI + '  |  MST: ' + CONFIG.MST, '', '', '', '']);
  out.push(['Mã biểu mẫu: ' + maBM + '  |  Phiên bản: 1.0', '', '', '', '']);
  out.push([tieuDe, '', '', '', '']);
  out.push(['Số phiếu:', soPhieu, '', 'Ngày:', ngay]);
  out.push([nhanLabel, doiTac, '', 'Chứng từ gốc:', r0['Số chứng từ gốc'] || '']);
  out.push(['Người giao/cân:', r0['Người giao hàng'] || r0['Người giao / cân'] || '', '', 'Loại:', laNhap ? (r0['Loại nhập']||'') : (r0['Loại xuất']||'')]);
  out.push(['', '', '', '', '']);
  out.push(['STT', 'Tên hàng / Vật tư', 'ĐVT', 'Số lượng', 'Đơn giá (đ)']);

  var tongTien = 0, tongSL = 0;
  rows.forEach(function (r, i) {
    var sl = _num(r[slCol]); var dg = _num(r['Đơn giá (đồng)']);
    var tt = _num(r['Thành tiền (đồng)']) || sl * dg;
    tongTien += tt; tongSL += sl;
    out.push([i + 1, r['Tên hàng / lúa'] || r['Tên hàng'] || '', r['ĐVT'] || 'kg', sl, dg]);
  });
  out.push(['', 'TỔNG CỘNG', '', tongSL, '']);
  out.push(['', 'THÀNH TIỀN (đ):', '', '', tongTien]);
  out.push(['', '', '', '', '']);
  out.push(['Ghi chú:', rows.map(function(r){return r['Ghi chú'];}).filter(String).join(' | '), '', '', '']);
  out.push(['', '', '', '', '']);
  out.push(['NGƯỜI GIAO HÀNG', '', 'THỦ KHO / KCS', '', 'KẾ TOÁN']);
  out.push(['(Ký, ghi rõ họ tên)', '', '(Ký, ghi rõ họ tên)', '', '(Ký, ghi rõ họ tên)']);

  sh.getRange(1, 1, out.length, 5).setValues(out);

  // Định dạng
  sh.getRange('A1:E1').merge().setFontSize(12).setFontWeight('bold').setHorizontalAlignment('center');
  sh.getRange('A2:E2').merge().setHorizontalAlignment('center').setFontSize(9);
  sh.getRange('A3:E3').merge().setHorizontalAlignment('center').setFontColor('#666666').setFontSize(9);
  sh.getRange('A4:E4').merge().setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center');
  var headRow = 9;
  sh.getRange(headRow, 1, 1, 5).setFontWeight('bold').setBackground('#d9e1f2').setHorizontalAlignment('center');
  sh.getRange(headRow, 1, rows.length + 3, 5).setBorder(true, true, true, true, true, true);
  sh.getRange(headRow + rows.length + 1, 2, 2, 1).setFontWeight('bold');
  sh.getRange(1, 4, out.length, 2).setNumberFormat('#,##0');
  var signRow = out.length - 1;
  sh.getRange(signRow, 1, 1, 5).setFontWeight('bold').setHorizontalAlignment('center');
  sh.getRange(signRow + 1, 1, 1, 5).setHorizontalAlignment('center').setFontStyle('italic').setFontColor('#666666');
  sh.setColumnWidth(1, 60); sh.setColumnWidth(2, 260); sh.setColumnWidth(3, 70);
  sh.setColumnWidth(4, 110); sh.setColumnWidth(5, 140);
  SpreadsheetApp.flush();

  return _exportSheetToPdf(sh, (laNhap ? 'PhieuNhapKho_' : 'PhieuXuatKho_') + soPhieu.replace(/[^0-9A-Za-z]/g, ''));
}

/** Xuất 1 sheet ra PDF, lưu vào thư mục Drive, trả URL */
function _exportSheetToPdf(sheet, fileName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var url = 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/export?format=pdf' +
    '&gid=' + sheet.getSheetId() +
    '&portrait=true&fitw=true&gridlines=false&printtitle=false&sheetnames=false&pagenumbers=false' +
    '&top_margin=0.50&bottom_margin=0.50&left_margin=0.50&right_margin=0.50';
  var resp = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } });
  var blob = resp.getBlob().setName(fileName + '.pdf');
  var folder = _getOrCreateFolder(CONFIG.FOLDER_PDF);
  var existing = folder.getFilesByName(fileName + '.pdf');
  while (existing.hasNext()) existing.next().setTrashed(true); // ghi đè bản cũ
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function _getOrCreateFolder(name) {
  var it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}
