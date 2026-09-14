
let PRODUCTS=[];
const PUBLIC_CHUNKS=["catalog-public-v19-mini-01.json","catalog-public-v19-mini-02.json","catalog-public-v19-mini-03.json","catalog-public-v19-mini-04.json","catalog-public-v19-mini-05.json","catalog-public-v19-mini-06.json","catalog-public-v19-mini-07.json","catalog-public-v19-mini-08.json","catalog-public-v19-mini-09.json","catalog-public-v19-mini-10.json","catalog-public-v19-mini-11.json","catalog-public-v19-mini-12.json","catalog-public-v19-mini-13.json","catalog-public-v19-mini-14.json","catalog-public-v19-mini-15.json","catalog-public-v19-mini-16.json"];

const CATEGORY_CODES=["memorial and tribute","lake house and nautical","beach and coastal","family & name","home decor and inspirational","sports and hobbies","seasonal and holiday","wildlife and outdoors","garage and workshop","farm and western","wedding and events","address and property","religious","more designs"];
function decodeManifest(rows){
  const cloud='https://res.cloudinary.com/oxygre42/image/upload/';
  return (rows||[]).map(r=>{
    const [design,name,primaryCode,catCodes,pid,customFlag]=r,primary=CATEGORY_CODES[primaryCode]||'more designs',cats=(catCodes||[]).map(i=>CATEGORY_CODES[i]).filter(Boolean);
    const original=pid?cloud+pid+'.png':'image-coming-soon.svg',image=pid?cloud+'f_auto,q_auto,c_pad,b_white,w_1200,h_1200/'+pid+'.png':'image-coming-soon.svg',thumb=pid?cloud+'f_auto,q_auto,c_pad,b_white,w_500,h_500/'+pid+'.png':'image-coming-soon.svg';
    return {design,name,sku:'MB1-'+design,category:primary,categories:cats.length?cats:[primary],description:'',alt:name+' custom metal sign design by MB1 Advanced Solutions',image,image1200:image,thumb,thumbnail:thumb,originalImage:original,images:[{url:image,thumb,alt:name+' custom metal sign design by MB1 Advanced Solutions',type:'main'}],customizable:customFlag===1,publishable:true};
  });
}

const paramsAtLoad=new URLSearchParams(window.location.search);
const QUERY_CUSTOMIZABLE=paramsAtLoad.get('customizable')==='1';
const REQUESTED_CATEGORY=(paramsAtLoad.get('category')||'').trim().toLowerCase();
const CATEGORY_LABELS={
"address and property":"Address & Property","beach and coastal":"Beach & Coastal","family & name":"Family & Name","farm and western":"Farm & Western","garage and workshop":"Garage & Workshop","home decor and inspirational":"Home Décor & Inspirational","lake house and nautical":"Lake House & Nautical","memorial and tribute":"Memorial & Tribute","seasonal and holiday":"Seasonal & Holiday","sports and hobbies":"Sports & Hobbies","wedding and events":"Wedding & Events","wildlife and outdoors":"Wildlife & Outdoors","religious":"Religious","more designs":"More Designs"
};
const grid=document.getElementById('grid'),search=document.getElementById('search'),category=document.getElementById('category'),categoryButtons=document.getElementById('categoryButtons'),count=document.getElementById('count');
const modal=document.getElementById('modal'),modalImg=document.getElementById('modalImg'),modalName=document.getElementById('modalName'),modalCat=document.getElementById('modalCat'),modalMeta=document.getElementById('modalMeta'),modalDesc=document.getElementById('modalDesc'),modalSize=document.getElementById('modalSize'),modalColor=document.getElementById('modalColor'),modalTotal=document.getElementById('modalTotal'),buyNow=document.getElementById('buyNow'),shippingStatus=document.getElementById('shippingStatus'),oversizeQuote=document.getElementById('oversizeQuote'),customArea=document.getElementById('customArea'),customizeBtn=document.getElementById('customizeBtn'),copyDirectLink=document.getElementById('copyDirectLink'),copyLinkStatus=document.getElementById('copyLinkStatus'),galleryMain=document.getElementById('galleryMain'),galleryPrev=document.getElementById('galleryPrev'),galleryNext=document.getElementById('galleryNext'),galleryThumbs=document.getElementById('galleryThumbs'),galleryMeta=document.getElementById('galleryMeta'),galleryCount=document.getElementById('galleryCount'),galleryLabel=document.getElementById('galleryLabel');
let currentDesign='',currentImages=[],currentImageIndex=0,galleryTouchStartX=null;
const PRICE_MAP={"8":49,"12":69,"18":109,"24":149,"30":195,"36":265,"48":349};
const STRIPE_LINKS={"8":"https://buy.stripe.com/14AbJ380yaUU8Df8g02VG00","12":"https://buy.stripe.com/bJe3cxdkS4wwcTv53O2VG02","18":"https://buy.stripe.com/6oU14pgx47II4mZcwg2VG03","24":"https://buy.stripe.com/8x200l80y6EEg5HeEo2VG04","30":"https://buy.stripe.com/14A3cx6Wu1kkdXzfIs2VG05","36":"https://buy.stripe.com/fZu14pcgOaUU1aN67S2VG01","48":"https://buy.stripe.com/aFa8wR80y7IIf1DeEo2VG06"};
const CUSTOM_FORM_BASE='https://docs.google.com/forms/d/e/1FAIpQLSeKH2ZTbvdDYOL3uxVm0OI38iVhjhxnN9cTzNdfo5TiWOW8TQ/viewform?usp=pp_url';
const CUSTOM_DESIGN_ENTRY='entry.1065662702',CUSTOM_SIZE_ENTRY='entry.1789039289',CUSTOM_COLOR_ENTRY='entry.1061966535';
const OVERSIZE_FORM_BASE='https://docs.google.com/forms/d/e/1FAIpQLSeOyQaB5oKV2CMVBqN3XjQciv09BI_SyMzK2S8c3Yb4Y_sE3Q/viewform?usp=pp_url';
const OVERSIZE_DESIGN_ENTRY='entry.447186126',OVERSIZE_SIZE_ENTRY='entry.812995910',OVERSIZE_COLOR_ENTRY='entry.1420959582';
const DIRECT_LINK_BASE='https://mb1advancedsolutions.github.io/mb1-catalog/index.html';

function e(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function normDesign(v){const m=String(v||'').match(/(?:MB1[-_ ]*)?(\d{1,4})/i);return m?m[1].padStart(4,'0'):''}
function normCat(c){c=String(c||'').trim().toLowerCase();if(c==='home décor & inspirational')c='home decor and inspirational';if(c==='internal catalog review')c='more designs';return c}
function productCategories(p){const raw=(Array.isArray(p.categories)&&p.categories.length)?p.categories:[p.category];return [...new Set(raw.map(normCat).filter(Boolean))]}
function categoryLabel(c){return CATEGORY_LABELS[normCat(c)]||String(c||'')}
function baseProducts(){return QUERY_CUSTOMIZABLE?PRODUCTS.filter(p=>p.customizable===true):PRODUCTS}
function safeRef(t){return String(t||'').toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'')}
function savePendingOrderReference(ref){if(!ref)return;const payload=JSON.stringify({ref,ts:Date.now()});try{sessionStorage.setItem('mb1_pending_order_reference',payload)}catch(e){}try{localStorage.setItem('mb1_pending_order_reference',payload)}catch(e){}}

function mergeCatalog(base,pub){
  const baseMap=new Map((base||[]).map(p=>[normDesign(p.design),p]));
  return (pub||[]).map(s=>{
    const id=normDesign(s.design),b=baseMap.get(id)||{};
    const cats=[...new Set([...productCategories(s),...productCategories(b)])];
    const gallery=(Array.isArray(b.images)&&b.images.length>1)?b.images:(Array.isArray(s.images)?s.images:[]);
    return {...b,...s,design:id,category:normCat(s.category||b.category||cats[0]||'more designs'),categories:cats,
      description:s.description||b.description||'',
      alt:b.alt||s.alt||s.name||b.name||'',
      images:gallery,
      thumb:b.thumb||b.thumbnail||s.thumb||s.thumbnail||b.image||s.image||'image-coming-soon.svg',
      thumbnail:b.thumbnail||b.thumb||s.thumbnail||s.thumb||'image-coming-soon.svg',
      image:b.image||b.image1200||s.image||s.image1200||'image-coming-soon.svg',
      originalImage:b.originalImage||s.originalImage||b.image||s.image||'image-coming-soon.svg',
      customizable:(s.customizable===true||b.customizable===true)
    };
  });
}

function buildCategoryButtons(){
  const source=baseProducts(),counts={};
  source.forEach(p=>productCategories(p).forEach(c=>counts[c]=(counts[c]||0)+1));
  const cats=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]||categoryLabel(a).localeCompare(categoryLabel(b)));
  const allLabel=QUERY_CUSTOMIZABLE?'All Customizable':'All Designs';
  categoryButtons.innerHTML=`<button class="category-btn active" data-cat="">${e(allLabel)} (${source.length.toLocaleString()})</button>`+cats.map(c=>`<button class="category-btn" data-cat="${e(c)}">${e(categoryLabel(c))} (${counts[c].toLocaleString()})</button>`).join('');
  categoryButtons.querySelectorAll('.category-btn').forEach(btn=>btn.addEventListener('click',()=>{category.value=btn.dataset.cat;render();}));
  category.innerHTML='<option value="">All categories</option>';
  [...cats].sort((a,b)=>categoryLabel(a).localeCompare(categoryLabel(b))).forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=categoryLabel(c);category.appendChild(o);});
  document.querySelector('.customizable-link').textContent='Customizable ('+PRODUCTS.filter(p=>p.customizable===true).length.toLocaleString()+')';
}

function render(){
  const q=(search.value||'').trim().toLowerCase(),c=normCat(category.value||'');
  const source=baseProducts();
  const filtered=source.filter(p=>{const cats=productCategories(p);const hay=(p.design+' '+p.sku+' '+p.name+' '+p.category+' '+cats.join(' ')).toLowerCase();return(!q||hay.includes(q))&&(!c||cats.includes(c));});
  count.textContent=filtered.length.toLocaleString()+' designs shown';
  categoryButtons.querySelectorAll('.category-btn').forEach(btn=>btn.classList.toggle('active',normCat(btn.dataset.cat)===c));
  grid.innerHTML=filtered.map(p=>`<article class="card"><div class="art"><img loading="lazy" src="${e(p.thumb||p.image)}" alt="${e(p.alt||p.name)}"></div><div class="info"><div class="cat">${e(categoryLabel(c||p.category))}</div><div class="name">${e(p.name)}</div><div class="meta">${e(p.sku||('MB1-'+p.design))}<br><span class="price">From $49</span> · 8&quot;–48&quot;</div><button class="view-button" data-design="${e(p.design)}">View Design</button></div></article>`).join('');
  grid.querySelectorAll('.view-button').forEach(btn=>btn.addEventListener('click',()=>{const p=PRODUCTS.find(x=>normDesign(x.design)===normDesign(btn.dataset.design));if(p)openProductData(p);}));
}

function normalizeGalleryImages(d){
  const raw=(Array.isArray(d.images)&&d.images.length)?d.images:[{url:d.image||d.image1200,thumb:d.thumb||d.thumbnail||d.image,alt:d.alt||d.name,type:'main'}];
  const seen=new Set();
  return raw.map((item,i)=>{if(typeof item==='string')item={url:item};const url=item&&(item.url||item.image)||'';if(!url||seen.has(url))return null;seen.add(url);return {url,thumb:item.thumb||url,alt:item.alt||d.alt||d.name||'',type:item.type||(i===0?'main':'photo')};}).filter(Boolean).slice(0,5);
}
function setGalleryImage(i){if(!currentImages.length)return;currentImageIndex=(i+currentImages.length)%currentImages.length;const img=currentImages[currentImageIndex];modalImg.src=img.url;modalImg.alt=img.alt||'';galleryCount.textContent=(currentImageIndex+1)+' of '+currentImages.length;galleryLabel.textContent=(img.type||'photo').replace(/[-_]/g,' ');galleryThumbs.querySelectorAll('.gallery-thumb').forEach((b,n)=>b.classList.toggle('active',n===currentImageIndex));}
function renderGallery(d){currentImages=normalizeGalleryImages(d);currentImageIndex=0;const many=currentImages.length>1;galleryPrev.style.display=many?'block':'none';galleryNext.style.display=many?'block':'none';galleryThumbs.style.display=many?'flex':'none';galleryMeta.style.display=many?'flex':'none';galleryThumbs.innerHTML=many?currentImages.map((img,i)=>`<button class="gallery-thumb${i===0?' active':''}" type="button" data-i="${i}"><img src="${e(img.thumb)}" alt=""></button>`).join(''):'';galleryThumbs.querySelectorAll('.gallery-thumb').forEach(b=>b.addEventListener('click',()=>setGalleryImage(Number(b.dataset.i))));if(currentImages.length)setGalleryImage(0);}
function putDesignInAddressBar(design,mode='push'){const u=new URL(location.href);u.searchParams.set('design',normDesign(design));const next=u.pathname+'?'+u.searchParams.toString()+u.hash;(mode==='replace'?history.replaceState:history.pushState).call(history,{design:normDesign(design)},'',next);}
function clearDesignFromAddressBar(){const u=new URL(location.href);if(!u.searchParams.has('design'))return;u.searchParams.delete('design');history.replaceState({},'',u.pathname+(u.searchParams.toString()?'?'+u.searchParams.toString():'')+u.hash);}
function directProductUrl(design){return DIRECT_LINK_BASE+'?design='+encodeURIComponent(normDesign(design));}

function updateCheckout(){
  const size=modalSize.value,color=modalColor.value,price=PRICE_MAP[size],base=STRIPE_LINKS[size],isOversize=(size==='36'||size==='48'),shippingBySize={"8":12.95,"12":16.95,"18":0,"24":0,"30":0},shipping=shippingBySize[size];
  modalTotal.textContent=price?'$'+price:'';
  if(isOversize){
    shippingStatus.innerHTML='<strong>Shipping</strong>Oversized shipping quote required for '+size+'&quot; signs.';
    buyNow.style.display='none';oversizeQuote.style.display='flex';
    const p=new URLSearchParams();p.set(OVERSIZE_DESIGN_ENTRY,'MB1-'+currentDesign);p.set(OVERSIZE_SIZE_ENTRY,size+'"');p.set(OVERSIZE_COLOR_ENTRY,color);oversizeQuote.href=OVERSIZE_FORM_BASE+'&'+p.toString();
  }else{
    oversizeQuote.style.display='none';buyNow.style.display='flex';
    if(shipping===0){shippingStatus.innerHTML='<strong>Shipping</strong>FREE standard shipping within the contiguous United States.';buyNow.textContent='Pay Now — $'+price+' · FREE shipping';}
    else{shippingStatus.innerHTML='<strong>Shipping</strong>$'+shipping.toFixed(2)+' standard shipping will be added at Stripe checkout.';buyNow.textContent='Pay Now — $'+price+' + $'+shipping.toFixed(2)+' shipping';}
    const ref=safeRef('MB1-'+currentDesign+'_'+size+'_'+color);buyNow.dataset.orderRef=ref;buyNow.href=base+'?client_reference_id='+encodeURIComponent(ref)+'&utm_content='+encodeURIComponent(ref);
  }
}
function updateCustomizeLink(){if(!currentDesign)return;const p=new URLSearchParams();p.set(CUSTOM_DESIGN_ENTRY,'MB1-'+currentDesign);p.set(CUSTOM_SIZE_ENTRY,modalSize.value+'"');p.set(CUSTOM_COLOR_ENTRY,modalColor.value);customizeBtn.href=CUSTOM_FORM_BASE+'&'+p.toString();}
function openProductData(d,updateUrl=true){currentDesign=normDesign(d.design);renderGallery(d);modalName.textContent=d.name;modalCat.textContent=productCategories(d).map(categoryLabel).join(' · ');modalMeta.innerHTML='<span class="pill">'+e(d.sku||('MB1-'+currentDesign))+'</span><span class="pill">Design '+e(currentDesign)+'</span>';modalDesc.textContent=d.description||'';modalSize.value='8';modalColor.value='Black';updateCheckout();customArea.style.display=d.customizable===true?'block':'none';if(d.customizable===true)updateCustomizeLink();copyLinkStatus.textContent='';modal.classList.add('open');if(updateUrl)putDesignInAddressBar(currentDesign);}
function closeProduct(updateUrl=true){modal.classList.remove('open');if(updateUrl)clearDesignFromAddressBar();copyLinkStatus.textContent='';}
function openRequestedDesign(){const requested=normDesign(new URLSearchParams(location.search).get('design'));if(!requested)return false;const p=PRODUCTS.find(x=>normDesign(x.design)===requested);if(!p)return false;openProductData(p,false);return true;}
async function copyCurrentDesignLink(){if(!currentDesign)return;const link=directProductUrl(currentDesign);try{await navigator.clipboard.writeText(link);copyLinkStatus.textContent='Direct link copied.';}catch(err){copyLinkStatus.textContent=link;}}

search.addEventListener('input',render);category.addEventListener('change',render);modalSize.addEventListener('change',()=>{updateCheckout();if(customArea.style.display!=='none')updateCustomizeLink();});modalColor.addEventListener('change',()=>{updateCheckout();if(customArea.style.display!=='none')updateCustomizeLink();});
document.getElementById('closeModal').onclick=()=>closeProduct(true);modal.addEventListener('click',ev=>{if(ev.target===modal)closeProduct(true)});copyDirectLink.addEventListener('click',copyCurrentDesignLink);galleryPrev.addEventListener('click',()=>setGalleryImage(currentImageIndex-1));galleryNext.addEventListener('click',()=>setGalleryImage(currentImageIndex+1));
galleryMain.addEventListener('touchstart',ev=>{galleryTouchStartX=ev.changedTouches&&ev.changedTouches[0]?ev.changedTouches[0].clientX:null;},{passive:true});
galleryMain.addEventListener('touchend',ev=>{if(galleryTouchStartX===null||currentImages.length<2)return;const endX=ev.changedTouches&&ev.changedTouches[0]?ev.changedTouches[0].clientX:galleryTouchStartX,dx=endX-galleryTouchStartX;galleryTouchStartX=null;if(Math.abs(dx)>45)setGalleryImage(currentImageIndex+(dx<0?1:-1));},{passive:true});
buyNow.addEventListener('click',()=>{const ref=buyNow.dataset.orderRef||'';if(ref&&buyNow.href.includes('buy.stripe.com'))savePendingOrderReference(ref);});
window.addEventListener('popstate',()=>{const requested=normDesign(new URLSearchParams(location.search).get('design'));if(!requested){closeProduct(false);return;}const p=PRODUCTS.find(x=>normDesign(x.design)===requested);if(p)openProductData(p,false);});

Promise.all([
  fetch('catalog-data-v18.json?v=18').then(r=>r.ok?r.json():[]),
  ...PUBLIC_CHUNKS.map(f=>fetch(f+'?v=19').then(r=>{if(!r.ok)throw new Error(f);return r.json();}))
]).then(([base,...parts])=>{
  const pub=decodeManifest(parts.flat());
  PRODUCTS=mergeCatalog(base,pub);
  buildCategoryButtons();
  if(QUERY_CUSTOMIZABLE){document.getElementById('heroTitle').textContent='Customizable Designs';document.getElementById('heroText').textContent='Browse designs that can be personalized with names, locations, wording, and other approved details.';}
  if(REQUESTED_CATEGORY && [...category.options].some(o=>normCat(o.value)===REQUESTED_CATEGORY))category.value=REQUESTED_CATEGORY;
  render();openRequestedDesign();
}).catch(err=>{count.textContent='The catalog could not load. Please refresh the page.';console.error(err);});
