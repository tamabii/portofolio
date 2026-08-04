  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:0.15});
  revealEls.forEach(el => io.observe(el));

  /* hero 3D tilt card */
  const tiltCard = document.getElementById('tiltCard');
  const heroVisual = document.querySelector('.hero-visual');
  heroVisual.addEventListener('mousemove', (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tiltCard.style.transform = `rotateY(${px * 16}deg) rotateX(${-py * 16}deg)`;
  });
  heroVisual.addEventListener('mouseleave', () => { tiltCard.style.transform = 'rotateY(0deg) rotateX(0deg)'; });

  /* ---------- 3D project carousel ---------- */
  const ring = document.getElementById('carouselRing');
  const stage = document.getElementById('carouselStage');
  const cards = Array.from(ring.querySelectorAll('.proj-card'));
  const dotsWrap = document.getElementById('carouselDots');
  const n = cards.length;
  const angleStep = 360 / n;
  let radius = 0;
  let rotation = 0;
  let activeIndex = 0;

  function computeRadius(){
    const cardWidth = cards[0].offsetWidth;
    radius = Math.round((cardWidth / 2) / Math.tan(Math.PI / n)) + 40;
  }
  function layout(){
    computeRadius();
    cards.forEach((card, i) => {
      const cardAngle = i * angleStep;
      card.style.transform = `translate(-50%,-50%) rotateY(${cardAngle}deg) translateZ(${radius}px)`;
    });
    render();
  }
  function render(){
    ring.style.transform = `translate(0,0) rotateY(${rotation}deg)`;
    let closest = 0, closestDiff = 999;
    cards.forEach((card, i) => {
      const cardAngle = (i * angleStep + rotation) % 360;
      const norm = ((cardAngle + 180) % 360 + 360) % 360 - 180;
      const diff = Math.abs(norm);
      if (diff < closestDiff){ closestDiff = diff; closest = i; }
      card.classList.toggle('is-front', diff < angleStep/2);
    });
    if (closest !== activeIndex){ activeIndex = closest; updateDots(); }
  }
  function buildDots(){
    dotsWrap.innerHTML = '';
    for(let i=0;i<n;i++){
      const d = document.createElement('div');
      d.className = 'dot' + (i===0 ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }
  function updateDots(){ Array.from(dotsWrap.children).forEach((d,i) => d.classList.toggle('active', i===activeIndex)); }
  function goTo(i){ rotation = -i * angleStep; render(); }
  function next(){ goTo((activeIndex + 1) % n); }
  function prev(){ goTo((activeIndex - 1 + n) % n); }

  document.getElementById('nextBtn').addEventListener('click', next);
  document.getElementById('prevBtn').addEventListener('click', prev);

  let isDragging = false;
  let startX = 0;
  let startRotation = 0;
  function pointerDown(x){ isDragging = true; startX = x; startRotation = rotation; stage.classList.add('dragging'); }
  function pointerMove(x){ if(!isDragging) return; const delta = x - startX; rotation = startRotation + delta * 0.35; render(); }
  function pointerUp(){
    if(!isDragging) return;
    isDragging = false;
    stage.classList.remove('dragging');
    const nearest = Math.round(-rotation / angleStep);
    goTo(((nearest % n) + n) % n);
  }
  stage.addEventListener('mousedown', e => pointerDown(e.clientX));
  window.addEventListener('mousemove', e => pointerMove(e.clientX));
  window.addEventListener('mouseup', pointerUp);
  stage.addEventListener('touchstart', e => pointerDown(e.touches[0].clientX), {passive:true});
  stage.addEventListener('touchmove', e => pointerMove(e.touches[0].clientX), {passive:true});
  stage.addEventListener('touchend', pointerUp);

  stage.setAttribute('tabindex','0');
  stage.addEventListener('keydown', e => { if(e.key === 'ArrowRight') next(); if(e.key === 'ArrowLeft') prev(); });

  buildDots();
  window.addEventListener('resize', layout);
  layout();
