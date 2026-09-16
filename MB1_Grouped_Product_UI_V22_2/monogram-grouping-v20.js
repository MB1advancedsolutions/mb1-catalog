/* MB1 Product Grouping V22.2 - self-contained grouped-product configurator
   Replaces the visual presentation of grouped styles while preserving the
   existing catalog data, Design IDs, checkout, shipping, customization,
   direct links and multi-photo gallery behavior.
*/
(function(){
'use strict';

let CONFIG={version:'22.2',groups:[]};
let displayCache=null;
let groupByDesign=new Map();
let groupById=new Map();
const originalOpenProductData=typeof openProductData==='function'?openProductData:null;

function norm(v){const m=String(v||'').match(/(\d{1,4})/);return m?m[1].padStart(4,'0'):''}
function esc(s){return typeof e==='function'?e(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function pcats(p){const raw=(Array.isArray(p&&p.categories)&&p.categories.length)?p.categories:[p&&p.category];return[...new Set(raw.filter(Boolean))]}
function productByDesign(d){const n=norm(d);return(PRODUCTS||[]).find(p=>norm(p.design)===n)||null}
function isGroupedCustomizable(p){return p?(p._mb1Grouped?p.children.some(x=>isCustomizableProduct(x.product)):isCustomizableProduct(p)):false}
function childData(p){return typeof productDataFromCatalog==='function'?productDataFromCatalog(p):{design:p.design,name:p.name,category:p.category,categories:pcats(p),sku:p.sku,image:p.image,thumb:p.thumb,images:p.images,alt:p.alt,desc:p.description}}

function buildMaps(){
  displayCache=null;
  groupByDesign=new Map();
  groupById=new Map();
  (CONFIG.groups||[]).forEach(g=>{
    groupById.set(g.id,g);
    (g.variants||[]).forEach(v=>{if(v.visible!==false)groupByDesign.set(norm(v.design),g)});
  });
}

function availableChildren(g){
  return (g.variants||[])
    .filter(v=>v.visible!==false)
    .map(v=>({variant:v,product:productByDesign(v.design)}))
    .filter(x=>x.product)
    .sort((a,b)=>(Number(a.variant.sort)||9999)-(Number(b.variant.sort)||9999));
}

function buildDisplayProducts(){
  if(displayCache)return displayCache;
  const used=new Set(),grouped=[];
  (CONFIG.groups||[]).forEach(g=>{
    const children=availableChildren(g);
    if(children.length<2)return;
    children.forEach(x=>used.add(norm(x.product.design)));
    const primary=children.find(x=>norm(x.product.design)===norm(g.primaryDesign))||children[0];
    const cats=[...new Set(children.flatMap(x=>pcats(x.product)))];
    const searchable=children.map(x=>[
      x.product.design,x.product.sku,x.product.name,x.variant.label,x.product.category,...pcats(x.product)
    ].join(' ')).join(' ');
    grouped.push({
      _mb1Grouped:true,
      groupId:g.id,
      group:g,
      design:norm(primary.product.design),
      sku:children.length+' styles',
      name:g.name,
      category:primary.product.category,
      categories:cats,
      image:primary.product.image,
      thumb:primary.product.thumb,
      alt:g.name+' by MB1 Advanced Solutions',
      description:'Choose from '+children.length+' available '+String(g.variantType||'style').toLowerCase()+' options.',
      customizable:children.some(x=>isCustomizableProduct(x.product)),
      children,
      searchText:searchable.toLowerCase()
    });
  });
  const standalone=(PRODUCTS||[]).filter(p=>!used.has(norm(p.design)));
  displayCache=[...grouped,...standalone];
  return displayCache;
}

function findDisplayByDesign(design){
  const d=norm(design),g=groupByDesign.get(d);
  if(g){const gp=buildDisplayProducts().find(x=>x._mb1Grouped&&x.groupId===g.id);if(gp)return gp}
  return(PRODUCTS||[]).find(p=>norm(p.design)===d)||null;
}

function installCleanUI(){
  if(!document.getElementById('mb1V22Styles')){
    const st=document.createElement('style');
    st.id='mb1V22Styles';
    st.textContent=`
      /* ---- grouped modal shell ---- */
      body.mb1-grouped-open .modal{align-items:center!important;padding:16px!important;box-sizing:border-box!important}
      body.mb1-grouped-open .modal-box{
        width:min(1180px,calc(100vw - 34px))!important;
        max-width:1180px!important;
        max-height:92vh!important;
        display:grid!important;
        grid-template-columns:minmax(300px,.88fr) minmax(440px,1.12fr)!important;
        overflow:hidden!important;
        border-radius:22px!important;
        box-shadow:0 28px 80px rgba(0,0,0,.28)!important;
        margin:auto!important;
      }
      body.mb1-grouped-open .modal-box .gallery,
      body.mb1-grouped-open .modal-box .detail{min-width:0!important;box-sizing:border-box!important}
      body.mb1-grouped-open .modal-box .gallery{overflow:hidden!important;background:#f6f6f3!important}
      body.mb1-grouped-open .modal-box .detail{
        overflow-y:auto!important;
        overflow-x:hidden!important;
        max-height:92vh!important;
        padding:26px 28px 30px!important;
        scrollbar-width:thin;
      }
      body.mb1-grouped-open .modal-box .detail>*{max-width:100%!important;box-sizing:border-box!important}
      body.mb1-grouped-open #modalDesc{white-space:normal!important;overflow-wrap:anywhere!important;line-height:1.5!important;color:#536159!important}
      body.mb1-grouped-open #copyDirectLink{width:auto!important;min-width:0!important;padding:8px 12px!important;border-radius:9px!important;font-size:11px!important;float:right!important;margin:0 0 10px 10px!important}
      body.mb1-grouped-open .modal-box .option-box{
        border:1px solid #dde2dc!important;
        border-radius:14px!important;
        background:#fff!important;
        padding:13px 15px!important;
        margin:12px 0!important;
      }
      body.mb1-grouped-open .modal-box .option-box label{font-weight:800!important;color:#202923!important;margin-bottom:7px!important;display:block!important}
      body.mb1-grouped-open .modal-box select{width:100%!important;max-width:100%!important}

      /* ---- style configurator ---- */
      #mb1StyleBox.mb1-style-box{
        margin:16px 0!important;
        padding:0!important;
        border:1px solid #d8dfd9!important;
        border-radius:18px!important;
        background:#f8faf8!important;
        overflow:hidden!important;
        min-width:0!important;
        box-shadow:0 8px 24px rgba(30,48,37,.06)!important;
      }
      .mb1-style-header{
        display:flex;align-items:center;justify-content:space-between;gap:14px;
        padding:16px 17px 13px;background:#fff;border-bottom:1px solid #e3e7e3;
      }
      .mb1-style-eyebrow{display:block;font-size:10px;line-height:1;text-transform:uppercase;letter-spacing:.12em;font-weight:800;color:#65756a;margin-bottom:5px}
      .mb1-style-title{font-size:18px;line-height:1.15;font-weight:850;color:#172019}
      .mb1-style-count{flex:0 0 auto;font-size:11px;font-weight:800;color:#3d5143;background:#edf3ee;border:1px solid #dbe6dd;border-radius:999px;padding:7px 10px}
      .mb1-style-current{
        display:flex;align-items:center;justify-content:space-between;gap:12px;
        margin:13px 14px 0;padding:10px 12px;border-radius:12px;background:#edf4ef;border:1px solid #d7e5da;
      }
      .mb1-style-current-label{font-size:12px;color:#506158;font-weight:700}
      .mb1-style-current-value{font-size:13px;color:#172019;font-weight:850;text-align:right}
      .mb1-letter-quick{display:flex;flex-wrap:wrap;gap:5px;padding:12px 14px 0}
      .mb1-letter-chip{
        width:31px;height:31px;border:1px solid #d2d9d3;border-radius:8px;background:#fff;color:#263329;
        font:800 12px/1 inherit;cursor:pointer;transition:.16s ease;
      }
      .mb1-letter-chip:hover{border-color:#78917e;background:#f2f6f3}
      .mb1-letter-chip.active{background:#22382a;color:#fff;border-color:#22382a;box-shadow:0 3px 10px rgba(34,56,42,.22)}
      .mb1-style-tools{display:flex;gap:8px;align-items:center;padding:12px 14px 8px}
      .mb1-style-search{
        width:100%;border:1px solid #cfd7d0;border-radius:10px;background:#fff;padding:10px 12px;
        font:600 13px/1.2 inherit;color:#202923;outline:none;box-sizing:border-box;
      }
      .mb1-style-search:focus{border-color:#607c68;box-shadow:0 0 0 3px rgba(66,100,76,.11)}
      #mb1StyleSelect.mb1-sr-select{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important}
      .mb1-style-grid{
        display:grid!important;
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        gap:9px!important;
        max-height:345px!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        padding:6px 14px 14px!important;
        scrollbar-width:thin;
        min-width:0!important;
      }
      .mb1-style-thumb{
        position:relative;display:flex!important;flex-direction:column!important;align-items:stretch!important;
        min-width:0!important;width:auto!important;border:1px solid #dce2dc!important;border-radius:12px!important;
        background:#fff!important;padding:6px!important;cursor:pointer!important;text-align:left!important;color:#172019!important;
        transition:transform .14s ease,border-color .14s ease,box-shadow .14s ease!important;
      }
      .mb1-style-thumb:hover{transform:translateY(-1px);border-color:#8ea092!important;box-shadow:0 6px 16px rgba(32,50,38,.10)!important}
      .mb1-style-thumb.active{border:2px solid #2f6845!important;padding:5px!important;box-shadow:0 0 0 3px rgba(47,104,69,.10)!important}
      .mb1-style-thumb.active:after{
        content:'✓';position:absolute;right:7px;top:7px;width:22px;height:22px;border-radius:50%;
        display:grid;place-items:center;background:#2f6845;color:#fff;font-size:13px;font-weight:900;
        box-shadow:0 2px 7px rgba(0,0,0,.18);
      }
      .mb1-style-thumb img{width:100%!important;aspect-ratio:1/1!important;height:auto!important;display:block!important;object-fit:contain!important;background:#f7f6f2!important;border-radius:8px!important;margin:0!important}
      .mb1-style-thumb .mb1-thumb-label{display:block!important;font-size:11px!important;font-weight:800!important;line-height:1.15!important;margin:7px 2px 2px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      .mb1-style-thumb .mb1-thumb-id{display:block!important;font-size:9px!important;line-height:1.1!important;color:#738078!important;margin:0 2px 1px!important}
      .mb1-style-empty{display:none;text-align:center;color:#69766e;font-size:12px;padding:18px}
      .mb1-style-empty.show{display:block}
      .mb1-style-selected{display:none!important}
      .card .style-count{font-size:11px;color:var(--muted);margin-top:4px}

      @media(max-width:900px){
        body.mb1-grouped-open .modal-box{width:min(760px,calc(100vw - 20px))!important;max-height:96vh!important;display:block!important;overflow-y:auto!important;border-radius:18px!important}
        body.mb1-grouped-open .modal-box .detail{max-height:none!important;overflow:visible!important;padding:20px!important}
        body.mb1-grouped-open .modal-box .gallery{max-height:42vh!important}
        .mb1-style-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;max-height:330px!important}
      }
      @media(max-width:540px){
        body.mb1-grouped-open .modal-box{width:calc(100vw - 10px)!important;border-radius:14px!important}
        body.mb1-grouped-open .modal-box .detail{padding:15px!important}
        .mb1-style-header{padding:14px 13px 11px}.mb1-style-title{font-size:16px}
        .mb1-style-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;padding:6px 10px 12px!important;max-height:360px!important}
        .mb1-style-tools{padding:10px 10px 6px}.mb1-letter-quick{padding:10px 10px 0}.mb1-style-current{margin:10px 10px 0}
      }
    `;
    document.head.appendChild(st);
  }

  if(document.getElementById('mb1StyleBox'))return;
  const detail=document.querySelector('.modal-box .detail');
  if(!detail)return;
  const firstOption=detail.querySelector('.option-box');
  const box=document.createElement('div');
  box.id='mb1StyleBox';
  box.className='option-box mb1-style-box';
  box.style.display='none';
  box.innerHTML=`
    <div class="mb1-style-header">
      <div><span class="mb1-style-eyebrow">Design options</span><div class="mb1-style-title">Choose Your Style</div></div>
      <div id="mb1StyleCount" class="mb1-style-count"></div>
    </div>
    <div class="mb1-style-current">
      <span class="mb1-style-current-label">Selected design</span>
      <span id="mb1StyleCurrentValue" class="mb1-style-current-value"></span>
    </div>
    <div id="mb1LetterQuick" class="mb1-letter-quick"></div>
    <div class="mb1-style-tools"><input id="mb1StyleSearch" class="mb1-style-search" type="search" placeholder="Search styles or design ID…" autocomplete="off"></div>
    <select id="mb1StyleSelect" class="mb1-sr-select" aria-label="Choose design style"></select>
    <div id="mb1StyleThumbs" class="mb1-style-grid"></div>
    <div id="mb1StyleEmpty" class="mb1-style-empty">No matching styles found.</div>
    <div id="mb1StyleSelected" class="mb1-style-selected"></div>`;
  if(firstOption)detail.insertBefore(box,firstOption);else detail.appendChild(box);
}

function styleLabelFor(g,d){const v=(g.variants||[]).find(x=>norm(x.design)===norm(d));return v?v.label:'Design '+norm(d)}
function letterFromLabel(label){const m=String(label||'').match(/(?:Letter\s+)?([A-Z])$/i);return m?m[1].toUpperCase():''}

function setActiveStyleUI(display,design){
  const d=norm(design),label=styleLabelFor(display.group,d);
  const sel=document.getElementById('mb1StyleSelect');if(sel)sel.value=d;
  const current=document.getElementById('mb1StyleCurrentValue');if(current)current.textContent=label+' · MB1-'+d;
  document.querySelectorAll('.mb1-style-thumb').forEach(b=>b.classList.toggle('active',norm(b.dataset.design)===d));
  document.querySelectorAll('.mb1-letter-chip').forEach(b=>b.classList.toggle('active',norm(b.dataset.design)===d));
}

function selectGroupedChild(display,p,updateUrl){
  const d=childData(p);
  currentDesign=norm(d.design);
  renderGallery(d);
  modalName.textContent=display.name;
  modalCat.textContent=pcats(display).map(categoryLabel).join(' · ');
  const label=styleLabelFor(display.group,currentDesign);
  modalMeta.innerHTML='<span class="pill">'+esc(label)+'</span><span class="pill">MB1-'+esc(currentDesign)+'</span>';
  modalDesc.textContent=d.desc||display.description||'';
  setActiveStyleUI(display,currentDesign);
  updateCheckout();
  const can=isCustomizableProduct(p);
  customArea.style.display=can?'block':'none';
  if(can)updateCustomizeLink();
  copyLinkStatus.textContent='';
  if(updateUrl)putDesignInAddressBar(currentDesign,'replace');
}

function renderStyleSelector(display,selectedDesign){
  installCleanUI();
  const box=document.getElementById('mb1StyleBox'),sel=document.getElementById('mb1StyleSelect'),thumbs=document.getElementById('mb1StyleThumbs');
  const quick=document.getElementById('mb1LetterQuick'),searchBox=document.getElementById('mb1StyleSearch'),countEl=document.getElementById('mb1StyleCount'),empty=document.getElementById('mb1StyleEmpty');
  if(!box||!sel||!thumbs)return;
  box.style.display='block';
  const children=display.children;
  if(countEl)countEl.textContent=children.length+' styles';
  sel.innerHTML=children.map(x=>'<option value="'+esc(norm(x.product.design))+'">'+esc(x.variant.label)+' — MB1-'+esc(norm(x.product.design))+'</option>').join('');
  thumbs.innerHTML=children.map(x=>{
    const d=norm(x.product.design),img=x.product.thumb||x.product.image||'';
    return '<button type="button" class="mb1-style-thumb" data-design="'+esc(d)+'" data-search="'+esc((x.variant.label+' '+d+' '+(x.product.name||'')).toLowerCase())+'" title="'+esc(x.variant.label+' · MB1-'+d)+'">'+
      '<img loading="lazy" src="'+esc(img)+'" alt="'+esc(x.variant.label)+'">'+
      '<span class="mb1-thumb-label">'+esc(x.variant.label)+'</span><span class="mb1-thumb-id">MB1-'+esc(d)+'</span></button>';
  }).join('');

  const isLetters=String(display.group.variantType||'').toLowerCase()==='letter';
  if(quick){
    quick.style.display=isLetters?'flex':'none';
    quick.innerHTML=isLetters?children.map(x=>{
      const d=norm(x.product.design),letter=letterFromLabel(x.variant.label)||x.variant.label;
      return '<button type="button" class="mb1-letter-chip" data-design="'+esc(d)+'" title="'+esc(x.variant.label)+'">'+esc(letter)+'</button>';
    }).join(''):'';
  }

  const choose=d=>{const hit=children.find(x=>norm(x.product.design)===norm(d));if(hit)selectGroupedChild(display,hit.product,true)};
  sel.onchange=()=>choose(sel.value);
  thumbs.querySelectorAll('.mb1-style-thumb').forEach(b=>b.onclick=()=>choose(b.dataset.design));
  if(quick)quick.querySelectorAll('.mb1-letter-chip').forEach(b=>b.onclick=()=>choose(b.dataset.design));

  const applyFilter=()=>{
    const q=(searchBox&&searchBox.value||'').trim().toLowerCase();let shown=0;
    thumbs.querySelectorAll('.mb1-style-thumb').forEach(b=>{const yes=!q||(b.dataset.search||'').includes(q);b.style.display=yes?'flex':'none';if(yes)shown++});
    if(empty)empty.classList.toggle('show',shown===0);
  };
  if(searchBox){searchBox.value='';searchBox.oninput=applyFilter;searchBox.parentElement.style.display=children.length>10?'flex':'none'}
  setActiveStyleUI(display,selectedDesign);
}

function hideStyleSelector(){
  const b=document.getElementById('mb1StyleBox');if(b)b.style.display='none';
  document.body.classList.remove('mb1-grouped-open');
}

function openGrouped(display,selectedDesign,updateUrl=true){
  const chosen=display.children.find(x=>norm(x.product.design)===norm(selectedDesign))||display.children[0];
  document.body.classList.add('mb1-grouped-open');
  modalSize.value='8';
  modalColor.value='Black';
  renderStyleSelector(display,chosen.product.design);
  selectGroupedChild(display,chosen.product,updateUrl);
  modal.classList.add('open');
  const detail=document.querySelector('.modal-box .detail');if(detail)detail.scrollTop=0;
  if(updateUrl)putDesignInAddressBar(chosen.product.design,'replace');
}

function applyOverrides(){
  installCleanUI();
  baseProducts=function(){const src=buildDisplayProducts();return CUSTOMIZABLE_ONLY?src.filter(isGroupedCustomizable):src};

  buildCategoryButtons=function(){
    const source=baseProducts(),counts={};
    source.forEach(p=>pcats(p).forEach(c=>counts[c]=(counts[c]||0)+1));
    const cats=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]||categoryLabel(a).localeCompare(categoryLabel(b)));
    categoryButtons.innerHTML=`<button class="category-btn active" data-cat="">${esc(ALL_LABEL)} (${source.length})</button>`+
      cats.map(c=>`<button class="category-btn" data-cat="${esc(c)}">${esc(categoryLabel(c))} (${counts[c]})</button>`).join('')+
      ((location.pathname.endsWith('index.html')||location.pathname.endsWith('/'))?'<a class="category-btn" href="religious.html">Religious</a>':'');
    categoryButtons.querySelectorAll('.category-btn').forEach(btn=>btn.addEventListener('click',()=>{if(btn.tagName==='A')return;category.value=btn.dataset.cat;render()}));
    category.innerHTML='<option value="">All categories</option>';
    [...cats].sort((a,b)=>categoryLabel(a).localeCompare(categoryLabel(b))).forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=categoryLabel(c);category.appendChild(o)});
    const cl=document.querySelector('.customizable-link');if(cl)cl.textContent='Customizable ('+buildDisplayProducts().filter(isGroupedCustomizable).length.toLocaleString()+')';
  };

  render=function(){
    const q=(search.value||'').trim().toLowerCase(),c=category.value||'',source=baseProducts();
    const filtered=source.filter(p=>{const cats=pcats(p),hay=p._mb1Grouped?p.searchText:(p.design+' '+p.sku+' '+p.name+' '+p.category+' '+cats.join(' ')).toLowerCase();return(!q||hay.includes(q))&&(!c||cats.includes(c))});
    const childCount=filtered.reduce((n,p)=>n+(p._mb1Grouped?p.children.length:1),0);
    count.textContent=filtered.length.toLocaleString()+' items shown'+(childCount!==filtered.length?' · '+childCount.toLocaleString()+' designs available':'');
    categoryButtons.querySelectorAll('.category-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.cat===c));
    grid.innerHTML=filtered.map(p=>`<article class="card"><div class="art"><img loading="lazy" src="${esc(p.thumb)}" alt="${esc(p.alt||p.name)}"></div><div class="info"><div class="cat">${esc(categoryLabel(c||p.category))}</div><div class="name">${esc(p.name)}</div>${p._mb1Grouped?`<div class="style-count">${p.children.length} styles in one item</div>`:''}<div class="meta">${esc(p._mb1Grouped?(p.children.length+' design options'):p.sku)}<br><span class="price">From $49</span> · 8&quot;–48&quot;</div><button class="view-button" data-display-key="${esc(p._mb1Grouped?p.groupId:norm(p.design))}">${p._mb1Grouped?'Choose Style':'View Design'}</button></div></article>`).join('');
    grid.querySelectorAll('.view-button').forEach(btn=>btn.addEventListener('click',()=>{
      const key=btn.dataset.displayKey;
      const p=groupById.has(key)?buildDisplayProducts().find(x=>x._mb1Grouped&&x.groupId===key):(PRODUCTS||[]).find(x=>norm(x.design)===norm(key));
      if(!p)return;
      if(p._mb1Grouped)openGrouped(p,p.design,true);else openProductData(childData(p),true);
    }));
  };

  openProductData=function(d,updateUrl=true){
    const design=norm(d&&d.design),display=findDisplayByDesign(design);
    if(display&&display._mb1Grouped){openGrouped(display,design,updateUrl);return}
    hideStyleSelector();
    if(originalOpenProductData)originalOpenProductData(d,updateUrl);
  };

  if((PRODUCTS||[]).length){
    displayCache=null;
    buildCategoryButtons();
    render();
    const requested=norm(new URLSearchParams(location.search).get('design'));
    if(requested){const raw=(PRODUCTS||[]).find(x=>norm(x.design)===requested);if(raw)openProductData(childData(raw),false)}
  }
}

// V22.2 SELF-CONTAINED CONFIG
// All 26 groups are embedded directly so stale/missing JSON files cannot remove grouped products.
const MB1_EMBEDDED_GROUP_CONFIG={"version":"22.2","groupCount":26,"groups":[{"id":"MB1-MONO-001","name":"Classic Letter Monogram Signs","group":"Classic Monogram Alphabet","variantType":"Letter","primaryDesign":"0671","variants":[{"design":"0671","label":"Letter A","sort":1,"primary":true,"visible":true},{"design":"0672","label":"Letter B","sort":2,"primary":false,"visible":true},{"design":"0673","label":"Letter C","sort":3,"primary":false,"visible":true},{"design":"0674","label":"Letter D","sort":4,"primary":false,"visible":true},{"design":"0675","label":"Letter E","sort":5,"primary":false,"visible":true},{"design":"0676","label":"Letter F","sort":6,"primary":false,"visible":true},{"design":"0677","label":"Letter G","sort":7,"primary":false,"visible":true},{"design":"0678","label":"Letter H","sort":8,"primary":false,"visible":true},{"design":"0679","label":"Letter I","sort":9,"primary":false,"visible":true},{"design":"0680","label":"Letter J","sort":10,"primary":false,"visible":true},{"design":"0681","label":"Letter K","sort":11,"primary":false,"visible":true},{"design":"0682","label":"Letter L","sort":12,"primary":false,"visible":true},{"design":"0683","label":"Letter M","sort":13,"primary":false,"visible":true},{"design":"0684","label":"Letter N","sort":14,"primary":false,"visible":true},{"design":"0685","label":"Letter O","sort":15,"primary":false,"visible":true},{"design":"0686","label":"Letter P","sort":16,"primary":false,"visible":true},{"design":"0687","label":"Letter Q","sort":17,"primary":false,"visible":true},{"design":"0688","label":"Letter R","sort":18,"primary":false,"visible":true},{"design":"0689","label":"Letter S","sort":19,"primary":false,"visible":true},{"design":"0690","label":"Letter T","sort":20,"primary":false,"visible":true},{"design":"0691","label":"Letter U","sort":21,"primary":false,"visible":true},{"design":"0692","label":"Letter V","sort":22,"primary":false,"visible":true},{"design":"0693","label":"Letter W","sort":23,"primary":false,"visible":true},{"design":"0694","label":"Letter X","sort":24,"primary":false,"visible":true},{"design":"0695","label":"Letter Y","sort":25,"primary":false,"visible":true},{"design":"0696","label":"Letter Z","sort":26,"primary":false,"visible":true}]},{"id":"MB1-MONO-002","name":"Classic Monogram Sign Styles","group":"Classic Monogram Style Collection","variantType":"Style","primaryDesign":"0503","variants":[{"design":"0503","label":"Style 1","sort":1,"primary":true,"visible":true},{"design":"0512","label":"Style 2","sort":2,"primary":false,"visible":true},{"design":"0513","label":"Style 3","sort":3,"primary":false,"visible":true},{"design":"0514","label":"Style 4","sort":4,"primary":false,"visible":true},{"design":"0515","label":"Style 5","sort":5,"primary":false,"visible":true},{"design":"0516","label":"Style 6","sort":6,"primary":false,"visible":true},{"design":"0517","label":"Style 7","sort":7,"primary":false,"visible":true},{"design":"0518","label":"Style 8","sort":8,"primary":false,"visible":true},{"design":"0519","label":"Style 9","sort":9,"primary":false,"visible":true},{"design":"0504","label":"Style 10","sort":10,"primary":false,"visible":true},{"design":"0505","label":"Style 11","sort":11,"primary":false,"visible":true},{"design":"0506","label":"Style 12","sort":12,"primary":false,"visible":true},{"design":"0507","label":"Style 13","sort":13,"primary":false,"visible":true},{"design":"0508","label":"Style 14","sort":14,"primary":false,"visible":true},{"design":"0509","label":"Style 15","sort":15,"primary":false,"visible":true},{"design":"0510","label":"Style 16","sort":16,"primary":false,"visible":true},{"design":"0511","label":"Style 17","sort":17,"primary":false,"visible":true},{"design":"0521","label":"Style 18","sort":18,"primary":false,"visible":true},{"design":"0522","label":"Style 19","sort":19,"primary":false,"visible":true},{"design":"0523","label":"Style 20","sort":20,"primary":false,"visible":true},{"design":"0524","label":"Style 21","sort":21,"primary":false,"visible":true},{"design":"0525","label":"Style 22","sort":22,"primary":false,"visible":true}]},{"id":"MB1-MONO-003","name":"Split Monogram Sign Styles","group":"Split Monogram Style Collection","variantType":"Style","primaryDesign":"1429","variants":[{"design":"1429","label":"Style 1","sort":1,"primary":true,"visible":true},{"design":"1440","label":"Style 2","sort":2,"primary":false,"visible":true},{"design":"1450","label":"Style 3","sort":3,"primary":false,"visible":true},{"design":"1451","label":"Style 4","sort":4,"primary":false,"visible":true},{"design":"0335","label":"Style 5","sort":5,"primary":false,"visible":true},{"design":"0336","label":"Style 6","sort":6,"primary":false,"visible":true},{"design":"1454","label":"Style 7","sort":7,"primary":false,"visible":true},{"design":"1455","label":"Style 8","sort":8,"primary":false,"visible":true},{"design":"1456","label":"Style 9","sort":9,"primary":false,"visible":true},{"design":"1430","label":"Style 10","sort":10,"primary":false,"visible":true},{"design":"1431","label":"Style 11","sort":11,"primary":false,"visible":true},{"design":"1432","label":"Style 12","sort":12,"primary":false,"visible":true},{"design":"1433","label":"Style 13","sort":13,"primary":false,"visible":true},{"design":"1434","label":"Style 14","sort":14,"primary":false,"visible":true},{"design":"1435","label":"Style 15","sort":15,"primary":false,"visible":true},{"design":"1436","label":"Style 16","sort":16,"primary":false,"visible":true},{"design":"1437","label":"Style 17","sort":17,"primary":false,"visible":true},{"design":"1438","label":"Style 18","sort":18,"primary":false,"visible":true},{"design":"1439","label":"Style 19","sort":19,"primary":false,"visible":true},{"design":"1441","label":"Style 20","sort":20,"primary":false,"visible":true},{"design":"1442","label":"Style 21","sort":21,"primary":false,"visible":true},{"design":"1443","label":"Style 22","sort":22,"primary":false,"visible":true},{"design":"1444","label":"Style 23","sort":23,"primary":false,"visible":true},{"design":"1445","label":"Style 24","sort":24,"primary":false,"visible":true},{"design":"1446","label":"Style 25","sort":25,"primary":false,"visible":true},{"design":"1447","label":"Style 26","sort":26,"primary":false,"visible":true},{"design":"1448","label":"Style 27","sort":27,"primary":false,"visible":true},{"design":"1449","label":"Style 28","sort":28,"primary":false,"visible":true}]},{"id":"MB1-MONO-004","name":"Split Letter Monogram Sign Styles","group":"Split Letter Monogram Styles","variantType":"Style","primaryDesign":"0775","variants":[{"design":"0775","label":"Style 1","sort":1,"primary":true,"visible":true},{"design":"0786","label":"Style 2","sort":2,"primary":false,"visible":true},{"design":"0793","label":"Style 3","sort":3,"primary":false,"visible":true},{"design":"0794","label":"Style 4","sort":4,"primary":false,"visible":true},{"design":"0795","label":"Style 5","sort":5,"primary":false,"visible":true},{"design":"0796","label":"Style 6","sort":6,"primary":false,"visible":true},{"design":"0797","label":"Style 7","sort":7,"primary":false,"visible":true},{"design":"0798","label":"Style 8","sort":8,"primary":false,"visible":true},{"design":"0799","label":"Style 9","sort":9,"primary":false,"visible":true},{"design":"0776","label":"Style 10","sort":10,"primary":false,"visible":true},{"design":"0777","label":"Style 11","sort":11,"primary":false,"visible":true},{"design":"0778","label":"Style 12","sort":12,"primary":false,"visible":true},{"design":"0779","label":"Style 13","sort":13,"primary":false,"visible":true},{"design":"0780","label":"Style 14","sort":14,"primary":false,"visible":true},{"design":"0781","label":"Style 15","sort":15,"primary":false,"visible":true},{"design":"0782","label":"Style 16","sort":16,"primary":false,"visible":true},{"design":"0783","label":"Style 17","sort":17,"primary":false,"visible":true},{"design":"0784","label":"Style 18","sort":18,"primary":false,"visible":true},{"design":"0785","label":"Style 19","sort":19,"primary":false,"visible":true},{"design":"0787","label":"Style 20","sort":20,"primary":false,"visible":true},{"design":"0788","label":"Style 21","sort":21,"primary":false,"visible":true},{"design":"0789","label":"Style 22","sort":22,"primary":false,"visible":true},{"design":"0790","label":"Style 23","sort":23,"primary":false,"visible":true},{"design":"0791","label":"Style 24","sort":24,"primary":false,"visible":true},{"design":"0792","label":"Style 25","sort":25,"primary":false,"visible":true}]},{"id":"MB1-MONO-005","name":"Script Vine Split Monogram Signs","group":"Script Vine Split Monogram Alphabet","variantType":"Letter","primaryDesign":"0645","variants":[{"design":"0645","label":"Letter A","sort":1,"primary":true,"visible":true},{"design":"0646","label":"Letter B","sort":2,"primary":false,"visible":true},{"design":"0647","label":"Letter C","sort":3,"primary":false,"visible":true},{"design":"0648","label":"Letter D","sort":4,"primary":false,"visible":true},{"design":"0649","label":"Letter E","sort":5,"primary":false,"visible":true},{"design":"0650","label":"Letter F","sort":6,"primary":false,"visible":true},{"design":"0651","label":"Letter G","sort":7,"primary":false,"visible":true},{"design":"0652","label":"Letter H","sort":8,"primary":false,"visible":true},{"design":"0653","label":"Letter I","sort":9,"primary":false,"visible":true},{"design":"0654","label":"Letter J","sort":10,"primary":false,"visible":true},{"design":"0655","label":"Letter K","sort":11,"primary":false,"visible":true},{"design":"0656","label":"Letter L","sort":12,"primary":false,"visible":true},{"design":"0657","label":"Letter M","sort":13,"primary":false,"visible":true},{"design":"0658","label":"Letter N","sort":14,"primary":false,"visible":true},{"design":"0659","label":"Letter O","sort":15,"primary":false,"visible":true},{"design":"0660","label":"Letter P","sort":16,"primary":false,"visible":true},{"design":"0661","label":"Letter Q","sort":17,"primary":false,"visible":true},{"design":"0662","label":"Letter R","sort":18,"primary":false,"visible":true},{"design":"0663","label":"Letter S","sort":19,"primary":false,"visible":true},{"design":"0664","label":"Letter T","sort":20,"primary":false,"visible":true},{"design":"0665","label":"Letter U","sort":21,"primary":false,"visible":true},{"design":"0666","label":"Letter V","sort":22,"primary":false,"visible":true},{"design":"0667","label":"Letter W","sort":23,"primary":false,"visible":true},{"design":"0668","label":"Letter X","sort":24,"primary":false,"visible":true},{"design":"0669","label":"Letter Y","sort":25,"primary":false,"visible":true},{"design":"0670","label":"Letter Z","sort":26,"primary":false,"visible":true}]},{"id":"MB1-MONO-006","name":"Alphabet Split Monogram Sign Styles","group":"Alphabet Split Monogram Styles","variantType":"Style","primaryDesign":"0751","variants":[{"design":"0751","label":"Style 1","sort":1,"primary":true,"visible":true},{"design":"0761","label":"Style 2","sort":2,"primary":false,"visible":true},{"design":"0762","label":"Style 3","sort":3,"primary":false,"visible":true},{"design":"0763","label":"Style 4","sort":4,"primary":false,"visible":true},{"design":"0764","label":"Style 5","sort":5,"primary":false,"visible":true},{"design":"0765","label":"Style 6","sort":6,"primary":false,"visible":true},{"design":"0766","label":"Style 7","sort":7,"primary":false,"visible":true},{"design":"0767","label":"Style 8","sort":8,"primary":false,"visible":true},{"design":"0768","label":"Style 9","sort":9,"primary":false,"visible":true},{"design":"0752","label":"Style 10","sort":10,"primary":false,"visible":true},{"design":"0753","label":"Style 11","sort":11,"primary":false,"visible":true},{"design":"0754","label":"Style 12","sort":12,"primary":false,"visible":true},{"design":"0755","label":"Style 13","sort":13,"primary":false,"visible":true},{"design":"0756","label":"Style 14","sort":14,"primary":false,"visible":true},{"design":"0757","label":"Style 15","sort":15,"primary":false,"visible":true},{"design":"0758","label":"Style 16","sort":16,"primary":false,"visible":true},{"design":"0759","label":"Style 17","sort":17,"primary":false,"visible":true},{"design":"0760","label":"Style 19","sort":18,"primary":false,"visible":true}]},{"id":"MB1-MONO-007","name":"Fleur Monogram Signs","group":"Fleur Monogram Alphabet","variantType":"Letter","primaryDesign":"0619","variants":[{"design":"0619","label":"Letter A","sort":1,"primary":true,"visible":true},{"design":"0620","label":"Letter B","sort":2,"primary":false,"visible":true},{"design":"0621","label":"Letter C","sort":3,"primary":false,"visible":true},{"design":"0622","label":"Letter D","sort":4,"primary":false,"visible":true},{"design":"0623","label":"Letter E","sort":5,"primary":false,"visible":true},{"design":"0624","label":"Letter F","sort":6,"primary":false,"visible":true},{"design":"0625","label":"Letter G","sort":7,"primary":false,"visible":true},{"design":"0626","label":"Letter H","sort":8,"primary":false,"visible":true},{"design":"0627","label":"Letter I","sort":9,"primary":false,"visible":true},{"design":"0628","label":"Letter J","sort":10,"primary":false,"visible":true},{"design":"0629","label":"Letter K","sort":11,"primary":false,"visible":true},{"design":"0630","label":"Letter L","sort":12,"primary":false,"visible":true},{"design":"0631","label":"Letter M","sort":13,"primary":false,"visible":true},{"design":"0632","label":"Letter N","sort":14,"primary":false,"visible":true},{"design":"0633","label":"Letter O","sort":15,"primary":false,"visible":true},{"design":"0634","label":"Letter P","sort":16,"primary":false,"visible":true},{"design":"0635","label":"Letter Q","sort":17,"primary":false,"visible":true},{"design":"0636","label":"Letter R","sort":18,"primary":false,"visible":true},{"design":"0637","label":"Letter S","sort":19,"primary":false,"visible":true},{"design":"0638","label":"Letter T","sort":20,"primary":false,"visible":true},{"design":"0639","label":"Letter U","sort":21,"primary":false,"visible":true},{"design":"0640","label":"Letter V","sort":22,"primary":false,"visible":true},{"design":"0641","label":"Letter W","sort":23,"primary":false,"visible":true},{"design":"0642","label":"Letter X","sort":24,"primary":false,"visible":true},{"design":"0643","label":"Letter Y","sort":25,"primary":false,"visible":true},{"design":"0644","label":"Letter Z","sort":26,"primary":false,"visible":true}]},{"id":"MB1-MONO-008","name":"Sunflower Monogram Signs","group":"Sunflower Monogram Alphabet","variantType":"Letter","primaryDesign":"1493","variants":[{"design":"1493","label":"Letter A","sort":1,"primary":true,"visible":true},{"design":"1494","label":"Letter B","sort":2,"primary":false,"visible":true},{"design":"1495","label":"Letter C","sort":3,"primary":false,"visible":true},{"design":"1496","label":"Letter D","sort":4,"primary":false,"visible":true},{"design":"1497","label":"Letter E","sort":5,"primary":false,"visible":true},{"design":"1498","label":"Letter F","sort":6,"primary":false,"visible":true},{"design":"1499","label":"Letter G","sort":7,"primary":false,"visible":true},{"design":"1500","label":"Letter H","sort":8,"primary":false,"visible":true},{"design":"1501","label":"Letter I","sort":9,"primary":false,"visible":true},{"design":"1502","label":"Letter J","sort":10,"primary":false,"visible":true},{"design":"1503","label":"Letter K","sort":11,"primary":false,"visible":true},{"design":"1504","label":"Letter L","sort":12,"primary":false,"visible":true},{"design":"1505","label":"Letter M","sort":13,"primary":false,"visible":true},{"design":"1506","label":"Letter N","sort":14,"primary":false,"visible":true},{"design":"1507","label":"Letter O","sort":15,"primary":false,"visible":true},{"design":"1508","label":"Letter P","sort":16,"primary":false,"visible":true},{"design":"1509","label":"Letter Q","sort":17,"primary":false,"visible":true},{"design":"1510","label":"Letter R","sort":18,"primary":false,"visible":true},{"design":"1511","label":"Letter S","sort":19,"primary":false,"visible":true},{"design":"1512","label":"Letter T","sort":20,"primary":false,"visible":true},{"design":"1513","label":"Letter U","sort":21,"primary":false,"visible":true},{"design":"1514","label":"Letter V","sort":22,"primary":false,"visible":true},{"design":"1515","label":"Letter W","sort":23,"primary":false,"visible":true},{"design":"1516","label":"Letter X","sort":24,"primary":false,"visible":true},{"design":"1517","label":"Letter Y","sort":25,"primary":false,"visible":true},{"design":"1518","label":"Letter Z","sort":26,"primary":false,"visible":true}]},{"id":"MB1-MONO-009","name":"Floral Welcome Monogram Signs","group":"Floral Welcome Monogram Styles","variantType":"Style","primaryDesign":"2246","variants":[{"design":"2246","label":"Style 1","sort":1,"primary":true,"visible":true},{"design":"2245","label":"Style 2","sort":2,"primary":false,"visible":true},{"design":"2244","label":"Style 3","sort":3,"primary":false,"visible":true},{"design":"2240","label":"Style 4","sort":4,"primary":false,"visible":true},{"design":"2239","label":"Style 5","sort":5,"primary":false,"visible":true},{"design":"2242","label":"Style 6","sort":6,"primary":false,"visible":true},{"design":"2243","label":"Style 7","sort":7,"primary":false,"visible":true},{"design":"2255","label":"Style 8","sort":8,"primary":false,"visible":true},{"design":"2254","label":"Style 9","sort":9,"primary":false,"visible":true},{"design":"2248","label":"Style 10","sort":10,"primary":false,"visible":true},{"design":"2247","label":"Style 11","sort":11,"primary":false,"visible":true},{"design":"2249","label":"Style 12","sort":12,"primary":false,"visible":true},{"design":"2250","label":"Style 13","sort":13,"primary":false,"visible":true},{"design":"2253","label":"Style 14","sort":14,"primary":false,"visible":true},{"design":"2256","label":"Style 15","sort":15,"primary":false,"visible":true},{"design":"2252","label":"Style 16","sort":16,"primary":false,"visible":true},{"design":"2251","label":"Style 17","sort":17,"primary":false,"visible":true},{"design":"2238","label":"Style 18","sort":18,"primary":false,"visible":true},{"design":"2241","label":"Style 19","sort":19,"primary":false,"visible":true}]},{"id":"MB1-MONO-010","name":"Compass Monogram Signs","group":"Compass Monogram Alphabet","variantType":"Letter","primaryDesign":"0194","variants":[{"design":"0194","label":"Letter A","sort":1,"primary":true,"visible":true},{"design":"0195","label":"Letter B","sort":2,"primary":false,"visible":true},{"design":"0196","label":"Letter C","sort":3,"primary":false,"visible":true},{"design":"0197","label":"Letter D","sort":4,"primary":false,"visible":true},{"design":"0198","label":"Letter E","sort":5,"primary":false,"visible":true},{"design":"0199","label":"Letter F","sort":6,"primary":false,"visible":true},{"design":"0200","label":"Letter G","sort":7,"primary":false,"visible":true},{"design":"0201","label":"Letter H","sort":8,"primary":false,"visible":true},{"design":"0202","label":"Letter I","sort":9,"primary":false,"visible":true},{"design":"0203","label":"Letter J","sort":10,"primary":false,"visible":true},{"design":"0204","label":"Letter K","sort":11,"primary":false,"visible":true},{"design":"0205","label":"Letter L","sort":12,"primary":false,"visible":true},{"design":"0206","label":"Letter M","sort":13,"primary":false,"visible":true},{"design":"0207","label":"Letter N","sort":14,"primary":false,"visible":true},{"design":"0208","label":"Letter O","sort":15,"primary":false,"visible":true},{"design":"0209","label":"Letter P","sort":16,"primary":false,"visible":true},{"design":"0210","label":"Letter Q","sort":17,"primary":false,"visible":true},{"design":"0211","label":"Letter R","sort":18,"primary":false,"visible":true},{"design":"0212","label":"Letter S","sort":19,"primary":false,"visible":true},{"design":"0213","label":"Letter T","sort":20,"primary":false,"visible":true},{"design":"0214","label":"Letter U","sort":21,"primary":false,"visible":true},{"design":"0215","label":"Letter V","sort":22,"primary":false,"visible":true},{"design":"0216","label":"Letter W","sort":23,"primary":false,"visible":true},{"design":"0217","label":"Letter X","sort":24,"primary":false,"visible":true},{"design":"0218","label":"Letter Y","sort":25,"primary":false,"visible":true},{"design":"0219","label":"Letter Z","sort":26,"primary":false,"visible":true}]},{"id":"MB1-MONO-011","name":"Lake House & Nautical Monogram Signs","group":"Lake House & Nautical Monogram Styles","variantType":"Style","primaryDesign":"0031","variants":[{"design":"0031","label":"Anchor Monogram Frame","sort":1,"primary":true,"visible":true},{"design":"1284","label":"Jeep Compass Monogram","sort":2,"primary":false,"visible":false},{"design":"1686","label":"Lake House Monogram","sort":3,"primary":false,"visible":true},{"design":"1687","label":"Lake House Sign Monogram","sort":4,"primary":false,"visible":true},{"design":"1688","label":"Lake House Simple Monogram","sort":5,"primary":false,"visible":true},{"design":"1689","label":"Welcome Lake House Monogram","sort":6,"primary":false,"visible":true}]},{"id":"MB1-MONO-012","name":"Beach & Coastal Monogram Signs","group":"Beach & Coastal Monogram Styles","variantType":"Style","primaryDesign":"1466","variants":[{"design":"1466","label":"Beach Life Monogram","sort":1,"primary":true,"visible":true},{"design":"1469","label":"Beach Sunset Monogram","sort":2,"primary":false,"visible":true},{"design":"1470","label":"Flamingo Beach Scene Monogram","sort":3,"primary":false,"visible":true},{"design":"1475","label":"Palms Beach Monogram","sort":4,"primary":false,"visible":true},{"design":"1476","label":"Surf Palm Tree Monogram","sort":5,"primary":false,"visible":true},{"design":"2581","label":"Welcome Summer Monogram","sort":6,"primary":false,"visible":true},{"design":"2583","label":"Welcome Sunset Monogram","sort":7,"primary":false,"visible":true},{"design":"2586","label":"Welcome Sunset Monogram Blank","sort":8,"primary":false,"visible":true},{"design":"2594","label":"Surfing Monogram","sort":9,"primary":false,"visible":true},{"design":"2596","label":"Surfing Wave Monogram","sort":10,"primary":false,"visible":true},{"design":"2597","label":"Flamingo Monogram","sort":11,"primary":false,"visible":true},{"design":"2598","label":"Vintage Car Palm Trees Monogram","sort":12,"primary":false,"visible":true},{"design":"2599","label":"Cocktail Palm Trees Monogram","sort":13,"primary":false,"visible":true},{"design":"2600","label":"Dolphines Monogram","sort":14,"primary":false,"visible":true},{"design":"2601","label":"Surfing Van Monogram","sort":15,"primary":false,"visible":true},{"design":"2602","label":"Sunset Monogram","sort":16,"primary":false,"visible":true},{"design":"2607","label":"Tiki Surfing Board Monogram","sort":17,"primary":false,"visible":true}]},{"id":"MB1-MONO-013","name":"Antler Monogram Signs","group":"Antler Monogram Alphabet","variantType":"Letter","primaryDesign":"0567","variants":[{"design":"0567","label":"Letter A","sort":1,"primary":true,"visible":true},{"design":"0568","label":"Letter B","sort":2,"primary":false,"visible":true},{"design":"0569","label":"Letter C","sort":3,"primary":false,"visible":true},{"design":"0570","label":"Letter D","sort":4,"primary":false,"visible":true},{"design":"0571","label":"Letter E","sort":5,"primary":false,"visible":true},{"design":"0572","label":"Letter F","sort":6,"primary":false,"visible":true},{"design":"0573","label":"Letter G","sort":7,"primary":false,"visible":true},{"design":"0574","label":"Letter H","sort":8,"primary":false,"visible":true},{"design":"0575","label":"Letter I","sort":9,"primary":false,"visible":true},{"design":"0576","label":"Letter J","sort":10,"primary":false,"visible":true},{"design":"0577","label":"Letter K","sort":11,"primary":false,"visible":true},{"design":"0578","label":"Letter L","sort":12,"primary":false,"visible":true},{"design":"0579","label":"Letter M","sort":13,"primary":false,"visible":true},{"design":"0580","label":"Letter N","sort":14,"primary":false,"visible":true},{"design":"0581","label":"Letter O","sort":15,"primary":false,"visible":true},{"design":"0582","label":"Letter P","sort":16,"primary":false,"visible":true},{"design":"0583","label":"Letter Q","sort":17,"primary":false,"visible":true},{"design":"0584","label":"Letter R","sort":18,"primary":false,"visible":true},{"design":"0585","label":"Letter S","sort":19,"primary":false,"visible":true},{"design":"0586","label":"Letter T","sort":20,"primary":false,"visible":true},{"design":"0587","label":"Letter U","sort":21,"primary":false,"visible":true},{"design":"0588","label":"Letter V","sort":22,"primary":false,"visible":true},{"design":"0589","label":"Letter W","sort":23,"primary":false,"visible":true},{"design":"0590","label":"Letter X","sort":24,"primary":false,"visible":true},{"design":"0591","label":"Letter Y","sort":25,"primary":false,"visible":true},{"design":"0592","label":"Letter Z","sort":26,"primary":false,"visible":true}]},{"id":"MB1-MONO-014","name":"Deer & Elk Monogram Signs","group":"Deer & Elk Monogram Styles","variantType":"Style","primaryDesign":"1665","variants":[{"design":"1665","label":"Style 1","sort":1,"primary":true,"visible":true},{"design":"1666","label":"Style 2","sort":2,"primary":false,"visible":true},{"design":"1667","label":"Style 3","sort":3,"primary":false,"visible":true},{"design":"1668","label":"Style 4","sort":4,"primary":false,"visible":true}]},{"id":"MB1-MONO-015","name":"Cowboy & Western Monogram Signs","group":"Cowboy & Western Monogram Styles","variantType":"Style","primaryDesign":"2070","variants":[{"design":"2070","label":"Cowboy Monogram 1","sort":1,"primary":true,"visible":true},{"design":"2072","label":"Cowboy Monogram 2","sort":2,"primary":false,"visible":true},{"design":"2071","label":"Cowboy Monogram 3","sort":3,"primary":false,"visible":true},{"design":"2068","label":"Cowboy Monogram 4","sort":4,"primary":false,"visible":true},{"design":"2067","label":"Cowboy Monogram 5","sort":5,"primary":false,"visible":true},{"design":"2065","label":"Cowboy Monogram 6","sort":6,"primary":false,"visible":true},{"design":"2066","label":"Cowboy Monogram 7","sort":7,"primary":false,"visible":true},{"design":"2074","label":"Cowboy Monogram 8","sort":8,"primary":false,"visible":true},{"design":"2073","label":"Cowboy Monogram 9","sort":9,"primary":false,"visible":true},{"design":"1247","label":"Windmill Monogram","sort":10,"primary":false,"visible":true}]},{"id":"MB1-MONO-016","name":"Dog Welcome Monogram Signs","group":"Dog Welcome Monogram Styles","variantType":"Style","primaryDesign":"2116","variants":[{"design":"2116","label":"Style 1","sort":1,"primary":true,"visible":true},{"design":"2117","label":"Style 2","sort":2,"primary":false,"visible":true},{"design":"2118","label":"Style 3","sort":3,"primary":false,"visible":true},{"design":"2121","label":"Style 4","sort":4,"primary":false,"visible":true},{"design":"2122","label":"Style 5","sort":5,"primary":false,"visible":true},{"design":"2120","label":"Style 6","sort":6,"primary":false,"visible":true},{"design":"2119","label":"Style 7","sort":7,"primary":false,"visible":true},{"design":"2123","label":"Style 8","sort":8,"primary":false,"visible":true},{"design":"2124","label":"Style 9","sort":9,"primary":false,"visible":true}]},{"id":"MB1-MONO-017","name":"Music & Guitar Monogram Signs","group":"Music & Guitar Monogram Styles","variantType":"Style","primaryDesign":"2372","variants":[{"design":"2372","label":"Music Monogram 1","sort":1,"primary":true,"visible":true},{"design":"2373","label":"Music Monogram 2","sort":2,"primary":false,"visible":true},{"design":"2374","label":"Music Monogram 3","sort":3,"primary":false,"visible":true},{"design":"2370","label":"Music Monogram 4","sort":4,"primary":false,"visible":true},{"design":"2371","label":"Music Monogram 5","sort":5,"primary":false,"visible":true},{"design":"2369","label":"Music Monogram 6","sort":6,"primary":false,"visible":true},{"design":"2368","label":"Music Monogram 7","sort":7,"primary":false,"visible":true},{"design":"2366","label":"Music Monogram 8","sort":8,"primary":false,"visible":true},{"design":"2367","label":"Music Monogram 9","sort":9,"primary":false,"visible":true},{"design":"2375","label":"Music Monogram 10","sort":10,"primary":false,"visible":true},{"design":"0959","label":"Guitar Monogram Frame","sort":11,"primary":false,"visible":true}]},{"id":"MB1-MONO-018","name":"Axe Monogram Signs","group":"Axe Monogram Styles","variantType":"Style","primaryDesign":"1652","variants":[{"design":"1652","label":"Style 1","sort":1,"primary":true,"visible":true},{"design":"1654","label":"Style 2","sort":2,"primary":false,"visible":true},{"design":"1655","label":"Style 3","sort":3,"primary":false,"visible":true},{"design":"1656","label":"Style 4","sort":4,"primary":false,"visible":true},{"design":"1657","label":"Style 5","sort":5,"primary":false,"visible":true},{"design":"1658","label":"Style 6","sort":6,"primary":false,"visible":true},{"design":"1659","label":"Style 7","sort":7,"primary":false,"visible":true},{"design":"1660","label":"Style 8","sort":8,"primary":false,"visible":true},{"design":"1661","label":"Style 9","sort":9,"primary":false,"visible":true},{"design":"1653","label":"Style 10","sort":10,"primary":false,"visible":true}]},{"id":"MB1-MONO-019","name":"Seasonal & Holiday Monogram Signs","group":"Seasonal & Holiday Monogram Styles","variantType":"Style","primaryDesign":"0770","variants":[{"design":"0770","label":"Snow Monogram Letter 1","sort":1,"primary":true,"visible":true},{"design":"0774","label":"Snow Split Monogram 1","sort":2,"primary":false,"visible":true},{"design":"0771","label":"Snow Monogram Letter 2","sort":3,"primary":false,"visible":true},{"design":"0772","label":"Snow Monogram Letter 3","sort":4,"primary":false,"visible":true},{"design":"0773","label":"Snow Monogram Letter 4","sort":5,"primary":false,"visible":true},{"design":"0463","label":"Happy Halloween Pumpkins Monogram","sort":6,"primary":false,"visible":true},{"design":"0466","label":"Happy Halloween Spider Web Monogram","sort":7,"primary":false,"visible":true},{"design":"0476","label":"Welcome Pumpkins Monogram","sort":8,"primary":false,"visible":true},{"design":"0479","label":"Welcome Spider Monogram Sign","sort":9,"primary":false,"visible":true},{"design":"0769","label":"Alphabet Turquey","sort":10,"primary":false,"visible":true},{"design":"0885","label":"Christmas Tree Monogram","sort":11,"primary":false,"visible":true},{"design":"1052","label":"Pumpkin Monogram Frame","sort":12,"primary":false,"visible":true},{"design":"1154","label":"Turkey Monogram","sort":13,"primary":false,"visible":true},{"design":"1663","label":"Merry Christmas Monogram Fancy Metal","sort":14,"primary":false,"visible":true}]},{"id":"MB1-MONO-020","name":"Decorative Home Monogram Signs","group":"Decorative Home Monogram Styles","variantType":"Style","primaryDesign":"0913","variants":[{"design":"0913","label":"Dream Catcher Monogram Frame","sort":1,"primary":true,"visible":true},{"design":"0978","label":"Infinity Monogram","sort":2,"primary":false,"visible":true},{"design":"1015","label":"Monogram Mason Jar","sort":3,"primary":false,"visible":true},{"design":"1016","label":"Monogram Round Deco","sort":4,"primary":false,"visible":true},{"design":"1233","label":"Monogram Round Fleur","sort":5,"primary":false,"visible":true},{"design":"1242","label":"Scroll Monogram","sort":6,"primary":false,"visible":true},{"design":"1299","label":"Stone Firepit Monogram Welcome","sort":7,"primary":false,"visible":true}]},{"id":"MB1-GROUP-021","name":"Split Scroll Letter Signs","group":"Split Scroll Alphabet","variantType":"Letter","primaryDesign":"0697","variants":[{"design":"0697","label":"Letter A","sort":1,"primary":true,"visible":true},{"design":"0698","label":"Letter B","sort":2,"primary":false,"visible":true},{"design":"0699","label":"Letter C","sort":3,"primary":false,"visible":true},{"design":"0700","label":"Letter D","sort":4,"primary":false,"visible":true},{"design":"0701","label":"Letter E","sort":5,"primary":false,"visible":true},{"design":"0702","label":"Letter F","sort":6,"primary":false,"visible":true},{"design":"0703","label":"Letter G","sort":7,"primary":false,"visible":true},{"design":"0704","label":"Letter H","sort":8,"primary":false,"visible":true},{"design":"0705","label":"Letter I","sort":9,"primary":false,"visible":true},{"design":"0706","label":"Letter J","sort":10,"primary":false,"visible":true},{"design":"0707","label":"Letter K","sort":11,"primary":false,"visible":true},{"design":"0708","label":"Letter L","sort":12,"primary":false,"visible":true},{"design":"0709","label":"Letter M","sort":13,"primary":false,"visible":true},{"design":"0710","label":"Letter N","sort":14,"primary":false,"visible":true},{"design":"0711","label":"Letter O","sort":15,"primary":false,"visible":true},{"design":"0712","label":"Letter P","sort":16,"primary":false,"visible":true},{"design":"0713","label":"Letter Q","sort":17,"primary":false,"visible":true},{"design":"0714","label":"Letter R","sort":18,"primary":false,"visible":true},{"design":"0715","label":"Letter S","sort":19,"primary":false,"visible":true},{"design":"0716","label":"Letter T","sort":20,"primary":false,"visible":true},{"design":"0717","label":"Letter U","sort":21,"primary":false,"visible":true},{"design":"0718","label":"Letter V","sort":22,"primary":false,"visible":true},{"design":"0719","label":"Letter W","sort":23,"primary":false,"visible":true},{"design":"0720","label":"Letter X","sort":24,"primary":false,"visible":true},{"design":"0721","label":"Letter Y","sort":25,"primary":false,"visible":true},{"design":"0722","label":"Letter Z","sort":26,"primary":false,"visible":true}]},{"id":"MB1-GROUP-022","name":"Steampunk Letter Monogram Signs","group":"Steampunk Alphabet","variantType":"Letter","primaryDesign":"0723","variants":[{"design":"0723","label":"Letter A","sort":1,"primary":true,"visible":true},{"design":"0724","label":"Letter B","sort":2,"primary":false,"visible":true},{"design":"0725","label":"Letter C","sort":3,"primary":false,"visible":true},{"design":"0726","label":"Letter D","sort":4,"primary":false,"visible":true},{"design":"0727","label":"Letter E","sort":5,"primary":false,"visible":true},{"design":"0728","label":"Letter F","sort":6,"primary":false,"visible":true},{"design":"0729","label":"Letter G","sort":7,"primary":false,"visible":true},{"design":"0730","label":"Letter H","sort":8,"primary":false,"visible":true},{"design":"0731","label":"Letter I","sort":9,"primary":false,"visible":true},{"design":"0732","label":"Letter J","sort":10,"primary":false,"visible":true},{"design":"0733","label":"Letter K","sort":11,"primary":false,"visible":true},{"design":"0734","label":"Letter L","sort":12,"primary":false,"visible":true},{"design":"0735","label":"Letter M","sort":13,"primary":false,"visible":true},{"design":"0737","label":"Letter N","sort":14,"primary":false,"visible":true},{"design":"0738","label":"Letter O","sort":15,"primary":false,"visible":true},{"design":"0739","label":"Letter P","sort":16,"primary":false,"visible":true},{"design":"0740","label":"Letter Q","sort":17,"primary":false,"visible":true},{"design":"0741","label":"Letter R","sort":18,"primary":false,"visible":true},{"design":"0742","label":"Letter S","sort":19,"primary":false,"visible":true},{"design":"0743","label":"Letter T","sort":20,"primary":false,"visible":true},{"design":"0744","label":"Letter U","sort":21,"primary":false,"visible":true},{"design":"0745","label":"Letter V","sort":22,"primary":false,"visible":true},{"design":"0746","label":"Letter W","sort":23,"primary":false,"visible":true},{"design":"0747","label":"Letter X","sort":24,"primary":false,"visible":true},{"design":"0748","label":"Letter Y","sort":25,"primary":false,"visible":true},{"design":"0749","label":"Letter Z","sort":26,"primary":false,"visible":true}]},{"id":"MB1-GROUP-023","name":"Bee & Honeycomb Signs","group":"Bee and Honeycomb Collection","variantType":"Style","primaryDesign":"0070","variants":[{"design":"0070","label":"Bee Honeycomb 1","sort":1,"primary":true,"visible":true},{"design":"0071","label":"Bee Honeycomb 2","sort":2,"primary":false,"visible":true},{"design":"0072","label":"Bee Honeycomb 3","sort":3,"primary":false,"visible":true},{"design":"0073","label":"Bee Honeycomb 4","sort":4,"primary":false,"visible":true},{"design":"0074","label":"Bee Honeycomb 5","sort":5,"primary":false,"visible":true},{"design":"0075","label":"Bee Honeycomb 6","sort":6,"primary":false,"visible":true},{"design":"0076","label":"Bees & Honeycomb 1","sort":7,"primary":false,"visible":true},{"design":"0077","label":"Bees & Honeycomb 2","sort":8,"primary":false,"visible":true},{"design":"0078","label":"Bees & Honeycomb 3","sort":9,"primary":false,"visible":true},{"design":"0079","label":"Bees & Honeycomb 4","sort":10,"primary":false,"visible":true},{"design":"0080","label":"Bees & Honeycomb 5","sort":11,"primary":false,"visible":true},{"design":"0081","label":"Bees & Honeycomb 6","sort":12,"primary":false,"visible":true},{"design":"0082","label":"Bees & Honeycomb 7","sort":13,"primary":false,"visible":true},{"design":"0083","label":"Bees & Honeycomb 8","sort":14,"primary":false,"visible":true},{"design":"0084","label":"Bees & Honeycomb 9","sort":15,"primary":false,"visible":true},{"design":"0085","label":"Bees & Honeycomb 10","sort":16,"primary":false,"visible":true},{"design":"0086","label":"Bees & Honeycomb 11","sort":17,"primary":false,"visible":true},{"design":"0087","label":"Bees & Honeycomb 12","sort":18,"primary":false,"visible":true},{"design":"0088","label":"Bees & Honeycomb 13","sort":19,"primary":false,"visible":true},{"design":"0089","label":"Bees & Honeycomb 14","sort":20,"primary":false,"visible":true},{"design":"0090","label":"Bees & Honeycomb 15","sort":21,"primary":false,"visible":true},{"design":"0091","label":"Bees & Honeycomb 16","sort":22,"primary":false,"visible":true},{"design":"0092","label":"Bees & Honeycomb 17","sort":23,"primary":false,"visible":true},{"design":"0093","label":"Bees & Honeycomb 18","sort":24,"primary":false,"visible":true},{"design":"0094","label":"Bees & Honeycomb 19","sort":25,"primary":false,"visible":true},{"design":"0095","label":"Bees & Honeycomb 20","sort":26,"primary":false,"visible":true},{"design":"0096","label":"Bees & Honeycomb 21","sort":27,"primary":false,"visible":true},{"design":"0097","label":"Bees & Honeycomb 22","sort":28,"primary":false,"visible":true},{"design":"0098","label":"Bees & Honeycomb 23","sort":29,"primary":false,"visible":true},{"design":"0099","label":"Bees & Honeycomb 24","sort":30,"primary":false,"visible":true},{"design":"0100","label":"Bees & Honeycomb 25","sort":31,"primary":false,"visible":true},{"design":"0101","label":"Bees & Honeycomb 26","sort":32,"primary":false,"visible":true},{"design":"0102","label":"Bees & Honeycomb 27","sort":33,"primary":false,"visible":true},{"design":"0103","label":"Bees & Honeycomb 28","sort":34,"primary":false,"visible":true},{"design":"0104","label":"Bees & Honeycomb 29","sort":35,"primary":false,"visible":true},{"design":"0105","label":"Bees & Honeycomb 30","sort":36,"primary":false,"visible":true}]},{"id":"MB1-GROUP-024","name":"Classic Cars & Trucks Signs","group":"Classic Cars and Trucks Collection","variantType":"Style","primaryDesign":"0106","variants":[{"design":"0106","label":"Car Front End 1","sort":1,"primary":true,"visible":true},{"design":"0114","label":"Car Front End 2","sort":2,"primary":false,"visible":true},{"design":"0115","label":"Car Front End 3","sort":3,"primary":false,"visible":true},{"design":"0116","label":"Car Front End 4","sort":4,"primary":false,"visible":true},{"design":"0117","label":"Car Front End 5","sort":5,"primary":false,"visible":true},{"design":"0118","label":"Car Front End 6","sort":6,"primary":false,"visible":true},{"design":"0119","label":"Car Front End 7","sort":7,"primary":false,"visible":true},{"design":"0120","label":"Car Front End 8","sort":8,"primary":false,"visible":true},{"design":"0121","label":"Car Front End 9","sort":9,"primary":false,"visible":true},{"design":"0107","label":"Car Front End 10","sort":10,"primary":false,"visible":true},{"design":"0108","label":"Car Front End 11","sort":11,"primary":false,"visible":true},{"design":"0109","label":"Car Front End 12","sort":12,"primary":false,"visible":true},{"design":"0110","label":"Car Front End 13","sort":13,"primary":false,"visible":true},{"design":"0111","label":"Car Front End 14","sort":14,"primary":false,"visible":true},{"design":"0112","label":"Car Front End 15","sort":15,"primary":false,"visible":true},{"design":"0113","label":"Car Front End 16","sort":16,"primary":false,"visible":true},{"design":"0971","label":"Hot Rod Truck","sort":17,"primary":false,"visible":true},{"design":"0972","label":"Hot Rod with Flames","sort":18,"primary":false,"visible":true},{"design":"0973","label":"Hot Rod","sort":19,"primary":false,"visible":true},{"design":"0974","label":"Hot Rod 2","sort":20,"primary":false,"visible":true},{"design":"0975","label":"Hot Rod Front View","sort":21,"primary":false,"visible":true}]},{"id":"MB1-GROUP-025","name":"Antler Base Letter Signs","group":"Antler Base Alphabet","variantType":"Letter","primaryDesign":"0541","variants":[{"design":"0541","label":"Letter A","sort":1,"primary":true,"visible":true},{"design":"0542","label":"Letter B","sort":2,"primary":false,"visible":true},{"design":"0543","label":"Letter C","sort":3,"primary":false,"visible":true},{"design":"0544","label":"Letter D","sort":4,"primary":false,"visible":true},{"design":"0545","label":"Letter E","sort":5,"primary":false,"visible":true},{"design":"0546","label":"Letter F","sort":6,"primary":false,"visible":true},{"design":"0547","label":"Letter G","sort":7,"primary":false,"visible":true},{"design":"0548","label":"Letter H","sort":8,"primary":false,"visible":true},{"design":"0549","label":"Letter I","sort":9,"primary":false,"visible":true},{"design":"0550","label":"Letter J","sort":10,"primary":false,"visible":true},{"design":"0551","label":"Letter K","sort":11,"primary":false,"visible":true},{"design":"0552","label":"Letter L","sort":12,"primary":false,"visible":true},{"design":"0553","label":"Letter M","sort":13,"primary":false,"visible":true},{"design":"0554","label":"Letter N","sort":14,"primary":false,"visible":true},{"design":"0555","label":"Letter O","sort":15,"primary":false,"visible":true},{"design":"0556","label":"Letter P","sort":16,"primary":false,"visible":true},{"design":"0557","label":"Letter Q","sort":17,"primary":false,"visible":true},{"design":"0558","label":"Letter R","sort":18,"primary":false,"visible":true},{"design":"0559","label":"Letter S","sort":19,"primary":false,"visible":true},{"design":"0560","label":"Letter T","sort":20,"primary":false,"visible":true},{"design":"0561","label":"Letter U","sort":21,"primary":false,"visible":true},{"design":"0562","label":"Letter V","sort":22,"primary":false,"visible":true},{"design":"0563","label":"Letter W","sort":23,"primary":false,"visible":true},{"design":"0564","label":"Letter X","sort":24,"primary":false,"visible":true},{"design":"0565","label":"Letter Y","sort":25,"primary":false,"visible":true},{"design":"0566","label":"Letter Z","sort":26,"primary":false,"visible":true}]},{"id":"MB1-GROUP-026","name":"Truck Signs","group":"Truck Design Collection","variantType":"Style","primaryDesign":"1614","variants":[{"design":"1614","label":"Truck 001","sort":1,"primary":true,"visible":true},{"design":"1615","label":"Truck 002","sort":2,"primary":false,"visible":true},{"design":"1616","label":"Truck 003","sort":3,"primary":false,"visible":true},{"design":"1617","label":"Truck 004","sort":4,"primary":false,"visible":true},{"design":"1618","label":"Truck 005","sort":5,"primary":false,"visible":true},{"design":"1619","label":"Truck 006","sort":6,"primary":false,"visible":true},{"design":"1620","label":"Truck 007","sort":7,"primary":false,"visible":true},{"design":"1621","label":"Truck 008","sort":8,"primary":false,"visible":true},{"design":"1622","label":"Truck 009","sort":9,"primary":false,"visible":true},{"design":"1623","label":"Truck 010","sort":10,"primary":false,"visible":true},{"design":"1624","label":"Truck 011","sort":11,"primary":false,"visible":true},{"design":"1625","label":"Truck 012","sort":12,"primary":false,"visible":true},{"design":"1626","label":"Truck 013","sort":13,"primary":false,"visible":true},{"design":"1627","label":"Truck 014","sort":14,"primary":false,"visible":true},{"design":"1628","label":"Truck 015","sort":15,"primary":false,"visible":true},{"design":"1629","label":"Truck 016","sort":16,"primary":false,"visible":true},{"design":"1630","label":"Truck 017","sort":17,"primary":false,"visible":true}]}]};
CONFIG={version:'22.2',groups:MB1_EMBEDDED_GROUP_CONFIG.groups};
buildMaps();
applyOverrides();
window.MB1_GROUPING_STATUS={
  version:'22.2',
  groupCount:CONFIG.groups.length,
  v20GroupCount:CONFIG.groups.filter(g=>String(g.id).startsWith('MB1-MONO-')).length,
  v21GroupCount:CONFIG.groups.filter(g=>String(g.id).startsWith('MB1-GROUP-')).length,
  antlerBaseVariants:(groupById.get('MB1-GROUP-025')?.variants||[]).length,
  truckVariants:(groupById.get('MB1-GROUP-026')?.variants||[]).length,
  truckFirst:(groupById.get('MB1-GROUP-026')?.variants||[])[0]?.design||'',
  truckLast:(groupById.get('MB1-GROUP-026')?.variants||[]).slice(-1)[0]?.design||''
};
console.info('MB1 grouped-product UI V22.2 loaded',window.MB1_GROUPING_STATUS);

})();
