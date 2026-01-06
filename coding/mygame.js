// Access the global THREE object provided by the MindAR script
const THREE = window.MINDAR.IMAGE.THREE;

/* ==========================================================
   0. LANGUAGE SETTINGS
   ========================================================== */
const urlParams = new URLSearchParams(window.location.search);
const paramLang = urlParams.get('lang');

// LOGIC: Check URL -> Check LocalStorage (from index.html) -> Default to 'en'
// Your index.html saves 'siteLang' as 'my' or 'en'
let savedLang = localStorage.getItem('siteLang');
const currentLang = (paramLang === 'my' || savedLang === 'my') ? 'my' : 'en';

// Set HTML Lang attribute for consistency
document.documentElement.lang = currentLang;

const translations = {
  en: {
    langBtn: "Tukar ke Bahasa Melayu 🇲🇾",
    greetingTitle: "Deep Sea Games 🐙",
    greetingText: "Welcome, Explorer! Complete one game to unlock the next.<br>Score over 100 points to win the Gold Badge! 🏆",
    scanTitle: "SCAN GAME MARKER",
    scanText: "Point your camera at the target image to begin.",
    howToPlay: "How to Play",
    gotIt: "Got it!",
    menu: "← Menu",
    reset: "Reset Level",
    instructionBtn: "❓ Instruction",
    exit: "EXIT GAME",
    locked: "Locked",
    nextGame: "NEXT GAME ➡",
    complete: "COMPLETE ✅",
    badgeUnlocked: "BADGE UNLOCKED!",
    gameOver: "GAME OVER",
    badgeMsgWin: "You are a true Deep Sea Explorer!",
    badgeMsgLose: "Reset the games to try again!",
    finalScore: "Final Score:",
    close: "Close",
    gameTitles: ["Match Look", "Match Fact", "Memory Game", "Creature Names"],
    instructions: {
      look: "DRAG the name tag on the left and DROP it onto the correct creature's image.",
      fact: "DRAG the fact card on the left and DROP it onto the creature it describes.",
      memory: "Tap the cards to flip them. Find all the matching pairs of deep-sea creatures!",
      name: "Look at the creature images and TYPE their correct names in the boxes provided."
    },
    creatures: {
      "Dumbo Octopus": "Dumbo Octopus",
      "Gulper Eel": "Gulper Eel",
      "Barreleye": "Barreleye",
      "Anglerfish": "Anglerfish",
      "Blobfish": "Blobfish",
      "Vampire Squid": "Vampire Squid"
    },
    facts: {
      "Anglerfish": "Uses a glowing lure to attract prey.",
      "Blobfish": "Has gelatinous skin to survive pressure.",
      "Vampire Squid": "Lives in oxygen-minimum zones."
    },
    cardBackTitle: "INTO THE ABYSS",
    cardBackSubtitle: "exploring the unknown depth",
    placeholder: "Type name..."
  },
  // CHANGED KEY FROM 'ms' TO 'my' TO MATCH INDEX.HTML
  my: {
    langBtn: "Switch to English 🇬🇧",
    greetingTitle: "Permainan Laut Dalam 🐙",
    greetingText: "Selamat Datang, Peneroka! Selesaikan satu permainan untuk buka seterusnya.<br>Skor lebih 100 mata untuk menang Lencana Emas! 🏆",
    scanTitle: "IMBAS PENANDA",
    scanText: "Halakan kamera anda pada imej sasaran untuk mula.",
    howToPlay: "Cara Bermain",
    gotIt: "Faham!",
    menu: "← Menu",
    reset: "Ulang Tahap",
    instructionBtn: "❓ Arahan",
    exit: "KELUAR",
    locked: "Terkunci",
    nextGame: "SETERUSNYA ➡",
    complete: "SELESAI ✅",
    badgeUnlocked: "LENCANA DIPEROLEH!",
    gameOver: "TAMAT PERMAINAN",
    badgeMsgWin: "Anda Peneroka Laut Dalam sejati!",
    badgeMsgLose: "Ulang permainan untuk cuba lagi!",
    finalScore: "Markah Akhir:",
    close: "Tutup",
    gameTitles: ["Padan Rupa", "Padan Fakta", "Ingatan", "Nama Makhluk"],
    instructions: {
      look: "HERET tanda nama di kiri dan LEPASKAN ke atas gambar makhluk yang betul.",
      fact: "HERET kad fakta di kiri dan LEPASKAN ke atas makhluk yang diterangkan.",
      memory: "Ketuk kad untuk membalikkannya. Cari pasangan makhluk laut dalam yang sama!",
      name: "Lihat gambar makhluk dan TAIP nama yang betul dalam kotak yang disediakan."
    },
    creatures: {
      "Dumbo Octopus": "Sotong Dumbo",
      "Gulper Eel": "Belut Gulper",
      "Barreleye": "Barreleye",
      "Anglerfish": "Ikan Angler",
      "Blobfish": "Ikan Blob",
      "Vampire Squid": "Sotong Vampire"
    },
    facts: {
      "Anglerfish": "Guna umpan bercahaya untuk tarik mangsa.",
      "Blobfish": "Kulit seperti jeli untuk tahan tekanan.",
      "Vampire Squid": "Hidup di zon kurang oksigen."
    },
    cardBackTitle: "LAUT DALAM",
    cardBackSubtitle: "meneroka kedalaman misteri",
    placeholder: "Taip nama..."
  }
};

const t = translations[currentLang];

/* ==========================================================
   1. INJECT DEEP SEA THEME CSS
   ========================================================== */
const style = document.createElement('style');
style.innerHTML = `
  :root {
    --deep-navy: #020617;
    --bio-cyan: #0ea5e9;
    --glow-blue: #3b82f6;
    --correct-green: #22c55e;
    --error-red: #ef4444;
    --card-gradient: linear-gradient(135deg, #0f172a, #1e293b);
    --btn-gradient: linear-gradient(145deg, #020617, #075985);
  }

  @keyframes popIn {
    0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }

  @keyframes snakeLine {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .animate-pop { animation: popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

  .glass-panel {
    background: rgba(2, 6, 23, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(14, 165, 233, 0.4);
    border-radius: 24px;
    box-shadow: 0 0 25px rgba(14, 165, 233, 0.2);
    position: relative;
    overflow: hidden;
    color: white;
    font-family: 'Poppins', sans-serif;
  }

  .nav-btn {
    padding: 10px 18px;
    border-radius: 10px;
    border: 1px solid var(--bio-cyan);
    cursor: pointer;
    background: var(--btn-gradient);
    color: white;
    font-size: 14px;
    font-weight: 700;
    z-index: 10000;
  }
  
  .nav-btn:active { transform: scale(0.95); }

  /* Language Switcher Button Style */
  .lang-btn {
    margin-top: 15px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.3);
    color: #94a3b8;
    padding: 8px 15px;
    font-size: 12px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;
  }
  .lang-btn:hover {
    background: rgba(255,255,255,0.1);
    color: white;
    border-color: white;
  }

  .sea-card {
    background: var(--card-gradient) !important;
    border: 1px solid rgba(14, 165, 233, 0.5) !important;
    box-shadow: 0 4px 15px rgba(0,0,0,0.5), 0 0 10px rgba(14, 165, 233, 0.1) !important;
    color: #e0f2fe !important;
    overflow: hidden;
    transition: opacity 0.5s ease;
  }

  .creature-box {
    transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), border 0.3s ease;
    position: relative;
    width: 240px;
    height: 160px;
    border: 3px dashed var(--bio-cyan);
    border-radius: 20px;
    overflow: hidden;
    background: rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .combined-label {
    background: var(--correct-green);
    color: white;
    width: 100%;
    padding: 6px 10px;
    text-align: center;
    font-weight: bold;
    font-size: 13px;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 2;
    line-height: 1.2;
  }

  /* Game 3 Card Back */
  .card-back {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 15px;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    background: var(--btn-gradient);
  }

  .card-back .title { font-size: 15px; letter-spacing: 1.5px; font-weight: 800; color: #cbd5e1; text-transform: uppercase; }
  .card-back .subtitle { font-size: 9px; font-weight: 400; color: #94a3b8; line-height: 1.3; text-transform: lowercase; margin-top: 5px; }

  .menu-btn {
    position: relative;
    border: none !important;
    padding: 2px; 
    z-index: 1;
    overflow: hidden;
  }

  .menu-btn::before {
    content: '';
    position: absolute;
    width: 250%;
    height: 250%;
    background: conic-gradient(transparent, transparent, transparent, var(--bio-cyan));
    animation: snakeLine 4s linear infinite;
    top: -75%;
    left: -75%;
    z-index: -2;
  }

  .menu-btn::after {
    content: '';
    position: absolute;
    inset: 2px;
    background: var(--btn-gradient);
    border-radius: 22px;
    z-index: -1;
  }

  .locked-btn {
    filter: grayscale(100%);
    opacity: 0.6;
    pointer-events: none;
    border: 2px solid #334155 !important;
  }
  
  .locked-btn::before { display: none; }
  .locked-btn::after { background: #0f172a; }

  /* Next Level Button */
  .next-level-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px 40px;
    font-size: 24px;
    font-weight: bold;
    color: white;
    background: linear-gradient(135deg, #0ea5e9, #22c55e);
    border: 3px solid white;
    border-radius: 50px;
    box-shadow: 0 0 40px rgba(34, 197, 94, 0.6);
    cursor: pointer;
    z-index: 10002;
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .next-level-btn:hover { transform: translate(-50%, -50%) scale(1.05); }

  .instruction-modal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    padding: 30px;
    text-align: center;
    color: white;
    display: none;
    z-index: 10001;
  }

  /* --- SCORE BOARD --- */
  .score-board {
    position: absolute;
    bottom: 20px;
    right: 20px;
    top: auto;
    background: linear-gradient(135deg, rgba(2, 6, 23, 0.95), rgba(7, 89, 133, 0.4));
    border: 2px solid #FFD700;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
    color: #FFD700;
    padding: 10px 25px;
    border-radius: 50px;
    font-size: 24px;
    font-weight: 800;
    z-index: 10000;
    display: none; 
    font-family: 'Poppins', sans-serif;
    align-items: center;
    gap: 12px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }

  /* --- BADGE MODAL --- */
  .badge-modal {
    background: linear-gradient(135deg, #1e293b, #0f172a);
    border: 2px solid #FFD700;
    box-shadow: 0 0 50px rgba(255, 215, 0, 0.4);
  }
  .badge-icon {
    font-size: 80px;
    margin: 20px 0;
    filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.6));
  }
`;
document.head.appendChild(style);

// Score Board Element (With Trophy)
const scoreBoard = document.createElement("div");
scoreBoard.className = "score-board";
scoreBoard.id = "score-display";
scoreBoard.innerHTML = `<span>🏆</span> <span id="score-val">0 / 0</span>`;
document.body.appendChild(scoreBoard);


/* ==========================================================
   2. GLOBAL STATE & UTILS
   ========================================================== */
let hasScanned = false;
let currentInstruction = "";

// Game State Tracking
const gameState = {
    scores: { 0: 0, 1: 0, 2: 0, 3: 0 }, 
    completed: { 0: false, 1: false, 2: false, 3: false },
    unlocked: { 0: true, 1: false, 2: false, 3: false } // Level progression
};

const POINTS_PER_ACTION = 10;
const MAX_SCORE = 160; 
const BADGE_THRESHOLD = 100;

const initializeMindAR = () => new window.MINDAR.IMAGE.MindARThree({
  container: document.body,
  imageTargetSrc: "game.mind" 
});

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Internal Audio Loader Helper
const loadAudioFile = async (filename, camera, loop = true, positional = true) => {
  try {
    const loader = new THREE.AudioLoader();
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = positional ? new THREE.PositionalAudio(listener) : new THREE.Audio(listener);
    await new Promise((resolve, reject) => {
      loader.load(filename, buffer => {
        sound.setBuffer(buffer);
        sound.setLoop(loop);
        sound.setVolume(0.6);
        resolve();
      }, undefined, (err) => {
          console.warn("Audio file issue:", filename);
          resolve(); 
      });
    });
    return sound;
  } catch (err) { 
    return { play: () => {}, pause: () => {} }; 
  }
};

/* --- SCORING FUNCTIONS --- */
const updateScoreDisplay = () => {
    const total = Object.values(gameState.scores).reduce((a,b)=>a+b, 0);
    const el = document.getElementById('score-display');
    const val = document.getElementById('score-val');
    if(el && val) {
        val.innerText = `${total} / ${MAX_SCORE}`;
        el.style.display = "flex";
    }
    return total;
};

const addPoints = (gameIndex, points) => {
    if(!gameState.completed[gameIndex]) {
        gameState.scores[gameIndex] += points;
        updateScoreDisplay();
    }
};

const resetGameScore = (gameIndex) => {
    gameState.scores[gameIndex] = 0;
    gameState.completed[gameIndex] = false;
    updateScoreDisplay();
};

const showBadge = (score) => {
    const badgeModal = document.createElement("div");
    badgeModal.className = "glass-panel badge-modal animate-pop";
    
    const isWinner = score >= BADGE_THRESHOLD;
    const title = isWinner ? t.badgeUnlocked : t.gameOver;
    const msg = isWinner ? t.badgeMsgWin : t.badgeMsgLose;
    const icon = isWinner ? "🏆" : "⚓";
    
    badgeModal.innerHTML = `
        <h2 style="color:${isWinner ? '#FFD700' : 'white'}; margin-top:0">${title}</h2>
        <div class="badge-icon">${icon}</div>
        <p style="font-size:18px; margin-bottom:5px;">${t.finalScore} <span style="color:var(--bio-cyan)">${score} / ${MAX_SCORE}</span></p>
        <p style="color:#94a3b8; font-size:14px;">${msg}</p>
        <button class="nav-btn" style="margin-top:20px; width:100%">${t.close}</button>
    `;
    
    Object.assign(badgeModal.style, {
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "320px", padding: "30px", textAlign: "center", zIndex: "10005"
    });
    
    document.body.appendChild(badgeModal);
    badgeModal.querySelector("button").onclick = () => badgeModal.remove();
};

const showCelebration = (parent, sound, wowSound) => {
  if (sound && sound.play) sound.play(); 
  if (wowSound && wowSound.play) wowSound.play(); 
  const confetti = document.createElement("div");
  Object.assign(confetti.style, { position: "absolute", inset: "0", pointerEvents: "none", zIndex: "10000" });
  for (let i = 0; i < 20; i++) {
    const span = document.createElement("span");
    span.innerText = ["✨", "🎉", "🌊"][Math.floor(Math.random()*3)];
    Object.assign(span.style, { 
      position: "absolute", 
      top: `${Math.random() * 90}%`, 
      left: `${Math.random() * 70}%`, 
      fontSize: `20px` 
    });
    confetti.appendChild(span);
  }
  parent.appendChild(confetti);
  setTimeout(() => confetti.remove(), 3000);
};

/* ==========================================================
   3. GAME BUILDERS
   ========================================================== */
const createMatchGame = (gameId, type, correctSound, wrongSound, celebrationSound, wowSound, onComplete) => {
  const container = document.createElement("div");
  container.className = "glass-panel";
  Object.assign(container.style, { 
    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", 
    display: "flex", flexDirection: "row", justifyContent: "space-between",
    width: "600px", zIndex: "9999", padding: "70px" 
  });

  const instruction = type === 'look' ? t.instructions.look : t.instructions.fact;
  
  // Store display type for transitions
  container.dataset.displayType = "flex";

  // Data mapping based on Language
  // Note: We use the translated name for display and comparison for 'look' type
  // For 'fact', we look up the translated fact based on the English ID key
  const data = type === 'look' 
    ? [
        { name: t.creatures["Dumbo Octopus"], id: "Dumbo Octopus", src: "dumbo.png" }, 
        { name: t.creatures["Gulper Eel"], id: "Gulper Eel", src: "gulper.png" }, 
        { name: t.creatures["Barreleye"], id: "Barreleye", src: "barreleye.png" }
      ]
    : [
        { info: t.facts["Anglerfish"], id: "Anglerfish", src: "angler.png" }, 
        { info: t.facts["Blobfish"], id: "Blobfish", src: "blob.png" }, 
        { info: t.facts["Vampire Squid"], id: "Vampire Squid", src: "vampire.png" }
      ];

  let attemptCount = 0;

  const reset = () => {
    resetGameScore(gameId);
    attemptCount = 0;
    container.innerHTML = "";
    
    const leftCol = document.createElement("div"); 
    Object.assign(leftCol.style, { display: "flex", flexDirection: "column", gap: "25px", width: "260px" });
    const rightCol = document.createElement("div"); 
    Object.assign(rightCol.style, { display: "flex", flexDirection: "column", gap: "25px", width: "240px" });
    
    shuffleArray([...data]).forEach(item => {
      const card = document.createElement("div"); 
      card.className = "sea-card"; 
      card.innerText = type === 'look' ? item.name : item.info; 
      // Using unique ID derived from the fixed ID to prevent whitespace issues
      card.id = `drag-${item.id.replace(/\s+/g, '')}`;
      card.draggable = true;
      Object.assign(card.style, { 
        width: "230px", height: "130px", display: "flex", alignItems: "center", 
        justifyContent: "center", padding: "15px", fontSize: "16px", fontWeight: "700", 
        textAlign: "center", borderRadius: "20px", cursor: "grab" 
      });
      // Transfer the fixed ID (English) to ensure matching works regardless of language
      card.addEventListener("dragstart", e => e.dataTransfer.setData("id", item.id)); 
      leftCol.appendChild(card);
    });

    shuffleArray([...data]).forEach(item => {
      const b = document.createElement("div"); 
      b.className = "creature-box";
      b.correct = false;
      const img = document.createElement("img"); 
      img.src = item.src; 
      Object.assign(img.style, { width: "100%", height: "100%", objectFit: "cover" }); 
      b.appendChild(img);

      b.addEventListener("dragover", e => e.preventDefault());
      b.addEventListener("drop", e => {
        if(b.correct) return; 

        const droppedId = e.dataTransfer.getData("id");
        const draggedCard = document.getElementById(`drag-${droppedId.replace(/\s+/g, '')}`);
        
        if (!draggedCard || draggedCard.getAttribute("data-used") === "true") return;

        draggedCard.setAttribute("data-used", "true"); 
        attemptCount++;

        if (droppedId === item.id) { 
          b.style.border = "4px solid var(--correct-green)"; 
          b.correct = true; 
          correctSound.play();
          addPoints(gameId, POINTS_PER_ACTION); 

          const label = document.createElement("div");
          label.className = "combined-label";
          // Display the localized text
          label.innerText = type === 'look' ? item.name : item.info;
          b.appendChild(label);
          draggedCard.style.opacity = "0"; 
          draggedCard.draggable = false;
        } else { 
          b.style.border = "4px solid var(--error-red)"; 
          wrongSound.play(); 
          setTimeout(() => b.style.border = "3px dashed var(--bio-cyan)", 1000); 
          
          draggedCard.style.opacity = "0.4";
          draggedCard.style.backgroundColor = "var(--error-red)";
          draggedCard.draggable = false;
          draggedCard.style.cursor = "not-allowed";
        }
        
        if (attemptCount === data.length) {
           setTimeout(() => onComplete(gameId, container), 500);
        }
      });
      rightCol.appendChild(b); 
    });
    container.appendChild(leftCol); 
    container.appendChild(rightCol);
  };
  
  reset(); 
  document.body.appendChild(container); 
  container.style.display = "none"; 
  return { container, reset, instruction };
};

const createMemoryGame = (gameId, celebrationSound, wowSound, onComplete) => {
  const container = document.createElement("div");
  container.className = "glass-panel";
  Object.assign(container.style, { 
    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", 
    display: "grid", gridTemplateColumns: "repeat(4, 140px)", gridTemplateRows: "repeat(3, 200px)", 
    gridGap: "15px", zIndex: "9999", padding: "25px" 
  });
  
  container.dataset.displayType = "grid";

  const instruction = t.instructions.memory;

  const cardsData = [
    { name: "A", src: "angler.png" }, { name: "B", src: "blob.png" }, 
    { name: "V", src: "vampire.png" }, { name: "D", src: "dumbo.png" }, 
    { name: "G", src: "gulper.png" }, { name: "Ba", src: "barreleye.png" }
  ];

  const reset = () => {
    resetGameScore(gameId);
    container.innerHTML = "";
    const paired = shuffleArray([...cardsData, ...cardsData]);
    let flipped = []; 
    const els = [];

    paired.forEach(card => {
      const d = document.createElement("div"); 
      Object.assign(d.style, { width: "140px", height: "200px", borderRadius: "16px", cursor: "pointer", border: "1px solid rgba(14, 165, 233, 0.3)", overflow: "hidden", position: "relative" });
      const img = document.createElement("img"); 
      img.src = card.src; 
      Object.assign(img.style, { width: "100%", height: "100%", objectFit: "cover", display: "none" });
      const back = document.createElement("div");
      back.className = "card-back";
      back.innerHTML = `<div class="title">${t.cardBackTitle}</div><div class="subtitle">${t.cardBackSubtitle}</div>`;
      d.appendChild(img); d.appendChild(back); container.appendChild(d); els.push(d);

      d.onclick = () => {
        if (flipped.length < 2 && img.style.display === "none") {
          img.style.display = "block"; back.style.display = "none";
          flipped.push({d, img, back, card});
          if (flipped.length === 2) {
            if (flipped[0].card.name === flipped[1].card.name) { 
              addPoints(gameId, POINTS_PER_ACTION); 
              setTimeout(() => { 
                  flipped.forEach(f => f.d.style.visibility = "hidden"); 
                  flipped = []; 
                  if(els.every(e => e.style.visibility === "hidden")) onComplete(gameId, container);
              }, 500); 
            } else { 
              setTimeout(() => { flipped.forEach(f => { f.img.style.display = "none"; f.back.style.display = "flex"; }); flipped = []; }, 800); 
            }
          }
        }
      };
    });
  };
  reset(); document.body.appendChild(container); container.style.display = "none"; 
  return { container, reset, instruction };
};

const createFillNameGame = (gameId, correctSound, wrongSound, celebrationSound, wowSound, onComplete) => {
  const container = document.createElement("div"); 
  container.className = "glass-panel";
  Object.assign(container.style, { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "grid", gridTemplateColumns: "repeat(2, 200px)", gridGap: "40px", zIndex: "9999", padding: "40px" });
  
  container.dataset.displayType = "grid";

  const instruction = t.instructions.name;

  // Use translated names for validation
  const images = [
      { src: "angler.png", name: t.creatures["Anglerfish"] }, 
      { src: "blob.png", name: t.creatures["Blobfish"] }, 
      { src: "vampire.png", name: t.creatures["Vampire Squid"] }, 
      { src: "barreleye.png", name: t.creatures["Barreleye"] }
  ];

  const reset = () => {
    resetGameScore(gameId);
    container.innerHTML = "";
    const shuffledImages = shuffleArray([...images]);

    shuffledImages.forEach(imgObj => {
      const div = document.createElement("div"); Object.assign(div.style, { display: "flex", flexDirection: "column", alignItems: "center" });
      const img = document.createElement("img"); img.src = imgObj.src; Object.assign(img.style, { width: "200px", height: "220px", border: "4px solid var(--bio-cyan)", borderRadius: "20px", background: "rgba(255,255,255,0.05)", objectFit: "cover" });
      const input = document.createElement("input"); 
      input.placeholder = t.placeholder; 
      Object.assign(input.style, { marginTop: "12px", padding: "10px", width: "180px", textAlign: "center", borderRadius: "10px", border: "1px solid var(--bio-cyan)", background: "rgba(0,0,0,0.4)", color: "white", fontWeight: "700" });

      input.completed = false; 

      input.onchange = () => {
        if (input.completed) return; 

        input.completed = true;
        input.disabled = true; 

        // Compare using translated names (user must type "Ikan Angler" if in Malay)
        if (input.value.toLowerCase() === imgObj.name.toLowerCase()) { 
            img.style.border = "4px solid var(--correct-green)"; 
            correctSound.play();
            addPoints(gameId, POINTS_PER_ACTION); 
        } else { 
            img.style.border = "4px solid var(--error-red)"; 
            input.style.borderColor = "var(--error-red)";
            input.style.color = "var(--error-red)";
            wrongSound.play(); 
        }
        
        if (Array.from(container.querySelectorAll("input")).every((inp) => inp.completed)) {
            setTimeout(() => onComplete(gameId, container), 500);
        }
      };
      div.appendChild(img); div.appendChild(input); container.appendChild(div);
    });
  };
  reset(); document.body.appendChild(container); container.style.display = "none"; 
  return { container, reset, instruction };
};

/* ==========================================================
   4. MENU, NAVIGATION & INSTRUCTION OVERLAY
   ========================================================== */

const createGreetingOverlay = () => {
  const overlay = document.createElement("div");
  overlay.id = "greeting-overlay";
  overlay.className = "glass-panel animate-pop";
  Object.assign(overlay.style, {
    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
    width: "350px", padding: "40px", textAlign: "center", zIndex: "10005",
    display: "flex", flexDirection: "column", gap: "20px"
  });

  overlay.innerHTML = `
    <h1 style="color:var(--bio-cyan); margin:0; text-shadow: 0 0 10px rgba(14,165,233,0.5);">${t.greetingTitle}</h1>
    <p style="font-size: 16px; color: #e2e8f0; line-height: 1.5;">
        ${t.greetingText}
    </p>
    <div style="border: 2px dashed var(--bio-cyan); padding: 20px; border-radius: 15px; background: rgba(14, 165, 233, 0.1);">
      <div style="font-size: 40px; margin-bottom: 10px;">📸</div>
      <p style="margin:0; font-weight:bold; font-size:18px; color: #FFD700;">${t.scanTitle}</p>
      <p style="margin:5px 0 0 0; font-size:14px; color: #cbd5e1;">${t.scanText}</p>
    </div>
  `;
  
  // Add Language Toggle Button
  const langBtn = document.createElement("button");
  langBtn.className = "lang-btn";
  langBtn.innerText = t.langBtn;
  langBtn.onclick = () => {
      // Toggle logic
      const newLang = currentLang === 'en' ? 'my' : 'en';
      localStorage.setItem('siteLang', newLang); // Update localStorage
      
      // Update URL just in case
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('lang', newLang);
      window.location.href = newUrl.toString();
  };
  overlay.appendChild(langBtn);

  document.body.appendChild(overlay);
  return overlay;
};

const createGameMenuButtons = (games, buttonSound) => {
  const wrapper = document.createElement("div");
  wrapper.id = "menu-wrapper";
  Object.assign(wrapper.style, { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "none", gridTemplateColumns: "repeat(2, 220px)", gap: "35px", zIndex: "9999" });

  const modal = document.createElement("div");
  modal.className = "glass-panel instruction-modal animate-pop";
  modal.innerHTML = `<h2 style="color:var(--bio-cyan)">${t.howToPlay}</h2><p id="ins-text" style="margin:20px 0; line-height:1.6"></p><button class="nav-btn">${t.gotIt}</button>`;
  document.body.appendChild(modal);
  modal.querySelector("button").onclick = () => { buttonSound.play(); modal.style.display = "none"; };

  const backBtn = document.createElement("button"); 
  backBtn.className = "nav-btn"; backBtn.innerText = t.menu;
  Object.assign(backBtn.style, { position: "absolute", top: "40px", left: "20px", display: "none" });
  document.body.appendChild(backBtn);

  const resetBtn = document.createElement("button"); 
  resetBtn.className = "nav-btn"; resetBtn.innerText = t.reset;
  Object.assign(resetBtn.style, { position: "absolute", top: "40px", left: "120px", display: "none" });
  document.body.appendChild(resetBtn);

  const helpBtn = document.createElement("button"); 
  helpBtn.className = "nav-btn"; helpBtn.innerText = t.instructionBtn;
  Object.assign(helpBtn.style, { position: "absolute", top: "40px", right: "20px", display: "none", borderColor: "gold" });
  document.body.appendChild(helpBtn);

  const exitBtn = document.createElement("button"); 
  exitBtn.className = "nav-btn"; exitBtn.innerText = t.exit;
  Object.assign(exitBtn.style, { position: "absolute", top: "40px", left: "20px", display: "none" });
  document.body.appendChild(exitBtn);

  // Helper to refresh lock state
  const refreshMenuVisuals = () => {
    const btns = wrapper.querySelectorAll('.menu-btn');
    const icons = ["dumbo.png", "angler.png", "angler.png", "angler.png"];
    btns.forEach((btn, i) => {
       if(!gameState.unlocked[i]) {
           btn.classList.add('locked-btn');
           btn.innerHTML = `<div>🔒 ${t.locked}</div>`; // Simple Lock UI
       } else {
           btn.classList.remove('locked-btn');
           btn.innerHTML = `<img src="${icons[i]}" style="width:110px"><div>${t.gameTitles[i]}</div>`;
       }
    });
  };

  helpBtn.onclick = () => {
    buttonSound.play();
    document.getElementById("ins-text").innerText = currentInstruction;
    modal.style.display = "block";
  };

  backBtn.onclick = () => { 
    buttonSound.play(); 
    games.forEach(g => g.container.style.display = "none"); 
    wrapper.style.display = "grid"; 
    
    // Refresh locks in case we unlocked something
    refreshMenuVisuals();

    backBtn.style.display = "none"; resetBtn.style.display = "none"; helpBtn.style.display = "none"; exitBtn.style.display = "block"; 
    document.getElementById('score-display').style.display = "flex";
  };

  resetBtn.onclick = () => { 
    buttonSound.play(); 
    const active = games.find(g => g.container.style.display !== "none"); 
    if(active) active.reset(); 
  };

  exitBtn.onclick = () => { 
    buttonSound.play(); document.body.style.opacity = "0"; 
    setTimeout(() => { window.location.href = "index.html"; }, 400); 
  };

  const icons = ["dumbo.png", "angler.png", "angler.png", "angler.png"];

  games.forEach((game, i) => {
    const btn = document.createElement("button"); 
    btn.className = "glass-panel menu-btn"; 
    Object.assign(btn.style, { width: "220px", height: "240px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", cursor: "pointer", color: "#fff", fontWeight: "700" });
    
    // Initial State Check
    if(!gameState.unlocked[i]) {
        btn.classList.add('locked-btn');
        btn.innerHTML = `<div>🔒 ${t.locked}</div>`;
    } else {
        btn.innerHTML = `<img src="${icons[i]}" style="width:110px"><div>${t.gameTitles[i]}</div>`;
    }

    btn.onclick = () => { 
      if(!gameState.unlocked[i]) return; // Extra guard
      buttonSound.play(); 
      currentInstruction = game.instruction;
      game.container.style.display = game.container.dataset.displayType || "flex"; 
      game.container.classList.add("animate-pop"); 
      wrapper.style.display = "none"; 
      backBtn.style.display = "block"; resetBtn.style.display = "block"; helpBtn.style.display = "block"; exitBtn.style.display = "none"; 
    };
    wrapper.appendChild(btn);
  });

  document.body.appendChild(wrapper); 
  return { wrapper, exitBtn, refreshMenuVisuals };
};

/* ==========================================================
   5. INITIALIZATION
   ========================================================== */
(async () => {
  const mindar = initializeMindAR();
  const { renderer, scene, camera } = mindar;

  const bg = await loadAudioFile("bgm.mp3", camera, true, false);
  const correct = await loadAudioFile("correct.mp3", camera, false, false);
  const wrong = await loadAudioFile("wrong.mp3", camera, false, false);
  const celebration = await loadAudioFile("celebration.mp3", camera, false, false);
  const wow = await loadAudioFile("wow.mp3", camera, false, false);
  const btnSfx = await loadAudioFile("button.mp3", camera, false, false);

  // Define games array first so we can reference it in the callback
  const games = [];
  let menuInterface = null;

  // The central handler for completing a game
  const handleGameComplete = (index, container) => {
    if(gameState.completed[index]) return; // already handled
    gameState.completed[index] = true;

    // Show Celebration
    if(gameState.scores[index] > 0) showCelebration(container, celebration, wow);

    // Create Button Overlay inside the game container
    const btn = document.createElement("button");
    btn.className = "next-level-btn";
    
    if (index < 3) {
        // Not the last game -> Next Level
        btn.innerHTML = t.nextGame;
        btn.onclick = () => {
            btnSfx.play();
            // Unlock next level
            gameState.unlocked[index + 1] = true;
            
            // Switch views directly
            container.style.display = "none";
            const nextGame = games[index + 1];
            nextGame.container.style.display = nextGame.container.dataset.displayType || "flex";
            nextGame.container.classList.add("animate-pop");
            
            // Update instruction context
            currentInstruction = nextGame.instruction;
            
            // Also refresh menu visuals in background so if they click "Back", it's correct
            if(menuInterface) menuInterface.refreshMenuVisuals();
            
            btn.remove(); // Cleanup button for next reset
        };
    } else {
        // Last game -> Complete
        btn.innerHTML = t.complete;
        btn.onclick = () => {
             btnSfx.play();
             const total = updateScoreDisplay();
             showBadge(total);
        };
    }
    
    container.appendChild(btn);
  };

  // Create Games with Callback
  games.push(createMatchGame(0, 'look', correct, wrong, celebration, wow, (idx, cont) => handleGameComplete(idx, cont)));
  games.push(createMatchGame(1, 'fact', correct, wrong, celebration, wow, (idx, cont) => handleGameComplete(idx, cont)));
  games.push(createMemoryGame(2, celebration, wow, (idx, cont) => handleGameComplete(idx, cont)));
  games.push(createFillNameGame(3, correct, wrong, celebration, wow, (idx, cont) => handleGameComplete(idx, cont)));

  // Show the greeting overlay immediately
  const greetingOverlay = createGreetingOverlay();

  menuInterface = createGameMenuButtons(games, btnSfx);
  const { wrapper, exitBtn } = menuInterface;
  
  const anchor = mindar.addAnchor(0);

  anchor.onTargetFound = () => { 
    if (!hasScanned) {
      // Hide greeting overlay when target is found
      if(greetingOverlay) greetingOverlay.style.display = 'none';
      
      wrapper.style.display = "grid"; 
      exitBtn.style.display = "block"; 
      wrapper.classList.add("animate-pop"); 
      bg.play(); 
      updateScoreDisplay(); 
      hasScanned = true; 
    } 
  };

  await mindar.start();
  renderer.setAnimationLoop(() => renderer.render(scene, camera));
})();
