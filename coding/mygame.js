// Access the global THREE object provided by the MindAR script
const THREE = window.MINDAR.IMAGE.THREE;

/* ==========================================================
   0. LANGUAGE SETTINGS
   ========================================================== */
const urlParams = new URLSearchParams(window.location.search);
const paramLang = urlParams.get('lang');
let savedLang = localStorage.getItem('siteLang');
const currentLang = (paramLang === 'my' || savedLang === 'my') ? 'my' : 'en';

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
      look: "DRAG the name tag and DROP it onto the correct creature's image.",
      fact: "DRAG the fact card and DROP it onto the creature it describes.",
      memory: "Tap the cards to flip them. Find all matches!",
      name: "Look at the images and TYPE their correct names."
    },
    creatures: {
      "Dumbo Octopus": "Dumbo Octopus", "Gulper Eel": "Gulper Eel", "Barreleye": "Barreleye",
      "Anglerfish": "Anglerfish", "Blobfish": "Blobfish", "Vampire Squid": "Vampire Squid"
    },
    facts: {
      "Anglerfish": "Uses a glowing lure to attract prey.",
      "Blobfish": "Has gelatinous skin to survive pressure.",
      "Vampire Squid": "Lives in oxygen-minimum zones."
    },
    cardBackTitle: "INTO THE ABYSS",
    cardBackSubtitle: "exploring the depth",
    placeholder: "Type name..."
  },
  my: {
    langBtn: "Switch to English 🇬🇧",
    greetingTitle: "Permainan Laut Dalam 🐙",
    greetingText: "Selamat Datang! Selesaikan satu permainan untuk buka seterusnya.<br>Skor 100+ untuk Lencana Emas! 🏆",
    scanTitle: "IMBAS PENANDA",
    scanText: "Halakan kamera pada imej sasaran untuk mula.",
    howToPlay: "Cara Bermain",
    gotIt: "Faham!",
    menu: "← Menu",
    reset: "Ulang",
    instructionBtn: "❓ Arahan",
    exit: "KELUAR",
    locked: "Terkunci",
    nextGame: "SETERUSNYA ➡",
    complete: "SELESAI ✅",
    badgeUnlocked: "LENCANA DIPEROLEH!",
    gameOver: "TAMAT PERMAINAN",
    badgeMsgWin: "Anda Peneroka Laut Dalam sejati!",
    badgeMsgLose: "Ulang semula untuk cuba lagi!",
    finalScore: "Markah Akhir:",
    close: "Tutup",
    gameTitles: ["Padan Rupa", "Padan Fakta", "Ingatan", "Nama Makhluk"],
    instructions: {
      look: "HERET tanda nama dan LEPASKAN ke atas gambar yang betul.",
      fact: "HERET kad fakta dan LEPASKAN ke atas makhluk yang betul.",
      memory: "Ketuk kad dan cari pasangan yang sama!",
      name: "Lihat gambar dan TAIP nama yang betul."
    },
    creatures: {
      "Dumbo Octopus": "Sotong Dumbo", "Gulper Eel": "Belut Gulper", "Barreleye": "Barreleye",
      "Anglerfish": "Ikan Angler", "Blobfish": "Ikan Blob", "Vampire Squid": "Sotong Vampire"
    },
    facts: {
      "Anglerfish": "Guna umpan bercahaya untuk tarik mangsa.",
      "Blobfish": "Kulit seperti jeli untuk tahan tekanan.",
      "Vampire Squid": "Hidup di zon kurang oksigen."
    },
    cardBackTitle: "LAUT DALAM",
    cardBackSubtitle: "meneroka misteri",
    placeholder: "Taip nama..."
  }
};

const t = translations[currentLang];

/* ==========================================================
   1. INJECT RESPONSIVE CSS
   ========================================================== */
const style = document.createElement('style');
style.innerHTML = `
  :root {
    --deep-navy: #020617;
    --bio-cyan: #0ea5e9;
    --btn-gradient: linear-gradient(145deg, #020617, #075985);
  }

  /* Global Panel Control */
  .glass-panel {
    background: rgba(2, 6, 23, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(14, 165, 233, 0.4);
    border-radius: 20px;
    color: white;
    font-family: 'Poppins', sans-serif;
    width: 90vw;
    max-width: 600px;
    max-height: 85vh;
    overflow-y: auto;
    padding: 20px;
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
  }

  /* Responsive Game Container (Flexbox) */
  .game-flex-container {
    display: flex;
    flex-direction: row; /* Desktop default */
    gap: 20px;
    justify-content: space-between;
    align-items: center;
  }

  /* Navigation Buttons */
  .nav-btn {
    padding: 10px 15px;
    border-radius: 10px;
    border: 1px solid var(--bio-cyan);
    background: var(--btn-gradient);
    color: white;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    z-index: 10000;
  }

  .sea-card {
    background: linear-gradient(135deg, #0f172a, #1e293b);
    border: 1px solid var(--bio-cyan);
    padding: 15px;
    border-radius: 15px;
    text-align: center;
    font-size: 14px;
    cursor: grab;
    width: 100%;
  }

  .creature-box {
    width: 180px;
    height: 130px;
    border: 2px dashed var(--bio-cyan);
    border-radius: 15px;
    overflow: hidden;
    position: relative;
    background: rgba(0,0,0,0.3);
  }

  .score-board {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(2, 6, 23, 0.85);
    border: 2px solid #FFD700;
    color: #FFD700;
    padding: 10px 20px;
    border-radius: 50px;
    font-weight: 800;
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* MOBILE RESPONSIVE FIX */
  @media (max-width: 600px) {
    .game-flex-container {
      flex-direction: column; /* Stack vertically on phone */
    }
    .creature-box {
      width: 140px;
      height: 100px;
    }
    .sea-card {
      font-size: 12px;
      padding: 10px;
    }
    .nav-btn {
      padding: 6px 10px;
      font-size: 11px;
    }
    #menu-wrapper {
       grid-template-columns: repeat(2, 1fr) !important;
       gap: 10px !important;
    }
  }
`;
document.head.appendChild(style);

const scoreBoard = document.createElement("div");
scoreBoard.className = "score-board";
scoreBoard.id = "score-display";
scoreBoard.innerHTML = `<span>🏆</span> <span id="score-val">0 / 160</span>`;
document.body.appendChild(scoreBoard);

/* ==========================================================
   2. GLOBAL STATE & LOGIC
   ========================================================== */
const gameState = {
  scores: { 0: 0, 1: 0, 2: 0, 3: 0 },
  unlocked: { 0: true, 1: true, 2: true, 3: true }
};

const updateScoreDisplay = () => {
  const total = Object.values(gameState.scores).reduce((a, b) => a + b, 0);
  document.getElementById('score-val').innerText = `${total} / 160`;
};

/* ==========================================================
   3. GAME BUILDERS
   ========================================================== */
const createMatchGame = (gameId, type, onComplete) => {
  const container = document.createElement("div");
  container.className = "glass-panel";
  
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "game-flex-container";

  const data = type === 'look' 
    ? [{ name: t.creatures["Dumbo Octopus"], id: "Dumbo Octopus", src: "dumbo.png" }, { name: t.creatures["Anglerfish"], id: "Anglerfish", src: "angler.png" }]
    : [{ info: t.facts["Anglerfish"], id: "Anglerfish", src: "angler.png" }, { info: t.facts["Blobfish"], id: "Blobfish", src: "blob.png" }];

  const reset = () => {
    contentWrapper.innerHTML = "";
    const leftCol = document.createElement("div");
    leftCol.style.cssText = "display:flex; flex-direction:column; gap:10px; width:100%";
    
    const rightCol = document.createElement("div");
    rightCol.style.cssText = "display:flex; flex-wrap:wrap; gap:10px; justify-content:center";

    data.forEach(item => {
      const card = document.createElement("div");
      card.className = "sea-card";
      card.innerText = type === 'look' ? item.name : item.info;
      card.draggable = true;
      card.addEventListener("dragstart", e => e.dataTransfer.setData("id", item.id));
      leftCol.appendChild(card);
    });

    data.forEach(item => {
      const b = document.createElement("div");
      b.className = "creature-box";
      const img = document.createElement("img");
      img.src = `./coding/${item.src}`; 
      img.style.cssText = "width:100%; height:100%; object-fit:cover";
      b.appendChild(img);
      b.addEventListener("dragover", e => e.preventDefault());
      b.addEventListener("drop", e => {
        if(e.dataTransfer.getData("id") === item.id) {
          b.style.border = "3px solid #22c55e";
          gameState.scores[gameId] += 10;
          updateScoreDisplay();
        }
      });
      rightCol.appendChild(b);
    });
    contentWrapper.appendChild(leftCol);
    contentWrapper.appendChild(rightCol);
    container.appendChild(contentWrapper);
  };

  reset();
  document.body.appendChild(container);
  container.style.display = "none";
  return { container, reset };
};

/* ==========================================================
   4. MENU INITIALIZATION
   ========================================================== */
const init = () => {
  const game1 = createMatchGame(0, 'look');
  
  const wrapper = document.createElement("div");
  wrapper.id = "menu-wrapper";
  wrapper.className = "glass-panel";
  Object.assign(wrapper.style, {
    display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px"
  });

  t.gameTitles.forEach((title, i) => {
    const btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.style.height = "120px";
    btn.innerHTML = `<div>🌊</div>${title}`;
    btn.onclick = () => {
      wrapper.style.display = "none";
      game1.container.style.display = "block";
    };
    wrapper.appendChild(btn);
  });

  document.body.appendChild(wrapper);
  
  // Navigation Buttons (Menu & Exit)
  const navTop = document.createElement("div");
  navTop.style.cssText = "position:fixed; top:20px; left:20px; display:flex; gap:10px; z-index:10001";
  
  const menuBtn = document.createElement("button");
  menuBtn.className = "nav-btn";
  menuBtn.innerText = t.menu;
  menuBtn.onclick = () => location.reload();

  navTop.appendChild(menuBtn);
  document.body.appendChild(navTop);
};

// Start the game
init();
