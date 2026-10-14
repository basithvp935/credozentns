let cat="all",sort="rel";
const gridEl=$("#grid"),prevBtn=$("#slide-prev"),nextBtn=$("#slide-next"),dotsEl=$("#slider-dots");

function updateSliderState(){
  if(!gridEl)return;
  const maxScroll=Math.max(0,gridEl.scrollWidth-gridEl.clientWidth);
  if(prevBtn)prevBtn.disabled=gridEl.scrollLeft<=8;
  if(nextBtn)nextBtn.disabled=gridEl.scrollLeft>=maxScroll-8;
  if(dotsEl){
    if(window.innerWidth<=768){
      const cards=gridEl.querySelectorAll(".slide-card-wrap");
      const totalPages=Math.max(1,Math.ceil(cards.length/2));
      let curPage=0;
      for(let i=0;i<cards.length;i+=2){
        if(cards[i].offsetLeft<=gridEl.scrollLeft+30){
          curPage=Math.floor(i/2);
        }
      }
      curPage=Math.min(totalPages-1,curPage);
      if(dotsEl.children.length!==totalPages){
        dotsEl.innerHTML=Array.from({length:totalPages},(_,i)=>`<button class="dot ${i===curPage?"active":""}" data-idx="${i}" aria-label="Slide ${i+1}"></button>`).join("");
      }else{
        [...dotsEl.children].forEach((dot,i)=>dot.classList.toggle("active",i===curPage));
      }
    }else{
      const step=gridEl.clientWidth||1;
      const totalPages=Math.max(1,Math.ceil(gridEl.scrollWidth/step));
      const curPage=Math.min(totalPages-1,Math.round(gridEl.scrollLeft/step));
      if(dotsEl.children.length!==totalPages){
        dotsEl.innerHTML=Array.from({length:totalPages},(_,i)=>`<button class="dot ${i===curPage?"active":""}" data-idx="${i}" aria-label="Slide ${i+1}"></button>`).join("");
      }else{
        [...dotsEl.children].forEach((dot,i)=>dot.classList.toggle("active",i===curPage));
      }
    }
  }
}

if(prevBtn){
  prevBtn.onclick=()=>{
    if(gridEl){
      if(window.innerWidth<=768){
        const cards=gridEl.querySelectorAll(".slide-card-wrap");
        const curScroll=gridEl.scrollLeft;
        let target=null;
        for(let i=cards.length-1;i>=0;i--){
          if(i%2===0&&cards[i].offsetLeft<curScroll-15){
            target=cards[i];
            break;
          }
        }
        if(target){
          gridEl.scrollTo({left:target.offsetLeft,behavior:"smooth"});
        }else{
          gridEl.scrollTo({left:0,behavior:"smooth"});
        }
      }else{
        gridEl.scrollBy({left:-gridEl.clientWidth*0.9,behavior:"smooth"});
      }
    }
  };
}
if(nextBtn){
  nextBtn.onclick=()=>{
    if(gridEl){
      if(window.innerWidth<=768){
        const cards=gridEl.querySelectorAll(".slide-card-wrap");
        const curScroll=gridEl.scrollLeft;
        let target=null;
        for(let i=0;i<cards.length;i+=2){
          if(cards[i].offsetLeft>curScroll+15){
            target=cards[i];
            break;
          }
        }
        if(target){
          gridEl.scrollTo({left:target.offsetLeft,behavior:"smooth"});
        }else{
          gridEl.scrollBy({left:gridEl.clientWidth,behavior:"smooth"});
        }
      }else{
        gridEl.scrollBy({left:gridEl.clientWidth*0.9,behavior:"smooth"});
      }
    }
  };
}
if(gridEl){
  gridEl.addEventListener("scroll",()=>requestAnimationFrame(updateSliderState),{passive:true});
}
if(dotsEl){
  dotsEl.onclick=e=>{
    const d=e.target.closest(".dot");
    if(!d||!gridEl)return;
    const idx=parseInt(d.dataset.idx,10);
    if(window.innerWidth<=768){
      const cards=gridEl.querySelectorAll(".slide-card-wrap");
      const target=cards[idx*2];
      if(target)gridEl.scrollTo({left:target.offsetLeft,behavior:"smooth"});
    }else{
      gridEl.scrollTo({left:idx*gridEl.clientWidth,behavior:"smooth"});
    }
  };
}

// professions + chips
if($("#chips")){
  $("#chips").innerHTML=Object.entries(CATS).map(([k,v])=>`<button class="chip-b ${k==="all"?"on":""}" data-k="${k}">${v}</button>`).join("");
}

function render(){
  if(!gridEl)return;
  let l=P.filter(p=>cat==="all"||p.t===cat);
  const f={rel:(a,b)=>a.i-b.i,best:(a,b)=>b.off-a.off,az:(a,b)=>a.n.localeCompare(b.n),za:(a,b)=>b.n.localeCompare(a.n),pl:(a,b)=>a.p-b.p,ph:(a,b)=>b.p-a.p}[sort];
  l=[...l].sort(f);
  gridEl.innerHTML=l.map((p,k)=>`<div class="slide-card-wrap"><article class="pc">
    <div class="pv">
      ${p.off?`<span class="off">Sale · ${p.off}% off</span>`:""}
      <span class="wt">${p.w || p.mat}</span>
      <span class="pv-chip-pill"><svg class="i"><use href="#i-broadcast"/></svg> Tap to Share</span>
      <img src="${p.img}" class="pv-img" alt="${p.n}" loading="lazy">
    </div>
    <div class="pb">
      <div class="pc-meta-top">
        <span class="tag">${TAG[p.t]}</span>
        <div class="pc-rating">
          <span class="stars">★</span>
          <b>${p.rating}</b>
          <span class="cnt-rev">(${p.reviews})</span>
        </div>
      </div>
      <h3 class="pc-title" title="${p.n}">${p.n}</h3>
      <div class="pc-feature-chip">
        <svg class="i"><use href="#i-check2"/></svg>
        <span>Instant Tap · NTAG215 Fast Chip</span>
      </div>
      <div class="price-wrap">
        <div class="price">
          <b>${inr(p.p)}</b>
          ${p.m?`<s>${inr(p.m)}</s><span class="save">Save ${inr(p.m-p.p)}</span>`:""}
        </div>
      </div>
      <div class="pc-actions">
        <a href="shop.html" class="btn-quick-view" title="Explore full catalog details">Specs</a>
        <button class="add" data-i="${p.i}"><svg class="i"><use href="#i-bag-plus"/></svg>Add to cart<svg class="i ar"><use href="#i-arrow-right"/></svg></button>
      </div>
    </div>
  </article></div>`).join("");
  gridEl.scrollLeft=0;
  setTimeout(updateSliderState,50);
  observe();
}

if($("#chips"))$("#chips").onclick=e=>{const b=e.target.closest("button");if(!b)return;cat=b.dataset.k;document.querySelectorAll(".chip-b").forEach(x=>x.classList.toggle("on",x===b));render()};
if($("#sort"))$("#sort").onchange=e=>{sort=e.target.value;render()};
if(gridEl)gridEl.onclick=e=>{const b=e.target.closest(".add");if(!b)return;cart.push(P[b.dataset.i]);b.classList.add("done");b.innerHTML='<svg class="i"><use href="#i-check2"/></svg>Added';setTimeout(()=>{b.classList.remove("done");b.innerHTML='<svg class="i"><use href="#i-bag-plus"/></svg>Add to cart<svg class="i ar"><use href="#i-arrow-right"/></svg>'},1300);drawCart()};

function drawCart(){
  saveCart();
  if($("#cnt"))$("#cnt").textContent=cart.length;
  if($("#ci"))$("#ci").innerHTML=cart.length?cart.map((p,k)=>`<div class="ci"><span>${p.n}<br><small class="text-muted">${inr(p.p)}</small></span><button data-k="${k}" aria-label="Remove"><svg class="i"><use href="#i-trash"/></svg></button></div>`).join(""):'<p class="text-muted">You have no items in your cart</p>';
  if($("#ct"))$("#ct").innerHTML=cart.length?`<span>Total</span><b>${inr(cart.reduce((a,p)=>a+p.p,0))}</b>`:"";
}
if($("#ci"))$("#ci").onclick=e=>{const b=e.target.closest("button");if(b){cart.splice(b.dataset.k,1);drawCart()}};
if($("#subf"))$("#subf").onsubmit=e=>{e.preventDefault();$("#subm").textContent="Thank you for subscribing!";e.target.reset()};
drawCart();

// reveal on scroll
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}}),{threshold:.12,rootMargin:"0px 0px -6% 0px"});
function observe(){document.querySelectorAll(".rv:not(.in)").forEach(el=>io.observe(el))}

// smooth scroll (Lenis) with graceful fallback
let lenis=null;
if(window.Lenis&&!matchMedia("(prefers-reduced-motion:reduce)").matches){
  lenis=new Lenis({duration:1.15,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});
  const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf);
}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",e=>{
  const id=a.getAttribute("href");if(id.length<2)return;const t=document.querySelector(id);if(!t)return;e.preventDefault();
  const m=document.getElementById("menu");if(m.classList.contains("show"))bootstrap.Collapse.getOrCreateInstance(m).hide();
  lenis?lenis.scrollTo(t,{offset:-60}):t.scrollIntoView({behavior:"smooth"});
}));
$("#top").onclick=()=>lenis?lenis.scrollTo(0):scrollTo({top:0,behavior:"smooth"});

// scroll effects
const nav=$("#nav"),pr=$("#progress"),tp=$("#top"),oa=$(".orb.a"),ob=$(".orb.b");
function onS(){const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
  nav.classList.toggle("scrolled",y>30);pr.style.width=(y/h*100)+"%";tp.classList.toggle("show",y>700);
  oa.style.transform=`translateY(${y*.15}px)`;ob.style.transform=`translateY(${-y*.1}px)`}
addEventListener("scroll",onS,{passive:true});onS();

// ===== HERO 3-CARD LUXURY SLIDER (2.5s INTERVAL) =====
// Initialize logo across hero cards
document.querySelectorAll(".hero-logo").forEach(img => {
  if (typeof LOGO !== "undefined") img.src = LOGO;
});

const heroCards = document.querySelectorAll(".hero-cards-wrapper .nfc-card");
const heroTabs = document.querySelectorAll(".hero-card-tab");
const stageEl = $("#stage");
const heroPrevBtn = $("#heroStagePrev");
const heroNextBtn = $("#heroStageNext");
const heroWrapper = $("#heroCardsWrapper");
let currentHeroCard = 0;
let isHeroSliding = false;
let heroSliderTimer = null;
const HERO_INTERVAL = 2500; // 2.5 seconds auto-slide
const SLIDE_DURATION = 820; // Matches CSS transition duration

function setHeroCard(targetIndex, direction = null) {
  if (isHeroSliding || !heroCards.length) return;
  const target = (targetIndex + heroCards.length) % heroCards.length;
  if (target === currentHeroCard && direction === null) return;

  // Determine sliding direction: 1 = forward (right to left), -1 = backward (left to right)
  const dir = direction !== null ? direction : (target > currentHeroCard ? 1 : -1);

  isHeroSliding = true;
  const oldCard = heroCards[currentHeroCard];
  const newCard = heroCards[target];

  // 1. Stage the incoming card off-screen in the correct direction without animation
  newCard.classList.add("no-trans");
  newCard.classList.remove("active", "slide-left", "slide-right");
  if (dir > 0) {
    newCard.classList.add("slide-right");
  } else {
    newCard.classList.add("slide-left");
  }
  newCard.style.transform = "";
  void newCard.offsetWidth; // Force layout reflow
  newCard.classList.remove("no-trans");

  // 2. Perform the smooth sliding animation simultaneously
  oldCard.classList.remove("no-trans", "active");
  oldCard.style.transform = "";
  if (dir > 0) {
    oldCard.classList.add("slide-left");
  } else {
    oldCard.classList.add("slide-right");
  }

  newCard.classList.remove("slide-left", "slide-right");
  newCard.classList.add("active");

  currentHeroCard = target;

  // 3. Synchronize tabs and 2.5s progress countdown bar
  heroTabs.forEach((tab, i) => {
    tab.classList.toggle("active", i === currentHeroCard);
    const bar = tab.querySelector(".bar");
    if (bar) {
      bar.style.animation = "none";
      void bar.offsetHeight;
      if (i === currentHeroCard) {
        bar.style.animation = `progressTimer ${HERO_INTERVAL}ms linear infinite`;
      }
    }
  });

  // 4. Release slide lock after duration completes
  setTimeout(() => {
    isHeroSliding = false;
  }, SLIDE_DURATION);
}

function startHeroSlider() {
  stopHeroSlider();
  heroSliderTimer = setInterval(() => {
    setHeroCard(currentHeroCard + 1, 1);
  }, HERO_INTERVAL);
}

function stopHeroSlider() {
  if (heroSliderTimer) {
    clearInterval(heroSliderTimer);
    heroSliderTimer = null;
  }
}

if (heroPrevBtn) {
  heroPrevBtn.addEventListener("click", () => {
    setHeroCard(currentHeroCard - 1, -1);
    startHeroSlider();
  });
}

if (heroNextBtn) {
  heroNextBtn.addEventListener("click", () => {
    setHeroCard(currentHeroCard + 1, 1);
    startHeroSlider();
  });
}

heroTabs.forEach((tab, idx) => {
  tab.addEventListener("click", () => {
    if (idx === currentHeroCard) return;
    const dir = idx > currentHeroCard ? 1 : -1;
    setHeroCard(idx, dir);
    startHeroSlider();
  });
});

if (heroWrapper) {
  let touchStartX = 0;
  heroWrapper.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  heroWrapper.addEventListener("touchend", e => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        setHeroCard(currentHeroCard + 1, 1);
      } else {
        setHeroCard(currentHeroCard - 1, -1);
      }
      startHeroSlider();
    }
  }, { passive: true });
}

if (stageEl) {
  stageEl.addEventListener("mousemove", e => {
    if (isHeroSliding) return;
    const activeCard = heroCards[currentHeroCard];
    if (!activeCard) return;
    const r = stageEl.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    activeCard.style.transform = `translate3d(0,0,0) rotateY(${x * 18}deg) rotateX(${-y * 18}deg) scale(1.02)`;
  });

  stageEl.addEventListener("mouseenter", () => {
    stopHeroSlider();
  });

  stageEl.addEventListener("mouseleave", () => {
    const activeCard = heroCards[currentHeroCard];
    if (activeCard) {
      activeCard.style.transform = "";
    }
    startHeroSlider();
  });
}

startHeroSlider();

render();drawCart();observe();
// ===== v3 scroll animation =====
let wi=0;
function split(node,g){[...node.childNodes].forEach(n=>{
  if(n.nodeType===3){const f=document.createDocumentFragment();n.textContent.split(/(\s+)/).forEach(s=>{
    if(!s)return;if(!s.trim()){f.append(s);return}
    const w=document.createElement("span");w.className="w";const i=document.createElement("span");i.textContent=s;i.style.setProperty("--i",wi++);if(g)i.className="gtext";w.append(i);f.append(w)});n.replaceWith(f)}
  else if(n.nodeType===1){const had=n.classList.contains("gtext");if(had)n.classList.remove("gtext");split(n,g||had)}})}
document.querySelectorAll(".sp:not(.about-img)").forEach(h=>{wi=0;split(h,false)});
document.querySelectorAll(".sp").forEach(e=>io.observe(e));

// counters from real product data
$("#s1").dataset.to=P.length;$("#s2").dataset.to=Math.max(...P.map(p=>p.off));$("#s3").dataset.to=Math.min(...P.map(p=>p.p));
const co=new IntersectionObserver(es=>es.forEach(x=>{if(!x.isIntersecting)return;co.unobserve(x.target);const el=x.target,to=+el.dataset.to,pre=el.dataset.pre||"",suf=el.dataset.suf||"",t0=performance.now();
  (function s(t){const k=Math.min(1,(t-t0)/1800),e=1-Math.pow(1-k,4);el.textContent=pre+Math.round(to*e)+suf;if(k<1)requestAnimationFrame(s)})(t0)}),{threshold:.6});
document.querySelectorAll(".cnt").forEach(e=>co.observe(e));

// parallax + hero fade
const par=[[".orb.a",.25],[".orb.b",-.18],["#stage",.07],[".about-img img.main",.09],[".stats",.03]].map(([s,v])=>[document.querySelector(s),v]).filter(a=>a[0]);
const heroTxt=document.querySelector(".hero .col-lg-6");
let last=scrollY,vel=0;
(function loop(){
  const y=scrollY;vel+=((y-last)-vel)*.12;last=y;
  par.forEach(([el,s])=>{const r=el.getBoundingClientRect();el.style.translate="0 "+(-(r.top+r.height/2-innerHeight/2)*s).toFixed(1)+"px"});
  if(innerWidth>=992){
    if(y<innerHeight*1.2&&heroTxt){heroTxt.style.translate="0 "+(y*.22)+"px";heroTxt.style.opacity=Math.max(0,1-y/(innerHeight*.75))}
  }else if(heroTxt){
    heroTxt.style.translate="none";
    heroTxt.style.opacity="1";
  }
  requestAnimationFrame(loop)})();

// cursor glow, magnetic buttons, product tilt
const gl=$("#glow");let gx=0,gy=0,mx=0,my=0;
addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY;gl.style.opacity=1});
(function g(){gx+=(mx-gx)*.08;gy+=(my-gy)*.08;gl.style.transform=`translate(${gx}px,${gy}px)`;requestAnimationFrame(g)})();
document.addEventListener("mousemove",e=>{const b=e.target.closest&&e.target.closest(".btn-g,.btn-o");
  document.querySelectorAll(".btn-g,.btn-o").forEach(x=>{if(x!==b)x.style.translate=""});
  if(b){const r=b.getBoundingClientRect();b.style.translate=`${(e.clientX-r.left-r.width/2)*.18}px ${(e.clientY-r.top-r.height/2)*.28}px`}});
$("#grid").addEventListener("mousemove",e=>{const c=e.target.closest(".pc");if(!c)return;const r=c.getBoundingClientRect();
  c.style.setProperty("--ry",((e.clientX-r.left)/r.width-.5)*10+"deg");c.style.setProperty("--rx",-((e.clientY-r.top)/r.height-.5)*10+"deg")});
$("#grid").addEventListener("mouseout",e=>{const c=e.target.closest(".pc");if(c&&!c.contains(e.relatedTarget)){c.style.setProperty("--rx","0deg");c.style.setProperty("--ry","0deg")}});


// ===== v4 premium type =====
// nav text-roll
document.querySelectorAll(".nav-link").forEach(a=>{const s=a.textContent.trim();a.innerHTML=`<span class="tr" data-t="${s}"><span>${s}</span></span>`});
// rotating profession words
const PR=["Doctor","Lawyer & Advocate","CA","Sales Professionals","Freelancer","Social Media Influencers","Jewellery Professionals"];
const rl=$("#rl"),rw=rl.parentElement;
rl.innerHTML=[...PR,PR[0]].map(x=>`<b class="gtext">${x}</b>`).join("");
let ri=0;const bs=[...rl.children];
const setW=()=>rw.style.width=bs[ri%PR.length].offsetWidth+"px";
setTimeout(setW,50);addEventListener("resize",setW);
setInterval(()=>{ri++;rl.style.transform=`translateY(${-ri*bs[0].offsetHeight}px)`;rw.style.width=bs[ri].offsetWidth+"px";
  if(ri===PR.length)setTimeout(()=>{rl.style.transition="none";ri=0;rl.style.transform="none";rl.offsetHeight;rl.style.transition="";},900)},2400);
// big outline marquee text (auto-sliding continuous loop)
const bt=["Metal NFC Business Card","Wooden NFC Business Card","TNS NFC Business Card","Smart Standees"];
const row=(a)=>{
  const half=[...a,...a,...a];
  return [...half,...half].map(x=>`<span>${x}</span>`).join("");
};
if($("#br1"))$("#br1").innerHTML=row(bt);
if($("#br2"))$("#br2").innerHTML=row([...bt].reverse());
const scr=[...document.querySelectorAll("[data-scrub]")];
(function frame(){
  const vh=innerHeight;
  scr.forEach(e=>{const q=e.getBoundingClientRect(),v=Math.min(1,Math.max(0,(vh-q.top)/(q.height+vh*.55)));e.style.setProperty("--p",v.toFixed(3))});
  requestAnimationFrame(frame)})();
// preloader -> hero entrance
const pre=$("#pre"),heroEls=[...document.querySelectorAll(".hero .rv,.hero .sp")];
heroEls.forEach(e=>io.unobserve(e));if(lenis)lenis.stop();
setTimeout(()=>{pre.classList.add("done");document.body.classList.remove("lock");if(lenis)lenis.start();
  setTimeout(()=>heroEls.forEach(e=>io.observe(e)),450);setTimeout(()=>pre.remove(),1300)},1900);

// ===== v5: pinned horizontal scroll, spotlight, floaty parallax =====
const hw=$("#pros"),ht=$("#hst"),hb=$("#hsb"),hcs=[...ht.children];
document.querySelectorAll(".floaty,.sb .deco,.sb .gift").forEach(e=>par.push([e,+e.dataset.s]));
(function hs(){
  if(innerWidth>=768){
    const r=hw.getBoundingClientRect(),vw=innerWidth,p=Math.min(1,Math.max(0,-r.top/(hw.offsetHeight-innerHeight)));
    const max=Math.max(0,ht.scrollWidth-vw);ht.style.transform=`translate3d(${-p*max}px,0,0)`;hb.style.width=(p*100)+"%";
    hcs.forEach(c=>{const q=c.getBoundingClientRect(),d=Math.min(1,Math.abs(q.left+q.width/2-vw/2)/vw);
      c.style.transform=`scale(${(1-d*.1).toFixed(3)}) translateY(${(d*22).toFixed(1)}px)`;c.style.filter=`saturate(${(1-d*.25).toFixed(2)})`});
  }else{
    ht.style.transform="none";
    const max=ht.scrollWidth-ht.clientWidth;
    const p=max>0?ht.scrollLeft/max:0;
    hb.style.width=(p*100)+"%";
    hcs.forEach(c=>{c.style.transform="none";c.style.filter="none"});
  }
  requestAnimationFrame(hs)})();
function setCat(k){cat=k;document.querySelectorAll(".chip-b").forEach(x=>x.classList.toggle("on",x.dataset.k===k));render()}
hcs.forEach(c=>c.addEventListener("click",()=>setCat(c.dataset.cat)));
document.querySelector(".add-x").addEventListener("click",e=>{const b=e.currentTarget;cart.push(P[b.dataset.i]);drawCart();
  const o=b.innerHTML;b.innerHTML='<svg class="i"><use href="#i-check2"/></svg> Added';setTimeout(()=>b.innerHTML=o,1300)});

// ===== TESTIMONIALS AUTO-SLIDER =====
const testiViewport = $("#testiViewport");
const testiPrev = $("#testiPrev");
const testiNext = $("#testiNext");
const testiDots = $("#testiDots");
let testiAutoTimer = null;
const TESTI_INTERVAL = 3800; // 3.8s smooth auto-slide

function updateTestiDots() {
  if (!testiViewport || !testiDots) return;
  const slideEl = testiViewport.querySelector(".testi-slide");
  const slideW = slideEl ? slideEl.offsetWidth : 340;
  const gap = 28;
  const totalSlides = testiViewport.querySelectorAll(".testi-slide").length;
  const step = slideW + gap;
  const maxScroll = Math.max(0, testiViewport.scrollWidth - testiViewport.clientWidth);
  const totalPages = Math.max(1, Math.ceil(testiViewport.scrollWidth / (testiViewport.clientWidth || 1)));
  const curPage = Math.min(totalPages - 1, Math.round(testiViewport.scrollLeft / (testiViewport.clientWidth || 1)));

  if (testiPrev) testiPrev.disabled = testiViewport.scrollLeft <= 10;
  if (testiNext) testiNext.disabled = testiViewport.scrollLeft >= maxScroll - 10;

  if (testiDots.children.length !== totalPages) {
    testiDots.innerHTML = Array.from({ length: totalPages }, (_, i) => 
      `<button class="testi-dot ${i === curPage ? "active" : ""}" data-page="${i}" aria-label="Review page ${i + 1}"></button>`
    ).join("");
  } else {
    [...testiDots.children].forEach((dot, i) => dot.classList.toggle("active", i === curPage));
  }
}

function slideTestiNext() {
  if (!testiViewport) return;
  const slideEl = testiViewport.querySelector(".testi-slide");
  const step = (slideEl ? slideEl.offsetWidth : 340) + 28;
  const maxScroll = testiViewport.scrollWidth - testiViewport.clientWidth;
  if (testiViewport.scrollLeft >= maxScroll - 15) {
    testiViewport.scrollTo({ left: 0, behavior: "smooth" });
  } else {
    testiViewport.scrollBy({ left: step, behavior: "smooth" });
  }
}

function slideTestiPrev() {
  if (!testiViewport) return;
  const slideEl = testiViewport.querySelector(".testi-slide");
  const step = (slideEl ? slideEl.offsetWidth : 340) + 28;
  if (testiViewport.scrollLeft <= 15) {
    testiViewport.scrollTo({ left: testiViewport.scrollWidth, behavior: "smooth" });
  } else {
    testiViewport.scrollBy({ left: -step, behavior: "smooth" });
  }
}

function startTestiAuto() {
  stopTestiAuto();
  testiAutoTimer = setInterval(slideTestiNext, TESTI_INTERVAL);
}

function stopTestiAuto() {
  if (testiAutoTimer) {
    clearInterval(testiAutoTimer);
    testiAutoTimer = null;
  }
}

if (testiNext) {
  testiNext.addEventListener("click", () => {
    slideTestiNext();
    startTestiAuto();
  });
}
if (testiPrev) {
  testiPrev.addEventListener("click", () => {
    slideTestiPrev();
    startTestiAuto();
  });
}

if (testiDots) {
  testiDots.addEventListener("click", e => {
    const dot = e.target.closest(".testi-dot");
    if (!dot || !testiViewport) return;
    const page = parseInt(dot.dataset.page, 10);
    testiViewport.scrollTo({ left: page * testiViewport.clientWidth, behavior: "smooth" });
    startTestiAuto();
  });
}

if (testiViewport) {
  testiViewport.addEventListener("scroll", () => requestAnimationFrame(updateTestiDots), { passive: true });
  testiViewport.addEventListener("mouseenter", stopTestiAuto);
  testiViewport.addEventListener("mouseleave", startTestiAuto);
  testiViewport.addEventListener("touchstart", stopTestiAuto, { passive: true });
  testiViewport.addEventListener("touchend", () => setTimeout(startTestiAuto, 2500), { passive: true });
  setTimeout(updateTestiDots, 80);
  startTestiAuto();
}
