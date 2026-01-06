import { loadAudio } from "../libs/loader.js";
import { DRACOLoader } from "../libs/three.js-r132/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "../libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js";

const THREE = window.MINDAR.IMAGE.THREE;

// Nama model untuk button narasi
const modelNames = ["Barreleye","Blobfish","Atolla Jellyfish","Dumbo Octopus","Gulper Eel",
  "Yeti Crab","Vampire Squid","Deep-sea Shark","Anglerfish","Sea Angel"];

// Fakta setiap model
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

// Dialog Data for Tap Interaction
const dialogData = [
  "My head is see-through, and my eyes glow!", // Barreleye
  "I’m not ugly — I’m just under pressure!", // Blobfish
  "When I’m attacked, I light up!", // Atolla
  "I flap my fins like ears and float like I’m flying!", // Dumbo
  "My mouth is bigger than my body!", // Gulper
  "I grow food on my claws!", // Yeti
  "I don’t bite — I just glow and go!", // Vampire
  "I swim with my giant mouth wide open!", // Deep-sea Shark (Megamouth)
  "I light up the dark to hunt!", // Anglerfish
  "I’m tiny, glowing, and graceful — but I’m a hunter too!" // Sea Angel
];

// Initialize MindAR
const initializeMindAR = () => new window.MINDAR.IMAGE.MindARThree({
  container: document.body,
  imageTargetSrc: '../assets/targets/targets.mind',
});

// Load GLTF model
const configureGLTFLoader = () => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('../libs/draco/');
  loader.setDRACOLoader(dracoLoader);
  return loader;
};

// Load model dengan scale
const loadModel = async (path, scale=[1,1,1]) => {
  const loader = configureGLTFLoader();
  const model = await loader.loadAsync(path);
  model.scene.scale.set(scale[0], scale[1], scale[2]);
  model.scene.position.set(0,0,0);
  // Ensure the model traverses raycasting correctly
  model.scene.traverse((child) => {
    if (child.isMesh) {
      child.geometry.computeBoundingBox();

      // Check for emissive materials (Glow)
      if (child.material) {
        // If the material has an emissive map or color set
        if (child.material.emissiveMap || (child.material.emissive && child.material.emissive.getHex() > 0)) {
            // Boost the intensity to make it visible in AR
            // 1.0 is default, higher values make it brighter "unlit" color
            child.material.emissiveIntensity = 4.0; 
        }
      }
    }
  });
  return model;
};

// Load audio
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

// Function to show the Dialog Bubble
const showDialog = (text) => {
    let dialogBox = document.getElementById("creature-dialog");
    // Create box if it doesn't exist
    if (!dialogBox) {
        dialogBox = document.createElement("div");
        dialogBox.id = "creature-dialog";
        Object.assign(dialogBox.style, {
            position: "fixed", // Changed to fixed to ensure it stays on screen
            top: "30%", 
            left: "50%",
            transform: "translate(-50%, -50%) scale(0.5)",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: "15px 25px",
            borderRadius: "20px 20px 20px 0", // Speech bubble look
            color: "#020617",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "16px",
            fontWeight: "bold",
            textAlign: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
            maxWidth: "280px",
            zIndex: "10000",
            opacity: "0",
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            pointerEvents: "none",
            border: "3px solid #0ea5e9"
        });
        document.body.appendChild(dialogBox);
    }
    
    // Update Text and Show
    dialogBox.innerText = text; 
    
    // Trigger reflow/animation
    requestAnimationFrame(() => {
      dialogBox.style.opacity = "1";
      dialogBox.style.transform = "translate(-50%, -50%) scale(1)";
    });
    
    // Hide automatically after 4 seconds
    if (dialogBox.timeout) clearTimeout(dialogBox.timeout);
    dialogBox.timeout = setTimeout(() => {
        dialogBox.style.opacity = "0";
        dialogBox.style.transform = "translate(-50%, -50%) scale(0.5)";
    }, 4000);
};

// NEW: Play Specific Animation ('action' or 'interact')
const playSpecificAnimation = (modelData, type) => {
    const { mixer, actions, activeAction } = modelData.userData;
    
    // Get the requested animation action based on type
    const targetAction = actions[type];

    // If the specific animation doesn't exist in the model, do nothing
    if (!targetAction) {
        console.warn(`Animation '${type}' not found for this model. Available:`, Object.keys(actions));
        return;
    }

    const idleAnim = actions.idle;

    // If the chosen action is already playing, do nothing to avoid restart stutter
    if (activeAction === targetAction && targetAction.isRunning()) return;

    // Setup the action to play once
    targetAction.reset();
    targetAction.setLoop(THREE.LoopOnce);
    targetAction.clampWhenFinished = true;

    // Crossfade from Idle (or current) to Target
    if (activeAction) {
        activeAction.crossFadeTo(targetAction, 0.5, true);
    }
    targetAction.play();
    modelData.userData.activeAction = targetAction;

    // Listener to go back to Idle when finished
    const onFinished = (e) => {
        if (e.action === targetAction) {
            mixer.removeEventListener('finished', onFinished);
            if (idleAnim) {
                // Crossfade back to Idle
                targetAction.crossFadeTo(idleAnim, 0.5, true);
                idleAnim.reset();
                idleAnim.play();
                modelData.userData.activeAction = idleAnim;
            }
        }
    };
    mixer.addEventListener('finished', onFinished);
};

// Raycaster Setup for Single (Action) vs Double (Interact) Tap
const setupTapInteraction = (camera, models) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let tapTimer = null; // Timer to distinguish single vs double tap
    
    // Track pointer down state to distinguish click vs drag
    let isPointerDown = false;
    let startX = 0;
    let startY = 0;

    const triggerInteraction = (clientX, clientY, interactionType) => {
        // Normalize mouse coordinates
        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        for (let i = 0; i < models.length; i++) {
            const modelGroup = models[i].scene;
            if (modelGroup.visible) {
                const intersects = raycaster.intersectObjects(modelGroup.children, true);
                if (intersects.length > 0) {
                    console.log(`${interactionType} tap on: ${modelNames[i]}`);
                    
                    if (interactionType === 'single') {
                        // 1 Tap -> Show Dialog + Action
                        showDialog(dialogData[i]);
                        playSpecificAnimation(models[i], 'action');
                    } else {
                        // 2 Taps -> Interact
                        playSpecificAnimation(models[i], 'interact');
                    }
                    break; 
                }
            }
        }
    };

    const handleTap = (clientX, clientY) => {
        if (tapTimer === null) {
            // First tap detected, start timer
            tapTimer = setTimeout(() => {
                // Time ran out, confirmed as SINGLE TAP
                tapTimer = null;
                triggerInteraction(clientX, clientY, 'single');
            }, 300); // 300ms window for double tap
        } else {
            // Second tap detected within time window, confirmed as DOUBLE TAP
            clearTimeout(tapTimer);
            tapTimer = null;
            triggerInteraction(clientX, clientY, 'double');
        }
    };

    // Use Pointer Events for unified Mouse/Touch handling without drag interference
    window.addEventListener('pointerdown', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        isPointerDown = true;
        startX = e.clientX;
        startY = e.clientY;
    });

    window.addEventListener('pointerup', (e) => {
        if (!isPointerDown) return;
        isPointerDown = false;

        // Calculate distance moved
        const diffX = Math.abs(e.clientX - startX);
        const diffY = Math.abs(e.clientY - startY);

        // If moved less than 5 pixels, treat as a TAP (ignore drags)
        if (diffX < 5 && diffY < 5) {
            handleTap(e.clientX, e.clientY);
        }
    });
};

// Zoom & Rotate
const enableZoomRotate = (camera, model) => {
  let scaleFactor = 1, isDragging=false, prev={x:0,y:0}, initialDistance=null;
  const handleStart = e => {
    if(e.touches && e.touches.length===1){ isDragging=true; prev={x:e.touches[0].clientX,y:e.touches[0].clientY}; }
    else if(e.touches && e.touches.length===2){
      isDragging=false;
      const dx=e.touches[0].clientX - e.touches[1].clientX;
      const dy=e.touches[0].clientY - e.touches[1].clientY;
      initialDistance=Math.sqrt(dx*dx+dy*dy);
    } else if(e.type==="mousedown"){ isDragging=true; prev={x:e.clientX,y:e.clientY}; }
  };
  const handleMove = e => {
    if(isDragging && (e.type==="mousemove" || (e.touches && e.touches.length===1))){
      const curr=e.touches?{x:e.touches[0].clientX,y:e.touches[0].clientY}:{x:e.clientX,y:e.clientY};
      const delta={x:curr.x-prev.x,y:curr.y-prev.y};
      model.scene.rotation.y += delta.x*0.01;
      model.scene.rotation.x += delta.y*0.01;
      prev=curr;
    } else if(e.touches && e.touches.length===2 && initialDistance){
      const dx=e.touches[0].clientX-e.touches[1].clientX;
      const dy=e.touches[0].clientY-e.touches[1].clientY;
      const currDist=Math.sqrt(dx*dx+dy*dy);
      const zoomDelta=(currDist-initialDistance)*0.005;
      scaleFactor=Math.min(Math.max(scaleFactor+zoomDelta,0.5),2);
      model.scene.scale.set(scaleFactor,scaleFactor,scaleFactor);
      initialDistance=currDist;
    }
  };
  const handleEnd=()=>{ isDragging=false; initialDistance=null; };
  window.addEventListener("mousedown", handleStart);
  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleEnd);
  window.addEventListener("touchstart", handleStart);
  window.addEventListener("touchmove", handleMove);
  window.addEventListener("touchend", handleEnd);
  window.addEventListener("wheel", e=>{
    scaleFactor+=e.deltaY*-0.001;
    scaleFactor=Math.min(Math.max(scaleFactor,0.5),2);
    model.scene.scale.set(scaleFactor,scaleFactor,scaleFactor);
  });
};

// Create Fact Button dengan bunyi klik
const createFactButton = (anchorId, clickSound) => {
  const btn = document.createElement("button");
  btn.innerText = "📘 INTERESTING FACT ✨";
  Object.assign(btn.style,{
    position:"absolute", bottom:"25px", left:"50%", transform:"translateX(-50%)",
    padding:"14px 28px", fontSize:"19px", borderRadius:"30px", border:"none",
    background:"#0ea5e9", color:"#fff", fontWeight:"600", cursor:"pointer",
    display:"none", zIndex:"9999", boxShadow:"0 6px 18px rgba(0,0,0,0.3)"
  });
  document.body.appendChild(btn);

  let factBox = null;
  btn.addEventListener("click", ()=>{
    clickSound.setPlaybackRate(0.7); // slow down
    clickSound.play();
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
    factBox.appendChild(ul);
    document.body.appendChild(factBox);
  });

  return btn;
};

// Create Underwater Particles (Marine Snow)
const createDeepSeaParticles = (scene) => {
    const geometry = new THREE.BufferGeometry();
    const count = 500;
    const positions = new Float32Array(count * 3);
    
    // Scatter particles randomly
    for(let i=0; i<count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 15; 
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create material for the specks
    const material = new THREE.PointsMaterial({
        color: 0x44aaee, // Light blueish
        size: 0.03,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    return particles;
};

// NEW: Create 3D Bubbles
const createBubbles = (scene) => {
    const bubbles = [];
    const geometry = new THREE.SphereGeometry(0.08, 16, 16); // Small sphere
    // Shiny, glass-like material
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.9, // Refraction (glass-like)
        transparent: true,
        opacity: 0.6
    });

    for(let i = 0; i < 20; i++) {
        const bubble = new THREE.Mesh(geometry, material);
        // Random position spread
        bubble.position.set(
            (Math.random() - 0.5) * 5, 
            (Math.random() - 0.5) * 5, 
            (Math.random() - 0.5) * 5
        );
        bubble.userData = {
            speed: 0.01 + Math.random() * 0.02, // Rising speed
            wobble: Math.random() * Math.PI * 2 // Start phase
        };
        scene.add(bubble);
        bubbles.push(bubble);
    }
    return bubbles;
};

// Simplified Persistent Instruction Overlay
const createPersistentInstruction = () => {
  const instructionBox = document.createElement("div");
  Object.assign(instructionBox.style, {
    position: "absolute",
    top: "80px", // Below potential header/mute button
    right: "10px",
    width: "200px",
    padding: "15px",
    borderRadius: "12px",
    background: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
    color: "#ffffff",
    fontFamily: "Poppins, sans-serif",
    fontSize: "13px",
    lineHeight: "1.4",
    zIndex: "9998",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    pointerEvents: "none" // Allow clicks to pass through if needed
  });

  instructionBox.innerHTML = `
    <div style="margin-bottom: 8px; font-weight: bold; color: #0ea5e9;">👆 INTERACTION</div>
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
      <span>Tap 1x:</span>
      <span style="opacity:0.8">Action + Talk</span>
    </div>
    <div style="display:flex; align-items:center; gap:8px;">
      <span>Tap 2x:</span>
      <span style="opacity:0.8">Interact</span>
    </div>
  `;
  
  document.body.appendChild(instructionBox);
};

document.addEventListener("DOMContentLoaded", async()=>{
  const mindarThree = initializeMindAR();
  const {renderer, scene, camera}=mindarThree;
  
  // RENDERER SETTINGS for Emission Support
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0; 
  
  renderer.clock=new THREE.Clock();

  // --- UPDATED LIGHTING FOR DEEP SEA FEEL ---
  // Deep Blue Ambient Light
  const ambientLight = new THREE.AmbientLight(0x001e36, 1.5); 
  // Aqua/Greenish Directional Light (Sunlight from surface)
  const directionalLight = new THREE.DirectionalLight(0x00faac, 1.5); 
  directionalLight.position.set(1,2,3);
  scene.add(ambientLight,directionalLight);

  // --- ADDED DEEP SEA PARTICLES ---
  const particles = createDeepSeaParticles(scene);

  // --- ADDED 3D BUBBLES ---
  const bubbles = createBubbles(scene);

  // Custom scales per model
  const modelScales=[
    [0.8,0.8,0.8],[0.8,0.8,0.8],[1.2,1.2,1.2],[1,1,1],
    [0.5,0.5,0.5],[0.3,0.3,0.3],[0.1,0.1,0.1],[0.8,0.8,0.8],
    [0.5,0.5,0.5],[0.4,0.3,0.4]
  ];

  // Load all models
  const models = await Promise.all(modelNames.map((_,i)=>loadModel(`../assets/models/${i+1}.glb`, modelScales[i])));

  // Load BG-Audio
  const bgAudios = await Promise.all(new Array(10).fill('../coding/bg-audio.mp3').map(p=>loadAndConfigureAudio(p,camera)));

  // Load Narration audio per model
  const narrationPaths = modelNames.map((_,i)=>`../assets/audio/english/${i+1}.mp3`);
  const narrationAudios = await Promise.all(narrationPaths.map(p=>loadAndConfigureAudio(p,camera)));

  // Load Click sound
  const clickSound = await loadAndConfigureAudio('../coding/button.mp3', camera);

  // Setup Tap Interaction (Raycaster)
  setupTapInteraction(camera, models);

  const mixers = models.map((model,i)=>{
    const anchor=mindarThree.addAnchor(i);
    anchor.group.add(model.scene);
    model.scene.visible=false;
    bgAudios[i].setLoop(true);

    const factBtn=createFactButton(i, clickSound);

    // Create narration button sebelah fakta
    const narrationBtn=document.createElement("button");
    narrationBtn.innerText=`${modelNames[i]} Narration`;
    Object.assign(narrationBtn.style,{
      position:"absolute", bottom:"25px", left:`calc(50% + 180px)`,
      padding:"14px 28px", fontSize:"19px", borderRadius:"30px", border:"none",
      background:"#14b8a6", color:"#fff", fontWeight:"600", cursor:"pointer",
      display:"none", zIndex:"9999", boxShadow:"0 6px 18px rgba(0,0,0,0.3)"
    });
    document.body.appendChild(narrationBtn);

    narrationBtn.addEventListener("click", ()=>{
      clickSound.setPlaybackRate(0.7); clickSound.play();
      if(narrationAudios[i].isPlaying) narrationAudios[i].pause();
      else narrationAudios[i].play();
    });

    // UPDATED ANIMATION LOGIC: SETUP IDLE, ACTION, INTERACT
    const mixer = new THREE.AnimationMixer(model.scene);
    
    // Store mixer and action references in userData for easier access
    model.userData.mixer = mixer;
    model.userData.actions = {};

    // 1. Try to find animations by name ("Idle", "Action", "Interact")
    // Note: The RegEx is case insensitive (/i)
    let idleClip = model.animations.find(c => c.name.match(/idle/i));
    let actionClip = model.animations.find(c => c.name.match(/action/i));
    let interactClip = model.animations.find(c => c.name.match(/interact/i));

    // 2. Fallbacks (Optional, based on index if names are missing)
    if (!idleClip && model.animations.length > 0) idleClip = model.animations[0];
    // We don't force index 1/2 to be action/interact unless explicit to avoid playing wrong clips

    // Setup Idle Animation (Loop)
    if (idleClip) {
        const action = mixer.clipAction(idleClip);
        action.play();
        model.userData.actions.idle = action;
        model.userData.activeAction = action; // Set as current
    }

    // Setup Action Animation (Ready state, LoopOnce)
    if (actionClip) {
        const action = mixer.clipAction(actionClip);
        model.userData.actions.action = action;
    }

    // Setup Interact Animation (Ready state, LoopOnce)
    if (interactClip) {
        const action = mixer.clipAction(interactClip);
        model.userData.actions.interact = action;
    }

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
      if(bgAudios[i].isPlaying) bgAudios[i].pause();
      if(narrationAudios[i].isPlaying) narrationAudios[i].pause();
    };

    enableZoomRotate(camera, model);
    return mixer;
  });

  // BG-Audio toggle button
  const audioBtn=document.createElement("div");
  audioBtn.innerText='🔇';
  Object.assign(audioBtn.style,{
    position:'absolute', top:'10px', right:'10px', fontSize:'50px', cursor:'pointer', zIndex:'9999'
  });
  document.body.appendChild(audioBtn);
  let isPlaying=false;
  audioBtn.addEventListener("click",()=>{
    isPlaying=!isPlaying;
    bgAudios.forEach(a=>{
      if(isPlaying){ if(!a.isPlaying)a.play(); }
      else{ if(a.isPlaying)a.pause(); }
    });
    audioBtn.innerText = isPlaying?'🔊':'🔇';
  });

  // Replaced createInfoButton with Persistent Instruction
  createPersistentInstruction();

  const backBtn=document.createElement("a");
  backBtn.innerHTML="&#11013;"; backBtn.href="instructions-en.html";
  Object.assign(backBtn.style,{
    position:"absolute", top:"10px", left:"10px",
    fontSize:"70px", fontWeight:"bold", textDecoration:"none",
    color:"black", cursor:"pointer", zIndex:"9999"
  });
  document.body.appendChild(backBtn);

  await mindarThree.start();
  renderer.setAnimationLoop(()=>{
    const delta=renderer.clock.getDelta();
    
    // --- ANIMATE PARTICLES ---
    if(particles) {
        particles.rotation.y += delta * 0.05; // Drift rotation
        particles.position.y += Math.sin(renderer.clock.elapsedTime) * 0.002; // Gentle vertical drift
    }

    // --- ANIMATE BUBBLES ---
    if(bubbles) {
        bubbles.forEach(bubble => {
            bubble.position.y += bubble.userData.speed;
            // Gentle side-to-side wobble
            bubble.position.x += Math.sin(renderer.clock.elapsedTime + bubble.userData.wobble) * 0.002;
            
            // Reset if goes off top of screen
            if(bubble.position.y > 4) {
                bubble.position.y = -3;
                bubble.position.x = (Math.random() - 0.5) * 5;
            }
        });
    }

    mixers.forEach(m=>m.update(delta));
    renderer.render(scene,camera);
  });
});