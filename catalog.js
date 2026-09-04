
let PRODUCTS=[];
const FORM_BASE='https://docs.google.com/forms/d/e/1FAIpQLSeKH2ZTbvdDYOL3uxVm0OI38iVhjhxnN9cTzNdfo5TiWOW8TQ/viewform?usp=pp_url&entry.1065662702=';
const grid=document.getElementById('grid'),search=document.getElementById('search'),category=document.getElementById('category'),count=document.getElementById('count'),empty=document.getElementById('empty');
const modal=document.getElementById('modal'),modalImg=document.getElementById('modalImg'),modalName=document.getElementById('modalName'),modalCat=document.getElementById('modalCat'),modalMeta=document.getElementById('modalMeta'),modalDesc=document.getElementById('modalDesc'),modalQuote=document.getElementById('modalQuote');

function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function quoteUrl(design){return FORM_BASE+encodeURIComponent('MB1-'+design);}

function render(){
 const q=(search.value||'').trim().toLowerCase(),c=category.value||'';
 const filtered=PRODUCTS.filter(p=>{const hay=(p.design+' '+p.sku+' '+p.name+' '+p.category).toLowerCase();return(!q||hay.includes(q))&&(!c||p.category===c)});
 count.textContent=filtered.length.toLocaleString()+' designs shown';
 empty.style.display=filtered.length?'none':'block';
 grid.innerHTML=filtered.map(p=>`
 <article class="card">
   <div class="art"><img loading="lazy" src="${esc(p.thumb)}" alt="${esc(p.alt)}"></div>
   <div class="info">
     <div class="cat">${esc(p.category)}</div>
     <div class="name">${esc(p.name)}</div>
     <div class="meta">${esc(p.sku)}<br><span class="price">Starting at $${esc(p.price)}</span> · ${esc(p.sizes)}</div>
     <div class="actions">
       <button onclick="openProduct('${esc(p.design)}')">View Design</button>
       <a class="secondary" href="${quoteUrl(p.design)}" target="_blank" rel="noopener">Customize</a>
     </div>
   </div>
 </article>`).join('');
}

function openProduct(id){
 const p=PRODUCTS.find(x=>x.design===id);if(!p)return;
 modalImg.src=p.image;modalImg.alt=p.alt;modalName.textContent=p.name;modalCat.textContent=p.category;
 modalMeta.innerHTML=`<span class="pill">${esc(p.sku)}</span><span class="pill">Design ${esc(p.design)}</span><span class="pill">${esc(p.sizes)}</span><span class="pill">Starting at $${esc(p.price)}</span>`;
 modalDesc.textContent=p.description;
 modalQuote.href=quoteUrl(p.design);
 modalQuote.textContent='Customize / Request Quote for MB1-'+p.design;
 modal.classList.add('open');
}
function closeModal(){modal.classList.remove('open')}
document.getElementById('closeModal').onclick=closeModal;
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
search.addEventListener('input',render);category.addEventListener('change',render);

fetch('catalog-data.json').then(r=>r.json()).then(data=>{
 PRODUCTS=data;
 [...new Set(PRODUCTS.map(p=>p.category))].sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;category.appendChild(o)});
 render();
}).catch(()=>{empty.textContent='Catalog data could not be loaded.';empty.style.display='block'});
