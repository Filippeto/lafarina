import {localRepository,validBackup,product,uid,dateKey} from './data.js';
export const routes=['dashboard','producao','vendas','encomendas','financeiro','catalogo','estudio','configuracoes'];
const getRoute=()=>{const r=location.hash.slice(1);return routes.includes(r)?r:'dashboard'};
let state={data:localRepository.load(),route:getRoute(),modal:null,menu:false,filter:'Todos',period:'month',toast:'',prompt:'',search:'',imagePreview:'',studioDraft:{}};
const listeners=new Set();let toastTimer;
export const getState=()=>state;
export const subscribe=fn=>{listeners.add(fn);return()=>listeners.delete(fn)};
export function update(patch){state={...state,...patch};listeners.forEach(fn=>fn())}
function persist(data){try{localRepository.save(data);update({data});return true}catch{notice('Não foi possível salvar. Verifique o espaço disponível.');return false}}
export function notice(text){update({toast:text});clearTimeout(toastTimer);toastTimer=setTimeout(()=>update({toast:''}),3600)}
export function navigate(route){if(!routes.includes(route))return;location.hash=route;update({route,modal:null,menu:false,filter:'Todos',search:''});window.scrollTo(0,0)}
window.addEventListener('hashchange',()=>{if(getRoute()!==state.route)navigate(getRoute())});
export function action(el){const {action,id,type,value}=el.dataset;const d=state.data;
switch(action){case 'navigate':navigate(value);break;case 'menu':update({menu:!state.menu});break;case 'close':update({modal:null,menu:false});break;case 'open':update({modal:{type,id:id||null}});break;case 'filter':update({filter:value});break;case 'period':update({period:value});break;
case 'advance':{const key=type==='batch'?'batches':'orders';const steps=type==='batch'?['Planejada','Em produção','Pronta']:['Pendente','Confirmada','Em produção','Pronta','Entregue'];const row=d[key].find(x=>x.id===id);if(!row)return;const next=steps[steps.indexOf(row.status)+1];if(!next)return;const data={...d,[key]:d[key].map(x=>x.id===id?{...x,status:next}:x)};if(next==='Entregue'){data.sales=[{id:uid(),productId:row.productId,qty:row.qty,price:row.price,cost:row.cost,date:dateKey(),payment:row.payment,customer:row.customer,orderId:row.id},...d.sales]}if(persist(data))notice(next==='Entregue'?'Encomenda entregue e venda registrada!':'Status atualizado.');break;}
case 'toggle':if(persist({...d,products:d.products.map(p=>p.id===id?{...p,active:!p.active}:p)}))notice('Catálogo atualizado.');break;
case 'delete':{const key=type; if(!['batches','sales','orders','expenses','studio'].includes(key))return;if(!confirm('Remover este registro?'))return;if(persist({...d,[key]:d[key].filter(x=>x.id!==id)})){update({modal:null});notice('Registro removido.')}break;}
case 'export':{const url=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`la-farina-backup-${dateKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('Backup exportado.');break;}
case 'reset':if(confirm('Apagar os registros locais e restaurar os dados de exemplo?')){const data=localRepository.reset();persist(data);notice('Dados de exemplo restaurados.')}break;
case 'copy':if(navigator.clipboard?.writeText)navigator.clipboard.writeText(state.prompt).then(()=>notice('Prompt copiado!')).catch(()=>fallbackCopy());else fallbackCopy();break;
case 'savePrompt':if(state.prompt&&persist({...d,studio:[{id:uid(),prompt:state.prompt,date:dateKey()},...d.studio]}))notice('Prompt salvo no estúdio.');break;
}}
function fallbackCopy(){const t=document.createElement('textarea');t.value=state.prompt;document.body.append(t);t.select();try{document.execCommand('copy');notice('Prompt copiado!')}catch{notice('Selecione e copie o texto do prompt.')}t.remove()}
export function submit(form){const f=Object.fromEntries(new FormData(form));const d=state.data; const type=form.dataset.form;
if(type==='settings'){if(persist({...d,settings:{...d.settings,name:f.name,business:f.business,driveFolder:f.driveFolder.trim()}}))notice('Configurações salvas.');return}
if(type==='prompt'){update({studioDraft:f,prompt:`Fotografia editorial de produto para La Farina Artesanal: ${product(d,f.productId).name}. ${f.style}. Enquadramento ${f.format}, luz natural suave, texturas reais, paleta creme, bege e marrom, atmosfera artesanal acolhedora. ${f.notes?`Detalhes: ${f.notes}. `:''}Preservar fielmente o formato do pão e da embalagem da foto de referência. Sem textos, logotipos inventados ou elementos artificiais.`});return}
const key={batch:'batches',sale:'sales',order:'orders',expense:'expenses',product:'products'}[type];if(!key)return;
const id=state.modal?.id||uid(),old=d[key].find(x=>x.id===id),p=product(d,f.productId);let row;
if(type==='product')row={...old,id,name:f.name,category:f.category,price:Number(f.price),cost:Number(f.cost),description:f.description,active:old?.active??true,image:old?.image||''};
if(type==='batch')row={...old,id,productId:f.productId,qty:Number(f.qty),date:f.date,status:f.status,notes:f.notes};
if(type==='sale')row={...old,id,productId:f.productId,qty:Number(f.qty),price:Number(f.price),cost:old?.productId===f.productId?old.cost:p.cost,date:f.date,payment:f.payment,customer:f.customer};
if(type==='order')row={...old,id,productId:f.productId,qty:Number(f.qty),price:Number(f.price),cost:old?.productId===f.productId?old.cost:p.cost,date:f.date,payment:f.payment,customer:f.customer,notes:f.notes,status:old?.status||'Pendente'};
if(type==='expense')row={...old,id,name:f.name,amount:Number(f.amount),category:f.category,date:f.date};
if(persist({...d,[key]:old?d[key].map(x=>x.id===id?row:x):[row,...d[key]]})){update({modal:null});notice('Registro salvo com sucesso!')}
}
export async function change(el){if(el.name==='productId'&&el.form?.querySelector('[name=price]'))el.form.querySelector('[name=price]').value=product(state.data,el.value).price;
if(el.id==='import-backup'&&el.files?.[0]){try{const data=JSON.parse(await el.files[0].text());if(!validBackup(data))throw Error();if(confirm('Substituir os dados locais por este backup?')&&persist(data))notice('Backup importado.')}catch{notice('Arquivo de backup inválido.')}el.value=''}
if(el.id==='reference-photo'&&el.files?.[0]){const file=el.files[0];if(!file.type.startsWith('image/')){notice('Selecione uma imagem.');return}if(state.imagePreview)URL.revokeObjectURL(state.imagePreview);update({imagePreview:URL.createObjectURL(file),studioDraft:Object.fromEntries(new FormData(el.form))})}}

