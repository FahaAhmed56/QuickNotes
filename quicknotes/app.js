const KEY='quicknotes.v1';
const $=s=>document.querySelector(s);
let notes=load(),filter='all';
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function save(){localStorage.setItem(KEY,JSON.stringify(notes))}
function button(label,cls,fn,aria){const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=label;b.setAttribute('aria-label',aria);b.addEventListener('click',fn);return b}
function render(){
 const q=$('#search').value.trim().toLowerCase();
 const list=notes.filter(n=>(filter==='all'||n.pinned)&&(`${n.title} ${n.body}`).toLowerCase().includes(q))
 .sort((a,b)=>Number(b.pinned)-Number(a.pinned)||b.created-a.created);
 $('#grid').replaceChildren();
 list.forEach(n=>{
  const card=document.createElement('article');card.className='note';
  const top=document.createElement('div');top.className='note-top';
  const h=document.createElement('h3');h.textContent=n.title;
  top.append(h,button(n.pinned?'★':'☆','icon',()=>{n.pinned=!n.pinned;save();render()},'Toggle pin'));
  const p=document.createElement('p');p.textContent=n.body;
  const date=document.createElement('small');date.textContent=new Date(n.created).toLocaleDateString();
  const actions=document.createElement('div');actions.className='actions';
  const copy=button('Copy','icon',async()=>{try{await navigator.clipboard.writeText(n.title+'\n\n'+n.body);copy.textContent='Copied!'}catch{copy.textContent='Copy unavailable'}},'Copy note');
  const del=button('Delete','icon',()=>{notes=notes.filter(x=>x.id!==n.id);save();render()},'Delete note');
  actions.append(copy,del);card.append(top,p,date,actions);$('#grid').append(card);
 });
 $('#total').textContent=notes.length;$('#empty').hidden=list.length>0;
 $('#empty').textContent=notes.length?'No notes match your search or filter.':'No notes yet. Add your first thought above ✦';
}
$('#noteForm').addEventListener('submit',e=>{e.preventDefault();const title=$('#title').value.trim(),body=$('#body').value.trim();if(!title||!body)return;
 notes.unshift({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),title,body,pinned:false,created:Date.now()});save();e.target.reset();$('#count').textContent='0 / 2000';render();$('#title').focus()});
$('#body').addEventListener('input',()=>$('#count').textContent=$('#body').value.length+' / 2000');
$('#search').addEventListener('input',render);
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));render()}));
$('#exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(notes,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='quicknotes-backup.json';a.click();URL.revokeObjectURL(url)});
render();
