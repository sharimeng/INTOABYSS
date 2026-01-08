 import { loadAudio } from "../libs/loader.js";
import { DRACOLoader } from "../libs/three.js-r132/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "../libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js";

const THREE = window.MINDAR.IMAGE.THREE;

// -----------------------------------------------------------------------------
// 1. DATA CONFIGURATION
// -----------------------------------------------------------------------------

const modelNames = ["Barreleye","Blobfish","Atolla Jellyfish","Dumbo Octopus","Gulper Eel",
  "Yeti Crab","Vampire Squid","Deep-sea Shark","Anglerfish","Sea Angel"];

const factData = [
  ["Barreleye has tubular eyes.", "Can rotate eyes for vision.", "Lives at 600–800m."],
  ["Blobfish It has no muscles! It lets the ocean do the work while it relaxes.", "Jelly-like body.", "Feeds on edible matter from sea floor."],
  ["Atolla Jellyfish Its blinking light trick is called the'burglar alarm' strategy.", "Deep sea predator.", "Uses flashing lights to distract prey."],
  ["Dumbo Octopus It lives so deep that it doesn’t even need  ink.", "Has ear-like fins.", "Feeds on small crustaceans."],
  ["Gulper Eel  It can unhinge its jaw like a pelican .", "has a glowing tip on its tail."],
  ["Yeti Crab lives at hydrothermal vents.", "Has hairy pincers.", "it has no eyes."],
  ["Vampire Squid Despite the name, it doesn’t drink blood.", "it eats drifting bits of ocean.", "Produces bioluminescent mucus."],
  ["Megamouth Shark It was only discovered in 1976.", "fewer than 100 have ever been seen."],
  ["Anglerfish  The male anglerfish is super tiny.", "fuses to the female like a living attachment for life!.", "Uses bioluminescent lure."],
  ["Sea Angel It hunts seabutterflies.", "Has transparent body.", "canout swim much bigger animals."],
];

const dialogData = [
  // 1. Barreleye
  ["My head is see-through!", "Look at my green glowing eyes!", "I can see things above me without moving!"],
  // 2. Blobfish
  ["I'm not ugly, I'm just relaxed!", "It's hard work doing nothing.", "Please don't turn me into a meme."],
  // 3. Atolla
  ["Flash! Did I scare you?", "I'm the alarm of the sea!", "My lights confuse predators!"],
  // 4. Dumbo
  ["I fly through the water with my ears!", "Don't I look like a cute elephant?", "I live deeper than almost anyone."],
  // 5. Gulper
  ["I can swallow things bigger than me!", "My mouth is huge!", "Check out the light on my tail."],
  // 6. Yeti Crab
  ["I grow my own food on my arms!", "It's nice and warm by the vents.", "I'm fuzzy but I'm not a pet!"],
  // 7. Vampire Squid
  ["I don't drink blood, I eat ocean snow!", "I can turn myself inside out!", "Look at my glowing tips!"],
  // 8. Megamouth Shark
  ["I swim with my mouth wide open!", "I'm a gentle giant.", "I have glowing lips to attract snacks!"],
  // 9. Anglerfish
  ["Come closer to my little light...", "I'm a patient hunter.", "My teeth are translucent!"],
  // 10. Sea Angel
  ["I'm a swimming snail without a shell!", "I may look like an angel, but I'm a predator.", "Watch me dance!"]
];

// -----------------------------------------------------------------------------
// 2. SETUP FUNCTIONS
// -----------------------------------------------------------------------------

const initializeMindAR = () => new window.MINDAR.IMAGE.MindARThree({
  container: document.body,
  imageTargetSrc: '../assets/targets/targets.mind',
});

const configureGLTFLoader = () => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('../libs/draco/');
  loader.setDRACOLoader(dracoLoader);
  return loader;
};

const loadModel = async (path, scale=[1,1,1]) => {
  const loader = configureGLTFLoader();
  const model = await loader.loadAsync(path);
  
  model.scene.scale.set(scale[0], scale[1], scale[2]);
  model.scene.position.set(0, 0, 0); 
  
  // Emission Setup
  model.userData.emissiveMeshes = [];
  model.userData.currentIntensity = 0.2; 
  model.userData.targetIntensity = 0.2;

  model.scene.traverse((child) => {
    if (child.isMesh) {
      child.geometry.computeBoundingBox();
      if (child.material) {
        if (child.material.emissiveMap || (child.material.emissive && child.material.emissive.getHex() > 0)) {
            child.material.emissiveIntensity = 0.2; 
            model.userData.emissiveMeshes.push(child);
        }
      }
    }
  });
  return model;
};

const loadAndConfigureAudio = async (path, camera) => {
  const audioLoader = new THREE.AudioLoader();
  const listener = new THREE.AudioListener();
  camera.add(listener);
  const sound = new THREE.PositionalAudio(listener);
  await new Promise((resolve, reject) => {
    audioLoader.load(path, buffer => {
      sound.setBuffer(buffer);
      sound.setRefDistance(1);
      resolve(sound);
    }, undefined, reject);
  });
  return sound;
};

// -----------------------------------------------------------------------------
// 3. ADVANCED DIALOG SYSTEM (Fixed Height: 2.5)
// -----------------------------------------------------------------------------

// Global state for the active bubble
let activeBubble = {
    element: null,
    model: null,
    offsetY: 0,
    typewriterTimer: null,
    timeoutTimer: null
};

// Function to Create/Get the Bubble Element
const getBubbleElement = () => {
    let bubble = document.getElementById("ar-bubble");
    if (!bubble) {
        bubble = document.createElement("div");
        bubble.id = "ar-bubble";
        Object.assign(bubble.style, {
            position: "absolute", 
            width: "220px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: "12px 18px",
            borderRadius: "15px",
            color: "#0f172a",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "14px",
            fontWeight: "600",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            opacity: "0",
            pointerEvents: "none",
            transform: "translate(-50%, -100%)",
            transition: "opacity 0.2s ease-out",
            zIndex: "10000",
            border: "2px solid #0ea5e9",
            whiteSpace: "pre-wrap"
        });
        
        // Add a little triangle "tail"
        const tail = document.createElement("div");
        Object.assign(tail.style, {
            position: "absolute",
            bottom: "-6px", left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
            width: "12px", height: "12px",
            backgroundColor: "white",
            borderRight: "2px solid #0ea5e9",
            borderBottom: "2px solid #0ea5e9"
        });
        bubble.appendChild(tail);
        
        const textSpan = document.createElement("span");
        textSpan.id = "ar-bubble-text";
        bubble.appendChild(textSpan);

        document.body.appendChild(bubble);
    }
    return bubble;
};

const showAdvancedDialog = (modelIndex, modelScene, clickSound) => {
    const bubble = getBubbleElement();
    const textSpan = document.getElementById("ar-bubble-text");

    const options = dialogData[modelIndex];
    const textToType = options[Math.floor(Math.random() * options.length)];

    if (activeBubble.typewriterTimer) clearInterval(activeBubble.typewriterTimer);
    if (activeBubble.timeoutTimer) clearTimeout(activeBubble.timeoutTimer);
    
    if (clickSound && !clickSound.isPlaying) {
        clickSound.setPlaybackRate(1.2); 
        clickSound.play();
    }

    activeBubble.element = bubble;
    activeBubble.model = modelScene;
    
    // --- HEIGHT ADJUSTMENT ---
    // Increased to 2.5 (from 1.5) to clear tall models
    activeBubble.offsetY = 2.5; 

    bubble.style.opacity = "1";
    textSpan.textContent = ""; 
    let i = 0;
    
    activeBubble.typewriterTimer = setInterval(() => {
        const char = textToType.charAt(i);
        textSpan.textContent += char;
        i++;
        if (i >= textToType.length) {
            clearInterval(activeBubble.typewriterTimer);
        }
    }, 30); 

    activeBubble.timeoutTimer = setTimeout(() => {
        bubble.style.opacity = "0";
        activeBubble.model = null; 
    }, 4000);
};

// -----------------------------------------------------------------------------
// 4. ANIMATION & INTERACTION
// -----------------------------------------------------------------------------

const playSpecificAnimation = (modelData, type) => {
    const { mixer, actions, activeAction } = modelData.userData;
    const targetAction = actions[type];

    if (!targetAction) return;

    modelData.userData.targetIntensity = 4.0; 

    const idleAnim = actions.idle;
    if (activeAction === targetAction && targetAction.isRunning()) return;

    targetAction.reset();
    targetAction.setLoop(THREE.LoopOnce);
    targetAction.clampWhenFinished = true; 

    if (activeAction) activeAction.crossFadeTo(targetAction, 0.5, true);
    targetAction.play();
    modelData.userData.activeAction = targetAction;

    const onFinished = (e) => {
        if (e.action === targetAction) {
            mixer.removeEventListener('finished', onFinished);
            modelData.userData.targetIntensity = 0.2; 

            if (idleAnim) {
                targetAction.crossFadeTo(idleAnim, 0.5, true);
                idleAnim.reset();
                idleAnim.play();
                modelData.userData.activeAction = idleAnim;
            }
        }
    };
    mixer.addEventListener('finished', onFinished);
};

const setupTapInteraction = (camera, models, clickSound) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let tapTimer = null; let isPointerDown = false; let startX = 0; let startY = 0;

    const triggerInteraction = (clientX, clientY, interactionType) => {
        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        for (let i = 0; i < models.length; i++) {
            const modelGroup = models[i].scene;
            if (modelGroup.visible) {
                const intersects = raycaster.intersectObjects(modelGroup.children, true);
                if (intersects.length > 0) {
                    if (interactionType === 'single') {
                        showAdvancedDialog(i, modelGroup, clickSound);
                        playSpecificAnimation(models[i], 'action');
                    } else {
                        playSpecificAnimation(models[i], 'interact');
                    }
                    break; 
                }
            }
        }
    };

    const handleTap = (clientX, clientY) => {
        if (tapTimer === null) {
            tapTimer = setTimeout(() => {
                tapTimer = null; triggerInteraction(clientX, clientY, 'single');
            }, 300); 
        } else {
            clearTimeout(tapTimer); tapTimer = null; triggerInteraction(clientX, clientY, 'double');
        }
    };

    window.addEventListener('pointerdown', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        isPointerDown = true; startX = e.clientX; startY = e.clientY;
    });
    window.addEventListener('pointerup', (e) => {
        if (!isPointerDown) return; isPointerDown = false;
        const diffX = Math.abs(e.clientX - startX); const diffY = Math.abs(e.clientY - startY);
        if (diffX < 5 && diffY < 5) handleTap(e.clientX, e.clientY);
    });
};

const enableZoomRotate = (camera, model) => {
  let isDragging = false; let prevPosition = { x: 0, y: 0 };
  let initialPinchDistance = null; let initialScale = model.scene.scale.x; 

  const handleStart = (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    if (e.touches && e.touches.length === 1) {
      isDragging = true; prevPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches && e.touches.length === 2) {
      isDragging = false; 
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
      initialScale = model.scene.scale.x; 
    } else if (e.type === "mousedown") {
      isDragging = true; prevPosition = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMove = (e) => {
    if (isDragging && (e.type === "mousemove" || (e.touches && e.touches.length === 1))) {
      const current = e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
      const delta = { x: current.x - prevPosition.x, y: current.y - prevPosition.y };
      model.scene.rotation.y += delta.x * 0.01; model.scene.rotation.x += delta.y * 0.01;
      prevPosition = current;
    } else if (e.touches && e.touches.length === 2 && initialPinchDistance) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const scaleRatio = currentDistance / initialPinchDistance;
      let newScale = initialScale * scaleRatio;
      newScale = Math.min(Math.max(newScale, 0.05), 3.0);
      model.scene.scale.set(newScale, newScale, newScale);
    }
  };
  const handleEnd = () => { isDragging = false; initialPinchDistance = null; };

  window.addEventListener("mousedown", handleStart); window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleEnd); window.addEventListener("touchstart", handleStart, { passive: false });
  window.addEventListener("touchmove", handleMove, { passive: false }); window.addEventListener("touchend", handleEnd);
  window.addEventListener("wheel", (e) => {
    let s = model.scene.scale.x; s += e.deltaY * -0.001; s = Math.min(Math.max(s, 0.05), 3.0);
    model.scene.scale.set(s, s, s);
  });
};

const createFactButton = (anchorId, clickSound) => {
  const btn = document.createElement("button");
  btn.innerText = "📘 INTERESTING FACT ✨";
  Object.assign(btn.style,{
    position:"absolute", bottom:"25px", left:"40%", transform:"translateX(-50%)",
    padding:"10px 20px", fontSize:"13px", borderRadius:"20px", border:"none",
    background:"#0ea5e9", color:"#fff", fontWeight:"600", cursor:"pointer",
    display:"none", zIndex:"9999", boxShadow:"0 6px 18px rgba(0,0,0,0.3)"
  });
  document.body.appendChild(btn);
  let factBox = null;
  btn.addEventListener("click", ()=>{
    clickSound.setPlaybackRate(0.7); clickSound.play();
    if(factBox){ factBox.remove(); factBox=null; return; }
    factBox = document.createElement("div");
    Object.assign(factBox.style,{
      position:"absolute", bottom:"85px", left:"50%", transform:"translateX(-50%)",
      width:"88%", maxWidth:"420px", padding:"24px", borderRadius:"20px",
      background:"rgba(10,20,40,0.6)", color:"#e0f2fe", fontFamily:"Poppins, sans-serif",
      zIndex:"9998", boxShadow:"0 20px 50px rgba(0,0,0,0.6)"
    });
    const ul=document.createElement("ul");
    factData[anchorId].forEach(f=>{ const li=document.createElement("li"); li.innerText=f; li.style.marginBottom="8px"; ul.appendChild(li); });
    factBox.appendChild(ul); document.body.appendChild(factBox);
  });
  return btn;
};

// -----------------------------------------------------------------------------
// 5. MAIN EXECUTION
// -----------------------------------------------------------------------------

const createDeepSeaParticles = (scene) => {
    const geometry = new THREE.BufferGeometry();
    const count = 500;
    const positions = new Float32Array(count * 3);
    for(let i=0; i<count * 3; i++) positions[i] = (Math.random() - 0.5) * 15; 
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0x44aaee, size: 0.03, transparent: true, opacity: 0.6, sizeAttenuation: true });
    const particles = new THREE.Points(geometry, material); scene.add(particles);
    return particles;
};

const createBubbles = (scene) => {
    const bubbles = [];
    const geometry = new THREE.SphereGeometry(0.08, 16, 16); 
    const material = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.1, transmission: 0.9, transparent: true, opacity: 0.6 });
    for(let i = 0; i < 20; i++) {
        const bubble = new THREE.Mesh(geometry, material);
        bubble.position.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
        bubble.userData = { speed: 0.01 + Math.random() * 0.02, wobble: Math.random() * Math.PI * 2 };
        scene.add(bubble); bubbles.push(bubble);
    }
    return bubbles;
};

const createPersistentInstruction = () => {
  const instructionBox = document.createElement("div");
  Object.assign(instructionBox.style, {
    position: "absolute", top: "80px", right: "10px", width: "200px", padding: "15px", borderRadius: "12px",
    background: "rgba(0, 0, 0, 0.5)", color: "#ffffff", fontFamily: "Poppins, sans-serif", fontSize: "13px",
    lineHeight: "1.4", zIndex: "9998", backdropFilter: "blur(4px)", border: "1px solid rgba(255, 255, 255, 0.2)", pointerEvents: "none" 
  });
  instructionBox.innerHTML = `
    <div style="margin-bottom: 8px; font-weight: bold; color: #0ea5e9;">👆 INTERACTION</div>
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;"><span>Tap 1x:</span><span style="opacity:0.8">Action + Talk</span></div>
    <div style="display:flex; align-items:center; gap:8px;"><span>Tap 2x:</span><span style="opacity:0.8">Interact</span></div>
    <div style="display:flex; align-items:center; gap:8px; margin-top:4px; font-size:11px; opacity:0.7"><span>🤏 Pinch to Zoom | 👆 Drag to Rotate</span></div>
  `;
  document.body.appendChild(instructionBox);
};

document.addEventListener("DOMContentLoaded", async()=>{
  const mindarThree = initializeMindAR();
  const {renderer, scene, camera}=mindarThree;
  
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8; 
  renderer.clock=new THREE.Clock();

  const ambientLight = new THREE.AmbientLight(0x001e36, 1.5); 
  const directionalLight = new THREE.DirectionalLight(0x00faac, 1.5); 
  directionalLight.position.set(1,2,3);
  scene.add(ambientLight,directionalLight);

  const particles = createDeepSeaParticles(scene);
  const bubbles = createBubbles(scene);

  const modelScales=[ [0.3,0.3,0.3], [0.3,0.3,0.3], [0.4,0.4,0.4], [0.3,0.3,0.3], [0.2,0.2,0.2], [0.1,0.1,0.1], [0.05,0.05,0.05], [0.3,0.3,0.3], [0.2,0.2,0.2], [0.15,0.15,0.15] ];
  const models = await Promise.all(modelNames.map((_,i)=>loadModel(`../assets/models/${i+1}.glb`, modelScales[i])));

  const bgAudios = await Promise.all(new Array(10).fill('../coding/bg-audio.mp3').map(p=>loadAndConfigureAudio(p,camera)));
  const narrationPaths = modelNames.map((_,i)=>`../assets/audio/english/${i+1}.mp3`);
  const narrationAudios = await Promise.all(narrationPaths.map(p=>loadAndConfigureAudio(p,camera)));
  const clickSound = await loadAndConfigureAudio('../coding/button.mp3', camera);

  setupTapInteraction(camera, models, clickSound); 

  const mixers = models.map((model,i)=>{
    const anchor=mindarThree.addAnchor(i);
    anchor.group.add(model.scene);
    model.scene.visible=false;
    bgAudios[i].setLoop(true);

    const factBtn=createFactButton(i, clickSound);
    const narrationBtn=document.createElement("button");
    narrationBtn.innerText=`${modelNames[i]} Narration`;
    Object.assign(narrationBtn.style,{
      position:"absolute", bottom:"25px", left:`calc(33% + 180px)`,
      padding:"10px 18px", fontSize:"13px", borderRadius:"20px", border:"none",
      background:"#14b8a6", color:"#fff", fontWeight:"600", cursor:"pointer",
      display:"none", zIndex:"9999", boxShadow:"0 6px 18px rgba(0,0,0,0.3)"
    });
    document.body.appendChild(narrationBtn);

    narrationBtn.addEventListener("click", ()=>{
      clickSound.setPlaybackRate(0.7); clickSound.play();
      if(narrationAudios[i].isPlaying) narrationAudios[i].pause();
      else narrationAudios[i].play();
    });

    const mixer = new THREE.AnimationMixer(model.scene);
    model.userData.mixer = mixer;
    model.userData.actions = {};

    let idleClip = model.animations.find(c => c.name.match(/idle/i));
    let actionClip = model.animations.find(c => c.name.match(/action/i));
    let interactClip = model.animations.find(c => c.name.match(/interact/i));
    if (!idleClip && model.animations.length > 0) idleClip = model.animations[0];

    if (idleClip) {
        const action = mixer.clipAction(idleClip);
        action.play();
        model.userData.actions.idle = action;
        model.userData.activeAction = action; 
    }
    if (actionClip) model.userData.actions.action = mixer.clipAction(actionClip);
    if (interactClip) model.userData.actions.interact = mixer.clipAction(interactClip);

    anchor.onTargetFound=()=>{
      model.scene.visible=true;
      factBtn.style.display="block";
      narrationBtn.style.display="block";
      if(!bgAudios[i].isPlaying) bgAudios[i].play();
    };
    anchor.onTargetLost=()=>{
      model.scene.visible=false;
      factBtn.style.display="none";
      narrationBtn.style.display="none";
      if (activeBubble.model === model.scene) {
          activeBubble.element.style.opacity = "0";
          activeBubble.model = null;
      }
      if(bgAudios[i].isPlaying) bgAudios[i].pause();
      if(narrationAudios[i].isPlaying) narrationAudios[i].pause();
    };

    enableZoomRotate(camera, model);
    return mixer;
  });

  const audioBtn=document.createElement("div");
  audioBtn.innerText='🔇';
  Object.assign(audioBtn.style,{ position:'absolute', top:'10px', right:'10px', fontSize:'50px', cursor:'pointer', zIndex:'9999' });
  document.body.appendChild(audioBtn);
  let isPlaying=false;
  audioBtn.addEventListener("click",()=>{
    isPlaying=!isPlaying;
    bgAudios.forEach(a=>{ if(isPlaying){ if(!a.isPlaying)a.play(); } else{ if(a.isPlaying)a.pause(); } });
    audioBtn.innerText = isPlaying?'🔊':'🔇';
  });

  createPersistentInstruction();
  const backBtn=document.createElement("a");
  backBtn.innerHTML="&#11013;"; backBtn.href="instructions-en.html";
  Object.assign(backBtn.style,{ position:"absolute", top:"10px", left:"10px", fontSize:"70px", fontWeight:"bold", textDecoration:"none", color:"black", cursor:"pointer", zIndex:"9999" });
  document.body.appendChild(backBtn);

  const tempVector = new THREE.Vector3();

  await mindarThree.start();
  renderer.setAnimationLoop(()=>{
    const delta=renderer.clock.getDelta();
    
    // Environment
    if(particles) { particles.rotation.y += delta * 0.05; particles.position.y += Math.sin(renderer.clock.elapsedTime) * 0.002; }
    if(bubbles) {
        bubbles.forEach(bubble => {
            bubble.position.y += bubble.userData.speed;
            bubble.position.x += Math.sin(renderer.clock.elapsedTime + bubble.userData.wobble) * 0.002;
            if(bubble.position.y > 4) { bubble.position.y = -3; bubble.position.x = (Math.random() - 0.5) * 5; }
        });
    }

    // UPDATE DIALOG BUBBLE POSITION
    if (activeBubble.model && activeBubble.model.visible) {
        activeBubble.model.updateMatrixWorld();
        tempVector.setFromMatrixPosition(activeBubble.model.matrixWorld);
        tempVector.y += activeBubble.offsetY; 
        tempVector.project(camera);
        const x = (tempVector.x * .5 + .5) * window.innerWidth;
        const y = (-(tempVector.y * .5) + .5) * window.innerHeight;
        activeBubble.element.style.left = `${x}px`;
        activeBubble.element.style.top = `${y}px`;
    } else if (activeBubble.element && activeBubble.element.style.opacity === "1" && (!activeBubble.model || !activeBubble.model.visible)) {
        activeBubble.element.style.opacity = "0";
    }

    models.forEach((model, i) => {
        mixers[i].update(delta);
        
        // Manual Emission Lerp
        if (model.userData.emissiveMeshes && model.userData.emissiveMeshes.length > 0) {
            const diff = model.userData.targetIntensity - model.userData.currentIntensity;
            if (Math.abs(diff) > 0.01) {
                model.userData.currentIntensity += diff * delta * 5.0; 
                model.userData.emissiveMeshes.forEach(mesh => {
                    mesh.material.emissiveIntensity = model.userData.currentIntensity;
                });
            }
        }
    });

    renderer.render(scene,camera);
  });
});
