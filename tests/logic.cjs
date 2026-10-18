const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const {templates}=await import('../src/reference-data.mjs');
 const {randomReference}=await import('../src/random-reference.mjs');
 const {validAmount,amountWords,regionText,regionChanged,wrapLines}=await import('../src/reference-renderer.mjs');
 assert.equal(templates.length,12);assert.equal(new Set(templates.map(t=>t.id)).size,12);
 for(const t of templates){
  assert.equal(t.height,1280);assert.ok(fs.existsSync('public'+t.src));
  const defaults=Object.fromEntries(Object.entries(t.fields).map(([k,v])=>[k,v.value]));
  for(const f of Object.values(t.fields))assert.match(f.label,/[\u3400-\u9fff]/);
  for(const r of t.regions){
   assert.ok(t.fields[r.key]);assert.ok(r.x>=0&&r.y>=0&&r.w>0&&r.h>0);assert.ok(r.x+r.w<=t.width);assert.ok(r.y+r.h<=t.height);
   assert.equal(regionChanged(r,defaults,t),false);
   for(const key of r.depends||[r.key])assert.equal(regionChanged(r,{...defaults,[key]:'different'},t),true);
   if(r.icon){assert.ok(r.icon.x>=r.x&&r.icon.x+r.icon.w<=r.x+r.w);assert.ok(r.icon.y>=r.y&&r.icon.y+r.icon.h<=r.y+r.h);}
   if(r.key==='amount'&&r.format!=='words'&&t.provider!=='freecharge')assert.equal(regionText(r,{amount:'123456.70'}),'\u20b9123,456.70');
  }
  for(const key of ['transaction','order','fcTransaction'])if(t.fields[key])for(let n=0;n<20;n++){
   const value=randomReference(t,key),original=t.fields[key].value;
   assert.equal(value.length,original.length||35);
   assert.match(value,key==='order'?/^OMK[0-9a-f]+$/:key==='fcTransaction'?/^AXIFRC[0-9a-f]+$/:original.startsWith('PTM')||!original?/^PTM[0-9a-f]+$/:/^\d+$/);
  }
  if(t.fields.dateText)assert.equal(t.fields.dateText.type,'datetime-local');
 }
 for(const [v,ok] of [['',false],['0',false],['1.5',false],['1e3',false],['-1',false],['1',true],['999999999',true],['1000000000',false]])assert.equal(validAmount(v),ok);
 for(const v of ['0.01','1234.5','123456.78','999999999.00'])assert.equal(validAmount(v,true),true);
 for(const v of ['0','-1.20','1.234','1e3','1000000000','1,234'])assert.equal(validAmount(v,true),false);
 assert.equal(amountWords('500'),'Rupees Five Hundred Only');assert.equal(amountWords('100001'),'Rupees One Lakh One Only');assert.equal(amountWords('10000000'),'Rupees One Crore Only');
 assert.equal(amountWords('1234.50'),'Rupees One Thousand Two Hundred Thirty Four and Fifty Paise Only');assert.equal(amountWords('0.01'),'Rupees Zero and One Paise Only');
 for(const [format,value,expected] of [['paytmShort','2026-10-05T18:41','05 Oct, 06:41 PM'],['paytmLong','2026-10-05T18:41','05 Oct 2026 , 06:41 PM'],['mobi','2026-10-05T19:00',"5 Oct '26 at 7:00PM"],['freecharge','2026-10-02T00:05','2 Oct 2026, 12:05 AM'],['paytmDetails','2026-10-05T13:00','01:00 PM, 05 Oct 2026']])assert.equal(regionText({key:'date',format},{date:value}),expected);
 assert.equal(regionText({key:'started',template:'Payment Started by {sender}'},{started:'',sender:'Test Person'}),'Payment Started by Test Person');assert.equal(regionText({key:'started',template:'Payment Started by {sender}'},{started:'Manual',sender:'Test Person'}),'Manual');
 const id='A'.repeat(120),ctx={measureText:text=>({width:text.length*10})};assert.equal(wrapLines(ctx,id,100,20).join(''),id);
 const html=fs.readFileSync('index.html','utf8');assert.ok(!html.includes('Complete record'));assert.ok(!html.includes('1470'));
 console.log('Passed: 12 templates, bounds, default regions, reference IDs, amount validation, decimals, thousands, paise, dates, linked text, long IDs.');
})().catch(error=>{console.error(error);process.exitCode=1;});
