/* Hedonistas theme JS — v0.3 (editor-safe) */

var heroBack=document.getElementById('hero-back');
var heroMid=document.getElementById('hero-mid');
var heroFore=document.getElementById('hero-fore');
var heroEl=document.getElementById('hero');
var rafPending=false;
var lastSy=0;

var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function applyParallax(){
  if(reduceMotion) return;
  var sy=lastSy;
  if(heroEl && sy > heroEl.offsetHeight * 1.4) return;
  if(heroBack) heroBack.style.transform='translate3d(-50%,'+sy*.18+'px,0)';
  if(heroMid)  heroMid.style.transform='translate3d(0,'+sy*.38+'px,0) scale('+(1-Math.min(sy/window.innerHeight,1)*.03)+')';
  if(heroFore) heroFore.style.transform='translate3d(0,'+sy*.07+'px,0)';
}

var navEl=document.getElementById('mainnav');
var lastNavHero=null, lastNavInvert=null;
var navColorSections=[];
var LIGHT_BG={'bg-cream':1,'bg-solar':1,'bg-sage':1};
function refreshNavSections(){
  navColorSections=Array.prototype.slice.call(document.querySelectorAll('[data-bg]'));
}
function updateNav(){
  var onHero=window.scrollY < window.innerHeight * 0.85;
  if(onHero!==lastNavHero){
    navEl.classList.toggle('nav-on-hero',onHero);
    navEl.classList.toggle('nav-scrolled',!onHero);
    lastNavHero=onHero;
  }
  if(onHero) return;
  var line=44, current=null;
  for(var i=0;i<navColorSections.length;i++){
    var r=navColorSections[i].getBoundingClientRect();
    if(r.top<=line && r.bottom>line) current=navColorSections[i];
  }
  var bg=current?current.dataset.bg:null;
  var invert=!!(bg && !LIGHT_BG[bg]);
  if(invert!==lastNavInvert){
    navEl.classList.toggle('nav-invert',invert);
    lastNavInvert=invert;
  }
}

function onScrollFrame(){
  rafPending=false;
  applyParallax();
  updateNav();
  updateCraftBlend();
}
window.addEventListener('scroll',function(){
  lastSy=window.scrollY;
  if(!rafPending){rafPending=true;requestAnimationFrame(onScrollFrame);}
},{passive:true});

var overlay=document.getElementById('bg-overlay');
var bgMap={
  'bg-cream':'var(--cream)','bg-ink':'var(--ink)','bg-raspberry':'var(--raspberry)',
  'bg-cactus':'var(--cactus)','bg-marine':'var(--marine)','bg-rust':'var(--rust)',
  'bg-solar':'var(--solar)','bg-smoke':'var(--smoke)','bg-copper':'var(--copper)',
  'bg-umber':'var(--umber)'
};

var panelIO=null;
function initCraftIO(){
  var stickyWord=document.getElementById('sticky-word');
  var stickyH2=stickyWord?stickyWord.querySelector('h2'):null;
  var chapter=document.getElementById('craft');
  if(!chapter) return;
  if(panelIO) panelIO.disconnect();
  panelIO=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      if(overlay){overlay.style.transition='background .55s ease';overlay.style.background=bgMap[e.target.dataset.bg||'bg-cream']||'var(--cream)';}
      if(stickyH2) stickyH2.textContent=e.target.dataset.word||'';
      if(stickyWord) stickyWord.classList.add('active');
    });
  },{threshold:0,rootMargin:'-48% 0px -48% 0px'});
  chapter.querySelectorAll('.s-panel').forEach(function(p){panelIO.observe(p)})
  new IntersectionObserver(function(entries){
    if(!entries[0].isIntersecting){
      if(overlay){overlay.style.transition='none';overlay.style.background='var(--cream)';}
      if(stickyWord) stickyWord.classList.remove('active');
    }
  },{threshold:0}).observe(chapter);
}

var craftEl=null;
var CREAM=[243,230,209], MARINE=[9,98,122], craftBlendActive=false, lastCraftRgb='';
function lerp(a,b,t){return Math.round(a+(b-a)*t);}
function updateCraftBlend(){
  craftEl=craftEl||document.getElementById('craft');
  if(!craftEl||!overlay) return;
  var r=craftEl.getBoundingClientRect().top, vh=window.innerHeight;
  if(r > -vh*0.4){
    var p=(vh*0.6 - r)/(vh*0.45); p=p<0?0:(p>1?1:p);
    var rgb='rgb('+lerp(CREAM[0],MARINE[0],p)+','+lerp(CREAM[1],MARINE[1],p)+','+lerp(CREAM[2],MARINE[2],p)+')';
    if(rgb!==lastCraftRgb){
      overlay.style.transition='none';
      overlay.style.background=rgb;
      lastCraftRgb=rgb;
    }
    craftBlendActive=true;
  } else if(craftBlendActive){
    craftBlendActive=false; lastCraftRgb='';
  }
}

function initMagButtons(root){
  root=root||document;
  root.querySelectorAll('.mag-btn').forEach(function(btn){
    btn.addEventListener('mousemove',function(e){
      var r=btn.getBoundingClientRect();
      btn.style.transform='translate('+(e.clientX-r.left-r.width/2)*.25+'px,'+(e.clientY-r.top-r.height/2)*.25+'px)';
    });
    btn.addEventListener('mouseleave',function(){btn.style.transform='';});
  });
}

var revealIO=null;
function initReveal(root){
  if(!revealIO){
    revealIO=new IntersectionObserver(function(entries){
      entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on');revealIO.unobserve(e.target);}});
    },{threshold:.08});
  }
  (root||document).querySelectorAll('.reveal,.reveal-section').forEach(function(el){
    if(!el.classList.contains('on')) revealIO.observe(el);
  });
}

function initSplitText(root){
  (root||document).querySelectorAll('.split').forEach(function(el){
    if(el.dataset.split) return;
    el.dataset.split='1';
    var chars=el.textContent.split('');
    el.innerHTML='';
    chars.forEach(function(ch,i){
      var s=document.createElement('span');
      s.className='split-char';
      s.textContent=ch===' '?' ':ch;
      s.style.transitionDelay=(i*.07+.25)+'s';
      el.appendChild(s);
    });
    setTimeout(function(){el.querySelectorAll('.split-char').forEach(function(s){s.classList.add('on')})},150);
  });
}

function initBottles(root){
  root=root||document;
  var items=root.querySelectorAll('.ce-item');
  var panels=root.querySelectorAll('.ce-panel');
  if(!items.length) return;

  items.forEach(function(item){
    item.addEventListener('click',function(){
      var idx=+item.dataset.e;
      items.forEach(function(i){i.classList.remove('active')});
      panels.forEach(function(p){p.classList.remove('active')});
      item.classList.add('active');
      if(panels[idx]) panels[idx].classList.add('active');
    });
  });

  panels.forEach(function(panel){
    var thumbs=panel.querySelectorAll('.ce-shot-thumb');
    thumbs.forEach(function(thumb){
      thumb.addEventListener('click',function(){
        thumbs.forEach(function(t){t.classList.remove('active')});
        thumb.classList.add('active');
      });
    });
  });

  panels.forEach(function(panel){
    var tabs=panel.querySelectorAll('.ce-tab');
    var tabPanels=panel.querySelectorAll('.ce-tab-panel');
    tabs.forEach(function(tab){
      tab.addEventListener('click',function(){
        var key=tab.dataset.tab;
        tabs.forEach(function(t){t.classList.remove('active')});
        tabPanels.forEach(function(tp){tp.classList.toggle('active',tp.dataset.tab===key)});
        tab.classList.add('active');
      });
    });
  });
}

function initDragScroll(el){
  if(!el||el.dataset.drag) return;
  el.dataset.drag='1';
  var down=false,sx,sl;
  el.addEventListener('mousedown',function(e){down=true;sx=e.pageX-el.offsetLeft;sl=el.scrollLeft;el.classList.add('dragging')});
  el.addEventListener('mouseleave',function(){down=false;el.classList.remove('dragging')});
  el.addEventListener('mouseup',function(){down=false;el.classList.remove('dragging')});
  el.addEventListener('mousemove',function(e){if(!down)return;e.preventDefault();el.scrollLeft=sl-(e.pageX-el.offsetLeft-sx)*1.35});
}

function initIgTrack(root){
  root=root||document;
  var t=root.querySelector('#igtrack')||root.id==='igtrack'&&root;
  if(!t) return;
  var outer=t.closest('.ig-track-outer');
  initDragScroll(t);
  t.addEventListener('scroll',function(){
    if(outer) outer.classList.toggle('ig-scrolled',t.scrollLeft>4);
  },{passive:true});
}

function initCocktails(root){
  root=root||document;
  var track=root.querySelector('#cktrack');
  if(!track) return;
  initDragScroll(track);

  function shuffle(arr){
    for(var i=arr.length-1;i>0;i--){
      var j=Math.floor(Math.random()*(i+1));
      var t=arr[i];arr[i]=arr[j];arr[j]=t;
    }
    return arr;
  }
  function applyFilter(f){
    var cards=Array.prototype.slice.call(track.querySelectorAll('.ck-card'));
    shuffle(cards);
    cards.forEach(function(c){track.appendChild(c)});
    var visible=0;
    cards.forEach(function(card){
      var show=(f==='all')||card.dataset.cat.split(' ').indexOf(f)>-1;
      card.classList.toggle('hidden',!show);
      if(show) visible++;
    });
    var counter=document.getElementById('ck-visible-count');
    if(counter) counter.textContent=visible;
    track.scrollLeft=0;
  }

  applyFilter('all');

  root.querySelectorAll('.ck-filter').forEach(function(btn){
    btn.addEventListener('click',function(){
      root.querySelectorAll('.ck-filter').forEach(function(b){b.classList.remove('active')});
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });
}

function initAwards(root){
  root=root||document;
  var track=root.querySelector('#awtrack');
  if(!track) return;
  initDragScroll(track);

  root.querySelectorAll('.aw-filter').forEach(function(btn){
    btn.addEventListener('click',function(){
      root.querySelectorAll('.aw-filter').forEach(function(b){b.classList.remove('active')});
      btn.classList.add('active');
      var f=btn.dataset.filter,visible=0;
      root.querySelectorAll('.aw').forEach(function(card){
        var show=(f==='all')||card.dataset.expr===f;
        card.classList.toggle('hidden',!show);
        if(show) visible++;
      });
      if(track) track.scrollLeft=0;
    });
  });
}

function initFooterParallax(){
  var wm=document.getElementById('f-watermark');
  var ft=document.querySelector('footer');
  var logo=document.querySelector('.f-center-logo');
  if(!wm||!ft||!logo) return;
  var DRIFT=160;
  var ticking=false;
  function updateWatermark(){
    var fr=ft.getBoundingClientRect();
    var vh=window.innerHeight;
    var logoCenter=logo.offsetTop+logo.offsetHeight/2;
    wm.style.top=logoCenter+'px';
    if(fr.bottom<0||fr.top>vh*1.5){ticking=false;return;}
    var t=(vh-fr.top)/fr.height;
    t=Math.max(0,Math.min(1,t));
    wm.style.transform='translate(-50%, calc(-50% + '+(1-t)*DRIFT+'px))';
    ticking=false;
  }
  window.addEventListener('scroll',function(){
    if(!ticking){requestAnimationFrame(updateWatermark);ticking=true;}
  },{passive:true});
  window.addEventListener('resize',updateWatermark,{passive:true});
  updateWatermark();
}

function initWatermarkFit(){
  var marks=[document.getElementById('hero-back'),document.getElementById('f-watermark')].filter(Boolean);
  if(!marks.length) return;
  var RATIO=1.05;
  function fit(){
    var w=window.innerWidth;
    marks.forEach(function(el){
      el.style.fontSize='100px';
      var rendered=el.getBoundingClientRect().width;
      if(!rendered) return;
      el.style.fontSize=(100*(w*RATIO)/rendered)+'px';
    });
  }
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(fit); }
  window.addEventListener('resize',fit,{passive:true});
  window.addEventListener('load',fit);
  fit();
}

function initHamburger(){
  var btn=document.getElementById('nav-hamburger');
  var drawer=document.getElementById('nav-drawer');
  if(!btn||!drawer||btn.dataset.ham) return;
  btn.dataset.ham='1';
  var links=Array.prototype.slice.call(drawer.querySelectorAll('a'));
  function toggle(open){
    btn.classList.toggle('open',open);
    drawer.classList.toggle('open',open);
    document.body.classList.toggle('nav-open',open);
    btn.setAttribute('aria-expanded',open);
    btn.setAttribute('aria-label',open?'Close menu':'Open menu');
    drawer.setAttribute('aria-hidden',!open);
    if(open){if(links[0]) links[0].focus();}
    else{btn.focus();}
  }
  document.addEventListener('click',function(e){
    if(btn.classList.contains('open')&&!btn.contains(e.target)&&!drawer.contains(e.target)) toggle(false);
  });
  btn.addEventListener('click',function(){toggle(!btn.classList.contains('open'))});
  links.forEach(function(a){a.addEventListener('click',function(){toggle(false)})});
  document.addEventListener('keydown',function(e){
    if(!btn.classList.contains('open')) return;
    if(e.key==='Escape'){toggle(false);return;}
    if(e.key==='Tab'){
      var focusable=[btn].concat(links);
      var first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
}

function initMapScroll(root){
  root=root||document;
  var mapContainer=root.querySelector('#findus-map');
  if(!mapContainer||mapContainer.dataset.ms) return;
  mapContainer.dataset.ms='1';

  // Track mouse X so we can distinguish map area (right ~60%) from results panel (left ~40%)
  var mouseX=0;
  mapContainer.addEventListener('mousemove',function(e){mouseX=e.clientX;},{passive:true});

  mapContainer.addEventListener('wheel',function(e){
    var rect=mapContainer.getBoundingClientRect();
    var inMapArea=(mouseX-rect.left)>rect.width*0.38;
    if(inMapArea&&!e.ctrlKey&&!e.metaKey){
      e.stopPropagation();
      e.preventDefault();
      window.scrollBy({top:e.deltaY,behavior:'auto'});
    }
  },{passive:false,capture:true});

  // Inject hint directly — no shadow-DOM traversal needed
  var hint=document.createElement('div');
  hint.className='map-scroll-hint';
  hint.setAttribute('aria-hidden','true');
  hint.textContent='⌘ / Ctrl + scroll to zoom';
  if(getComputedStyle(mapContainer).position==='static') mapContainer.style.position='relative';
  mapContainer.appendChild(hint);
}

var SECTION_INITS={
  'hero':     function(el){ initSplitText(el); initReveal(el); initMagButtons(el); initWatermarkFit(); },
  'bottles':  function(el){ initBottles(el);   initReveal(el); initMagButtons(el); },
  'craft':    function(el){ initCraftIO();      initReveal(el); craftEl=null; },
  'story':    function(el){ initReveal(el); },
  'maestro':  function(el){ initReveal(el); },
  'awards':   function(el){ initAwards(el);    initReveal(el); initMagButtons(el); },
  'cocktails':function(el){ initCocktails(el); initReveal(el); initMagButtons(el); },
  'manifesto':function(el){ initReveal(el); },
  'findus':   function(el){ initMapScroll(el); },
  'social':   function(el){ initIgTrack(el);   initReveal(el); }
};

function initAll(){
  refreshNavSections();
  Object.keys(SECTION_INITS).forEach(function(type){
    SECTION_INITS[type](document);
  });
  initFooterParallax();
  initHamburger();
  updateNav();
  updateCraftBlend();
  window.dispatchEvent(new Event('scroll'));
}

document.addEventListener('DOMContentLoaded', initAll);

document.addEventListener('shopify:section:load', function(e){
  var el=e.target;
  var type=el.dataset.sectionType||el.getAttribute('data-section-type');
  refreshNavSections();
  if(type && SECTION_INITS[type]){
    SECTION_INITS[type](el);
  } else {
    initReveal(el);
    initMagButtons(el);
  }
  initWatermarkFit();
  updateNav();
});

document.addEventListener('shopify:section:reorder', function(){
  refreshNavSections();
  updateNav();
});

document.addEventListener('shopify:section:select', function(e){
  var el=e.target;
  if(!el) return;
  el.querySelectorAll('.reveal,.reveal-section').forEach(function(r){r.classList.add('on')});
});

document.addEventListener('shopify:section:deselect', function(){
  /* nothing — revealed items stay revealed */
});

document.addEventListener('shopify:block:select', function(e){
  var block=e.target;
  if(!block) return;
  var item=block.closest('.ce-item');
  if(item){
    var idx=+item.dataset.e;
    var section=item.closest('.bottles-section');
    if(section){
      section.querySelectorAll('.ce-item').forEach(function(i){i.classList.remove('active')});
      section.querySelectorAll('.ce-panel').forEach(function(p){p.classList.remove('active')});
      item.classList.add('active');
      var panels=section.querySelectorAll('.ce-panel');
      if(panels[idx]) panels[idx].classList.add('active');
    }
  }
  block.scrollIntoView({behavior:'smooth',block:'nearest'});
});
