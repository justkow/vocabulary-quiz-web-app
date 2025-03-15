let currentQuizData = [];
let currentCategory = '';

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('closed');
  const toggleBtn = document.getElementById('toggle-sidebar');
  if (sidebar.classList.contains('closed')) {
    toggleBtn.innerText = "☰";
  } else {
    toggleBtn.innerText = "✖";
  }
}

function startQuizWithCategory(category) {
  currentCategory = category;
  document.getElementById('sidebar').style.display = 'block';
  fetchQuiz(category);
  document.getElementById('category-selection').style.display = 'none';
}

async function fetchQuiz(category) {
  try {
    const response = await fetch(`/quiz?category=${category}`);
    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }
    currentQuizData = data;
    renderQuiz(data);
    document.getElementById('quiz-view').style.display = 'block';
  } catch (error) {
    console.error('Error while fetching quiz', error);
    alert('Error while fetching quiz');
  }
}

function renderQuiz(quizData) {
  const quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = '';
  quizData.forEach((word, index) => {
    quizContainer.innerHTML += `
      <div class="quiz-item" id="quiz-item-${word.id}">
        <p>${index + 1}. ${word.word}</p>
        <input type="text" id="answer-${word.id}" placeholder="Enter translation" autocomplete="off">
        <span class="feedback"></span>
      </div>
    `;
  });
  document.getElementById('result').innerText = '';
  document.getElementById('submit-btn').innerText = 'Submit';
}

async function submitQuiz() {
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn.innerText === 'Try again') {
    fetchQuiz(currentCategory);
    return;
  }

  const answers = currentQuizData.map(word => ({
    id: word.id,
    translation: document.getElementById(`answer-${word.id}`).value
  }));

  try {
    const response = await fetch('/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz: currentQuizData, answers })
    });
    const result = await response.json();
    document.getElementById('result').innerText = `Your score: ${result.result} / ${result.total}`;

    currentQuizData.forEach(word => {
      const userAnswer = document.getElementById(`answer-${word.id}`).value.trim().toLowerCase();
      const correctAnswer = word.translation.trim().toLowerCase();
      const feedbackEl = document.querySelector(`#quiz-item-${word.id} .feedback`);
      if (userAnswer === correctAnswer) {
        feedbackEl.innerHTML = `<span class="icon correct">✔</span> <span class="correct-text">(${word.translation})</span>`;
      } else {
        feedbackEl.innerHTML = `<span class="icon wrong">✖</span> <span class="correct-text">(${word.translation})</span>`;
      }
    });

    submitBtn.innerText = 'Try again';
  } catch (error) {
    console.error('Error while sending answers', error);
    alert('Error while sending answers');
  }
}
