import {templates,providers} from './reference-data.mjs';
import {renderReference,validAmount} from './reference-renderer.mjs';
import {randomReference} from './random-reference.mjs';
const $=id=>document.getElementById(id);
const canvas=$('preview'),editor=$('editor'),selector=$('template'),status=$('status'),download=$('download');
const byId=new Map(templates.map(template=>[template.id,template]));
const defaults=template=>Object.fromEntries(Object.entries(template.fields).map(([key,field])=>[key,field.value]));
const states=Object.fromEntries(templates.map(template=>[template.id,defaults(template)]));
const selected={freecharge:'freecharge-overview',paytm:'paytm-process-white',mobikwik:'mobikwik-blue'};
let provider='freecharge',current=byId.get(selected[provider]),revision=0,renderTask=Promise.resolve(),exporting=false;
function announce(message,error=false){status.textContent=message;status.classList.toggle('error',error);}
function validate(template,values){
  for(const [key,field] of Object.entries(template.fields)){
    const value=values[key];
    if(typeof value!=='string') return field.label+'的格式不正确';
    if(field.type==='amount'&&!validAmount(value))return '金额必须为 1 至 999,999,999 之间的整数';
    if(field.type==='battery'&&(!/^\d{1,3}$/.test(value)||Number(value)>100))return '电池电量必须为 0 至 100 之间的整数';
    if(field.type==='datetime-local'&&(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)||Number.isNaN(new Date(value).getTime())))return '请填写有效的交易日期与时间';
    if(field.type==='image'&&value&&!value.startsWith('data:image/'))return '头像或图标的格式不正确';
  }
  return '';
}
function initials(name){const words=name.replace(/^(Mr|Mrs|Ms|Dr)\.?\s+/i,'').trim().split(/\s+/).filter(Boolean);return words.length>1?words[0][0]+words.at(-1)[0]:(words[0]||'').slice(0,2);}
function groupFor(key){if(['time','battery'].includes(key))return '手机状态栏';if(key.endsWith('Photo')||key.endsWith('Initials')||key==='bankLogo')return '头像与银行图标';if(['started','transferred','sent','depositing','notice','credited'].includes(key))return '状态与进度';return '交易信息';}
function createEditor(){
  editor.replaceChildren();const groups=new Map();
  for(const [key,field] of Object.entries(current.fields)){
    const groupName=groupFor(key);
    if(!groups.has(groupName)){const section=document.createElement('fieldset'),legend=document.createElement('legend'),body=document.createElement('div');legend.textContent=groupName;body.className='fields';section.append(legend,body);editor.append(section);groups.set(groupName,body);}
    const wrap=document.createElement('div');wrap.className='field';
    const label=document.createElement('label');label.htmlFor='field-'+key;label.textContent=field.label;
    const input=document.createElement(['notice','started','transferred','sent','depositing'].includes(key)?'textarea':'input');input.id='field-'+key;input.name=key;
    if(field.type==='image'){
      input.type='file';input.accept='image/png,image/jpeg,image/webp';const row=document.createElement('div');row.className='file-row';const remove=document.createElement('button');remove.type='button';remove.className='small-button';remove.textContent='恢复原图';remove.addEventListener('click',()=>{states[current.id][key]='';input.value='';queueRender();});row.append(input,remove);wrap.append(label,row);
      input.addEventListener('change',async()=>{const file=input.files?.[0],id=current.id;if(!file)return;if(!file.type.startsWith('image/')||file.size>10*1024*1024){announce('请选择不超过 10 MB 的图片',true);input.value='';return;}try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file);});if(!input.isConnected||current.id!==id||input.files?.[0]!==file)return;states[id][key]=data;queueRender();}catch{announce('图片读取失败，请重新选择',true);}});
    } else {
      if(input.tagName==='INPUT')input.type=field.type==='amount'||field.type==='battery'?'number':field.type==='datetime-local'?'datetime-local':'text';input.value=states[current.id][key];input.maxLength=320;
      if(input.type==='number'){input.min=field.type==='amount'?'1':'0';input.max=field.type==='amount'?'999999999':'100';input.step='1';input.required=true;}
      if(input.type==='datetime-local')input.required=true;
      if(['started','transferred','depositing'].includes(key))input.placeholder='留空时随姓名和银行信息自动生成';
      if(current.id==='paytm-process-gray'&&key==='transaction')input.placeholder='原图被遮挡；填写完整编号后替换';
      input.addEventListener('input',()=>{const values=states[current.id],previous=values[key];values[key]=input.value;if(['recipient','sender'].includes(key)){const initialKey=key+'Initials';if(current.fields[initialKey]&&(values[initialKey]===current.fields[initialKey].value||values[initialKey]===initials(previous))){values[initialKey]=initials(input.value);const initialInput=editor.elements.namedItem(initialKey);if(initialInput)initialInput.value=values[initialKey];}}queueRender();});wrap.append(label,input);
    }
    if(['transaction','order','fcTransaction'].includes(key)){
      const row=document.createElement('div');row.className='file-row';
      const random=document.createElement('button');random.type='button';random.className='small-button';random.textContent='随机';random.setAttribute('aria-label','随机生成'+field.label);
      random.addEventListener('click',()=>{input.value=randomReference(current,key);states[current.id][key]=input.value;queueRender();});
      row.append(input,random);wrap.append(row);
    }
    groups.get(groupName).append(wrap);
  }
}
function queueRender(){
  const turn=++revision,template=current,values={...states[template.id]};download.disabled=true;$('renderState').textContent='正在更新';
  const error=validate(template,values);
  if(error){announce(error,true);$('renderState').textContent='输入待修正';return renderTask=Promise.resolve(false);}
  renderTask=renderReference(canvas,template,values,()=>revision===turn).then(drawn=>{if(!drawn)return false;download.disabled=exporting;$('dimensions').textContent=`${template.width} × ${template.height} 像素 · 原始屏幕尺寸`;$('renderState').textContent='预览已更新';canvas.setAttribute('aria-label',`${providers[provider]} ${template.label}，固定 ${template.width} × ${template.height} 像素`);announce('预览已更新，可以下载。');return true;}).catch(error=>{if(turn===revision){announce(error.message||'预览加载失败，请重试',true);$('renderState').textContent='更新失败';download.disabled=true;}return false;});
  return renderTask;
}
function chooseTemplate(id){
  const template=byId.get(id);if(!template)return;provider=template.provider;current=template;selected[provider]=id;
  for(const button of document.querySelectorAll('[data-provider]'))button.setAttribute('aria-pressed',String(button.dataset.provider===provider));
  selector.replaceChildren(...templates.filter(item=>item.provider===provider).map(item=>{const option=document.createElement('option');option.value=item.id;option.textContent=item.label;return option;}));selector.value=id;
  $('original').src=template.src;$('templateNote').textContent=id==='paytm-process-gray'?'本示例包含通话结束提示，原图遮挡区域会保留。':'固定背景、图标和排版沿用所选示例。';
  createEditor();queueRender();
  for(const key of ['topStyle','bottomStyle'])$(key).value=states[current.id][key]||'original';
}
for(const key of ['topStyle','bottomStyle'])$(key).addEventListener('change',()=>{states[current.id][key]=$(key).value;queueRender();});
for(const button of document.querySelectorAll('[data-provider]'))button.addEventListener('click',()=>chooseTemplate(selected[button.dataset.provider]));
selector.addEventListener('change',()=>chooseTemplate(selector.value));
editor.addEventListener('submit',event=>event.preventDefault());
$('compare').addEventListener('change',()=>{$('originalFigure').hidden=!$('compare').checked;$('previews').classList.toggle('compare',$('compare').checked);});
download.addEventListener('click',async()=>{
  if(exporting)return;exporting=true;download.disabled=true;const turn=revision,template=current,values={...states[template.id]};
  try{
    if(!await renderTask||turn!==revision)return;
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw Error('PNG 生成失败，请重试');
    if(turn!==revision){announce('内容已变更，请重新点击下载。');return;}
    const date=(values.paymentAt||values.dateText||'').replace(/[^a-z0-9-]/gi,'-').slice(0,40);
    const reference=(values.transaction||values.order||'').replace(/[^a-z0-9-]/gi,'-').slice(0,50);
    const filename=[template.id,date,reference].filter(Boolean).join('_')+'.png';
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);announce(`已下载：${filename}`);
  }catch(error){announce(error.message||'下载失败，请重试',true);}finally{exporting=false;download.disabled=Boolean(validate(current,states[current.id]))||$('renderState').textContent!=='预览已更新';}
});
chooseTemplate(current.id);

