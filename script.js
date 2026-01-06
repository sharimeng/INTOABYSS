// Access the global quiz data array defined in quiz-data.js
// Note: deepSeaQuizzes array MUST be defined in quiz-data.js
let currentQuizIndex = 0;
let totalScore = 0;

// --- DOM Element References ---
const quizContainer = document.getElementById('quiz-container');
const animalTitle = document.getElementById('animal-title');
const questionArea = document.getElementById('question-area');
const optionsArea = document.getElementById('options-area');
const feedbackArea = document.getElementById('feedback-area');
const factText = document.getElementById('fact-text');
const nextButton = document.getElementById('next-quiz-btn');

// --- Helper: Hide All 3D Models ---
function hideAllModels() {
    // List all model IDs based on your index.html setup
    const modelIDs = deepSeaQuizzes.map(q => q.modelID);
    modelIDs.forEach(id => {
        const model = document.getElementById(id);
        if (model) {
            model.setAttribute('visible', 'false');
            // Reset any previous color changes
            model.setAttribute('material', 'color', 'white');
        }
    });
}

// --- Main Function to Load a Quiz ---
function loadQuiz() {
    // Show the quiz container if it was hidden
    quizContainer.style.opacity = 1;
    
    // Check if we are done
    if (currentQuizIndex >= deepSeaQuizzes.length) {
        showFinalResults();
        return;
    }
    
    const quiz = deepSeaQuizzes[currentQuizIndex];
    
    // 1. Hide previous feedback and buttons
    feedbackArea.classList.add('hidden');
    nextButton.classList.add('hidden');
    optionsArea.innerHTML = '';
    
    // 2. Update the title and question
    animalTitle.textContent = `Question ${currentQuizIndex + 1} of 10: ${quiz.animal}`;
    questionArea.textContent = quiz.question;

    // 3. Update 3D model visibility
    hideAllModels();
    const currentModel = document.getElementById(quiz.modelID);
    if (currentModel) {
        currentModel.setAttribute('visible', 'true');
        // Initial rotation or animation attribute can be set here if needed
    }

    // 4. Create new option buttons
    quiz.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('quiz-option-btn', 'w-full', 'py-3', 'bg-blue-600', 'text-white', 'font-semibold', 'rounded-lg', 'shadow-md', 'hover:bg-blue-700', 'transition', 'duration-150');
        
        // Attach the click handler
        button.onclick = () => checkAnswer(option, quiz);
        optionsArea.appendChild(button);
    });
}

// --- Function to Check the Answer ---
function checkAnswer(selectedOption, quiz) {
    const isCorrect = (selectedOption === quiz.correctAnswer);
    
    // 1. Disable all buttons after one is selected
    document.querySelectorAll('.quiz-option-btn').forEach(btn => btn.disabled = true);
    
    // 2. Get the current model entity for visual feedback
    const model = document.getElementById(quiz.modelID);

    // 3. Update score and visual feedback
    if (isCorrect) {
        totalScore++;
        feedbackArea.classList.remove('bg-red-100', 'border-red-300');
        feedbackArea.classList.add('bg-green-100', 'border-green-300');
        factText.innerHTML = `<span class="font-bold text-green-700">Correct! ✅</span><br>${quiz.fact}`;
        
        // Change model color to green briefly
        if (model) {
            model.setAttribute('material', 'color', '#00ff00'); 
            setTimeout(() => model.setAttribute('material', 'color', 'white'), 1000); // Flash green
        }
    } else {
        feedbackArea.classList.remove('bg-green-100', 'border-green-300');
        feedbackArea.classList.add('bg-red-100', 'border-red-300');
        factText.innerHTML = `<span class="font-bold text-red-700">Incorrect. ❌</span> The correct answer was: <span class="font-bold">${quiz.correctAnswer}</span>.<br>${quiz.fact}`;
        
        // Change model color to red briefly
        if (model) {
            model.setAttribute('material', 'color', '#ff0000');
            setTimeout(() => model.setAttribute('material', 'color', 'white'), 1000); // Flash red
        }
    }

    // 4. Display the feedback area and next button
    feedbackArea.classList.remove('hidden');
    nextButton.classList.remove('hidden');
}

// --- Function to Show Final Results ---
function showFinalResults() {
    hideAllModels();
    quizContainer.innerHTML = `
        <div class="p-8 text-center">
            <h1 class="text-4xl font-extrabold text-blue-800 mb-4">Quiz Complete!</h1>
            <p class="text-xl text-gray-700 mb-6">You finished the "Into The Abyss" challenge.</p>
            <p class="text-3xl font-bold text-indigo-600">Final Score: ${totalScore} / ${deepSeaQuizzes.length}</p>
            <p class="mt-4 text-gray-500">Congratulations on exploring the deep sea!</p>
            <button onclick="location.reload()" class="mt-8 py-3 px-6 bg-green-600 text-white font-bold rounded-lg shadow-xl hover:bg-green-700 transition duration-150">
                Play Again
            </button>
        </div>
    `;
}

// --- Next Button Handler ---
nextButton.onclick = () => {
    currentQuizIndex++;
    loadQuiz();
}

// --- Initialization ---
// Start the first quiz when all the web content is loaded.
window.onload = () => {
    // A-Frame takes time to initialize. We call loadQuiz after a brief delay
    // to ensure the scene and models have time to set up.
    setTimeout(() => {
        loadQuiz();
    }, 1000); 
};