import { loadGLTF, loadAudio } from "../../libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async () => {
   
   
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: '../../assets/targets/storybook/dino.mind',});
    
    const { renderer, scene, camera } = mindarThree;

    // Add a hemisphere light to illuminate the AR scene
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);
 
	//--load page1----------------------------------------------------------------------------------------------------------------------------------------
    const page1 = await loadGLTF('../../assets/models/g20/page1.glb');
    page1.scene.scale.set(0.2, 0.2, 0.2);
    page1.scene.position.set(0.0, -0.4, 0);

	// ANCHORS
    const page1Anchor = mindarThree.addAnchor(0);
	  page1Anchor.group.add(page1.scene);
	
    const audio1Clip = await loadAudio('../../assets/audio/BI/scene1.mp3');
   
    const listener1 = new THREE.AudioListener();
    camera.add(listener1);

    const audio1 = new THREE.PositionalAudio(listener1);
    page1Anchor.group.add(audio1);
	
    audio1.setBuffer(audio1Clip);
    audio1.setRefDistance(10000); // Reference distance for audio falloff
    audio1.setLoop(true); // Loop the audio 

    // Define actions to play and pause audio when the target is found or lost
    page1Anchor.onTargetFound = () => {
      audio1.play();
    }
    page1Anchor.onTargetLost = () => {
      audio1.stop(); 
    }
	
	  const mixer1 = new THREE.AnimationMixer(page1.scene);
    const action1 = mixer1.clipAction(page1.animations[0]);
    action1.play()

	//--load page2----------------------------------------------------------------------------------------------------------------------------------------
  const page2 = await loadGLTF('../../assets/models/g20/page2.glb');
  page2.scene.scale.set(0.3, 0.3, 0.3);
  page2.scene.position.set(0.0, -0.4, 0);

// ANCHORS
  const page2Anchor = mindarThree.addAnchor(1);
  page2Anchor.group.add(page2.scene);

  const audio2Clip = await loadAudio('../../assets/audio/BI/scene2.mp3');
 
  const listener2 = new THREE.AudioListener();
  camera.add(listener2);

  const audio2 = new THREE.PositionalAudio(listener2);
  page2Anchor.group.add(audio2);

  audio2.setBuffer(audio2Clip);
  audio2.setRefDistance(10000); // Reference distance for audio falloff
  audio2.setLoop(true); // Loop the audio 

  // Define actions to play and pause audio when the target is found or lost
  page2Anchor.onTargetFound = () => {
    audio2.play();
  }
  page2Anchor.onTargetLost = () => {
    audio2.stop(); 
  }

  const mixer2 = new THREE.AnimationMixer(page2.scene);
  const action2 = mixer2.clipAction(page2.animations[0]);
  action2.play()

	//--load page3----------------------------------------------------------------------------------------------------------------------------------------
  const page3 = await loadGLTF('../../assets/models/g20/page3.glb');
  page3.scene.scale.set(0.3, 0.3, 0.3);
  page3.scene.position.set(0.0, -0.4, 0);

// ANCHORS
  const page3Anchor = mindarThree.addAnchor(2);
  page3Anchor.group.add(page3.scene);

  const audio3Clip = await loadAudio('../../assets/audio/BI/scene3.mp3');
 
  const listener3 = new THREE.AudioListener();
  camera.add(listener3);

  const audio3 = new THREE.PositionalAudio(listener3);
  page3Anchor.group.add(audio3);

  audio3.setBuffer(audio3Clip);
  audio3.setRefDistance(10000); // Reference distance for audio falloff
  audio3.setLoop(true); // Loop the audio 

  // Define actions to play and pause audio when the target is found or lost
  page3Anchor.onTargetFound = () => {
    audio3.play();
  }
  page3Anchor.onTargetLost = () => {
    audio3.stop(); 
  }

  const mixer3 = new THREE.AnimationMixer(page3.scene);
  const action3 = mixer3.clipAction(page3.animations[0]);
  action3.play()

  	//--load page4----------------------------------------------------------------------------------------------------------------------------------------
    const page4 = await loadGLTF('../../assets/models/g20/page4.glb');
    page4.scene.scale.set(0.2, 0.2, 0.2);
    page4.scene.position.set(0.0, -0.4, 0);
  
  // ANCHORS
    const page4Anchor = mindarThree.addAnchor(3);
    page4Anchor.group.add(page4.scene);
  
    const audio4Clip = await loadAudio('../../assets/audio/BI/scene4.mp3');
   
    const listener4 = new THREE.AudioListener();
    camera.add(listener4);
  
    const audio4 = new THREE.PositionalAudio(listener4);
    page4Anchor.group.add(audio4);
  
    audio4.setBuffer(audio4Clip);
    audio4.setRefDistance(10000); // Reference distance for audio falloff
    audio4.setLoop(true); // Loop the audio 
  
    // Define actions to play and pause audio when the target is found or lost
    page4Anchor.onTargetFound = () => {
      audio4.play();
    }
    page4Anchor.onTargetLost = () => {
      audio4.stop(); 
    }
  
    const mixer4 = new THREE.AnimationMixer(page4.scene);
    const action4 = mixer4.clipAction(page4.animations[0]);
    action4.play()

  //--load page5----------------------------------------------------------------------------------------------------------------------------------------
  const page5 = await loadGLTF('../../assets/models/g20/page5.glb');
  page5.scene.scale.set(0.6, 0.6, 0.6);
  page5.scene.position.set(0.0, -0.4, 0);

// ANCHORS
  const page5Anchor = mindarThree.addAnchor(4);
  page5Anchor.group.add(page5.scene);

  const audio5Clip = await loadAudio('../../assets/audio/BI/scene5.mp3');
 
  const listener5 = new THREE.AudioListener();
  camera.add(listener5);

  const audio5 = new THREE.PositionalAudio(listener5);
  page5Anchor.group.add(audio5);

  audio5.setBuffer(audio5Clip);
  audio5.setRefDistance(10000); // Reference distance for audio falloff
  audio5.setLoop(true); // Loop the audio 

  // Define actions to play and pause audio when the target is found or lost
  page5Anchor.onTargetFound = () => {
    audio5.play();
  }
  page5Anchor.onTargetLost = () => {
    audio5.stop(); 
  }

  const mixer5 = new THREE.AnimationMixer(page5.scene);
  const action5 = mixer5.clipAction(page5.animations[0]);
  action5.play()

  	//--load page6----------------------------------------------------------------------------------------------------------------------------------------
    const page6 = await loadGLTF('../../assets/models/g20/page6.glb');
    page6.scene.scale.set(0.2, 0.2, 0.2);
    page6.scene.position.set(0.0, -0.4, 0);
    page6.scene.rotation.set(0.0, 3.5, 0.0);
  
  // ANCHORS
    const page6Anchor = mindarThree.addAnchor(5);
    page6Anchor.group.add(page6.scene);
  
    const audio6Clip = await loadAudio('../../assets/audio/BI/scene6.mp3');
   
    const listener6 = new THREE.AudioListener();
    camera.add(listener6);
  
    const audio6 = new THREE.PositionalAudio(listener6);
    page6Anchor.group.add(audio6);
  
    audio6.setBuffer(audio6Clip);
    audio6.setRefDistance(10000); // Reference distance for audio falloff
    audio6.setLoop(true); // Loop the audio 
  
    // Define actions to play and pause audio when the target is found or lost
    page6Anchor.onTargetFound = () => {
      audio6.play();
    }
    page6Anchor.onTargetLost = () => {
      audio6.stop(); 
    }
  
    const mixer6 = new THREE.AnimationMixer(page6.scene);
    const action6 = mixer6.clipAction(page6.animations[0]);
    action6.play()

	      const clock = new THREE.Clock();

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
     const delta = clock.getDelta();
      mixer1.update(delta);
      mixer2.update(delta);
      mixer3.update(delta);
      mixer4.update(delta); 
      mixer5.update(delta);
      mixer6.update(delta);
     	 
      renderer.render(scene, camera);
	  
      });
  }
  start();
});