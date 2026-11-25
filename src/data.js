export const dateKey=(offset=0)=>{const d=new Date();d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
export const dateLabel=v=>v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}):'—'
export const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`
export function seed(){return {version:1,settings:{name:'',business:'La Farina Artesanal',driveFolder:''},products:[
{id:'p1',name:'Sourdough',category:'Pães',price:32,cost:12,active:true,image:'sourdough.jpg',description:'Pão de fermentação natural.'},
{id:'p2',name:'Caseiro artesanal',category:'Pães',price:22,cost:8,active:true,image:'',description:'Pão macio, feito para todos os dias.'},
{id:'p3',name:'Batatalho',category:'Salgados',price:15,cost:6,active:true,image:'batatalho.jpg',description:'Pão de batata com requeijão e pasta de alho.'},
{id:'p4',name:'Cookie',category:'Doces',price:9,cost:3.5,active:true,image:'',description:'Cookies em fornadas especiais.'}],
batches:[{id:'b1',productId:'p1',qty:8,date:dateKey(),status:'Em produção',notes:'Fermentação natural'},{id:'b2',productId:'p3',qty:12,date:dateKey(),status:'Pronta',notes:''},{id:'b3',productId:'p2',qty:6,date:dateKey(1),status:'Planejada',notes:''}],
sales:[{id:'s1',productId:'p1',qty:2,price:32,cost:12,date:dateKey(-2),payment:'Pix',customer:'Mariana'},{id:'s2',productId:'p3',qty:6,price:15,cost:6,date:dateKey(-1),payment:'Pix',customer:'Ana'},{id:'s3',productId:'p2',qty:2,price:22,cost:8,date:dateKey(),payment:'Dinheiro',customer:''},{id:'s4',productId:'p3',qty:4,price:15,cost:6,date:dateKey(),payment:'Pix',customer:'Camila'}],
orders:[{id:'o1',customer:'Julia',productId:'p1',qty:2,price:32,cost:12,date:dateKey(1),status:'Confirmada',notes:'Retirada pela manhã',payment:'Pix'},{id:'o2',customer:'Rafael',productId:'p3',qty:6,price:15,cost:6,date:dateKey(2),status:'Pendente',notes:'Confirmar horário pelo WhatsApp',payment:'Pix'}],expenses:[{id:'e1',name:'Energia e gás',amount:45,date:dateKey(-2),category:'Energia / gás'},{id:'e2',name:'Entrega de pedidos',amount:18,date:dateKey(-1),category:'Entrega'}],studio:[]}}
// The adapter contract is deliberately asynchronous-ready. Replace this adapter
// with a Supabase implementation (authenticated owner, RLS, per-table records).
export const storageKey='la-farina-studio-v01';
export const localRepository={load(){try{const x=JSON.parse(localStorage.getItem(storageKey));if(validBackup(x))return x}catch{}return seed()},save(data){localStorage.setItem(storageKey,JSON.stringify(data))},reset(){localStorage.removeItem(storageKey);return seed()}}
export function validBackup(x){return x?.version===1&&x.settings&&['products','batches','sales','orders','expenses','studio'].every(k=>Array.isArray(x[k]))}
export const product=(d,id)=>d.products.find(p=>p.id===id)||{name:'Produto removido',price:0,cost:0,category:'',image:''}
export const totals=(d,from,to)=>{const within=x=>(!from||x.date>=from)&&(!to||x.date<=to);const sales=d.sales.filter(within),expenses=d.expenses.filter(within);return {revenue:sales.reduce((s,x)=>s+x.qty*x.price,0),cost:sales.reduce((s,x)=>s+x.qty*x.cost,0),expenses:expenses.reduce((s,x)=>s+x.amount,0),units:sales.reduce((s,x)=>s+x.qty,0),count:sales.length}}
export const driveRepository={folderLink(id){return id?`https://drive.google.com/drive/folders/${encodeURIComponent(id)}`:''}};

