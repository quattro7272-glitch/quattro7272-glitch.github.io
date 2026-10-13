const quizForm = document.getElementById("quiz-form");

const roastResults = [
  {
    name: "浅煎りの、本日のブレンド",
    text: "霧がうすい朝には、軽くて明るい一杯を。香りが先に立って、窓の白が晴れていくのに似ています。"
  },
  {
    name: "中煎りの、本日のブレンド",
    text: "どちらにも寄らない朝には、まるい一杯を。急がず、冷めてからも飲みやすいところで。"
  },
  {
    name: "深煎りの、本日のブレンド",
    text: "霧の深い朝には、ゆっくり濃い一杯を。湯気も香りも、長くそこに残ります。"
  }
];

const sweetTexts = {
  tart: "添えるのは、季節のタルトを一切れ。",
  cookie: "添えるのは、焼き菓子をひとつだけ。",
  none: "添えるものは、なし。珈琲だけの朝で。"
};

function pickRoast(score) {
  if (score <= 1) return roastResults[0];
  if (score === 2) return roastResults[1];
  return roastResults[2];
}

function readAnswers() {
  const data = new FormData(quizForm);
  const windowScore = data.get("window");
  const moodScore = data.get("mood");
  const sweet = data.get("sweet");
  if (windowScore === null || moodScore === null || sweet === null) return null;
  return { score: Number(windowScore) + Number(moodScore), sweet };
}

// 選んだ答えの写真を、霧がうすれて現れる（ページ内の他の写真と同じ動き）ように切り替える
function showAnswerPhoto(radio) {
  const resultElement = quizForm.parentElement.querySelector(".quiz__result");
  const photoFigure = resultElement.querySelector(".quiz__photo");
  const photoElement = photoFigure.querySelector(".js-quiz-photo");
  const questionNumber = radio.closest("fieldset").querySelector(".quiz__no").textContent;
  const answerText = radio.nextElementSibling.textContent;

  photoFigure.classList.remove("is-clear");
  photoElement.src = radio.dataset.photo;
  photoElement.alt = radio.dataset.alt;
  photoFigure.querySelector(".js-quiz-caption").textContent = `${questionNumber}　${answerText}`;
  resultElement.querySelector(".quiz__empty").hidden = true;
  photoFigure.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => photoFigure.classList.add("is-clear")));
}

function updateResultText() {
  const answerBody = quizForm.parentElement.querySelector(".quiz__answer-body");
  const answers = readAnswers();
  if (!answers) return;
  const roast = pickRoast(answers.score);
  answerBody.querySelector(".js-quiz-name").textContent = roast.name;
  answerBody.querySelector(".js-quiz-text").textContent = `${roast.text}${sweetTexts[answers.sweet]}`;
  answerBody.hidden = false;
}

function resetResult() {
  const resultElement = quizForm.parentElement.querySelector(".quiz__result");
  resultElement.querySelector(".quiz__empty").hidden = false;
  resultElement.querySelector(".quiz__photo").hidden = true;
  resultElement.querySelector(".quiz__answer-body").hidden = true;
}

function preloadAnswerPhotos() {
  quizForm.querySelectorAll("input[data-photo]").forEach((radio) => {
    new Image().src = radio.dataset.photo;
  });
}

if (quizForm) {
  quizForm.addEventListener("change", (event) => {
    showAnswerPhoto(event.target);
    updateResultText();
  });
  quizForm.addEventListener("reset", resetResult);
  preloadAnswerPhotos();
}
