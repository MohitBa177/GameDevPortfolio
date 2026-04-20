/* ============================================
   GAME DEV PORTFOLIO — ULTIMATE GAME ENGINE
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ======== GAME STATE ========
  const GameState = {
    xp: 0,
    level: 1,
    maxXP: 100,
    collectiblesFound: 0,
    totalCollectibles: 7,
    achievementsUnlocked: new Set(),
    sectionsVisited: new Set(),
    konamiProgress: 0,
    konamiActive: false,
    audioEnabled: false,
    miniGameActive: false,
    miniGameScore: 0,
    terminalOpen: false,
    totalXPEarned: 0,
  };

  const KONAMI_CODE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA

  const LEVEL_NAMES = [
    'Visitor',        // 1
    'Curious',        // 2
    'Interested',     // 3
    'Impressed',      // 4
    'Fan',            // 5
    'Super Fan',      // 6
    'Legend',         // 7
    'Game Master',    // 8
  ];

  const ACHIEVEMENTS = {
    firstVisit: { icon: '🌟', title: 'Welcome, Player!', xp: 10 },
    scrolled: { icon: '📜', title: 'Scroll Explorer', xp: 15 },
    aboutVisited: { icon: '👤', title: 'Character Inspection', xp: 20 },
    projectsViewed: { icon: '🎮', title: 'Quest Browser', xp: 20 },
    skillsViewed: { icon: '🎒', title: 'Inventory Check', xp: 15 },
    achievementsViewed: { icon: '🏆', title: 'Achievement Hunter', xp: 15 },
    contactReached: { icon: '📬', title: 'Communication Unlocked', xp: 25 },
    videoWatched: { icon: '🎥', title: 'Gameplay Reviewer', xp: 20 },
    firstCollectible: { icon: '✨', title: 'Treasure Hunter', xp: 15 },
    allCollectibles: { icon: '💎', title: 'Master Collector', xp: 50 },
    terminalOpened: { icon: '💻', title: 'Hacker Mode', xp: 30 },
    konamiCode: { icon: '🕹️', title: 'Konami Master', xp: 100 },
    miniGamePlayed: { icon: '🚀', title: 'Arcade Gamer', xp: 25 },
    miniGamePro: { icon: '👑', title: 'Arcade Champion', xp: 50 },
    messageSent: { icon: '💌', title: 'Message in a Bottle', xp: 20 },
    fullExplorer: { icon: '🗺️', title: 'Full Explorer', xp: 40 },
  };

  // ======== LOADING SCREEN ========
  const loader = document.querySelector('.loader');
  const tips = [
    'Press ` (backtick) to open the terminal...',
    'Try the Konami Code: ↑↑↓↓←→←→BA',
    'Collect all the orbs hidden on the page!',
    'Click "Play Game" to try the mini-game!',
    'Hover over inventory items for details...',
  ];
  const tipEl = document.querySelector('.loader-tip');
  if (tipEl) tipEl.textContent = tips[Math.floor(Math.random() * tips.length)];

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = 'auto';
      initParticles();
      spawnCollectibles();
      unlockAchievement('firstVisit');
    }, 2000);
  });

  // ======== XP SYSTEM ========
  const xpFill = document.querySelector('.xp-fill');
  const xpLevel = document.querySelector('.xp-level');
  const xpText = document.querySelector('.xp-text');
  const xpLabel = document.querySelector('.xp-label');

  function addXP(amount) {
    GameState.xp += amount;
    GameState.totalXPEarned += amount;

    while (GameState.xp >= GameState.maxXP && GameState.level < LEVEL_NAMES.length) {
      GameState.xp -= GameState.maxXP;
      GameState.level++;
      GameState.maxXP = Math.floor(GameState.maxXP * 1.5);
      playSound('levelUp');
      showLevelUpEffect();
    }

    updateXPBar();
  }

  function updateXPBar() {
    const percent = (GameState.xp / GameState.maxXP) * 100;
    if (xpFill) xpFill.style.width = percent + '%';
    if (xpLevel) xpLevel.textContent = `LV.${GameState.level}`;
    if (xpText) xpText.textContent = `${GameState.xp}/${GameState.maxXP} XP`;
    if (xpLabel) xpLabel.textContent = LEVEL_NAMES[GameState.level - 1] || 'Legend';
  }

  function showLevelUpEffect() {
    const effect = document.createElement('div');
    effect.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      font-family: 'Press Start 2P', monospace; font-size: 20px; color: #ffd700;
      text-shadow: 0 0 30px rgba(255, 215, 0, 0.8); z-index: 99999;
      animation: levelUpAnim 2s ease forwards; pointer-events: none; text-align: center;
    `;
    effect.innerHTML = `LEVEL UP!<br><span style="font-size:12px; color: #fff;">Level ${GameState.level} — ${LEVEL_NAMES[GameState.level - 1]}</span>`;
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 2500);
  }

  // Add level up animation
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes levelUpAnim {
      0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
      20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
      40% { transform: translate(-50%, -50%) scale(1); }
      80% { opacity: 1; }
      100% { opacity: 0; transform: translate(-50%, -70%) scale(1); }
    }
  `;
  document.head.appendChild(styleSheet);

  updateXPBar();

  // ======== ACHIEVEMENT SYSTEM ========
  const toastContainer = document.querySelector('.achievement-toast-container');

  function unlockAchievement(id) {
    if (GameState.achievementsUnlocked.has(id)) return;
    const ach = ACHIEVEMENTS[id];
    if (!ach) return;

    GameState.achievementsUnlocked.add(id);
    addXP(ach.xp);
    playSound('achievement');

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <span class="toast-icon">${ach.icon}</span>
      <div class="toast-content">
        <div class="toast-label">Achievement Unlocked</div>
        <div class="toast-title">${ach.title}</div>
      </div>
      <span class="toast-xp">+${ach.xp} XP</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.remove(), 4500);
  }

  // ======== CURSOR GLOW ========
  const cursorGlow = document.getElementById('cursor-glow');
  let cursorX = 0, cursorY = 0, glowX = 0, glowY = 0;

  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
  });

  document.addEventListener('mousedown', () => cursorGlow?.classList.add('clicking'));
  document.addEventListener('mouseup', () => cursorGlow?.classList.remove('clicking'));

  function animateCursor() {
    glowX += (cursorX - glowX) * 0.12;
    glowY += (cursorY - glowY) * 0.12;
    if (cursorGlow) {
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top = glowY + 'px';
    }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // ======== NAVBAR ========
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');
  let hasScrolled = false;

  const scrollTopBtn = document.getElementById('scroll-to-top');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveLink();

    if (!hasScrolled && window.scrollY > 200) {
      hasScrolled = true;
      unlockAchievement('scrolled');
    }

    // Show/hide scroll-to-top button
    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }

    // Parallax hero
    const scroll = window.scrollY;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && scroll < window.innerHeight) {
      heroContent.style.transform = `translateY(${scroll * 0.3}px)`;
      heroContent.style.opacity = 1 - scroll / (window.innerHeight * 0.8);
    }
  });

  // Scroll to top click
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      playSound('click');
    });
  }

  function updateActiveLink() {
    const scrollPos = window.scrollY + 250;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }

  // Mobile nav
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    navLinks.forEach(link => link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }));
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 120;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      }
    });
  });

  // ======== SECTION VISIT TRACKING ========
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (!GameState.sectionsVisited.has(id)) {
          GameState.sectionsVisited.add(id);

          const achMap = {
            about: 'aboutVisited',
            projects: 'projectsViewed',
            skills: 'skillsViewed',
            achievements: 'achievementsViewed',
            contact: 'contactReached',
          };

          if (achMap[id]) unlockAchievement(achMap[id]);

          if (GameState.sectionsVisited.size >= 5) {
            unlockAchievement('fullExplorer');
          }
        }
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => sectionObserver.observe(s));

  // ======== SCROLL REVEAL ========
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ======== RPG STAT BARS ========
  const statBars = document.querySelectorAll('.stat-bar-fill-mini');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.getAttribute('data-percent') + '%';
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statBars.forEach(b => statObserver.observe(b));

  // ======== STAT COUNTERS ========
  const counters = document.querySelectorAll('.stat-value[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        let current = 0;
        const increment = Math.ceil(target / 50);
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = current + suffix;
        }, 30);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  // ======== DIALOGUE SYSTEM ========
  const dialogueBox = document.querySelector('.dialogue-text');
  const dialogueContinue = document.querySelector('.dialogue-continue');
  const dialogues = [
    "Hey there, traveler! I'm Mohit Bansal — a results-driven Unity Developer building complete 3D games with Unity Engine and C#.",
    "I specialize in player controllers, physics systems, camera systems, collision logic, and game architecture. Currently pursuing BCA at Avantika University, Ujjain.",
    "Explore my quest log, check my inventory, or try the mini-game! You can also press \` to open the terminal. Collect all 7 hidden orbs for bonus XP! 🎮",
  ];
  let dialogueIndex = 0;
  let charIndex = 0;
  let isTyping = false;

  function typeDialogue() {
    if (dialogueIndex >= dialogues.length) return;
    if (!dialogueBox) return;

    const text = dialogues[dialogueIndex];
    isTyping = true;
    dialogueBox.innerHTML = '';
    charIndex = 0;

    function typeChar() {
      if (charIndex < text.length) {
        dialogueBox.textContent = text.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeChar, 25);
      } else {
        isTyping = false;
        dialogueBox.innerHTML += '<span class="cursor"></span>';
        if (dialogueContinue) dialogueContinue.style.display = 'block';
      }
    }
    typeChar();
  }

  // Start first dialogue after page loads
  setTimeout(() => typeDialogue(), 2500);

  if (dialogueContinue) {
    dialogueContinue.addEventListener('click', () => {
      if (isTyping) return;
      dialogueIndex++;
      if (dialogueIndex < dialogues.length) {
        if (dialogueContinue) dialogueContinue.style.display = 'none';
        typeDialogue();
      } else {
        const box = document.querySelector('.dialogue-box');
        if (box) {
          box.style.transition = 'opacity 0.5s, transform 0.5s';
          box.style.opacity = '0';
          box.style.transform = 'translateY(-10px)';
          setTimeout(() => box.style.display = 'none', 500);
        }
      }
    });
  }

  // ======== VIDEO MODAL ========
  const videoModal = document.getElementById('video-modal');
  const modalIframe = document.getElementById('modal-iframe');
  const modalClose = document.querySelector('.modal-close');
  const modalBackdrop = document.querySelector('.modal-backdrop');

  function openVideoModal(url) {
    if (modalIframe && url) {
      modalIframe.src = url;
      videoModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      playSound('click');
      unlockAchievement('videoWatched');
    }
  }

  function closeModal() {
    videoModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    setTimeout(() => { if (modalIframe) modalIframe.src = ''; }, 400);
  }

  document.querySelectorAll('.watch-gameplay').forEach(btn => {
    btn.addEventListener('click', () => openVideoModal(btn.getAttribute('data-video')));
  });
  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', () => openVideoModal(btn.getAttribute('data-video')));
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (videoModal.classList.contains('active')) closeModal();
      if (GameState.terminalOpen) closeTerminal();
      if (GameState.miniGameActive) closeMiniGame();
    }
  });

  // ======== INVENTORY TOOLTIPS ========
  const tooltip = document.getElementById('item-tooltip');
  const inventorySlots = document.querySelectorAll('.inventory-slot');

  inventorySlots.forEach(slot => {
    slot.addEventListener('mouseenter', (e) => {
      const data = {
        name: slot.getAttribute('data-name'),
        rarity: slot.getAttribute('data-rarity'),
        desc: slot.getAttribute('data-desc'),
        stats: JSON.parse(slot.getAttribute('data-stats') || '[]'),
      };

      tooltip.className = `item-tooltip visible ${data.rarity}`;
      tooltip.innerHTML = `
        <div class="tooltip-name ${data.rarity}">${data.name}</div>
        <div class="tooltip-rarity" style="color: var(--rarity-${data.rarity})">${data.rarity} skill</div>
        <div class="tooltip-desc">${data.desc}</div>
        <div class="tooltip-stats">
          ${data.stats.map(s => `<div class="tooltip-stat">${s}</div>`).join('')}
        </div>
      `;
      playSound('hover');
    });

    slot.addEventListener('mousemove', (e) => {
      const x = e.clientX + 16;
      const y = e.clientY - 10;
      const rect = tooltip.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width - 20;
      const maxY = window.innerHeight - rect.height - 20;
      tooltip.style.left = Math.min(x, maxX) + 'px';
      tooltip.style.top = Math.min(y, maxY) + 'px';
    });

    slot.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  });

  // ======== COLLECTIBLES ========
  const collectibleCounter = document.querySelector('.collectible-count');

  function spawnCollectibles() {
    const orbs = [
      { x: 15, y: 25, emoji: '🔮', color: '#b829ff' },
      { x: 85, y: 35, emoji: '⚡', color: '#ffd700' },
      { x: 10, y: 55, emoji: '💎', color: '#00f0ff' },
      { x: 90, y: 60, emoji: '🌟', color: '#ff2d7c' },
      { x: 50, y: 72, emoji: '🔥', color: '#ff6b00' },
      { x: 20, y: 82, emoji: '🧊', color: '#4d7cff' },
      { x: 75, y: 90, emoji: '💫', color: '#39ff14' },
    ];

    orbs.forEach((orb, i) => {
      const el = document.createElement('div');
      el.className = 'collectible';
      el.textContent = orb.emoji;
      el.style.left = orb.x + '%';
      el.style.top = (orb.y * document.body.scrollHeight / 100) + 'px';
      el.style.color = orb.color;
      el.style.position = 'absolute';
      el.style.fontSize = '1.4rem';
      el.style.animationDelay = (i * 0.3) + 's';

      el.addEventListener('click', () => {
        if (el.classList.contains('collected')) return;
        el.classList.add('collected');
        GameState.collectiblesFound++;
        updateCollectibleCounter();
        addXP(10);
        playSound('collect');

        if (GameState.collectiblesFound === 1) unlockAchievement('firstCollectible');
        if (GameState.collectiblesFound >= GameState.totalCollectibles) unlockAchievement('allCollectibles');

        // Burst particles
        for (let j = 0; j < 8; j++) {
          const particle = document.createElement('div');
          const angle = (j / 8) * Math.PI * 2;
          particle.style.cssText = `
            position: absolute; left: ${el.offsetLeft}px; top: ${el.offsetTop}px;
            width: 6px; height: 6px; border-radius: 50%;
            background: ${orb.color}; pointer-events: none; z-index: 100;
            box-shadow: 0 0 8px ${orb.color};
          `;
          document.body.appendChild(particle);

          const dx = Math.cos(angle) * 60;
          const dy = Math.sin(angle) * 60;
          particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 },
          ], { duration: 600, easing: 'ease-out' });
          setTimeout(() => particle.remove(), 600);
        }

        setTimeout(() => el.remove(), 600);
      });

      document.body.appendChild(el);
    });
  }

  function updateCollectibleCounter() {
    if (collectibleCounter) {
      collectibleCounter.textContent = `${GameState.collectiblesFound}/${GameState.totalCollectibles}`;
    }
  }

  // ======== MINI GAME — Space Dodger ========
  const miniGameContainer = document.getElementById('mini-game-container');
  const miniGameBackdrop = document.querySelector('.mini-game-backdrop');
  const miniGameCanvas = document.getElementById('mini-game-canvas');
  const miniGameClose = document.querySelector('.mini-game-close');
  const miniGameScoreEl = document.querySelector('.mini-game-score');
  let miniGameCtx, miniGameLoop;

  function openMiniGame() {
    GameState.miniGameActive = true;
    miniGameContainer.classList.add('active');
    miniGameBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    unlockAchievement('miniGamePlayed');
    startMiniGame();
  }

  function closeMiniGame() {
    GameState.miniGameActive = false;
    miniGameContainer.classList.remove('active');
    miniGameBackdrop.classList.remove('active');
    document.body.style.overflow = 'auto';
    if (miniGameLoop) cancelAnimationFrame(miniGameLoop);
  }

  document.querySelectorAll('.open-mini-game').forEach(btn => btn.addEventListener('click', openMiniGame));
  if (miniGameClose) miniGameClose.addEventListener('click', closeMiniGame);
  if (miniGameBackdrop) miniGameBackdrop.addEventListener('click', closeMiniGame);

  function startMiniGame() {
    if (!miniGameCanvas) return;
    miniGameCtx = miniGameCanvas.getContext('2d');
    const W = miniGameCanvas.width = 500;
    const H = miniGameCanvas.height = 340;

    let ship = { x: W / 2, y: H - 50, w: 24, h: 24 };
    let asteroids = [];
    let stars = [];
    let score = 0;
    let gameOver = false;
    let keys = {};
    let lastSpawn = 0;
    let difficulty = 1;

    // Create stars
    for (let i = 0; i < 60; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.5 + 0.5, speed: Math.random() * 1 + 0.5 });
    }

    function keyDown(e) { keys[e.key] = true; }
    function keyUp(e) { keys[e.key] = false; }
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    function spawnAsteroid() {
      asteroids.push({
        x: Math.random() * (W - 20),
        y: -20,
        w: Math.random() * 20 + 12,
        speed: Math.random() * 2 + 1 + difficulty * 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
      });
    }

    function update() {
      if (gameOver) return;

      score++;
      difficulty = 1 + Math.floor(score / 300) * 0.5;

      if (score % Math.max(15, 40 - Math.floor(difficulty * 5)) === 0) {
        spawnAsteroid();
      }

      // Move ship
      const speed = 5;
      if (keys['ArrowLeft'] || keys['a']) ship.x -= speed;
      if (keys['ArrowRight'] || keys['d']) ship.x += speed;
      if (keys['ArrowUp'] || keys['w']) ship.y -= speed;
      if (keys['ArrowDown'] || keys['s']) ship.y += speed;

      ship.x = Math.max(0, Math.min(W - ship.w, ship.x));
      ship.y = Math.max(0, Math.min(H - ship.h, ship.y));

      // Move asteroids
      asteroids.forEach(a => {
        a.y += a.speed;
        a.rotation += a.rotSpeed;
      });
      asteroids = asteroids.filter(a => a.y < H + 30);

      // Collision
      asteroids.forEach(a => {
        if (
          ship.x < a.x + a.w &&
          ship.x + ship.w > a.x &&
          ship.y < a.y + a.w &&
          ship.y + ship.h > a.y
        ) {
          gameOver = true;
          GameState.miniGameScore = Math.floor(score / 10);
          if (GameState.miniGameScore >= 50) unlockAchievement('miniGamePro');
          playSound('hit');
        }
      });

      // Stars
      stars.forEach(s => {
        s.y += s.speed;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      });
    }

    function draw() {
      miniGameCtx.fillStyle = '#060611';
      miniGameCtx.fillRect(0, 0, W, H);

      // Stars
      stars.forEach(s => {
        miniGameCtx.fillStyle = `rgba(255, 255, 255, ${s.s / 2})`;
        miniGameCtx.fillRect(s.x, s.y, s.s, s.s);
      });

      // Ship
      miniGameCtx.save();
      miniGameCtx.translate(ship.x + ship.w / 2, ship.y + ship.h / 2);
      miniGameCtx.fillStyle = '#00f0ff';
      miniGameCtx.shadowColor = '#00f0ff';
      miniGameCtx.shadowBlur = 10;
      miniGameCtx.beginPath();
      miniGameCtx.moveTo(0, -ship.h / 2);
      miniGameCtx.lineTo(-ship.w / 2, ship.h / 2);
      miniGameCtx.lineTo(ship.w / 2, ship.h / 2);
      miniGameCtx.closePath();
      miniGameCtx.fill();

      // Engine glow
      miniGameCtx.fillStyle = '#ff6b00';
      miniGameCtx.shadowColor = '#ff6b00';
      miniGameCtx.shadowBlur = 8;
      miniGameCtx.beginPath();
      miniGameCtx.moveTo(-6, ship.h / 2);
      miniGameCtx.lineTo(0, ship.h / 2 + 8 + Math.random() * 6);
      miniGameCtx.lineTo(6, ship.h / 2);
      miniGameCtx.closePath();
      miniGameCtx.fill();
      miniGameCtx.restore();

      // Asteroids
      asteroids.forEach(a => {
        miniGameCtx.save();
        miniGameCtx.translate(a.x + a.w / 2, a.y + a.w / 2);
        miniGameCtx.rotate(a.rotation);
        miniGameCtx.fillStyle = '#8a8a9a';
        miniGameCtx.shadowColor = '#ff2d7c';
        miniGameCtx.shadowBlur = 5;
        miniGameCtx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const r = a.w / 2 * (0.7 + Math.random() * 0.3);
          miniGameCtx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        miniGameCtx.closePath();
        miniGameCtx.fill();
        miniGameCtx.restore();
      });

      // Score
      if (miniGameScoreEl) miniGameScoreEl.textContent = `SCORE: ${Math.floor(score / 10)}`;

      // Game over
      if (gameOver) {
        miniGameCtx.fillStyle = 'rgba(6, 6, 17, 0.7)';
        miniGameCtx.fillRect(0, 0, W, H);

        miniGameCtx.font = '20px "Press Start 2P"';
        miniGameCtx.fillStyle = '#ff2d7c';
        miniGameCtx.textAlign = 'center';
        miniGameCtx.shadowColor = '#ff2d7c';
        miniGameCtx.shadowBlur = 15;
        miniGameCtx.fillText('GAME OVER', W / 2, H / 2 - 20);

        miniGameCtx.font = '10px "Press Start 2P"';
        miniGameCtx.fillStyle = '#ffd700';
        miniGameCtx.shadowColor = '#ffd700';
        miniGameCtx.fillText(`Score: ${Math.floor(score / 10)}`, W / 2, H / 2 + 15);

        miniGameCtx.font = '8px "Press Start 2P"';
        miniGameCtx.fillStyle = '#888';
        miniGameCtx.shadowBlur = 0;
        miniGameCtx.fillText('Press R to restart', W / 2, H / 2 + 45);
      }
    }

    function gameLoop() {
      update();
      draw();
      miniGameLoop = requestAnimationFrame(gameLoop);
    }

    // Restart on R
    function restartHandler(e) {
      if (e.key.toLowerCase() === 'r' && gameOver && GameState.miniGameActive) {
        startMiniGame();
      }
    }
    window.addEventListener('keydown', restartHandler);

    gameLoop();
  }

  // ======== COMMAND TERMINAL ========
  const terminalOverlay = document.querySelector('.terminal-overlay');
  const terminalBody = document.querySelector('.terminal-body');
  const terminalInput = document.querySelector('.terminal-input');
  const terminalClose = document.querySelector('.terminal-close');

  const TERMINAL_COMMANDS = {
    help: () => [
      { text: 'Available commands:', class: 'info' },
      { text: '  help          — Show this help menu', class: '' },
      { text: '  about         — Learn about the developer', class: '' },
      { text: '  skills        — List all skills', class: '' },
      { text: '  projects      — List all projects', class: '' },
      { text: '  stats         — Show game stats', class: '' },
      { text: '  achievements  — Show unlocked achievements', class: '' },
      { text: '  contact       — Show contact info', class: '' },
      { text: '  theme [name]  — Change theme (neon/matrix/fire)', class: '' },
      { text: '  play          — Open mini game', class: '' },
      { text: '  secret        — ???', class: '' },
      { text: '  clear         — Clear terminal', class: '' },
      { text: '  exit          — Close terminal', class: '' },
    ],
    about: () => [
      { text: '╔══════════════════════════════════╗', class: 'info' },
      { text: '║  MOHIT BANSAL — Unity Developer  ║', class: 'info' },
      { text: '╚══════════════════════════════════╝', class: 'info' },
      { text: '', class: '' },
      { text: 'Results-driven Unity Developer with', class: '' },
      { text: 'hands-on experience building complete', class: '' },
      { text: '3D games using Unity Engine and C#.', class: '' },
      { text: '', class: '' },
      { text: 'BCA @ Avantika University, Ujjain', class: 'info' },
      { text: 'Nagda, 456335, India', class: 'system' },
    ],
    skills: () => [
      { text: '⚔️  EQUIPPED SKILLS:', class: 'gold' },
      { text: '  [████████░░] Unity 3D       — Lv. 18', class: 'info' },
      { text: '  [███████░░░] C#             — Lv. 17', class: 'success' },
      { text: '  [███████░░░] Physics & Logic — Lv. 16', class: '' },
      { text: '  [██████░░░░] Visual Studio  — Lv. 15', class: 'info' },
      { text: '  [██████░░░░] Git            — Lv. 15', class: '' },
      { text: '  [██████░░░░] GitHub         — Lv. 14', class: '' },
    ],
    projects: () => [
      { text: '📋 QUEST LOG:', class: 'gold' },
      { text: '', class: '' },
      { text: '  [LEGENDARY] Obstacle Course Game  (04-05/2025)', class: 'gold' },
      { text: '    └─ 3D obstacle-course game', class: '' },
      { text: '    └─ Custom player controller + camera', class: '' },
      { text: '    └─ Rigidbody, Colliders, Input', class: 'system' },
      { text: '', class: '' },
      { text: '  [EPIC] Rocket Boost Game  (06-09/2025)', class: 'info' },
      { text: '    └─ Physics-based rocket control', class: '' },
      { text: '    └─ Thrust, rotation, Rigidbody forces', class: '' },
      { text: '    └─ Particles, audio, modular levels', class: 'system' },
    ],
    stats: () => [
      { text: '📊 PORTFOLIO GAME STATS:', class: 'gold' },
      { text: `  Level:          ${GameState.level} (${LEVEL_NAMES[GameState.level - 1]})`, class: 'info' },
      { text: `  Total XP:       ${GameState.totalXPEarned}`, class: 'success' },
      { text: `  Achievements:   ${GameState.achievementsUnlocked.size}/${Object.keys(ACHIEVEMENTS).length}`, class: '' },
      { text: `  Collectibles:   ${GameState.collectiblesFound}/${GameState.totalCollectibles}`, class: '' },
      { text: `  Mini-Game Best: ${GameState.miniGameScore}`, class: '' },
      { text: `  Sections Found: ${GameState.sectionsVisited.size}/5`, class: '' },
    ],
    achievements: () => {
      const lines = [{ text: '🏆 UNLOCKED ACHIEVEMENTS:', class: 'gold' }, { text: '', class: '' }];
      for (const [id, ach] of Object.entries(ACHIEVEMENTS)) {
        const unlocked = GameState.achievementsUnlocked.has(id);
        lines.push({
          text: `  ${unlocked ? ach.icon : '🔒'} ${unlocked ? ach.title : '???'} ${unlocked ? `(+${ach.xp} XP)` : ''}`,
          class: unlocked ? 'success' : 'system',
        });
      }
      return lines;
    },
    contact: () => [
      { text: '📬 CONTACT INFO:', class: 'info' },
      { text: '  GitHub:    github.com/MohitBal77', class: '' },
      { text: '  LinkedIn:  linkedin.com/in/mohit-bansal-96410329a', class: '' },
      { text: '  Email:     weby018@gmail.com', class: '' },
      { text: '  Phone:     +91-7898556935', class: '' },
      { text: '  Location:  Nagda, 456335, India', class: 'system' },
    ],
    theme: (args) => {
      const theme = args[0];
      if (theme === 'matrix') {
        document.documentElement.style.setProperty('--neon-cyan', '#39ff14');
        document.documentElement.style.setProperty('--neon-purple', '#00ff00');
        return [{ text: '✓ Theme changed to MATRIX', class: 'success' }];
      } else if (theme === 'fire') {
        document.documentElement.style.setProperty('--neon-cyan', '#ff6b00');
        document.documentElement.style.setProperty('--neon-purple', '#ff2d7c');
        return [{ text: '✓ Theme changed to FIRE', class: 'success' }];
      } else if (theme === 'neon' || !theme) {
        document.documentElement.style.setProperty('--neon-cyan', '#00f0ff');
        document.documentElement.style.setProperty('--neon-purple', '#b829ff');
        return [{ text: '✓ Theme reset to NEON', class: 'success' }];
      }
      return [{ text: 'Unknown theme. Try: neon, matrix, fire', class: 'error' }];
    },
    play: () => {
      setTimeout(() => { closeTerminal(); openMiniGame(); }, 300);
      return [{ text: 'Launching mini game...', class: 'success' }];
    },
    secret: () => [
      { text: '', class: '' },
      { text: '  ██████╗ ███████╗██╗   ██╗', class: 'gold' },
      { text: '  ██╔══██╗██╔════╝██║   ██║', class: 'gold' },
      { text: '  ██║  ██║█████╗  ██║   ██║', class: 'gold' },
      { text: '  ██║  ██║██╔══╝  ╚██╗ ██╔╝', class: 'gold' },
      { text: '  ██████╔╝███████╗ ╚████╔╝ ', class: 'gold' },
      { text: '  ╚═════╝ ╚══════╝  ╚═══╝  ', class: 'gold' },
      { text: '', class: '' },
      { text: '  You found the secret! +30 XP', class: 'success' },
      { text: '  "The best games are the ones', class: 'info' },
      { text: '   that hide secrets for the curious."', class: 'info' },
    ],
    clear: () => 'CLEAR',
    exit: () => { setTimeout(closeTerminal, 200); return [{ text: 'Closing terminal...', class: 'system' }]; },
  };

  function openTerminal() {
    GameState.terminalOpen = true;
    terminalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    terminalInput.focus();
    unlockAchievement('terminalOpened');
    playSound('click');
  }

  function closeTerminal() {
    GameState.terminalOpen = false;
    terminalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  if (terminalClose) terminalClose.addEventListener('click', closeTerminal);

  document.addEventListener('keydown', (e) => {
    if (e.key === '`' && !GameState.miniGameActive) {
      e.preventDefault();
      if (GameState.terminalOpen) closeTerminal();
      else openTerminal();
    }
  });

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const input = terminalInput.value.trim().toLowerCase();
        terminalInput.value = '';

        if (!input) return;

        // Show typed command
        addTerminalLine(`> ${input}`, '');

        const parts = input.split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);

        if (TERMINAL_COMMANDS[cmd]) {
          const result = typeof TERMINAL_COMMANDS[cmd] === 'function' ? TERMINAL_COMMANDS[cmd](args) : TERMINAL_COMMANDS[cmd];
          if (result === 'CLEAR') {
            terminalBody.querySelectorAll('.terminal-line').forEach(l => l.remove());
          } else if (Array.isArray(result)) {
            result.forEach(line => addTerminalLine(line.text, line.class));
          }
          if (cmd === 'secret') addXP(30);
        } else {
          addTerminalLine(`Command not found: "${cmd}". Type "help" for available commands.`, 'error');
        }

        addTerminalLine('', '');
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }
    });
  }

  function addTerminalLine(text, cls) {
    const line = document.createElement('div');
    line.className = `terminal-line ${cls}`;
    line.textContent = text;
    const inputLine = document.querySelector('.terminal-input-line');
    terminalBody.insertBefore(line, inputLine);
  }

  // ======== KONAMI CODE ========
  const matrixCanvas = document.getElementById('matrix-canvas');
  const konamiBanner = document.querySelector('.konami-banner');

  document.addEventListener('keydown', (e) => {
    if (GameState.terminalOpen || GameState.miniGameActive) return;

    if (e.keyCode === KONAMI_CODE[GameState.konamiProgress]) {
      GameState.konamiProgress++;
      if (GameState.konamiProgress === KONAMI_CODE.length) {
        activateKonami();
        GameState.konamiProgress = 0;
      }
    } else {
      GameState.konamiProgress = 0;
    }
  });

  function activateKonami() {
    if (GameState.konamiActive) return;
    GameState.konamiActive = true;
    unlockAchievement('konamiCode');
    playSound('levelUp');

    matrixCanvas.classList.add('active');
    konamiBanner.classList.add('active');
    startMatrixRain();

    setTimeout(() => {
      matrixCanvas.classList.remove('active');
      konamiBanner.classList.remove('active');
      GameState.konamiActive = false;
    }, 6000);
  }

  function startMatrixRain() {
    if (!matrixCanvas) return;
    const ctx = matrixCanvas.getContext('2d');
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*ゲームデブ';
    const fontSize = 14;
    const columns = Math.floor(matrixCanvas.width / fontSize);
    const drops = Array(columns).fill(1);

    let frame = 0;
    const maxFrames = 360; // ~6 seconds

    function drawMatrix() {
      if (frame >= maxFrames) return;

      ctx.fillStyle = 'rgba(6, 6, 17, 0.05)';
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

      ctx.fillStyle = '#39ff14';
      ctx.font = fontSize + 'px monospace';
      ctx.shadowColor = '#39ff14';
      ctx.shadowBlur = 3;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      frame++;
      requestAnimationFrame(drawMatrix);
    }
    drawMatrix();
  }

  // ======== PARTICLES ========
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0, mouseY = 0;

    function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = ['0,240,255', '184,41,255', '255,45,124', '57,255,20'][Math.floor(Math.random() * 4)];
      }
      update() {
        const dx = mouseX - this.x, dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          this.speedX -= (dx / dist) * force * 0.3;
          this.speedY -= (dy / dist) * force * 0.3;
        }
        this.speedX *= 0.99;
        this.speedY *= 0.99;
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${this.opacity * 0.12})`;
        ctx.fill();
      }
    }

    const count = Math.min(90, Math.floor(window.innerWidth / 14));
    for (let i = 0; i < count; i++) particles.push(new Particle());

    function drawConns() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,240,255,${(1 - dist / 140) * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawConns();
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ======== SOUND EFFECTS ========
  let audioCtx;
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  const audioToggle = document.querySelector('.audio-toggle');
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      GameState.audioEnabled = !GameState.audioEnabled;
      audioToggle.classList.toggle('muted', !GameState.audioEnabled);
      audioToggle.textContent = GameState.audioEnabled ? '🔊' : '🔇';
      if (GameState.audioEnabled) {
        getAudioCtx(); // Initialize on user gesture
        playSound('click');
      }
    });
  }

  function playSound(type) {
    if (!GameState.audioEnabled) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'achievement') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.16);
        osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.24);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(); osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'levelUp') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(262, ctx.currentTime);
        osc.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(392, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(523, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start(); osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'collect') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start(); osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  }

  document.querySelectorAll('.btn, .play-btn, .inventory-slot').forEach(el => {
    el.addEventListener('mouseenter', () => playSound('hover'));
  });

  // ======== CONTACT FORM ========
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playSound('success');
      unlockAchievement('messageSent');
      const btn = contactForm.querySelector('.form-submit');
      const orig = btn.innerHTML;
      btn.innerHTML = '✓ MESSAGE SENT!';
      btn.style.background = 'var(--gradient-3)';
      setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; contactForm.reset(); }, 3000);
    });
  }

  // ======== MAGNETIC BUTTONS ========
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

});
