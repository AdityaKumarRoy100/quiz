
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const nextButton = document.getElementById('next-btn');
const correctCountElement = document.getElementById('correct-count');
const incorrectCountElement = document.getElementById('incorrect-count');

let currentQuestionIndex = 0;
let correctCount = 0;
let incorrectCount = 0;
let questions = [];

// API URL to get random science-related trivia questions (category 17 is Science & Nature)
const apiURL = 'https://opentdb.com/api.php?amount=10&category=17&difficulty=medium&type=multiple';

// Fetch questions from the API
async function fetchQuestions() {
    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        questions = data.results.map(loadedQuestion => {
            const formattedQuestion = {
                question: loadedQuestion.question,
                answers: []
            };
            
            const answerChoices = [...loadedQuestion.incorrect_answers];
            const correctAnswerIndex = Math.floor(Math.random() * 4);
            answerChoices.splice(correctAnswerIndex, 0, loadedQuestion.correct_answer);
            
            answerChoices.forEach((answer, index) => {
                formattedQuestion.answers.push({
                    text: answer,
                    correct: index === correctAnswerIndex
                });
            });
            
            return formattedQuestion;
        });

        startGame();
    } catch (error) {
        console.error("Failed to load questions", error);
    }
}

function startGame() {
    currentQuestionIndex = 0;
    correctCount = 0;
    incorrectCount = 0;
    updateScoreboard();
    nextButton.innerText = 'Next Question';
    nextButton.classList.add('hide');
    showQuestion();
}

function showQuestion() {
    resetState();
    const currentQuestion = questions[currentQuestionIndex];
    questionElement.innerHTML = currentQuestion.question;

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn');
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    nextButton.classList.add('hide');
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === 'true';
    Array.from(answerButtonsElement.children).forEach(button => {
        setStatusClass(button, button.dataset.correct === 'true');
    });
    
    if (correct) {
        correctCount++;
    } else {
        incorrectCount++;
    }

    updateScoreboard();

    if (questions.length > currentQuestionIndex + 1) {
        nextButton.classList.remove('hide');
    } else {
        nextButton.innerText = 'Restart';
        nextButton.classList.remove('hide');
    }
}

function setStatusClass(element, correct) {
    clearStatusClass(element);
    if (correct) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
    }
}

function clearStatusClass(element) {
    element.classList.remove('correct');
    element.classList.remove('wrong');
}

function updateScoreboard() {
    correctCountElement.innerText = correctCount;
    incorrectCountElement.innerText = incorrectCount;
}

nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        fetchQuestions(); // Restart by fetching new questions from the API
    }
});

// Start fetching the first batch of questions
fetchQuestions();
