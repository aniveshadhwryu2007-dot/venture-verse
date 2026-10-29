/* Past speakers and guests: duplicated sets create a seamless rightward marquee. */
const pastSpeakers = [
  { name: 'CA Mayserah Mazhar', role: 'Chartered Accountant & Financial Strategist', image: 'assets/speakers/mayserah_mazhar.jpg', alt: 'CA Mayserah Mazhar' },
  { name: 'Gaurav Sharma', role: 'Distinguished Speaker / Guest', image: 'assets/speakers/gaurav_sharma.jpg', alt: 'Gaurav Sharma speaking at a podium' },
  { name: 'Aviraj Ashok Jain', role: 'Industry Innovator & Entrepreneur', image: 'assets/speakers/aviral_ashok_jain.jpg', alt: 'Aviraj Ashok Jain at Venture Verse' },
  { name: 'Mrs. Deepti Sharma', role: 'Academic Leader & Guest of Honour', image: 'assets/speakers/deepti_sharma.jpg', alt: 'Mrs. Deepti Sharma attending the event' }
];

const speakerGrid = document.getElementById('pastSpeakersGrid');
if (speakerGrid) {
  const track = document.createElement('div');
  track.className = 'past-speakers-track';

  function createSpeakerSet(isDuplicate = false) {
    const set = document.createElement('div');
    set.className = 'past-speakers-set';
    if (isDuplicate) set.setAttribute('aria-hidden', 'true');
    pastSpeakers.forEach(speaker => {
      const card = document.createElement('article');
      card.className = 'past-speaker-card';
      const photo = document.createElement('img');
      photo.className = 'past-speaker-photo';
      photo.src = speaker.image;
      photo.alt = isDuplicate ? '' : speaker.alt;
      photo.loading = 'lazy';
      photo.decoding = 'async';
      const overlay = document.createElement('div');
      overlay.className = 'past-speaker-overlay';
      const name = document.createElement('h4');
      name.className = 'past-speaker-name';
      name.textContent = speaker.name;
      const role = document.createElement('p');
      role.className = 'past-speaker-role';
      role.textContent = speaker.role;
      overlay.append(name, role);
      card.append(photo, overlay);
      set.appendChild(card);
    });
    return set;
  }

  track.append(createSpeakerSet(), createSpeakerSet(true));
  speakerGrid.appendChild(track);
}

/* Coordinator profiles: faculty coordinators followed by the four student organizers. */
const coordinators = {
  faculty: [
    {
      name: 'Prof. Rakesh Jaiswal',
      role: 'Faculty Coordinator, Department of CSBS & CSE',
      image: 'assets/coordinators/rakesh_jaiswal.jpg',
      phone: '+918989490248',
      email: 'rakeshjaiswal@oriental.ac.in'
    },
    {
      name: 'Princy Shrivastava',
      role: 'Faculty Coordinator',
      image: 'assets/coordinators/princy_shrivastava.jpeg',
      phone: '+919340546664',
      email: ''
    }
  ],
  students: [
    { name: 'Swastik Pandey', role: 'Student Coordinator', image: 'assets/coordinators/swastik_pandey.jpg', phone: '+919301732087', email: 'swastikpandey2901@gmail.com' },
    { name: 'Adarsh Raghuwanshi', role: 'Student Coordinator', image: 'assets/coordinators/adarsh_raghuwanshi.jpg', phone: '+916260668775', email: 'adarshraghuwanshi10e@gmail.com' },
    { name: 'Shreya Langhiya', role: 'Student Coordinator', image: 'assets/coordinators/shreya_langhiya.jpg', phone: '+918305151339', email: 'shreyalanghiya@gmail.com' },
    { name: 'Aadi Jain', role: 'Student Coordinator', image: 'assets/coordinators/aadi_jain.jpg', phone: '+917879577144', email: 'aadijain1711@gmail.com' }
  ]
};

const coordinatorPhoneIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>';
const coordinatorEmailIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';

/* Keep the teaser muted for autoplay and let visitors opt into audio. */
const ventureTeaser = document.getElementById('ventureTeaser');
const videoSoundToggle = document.getElementById('videoSoundToggle');

if (ventureTeaser && videoSoundToggle) {
  ventureTeaser.muted = true;
  videoSoundToggle.addEventListener('click', () => {
    ventureTeaser.muted = !ventureTeaser.muted;
    const soundEnabled = !ventureTeaser.muted;
    videoSoundToggle.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Muted';
    videoSoundToggle.setAttribute('aria-pressed', String(soundEnabled));
    videoSoundToggle.setAttribute('aria-label', soundEnabled ? 'Mute video' : 'Turn video sound on');

    if (ventureTeaser.paused) {
      ventureTeaser.play().catch(() => {});
    }
  });
}

/* Cinematic reveal is intentionally scoped to the five primary section headings. */
const cinematicHeadings = document.querySelectorAll('.cinematic-pop-heading');
if ('IntersectionObserver' in window && cinematicHeadings.length) {
  const headingObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('heading-in-view');
      headingObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3, rootMargin: '0px 0px -30px 0px' });

  cinematicHeadings.forEach(heading => headingObserver.observe(heading));
} else {
  cinematicHeadings.forEach(heading => heading.classList.add('heading-in-view'));
}

/* Replay a springy pop each time the roadmap title comes back into view. */
const roadmapTitle = document.querySelector('#roadmap .rm-head h2');
if (roadmapTitle) {
  if ('IntersectionObserver' in window) {
    const roadmapTitleObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.5 });
    roadmapTitleObserver.observe(roadmapTitle);
  } else {
    roadmapTitle.classList.add('is-visible');
  }
}

/* Hero nebula, embers, and edge constellation mesh. */
const hero = document.querySelector('.hero');
const motionCanvas = document.getElementById('hero-motion-canvas');
const motionContext = motionCanvas?.getContext('2d', { alpha: true });

if (hero && motionCanvas && motionContext) {
  const reduceHeroMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const heroMotionState = {
    width: 0,
    height: 0,
    dpr: 1,
    time: 0,
    lastFrame: 0,
    frameId: 0,
    visible: true,
    pointerX: 0,
    pointerY: 0,
    tiltX: 0,
    tiltY: 0,
    embers: [],
    nodes: []
  };

  const randomBetween = (min, max) => min + Math.random() * (max - min);

  function resetEmber(ember, startAtBottom = false) {
    ember.x = randomBetween(0.04, 0.96) * heroMotionState.width;
    ember.y = startAtBottom ? heroMotionState.height + randomBetween(0, heroMotionState.height * 0.2) : randomBetween(0, heroMotionState.height);
    ember.radius = randomBetween(0.7, 2.1);
    ember.speed = randomBetween(8, 24);
    ember.opacity = randomBetween(0.2, 0.72);
    ember.phase = randomBetween(0, Math.PI * 2);
    ember.wobble = randomBetween(4, 16);
    ember.frequency = randomBetween(0.35, 1.05);
  }

  function resizeHeroCanvas() {
    const rect = hero.getBoundingClientRect();
    heroMotionState.width = Math.max(1, rect.width);
    heroMotionState.height = Math.max(1, rect.height);
    heroMotionState.dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    motionCanvas.width = Math.round(heroMotionState.width * heroMotionState.dpr);
    motionCanvas.height = Math.round(heroMotionState.height * heroMotionState.dpr);
    motionContext.setTransform(heroMotionState.dpr, 0, 0, heroMotionState.dpr, 0, 0);

    heroMotionState.embers = Array.from({ length: 42 }, () => {
      const ember = {};
      resetEmber(ember);
      return ember;
    });

    const nodeCount = heroMotionState.width < 640 ? 20 : 32;
    heroMotionState.nodes = Array.from({ length: nodeCount }, (_, index) => {
      const leftSide = index < nodeCount / 2;
      const node = {
        leftSide,
        x: leftSide ? randomBetween(0.015, 0.22) * heroMotionState.width : randomBetween(0.78, 0.985) * heroMotionState.width,
        y: randomBetween(0, heroMotionState.height),
        vx: randomBetween(-3, 3),
        vy: randomBetween(-4, 4),
        radius: randomBetween(0.65, 1.5),
        phase: randomBetween(0, Math.PI * 2)
      };
      return node;
    });
  }

  function drawHeroFrame(deltaSeconds) {
    const { width, height, time, nodes, embers } = heroMotionState;
    const ctx = motionContext;
    ctx.clearRect(0, 0, width, height);

    const breathing = 1 + Math.sin(time * (Math.PI * 2 / 7)) * 0.065;
    const glowRadius = Math.min(width, height) * 0.48 * breathing;
    const warmGlow = ctx.createRadialGradient(width * 0.5, height * 0.48, 0, width * 0.5, height * 0.48, glowRadius);
    warmGlow.addColorStop(0, 'rgba(212, 175, 55, 0.13)');
    warmGlow.addColorStop(0.34, 'rgba(169, 117, 40, 0.055)');
    warmGlow.addColorStop(1, 'rgba(212, 175, 55, 0)');
    ctx.fillStyle = warmGlow;
    ctx.fillRect(0, 0, width, height);

    const coolGlow = ctx.createRadialGradient(width * 0.68, height * 0.36, 0, width * 0.68, height * 0.36, Math.max(width, height) * 0.52);
    coolGlow.addColorStop(0, 'rgba(24, 76, 120, 0.13)');
    coolGlow.addColorStop(1, 'rgba(24, 76, 120, 0)');
    ctx.fillStyle = coolGlow;
    ctx.fillRect(0, 0, width, height);

    heroMotionState.tiltX += (heroMotionState.pointerX - heroMotionState.tiltX) * Math.min(1, deltaSeconds * 1.8);
    heroMotionState.tiltY += (heroMotionState.pointerY - heroMotionState.tiltY) * Math.min(1, deltaSeconds * 1.8);

    const parallaxX = heroMotionState.tiltX * 11;
    const parallaxY = heroMotionState.tiltY * 8;
    nodes.forEach(node => {
      node.x += node.vx * deltaSeconds;
      node.y += node.vy * deltaSeconds;
      const minX = node.leftSide ? width * 0.01 : width * 0.77;
      const maxX = node.leftSide ? width * 0.23 : width * 0.99;
      if (node.x < minX || node.x > maxX) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;
    });

    ctx.lineWidth = 0.65;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        if (a.leftSide !== b.leftSide) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);
        if (distance > Math.min(132, width * 0.13)) continue;
        const alpha = (1 - distance / 132) * 0.15;
        ctx.strokeStyle = `rgba(100, 180, 240, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x + parallaxX * (a.leftSide ? -1 : 1), a.y + parallaxY);
        ctx.lineTo(b.x + parallaxX * (b.leftSide ? -1 : 1), b.y + parallaxY);
        ctx.stroke();
      }
    }

    nodes.forEach(node => {
      const x = node.x + parallaxX * (node.leftSide ? -1 : 1);
      const y = node.y + parallaxY;
      ctx.fillStyle = 'rgba(142, 205, 247, 0.42)';
      ctx.beginPath();
      ctx.arc(x, y, node.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    embers.forEach(ember => {
      if (deltaSeconds > 0) {
        ember.y -= ember.speed * deltaSeconds;
        if (ember.y < -8) resetEmber(ember, true);
      }
      const fade = Math.min(1, Math.max(0, ember.y / (height * 0.34)));
      const x = ember.x + Math.sin(time * ember.frequency + ember.phase) * ember.wobble;
      const alpha = ember.opacity * fade;
      if (alpha <= 0.005) return;

      const emberGlow = ctx.createRadialGradient(x, ember.y, 0, x, ember.y, ember.radius * 5);
      emberGlow.addColorStop(0, `rgba(255, 225, 145, ${alpha})`);
      emberGlow.addColorStop(0.32, `rgba(212, 175, 55, ${alpha * 0.48})`);
      emberGlow.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = emberGlow;
      ctx.beginPath();
      ctx.arc(x, ember.y, ember.radius * 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function animateHeroCanvas(timestamp) {
    if (!heroMotionState.visible || document.hidden || reduceHeroMotion.matches) {
      heroMotionState.frameId = 0;
      return;
    }
    const deltaSeconds = heroMotionState.lastFrame ? Math.min((timestamp - heroMotionState.lastFrame) / 1000, 0.05) : 0;
    heroMotionState.lastFrame = timestamp;
    heroMotionState.time += deltaSeconds;
    drawHeroFrame(deltaSeconds);
    heroMotionState.frameId = window.requestAnimationFrame(animateHeroCanvas);
  }

  function startHeroCanvas() {
    if (reduceHeroMotion.matches) {
      drawHeroFrame(0);
      return;
    }
    if (heroMotionState.visible && !document.hidden && !heroMotionState.frameId) {
      heroMotionState.lastFrame = 0;
      heroMotionState.frameId = window.requestAnimationFrame(animateHeroCanvas);
    }
  }

  function stopHeroCanvas() {
    if (heroMotionState.frameId) window.cancelAnimationFrame(heroMotionState.frameId);
    heroMotionState.frameId = 0;
    heroMotionState.lastFrame = 0;
  }

  resizeHeroCanvas();
  drawHeroFrame(0);
  window.addEventListener('resize', resizeHeroCanvas, { passive: true });
  window.addEventListener('pointermove', event => {
    const bounds = hero.getBoundingClientRect();
    if (event.clientY < bounds.top || event.clientY > bounds.bottom) return;
    heroMotionState.pointerX = ((event.clientX / Math.max(1, window.innerWidth)) - 0.5) * 2;
    heroMotionState.pointerY = ((event.clientY / Math.max(1, window.innerHeight)) - 0.5) * 2;
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    const heroVisibility = new IntersectionObserver(entries => {
      heroMotionState.visible = Boolean(entries[0]?.isIntersecting);
      if (heroMotionState.visible) startHeroCanvas();
      else stopHeroCanvas();
    });
    heroVisibility.observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopHeroCanvas();
    else startHeroCanvas();
  });

  reduceHeroMotion.addEventListener?.('change', () => {
    stopHeroCanvas();
    if (reduceHeroMotion.matches) drawHeroFrame(0);
    else startHeroCanvas();
  });
  startHeroCanvas();
}

/* Contact page: coordinator directory, category tabs, and page progress. */
const contactPage = document.body.classList.contains('contact-page');
if (contactPage) {
  const contactWhatsAppIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.6A8.5 8.5 0 1 1 20.5 11.5Z"/><path d="M8.5 8.3c.4 2.7 2.5 4.8 5.2 5.2l1.2-1.2 2 .9c.2.1.3.3.2.5-.2.8-.9 1.4-1.8 1.4-3.8-.2-7.1-3.5-7.3-7.3 0-.9.6-1.6 1.4-1.8.2-.1.4 0 .5.2l.9 2-1.3 1.1Z"/></svg>';
  const contactLinkedInIcon = '<span class="linkedin-mark" aria-hidden="true">in</span>';

  function createContactProfile(person) {
    const card = document.createElement('article');
    card.className = 'contact-profile-card';

    const photoFrame = document.createElement('div');
    photoFrame.className = 'contact-profile-photo-wrap';
    const photo = document.createElement('img');
    photo.className = 'contact-profile-photo';
    photo.src = person.image;
    photo.alt = `${person.name} portrait`;
    photo.loading = 'lazy';
    photo.decoding = 'async';
    photoFrame.appendChild(photo);

    const name = document.createElement('h3');
    name.className = 'contact-profile-name';
    name.textContent = person.name;

    const role = document.createElement('p');
    role.className = 'contact-profile-role';
    role.textContent = person.role;

    const phoneText = document.createElement('a');
    phoneText.className = 'contact-profile-phone';
    phoneText.href = `tel:${person.phone}`;
    phoneText.textContent = person.phone;
    phoneText.setAttribute('aria-label', `Call ${person.name} at ${person.phone}`);

    const actions = document.createElement('div');
    actions.className = 'contact-profile-actions';
    const call = document.createElement('a');
    call.className = 'contact-action';
    call.href = `tel:${person.phone}`;
    call.setAttribute('aria-label', `Call ${person.name}`);
    call.title = 'Call';
    call.innerHTML = coordinatorPhoneIcon;
    const mail = document.createElement('a');
    mail.className = 'contact-action';
    mail.href = `mailto:${person.email}`;
    mail.setAttribute('aria-label', `Email ${person.name}`);
    mail.title = 'Email';
    mail.innerHTML = coordinatorEmailIcon;
    const whatsapp = document.createElement('span');
    whatsapp.className = 'contact-social-placeholder';
    whatsapp.setAttribute('role', 'img');
    whatsapp.setAttribute('aria-label', 'WhatsApp contact link coming soon');
    whatsapp.title = 'WhatsApp link coming soon';
    whatsapp.innerHTML = contactWhatsAppIcon;
    const linkedIn = document.createElement('span');
    linkedIn.className = 'contact-social-placeholder linkedin-mark';
    linkedIn.setAttribute('role', 'img');
    linkedIn.setAttribute('aria-label', 'LinkedIn profile link coming soon');
    linkedIn.title = 'LinkedIn link coming soon';
    linkedIn.innerHTML = contactLinkedInIcon;
    actions.append(call);
    if (person.email) actions.append(mail);
    actions.append(whatsapp, linkedIn);

    card.append(photoFrame, name, role, phoneText, actions);
    return card;
  }

  const facultyProfiles = document.getElementById('facultyProfiles');
  const studentProfiles = document.getElementById('studentProfiles');
  if (facultyProfiles && studentProfiles) {
    coordinators.faculty.forEach(person => facultyProfiles.appendChild(createContactProfile(person)));
    coordinators.students.forEach(person => studentProfiles.appendChild(createContactProfile(person)));
  }

  const tabs = Array.from(document.querySelectorAll('[data-contact-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-contact-panel]'));
  function activateContactTab(tab, moveFocus = false) {
    const selected = tab.dataset.contactTab;
    tabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => {
      const active = panel.dataset.contactPanel === selected;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    if (moveFocus) tab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateContactTab(tab));
    tab.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const next = tabs[(index + direction + tabs.length) % tabs.length];
      activateContactTab(next, true);
    });
  });

  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const mobileNavClose = document.getElementById('mobileNavClose');
  if (navbar && hamburger && navLinks) {
    const closeMenu = () => {
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open navigation');
      navLinks.classList.remove('open');
      document.body.classList.remove('mobile-nav-open');
    };
    hamburger.addEventListener('click', () => {
      const open = !navLinks.classList.contains('open');
      hamburger.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      navLinks.classList.toggle('open', open);
      document.body.classList.toggle('mobile-nav-open', open);
      if (open) mobileNavClose?.focus();
    });
    mobileNavClose?.addEventListener('click', closeMenu);
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMenu();
        hamburger.focus();
      }
    });
    const syncNavbar = () => navbar.classList.toggle('scrolled', window.scrollY > 24);
    syncNavbar();
    window.addEventListener('scroll', syncNavbar, { passive: true });
  }

  const progress = document.getElementById('contactScrollProgress');
  const updateContactProgress = () => {
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 100;
    progress.style.height = `${percent}%`;
  };
  updateContactProgress();
  window.addEventListener('scroll', updateContactProgress, { passive: true });
  window.addEventListener('resize', updateContactProgress, { passive: true });
}

/* Sync the React split-flap board with the vanilla roadmap rocket progress. */
const roadmapStage = document.getElementById('rmStage');
if (roadmapStage) {
  const roadmapRocket = document.getElementById('rmRocket');
  const burstCanvas = document.getElementById('burstCanvas');
  const burstContext = burstCanvas?.getContext('2d');
  let rocketLanded = Number(roadmapStage.dataset.rocketProgress || 0) > 0.92;
  let landingTimer = 0;
  let burstFrame = 0;
  let burstParticles = [];
  window.roadmapRocketLanded = rocketLanded;

  function resizeBurstCanvas() {
    if (!burstCanvas || !burstContext) return;
    const bounds = roadmapStage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    burstCanvas.width = Math.max(1, Math.round(bounds.width * dpr));
    burstCanvas.height = Math.max(1, Math.round(bounds.height * dpr));
    burstContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function animateBurst() {
    if (!burstCanvas || !burstContext) return;
    const ctx = burstContext;
    const width = burstCanvas.clientWidth;
    const height = burstCanvas.clientHeight;
    ctx.clearRect(0, 0, width, height);
    burstParticles = burstParticles.filter(particle => particle.life > 0);
    burstParticles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.045;
      particle.vx *= 0.985;
      particle.life -= 1;
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    if (burstParticles.length) burstFrame = window.requestAnimationFrame(animateBurst);
    else {
      ctx.clearRect(0, 0, width, height);
      burstFrame = 0;
    }
  }

  function burstAtRocketTip() {
    if (!roadmapRocket || !burstCanvas || !burstContext) return;
    resizeBurstCanvas();
    const canvasBounds = burstCanvas.getBoundingClientRect();
    const rocketBounds = roadmapRocket.getBoundingClientRect();
    const angle = (parseFloat(roadmapRocket.style.getPropertyValue('--rocket-angle')) || 0) * Math.PI / 180;
    const centerX = rocketBounds.left + rocketBounds.width / 2 - canvasBounds.left;
    const centerY = rocketBounds.top + rocketBounds.height / 2 - canvasBounds.top;
    const x = centerX + Math.sin(angle) * 27;
    const y = centerY - Math.cos(angle) * 27;
    const colors = ['#fff3bf', '#f2c14e', '#ffd76a', '#d99a24'];
    burstParticles = Array.from({ length: 34 }, () => {
      const direction = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 4.2;
      const life = 24 + Math.random() * 22;
      return {
        x, y,
        vx: Math.cos(direction) * speed,
        vy: Math.sin(direction) * speed,
        life,
        maxLife: life,
        size: 1 + Math.random() * 2.4,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    });
    if (burstFrame) window.cancelAnimationFrame(burstFrame);
    burstFrame = window.requestAnimationFrame(animateBurst);
  }

  function setRocketOpacity(opacity) {
    if (window.gsap) window.gsap.set('.timeline-rocket', { opacity });
    else if (roadmapRocket) roadmapRocket.style.opacity = String(opacity);
  }

  resizeBurstCanvas();
  window.addEventListener('resize', resizeBurstCanvas, { passive: true });

  document.addEventListener('roadmapprogress', event => {
    const progress = Number(event.detail?.progress ?? roadmapStage.dataset.rocketProgress ?? 0);
    if (progress >= 0.935 && !rocketLanded) {
      rocketLanded = true;
      window.roadmapRocketLanded = true;
      window.clearTimeout(landingTimer);
      setRocketOpacity(0);
      burstAtRocketTip();
      landingTimer = window.setTimeout(() => {
        if (rocketLanded) window.dispatchEvent(new CustomEvent('rocketLanded'));
      }, 200);
    } else if (progress < 0.90 && rocketLanded) {
      rocketLanded = false;
      window.roadmapRocketLanded = false;
      window.clearTimeout(landingTimer);
      setRocketOpacity(1);
      window.dispatchEvent(new CustomEvent('rocketReset'));
    }
  });
}

/* Pin the roadmap while the rocket and SVG trail follow one scroll-scrubbed timeline. */
const roadmapSection = document.getElementById('roadmap');
if (roadmapSection && window.gsap && window.ScrollTrigger && typeof window.setRoadmapProgress === 'function') {
  window.gsap.registerPlugin(window.ScrollTrigger);
  const roadmapProgress = { value: Number(roadmapStage?.dataset.rocketProgress || 0) };
  const rocketTimeline = window.gsap.timeline({ paused: true });
  rocketTimeline.fromTo(roadmapProgress, { value: 0 }, {
    value: 0.94,
    duration: 1,
    ease: 'none',
    onUpdate: () => window.setRoadmapProgress(roadmapProgress.value)
  });

  window.ScrollTrigger.create({
    trigger: '#roadmap',
    start: 'top top',
    end: '+=2200',
    pin: true,
    scrub: 0.8,
    anticipatePin: 1,
    animation: rocketTimeline,
    invalidateOnRefresh: true,
    fastScrollEnd: true,
    preventOverlaps: true
  });

  window.addEventListener('roadmaplayoutchange', () => window.ScrollTrigger.refresh(), { passive: true });
}

/* Scroll-linked liquid reveal for the footer wordmark; reaching page bottom fills it fully. */
const fluidFinale = document.querySelector('.fluid-brand-finale');
const fluidFillMask = fluidFinale?.querySelector('.fluid-fill-mask');
if (fluidFinale && fluidFillMask) {
  let fluidFillFrame = 0;

  const updateFluidFill = () => {
    fluidFillFrame = 0;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const maxScroll = Math.max(0, documentHeight - viewportHeight);
    const startScroll = Math.max(0, maxScroll - 900);
    const distanceToBottom = Math.max(0, maxScroll - scrollTop);
    const fillRange = maxScroll - startScroll;
    const progress = fillRange > 0
      ? Math.max(0, Math.min(1, (scrollTop - startScroll) / fillRange))
      : (distanceToBottom === 0 ? 1 : 0);
    fluidFillMask.style.height = progress === 1 ? '100%' : `${progress * 100}%`;
  };

  const scheduleFluidFill = () => {
    if (!fluidFillFrame) fluidFillFrame = window.requestAnimationFrame(updateFluidFill);
  };

  updateFluidFill();
  window.addEventListener('scroll', scheduleFluidFill, { passive: true });
  window.addEventListener('resize', scheduleFluidFill, { passive: true });
}
