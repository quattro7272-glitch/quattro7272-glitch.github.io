const quizForm = document.getElementById("quiz-form");

const styleResults = {
  sharp: {
    name: "切りっぱなしの、ブラントボブ",
    text: "輪郭をはっきり描くと、毎日の表情が引き締まります。",
    menuLabel: "Design Cut ＋ Treatment",
    menuValue: "cut-treatment"
  },
  soft: {
    name: "ゆるやかな、ロングウェーブ",
    text: "動きが輪郭をやわらげて、空気をまとったような印象に。",
    menuLabel: "Design Cut ＋ Soft Perm",
    menuValue: "cut-perm"
  },
  casual: {
    name: "襟足の美しい、ショートクロップ",
    text: "骨格を活かした形で、乾かすだけで軽やかに決まります。",
    menuLabel: "Design Cut ＋ Color",
    menuValue: "cut-color"
  }
};

const textureTexts = {
  straight: "まっすぐな髪は、重さの線で表情が決まります。",
  wavy: "くせは消さずに、活かす設計にします。",
  fine: "やわらかい髪は、根元からふんわり立ち上げます。"
};

const worryTexts = {
  time: "朝は、乾かすだけで決まる長さに。",
  volume: "毛量の位置を動かして、ボリュームを足します。",
  frizz: "広がりを抑える質感づくりを先に行います。"
};

function readAnswers() {
  const data = new FormData(quizForm);
  const texture = data.get("texture");
  const worry = data.get("worry");
  const mood = data.get("mood");
  if (texture === null || worry === null || mood === null) return null;
  return { texture, worry, mood };
}

function showAnswerPhoto(radio) {
  const stage = document.querySelector(".quiz__stage");
  const photo = stage.querySelector(".js-quiz-photo");
  const caption = stage.querySelector(".js-quiz-caption");
  const questionNumber = radio.closest("fieldset").querySelector(".quiz__no").textContent;

  photo.src = radio.dataset.photo;
  photo.alt = radio.dataset.alt;
  photo.hidden = false;
  stage.querySelector(".quiz__empty").hidden = true;
  caption.textContent = `${questionNumber}　${radio.nextElementSibling.textContent}`;
}

function showResult() {
  const answers = readAnswers();
  const body = document.querySelector(".quiz__answer-body");
  if (!answers) return;
  const result = styleResults[answers.mood];

  body.querySelector(".js-quiz-name").textContent = result.name;
  body.querySelector(".js-quiz-text").textContent = `${result.text}${textureTexts[answers.texture]}${worryTexts[answers.worry]}`;
  body.querySelector(".js-quiz-menu").textContent = result.menuLabel;
  body.querySelector(".js-quiz-reserve").dataset.menu = result.menuValue;
  body.hidden = false;
}

function resetResult() {
  const stage = document.querySelector(".quiz__stage");
  stage.querySelector(".js-quiz-photo").hidden = true;
  stage.querySelector(".js-quiz-caption").textContent = "";
  stage.querySelector(".quiz__empty").hidden = false;
  document.querySelector(".quiz__answer-body").hidden = true;
}

function preloadAnswerPhotos() {
  quizForm.querySelectorAll("input[data-photo]").forEach((radio) => {
    new Image().src = radio.dataset.photo;
  });
}

if (quizForm) {
  quizForm.addEventListener("change", (event) => {
    showAnswerPhoto(event.target);
    showResult();
  });
  quizForm.addEventListener("reset", resetResult);
  preloadAnswerPhotos();
}
