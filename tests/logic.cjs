const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const {templates,labels}=await import('../src/reference-data.mjs');
 const {randomReference}=await import('../src/random-reference.mjs');
 for(const template of templates)for(const key of ['transaction','order','fcTransaction']){
   if(!template.fields[key])continue;
   for(let n=0;n<20;n++){
     const value=randomReference(template,key),original=template.fields[key].value;
     assert.equal(value.length,original.length||35);
     assert.match(value,key==='order'?/^OMK[0-9a-f]+$/:key==='fcTransaction'?/^AXIFRC[0-9a-f]+$/:original.startsWith('PTM')||!original?/^PTM[0-9a-f]+$/:/^\d+$/);
   }
 }
 const {validAmount,amountWords,regionText,regionChanged,wrapLines}=await import('../src/reference-renderer.mjs');
 assert.equal(templates.length,12);
 assert.equal(new Set(templates.map(t=>t.id)).size,12);
 for(const template of templates){
   assert.equal(template.height,1280,'Every export must stay one screen high');
   assert.ok(fs.existsSync('public'+template.src),template.src);
   const defaults=Object.fromEntries(Object.entries(template.fields).map(([k,v])=>[k,v.value]));
   for(const field of Object.values(template.fields))assert.match(field.label,/[\u3400-\u9fff]/,'Every editor label must be Chinese');
   for(const region of template.regions){
     assert.ok(template.fields[region.key],region.key);
     assert.ok(region.x>=0&&region.y>=0&&region.w>0&&region.h>0);
     assert.ok(region.x+region.w<=template.width,template.id+': '+region.key+' exceeds width');
     assert.ok(region.y+region.h<=template.height,template.id+': '+region.key+' exceeds height');
     assert.equal(regionChanged(region,defaults,template),false,'Defaults must not repaint any source pixels');
     for(const key of region.depends||[region.key])assert.equal(regionChanged(region,{...defaults,[key]:'different'},template),true);
   }
 }
 for(const [value,valid] of [['',false],['0',false],['1.5',false],['1e3',false],['-1',false],['1',true],['999999999',true],['1000000000',false]])assert.equal(validAmount(value),valid);
 assert.equal(amountWords('500'),'Rupees Five Hundred Only');
 assert.equal(amountWords('100001'),'Rupees One Lakh One Only');
 assert.equal(amountWords('10000000'),'Rupees One Crore Only');
 assert.equal(regionText({key:'paymentAt',format:'paytmShort'},{paymentAt:'2026-10-05T18:41'}),'05 Oct, 06:41 PM');
 assert.equal(regionText({key:'paymentAt',format:'paytmLong'},{paymentAt:'2026-10-05T18:41'}),'05 Oct 2026 , 06:41 PM');
 assert.equal(regionText({key:'paymentAt',format:'mobi'},{paymentAt:'2026-10-05T19:00'}),"5 Oct '26 at 7:00PM");
 assert.equal(regionText({key:'dateText',format:'freecharge'},{dateText:'2026-10-02T00:05'}),'2 Oct 2026, 12:05 AM');
 assert.equal(regionText({key:'dateText',format:'paytmDetails'},{dateText:'2026-10-05T13:00'}),'01:00 PM, 05 Oct 2026');
 for(const template of templates)if(template.fields.dateText)assert.equal(template.fields.dateText.type,'datetime-local');
 assert.equal(regionText({key:'started',template:'Payment Started by {sender}'},{started:'',sender:'Test Person'}),'Payment Started by Test Person');
 assert.equal(regionText({key:'started',template:'Payment Started by {sender}'},{started:'Manual',sender:'Test Person'}),'Manual');
 const id='A'.repeat(120), ctx={measureText:text=>({width:text.length*10})};
 assert.equal(wrapLines(ctx,id,100,20).join(''),id);
 const html=fs.readFileSync('index.html','utf8');assert.ok(!html.includes('Complete record'));assert.ok(!html.includes('1470'));
 console.log('Passed: all 12 templates, fixed dimensions, original-only default render, region bounds, Chinese labels, amount validation, date formats, linked text and long IDs.');
})().catch(error=>{console.error(error);process.exitCode=1;});
