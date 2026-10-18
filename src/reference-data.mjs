export const labels = {
  time:'状态栏时间', battery:'电池电量（%）', amount:'金额（印度卢比）',
  sender:'付款人姓名', senderBank:'付款银行及尾号', recipient:'收款人姓名', recipientBank:'收款银行及尾号',
  recipientAccount:'收款账号', senderUpi:'付款人 UPI 账号', upi:'收款人 UPI 账号',
  transaction:'UPI 交易编号', order:'MobiKwik 订单编号', fcTransaction:'Freecharge 交易编号',
  paymentAt:'交易日期与时间', dateText:'交易时间显示文字', status:'状态文字',
  heading:'页面标题', notice:'状态说明', comments:'备注', method:'付款方式',
  receivedBy:'收款号码', initiated:'付款发起银行', credited:'到账进度文字',
  senderInitials:'付款人头像缩写', recipientInitials:'收款人头像缩写',
  recipientPhoto:'收款人头像图片', senderPhoto:'付款人头像图片', bankLogo:'付款银行图标',
  started:'进度：发起付款', transferred:'进度：银行已转出', sent:'进度：已发送至收款银行', depositing:'进度：等待入账'
};
const base = { color:'#202124', weight:400, align:'left', lineHeight:1.3 };
const r = (key,x,y,w,h,size,extra={}) => ({...base,key,x,y,w,h,size,...extra});
const f = (values) => Object.fromEntries(Object.entries(values).map(([key,value])=>[key,{label:labels[key],value:String(value),type:key==='amount'?'amount':key==='battery'?'battery':key==='paymentAt'?'datetime-local':key.endsWith('Photo')||key==='bankLogo'?'image':'text'}]));
const spec=(id,provider,label,width,values,regions)=>({id,provider,label,width,height:1280,src:(import.meta.env?.BASE_URL || '/')+'references/'+id+'.jpg',fields:f(values),regions});
const money = {prefix:'₹',weight:700};
const time=(value,x,y,w,h,size,color='#333')=>r('time',x,y,w,h,size,{color,weight:500});
const ordinaryNotice='Payment is in progress. Don’t worry — If it fails, any debited amount will be auto-reversed; if successful, it will be credited to the recipient. The transaction will get updated within 3-8 days.';
const processValues = {recipient:'Mr Bittu Kumar Chaudhary',recipientBank:'SBI Bank - 3031',amount:'624',paymentAt:'2026-10-05T18:41',transaction:'PTMc4ba8740edf84de5adf14b9a46893d6b',recipientInitials:'MC',time:'18:42:05',battery:'14'};
const paytmTimeline = {sender:'Krishna Rani',senderBank:'Yes Bank - 8016',recipient:'Mr ABHILASH REDDY PANDIRI',recipientBank:'State Bank Of India - 9271',senderUpi:'******4155@ptyes',dateText:'01:00 PM, 05 Oct 2026',transaction:'316196573640',status:'Pending',started:'',transferred:'',sent:"Money sent to receiver’s bank",depositing:'',recipientInitials:'MP',recipientPhoto:'',senderPhoto:'',bankLogo:'',time:'1:17'};
export const templates = [
  spec('freecharge-overview-small','freecharge','处理中 · 三张推广卡片',576,
    {sender:'Shudhanshu',senderBank:'BANK OF BARODA(xxxx 2999)',recipient:'siddhartha Mishiã',recipientAccount:'xxxxxxxxx86441',amount:'500',time:'9:14',heading:'Your transaction is in Progress!',notice:'Please Wait! This is taking more than expected time\nKindly do not go back or close the app'},[
      time('',22,17,29,17,12),r('sender',44,217,181,17,12,{weight:600,sample:[45,206]}),r('senderBank',44,240,187,16,10,{sample:[45,206]}),r('recipient',328,217,201,17,12,{weight:600,sample:[330,206]}),r('recipientAccount',328,240,201,16,11,{sample:[330,206]}),r('heading',133,405,312,24,14,{align:'center',weight:500}),r('amount',140,436,296,41,40,{...money,align:'center'}),r('notice',119,509,340,35,11,{align:'center',maxLines:2,lineHeight:1.45})]),
  spec('freecharge-overview','freecharge','处理中 · 两张推广卡片',573,
    {sender:'JOSHI',senderBank:'INDIAN BANK(xxxx 0739)',recipient:'Pankaj Chamoli',recipientAccount:'xxxxxxx73619',amount:'2000',time:'7:01',battery:'67',heading:'Your transaction is in Progress!',notice:'Please Wait! This is taking more than expected time\nKindly do not go back or close the app'},[
      time('',34,20,34,25,16),r('battery',515,20,33,25,16,{suffix:'%'}),r('sender',62,291,182,28,20,{weight:500,sample:[45,276]}),r('senderBank',62,331,195,26,16,{sample:[45,276]}),r('recipient',341,291,188,28,20,{weight:500,sample:[335,276]}),r('recipientAccount',341,331,188,26,16,{sample:[335,276]}),r('heading',90,570,402,31,24,{align:'center'}),r('amount',135,617,305,63,58,{...money,align:'center'}),r('notice',42,737,489,55,19,{align:'center',maxLines:2,lineHeight:1.35})]),
  spec('freecharge-details','freecharge','交易详情 · 普通 UPI',606,
    {recipient:'Mr Aryan Gupta',upi:'XXXXXXXXXX4153@SBIN0008261.ifsc.npci',amount:'1917',dateText:'2 Oct 2026, 12:05 AM',status:'Pending',method:'Freecharge UPI',senderBank:'xxxx 7675',transaction:'702890572756',comments:'UPI',notice:ordinaryNotice,recipientInitials:'MA',time:'10:25 AM',battery:'85'},[
      time('',31,16,116,28,20),r('battery',560,18,39,27,18,{suffix:'%'}),r('recipient',72,77,323,30,23,{prefix:'Paid To ',weight:500}),r('recipient',109,155,306,32,23,{prefix:'To ',weight:500}),r('recipientInitials',38,193,43,30,23,{align:'center',color:'#696969',sample:[60,188]}),r('upi',109,194,369,60,18,{maxLines:2,color:'#818181',lineHeight:1.35}),r('dateText',109,254,338,28,16,{color:'#777'}),r('amount',480,155,95,35,23,{...money,align:'right'}),r('status',486,241,79,23,18,{align:'center',color:'#fff',weight:500,sample:[515,238]}),r('notice',96,334,445,113,18,{maxLines:5,lineHeight:1.55,sample:[300,326]}),r('method',26,612,240,28,17,{color:'#777'}),r('amount',26,648,260,28,21,money),r('senderBank',26,837,270,26,20,{weight:500}),r('transaction',26,927,398,27,20,{weight:500}),r('comments',26,1018,497,27,20,{weight:500})]),
  spec('freecharge-lite','freecharge','交易详情 · UPI Lite',575,
    {recipient:'Nagarajan',upi:'XXXXXXXXXX0261@SBIN0016403.ifsc.npci',amount:'291',dateText:'Today, 11:33 AM',status:'Pending',method:'UPI Lite',senderBank:'xxxx 2894',transaction:'321734352806',comments:'Upi Lite Payment',fcTransaction:'AXIFRC7e1c07fdd44f5bfc773784b6dabf5',notice:ordinaryNotice,time:'11:33'},[
      time('',28,22,56,28,20),r('recipient',74,91,335,32,23,{prefix:'Paid To ',weight:500}),r('recipient',99,160,300,32,22,{prefix:'To ',weight:500}),r('upi',99,194,345,29,17,{color:'#818181'}),r('dateText',99,224,320,26,15,{color:'#777'}),r('amount',468,159,78,32,22,{...money,align:'right'}),r('status',477,210,64,23,16,{align:'center',color:'#fff',weight:600,sample:[500,209]}),r('notice',88,287,443,104,18,{maxLines:4,lineHeight:1.4,sample:[76,279]}),r('method',24,535,225,24,16,{color:'#777'}),r('amount',24,566,240,26,20,money),r('senderBank',24,733,86,27,18,{weight:600}),r('transaction',24,811,400,29,19,{weight:600}),r('comments',24,895,505,30,19,{weight:600}),r('fcTransaction',24,968,423,32,18,{weight:600})]),
  spec('paytm-process-white','paytm','处理中 · 白色背景',576,processValues,[
      time('',79,25,87,25,16,'#000'),r('battery',511,32,17,10,10,{align:'center',sample:[529,35]}),r('recipient',153,223,379,34,27,{weight:500,sample:[140,214]}),r('recipientBank',153,262,142,28,20,{sample:[140,214]}),r('recipientInitials',78,239,50,35,24,{align:'center',color:'#23756e',sample:[86,233]}),r('amount',174,327,124,55,49,{...money,sample:[166,323]}),r('paymentAt',135,461,307,30,21,{align:'center',format:'paytmShort',sample:[128,455]}),r('transaction',188,905,296,53,20,{maxLines:2,lineHeight:1.35}),r('paymentAt',41,989,404,29,17,{format:'paytmLong',color:'#929292'})]),
  spec('paytm-process-gray','paytm','处理中 · 浅灰背景',561,
    {...processValues,recipient:'Prasenjit Sardar',recipientBank:'SBI Bank - 5947',amount:'505',paymentAt:'2026-10-05T18:34',transaction:'',recipientInitials:'PS',time:'6:36 PM',battery:'26'},[
      time('',86,17,93,31,21),r('battery',507,26,24,14,11,{align:'center'}),r('recipient',204,254,320,41,30,{weight:700,sample:[190,239]}),r('recipientBank',204,298,175,29,20,{sample:[190,239]}),r('recipientInitials',126,275,50,37,26,{align:'center',weight:600,sample:[136,266]}),r('amount',154,377,140,60,55,{...money,sample:[145,371]}),r('paymentAt',112,530,336,34,23,{align:'center',format:'paytmShort',sample:[101,522]}),r('transaction',208,1035,246,69,21,{maxLines:2,lineHeight:1.4,textTop:10,toast:{x:211,y:1036,w:137,h:57}}),r('paymentAt',41,1141,410,31,20,{format:'paytmLong',color:'#929292'})]),
  spec('paytm-summary','paytm','转账处理中 · 金额与收款人上半屏',574,
    {recipient:'Shri Uttam Gotiram Petar',recipientBank:'State Bank Of India - 9203',recipientInitials:'SP',recipientPhoto:'',amount:'500',time:'6:35',battery:'47'},[
      time('',31,5,48,27,22,'#fff'),r('battery',480,5,47,27,21,{suffix:'%',color:'#fff'}),r('amount',46,218,131,59,50,{...money}),r('amount',46,284,476,34,22,{format:'words',weight:400}),r('recipient',46,1020,379,76,29,{weight:700,maxLines:2,lineHeight:1.38,badge:{x:130,y:1061,w:34,h:35}}),r('recipientBank',46,1107,379,36,22),r('recipientInitials',470,1042,44,33,21,{align:'center',color:'#9b7517',weight:700,sample:[470,1034]}),r('recipientPhoto',453,1020,76,77,0,{kind:'image',shape:'circle'})]),
  spec('paytm-details','paytm','转账处理中 · 收付款人与进度下半屏',587,paytmTimeline,[
      time('',30,19,47,30,22),r('recipient',50,249,388,87,33,{weight:700,maxLines:2,lineHeight:1.36,badge:{x:188,y:298,w:34,h:35}}),r('recipientBank',50,346,477,36,24),r('recipientInitials',466,274,55,40,24,{align:'center',weight:700,color:'#485c22',sample:[477,263]}),r('recipientPhoto',455,252,83,82,0,{kind:'image',shape:'circle'}),r('sender',50,588,383,42,34,{weight:700}),r('senderPhoto',457,553,76,78,0,{kind:'image',shape:'circle'}),r('senderUpi',50,646,435,33,23,{prefix:'UPI ID: '}),r('senderBank',50,688,192,36,23),r('bankLogo',246,690,23,23,0,{kind:'image',shape:'circle'}),r('dateText',50,758,489,35,24),r('transaction',50,798,295,35,23,{prefix:'UPI Ref No: '}),r('status',50,849,446,35,24,{prefix:'Status: ',weight:700}),r('started',96,892,442,38,24,{template:'Payment Started by {sender}',depends:['sender','started']}),r('transferred',96,955,445,69,24,{template:"Money transferred from {sender}'s {senderBank}",depends:['sender','senderBank','transferred'],maxLines:2,lineHeight:1.4}),r('sent',96,1038,445,40,24),r('depositing',96,1105,447,55,24,{template:"Depositing money in {recipient}'s A/c",depends:['recipient','depositing'],maxLines:2,lineHeight:1.4})]),
  spec('paytm-summary-compact','paytm','转账待处理 · 金额与收付款人上半屏',576,
    {recipient:'Harman Kohsy',recipientBank:'State Bank Of India - 7311',recipientInitials:'HK',recipientPhoto:'',sender:'Devanand Dubey',senderBank:'Jio Payments Bank - 5713',senderInitials:'DD',senderPhoto:'',senderUpi:'dubey.devanand@ptyes',amount:'1000',dateText:'07:21 PM, 03 Oct 2026',time:'7:22',battery:'44'},[
      time('',35,10,37,24,16,'#fff'),r('battery',510,10,34,24,16,{suffix:'%',color:'#fff'}),r('amount',42,202,147,55,45,{...money,grouping:true}),r('amount',42,263,480,32,20,{format:'words',weight:400}),r('recipient',42,839,390,35,26,{weight:700,badge:{x:235,y:837,w:32,h:32}}),r('recipientBank',42,881,395,30,20),r('recipientInitials',479,839,44,30,18,{align:'center',color:'#983534',weight:700,sample:[479,833]}),r('recipientPhoto',469,819,65,68,0,{kind:'image',shape:'circle'}),r('sender',42,1074,380,35,27,{weight:700}),r('senderInitials',479,1064,45,30,19,{align:'center',color:'#b091d1',sample:[479,1057]}),r('senderPhoto',469,1045,65,68,0,{kind:'image',shape:'circle'}),r('senderUpi',42,1121,493,29,20,{prefix:'UPI ID: '}),r('senderBank',42,1155,243,29,19),r('dateText',42,1213,496,28,19)]),
  spec('mobikwik-blue','mobikwik','待处理转账 · 蓝色概览',574,
    {recipient:'Dnyaneshwar Suravase',amount:'738',receivedBy:'XXXX-XX8-141',method:'INDIAN BANK 8737',time:'12:05',battery:'52'},[
      time('',34,10,47,26,16,'#fff'),r('battery',505,10,34,25,16,{suffix:'%',color:'#fff'}),r('amount',171,273,235,57,51,{...money,align:'center',color:'#fff',sample:[159,266]}),r('recipient',88,349,403,39,24,{prefix:'to ',align:'center',color:'#fff',sample:[85,341]}),r('receivedBy',309,441,224,31,20,{align:'right'}),r('method',295,486,238,27,20,{align:'right'})]),
  spec('mobikwik-overview','mobikwik','付款待处理 · 状态与进度上半屏',576,
    {amount:'2000',paymentAt:'2026-10-05T19:00',initiated:'JIO PAYMENTS BANK LTD - 2682',credited:'Amount credited to the beneficiary account',recipient:'Rahul Dindure',recipientBank:'SBIN0012485',recipientAccount:'XXXXXXX2247',recipientInitials:'R',recipientPhoto:'',sender:'Santanu Roy',senderUpi:'8293293132@mbkns',senderBank:'JIO PAYMENTS BANK LTD - 2682',time:'7:04 PM',battery:'61'},[
      time('',27,18,74,26,19,'#292c2f'),r('battery',508,27,20,11,10,{align:'center',sample:[531,31]}),r('amount',40,149,199,63,55,{...money,grouping:true,color:'#303c47',sample:[36,142]}),r('paymentAt',42,317,481,32,20,{format:'mobi',color:'#79818a',sample:[32,310]}),r('initiated',76,477,445,60,21,{prefix:'Payment initiated from ',maxLines:2,lineHeight:1.36}),r('credited',76,611,451,39,20,{color:'#99a3ac'}),r('recipient',49,770,400,35,25,{weight:700,color:'#35404a'}),r('recipientBank',49,815,464,35,24,{color:'#35404a'}),r('recipientAccount',49,859,464,35,24,{color:'#35404a'}),r('recipientInitials',487,741,27,27,23,{align:'center',color:'#fff',sample:[495,735]}),r('recipientPhoto',475,728,51,51,0,{kind:'image',shape:'rounded'}),r('sender',49,1081,458,38,26,{weight:700,color:'#35404a'}),r('senderUpi',49,1126,464,36,25,{color:'#35404a'}),r('senderBank',49,1170,470,39,23,{color:'#35404a'})]),
  spec('mobikwik-details','mobikwik','付款待处理 · 交易编号下半屏',576,
    {amount:'2200',recipient:'Gurleen Rawat',recipientBank:'SBIN0002179',recipientAccount:'XXXXXXX4025',recipientInitials:'G',recipientPhoto:'',sender:'Ravi Kumar So Upendra Pal',senderUpi:'9771512448@mbkns',senderBank:'BIHAR GRAMIN BANK - 1140',order:'OMK27c3e1b35dca512',transaction:'627419961791',time:'7:40 pm',battery:'68'},[
      time('',23,23,60,25,16),r('battery',522,32,18,10,10,{align:'center',sample:[540,37]}),r('amount',92,89,115,37,31,{...money,grouping:true,color:'#303c47'}),r('recipient',55,305,388,38,27,{weight:700,color:'#35404a'}),r('recipientBank',55,356,454,37,27,{color:'#35404a'}),r('recipientAccount',55,405,454,37,27,{color:'#35404a'}),r('recipientInitials',475,271,32,32,27,{align:'center',color:'#fff',sample:[478,270]}),r('recipientPhoto',461,257,58,60,0,{kind:'image',shape:'rounded'}),r('sender',55,659,455,41,27,{weight:700,color:'#35404a'}),r('senderUpi',55,711,454,37,27,{color:'#35404a'}),r('senderBank',55,760,454,33,26,{color:'#35404a'}),r('order',55,933,422,40,27,{color:'#35404a'}),r('transaction',55,1074,422,40,27,{color:'#35404a'})])
];
export const providers = {freecharge:'Freecharge',paytm:'Paytm',mobikwik:'MobiKwik'};

const datePickers = {
  'freecharge-details':['2026-10-02T00:05','freecharge'],
  'freecharge-lite':['2026-10-11T11:33','freechargeLite'],
  'paytm-details':['2026-10-05T13:00','paytmDetails'],
  'paytm-summary-compact':['2026-10-03T19:21','paytmDetails']
};
for(const template of templates){
  const date=datePickers[template.id];
  if(!date)continue;
  Object.assign(template.fields.dateText,{label:'交易日期与时间',type:'datetime-local',value:date[0]});
  for(const region of template.regions.filter(region=>region.key==='dateText'))region.format=date[1];
}

for(const template of templates){
  if(template.id==='freecharge-details'||template.id==='freecharge-lite') template.fields.senderBank.label='付款账号（掩码及尾号）';
  if(template.id==='mobikwik-overview'||template.id==='mobikwik-details') Object.assign(template.regions.find(region=>region.key==='time'),{weight:700,italic:true});
}

// Amount rows include the original icon and available horizontal space.
const amountRows = {
  'paytm-process-white': {x:42,w:492,align:'center',icon:{x:305,y:332,w:44,h:44},gap:12},
  'paytm-process-gray': {x:43,w:475,align:'center',icon:{x:299,y:378,w:51,h:51},gap:13},
  'paytm-summary': {w:480,icon:{x:182,y:223,w:48,h:48},gap:12},
  'paytm-summary-compact': {w:492,icon:{x:192,y:207,w:43,h:43},gap:12},
  'mobikwik-overview': {w:492,icon:{x:242,y:160,w:43,h:43},gap:12},
  'mobikwik-details': {w:230,icon:{x:211,y:96,w:26,h:26},gap:9},
  'mobikwik-blue': {x:36,w:502}
};
for(const template of templates){
  if(!['paytm','mobikwik'].includes(template.provider))continue;
  if(template.fields.amount)template.fields.amount.decimals=true;
  for(const region of template.regions.filter(r=>r.key==='amount')){
    region.decimals=true;
    if(region.format==='words')continue;
    region.grouping=true;
    Object.assign(region,amountRows[template.id]);
  }
}
