export function parseFields(fields:string[]):Record<string,string>{
  const obj:Record<string,string>={};
  for(let i=0;i<fields.length;i+=2){
    obj[fields[i]]=fields[i+1];
  }
  return obj
}