import { loadAudio } from "../libs/loader.js";

const THREE = window.MINDAR.IMAGE.THREE;

/* =======================
   GLOBAL STATE
======================= */
let hasScanned = false;

/* =======================
   INIT MINDAR
======================= */
const initializeMindAR = () => new window.MINDAR.IMAGE.MindARThree({
  container: document.body,
  imageTargetSrc: "./assets/targets/game.mind"
});

/* =======================
   UTILITY TO SHUFFLE ARRAY
======================= */
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/* =======================
   LOAD AUDIO
======================= */
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
      }, undefined, reject);
    });

    return sound;
  } catch (err) {
    console.error("Failed to load audio:", err);
    return { play: () => {} };
  }
};

/* =======================
   CELEBRATION EFFECT
======================= */
const showCelebration = (parent, sound) => {
  sound.play();
  const confetti = document.createElement("div");
  Object.assign(confetti.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "10000"
  });

  const emojis = ["🎉","✨","🎊","💫"];
  for (let i=0; i<15; i++) {
    const span = document.createElement("span");
    span.innerText = emojis[Math.floor(Math.random()*emojis.length)];
    Object.assign(span.style, {
      position: "absolute",
      top: `${Math.random()*90 + 5}%`,
      left: `${Math.random()*90 + 5}%`,
      fontSize: `${15 + Math.random()*15}px`,
      opacity: Math.random(),
      transform: `rotate(${Math.random()*360}deg)`
    });
    confetti.appendChild(span);
  }

  parent.appendChild(confetti);
  setTimeout(() => parent.removeChild(confetti), 3000);
};

/* =======================
   CREATE GAME 1: MATCH LOOK WITH NAME
======================= */
const createMatchLookGame = (correctSound, wrongSound, celebrationSound) => {
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    display: "flex",
    flexDirection: "row",
    gap: "120px",
    zIndex: "9999",
    justifyContent: "center",
  });

  const creatures = shuffleArray([
    { name: "Dumbo Octopus", scientific: "Grimpoteuthis", src: "dumbo.png" },
    { name: "Gulper Eel", scientific: "Eurypharynx pelecanoides", src: "gulper.png" },
    { name: "Barreleye", scientific: "Macropinna microstoma", src: "barreleye.png" }
  ]);

  // LEFT COLUMN: Images
  const imageContainer = document.createElement("div");
  Object.assign(imageContainer.style, {
    display: "flex",
    flexDirection: "column",
    gap: "35px",
    width: "180px",
    alignItems: "center"
  });

  const boxElements = [];

  creatures.forEach(creature => {
    const box = document.createElement("div");
    box.correct = false;
    Object.assign(box.style, {
      width: "200px",
      height: "130px",
      border: "3px dashed #0ea5e9",
      borderRadius: "16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px",
      background: "rgba(0,0,0,0.4)",
      position: "relative"
    });

    const img = document.createElement("img");
    img.src = creature.src;
    Object.assign(img.style, { width: "100px", marginBottom: "10px" });

    const feedbackText = document.createElement("div");
    Object.assign(feedbackText.style, {
      position: "absolute",
      bottom: "-25px",
      fontSize: "14px",
      fontWeight: "700",
      display: "none"
    });

    box.appendChild(img);
    box.appendChild(feedbackText);

    box.addEventListener("dragover", e => e.preventDefault());
    box.addEventListener("drop", e => {
      e.preventDefault();
      const targetName = e.dataTransfer.getData("name");

      if (targetName === creature.name) {
        if (!box.correct) {
          box.correct = true;
          box.style.border = "3px solid lime";
          feedbackText.style.display = "block";
          feedbackText.style.color = "lime";
          feedbackText.innerText = "✅ Correct!";
          correctSound.play();
        }
      } else {
        feedbackText.style.display = "block";
        feedbackText.style.color = "red";
        feedbackText.innerText = "❌ Try again";
        wrongSound.play();
        setTimeout(() => {
          feedbackText.style.display = "none";
          feedbackText.innerText = "";
        }, 1500);
      }

      if (boxElements.every(b => b.correct)) {
        showCelebration(container, celebrationSound);
      }
    });

    imageContainer.appendChild(box);
    boxElements.push(box);
  });

  // RIGHT COLUMN: Names
  const nameContainer = document.createElement("div");
  Object.assign(nameContainer.style, {
    display: "flex",
    flexDirection: "column",
    gap: "45px",
    width: "260px",
  });

  const nameElements = [];
  shuffleArray(creatures).forEach(creature => {
    const nameDiv = document.createElement("div");
    nameDiv.innerText = `${creature.name} (${creature.scientific})`;
    nameDiv.draggable = true;

    Object.assign(nameDiv.style, {
	width: "200px",
	height: "130px",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: "10px",
	fontSize: "16px",
	fontWeight: "600",
	textAlign: "center",
	borderRadius: "16px",
	cursor: "grab",
	background: "linear-gradient(135deg, #f43f5e, #6366f1)",
	color: "#fff",
	boxShadow: "0 8px 15px rgba(0,0,0,0.3)",
	transition: "transform 0.2s, box-shadow 0.2s"
});

    nameDiv.addEventListener("dragstart", e => e.dataTransfer.setData("name", creature.name));
    nameContainer.appendChild(nameDiv);
    nameElements.push(nameDiv);
  });

  container.appendChild(imageContainer);
  container.appendChild(nameContainer);
  document.body.appendChild(container);
  container.style.display = "none";

  return { container, boxElements, nameElements };
};

/* =======================
   CREATE GAME 2: MATCH FACT
======================= */
const createMatchFactGame = (correctSound, wrongSound, celebrationSound) => {
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    display: "flex",
    flexDirection: "row",
    gap: "100px",
    zIndex: "9999",
    justifyContent: "center",
  });

  const creatures = shuffleArray([
    { name: "Anglerfish", src: "angler.png", fact: "Anglerfish live in the deep sea and use a glowing lure to attract prey." },
    { name: "Blobfish", src: "blob.png", fact: "Blobfish survive extreme pressure in deep waters." },
    { name: "Vampire Squid", src: "vampire.png", fact: "Vampire squid live in oxygen-minimum zones." }
  ]);

  // LEFT: Facts
  const factContainer = document.createElement("div");
  Object.assign(factContainer.style, {
    display: "flex",
    flexDirection: "column",
    gap: "35px",
    width: "260px",
  });

  const factElements = [];
  shuffleArray(creatures).forEach(creature => {
    const factDiv = document.createElement("div");
    factDiv.innerText = creature.fact;
    factDiv.draggable = true;

   Object.assign(factDiv.style, {
  width: "200px",
  height: "130px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px",
  fontSize: "15px",
  fontWeight: "500",
  textAlign: "center",
  borderRadius: "16px",
  cursor: "grab",
  background: "linear-gradient(135deg, #0ea5e9, #facc15)",
  color: "#fff",
  boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
  transition: "transform 0.2s, box-shadow 0.2s"
});
    factDiv.addEventListener("dragstart", e => {
      e.dataTransfer.setData("fact", creature.fact);
      e.dataTransfer.setData("targetName", creature.name);
    });

    factContainer.appendChild(factDiv);
    factElements.push(factDiv);
  });

  // RIGHT: Images
  const imageContainer = document.createElement("div");
  Object.assign(imageContainer.style, {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
    width: "180px",
    alignItems: "center"
  });

  const boxElements = [];
  creatures.forEach(creature => {
    const box = document.createElement("div");
    box.correct = false;
    Object.assign(box.style, {
      width: "200px",
      height: "130px",
      border: "3px dashed #0ea5e9",
      borderRadius: "16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px",
      background: "rgba(0,0,0,0.4)",
      position: "relative"
    });

    const img = document.createElement("img");
    img.src = creature.src;
    Object.assign(img.style, { width: "100px", marginBottom: "10px" });

    const feedbackText = document.createElement("div");
    Object.assign(feedbackText.style, {
      position: "absolute",
      bottom: "-25px",
      fontSize: "14px",
      fontWeight: "700",
      display: "none"
    });

    box.appendChild(img);
    box.appendChild(feedbackText);

    box.addEventListener("dragover", e => e.preventDefault());
    box.addEventListener("drop", e => {
      e.preventDefault();
      const targetName = e.dataTransfer.getData("targetName");

      if (targetName === creature.name) {
        if (!box.correct) {
          box.correct = true;
          box.style.border = "3px solid lime";
          feedbackText.style.display = "block";
          feedbackText.style.color = "lime";
          feedbackText.innerText = "✅ Correct!";
          correctSound.play();
        }
      } else {
        feedbackText.style.display = "block";
        feedbackText.style.color = "red";
        feedbackText.innerText = "❌ Try again";
        wrongSound.play();
        setTimeout(() => {
          feedbackText.style.display = "none";
          feedbackText.innerText = "";
        }, 1500);
      }

      if (boxElements.every(b => b.correct)) {
        showCelebration(container, celebrationSound);
      }
    });

    imageContainer.appendChild(box);
    boxElements.push(box);
  });

  container.appendChild(factContainer);
  container.appendChild(imageContainer);
  document.body.appendChild(container);
  container.style.display = "none";

  return { container, boxElements, factElements };
};

/* =======================
   GAME MENU BUTTONS WITH BACK & RESET
======================= */
const createGameMenuButtons = (games) => {
  const wrapper = document.createElement("div");
  Object.assign(wrapper.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    gap: "40px",
    zIndex: "9999",
  });

  // BACK BUTTON
  const backBtn = document.createElement("button");
  backBtn.innerText = "← Back";
  Object.assign(backBtn.style, {
    position: "absolute",
    top: "60px",
    left: "10px",
    padding: "12px 22px",
    fontSize: "16px",
    fontWeight: "700",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background:"linear-gradient(135deg, #0ea5e9, #6366f1)",
    color: "#ffffff",
    display: "none",
    zIndex: "10000",
    boxShadow: "0 8px 20px rgba(14,165,233,0.6)",
  });
  document.body.appendChild(backBtn);

  // RESET BUTTON
  const globalResetBtn = document.createElement("button");
  globalResetBtn.innerText = "Reset All Games";
  Object.assign(globalResetBtn.style, {
    position: "absolute",
    top: "60px",
    right: "10px",
    padding: "12px 18px",
    fontSize: "16px",
    borderRadius: "12px",
    cursor: "pointer",
    background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
    color: "#ffffff",
    border: "none",
    zIndex: "10000",
    display: "none",
    boxShadow: "0 8px 20px rgba(14,165,233,0.6)",
  });
  document.body.appendChild(globalResetBtn);

  backBtn.addEventListener("click", () => {
    games.forEach(g => g.container.style.display = "none");
    wrapper.style.display = "flex";
    backBtn.style.display = "none";
    globalResetBtn.style.display = "none";
  });

  globalResetBtn.addEventListener("click", () => {
    [game1, game2].forEach(game => {
      if (game.container.style.display === "flex") { // hanya reset game aktif
        game.boxElements.forEach(box => {
          box.correct = false;
          box.style.border = "3px dashed #0ea5e9";
          const feedback = box.lastChild;
          feedback.style.display = "none";
          feedback.innerText = "";
        });

        if (game.nameElements) { // Game 1
          shuffleArray(game.nameElements).forEach(el => game.container.children[1].appendChild(el));
        }
        if (game.factElements) { // Game 2
          shuffleArray(game.factElements).forEach(el => game.container.children[0].appendChild(el));
        }
      }
    });
  });

  games.forEach(game => {
    const btn = document.createElement("button");

    Object.assign(btn.style, {
      width: "220px",
      height: "260px",
      borderRadius: "26px",
      border: "1px solid rgba(255,255,255,0.25)",
      background: "linear-gradient(145deg, rgba(14,165,233,0.95), rgba(99,102,241,0.95))",
      backdropFilter: "blur(8px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      cursor: "pointer",
      color: "#fff",
      transition: "all 0.25s ease",
      position: "relative",
      overflow: "hidden",
    });

    const glow = document.createElement("div");
    Object.assign(glow.style, {
      position: "absolute",
      inset: "0",
      background: "radial-gradient(circle at top, rgba(255,255,255,0.35), transparent 60%)",
      opacity: "0",
      transition: "opacity 0.25s ease",
      pointerEvents: "none",
    });

    const img = document.createElement("img");
    img.src = game.image;
    Object.assign(img.style, {
      width: "110px",
      height: "110px",
      objectFit: "contain",
      filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.45))",
    });

    const label = document.createElement("div");
    label.innerText = game.label;
    Object.assign(label.style, {
      fontSize: "20px",
      fontWeight: "700",
      textAlign: "center",
      textShadow: "0 4px 10px rgba(0,0,0,0.45)",
      letterSpacing: "0.5px",
    });

    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "translateY(-10px) scale(1.05)";
      glow.style.opacity = "1";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translateY(0) scale(1)";
      glow.style.opacity = "0";
    });

    btn.addEventListener("click", () => {
      wrapper.style.display = "none";
      game.container.style.display = "flex";
      backBtn.style.display = "block";
      globalResetBtn.style.display = "block";
    });

    btn.appendChild(glow);
    btn.appendChild(img);
    btn.appendChild(label);
    wrapper.appendChild(btn);
  });

  document.body.appendChild(wrapper);
};

/* =======================
   DOM READY
======================= */
document.addEventListener("DOMContentLoaded", async () => {
  const mindarThree = initializeMindAR();
  const { renderer, scene, camera } = mindarThree;

  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const anchor = mindarThree.addAnchor(0);

  // audio
  const bgAudio = await loadAudioFile("bg-audio.mp3", camera);
  const correctSound = await loadAudioFile("correct.mp3", camera, false, false);
  const wrongSound = await loadAudioFile("wrong.mp3", camera, false, false);
  const celebrationSound = await loadAudioFile("wow.mp3", camera, false, false);

  // create games
  window.game1 = createMatchLookGame(correctSound, wrongSound, celebrationSound);
  window.game2 = createMatchFactGame(correctSound, wrongSound, celebrationSound);

  // menu buttons with images
  createGameMenuButtons([
    { label: "Match Look with Name", container: game1.container, image: "dumbo.png" },
    { label: "Match Fact", container: game2.container, image: "angler.png" }
  ]);

  anchor.onTargetFound = () => {
    console.log("✅ TARGET FOUND");
    if (!hasScanned) {
      hasScanned = true;
      bgAudio.play();
    }
  };
  anchor.onTargetLost = () => console.log("⚠️ TARGET LOST (game stays)");

  await mindarThree.start();
  renderer.setAnimationLoop(() => renderer.render(scene, camera));
});
