import {templates} from './reference-data.mjs';
export function validAmount(value) {
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 999999999;
}
export function amountWords(value) {
  if (!validAmount(value)) return '';
  const small=['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function words(n) {
    if(n<20) return small[n];
    if(n<100) return tens[Math.floor(n/10)]+(n%10?' '+words(n%10):'');
    for(const [unit,label] of [[10000000,'Crore'],[100000,'Lakh'],[1000,'Thousand'],[100,'Hundred']]) {
      if(n>=unit) return words(Math.floor(n/unit))+' '+label+(n%unit?' '+words(n%unit):'');
    }
  }
  return 'Rupees '+words(Number(value))+' Only';
}
export function regionChanged(region, values, template) {
  return (region.depends || [region.key]).some(key => values[key] !== template.fields[key]?.value);
}
export function regionText(region, values) {
  let text=values[region.key] || '';
  if(region.template && !text) text=region.template.replace(/\{(\w+)\}/g,(_,key)=>values[key] || '');
  if(region.format==='words') return amountWords(text);
  if(region.format && region.format!=='words') {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(text);
    if(!match) return '';
    const [,year,month,day,hour,minute]=match;
    const mon=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(month)-1];
    const hr=Number(hour)%12||12, suffix=Number(hour)>=12?'PM':'AM';
    if(region.format==='paytmShort') return `${day} ${mon}, ${String(hr).padStart(2,'0')}:${minute} ${suffix}`;
    if(region.format==='paytmLong') return `${day} ${mon} ${year} , ${String(hr).padStart(2,'0')}:${minute} ${suffix}`;
    if(region.format==='mobi') return `${Number(day)} ${mon} '${year.slice(-2)} at ${hr}:${minute}${suffix}`;
    if(region.format==='paytmDetails') return `${String(hr).padStart(2,'0')}:${minute} ${suffix}, ${day} ${mon} ${year}`;
    if(region.format==='freecharge') return `${Number(day)} ${mon} ${year}, ${hr}:${minute} ${suffix}`;
    if(region.format==='freechargeLite') {
      const now=new Date();
      const today=Number(year)===now.getFullYear()&&Number(month)===now.getMonth()+1&&Number(day)===now.getDate();
      return `${today?'Today':`${Number(day)} ${mon} ${year}`}, ${hr}:${minute} ${suffix}`;
    }
  }
  if(region.grouping && validAmount(text)) text=new Intl.NumberFormat('en-IN').format(Number(text));
  return (region.prefix||'')+text+(region.suffix||'');
}

export function wrapLines(ctx,text,width,maxLines=1,lastLineWidth) {
  if(maxLines===1) return [text.replace(/\n/g,' ')];
  const lines=[];
  for(const paragraph of text.split('\n')) {
    let line='';
    for(const word of paragraph.split(/\s+/).filter(Boolean)) {
      const available=lastLineWidth && lines.length===maxLines-1 ? lastLineWidth : width;
      if(line && ctx.measureText(line+' '+word).width>available) { lines.push(line); line=''; }
      if(ctx.measureText(word).width>available) {
        for(const char of word) {
          if(line && ctx.measureText(line+char).width>available) {lines.push(line);line='';}
          line+=char;
        }
      } else line=line?line+' '+word:word;
    }
    lines.push(line);
  }
  return lines;
}
const cache=new Map();
export function loadImage(source) {
  if(!cache.has(source)) {
    const promise=new Promise((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>resolve(image);
      image.onerror=()=>{cache.delete(source);reject(new Error('图片加载失败'));};
      image.src=source;
    });
    cache.set(source,promise);
    if(cache.size>32) cache.delete(cache.keys().next().value);
  }
  return cache.get(source);
}
function background(ctx,region) {
  const [x,y]=region.sample || [region.x,region.y];
  const pixels=ctx.getImageData(Math.max(0,x-1),Math.max(0,y-1),3,3).data;
  const median=channel=>Array.from({length:9},(_,i)=>pixels[i*4+channel]).sort((a,b)=>a-b)[4];
  return `rgb(${median(0)},${median(1)},${median(2)})`;
}
function inkColor(ctx,region) {
  const pixels=ctx.getImageData(region.x,region.y,region.w,region.h).data;
  const hex=region.color.replace('#','');
  const expanded=hex.length===3?hex.split('').map(c=>c+c).join(''):hex;
  const target=[0,2,4].map(offset=>parseInt(expanded.slice(offset,offset+2),16));
  const candidates=[];
  for(let i=0;i<pixels.length;i+=4){const rgb=[pixels[i],pixels[i+1],pixels[i+2]];const distance=rgb.reduce((sum,c,j)=>sum+(c-target[j])**2,0);if(distance<10000)candidates.push({rgb,distance});}
  candidates.sort((a,b)=>a.distance-b.distance);
  const selected=candidates.slice(0,Math.max(1,Math.floor(candidates.length*0.08)));
  if(!selected.length)return region.color;
  return `rgb(${[0,1,2].map(channel=>selected.map(item=>item.rgb[channel]).sort((a,b)=>a-b)[Math.floor(selected.length/2)]).join(',')})`;
}
function fitText(ctx,text,region) {
  let size=region.size,lines=[],ascent=0,descent=0;
  // Shrink inside the original text box; never resize or extend the screen.
  for(;size>=6;size-=0.25) {
    ctx.font=`${region.italic ? "italic " : ""}${region.weight} ${size}px ReferenceRoboto, Arial, sans-serif`;
    const lastWidth=region.badge?region.w-region.badge.w-8:region.lastLineWidth;
    lines=wrapLines(ctx,text,region.w,region.maxLines||1,lastWidth);
    ascent=Math.max(...lines.map(line=>ctx.measureText(line).actualBoundingBoxAscent));
    descent=Math.max(...lines.map(line=>ctx.measureText(line).actualBoundingBoxDescent));
    if(lines.length<=(region.maxLines||1) && (lines.length-1)*size*region.lineHeight+ascent+descent<=region.h && lines.every((line,i)=>ctx.measureText(line).width<=(lastWidth && i===lines.length-1?lastWidth:region.w))) break;
  }
  if(size<6) throw new Error('文字过长，请缩短后导出');
  return {size,lines,ascent,descent};
}
function drawPhoneBars(ctx,template,values){
  const w=template.width,h=template.height;
  function band(y,height){
    const rgb=ctx.getImageData(2,y+2,1,1).data;
    ctx.fillStyle=`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;ctx.fillRect(0,y,w,height);
    ctx.fillStyle=ctx.strokeStyle=(rgb[0]*.299+rgb[1]*.587+rgb[2]*.114)>150?'#30343a':'#fff';
    ctx.lineWidth=2.5;ctx.lineCap='round';
  }
  ctx.save();
  if(['keys','gesture'].includes(values.bottomStyle)){
    const height=template.id==='freecharge-details'?72:template.id==='paytm-process-gray'?60:36;
    band(h-height,height);
    if(values.bottomStyle==='gesture'){ctx.beginPath();ctx.roundRect(w*.34,h-14,w*.32,5,2.5);ctx.fill();}
    else {
      const y=h-18;ctx.strokeRect(w*.27-7,y-7,14,14);
      ctx.beginPath();ctx.arc(w*.5,y,8,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(w*.73+6,y-8);ctx.lineTo(w*.73-7,y);ctx.lineTo(w*.73+6,y+8);ctx.closePath();ctx.stroke();
    }
  }
  ctx.restore();
}
export async function renderReference(canvas,template,values,isCurrent=()=>true) {
  const source=await loadImage(template.src);
  const edited=template.regions.filter(region=>regionChanged(region,values,template));
  const photos=new Map(await Promise.all(edited.filter(region=>region.kind==='image' && values[region.key]).map(async region=>[region.key,await loadImage(values[region.key])])));
  if((edited.some(region=>region.kind!=='image')) && typeof document!=='undefined') await document.fonts.load('400 24px ReferenceRoboto');
  if(!isCurrent()) return false;
  // Draw atomically: a failed font/image/text fit never leaves a half-updated export.
  const buffer=canvas.ownerDocument.createElement('canvas');
  buffer.width=template.width; buffer.height=template.height;
  const ctx=buffer.getContext('2d');
  ctx.drawImage(source,0,0);
  const backgrounds=edited.map(region=>region.kind==='image'?null:background(ctx,region));
  const colors=edited.map(region=>region.kind==='image'?null:inkColor(ctx,region));
  for(const [index,region] of edited.entries()) {
    ctx.save();
    ctx.beginPath();ctx.rect(region.x,region.y,region.w,region.h);ctx.clip();
    if(region.kind==='image') {
      const image=photos.get(region.key);
      if(image) {
        ctx.beginPath();
        if(region.shape==='circle') ctx.ellipse(region.x+region.w/2,region.y+region.h/2,region.w/2,region.h/2,0,0,Math.PI*2);
        else ctx.roundRect(region.x,region.y,region.w,region.h,region.w*0.3);
        ctx.clip();
        const side=Math.min(image.naturalWidth,image.naturalHeight);
        ctx.drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,region.x,region.y,region.w,region.h);
      }
    } else {
      ctx.fillStyle=backgrounds[index];ctx.fillRect(region.x,region.y,region.w,region.h);
      const text=regionText(region,values);
      const {size,lines,ascent,descent}=fitText(ctx,text,region);
      ctx.fillStyle=colors[index];ctx.textBaseline='alphabetic';ctx.textAlign=region.align;
      const lineHeight=size*region.lineHeight;
      const firstY=region.y+(region.textTop??(region.maxLines>1?2:(region.h-ascent-descent)/2))+ascent;
      const x=region.align==='center'?region.x+region.w/2:region.align==='right'?region.x+region.w:region.x;
      lines.forEach((line,i)=>ctx.fillText(line,x,firstY+i*lineHeight));
      if(region.badge){const badge=region.badge;const bx=x+ctx.measureText(lines.at(-1)).width+8;const by=Math.max(region.y,firstY+(lines.length-1)*lineHeight-ascent/2-badge.h/2);ctx.drawImage(source,badge.x,badge.y,badge.w,badge.h,bx,by,badge.w,badge.h);}
      for(const keep of region.preserve||[]) ctx.drawImage(source,keep.x,keep.y,keep.w,keep.h,keep.x,keep.y,keep.w,keep.h);
      if(region.toast){const toast=region.toast;ctx.fillStyle='rgba(45,50,57,.70)';ctx.beginPath();ctx.roundRect(toast.x,toast.y,toast.w,toast.h,12);ctx.fill();ctx.font='400 20px ReferenceRoboto';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Call ended',toast.x+toast.w/2,toast.y+toast.h/2);}
    }
    ctx.restore();
  }
  if(!isCurrent()) return false;
  const statusTemplate=templates.find(item=>item.id===values.topStyle);
  if(statusTemplate){
    const statusCanvas=canvas.ownerDocument.createElement('canvas');
    const statusValues=Object.fromEntries(Object.entries(statusTemplate.fields).map(([key,field])=>[key,field.value]));
    for(const key of ['time','battery'])if(values[key]!==undefined&&statusTemplate.fields[key])statusValues[key]=values[key];
    if(!await renderReference(statusCanvas,statusTemplate,statusValues,isCurrent))return false;
    ctx.drawImage(statusCanvas,0,0,statusTemplate.width,55,0,0,template.width,55);
  }
  if(!isCurrent())return false;
  drawPhoneBars(ctx,template,values);
  canvas.width=template.width;canvas.height=template.height;
  canvas.getContext('2d').drawImage(buffer,0,0);
  return true;
}
