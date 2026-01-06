import { loadAudio } from "../libs/loader.js";
import { DRACOLoader } from "../libs/three.js-r132/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "../libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js";

const THREE = window.MINDAR.IMAGE.THREE;

// Nama model untuk button narasi
const modelNames = ["Barreleye","Blobfish","Atolla Jellyfish","Dumbo Octopus","Gulper Eel",
  "Yeti Crab","Vampire Squid","Deep-sea Shark","Anglerfish","Sea Angel"];

// Fakta setiap model (DITERJEMAH SAHAJA)
const factData = [
  ["Barreleye mempunyai mata berbentuk tiub.", "Boleh memutar mata untuk penglihatan.", "Hidup pada kedalaman 600–800 meter."],
  ["Blobfish tidak mempunyai otot! Ia membiarkan tekanan laut menyokong badannya.", "Badan seperti jeli.", "Memakan bahan makanan di dasar laut."],
  ["Atolla Jellyfish menggunakan helah cahaya berkelip yang dipanggil strategi 'burglar alarm'.", "Pemangsa laut dalam.", "Menggunakan cahaya berkelip untuk mengalih perhatian mangsa."],
  ["Dumbo Octopus hidup sangat dalam sehingga tidak memerlukan dakwat.", "Mempunyai sirip seperti telinga.", "Memakan krustasea kecil."],
  ["Gulper Eel boleh membuka rahangnya seperti burung pelikan.", "Mempunyai hujung ekor yang bercahaya."],
  ["Yeti Crab hidup di kawasan lubang hidroterma.", "Mempunyai penyepit berbulu.", "Tidak mempunyai mata."],
  ["Vampire Squid walaupun namanya, ia tidak menghisap darah.", "Ia memakan zarah kecil yang terapung di laut.", "Menghasilkan lendir bioluminesen."],
  ["Megamouth Shark hanya ditemui pada tahun 1976.", "Kurang daripada 100 pernah dilihat."],
  ["Anglerfish jantan sangat kecil.", "Ia melekat pada betina sepanjang hidup.", "Menggunakan cahaya bioluminesen untuk memikat mangsa."],
  ["Sea Angel memburu sea butterfly.", "Mempunyai badan lutsinar.", "Boleh berenang lebih laju daripada haiwan yang lebih besar."],
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

// Create Fact Button
const createFactButton = (anchorId, clickSound) => {
  const btn = document.createElement("button");
  btn.innerText = "📘 FAKTA MENARIK ✨";
  Object.assign(btn.style,{
    position:"absolute", bottom:"25px", left:"50%", transform:"translateX(-50%)",
    padding:"14px 28px", fontSize:"19px", borderRadius:"30px", border:"none",
    background:"#0ea5e9", color:"#fff", fontWeight:"600", cursor:"pointer",
    display:"none", zIndex:"9999", boxShadow:"0 6px 18px rgba(0,0,0,0.3)"
  });
  document.body.appendChild(btn);

  let factBox = null;
  btn.addEventListener("click", ()=>{
    clickSound.setPlaybackRate(0.7);
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

// Create Info Button
const createInfoButton = (clickSound)=>{
  const btn=document.createElement("button");
  btn.innerText="ℹ️";
  Object.assign(btn.style,{
    position:"absolute", top:"80px", right:"10px", padding:"12px", fontSize:"22px",
    borderRadius:"50%", border:"none", background:"rgba(0, 0, 128, 0.5)",
    color:"#ffffff", cursor:"pointer", zIndex:"9999", boxShadow:"0 4px 12px rgba(0,0,0,0.3)"
  });
  document.body.appendChild(btn);

  let infoBox=null;
  btn.addEventListener("click", ()=>{
    clickSound.setPlaybackRate(0.7); clickSound.play();
    if(infoBox){ infoBox.remove(); infoBox=null; return; }
    infoBox=document.createElement("div");
    Object.assign(infoBox.style,{
      position:"absolute", top:"130px", right:"10px", width:"300px",
      padding:"20px", borderRadius:"16px", background:"rgba(30,30,40,0.6)",
      color:"#f0f9ff", fontFamily:"Poppins, sans-serif", fontSize:"14px",
      lineHeight:"1.5", zIndex:"9998", boxShadow:"0 12px 30px rgba(0,0,0,0.5)"
    });
    infoBox.innerHTML=`<ul style="margin-top:4px; padding-left:16px;">
      <li>Halakan peranti anda ke imej sasaran.</li>
      <li>Seret untuk memutar model.</li>
      <li>Skrol (tetikus) atau cubit (sentuhan) untuk zum masuk/keluar.</li>
      <li>Tekan butang 📘 biru untuk melihat fakta model.</li>
      <li>Gunakan butang 🔇 / 🔊 untuk mengawal bunyi.</li>
      <li>Tekan butang narasi berhampiran fakta untuk memainkan audio.</li>
    </ul>`;
    document.body.appendChild(infoBox);
  });
};
document.addEventListener("DOMContentLoaded", async()=>{
  const mindarThree = initializeMindAR();
  const {renderer, scene, camera}=mindarThree;
  renderer.clock=new THREE.Clock();

  const ambientLight=new THREE.AmbientLight(0xffffff,1.0);
  const directionalLight=new THREE.DirectionalLight(0xffffff,1.0);
  directionalLight.position.set(1,2,3);
  scene.add(ambientLight,directionalLight);

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
  const narrationPaths = modelNames.map((_,i)=>`../assets/audio/malay/${i+1}.mp3`);
  const narrationAudios = await Promise.all(narrationPaths.map(p=>loadAndConfigureAudio(p,camera)));

  // Load Click sound
  const clickSound = await loadAndConfigureAudio('../coding/button.mp3', camera);

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

    const mixer=new THREE.AnimationMixer(model.scene);
    model.animations.forEach(clip=>mixer.clipAction(clip).play().setLoop(THREE.LoopRepeat,Infinity));

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

  createInfoButton(clickSound);

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
    mixers.forEach(m=>m.update(delta));
    renderer.render(scene,camera);
  });
});