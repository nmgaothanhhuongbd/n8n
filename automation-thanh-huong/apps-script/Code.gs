/*************************************************************
 *  MINI APP THẠNH HƯƠNG — chạy trên Google Apps Script (miễn phí)
 *  Telegram → Gemini đọc ảnh → ghi Google Sheet
 *  CCCD · Phiếu cân · Mua lúa · Báo cáo · Tra người bán · Chặn người lạ
 *************************************************************/

// ============ CẤU HÌNH — ĐIỀN 2 Ô NÀY ============
const BOT_TOKEN  = 'DAN_TOKEN_BOT_VAO_DAY';          // Token bot Telegram (BotFather cấp)
const GEMINI_KEY = 'DAN_KHOA_GEMINI_AQ_VAO_DAY';     // Khóa Gemini (AQ... hoặc AIza...)

// ---- Sheet & tab (đã có sẵn, không cần đổi) ----
const SHEET_CCCD = '1NVaYQypE11CB0r3aK7C1EE2pr4hR13YLvnLxxRS03x0'; const TAB_CCCD = 'CCCD_DATA';
const SHEET_CAN  = '1hg_fTt3wnlOyCkW-u1OqBRQDR9lmMclt_oChHtPPh1s'; const TAB_CAN  = 'PHIEU_CAN';
const SHEET_MUA  = '16G_mtGe3emQwrJBEyjijLZnGpmlyuQcEFqIuUJb3D8o'; const TAB_MUA  = 'MUA_LUA';

// ---- Nhân viên được phép (thêm ID vào đây, mỗi người 1 dòng) ----
const ALLOWED = [
  8594134233,   // Sếp (chủ)
];

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// ============ WEBHOOK ============
function doGet()  { return ContentService.createTextOutput('Mini App Thanh Huong dang chay ✅'); }
function doPost(e){
  try { handleUpdate(JSON.parse(e.postData.contents)); }
  catch (err) { console.error(err); }
  return ContentService.createTextOutput('ok');
}

// ============ ĐỊNH TUYẾN ============
function handleUpdate(upd){
  // chống xử lý trùng khi Telegram gửi lại
  if (upd.update_id) {
    const c = CacheService.getScriptCache(); const k = 'u' + upd.update_id;
    if (c.get(k)) return; c.put(k, '1', 600);
  }
  const msg = upd.message; if (!msg) return;
  const chatId = msg.chat.id;
  const userId = msg.from && msg.from.id;

  // 🔒 chặn người lạ
  if (ALLOWED.indexOf(Number(userId)) < 0) {
    tgSend(chatId, '⛔ Bạn chưa được cấp quyền dùng bot này.\nMã của bạn: ' + userId + '\nGửi mã này cho quản lý để được thêm vào.');
    return;
  }

  const text = (msg.text || '').trim();
  const low  = text.toLowerCase();
  const has  = s => text.indexOf(s) >= 0;
  const photo = (msg.photo && msg.photo.length) ? msg.photo[msg.photo.length - 1].file_id
              : (msg.document && (msg.document.mime_type || '').indexOf('image/') === 0 ? msg.document.file_id : null);

  if (/^\/?start\b/i.test(text) || has('🏠') || low === 'menu') { sendMenu(chatId); return; }
  if (has('🪪') || /^(cccd|căn cước|can cuoc)\b/i.test(low)) { setMode(chatId,'cccd'); tgSend(chatId,'🪪 Đã bật chế độ CCCD. Gửi ẢNH căn cước ngay bây giờ.'); return; }
  if (has('⚖️') || /^(phiếu cân|phieu can|cân|can)\b/i.test(low)) { setMode(chatId,'can'); tgSend(chatId,'⚖️ Đã bật chế độ Phiếu cân. Gửi ẢNH phiếu cân ngay bây giờ.'); return; }
  if (/^mua\b/i.test(low) && has('|')) { handleMua(chatId, text); return; }
  if (has('🌾') || /^mua\b/i.test(low)) { tgSend(chatId, MUA_HELP); return; }
  if (has('📊') || /^(bc|báo cáo|bao cao)\b/i.test(low)) { handleBaoCao(chatId); return; }
  if (/^ai\b/i.test(low)) { handleTra(chatId, text.replace(/^ai\s*/i,'').trim()); return; }
  if (photo) { getMode(chatId) === 'cccd' ? handleCCCD(chatId, photo, msg.message_id) : handleCan(chatId, photo, msg.message_id); return; }
  sendMenu(chatId);
}

// ============ CHỨC NĂNG ============
function handleCCCD(chatId, fileId, msgId){
  tgSend(chatId, '⏳ Đang đọc căn cước, chờ chút...');
  const img = tgFileBase64(fileId);
  const d = parseJson(gemini(PROMPT_CCCD, img.b64, img.mime));
  const missing = [];
  if (!d.so_cccd) missing.push('số CCCD');
  if (!d.ho_ten) missing.push('họ tên');
  const lowConf = String(d.do_tin_cay||'').toLowerCase().indexOf('th') === 0; // thấp
  const needs = !!(missing.length || lowConf || d.can_kiem_tra === true);
  const reasons = [];
  if (missing.length) reasons.push('Thiếu/khó đọc: ' + missing.join(', '));
  if (lowConf) reasons.push('AI báo độ tin cậy thấp');
  if (d.can_kiem_tra === true && d.ly_do_kiem_tra) reasons.push(d.ly_do_kiem_tra);

  sheet(SHEET_CCCD, TAB_CCCD).appendRow([
    nowStr(), 'telegram_' + msgId + '.jpg', 'telegram-msg-' + msgId,
    d.so_cccd||'', d.ho_ten||'', d.ngay_sinh||'', d.gioi_tinh||'', d.quoc_tich||'',
    d.que_quan||'', d.noi_thuong_tru||'', d.co_gia_tri_den||'', d.ngay_cap||'', d.noi_cap||'',
    d.dac_diem_nhan_dang||'', d.do_tin_cay||'', needs?'CÓ':'Không', reasons.join('; ')
  ]);
  tgSend(chatId, '✅ Đã lưu CCCD:\n• Họ tên: ' + (d.ho_ten||'(chưa rõ)') +
    '\n• Số CCCD: ' + (d.so_cccd||'?') + '\n• Địa chỉ: ' + (d.noi_thuong_tru||'-') +
    '\n• Cần kiểm tra: ' + (needs?'CÓ':'Không') + (reasons.length ? '\n⚠️ ' + reasons.join('; ') : ''));
}

function handleCan(chatId, fileId, msgId){
  tgSend(chatId, '⏳ Đang đọc phiếu cân, chờ chút...');
  const img = tgFileBase64(fileId);
  const d = parseJson(gemini(PROMPT_CAN, img.b64, img.mime));
  const num = s => { if (s===null||s===undefined||s==='') return null; const n=Number(String(s).replace(/[^0-9.\-]/g,'')); return isNaN(n)?null:n; };
  const vao=num(d.tl_xe_vao), ra=num(d.tl_xe_ra); let hang=num(d.tl_hang);
  if (hang===null && vao!==null && ra!==null) hang=Math.abs(vao-ra);
  let mathOk=true, mathNote='';
  if (vao!==null && ra!==null && hang!==null && Math.abs(Math.abs(vao-ra)-hang) > Math.max(20, hang*0.01)) { mathOk=false; mathNote='Lệch cân'; }
  const lowConf = String(d.do_tin_cay||'').toLowerCase().indexOf('th') === 0;
  const needs = !!(!mathOk || lowConf || d.can_kiem_tra === true);
  const reasons=[]; if(!mathOk)reasons.push(mathNote); if(lowConf)reasons.push('AI báo độ tin cậy thấp'); if(d.can_kiem_tra===true && d.ly_do_kiem_tra)reasons.push(d.ly_do_kiem_tra);

  sheet(SHEET_CAN, TAB_CAN).appendRow([
    nowStr(), 'telegram_'+msgId+'.jpg', 'telegram-msg-'+msgId,
    d.ngay||'', d.so_phieu||'', d.nguoi_ban_khach_hang||'', d.loai_hang_lua||'', d.so_xe||'',
    vao!==null?vao:'', ra!==null?ra:'', hang!==null?hang:'', d.do_am||'', d.kieu_can||'',
    d.ghi_chu_chat_luong||'', d.nguoi_can||'', d.do_tin_cay||'', needs?'CÓ':'Không', reasons.join('; ')
  ]);
  tgSend(chatId, '✅ Đã ghi phiếu cân:\n• Loại hàng: ' + (d.loai_hang_lua||'(chưa rõ)') +
    '\n• TL hàng: ' + (hang!==null?hang:'?') + ' kg\n• Số xe: ' + (d.so_xe||'-') +
    '\n• Cần kiểm tra: ' + (needs?'CÓ':'Không') + (reasons.length ? '\n⚠️ ' + reasons.join('; ') : ''));
}

function handleMua(chatId, raw){
  const p = raw.replace(/^mua\s*[:|]?\s*/i,'').split('|').map(s=>s.trim());
  const ten=p[0]||'', loai=p[1]||'';
  const kg=Number(String(p[2]||'').replace(/[^0-9.]/g,''))||0;
  const gia=Number(String(p[3]||'').replace(/[^0-9.]/g,''))||0;
  const tt=kg*gia;
  const m=lookupSeller(ten);
  sheet(SHEET_MUA, TAB_MUA).appendRow([ nowStr(), (m?m.hoten:ten), (m?m.cccd:''), (m?m.diachi:''), loai, kg, gia, tt ]);
  tgSend(chatId, '✅ Đã ghi sổ MUA LÚA:\n• Người bán: ' + (m?m.hoten:ten) +
    '\n• Số CCCD: ' + ((m&&m.cccd)||'(chưa có trong danh bạ)') +
    '\n• Địa chỉ: ' + ((m&&m.diachi)||'-') + '\n• Loại lúa: ' + (loai||'-') +
    '\n• Khối lượng: ' + kg + ' kg × ' + gia + ' đ\n• 💰 Thành tiền: ' + fmt(tt) + ' đ');
}

function handleTra(chatId, q){
  if (!q) { tgSend(chatId, 'Gõ:  ai Tên  hoặc  ai Số_CCCD  để tra người bán.'); return; }
  const rows = readSheet(SHEET_CCCD, TAB_CCCD);
  const key = norm(q); const digits = q.replace(/\D/g,'');
  const hits = rows.filter(r => {
    const name = norm(r['Họ và tên']); const cccd = String(r['Số CCCD']||'');
    return (digits.length>=9 && cccd.indexOf(digits)>=0) || (key && name && name.indexOf(key)>=0);
  }).slice(0,5);
  if (!hits.length) { tgSend(chatId, '🔎 Không tìm thấy người bán khớp "' + q + '".'); return; }
  const t = '🔎 Tìm thấy ' + hits.length + ' người:\n\n' + hits.map(h =>
    '👤 ' + (h['Họ và tên']||'') + '\n• CCCD: ' + (h['Số CCCD']||'-') +
    '\n• Ngày sinh: ' + (h['Ngày sinh']||'-') + '\n• Địa chỉ: ' + (h['Nơi thường trú']||'-')).join('\n\n');
  tgSend(chatId, t);
}

function handleBaoCao(chatId){
  const rows = readSheet(SHEET_CAN, TAB_CAN);
  const today = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd');
  let so=0, kg=0, kt=0;
  rows.forEach(r => {
    let t = r['Thời gian xử lý'];
    t = (t instanceof Date) ? Utilities.formatDate(t,'GMT+7','yyyy-MM-dd') : String(t||'');
    if (t.indexOf(today) >= 0) {
      so++;
      kg += Number(String(r['TL hàng (kg)']||'').replace(/[^0-9.]/g,'')) || 0;
      if (String(r['Cần kiểm tra']).toUpperCase() === 'CÓ') kt++;
    }
  });
  tgSend(chatId, '📊 BÁO CÁO HÔM NAY (' + Utilities.formatDate(new Date(),'GMT+7','dd/MM/yyyy') + ')\n\n' +
    '⚖️ Phiếu cân: ' + so + ' phiếu\n📦 Tổng khối lượng: ' + fmt(kg) + ' kg\n⚠️ Cần kiểm tra: ' + kt + ' phiếu');
}

// ============ TIỆN ÍCH ============
function setMode(chatId, m){ PropertiesService.getScriptProperties().setProperty('mode_'+chatId, m); }
function getMode(chatId){ return PropertiesService.getScriptProperties().getProperty('mode_'+chatId) || 'can'; }
function nowStr(){ return Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss'); }
function fmt(n){ const x=Math.round(Number(n||0)); return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function norm(s){ return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/\s+/g,' ').toLowerCase().trim(); }
function sheet(id, tab){ const ss=SpreadsheetApp.openById(id); return ss.getSheetByName(tab) || ss.getSheets()[0]; }
function readSheet(id, tab){
  const sh=sheet(id, tab); const v=sh.getDataRange().getValues(); if (v.length<2) return [];
  const head=v[0]; return v.slice(1).map(row => { const o={}; head.forEach((h,i)=>o[h]=row[i]); return o; });
}
function lookupSeller(ten){
  const rows=readSheet(SHEET_CCCD, TAB_CCCD); const key=norm(ten); const digits=String(ten).replace(/\D/g,'');
  for (const r of rows){
    const name=norm(r['Họ và tên']); const cccd=String(r['Số CCCD']||'');
    if (digits.length>=9 && cccd===digits) return {hoten:r['Họ và tên'], cccd:cccd, diachi:r['Nơi thường trú']};
    if (key && name && (name.indexOf(key)>=0 || key.indexOf(name)>=0)) return {hoten:r['Họ và tên'], cccd:cccd, diachi:r['Nơi thường trú']};
  }
  return null;
}
function parseJson(t){ if(!t) return {}; let c=String(t).trim().replace(/^```json/i,'').replace(/^```/,'').replace(/```$/,'').trim(); try{ return JSON.parse(c); }catch(e){ return {}; } }

// ---- Telegram API ----
function tgApi(method, payload){
  return UrlFetchApp.fetch('https://api.telegram.org/bot'+BOT_TOKEN+'/'+method,
    { method:'post', contentType:'application/json', payload:JSON.stringify(payload), muteHttpExceptions:true });
}
function tgSend(chatId, text, keyboard){ const p={chat_id:chatId, text:text}; if(keyboard) p.reply_markup=keyboard; tgApi('sendMessage', p); }
function sendMenu(chatId){
  tgSend(chatId, '🌾 MINI APP THẠNH HƯƠNG\nBấm nút bên dưới để dùng 👇\n(Đóng bàn phím chữ nếu chưa thấy nút)',
    { keyboard:[[{text:'🪪 Thêm CCCD'},{text:'⚖️ Phiếu cân'}],[{text:'🌾 Mua lúa'},{text:'📊 Báo cáo'}]], resize_keyboard:true, is_persistent:true });
}
function tgFileBase64(fileId){
  const j = JSON.parse(tgApi('getFile', {file_id:fileId}).getContentText());
  const path = j.result.file_path;
  const blob = UrlFetchApp.fetch('https://api.telegram.org/file/bot'+BOT_TOKEN+'/'+path, {muteHttpExceptions:true}).getBlob();
  return { b64: Utilities.base64Encode(blob.getBytes()), mime: blob.getContentType() || 'image/jpeg' };
}

// ---- Gemini ----
function gemini(prompt, b64, mime){
  const body = { contents:[{ parts:[ {text:prompt}, {inline_data:{mime_type:mime, data:b64}} ] }],
                 generationConfig:{ temperature:0, response_mime_type:'application/json' } };
  const r = UrlFetchApp.fetch(GEMINI_URL + '?key=' + encodeURIComponent(GEMINI_KEY),
    { method:'post', contentType:'application/json', payload:JSON.stringify(body), muteHttpExceptions:true });
  try { return JSON.parse(r.getContentText()).candidates[0].content.parts[0].text; }
  catch (e) { return ''; }
}

// ============ CÀI WEBHOOK (chạy 1 lần sau khi Deploy) ============
// Cách 1: tự lấy URL (nhanh). Nếu log báo URL kết thúc bằng /dev -> dùng Cách 2.
function setWebhook(){
  const url = ScriptApp.getService().getUrl();
  Logger.log('Web app URL: ' + url);
  if (url && url.slice(-4) !== 'exec') {
    Logger.log('⚠️ URL này KHÔNG kết thúc bằng /exec. Hãy dùng hàm setWebhookManual: copy URL trong hộp thoại Deploy dán vào biến URL_EXEC.');
    return;
  }
  Logger.log(tgApi('setWebhook', { url: url, drop_pending_updates: true }).getContentText());
}

// Cách 2: dán tay URL /exec lấy từ hộp thoại Deploy (chắc ăn nhất)
function setWebhookManual(){
  const URL_EXEC = 'DAN_URL_EXEC_VAO_DAY';   // dạng https://script.google.com/macros/s/..../exec
  if (URL_EXEC.indexOf('http') !== 0) { Logger.log('❌ Chưa dán URL /exec vào biến URL_EXEC.'); return; }
  Logger.log(tgApi('setWebhook', { url: URL_EXEC, drop_pending_updates: true }).getContentText());
}
function deleteWebhook(){ Logger.log(tgApi('deleteWebhook', {}).getContentText()); }
function webhookInfo(){ Logger.log(tgApi('getWebhookInfo', {}).getContentText()); }

// ============ PROMPT ============
const MUA_HELP = '🌾 Ghi mua lúa — gõ theo mẫu (ngăn bằng dấu |):\nmua | Tên người bán | Loại lúa | Số kg | Đơn giá\n\nVí dụ:\nmua | Diệp Thành Hòa | OM5451 | 5200 | 8200\n\n🔎 Tra người bán: gõ  ai Tên  hoặc  ai Số_CCCD';

const PROMPT_CCCD = 'Bạn là trợ lý nhập liệu. Ảnh là CĂN CƯỚC CÔNG DÂN (CCCD) Việt Nam - mặt trước, mặt sau hoặc cả hai. Đọc kỹ, trích xuất TẤT CẢ thông tin. CHỈ TRẢ VỀ 1 object JSON: {"so_cccd":"số 12 chữ số hoặc CMND cũ","ho_ten":"họ tên VIẾT HOA","ngay_sinh":"DD/MM/YYYY","gioi_tinh":"Nam/Nữ","quoc_tich":"","que_quan":"đầy đủ","noi_thuong_tru":"đầy đủ","co_gia_tri_den":"","ngay_cap":"","noi_cap":"","dac_diem_nhan_dang":"","do_tin_cay":"cao|trung bình|thấp","can_kiem_tra":true/false,"ly_do_kiem_tra":""}. Trường không thấy để rỗng. Không bịa.';

const PROMPT_CAN = 'Bạn là trợ lý kế toán đọc PHIẾU CÂN của nhà máy xay xát gạo. Ảnh có thể là phiếu IN hoặc VIẾT TAY. Đọc kỹ kể cả chữ tay và phép tính. CHỈ TRẢ VỀ 1 object JSON: {"ngay":"DD/MM/YYYY","so_phieu":"","nguoi_ban_khach_hang":"","loai_hang_lua":"","so_xe":"","tl_xe_vao":"kg","tl_xe_ra":"kg","tl_hang":"kg","do_am":"","kieu_can":"NHẬP/XUẤT","ghi_chu_chat_luong":"","nguoi_can":"","do_tin_cay":"cao|trung bình|thấp","can_kiem_tra":true/false,"ly_do_kiem_tra":""}. Trường không có để rỗng. Số cân chỉ ghi con số, không kèm kg, không dấu phẩy nghìn.';
