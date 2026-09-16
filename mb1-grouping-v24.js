/* MB1 Monogram Grouping V20
   Load AFTER the existing catalog inline script.
   It groups related monogram child designs into one storefront card while
   preserving each child Design ID for ordering, direct links, customization,
   Cloudinary images and internal production.
*/
(function(){
  'use strict';
  let CONFIG=null;
  let groupByDesign=new Map();
  let groupById=new Map();
  let displayCache=null;

  const originalOpenProductData = typeof openProductData === 'function' ? openProductData : null;

  function norm(v){
    const m=String(v||'').match(/(\d{1,4})/);
    return m ? m[1].padStart(4,'0') : '';
  }
  function esc(s){return typeof e==='function'?e(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  function pcats(p){
    const raw=(Array.isArray(p.categories)&&p.categories.length)?p.categories:[p.category];
    return [...new Set(raw.filter(Boolean))];
  }
  function rawProductMap(){
    const m=new Map();
    (PRODUCTS||[]).forEach(p=>m.set(norm(p.design),p));
    return m;
  }
  function availableChildren(group){
    const pm=rawProductMap();
    return (group.variants||[])
      .filter(v=>v.visible!==false && pm.has(norm(v.design)))
      .sort((a,b)=>(a.sort||0)-(b.sort||0))
      .map(v=>({variant:v,product:pm.get(norm(v.design))}));
  }
  function buildMaps(){
    groupByDesign=new Map();
    groupById=new Map();
    (CONFIG?.groups||[]).forEach(g=>{
      groupById.set(g.id,g);
      (g.variants||[]).forEach(v=>groupByDesign.set(norm(v.design),g));
    });
    displayCache=null;
  }
  function buildDisplayProducts(){
    if(displayCache)return displayCache;
    const used=new Set();
    const grouped=[];
    const pm=rawProductMap();

    (CONFIG?.groups||[]).forEach(g=>{
      const children=availableChildren(g);
      if(children.length<2)return;
      children.forEach(x=>used.add(norm(x.product.design)));
      const primary=children.find(x=>norm(x.product.design)===norm(g.primaryDesign)) || children[0];
      const cats=[...new Set(children.flatMap(x=>pcats(x.product)))];
      const searchable=children.map(x=>[
        x.product.design,x.product.sku,x.product.name,x.variant.label,
        x.product.category,...pcats(x.product)
      ].join(' ')).join(' ');
      grouped.push({
        _mb1Grouped:true,
        groupId:g.id,
        group:g,
        design:norm(primary.product.design),
        sku:(children.length+' styles'),
        name:g.name,
        category:primary.product.category,
        categories:cats,
        image:primary.product.image,
        thumb:primary.product.thumb,
        alt:g.name+' by MB1 Advanced Solutions',
        description:'Choose from '+children.length+' available '+String(g.variantType||'style').toLowerCase()+' options.',
        customizable:children.some(x=>isCustomizableProduct(x.product)),
        children:children,
        searchText:searchable.toLowerCase()
      });
    });

    const standalone=(PRODUCTS||[]).filter(p=>!used.has(norm(p.design)));
    displayCache=[...grouped,...standalone];
    return displayCache;
  }
  function findDisplayByDesign(design){
    const d=norm(design);
    const g=groupByDesign.get(d);
    if(g){
      const gp=buildDisplayProducts().find(x=>x._mb1Grouped&&x.groupId===g.id);
      if(gp)return gp;
    }
    return (PRODUCTS||[]).find(p=>norm(p.design)===d)||null;
  }
  function groupedIsCustomizable(p){
    if(!p)return false;
    if(p._mb1Grouped)return p.children.some(x=>isCustomizableProduct(x.product));
    return isCustomizableProduct(p);
  }

  function installStyleUI(){
    if(document.getElementById('mb1StyleBox'))return;
    const detail=document.querySelector('.modal-box .detail');
    if(!detail)return;
    const firstOption=detail.querySelector('.option-box');
    const box=document.createElement('div');
    box.id='mb1StyleBox';
    box.className='option-box mb1-style-box';
    box.style.display='none';
    box.innerHTML='<label for="mb1StyleSelect">Choose Design Style</label><select id="mb1StyleSelect"></select><div id="mb1StyleThumbs" class="mb1-style-thumbs"></div><div id="mb1StyleSelected" class="mb1-style-selected"></div>';
    if(firstOption)detail.insertBefore(box,firstOption);else detail.appendChild(box);

    const style=document.createElement('style');
    style.textContent=`
      .mb1-style-box{margin-top:14px}
      .mb1-style-thumbs{display:flex;gap:8px;overflow-x:auto;padding:9px 1px 5px;scrollbar-width:thin}
      .mb1-style-thumb{flex:0 0 78px;width:78px;border:2px solid transparent;border-radius:10px;background:#fff;padding:4px;cursor:pointer;text-align:center;color:var(--ink)}
      .mb1-style-thumb.active{border-color:var(--accent);background:#fff}
      .mb1-style-thumb img{width:66px;height:66px;display:block;object-fit:contain;background:#fff;border-radius:6px;margin:auto}
      .mb1-style-thumb span{display:block;font-size:10px;line-height:1.15;margin-top:4px;white-space:normal}
      .mb1-style-selected{font-size:12px;color:var(--muted);margin-top:7px;font-weight:700}
      .card .style-count{font-size:11px;color:var(--muted);margin-top:4px}
    `;
    document.head.appendChild(style);
  }

  function childData(product){
    return typeof productDataFromCatalog==='function' ? productDataFromCatalog(product) : {
      design:product.design,name:product.name,category:product.category,categories:pcats(product),sku:product.sku,
      image:product.image,thumb:product.thumb,images:product.images,alt:product.alt,desc:product.description
    };
  }
  function styleLabelFor(group,design){
    const v=(group.variants||[]).find(x=>norm(x.design)===norm(design));
    return v?.label || ('Design '+norm(design));
  }
  function selectGroupedChild(display,childProduct,updateUrl){
    const d=childData(childProduct);
    currentDesign=norm(d.design);
    renderGallery(d);
    modalName.textContent=display.name;
    modalCat.textContent=pcats(display).map(categoryLabel).join(' - ');
    const styleLabel=styleLabelFor(display.group,currentDesign);
    modalMeta.innerHTML='<span class="pill">'+esc(styleLabel)+'</span><span class="pill">'+esc(d.sku)+'</span><span class="pill">Design '+esc(currentDesign)+'</span>';
    modalDesc.textContent=d.desc||display.description||'';

    const styleSelect=document.getElementById('mb1StyleSelect');
    const styleSelected=document.getElementById('mb1StyleSelected');
    if(styleSelect)styleSelect.value=currentDesign;
    if(styleSelected)styleSelected.textContent='Selected: '+styleLabel+' - MB1-'+currentDesign;
    document.querySelectorAll('.mb1-style-thumb').forEach(btn=>btn.classList.toggle('active',norm(btn.dataset.design)===currentDesign));

    updateCheckout();
    const canCustomize=isCustomizableProduct(childProduct);
    customArea.style.display=canCustomize?'block':'none';
    if(canCustomize)updateCustomizeLink();
    copyLinkStatus.textContent='';
    if(updateUrl)putDesignInAddressBar(currentDesign,'replace');
  }
  function renderStyleSelector(display,selectedDesign){
    installStyleUI();
    const box=document.getElementById('mb1StyleBox');
    const sel=document.getElementById('mb1StyleSelect');
    const thumbs=document.getElementById('mb1StyleThumbs');
    if(!box||!sel||!thumbs)return;
    box.style.display='block';
    const children=display.children;
    sel.innerHTML=children.map(x=>'<option value="'+esc(norm(x.product.design))+'">'+esc(x.variant.label)+' - MB1-'+esc(norm(x.product.design))+'</option>').join('');
    thumbs.innerHTML=children.map(x=>'<button type="button" class="mb1-style-thumb" data-design="'+esc(norm(x.product.design))+'" title="'+esc(x.variant.label)+'"><img src="'+esc(x.product.thumb||x.product.image)+'" alt=""><span>'+esc(x.variant.label)+'</span></button>').join('');
    sel.value=norm(selectedDesign);
    const choose=(design)=>{
      const hit=children.find(x=>norm(x.product.design)===norm(design));
      if(hit)selectGroupedChild(display,hit.product,true);
    };
    sel.onchange=()=>choose(sel.value);
    thumbs.querySelectorAll('.mb1-style-thumb').forEach(btn=>btn.onclick=()=>choose(btn.dataset.design));
  }
  function hideStyleSelector(){
    const box=document.getElementById('mb1StyleBox');
    if(box)box.style.display='none';
  }
  function openGrouped(display,selectedDesign,updateUrl=true){
    const chosen=display.children.find(x=>norm(x.product.design)===norm(selectedDesign)) || display.children[0];
    modalSize.value='8';
    modalColor.value='Black';
    renderStyleSelector(display,chosen.product.design);
    selectGroupedChild(display,chosen.product,updateUrl);
    modal.classList.add('open');
    if(updateUrl)putDesignInAddressBar(chosen.product.design,'replace');
  }

  function applyOverrides(){
    installStyleUI();

    baseProducts=function(){
      const src=buildDisplayProducts();
      return CUSTOMIZABLE_ONLY ? src.filter(groupedIsCustomizable) : src;
    };

    buildCategoryButtons=function(){
      const source=baseProducts();
      const counts={};
      source.forEach(p=>pcats(p).forEach(c=>counts[c]=(counts[c]||0)+1));
      const cats=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]||categoryLabel(a).localeCompare(categoryLabel(b)));
      categoryButtons.innerHTML=`<button class="category-btn active" data-cat="">${esc(ALL_LABEL)} (${source.length})</button>`+cats.map(c=>`<button class="category-btn" data-cat="${esc(c)}">${esc(categoryLabel(c))} (${counts[c]})</button>`).join('')+(location.pathname.endsWith('index.html')||location.pathname.endsWith('/')?`<a class="category-btn" href="religious.html">Religious</a>`:'');
      categoryButtons.querySelectorAll('.category-btn').forEach(btn=>btn.addEventListener('click',()=>{if(btn.tagName==='A')return;category.value=btn.dataset.cat;render()}));
      category.innerHTML='<option value="">All categories</option>';
      [...cats].sort((a,b)=>categoryLabel(a).localeCompare(categoryLabel(b))).forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=categoryLabel(c);category.appendChild(o)});
      const customLink=document.querySelector('.customizable-link');
      if(customLink)customLink.textContent='Customizable ('+buildDisplayProducts().filter(groupedIsCustomizable).length.toLocaleString()+')';
    };

    render=function(){
      const q=(search.value||'').trim().toLowerCase(),c=category.value||'';
      const source=baseProducts();
      const filtered=source.filter(p=>{
        const cats=pcats(p);
        const hay=p._mb1Grouped ? p.searchText : (p.design+' '+p.sku+' '+p.name+' '+p.category+' '+cats.join(' ')).toLowerCase();
        return(!q||hay.includes(q))&&(!c||cats.includes(c));
      });
      const childCount=filtered.reduce((n,p)=>n+(p._mb1Grouped?p.children.length:1),0);
      count.textContent=filtered.length.toLocaleString()+' items shown'+(childCount!==filtered.length?' - '+childCount.toLocaleString()+' designs available':'');
      categoryButtons.querySelectorAll('.category-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.cat===c));
      grid.innerHTML=filtered.map(p=>`<article class="card"><div class="art"><img loading="lazy" src="${esc(p.thumb)}" alt="${esc(p.alt||p.name)}"></div><div class="info"><div class="cat">${esc(categoryLabel(c||p.category))}</div><div class="name">${esc(p.name)}</div>${p._mb1Grouped?`<div class="style-count">${p.children.length} styles in one item</div>`:''}<div class="meta">${esc(p._mb1Grouped?(p.children.length+' design options'):p.sku)}<br><span class="price">From $49</span> - 8&quot;-48&quot;</div><button class="view-button" data-display-key="${esc(p._mb1Grouped?p.groupId:norm(p.design))}">${p._mb1Grouped?'Choose Style':'View Design'}</button></div></article>`).join('');
      grid.querySelectorAll('.view-button').forEach(btn=>btn.addEventListener('click',()=>{
        const key=btn.dataset.displayKey;
        const p=groupById.has(key)?buildDisplayProducts().find(x=>x._mb1Grouped&&x.groupId===key):(PRODUCTS||[]).find(x=>norm(x.design)===norm(key));
        if(!p)return;
        if(p._mb1Grouped)openGrouped(p,p.design,true);else openProductData(childData(p),true);
      }));
    };

    openProductData=function(d,updateUrl=true){
      const design=norm(d?.design);
      const display=findDisplayByDesign(design);
      if(display&&display._mb1Grouped){openGrouped(display,design,updateUrl);return;}
      hideStyleSelector();
      if(originalOpenProductData)originalOpenProductData(d,updateUrl);
    };

    // Refresh after config becomes available. This also corrects a raw first paint
    // if catalog-data finished loading before this file did.
    if((PRODUCTS||[]).length){
      displayCache=null;
      buildCategoryButtons();
      render();
      const requested=norm(new URLSearchParams(location.search).get('design'));
      if(requested){
        const raw=(PRODUCTS||[]).find(x=>norm(x.design)===requested);
        if(raw)openProductData(childData(raw),false);
      }
    }
  }

  Promise.all([
    fetch('monogram-groups-v20.json?v=24').then(r=>{if(!r.ok)throw new Error('V20 grouping config '+r.status);return r.json();}),
    fetch('catalog-groups-v21.json?v=24').then(r=>{if(!r.ok)throw new Error('V21 grouping config '+r.status);return r.json();})
  ])
    .then(([baseCfg,extraCfg])=>{
      CONFIG={version:24,groups:[...(baseCfg.groups||[]),...(extraCfg.groups||[])]};
      buildMaps();
      applyOverrides();

      const ant=groupById.get('MB1-GROUP-025');
      const truck=groupById.get('MB1-GROUP-026');
      let groupedCards=0;
      try{groupedCards=buildDisplayProducts().filter(p=>p._mb1Grouped).length;}catch(_){}
      window.MB1_GROUPING_STATUS={
        version:'24.0',
        groupCount:(CONFIG.groups||[]).length,
        v20GroupCount:(CONFIG.groups||[]).filter(g=>String(g.id).indexOf('MB1-MONO-')===0).length,
        v21GroupCount:(CONFIG.groups||[]).filter(g=>String(g.id).indexOf('MB1-GROUP-')===0).length,
        antlerBaseVariants:(ant&&ant.variants||[]).length,
        truckVariants:(truck&&truck.variants||[]).length,
        groupedCards:groupedCards,
        productCount:(PRODUCTS||[]).length
      };
      console.info('MB1 grouped storefront V24 loaded',window.MB1_GROUPING_STATUS);
    })
    .catch(err=>console.error('MB1 grouping V24 not loaded:',err));
})();
