// This function runs when the entire HTML document has been loaded and parsed.
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. GET ALL IMPORTANT ELEMENTS ---
  
  // Get the 2D UI elements
  const quizUI = document.getElementById('quiz-ui');
  const questionText = document.getElementById('question-text');
  const feedbackText = document.getElementById('feedback-text');

  // Get the AR elements
  const markerQuiz = document.getElementById('marker-quiz');
  const draggableItem = document.getElementById('draggable-anglerfish');
  
  // Get the drop targets
  const correctTarget = document.getElementById('target-correct');
  const wrongTarget = document.getElementById('target-wrong');

  // Get the preloaded sounds
  const soundCorrect = document.getElementById('sound-correct');
  const soundWrong = document.getElementById('sound-wrong');
  const soundAmbient = document.getElementById('sound-ambient');

  // --- 2. SET UP THE QUIZ STATE ---
  let isQuizActive = false;
  
  // --- 3. MARKER VISIBILITY EVENTS ---

  // When the QUIZ marker is found...
  markerQuiz.addEventListener('markerFound', () => {
    isQuizActive = true;
    quizUI.style.display = 'block'; // Show the quiz UI
    
    // Set the initial quiz question
    questionText.innerText = 'Which zone does the Anglerfish live in?';
    feedbackText.innerText = 'Drag the fish to the correct zone.';
    
    // Make sure the draggable item is visible for the quiz
    draggableItem.setAttribute('visible', 'true');
    
    // Optional: Play an ambient sound
    // soundAmbient.play(); 
  });

  // When the QUIZ marker is lost...
  markerQuiz.addEventListener('markerLost', () => {
    isQuizActive = false;
    quizUI.style.display = 'none'; // Hide the quiz UI
    
    // Optional: Stop any sounds
    // soundAmbient.pause();
    // soundAmbient.currentTime = 0;
  });

  // --- 4. DRAG-AND-DROP LOGIC ---

  // Listen for a drop on the CORRECT target
  correctTarget.addEventListener('drag-drop', (event) => {
    if (!isQuizActive) return; // Don't do anything if marker isn't visible

    console.log('Dropped on CORRECT target!');
    
    // Give positive feedback
    feedbackText.innerText = 'Correct! Well done!';
    feedbackText.style.color = '#4CFF00'; // Green text
    soundCorrect.play();

    // Hide the item that was dropped
    // 'event.detail.dropped' is the element that was dragged (the anglerfish)
    if (event.detail.dropped) {
      event.detail.dropped.setAttribute('visible', 'false');
    }
    
    // Prevent this quiz from being "completed" again until marker is re-found
    isQuizActive = false; 
  });

  // Listen for a drop on the WRONG target
  wrongTarget.addEventListener('drag-drop', (event) => {
    if (!isQuizActive) return; // Don't do anything if marker isn't visible
    
    console.log('Dropped on WRONG target!');

    // Give "try again" feedback
    feedbackText.innerText = 'Not quite! Try again.';
    feedbackText.style.color = '#FF6347'; // Red-ish text
    soundWrong.play();

    // The 'super-hands' component will automatically snap the item
    // back to its original position, so the user can try again.
    
    // Reset feedback text color after a moment
    setTimeout(() => {
      feedbackText.style.color = 'white';
    }, 2000);
  });

});