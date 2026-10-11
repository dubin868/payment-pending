export function randomReference(template,key){
  const original=template.fields[key]?.value||'';
  let prefix='',length=original.length,alphabet='0123456789';
  if(key==='fcTransaction'){prefix='AXIFRC';length=original.length-prefix.length;alphabet='0123456789abcdef';}
  else if(key==='order'){prefix='OMK';length=original.length-prefix.length;alphabet='0123456789abcdef';}
  else if(original.startsWith('PTM')||template.id==='paytm-process-gray'){prefix='PTM';length=original?original.length-3:32;alphabet='0123456789abcdef';}
  else if(key!=='transaction'||!/^\d+$/.test(original))throw new Error('此字段没有可用的编号格式');
  if(length<1)throw new Error('编号长度无效');
  let result=prefix;
  // Rejection sampling avoids modulo bias for decimal digits.
  const limit=256-256%alphabet.length;
  while(result.length<prefix.length+length){
    const bytes=crypto.getRandomValues(new Uint8Array(length));
    for(const byte of bytes){if(byte<limit)result+=alphabet[byte%alphabet.length];if(result.length===prefix.length+length)break;}
  }
  return result;
}
