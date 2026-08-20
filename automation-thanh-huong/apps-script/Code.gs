/*************************************************************
 *  MINI APP THẠNH HƯƠNG  —  Google Apps Script (miễn phí)
 *  Giao diện kiểu ỨNG DỤNG: bấm nút, bot hỏi từng bước,
 *  xem lại thẻ dữ liệu rồi bấm Lưu. Không cần nhớ cú pháp.
 *************************************************************/

// ============ CẤU HÌNH — ĐIỀN 2 Ô NÀY ============
const BOT_TOKEN  = 'DAN_TOKEN_BOT_VAO_DAY';
const GEMINI_KEY = 'DAN_KHOA_GEMINI_AQ_VAO_DAY';

const SHEET_CCCD = '1NVaYQypE11CB0r3aK7C1EE2pr4hR13YLvnLxxRS03x0'; const TAB_CCCD = 'CCCD_DATA';
const SHEET_CAN  = '1hg_fTt3wnlOyCkW-u1OqBRQDR9lmMclt_oChHtPPh1s'; const TAB_CAN  = 'PHIEU_CAN';
const SHEET_MUA  = '16G_mtGe3emQwrJBEyjijLZnGpmlyuQcEFqIuUJb3D8o'; const TAB_MUA  = 'MUA_LUA';

// Nhân viên được phép (thêm ID vào đây)
const ALLOWED = [
  8594134233,   // Sếp (chủ)
];

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// Các ô có thể sửa tay
const F_CCCD = [['ho_ten','Họ và tên'],['so_cccd','Số CCCD'],['ngay_sinh','Ngày sinh'],['gioi_tinh','Giới tính'],
                ['que_quan','Quê quán'],['noi_thuong_tru','Nơi thường trú'],['ngay_cap','Ngày cấp'],['noi_cap','Nơi cấp']];
const F_CAN  = [['nguoi_ban_khach_hang','Người bán'],['loai_hang_lua','Loại hàng'],['so_xe','Số xe'],
                ['tl_xe_vao','TL xe vào'],['tl_xe_ra','TL xe ra'],['tl_hang','TL hàng'],['do_am','Độ ẩm'],['kieu_can','Kiểu cân']];
const F_MUA  = [['ten','Người bán'],['loai','Loại lúa'],['kg','Số kg'],['gia','Đơn giá']];

// ============ WEBHOOK ============
function doGet(){ return ContentService.createTextOutput('Mini App Thanh Huong dang chay ✅'); }
function doPost(e){
  try { route(JSON.parse(e.postData.contents)); } catch(err){ console.error(err); }
  return ContentService.createTextOutput('ok');
}

// ============ ĐIỀU HƯỚNG ============
function route(upd){
  if (upd.update_id){
    const c=CacheService.getScriptCache(), k='u'+upd.update_id;
    if (c.get(k)) return; c.put(k,'1',600);
  }

  // ---- Bấm nút trong thẻ (inline) ----
  if (upd.callback_query){
    const cq=upd.callback_query, chatId=cq.message.chat.id, uid=cq.from.id;
    tgApi('answerCallbackQuery',{callback_query_id:cq.id});
    if (!allowed(uid)) { send(chatId, denyText(uid)); return; }
    onButton(chatId, cq.data||'', cq.message.message_id);
    return;
  }

  const msg=upd.message; if(!msg) return;
  const chatId=msg.chat.id, uid=msg.from&&msg.from.id;
  if (!allowed(uid)) { send(chatId, denyText(uid)); return; }

  const text=(msg.text||'').trim();
  const photo=(msg.photo&&msg.photo.length) ? msg.photo[msg.photo.length-1].file_id
            : (msg.document&&(msg.document.mime_type||'').indexOf('image/')===0 ? msg.document.file_id : null);

  // ---- Ảnh gửi vào ----
  if (photo){ const st=getState(chatId); readPhoto(chatId, photo, msg.message_id, st.f==='cccd'?'cccd':'can'); return; }

  // ---- Nút dưới bàn phím (thanh điều hướng) ----
  if (/^\/?start\b/i.test(text) || text.indexOf('🏠')>=0) { clearState(chatId); showHome(chatId); return; }
  if (text.indexOf('🪪')>=0) { startCCCD(chatId); return; }
  if (text.indexOf('⚖️')>=0) { startCan(chatId); return; }
  if (text.indexOf('🌾')>=0) { startMua(chatId); return; }
  if (text.indexOf('📊')>=0) { askBaoCao(chatId); return; }
  if (text.indexOf('🔎')>=0) { startTra(chatId); return; }

  // ---- Đang trong luồng hỏi-đáp: nhận câu trả lời ----
  const st=getState(chatId);
  if (st.s){ onAnswer(chatId, st, text); return; }

  showHome(chatId);
}

// ============ MÀN HÌNH CHÍNH ============
function showHome(chatId){
  send(chatId,
    '🌾 *MINI APP THẠNH HƯƠNG*\n\nChọn việc cần làm 👇',
    kbInline([
      [btn('🪪 Thêm căn cước','m:cccd'), btn('⚖️ Phiếu cân','m:can')],
      [btn('🌾 Ghi mua lúa','m:mua')],
      [btn('📊 Báo cáo','m:bc'), btn('🔎 Tra người bán','m:tra')]
    ]), true);
  // thanh điều hướng cố định dưới bàn phím
  tgApi('sendMessage',{chat_id:chatId, text:'⌨️ Thanh điều hướng đã sẵn sàng.',
    reply_markup:{keyboard:[[{text:'🪪 Căn cước'},{text:'⚖️ Phiếu cân'}],
                            [{text:'🌾 Mua lúa'},{text:'📊 Báo cáo'}],
                            [{text:'🔎 Tra cứu'},{text:'🏠 Trang chính'}]],
                  resize_keyboard:true, is_persistent:true}});
}

// ============ XỬ LÝ NÚT ============
function onButton(chatId, data, mid){
  const st=getState(chatId);

  if (data==='m:menu'){ clearState(chatId); showHome(chatId); return; }
  if (data==='m:cccd'){ startCCCD(chatId); return; }
  if (data==='m:can'){ startCan(chatId); return; }
  if (data==='m:mua'){ startMua(chatId); return; }
  if (data==='m:bc'){ askBaoCao(chatId); return; }
  if (data==='m:tra'){ startTra(chatId); return; }

  // báo cáo theo kỳ
  if (data.indexOf('bc:')===0){ doBaoCao(chatId, data.split(':')[1], mid); return; }

  // chọn từ danh sách gợi ý
  if (data.indexOf('pick:')===0){
    const v=(st.list||[])[Number(data.split(':')[1])];
    if (v!==undefined){ st.d[st.s]=v; nextStep(chatId, st); }
    return;
  }
  if (data==='pick:new'){ askStep(chatId, st, true); return; }

  // xem chi tiết người bán
  if (data.indexOf('info:')===0){
    const r=(st.list||[])[Number(data.split(':')[1])];
    if (r) send(chatId, '👤 *'+(r.ten||'')+'*\n\n🆔 CCCD: `'+(r.cccd||'-')+'`\n🎂 Ngày sinh: '+(r.ns||'-')+
      '\n🏠 Địa chỉ: '+(r.dc||'-'), kbInline([[btn('🏠 Trang chính','m:menu')]]), true);
    return;
  }

  // lưu / huỷ / sửa
  if (data==='sv'){ saveRecord(chatId, st, mid); return; }
  if (data==='cx'){ clearState(chatId); edit(chatId, mid, '❌ Đã huỷ, không lưu gì cả.', kbInline([[btn('🏠 Trang chính','m:menu')]])); return; }
  if (data==='ed'){ showEditMenu(chatId, st, mid); return; }
  if (data==='ed:back'){ showCard(chatId, st, mid); return; }
  if (data.indexOf('ed:')===0){
    const fs=fieldsOf(st.f), f=fs[Number(data.split(':')[1])];
    if (f){ st.s='@'+f[0]; st.mid=mid; setState(chatId,st); send(chatId,'✏️ Nhập lại *'+f[1]+'*:',null,true); }
    return;
  }
}

// ============ CÁC LUỒNG ============
function startCCCD(chatId){
  setState(chatId,{f:'cccd',s:'',d:{}});
  send(chatId,'🪪 *THÊM CĂN CƯỚC*\n\nHãy chụp hoặc gửi *ảnh căn cước* vào đây.\n_Mỗi người một tấm, chụp rõ và đủ 4 góc._',
    kbInline([[btn('🏠 Trang chính','m:menu')]]), true);
}
function startCan(chatId){
  setState(chatId,{f:'can',s:'',d:{}});
  send(chatId,'⚖️ *PHIẾU CÂN*\n\nHãy chụp hoặc gửi *ảnh phiếu cân* vào đây.\n_Phiếu in hay viết tay đều đọc được._',
    kbInline([[btn('🏠 Trang chính','m:menu')]]), true);
}

// --- Mua lúa: hỏi từng bước ---
function startMua(chatId){
  setState(chatId,{f:'mua',s:'ten',d:{}});
  askStep(chatId, getState(chatId));
}
function askStep(chatId, st, forceType){
  const s=st.s;
  if (s==='ten'){
    const names=recentValues(SHEET_MUA,TAB_MUA,'Người bán',6);
    st.list=names; setState(chatId,st);
    if (!forceType && names.length){
      send(chatId,'🌾 *GHI MUA LÚA*  (bước 1/4)\n\n👤 Người bán là ai?',
        kbInline(chunk(names.map((n,i)=>btn(n,'pick:'+i)),2).concat([[btn('✍️ Nhập tên khác','pick:new')],[btn('🏠 Huỷ','m:menu')]])), true);
    } else {
      send(chatId,'🌾 *GHI MUA LÚA*  (bước 1/4)\n\n👤 Gõ *tên người bán*:',null,true);
    }
    return;
  }
  if (s==='loai'){
    const kinds=uniq(recentValues(SHEET_MUA,TAB_MUA,'Loại lúa',6).concat(['OM5451','Đài Thơm 8','IR50404','ST24'])).slice(0,6);
    st.list=kinds; setState(chatId,st);
    if (!forceType){
      send(chatId,'🌾 *Bước 2/4*\n\n🌱 Loại lúa gì?',
        kbInline(chunk(kinds.map((n,i)=>btn(n,'pick:'+i)),2).concat([[btn('✍️ Nhập loại khác','pick:new')],[btn('🏠 Huỷ','m:menu')]])), true);
    } else send(chatId,'🌱 Gõ *loại lúa*:',null,true);
    return;
  }
  if (s==='kg'){ send(chatId,'🌾 *Bước 3/4*\n\n⚖️ Cân được bao nhiêu *kg*?\n_Chỉ gõ con số, ví dụ: 5200_',null,true); return; }
  if (s==='gia'){
    const prices=uniq(recentValues(SHEET_MUA,TAB_MUA,'Đơn giá',4).filter(String));
    st.list=prices; setState(chatId,st);
    if (!forceType && prices.length){
      send(chatId,'🌾 *Bước 4/4*\n\n💵 Đơn giá bao nhiêu *đồng/kg*?',
        kbInline(chunk(prices.map((n,i)=>btn(fmt(n)+' đ','pick:'+i)),2).concat([[btn('✍️ Nhập giá khác','pick:new')],[btn('🏠 Huỷ','m:menu')]])), true);
    } else send(chatId,'💵 Gõ *đơn giá* (đồng/kg):',null,true);
    return;
  }
}
function nextStep(chatId, st){
  const order=['ten','loai','kg','gia'];
  const i=order.indexOf(st.s);
  if (i>=0 && i<order.length-1){ st.s=order[i+1]; setState(chatId,st); askStep(chatId,st); }
  else { st.s=''; setState(chatId,st); showCard(chatId,st); }
}

// --- Tra cứu ---
function startTra(chatId){
  setState(chatId,{f:'tra',s:'q',d:{}});
  send(chatId,'🔎 *TRA NGƯỜI BÁN*\n\nGõ *tên* hoặc *số căn cước* cần tìm:',kbInline([[btn('🏠 Trang chính','m:menu')]]),true);
}

// --- Báo cáo ---
function askBaoCao(chatId){
  clearState(chatId);
  send(chatId,'📊 *BÁO CÁO*\n\nXem số liệu của kỳ nào?',
    kbInline([[btn('📅 Hôm nay','bc:d'),btn('🗓 Tuần này','bc:w')],[btn('📆 Tháng này','bc:m')],[btn('🏠 Trang chính','m:menu')]]),true);
}

// ============ NHẬN CÂU TRẢ LỜI ============
function onAnswer(chatId, st, text){
  // đang sửa 1 ô
  if (st.s.charAt(0)==='@'){
    const key=st.s.substring(1);
    st.d[key]=text; st.s=''; setState(chatId,st);
    showCard(chatId, st, st.mid); return;
  }
  if (st.f==='tra'){ doTra(chatId, text); return; }
  if (st.f==='mua'){
    if (st.s==='kg' || st.s==='gia'){
      const n=Number(text.replace(/[^0-9.]/g,''));
      if (!n){ send(chatId,'⚠️ Chưa đúng. Hãy gõ *con số*, ví dụ: '+(st.s==='kg'?'5200':'8200'),null,true); return; }
      st.d[st.s]=n;
    } else st.d[st.s]=text;
    setState(chatId,st); nextStep(chatId,st); return;
  }
}

// ============ ĐỌC ẢNH ============
function readPhoto(chatId, fileId, msgId, kind){
  const wait=send(chatId, kind==='cccd' ? '⏳ Đang đọc căn cước...' : '⏳ Đang đọc phiếu cân...');
  const img=tgFile(fileId);
  const d=parseJson(gemini(kind==='cccd'?PROMPT_CCCD:PROMPT_CAN, img.b64, img.mime));
  if (kind==='can'){
    const vao=num(d.tl_xe_vao), ra=num(d.tl_xe_ra);
    if (num(d.tl_hang)===null && vao!==null && ra!==null) d.tl_hang=Math.abs(vao-ra);
  }
  const st={f:kind, s:'', d:d, msgId:msgId};
  setState(chatId,st);
  if (wait) tgApi('deleteMessage',{chat_id:chatId, message_id:wait});
  showCard(chatId,st);
}

// ============ THẺ XEM LẠI ============
function showCard(chatId, st, mid){
  const t=cardText(st);
  const kb=kbInline([[btn('✅ Lưu vào sổ','sv')],[btn('✏️ Sửa lại','ed'),btn('❌ Bỏ','cx')]]);
  if (mid) edit(chatId,mid,t,kb); else { const id=send(chatId,t,kb,true); st.mid=id; setState(chatId,st); }
}
function cardText(st){
  const d=st.d;
  if (st.f==='cccd'){
    return '🪪 *THÔNG TIN ĐỌC ĐƯỢC*\n_Kiểm tra rồi bấm Lưu_\n\n'+
      '👤 Họ tên: *'+(d.ho_ten||'—')+'*\n🆔 Số CCCD: `'+(d.so_cccd||'—')+'`\n'+
      '🎂 Ngày sinh: '+(d.ngay_sinh||'—')+'\n⚧ Giới tính: '+(d.gioi_tinh||'—')+'\n'+
      '🌾 Quê quán: '+(d.que_quan||'—')+'\n🏠 Thường trú: '+(d.noi_thuong_tru||'—')+'\n'+
      '📅 Ngày cấp: '+(d.ngay_cap||'—')+'\n🏛 Nơi cấp: '+(d.noi_cap||'—')+flagText(st);
  }
  if (st.f==='can'){
    return '⚖️ *PHIẾU CÂN ĐỌC ĐƯỢC*\n_Kiểm tra rồi bấm Lưu_\n\n'+
      '👤 Người bán: *'+(d.nguoi_ban_khach_hang||'—')+'*\n🌱 Loại hàng: '+(d.loai_hang_lua||'—')+'\n'+
      '🚚 Số xe: '+(d.so_xe||'—')+'\n⬇️ TL xe vào: '+(d.tl_xe_vao||'—')+' kg\n⬆️ TL xe ra: '+(d.tl_xe_ra||'—')+' kg\n'+
      '📦 *TL hàng: '+(d.tl_hang||'—')+' kg*\n💧 Độ ẩm: '+(d.do_am||'—')+'\n🔄 Kiểu cân: '+(d.kieu_can||'—')+flagText(st);
  }
  const kg=Number(d.kg||0), gia=Number(d.gia||0);
  return '🌾 *PHIẾU MUA LÚA*\n_Kiểm tra rồi bấm Lưu_\n\n'+
    '👤 Người bán: *'+(d.ten||'—')+'*\n🌱 Loại lúa: '+(d.loai||'—')+'\n'+
    '⚖️ Khối lượng: '+fmt(kg)+' kg\n💵 Đơn giá: '+fmt(gia)+' đ/kg\n'+
    '━━━━━━━━━━━━━\n💰 *Thành tiền: '+fmt(kg*gia)+' đ*';
}
function flagText(st){
  const f=checkFlag(st); return f.needs ? '\n\n⚠️ _'+f.reasons.join('; ')+'_' : '';
}
function checkFlag(st){
  const d=st.d, r=[]; let needs=false;
  const low=String(d.do_tin_cay||'').toLowerCase().indexOf('th')===0;
  if (low){ needs=true; r.push('AI đọc chưa chắc chắn, nên kiểm tra lại'); }
  if (d.can_kiem_tra===true){ needs=true; if(d.ly_do_kiem_tra) r.push(d.ly_do_kiem_tra); }
  if (st.f==='cccd'){ const m=[]; if(!d.so_cccd)m.push('số CCCD'); if(!d.ho_ten)m.push('họ tên');
    if(m.length){ needs=true; r.push('Thiếu: '+m.join(', ')); } }
  if (st.f==='can'){ const v=num(d.tl_xe_vao),a=num(d.tl_xe_ra),h=num(d.tl_hang);
    if (v!==null&&a!==null&&h!==null&&Math.abs(Math.abs(v-a)-h)>Math.max(20,h*0.01)){ needs=true; r.push('Số cân bị lệch'); } }
  return {needs:needs, reasons:r};
}
function showEditMenu(chatId, st, mid){
  const fs=fieldsOf(st.f);
  const rows=chunk(fs.map((f,i)=>btn(f[1],'ed:'+i)),2);
  rows.push([btn('« Quay lại','ed:back')]);
  edit(chatId,mid,'✏️ *Chọn ô cần sửa:*',kbInline(rows));
  st.mid=mid; setState(chatId,st);
}
function fieldsOf(f){ return f==='cccd'?F_CCCD:(f==='can'?F_CAN:F_MUA); }

// ============ LƯU ============
function saveRecord(chatId, st, mid){
  const d=st.d, fl=checkFlag(st), needs=fl.needs?'CÓ':'Không', why=fl.reasons.join('; ');
  const id=st.msgId||'';
  if (st.f==='cccd'){
    sh(SHEET_CCCD,TAB_CCCD).appendRow([now(),'telegram_'+id+'.jpg','telegram-msg-'+id,
      d.so_cccd||'',d.ho_ten||'',d.ngay_sinh||'',d.gioi_tinh||'',d.quoc_tich||'',d.que_quan||'',
      d.noi_thuong_tru||'',d.co_gia_tri_den||'',d.ngay_cap||'',d.noi_cap||'',d.dac_diem_nhan_dang||'',
      d.do_tin_cay||'',needs,why]);
    edit(chatId,mid,'✅ *ĐÃ LƯU CĂN CƯỚC*\n\n👤 '+(d.ho_ten||'')+'\n🆔 '+(d.so_cccd||''),
      kbInline([[btn('🪪 Thêm tấm nữa','m:cccd')],[btn('🏠 Trang chính','m:menu')]]));
  } else if (st.f==='can'){
    sh(SHEET_CAN,TAB_CAN).appendRow([now(),'telegram_'+id+'.jpg','telegram-msg-'+id,
      d.ngay||'',d.so_phieu||'',d.nguoi_ban_khach_hang||'',d.loai_hang_lua||'',d.so_xe||'',
      d.tl_xe_vao||'',d.tl_xe_ra||'',d.tl_hang||'',d.do_am||'',d.kieu_can||'',
      d.ghi_chu_chat_luong||'',d.nguoi_can||'',d.do_tin_cay||'',needs,why]);
    edit(chatId,mid,'✅ *ĐÃ LƯU PHIẾU CÂN*\n\n📦 '+(d.tl_hang||'?')+' kg — '+(d.loai_hang_lua||''),
      kbInline([[btn('⚖️ Cân phiếu nữa','m:can')],[btn('🏠 Trang chính','m:menu')]]));
  } else {
    const kg=Number(d.kg||0), gia=Number(d.gia||0), m=findSeller(d.ten);
    sh(SHEET_MUA,TAB_MUA).appendRow([now(), m?m.ten:d.ten, m?m.cccd:'', m?m.dc:'', d.loai||'', kg, gia, kg*gia]);
    edit(chatId,mid,'✅ *ĐÃ GHI SỔ MUA LÚA*\n\n👤 '+(m?m.ten:d.ten)+
      (m&&m.cccd?'\n🆔 '+m.cccd+' _(tự lấy từ danh bạ)_':'\n🆔 _chưa có căn cước trong danh bạ_')+
      '\n💰 *'+fmt(kg*gia)+' đ*',
      kbInline([[btn('🌾 Ghi phiếu nữa','m:mua')],[btn('🏠 Trang chính','m:menu')]]));
  }
  clearState(chatId);
}

// ============ TRA CỨU & BÁO CÁO ============
function doTra(chatId, q){
  const rows=read(SHEET_CCCD,TAB_CCCD), key=norm(q), dig=q.replace(/\D/g,'');
  const hits=rows.filter(function(r){
    const n=norm(r['Họ và tên']), c=String(r['Số CCCD']||'');
    return (dig.length>=9 && c.indexOf(dig)>=0) || (key && n && n.indexOf(key)>=0);
  }).slice(0,8).map(function(r){ return {ten:r['Họ và tên'],cccd:String(r['Số CCCD']||''),ns:r['Ngày sinh'],dc:r['Nơi thường trú']}; });

  if (!hits.length){
    send(chatId,'🔎 Không tìm thấy ai khớp *"'+q+'"*.\n\nThử gõ lại tên khác nhé.',
      kbInline([[btn('🔎 Tìm lại','m:tra')],[btn('🏠 Trang chính','m:menu')]]),true); return;
  }
  const st={f:'tra',s:'',d:{},list:hits}; setState(chatId,st);
  send(chatId,'🔎 Tìm thấy *'+hits.length+'* người. Bấm để xem chi tiết:',
    kbInline(hits.map(function(h,i){ return [btn(h.ten+' — '+h.cccd,'info:'+i)]; }).concat([[btn('🏠 Trang chính','m:menu')]])),true);
}

function doBaoCao(chatId, kind, mid){
  const rows=read(SHEET_CAN,TAB_CAN), mua=read(SHEET_MUA,TAB_MUA);
  const d=new Date(); let from, label;
  if (kind==='d'){ from=new Date(d.getFullYear(),d.getMonth(),d.getDate()); label='HÔM NAY'; }
  else if (kind==='w'){ const dow=(d.getDay()+6)%7; from=new Date(d.getFullYear(),d.getMonth(),d.getDate()-dow); label='TUẦN NÀY'; }
  else { from=new Date(d.getFullYear(),d.getMonth(),1); label='THÁNG NÀY'; }

  let so=0,kg=0,kt=0;
  rows.forEach(function(r){ if (when(r['Thời gian xử lý'])>=from){ so++; kg+=num(r['TL hàng (kg)'])||0; if(String(r['Cần kiểm tra']).toUpperCase()==='CÓ')kt++; } });
  let mkg=0,tien=0,sop=0;
  mua.forEach(function(r){ if (when(r['Thời gian'])>=from){ sop++; mkg+=num(r['Số kg'])||0; tien+=num(r['Thành tiền'])||0; } });

  const t='📊 *BÁO CÁO '+label+'*\n_Từ '+Utilities.formatDate(from,'GMT+7','dd/MM/yyyy')+'_\n\n'+
    '⚖️ *PHIẾU CÂN*\n• Số phiếu: '+so+'\n• Tổng hàng: '+fmt(kg)+' kg\n• Cần kiểm tra: '+kt+'\n\n'+
    '🌾 *MUA LÚA*\n• Số phiếu: '+sop+'\n• Khối lượng: '+fmt(mkg)+' kg\n• 💰 Tổng tiền: '+fmt(tien)+' đ';
  const kb=kbInline([[btn('📅 Hôm nay','bc:d'),btn('🗓 Tuần','bc:w'),btn('📆 Tháng','bc:m')],[btn('🏠 Trang chính','m:menu')]]);
  if (mid) edit(chatId,mid,t,kb); else send(chatId,t,kb,true);
}

// ============ TIỆN ÍCH ============
function allowed(uid){ return ALLOWED.indexOf(Number(uid))>=0; }
function denyText(uid){ return '⛔ Bạn chưa được cấp quyền dùng ứng dụng này.\n\nMã của bạn: '+uid+'\nGửi mã này cho quản lý để được mở khoá.'; }
function P(){ return PropertiesService.getScriptProperties(); }
function getState(c){ try{ return JSON.parse(P().getProperty('st_'+c)||'{}')||{}; }catch(e){ return {}; } }
function setState(c,s){ P().setProperty('st_'+c, JSON.stringify(s)); }
function clearState(c){ P().deleteProperty('st_'+c); }
function now(){ return Utilities.formatDate(new Date(),'GMT+7','yyyy-MM-dd HH:mm:ss'); }
function fmt(n){ const x=Math.round(Number(n||0)); return String(x).replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
function num(s){ if(s===null||s===undefined||s==='')return null; const n=Number(String(s).replace(/[^0-9.\-]/g,'')); return isNaN(n)?null:n; }
function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\u0111/g,'d').replace(/\s+/g,' ').trim(); }
function uniq(a){ const o=[]; a.forEach(function(x){ if(x!==''&&x!==null&&x!==undefined&&o.indexOf(x)<0)o.push(x); }); return o; }
function chunk(a,n){ const o=[]; for(let i=0;i<a.length;i+=n)o.push(a.slice(i,i+n)); return o; }
function when(v){ if (v instanceof Date) return v; const d=new Date(String(v).replace(' ','T')); return isNaN(d)?new Date(0):d; }
function sh(id,tab){ const ss=SpreadsheetApp.openById(id); return ss.getSheetByName(tab)||ss.getSheets()[0]; }
function read(id,tab){ const s=sh(id,tab), v=s.getDataRange().getValues(); if(v.length<2)return [];
  const h=v[0]; return v.slice(1).map(function(r){ const o={}; h.forEach(function(k,i){o[k]=r[i];}); return o; }); }
function recentValues(id,tab,col,n){
  const rows=read(id,tab); const out=[];
  for (let i=rows.length-1;i>=0 && out.length<n;i--){ const v=rows[i][col]; if(v!==''&&v!==undefined&&out.indexOf(String(v))<0) out.push(String(v)); }
  return out;
}
function findSeller(ten){
  const rows=read(SHEET_CCCD,TAB_CCCD), key=norm(ten), dig=String(ten).replace(/\D/g,'');
  for (let i=0;i<rows.length;i++){ const r=rows[i], n=norm(r['Họ và tên']), c=String(r['Số CCCD']||'');
    if (dig.length>=9 && c===dig) return {ten:r['Họ và tên'],cccd:c,dc:r['Nơi thường trú']};
    if (key && n && (n.indexOf(key)>=0 || key.indexOf(n)>=0)) return {ten:r['Họ và tên'],cccd:c,dc:r['Nơi thường trú']}; }
  return null;
}
function parseJson(t){ if(!t)return {}; let c=String(t).trim().replace(/^```json/i,'').replace(/^```/,'').replace(/```$/,'').trim();
  try{ return JSON.parse(c); }catch(e){ return {}; } }

// ---- Telegram ----
function btn(t,d){ return {text:t, callback_data:d}; }
function kbInline(rows){ return {inline_keyboard:rows}; }
function tgApi(m,p){ return UrlFetchApp.fetch('https://api.telegram.org/bot'+BOT_TOKEN+'/'+m,
  {method:'post',contentType:'application/json',payload:JSON.stringify(p),muteHttpExceptions:true}); }
function send(chatId,text,kb,md){
  const p={chat_id:chatId,text:text}; if(kb)p.reply_markup=kb; if(md)p.parse_mode='Markdown';
  let r=tgApi('sendMessage',p);
  if (r.getResponseCode()!==200 && md){            // Markdown lỗi -> gửi lại dạng chữ thường
    delete p.parse_mode; p.text=plain(text); r=tgApi('sendMessage',p);
  }
  try{ return JSON.parse(r.getContentText()).result.message_id; }catch(e){ return null; }
}
function plain(t){ return String(t).replace(/[*`_]/g,''); }
function edit(chatId,mid,text,kb){
  if(!mid){ send(chatId,text,kb,true); return; }
  const p={chat_id:chatId,message_id:mid,text:text,parse_mode:'Markdown'}; if(kb)p.reply_markup=kb;
  let r=tgApi('editMessageText',p);
  if (r.getResponseCode()!==200){
    delete p.parse_mode; p.text=plain(text); r=tgApi('editMessageText',p);
    if (r.getResponseCode()!==200) send(chatId,text,kb,true);
  }
}
function tgFile(fileId){
  const j=JSON.parse(tgApi('getFile',{file_id:fileId}).getContentText());
  const b=UrlFetchApp.fetch('https://api.telegram.org/file/bot'+BOT_TOKEN+'/'+j.result.file_path,{muteHttpExceptions:true}).getBlob();
  return {b64:Utilities.base64Encode(b.getBytes()), mime:b.getContentType()||'image/jpeg'};
}
function gemini(prompt,b64,mime){
  const body={contents:[{parts:[{text:prompt},{inline_data:{mime_type:mime,data:b64}}]}],
              generationConfig:{temperature:0,response_mime_type:'application/json'}};
  const r=UrlFetchApp.fetch(GEMINI_URL+'?key='+encodeURIComponent(GEMINI_KEY),
    {method:'post',contentType:'application/json',payload:JSON.stringify(body),muteHttpExceptions:true});
  try{ return JSON.parse(r.getContentText()).candidates[0].content.parts[0].text; }catch(e){ return ''; }
}

// ============ CÀI WEBHOOK (chạy 1 lần sau khi Deploy) ============
function setWebhook(){
  const url=ScriptApp.getService().getUrl();
  Logger.log('Web app URL: '+url);
  if (url && url.slice(-4)!=='exec'){ Logger.log('⚠️ URL không kết thúc bằng /exec → dùng hàm setWebhookManual.'); return; }
  Logger.log(tgApi('setWebhook',{url:url, drop_pending_updates:true, allowed_updates:['message','callback_query']}).getContentText());
}
function setWebhookManual(){
  const URL_EXEC='DAN_URL_EXEC_VAO_DAY';
  if (URL_EXEC.indexOf('http')!==0){ Logger.log('❌ Chưa dán URL /exec.'); return; }
  Logger.log(tgApi('setWebhook',{url:URL_EXEC, drop_pending_updates:true, allowed_updates:['message','callback_query']}).getContentText());
}
function deleteWebhook(){ Logger.log(tgApi('deleteWebhook',{}).getContentText()); }
function webhookInfo(){ Logger.log(tgApi('getWebhookInfo',{}).getContentText()); }

// ============ PROMPT ============
const PROMPT_CCCD='Bạn là trợ lý nhập liệu. Ảnh là CĂN CƯỚC CÔNG DÂN (CCCD) Việt Nam - mặt trước, mặt sau hoặc cả hai. Đọc kỹ, trích xuất TẤT CẢ thông tin. CHỈ TRẢ VỀ 1 object JSON: {"so_cccd":"số 12 chữ số hoặc CMND cũ","ho_ten":"họ tên VIẾT HOA","ngay_sinh":"DD/MM/YYYY","gioi_tinh":"Nam/Nữ","quoc_tich":"","que_quan":"đầy đủ","noi_thuong_tru":"đầy đủ","co_gia_tri_den":"","ngay_cap":"","noi_cap":"","dac_diem_nhan_dang":"","do_tin_cay":"cao|trung bình|thấp","can_kiem_tra":true/false,"ly_do_kiem_tra":""}. Trường không thấy để rỗng. Không bịa.';
const PROMPT_CAN='Bạn là trợ lý kế toán đọc PHIẾU CÂN của nhà máy xay xát gạo. Ảnh có thể là phiếu IN hoặc VIẾT TAY. Đọc kỹ kể cả chữ tay và phép tính. CHỈ TRẢ VỀ 1 object JSON: {"ngay":"DD/MM/YYYY","so_phieu":"","nguoi_ban_khach_hang":"","loai_hang_lua":"","so_xe":"","tl_xe_vao":"kg","tl_xe_ra":"kg","tl_hang":"kg","do_am":"","kieu_can":"NHẬP/XUẤT","ghi_chu_chat_luong":"","nguoi_can":"","do_tin_cay":"cao|trung bình|thấp","can_kiem_tra":true/false,"ly_do_kiem_tra":""}. Trường không có để rỗng. Số cân chỉ ghi con số, không kèm kg, không dấu phẩy nghìn.';
