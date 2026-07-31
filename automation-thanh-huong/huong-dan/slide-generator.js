const pptxgen = require('pptxgenjs');
const p = new pptxgen();
p.defineLayout({ name:'W', width:13.33, height:7.5 });
p.layout = 'W';

// ===== Palette (xanh lá + vàng lúa) =====
const GREEN='1E4D2B', GREEN2='2E7D46', MOSS='6FA86A', GOLD='E0A83B', GOLDD='B9832B';
const INK='1B2A20', GRAY='5E6B60', WHITE='FFFFFF', MIST='EFF4EE', MISTG='FBF3DD';
const HF='Cambria', BF='Calibri';
const W=13.33, H=7.5, M=0.7;
const LOGO='/tmp/claude-0/-home-user-n8n/e6b51ae7-6c99-5683-8277-7db523f0061c/scratchpad/huongdan/logo.png';

const shadow=()=>({type:'outer',color:'8AA090',blur:9,offset:3,angle:90,opacity:0.35});
function card(s,x,y,w,h,fill,radius=0.14){ s.addShape(p.ShapeType.roundRect,{x,y,w,h,fill:{color:fill},line:{type:'none'},rectRadius:radius,shadow:shadow()}); }
function circle(s,x,y,d,fill,txt,tcolor,fs){ s.addShape(p.ShapeType.ellipse,{x,y,w:d,h:d,fill:{color:fill},line:{type:'none'}}); if(txt!=null) s.addText(txt,{x,y,w:d,h:d,align:'center',valign:'middle',fontFace:HF,bold:true,fontSize:fs||18,color:tcolor||WHITE}); }
function kicker(s,txt,x,y){ s.addText(txt.toUpperCase(),{x,y,w:8,h:0.35,fontFace:BF,bold:true,fontSize:13,color:GOLDD,charSpacing:2}); }
function title(s,txt,x,y,w,color){ s.addText(txt,{x,y:y,w:w||11.9,h:0.9,fontFace:HF,bold:true,fontSize:34,color:color||GREEN}); }
function footer(s,n){ s.addText([{text:'Mini App Thạnh Hương',options:{color:GRAY}},{text:'   •   Nhà máy Xay xát Gạo Thạnh Hương',options:{color:'A8B3AB'}}],{x:M,y:7.05,w:9,h:0.3,fontFace:BF,fontSize:9}); if(n) s.addText(String(n),{x:W-1.1,y:7.02,w:0.5,h:0.3,align:'right',fontFace:BF,fontSize:10,color:GRAY}); }

// ============ SLIDE 1 — TITLE ============
let s=p.addSlide(); s.background={color:GREEN};
s.addShape(p.ShapeType.ellipse,{x:9.8,y:-2.2,w:6.2,h:6.2,fill:{color:GREEN2},line:{type:'none'}});
s.addShape(p.ShapeType.ellipse,{x:11.4,y:4.2,w:4.6,h:4.6,fill:{color:'234E31'},line:{type:'none'}});
s.addImage({path:LOGO,x:0.7,y:0.5,w:1.6,h:1.6});
s.addText('SỔ TAY HƯỚNG DẪN',{x:0.75,y:2.05,w:11,h:0.7,fontFace:BF,bold:true,fontSize:22,color:GOLD,charSpacing:3});
s.addText('MINI APP THẠNH HƯƠNG',{x:0.7,y:2.6,w:12,h:1.5,fontFace:HF,bold:true,fontSize:52,color:WHITE});
s.addText('Trợ lý Telegram giúp nhập liệu tự động: đọc căn cước, phiếu cân,\nghi sổ mua lúa — chỉ bằng cách chụp ảnh và bấm nút.',{x:0.75,y:4.15,w:9.5,h:1.0,fontFace:BF,fontSize:16,color:'D9E6DC',lineSpacingMultiple:1.15});
s.addShape(p.ShapeType.roundRect,{x:0.75,y:5.5,w:5.2,h:0.75,fill:{color:GOLD},line:{type:'none'},rectRadius:0.1});
s.addText('📘  Tài liệu hướng dẫn nhân viên',{x:0.75,y:5.5,w:5.2,h:0.75,align:'center',valign:'middle',fontFace:BF,bold:true,fontSize:14,color:INK});
s.addText('CÔNG TY TNHH TM DV XNK THÀNH HƯNG',{x:0.75,y:6.3,w:11,h:0.35,fontFace:BF,bold:true,fontSize:13,color:GOLD,charSpacing:1});
s.addText('Nhà máy Xay xát Gạo Thạnh Hương',{x:0.75,y:6.68,w:9,h:0.3,fontFace:BF,fontSize:11.5,color:'AFC3B4'});
s.addText([{text:'Người thực hiện: ',options:{color:'AFC3B4'}},{text:'Phan Tấn Phương',options:{color:WHITE,bold:true}}],{x:0.75,y:6.98,w:9,h:0.3,fontFace:BF,fontSize:11.5});

// ============ SLIDE 2 — MINI APP LÀ GÌ ============
s=p.addSlide(); s.background={color:WHITE};
kicker(s,'Giới thiệu',M,0.55); title(s,'Mini App Thạnh Hương là gì?',M,0.9);
s.addText('Là một trợ lý chạy ngay trong Telegram. Nhân viên chỉ cần chụp ảnh giấy tờ,\nhệ thống tự đọc và ghi dữ liệu vào bảng tính — không phải nhập tay.',{x:M,y:1.85,w:12,h:0.8,fontFace:BF,fontSize:15,color:GRAY,lineSpacingMultiple:1.15});
const bens=[['⏱️','Nhanh','Chụp ảnh ~15 giây là có dữ liệu, khỏi gõ tay từng ô'],['✅','Ít sai sót','AI đọc số liệu, tự đánh dấu tấm nào cần kiểm tra lại'],['📊','Gọn gàng','Mọi dữ liệu gom về một chỗ, xem trên điện thoại mọi lúc'],['💰','Tiết kiệm','Chi phí gần như bằng 0, không tốn giấy tờ sổ sách']];
let bx=M, bw=(W-2*M-0.6)/4;
bens.forEach((b,i)=>{ const x=M+i*(bw+0.2); card(s,x,3.0,bw,3.3,MIST); circle(s,x+bw/2-0.55,3.35,1.1,GREEN,b[0],WHITE,30); s.addText(b[1],{x:x+0.1,y:4.6,w:bw-0.2,h:0.5,align:'center',fontFace:HF,bold:true,fontSize:19,color:GREEN}); s.addText(b[2],{x:x+0.25,y:5.15,w:bw-0.5,h:1.2,align:'center',fontFace:BF,fontSize:12.5,color:GRAY,lineSpacingMultiple:1.1}); });
footer(s,2);

// ============ SLIDE 3 — CHUẨN BỊ ============
s=p.addSlide(); s.background={color:WHITE};
kicker(s,'Bắt đầu',M,0.55); title(s,'Chuẩn bị — 3 bước làm 1 lần',M,0.9);
const prep=[['1','Cài Telegram','Tải app Telegram (App Store / CH Play), đăng ký bằng số điện thoại của bạn.'],['2','Mở bot & bấm START','Bấm vào đường link bot do quản lý gửi (qua Zalo), rồi bấm nút START.'],['3','Xin cấp quyền','Lần đầu bot báo "chưa được cấp quyền" kèm 1 MÃ SỐ. Gửi mã đó cho quản lý để được mở khoá.']];
let px=M, pw=(W-2*M-0.8)/3;
prep.forEach((b,i)=>{ const x=M+i*(pw+0.4); card(s,x,2.35,pw,3.7,MIST); circle(s,x+0.45,2.75,0.95,GOLD,b[0],INK,30); s.addText(b[1],{x:x+0.4,y:3.95,w:pw-0.8,h:0.6,fontFace:HF,bold:true,fontSize:20,color:GREEN}); s.addText(b[2],{x:x+0.4,y:4.6,w:pw-0.8,h:1.3,fontFace:BF,fontSize:13.5,color:GRAY,lineSpacingMultiple:1.15}); if(i<2) s.addText('→',{x:x+pw-0.05,y:3.8,w:0.5,h:0.6,align:'center',fontFace:BF,bold:true,fontSize:28,color:MOSS}); });
s.addText('💡 Xong 3 bước này là dùng mãi mãi, không phải làm lại.',{x:M,y:6.35,w:12,h:0.4,fontFace:BF,italic:true,fontSize:13.5,color:GOLDD});
footer(s,3);

// ============ SLIDE 4 — MÀN HÌNH CHÍNH & 4 NÚT ============
s=p.addSlide(); s.background={color:WHITE};
kicker(s,'Màn hình chính',M,0.55); title(s,'Gõ /start — rồi bấm 4 nút',M,0.9);
s.addText('Sau khi gõ /start, hãy ĐÓNG bàn phím chữ → 4 nút sẽ hiện sẵn ở khung nhập tin. Bấm nút là chạy, khỏi gõ lệnh.',{x:M,y:1.8,w:12,h:0.6,fontFace:BF,fontSize:14.5,color:GRAY,lineSpacingMultiple:1.1});
const btns=[['🪪','Thêm CCCD','Chụp căn cước → lưu thông tin người bán',GREEN],['⚖️','Phiếu cân','Chụp phiếu cân → ghi vào sổ cân',GREEN2],['🌾','Mua lúa','Gõ thông tin → ghi sổ mua lúa',GOLDD],['📊','Báo cáo','Xem tổng hợp trong ngày',MOSS]];
let gw=(W-2*M-0.5)/2, gh=1.75;
btns.forEach((b,i)=>{ const cx=M+(i%2)*(gw+0.5), cy=2.6+Math.floor(i/2)*(gh+0.35); card(s,cx,cy,gw,gh,MIST); circle(s,cx+0.35,cy+0.4,1.0,b[3],b[0],WHITE,30); s.addText(b[1],{x:cx+1.55,y:cy+0.3,w:gw-1.7,h:0.5,fontFace:HF,bold:true,fontSize:21,color:GREEN}); s.addText(b[2],{x:cx+1.55,y:cy+0.85,w:gw-1.75,h:0.7,fontFace:BF,fontSize:13,color:GRAY,lineSpacingMultiple:1.1}); });
footer(s,4);

// ===== helper: step-flow slide =====
function stepSlide(kick,ttl,steps,note,emoji,accent,pg){
  const s=p.addSlide(); s.background={color:WHITE};
  kicker(s,kick,M,0.55); title(s,ttl,M,0.9,10.6);
  s.addText(emoji,{x:W-2.0,y:0.55,w:1.4,h:1.4,align:'center',fontSize:60});
  let y=2.05; const rh=(6.2-2.05-(steps.length-1)*0.2)/steps.length;
  steps.forEach((st,i)=>{ card(s,M,y,W-2*M,rh,i%2?MIST:'F6FAF5'); circle(s,M+0.35,y+rh/2-0.42,0.84,accent,String(i+1),WHITE,26); s.addText(st[0],{x:M+1.5,y:y+0.14,w:W-2*M-1.8,h:0.5,fontFace:HF,bold:true,fontSize:17,color:GREEN}); s.addText(st[1],{x:M+1.5,y:y+0.6,w:W-2*M-1.8,h:rh-0.7,fontFace:BF,fontSize:13,color:GRAY,lineSpacingMultiple:1.05}); y+=rh+0.2; });
  if(note){ s.addText(note,{x:M,y:6.4,w:12,h:0.4,fontFace:BF,italic:true,fontSize:13,color:GOLDD}); }
  footer(s,pg); return s;
}

// ============ SLIDE 5 — THÊM CCCD ============
stepSlide('Chức năng 1','🪪 Thêm CCCD người bán',[
 ['Bấm nút "🪪 Thêm CCCD"','Bot trả lời: "Đã bật chế độ CCCD. Hãy gửi ảnh căn cước."'],
 ['Chụp / gửi ảnh căn cước','Mỗi người 1 tấm ảnh riêng — chụp rõ mặt trước (và mặt sau nếu cần).'],
 ['Đợi ~15 giây','Bot đọc xong sẽ báo "✅ Đã lưu CCCD" kèm họ tên, số CCCD, địa chỉ.'],
 ['Dữ liệu tự vào bảng CCCD_DATA','Không cần gõ tay. Tấm nào mờ, bot đánh dấu "Cần kiểm tra = CÓ".'],
], '💡 Nhớ BẤM NÚT trước rồi mới gửi ảnh — để bot biết đó là căn cước.','🪪',GREEN,5);

// ============ SLIDE 6 — PHIẾU CÂN ============
stepSlide('Chức năng 2','⚖️ Chụp phiếu cân',[
 ['Bấm nút "⚖️ Phiếu cân"','Bot trả lời: "Đã bật chế độ Phiếu cân. Hãy gửi ảnh phiếu cân."'],
 ['Gửi ảnh phiếu cân','Được cả phiếu IN và phiếu VIẾT TAY. Chụp rõ các con số.'],
 ['Bot đọc & kiểm tra','Tự đọc loại hàng, số xe, trọng lượng, và kiểm tra phép trừ cân.'],
 ['Ghi vào bảng PHIEU_CAN','Bot báo kết quả. Nếu số cân lệch, tự gắn "Cần kiểm tra".'],
], '💡 Chụp thẳng, đủ sáng, thấy rõ số cân là bot đọc chuẩn nhất.','⚖️',GREEN2,6);

// ============ SLIDE 7 — MUA LÚA ============
s=p.addSlide(); s.background={color:WHITE};
kicker(s,'Chức năng 3',M,0.55); title(s,'🌾 Ghi mua lúa',M,0.9);
s.addText('Gõ theo đúng mẫu, các phần ngăn nhau bằng dấu gạch đứng  |  :',{x:M,y:1.8,w:12,h:0.5,fontFace:BF,fontSize:14.5,color:GRAY});
card(s,M,2.35,W-2*M,1.0,GREEN,0.1);
s.addText([{text:'mua ',options:{color:GOLD,bold:true}},{text:'| Tên người bán | Loại lúa | Số kg | Đơn giá',options:{color:WHITE}}],{x:M+0.4,y:2.35,w:W-2*M-0.8,h:1.0,valign:'middle',fontFace:'Courier New',bold:true,fontSize:20});
s.addText('Ví dụ thực tế:',{x:M,y:3.65,w:6,h:0.4,fontFace:BF,bold:true,fontSize:13.5,color:GREEN});
card(s,M,4.05,W-2*M,0.85,MISTG,0.1);
s.addText('mua | Diệp Thành Hòa | OM5451 | 5200 | 8200',{x:M+0.4,y:4.05,w:W-2*M-0.8,h:0.85,valign:'middle',fontFace:'Courier New',fontSize:17,color:INK});
const auto=[['🔎','Tự tra người bán','Bot tìm trong CCCD_DATA, tự điền số CCCD + địa chỉ'],['🧮','Tự tính tiền','Số kg × đơn giá = thành tiền, khỏi bấm máy tính'],['📒','Ghi sổ MUA_LUA','Lưu thành 1 dòng, xem lại bất cứ lúc nào']];
let aw=(W-2*M-0.8)/3;
auto.forEach((a,i)=>{ const x=M+i*(aw+0.4); card(s,x,5.25,aw,1.35,MIST); s.addText(a[0],{x:x+0.2,y:5.4,w:0.7,h:0.7,fontSize:24,align:'center'}); s.addText(a[1],{x:x+0.95,y:5.42,w:aw-1.1,h:0.4,fontFace:HF,bold:true,fontSize:14,color:GREEN}); s.addText(a[2],{x:x+0.95,y:5.82,w:aw-1.1,h:0.7,fontFace:BF,fontSize:11,color:GRAY,lineSpacingMultiple:1.05}); });
footer(s,7);

// ============ SLIDE 8 — BÁO CÁO + TRA NGƯỜI BÁN ============
s=p.addSlide(); s.background={color:WHITE};
kicker(s,'Chức năng 4 & 5',M,0.55); title(s,'Báo cáo & Tra cứu nhanh',M,0.9);
let cw=(W-2*M-0.5)/2;
card(s,M,2.15,cw,4.3,MIST); circle(s,M+0.5,2.6,1.0,MOSS,'📊',WHITE,28);
s.addText('Báo cáo hôm nay',{x:M+1.7,y:2.7,w:cw-1.9,h:0.6,fontFace:HF,bold:true,fontSize:22,color:GREEN});
s.addText([{text:'Bấm nút ',options:{}},{text:'📊 Báo cáo',options:{bold:true,color:GREEN}}],{x:M+0.5,y:3.85,w:cw-1,h:0.5,fontFace:BF,fontSize:14,color:GRAY});
s.addText('Bot trả về ngay trong ngày:\n\n•  Số phiếu cân đã ghi\n•  Tổng khối lượng hàng (kg)\n•  Số phiếu cần kiểm tra lại',{x:M+0.5,y:4.25,w:cw-1,h:2.0,fontFace:BF,fontSize:14,color:GRAY,lineSpacingMultiple:1.25});
const x2=M+cw+0.5;
card(s,x2,2.15,cw,4.3,MISTG); circle(s,x2+0.5,2.6,1.0,GOLDD,'🔎',WHITE,26);
s.addText('Tra người bán',{x:x2+1.7,y:2.7,w:cw-1.9,h:0.6,fontFace:HF,bold:true,fontSize:22,color:GREEN});
s.addText('Gõ nhanh để tìm lại thông tin đã lưu:',{x:x2+0.5,y:3.75,w:cw-1,h:0.5,fontFace:BF,fontSize:14,color:GRAY});
card(s,x2+0.5,4.25,cw-1,0.65,WHITE,0.08); s.addText('ai Diệp Thành Hòa',{x:x2+0.7,y:4.25,w:cw-1.4,h:0.65,valign:'middle',fontFace:'Courier New',fontSize:15,color:INK});
card(s,x2+0.5,5.05,cw-1,0.65,WHITE,0.08); s.addText('ai 052134002261',{x:x2+0.7,y:5.05,w:cw-1.4,h:0.65,valign:'middle',fontFace:'Courier New',fontSize:15,color:INK});
s.addText('→ Bot hiện họ tên, số CCCD, ngày sinh, địa chỉ.',{x:x2+0.5,y:5.85,w:cw-1,h:0.5,fontFace:BF,italic:true,fontSize:12.5,color:GOLDD});
footer(s,8);

// ============ SLIDE 9 — MẸO CHỤP ẢNH ============
s=p.addSlide(); s.background={color:WHITE};
kicker(s,'Bí quyết',M,0.55); title(s,'Chụp ảnh sao cho bot đọc chuẩn',M,0.9);
let hw=(W-2*M-0.5)/2;
card(s,M,2.15,hw,4.3,'EAF5EC');
s.addText([{text:'✅  ',options:{color:GREEN2}},{text:'NÊN LÀM',options:{bold:true,color:GREEN2}}],{x:M+0.5,y:2.4,w:hw-1,h:0.5,fontFace:HF,fontSize:20});
[['Chụp đủ sáng, rõ nét, không bị lóa'],['Đặt giấy tờ thẳng, thấy hết 4 góc'],['Mỗi căn cước chụp 1 tấm riêng'],['Ảnh JPG/PNG bình thường']].forEach((t,i)=>{ s.addText([{text:'•  ',options:{color:GREEN2,bold:true}},{text:t[0],options:{color:INK}}],{x:M+0.6,y:3.15+i*0.72,w:hw-1.2,h:0.6,fontFace:BF,fontSize:14.5,lineSpacingMultiple:1.05}); });
const x2b=M+hw+0.5; card(s,x2b,2.15,hw,4.3,'FBEDEA');
s.addText([{text:'❌  ',options:{color:'B0403A'}},{text:'TRÁNH',options:{bold:true,color:'B0403A'}}],{x:x2b+0.5,y:2.4,w:hw-1,h:0.5,fontFace:HF,fontSize:20});
[['Ảnh mờ, tối, chụp nghiêng bị méo'],['Gộp nhiều căn cước trong 1 tấm'],['Ảnh HEIC (iPhone) — nên đổi sang JPG'],['Chụp thiếu góc, che mất số']].forEach((t,i)=>{ s.addText([{text:'•  ',options:{color:'B0403A',bold:true}},{text:t[0],options:{color:INK}}],{x:x2b+0.6,y:3.15+i*0.72,w:hw-1.2,h:0.6,fontFace:BF,fontSize:14.5,lineSpacingMultiple:1.05}); });
s.addText('Tấm nào bot không chắc, nó tự ghi "Cần kiểm tra = CÓ" để mình rà lại.',{x:M,y:6.65,w:12,h:0.4,fontFace:BF,italic:true,fontSize:12.5,color:GOLDD});
footer(s,9);

// ============ SLIDE 10 — DỮ LIỆU LƯU Ở ĐÂU ============
s=p.addSlide(); s.background={color:WHITE};
kicker(s,'Dữ liệu',M,0.55); title(s,'Mọi thứ lưu ở đâu?',M,0.9);
s.addText('Tất cả dữ liệu gom vào Google Sheets (bảng tính) — xem được trên điện thoại và máy tính.',{x:M,y:1.8,w:12,h:0.5,fontFace:BF,fontSize:14.5,color:GRAY});
const sheets=[['📇','CCCD_DATA','Thông tin căn cước của người bán: họ tên, số CCCD, ngày sinh, địa chỉ...',GREEN],['⚖️','PHIEU_CAN','Các phiếu cân nhập/xuất: loại hàng, số xe, trọng lượng, độ ẩm...',GREEN2],['📒','MUA_LUA','Sổ mua lúa: người bán, loại lúa, số kg, đơn giá, thành tiền.',GOLDD]];
let sw=(W-2*M-0.8)/3;
sheets.forEach((b,i)=>{ const x=M+i*(sw+0.4); card(s,x,2.55,sw,3.6,MIST); circle(s,x+sw/2-0.6,2.9,1.2,b[3],b[0],WHITE,32); s.addText(b[1],{x:x+0.2,y:4.25,w:sw-0.4,h:0.5,align:'center',fontFace:'Courier New',bold:true,fontSize:18,color:GREEN}); s.addText(b[2],{x:x+0.35,y:4.85,w:sw-0.7,h:1.2,align:'center',fontFace:BF,fontSize:12.5,color:GRAY,lineSpacingMultiple:1.15}); });
s.addText('🔒 Đây là dữ liệu cá nhân — chỉ mở cho người có phận sự, không chia sẻ ra ngoài.',{x:M,y:6.45,w:12,h:0.4,fontFace:BF,italic:true,fontSize:13,color:GOLDD});
footer(s,10);

// ============ SLIDE 11 — XỬ LÝ SỰ CỐ ============
s=p.addSlide(); s.background={color:WHITE};
kicker(s,'Khi gặp trục trặc',M,0.55); title(s,'Xử lý sự cố thường gặp',M,0.9);
const faq=[['Không thấy nút bấm?','Gõ /start một lần, rồi ĐÓNG bàn phím chữ — nút sẽ hiện ở khung nhập tin.'],['Báo "chưa được cấp quyền"?','Copy MÃ SỐ bot gửi, gửi cho quản lý để được thêm vào danh sách.'],['Gửi ảnh mà bot im lặng?','Đợi ~15 giây. Nếu vẫn im: kiểm tra đã bấm đúng nút chế độ chưa, ảnh có mờ không.'],['Bot đọc sai thông tin?','Mở bảng tính sửa lại tay. Lọc cột "Cần kiểm tra = CÓ" để soát nhanh.']];
let fy=2.15, frh=1.0;
faq.forEach((q,i)=>{ card(s,M,fy,W-2*M,frh,i%2?MIST:'F6FAF5'); circle(s,M+0.35,fy+frh/2-0.3,0.6,GOLD,'?',INK,20); s.addText(q[0],{x:M+1.25,y:fy+0.12,w:W-2*M-1.5,h:0.4,fontFace:HF,bold:true,fontSize:15.5,color:GREEN}); s.addText(q[1],{x:M+1.25,y:fy+0.5,w:W-2*M-1.6,h:0.45,fontFace:BF,fontSize:12.5,color:GRAY,lineSpacingMultiple:1.0}); fy+=frh+0.15; });
footer(s,11);

// ============ SLIDE 12 — QUY TẮC VÀNG + CẢM ƠN ============
s=p.addSlide(); s.background={color:GREEN};
s.addShape(p.ShapeType.ellipse,{x:-2,y:4.4,w:6,h:6,fill:{color:GREEN2},line:{type:'none'}});
s.addShape(p.ShapeType.ellipse,{x:10.6,y:-2,w:5.5,h:5.5,fill:{color:'234E31'},line:{type:'none'}});
s.addText('🔒  QUY TẮC VÀNG',{x:M,y:0.7,w:11,h:0.6,fontFace:BF,bold:true,fontSize:16,color:GOLD,charSpacing:2});
s.addText('Giữ an toàn cho dữ liệu',{x:M,y:1.25,w:11,h:0.9,fontFace:HF,bold:true,fontSize:36,color:WHITE});
const rules=[['Không chia sẻ đường link bot cho người ngoài công ty.'],['Không dùng ảnh căn cước cho mục đích ngoài công việc.'],['Chỉ nhân viên được cấp quyền mới sử dụng bot.'],['Thấy sai sót thì báo quản lý, không tự ý sửa lung tung.']];
rules.forEach((r,i)=>{ circle(s,M,2.45+i*0.85,0.55,GOLD,String(i+1),INK,18); s.addText(r[0],{x:M+0.8,y:2.45+i*0.85,w:9.5,h:0.6,valign:'middle',fontFace:BF,fontSize:16,color:'E8F1EA'}); });
s.addText([{text:'Biên soạn & triển khai:  ',options:{color:'AFC3B4'}},{text:'Phan Tấn Phương',options:{color:GOLD,bold:true}}],{x:M,y:5.72,w:W-2*M,h:0.35,align:'right',fontFace:BF,fontSize:13});
card(s,M,6.15,W-2*M,0.85,GOLD,0.12);
s.addText('🌾  Chúc cả nhà làm việc thật nhẹ nhàng và hiệu quả!',{x:M,y:6.15,w:W-2*M,h:0.85,align:'center',valign:'middle',fontFace:HF,bold:true,fontSize:18,color:INK});

p.writeFile({ fileName:'/tmp/claude-0/-home-user-n8n/e6b51ae7-6c99-5683-8277-7db523f0061c/scratchpad/huongdan/SoTay_MiniApp_ThanhHuong.pptx' }).then(f=>console.log('WROTE',f));
