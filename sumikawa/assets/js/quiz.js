// トップの診断：3つの質問 → おすすめプラン。プランの内容は data.js（window.SUMIKAWA）から読む
const quizForm = document.getElementById("quiz-form");
const quizResult = document.querySelector(".js-quiz-result");

function readQuizAnswers() {
  const data = new FormData(quizForm);
  const time = data.get("time");
  const company = data.get("company");
  const pace = data.get("pace");
  if (time === null || company === null || pace === null) return null;
  return { time, company, pace };
}

function choosePlanId(answers) {
  if (answers.company === "anniversary") return "anniversary";
  if (answers.time === "bath" || answers.pace === "rest") return "special";
  return "basic";
}

function showQuizResult() {
  const answers = readQuizAnswers();
  if (!answers || !window.SUMIKAWA) return;

  const plan = window.SUMIKAWA.plans.find((item) => item.id === choosePlanId(answers));
  quizResult.querySelector(".js-quiz-empty").hidden = true;
  const body = quizResult.querySelector(".js-quiz-body");
  body.querySelector(".js-quiz-name").textContent = plan.name;
  body.querySelector(".js-quiz-text").textContent = plan.reason;
  body.querySelector(".js-quiz-price").textContent = `${plan.priceLabel}（1名・1泊2食・サンプル）`;
  body.querySelector(".js-quiz-link").href = `plans/?plan=${plan.id}#reserve`;
  body.hidden = false;
}

function resetQuizResult() {
  quizResult.querySelector(".js-quiz-empty").hidden = false;
  quizResult.querySelector(".js-quiz-body").hidden = true;
}

if (quizForm && quizResult) {
  quizForm.addEventListener("change", showQuizResult);
  quizForm.addEventListener("reset", resetQuizResult);
}
