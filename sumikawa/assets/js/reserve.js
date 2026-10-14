// 予約フォーム（デモ）。何も送信・保存しない。空室は日付から決まる「擬似の空き」。
const reserveForm = document.getElementById("reserve-form");
const data = window.SUMIKAWA;

const steps = reserveForm ? Array.from(reserveForm.querySelectorAll(".reserve__step")) : [];
const state = { planId: null, roomId: null, presetRoomId: null };

function yen(amount) {
  return `${Math.round(amount).toLocaleString("ja-JP")}円`;
}

function todayAsInputValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function currentPlan() {
  return data.plans.find((plan) => plan.id === state.planId);
}

function roomTypeOf(room) {
  return data.roomTypes[room.type];
}

// 日付と部屋名から「空いているか」を決める（同じ日付なら、いつ見ても同じ結果）
function isRoomOpen(dateValue, room) {
  let hash = 7;
  for (const character of `${dateValue}:${room.id}`) {
    hash = (hash * 31 + character.charCodeAt(0)) % 9973;
  }
  return hash % 5 !== 0;
}

function showStepsUpTo(index) {
  steps.forEach((step, stepIndex) => {
    step.hidden = stepIndex > index;
  });
}

function stepIndexOf(id) {
  return steps.findIndex((step) => step.id === id);
}

function validateStep(step) {
  const fields = step.querySelectorAll("input, select, textarea");
  for (const field of fields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }
  return true;
}

function clearAvailability() {
  state.roomId = null;
  reserveForm.querySelector(".js-room-list").replaceChildren();
  reserveForm.querySelector(".js-availability-status").textContent = "";
  showStepsUpTo(stepIndexOf("step-availability"));
}

function guestTotal() {
  const adults = Number(reserveForm.elements.adults.value);
  const children = Number(reserveForm.elements.children.value);
  return { adults, children, total: adults + children };
}

function renderAvailability() {
  const plan = currentPlan();
  const dateValue = reserveForm.elements.date.value;
  const guests = guestTotal();
  const list = reserveForm.querySelector(".js-room-list");
  const status = reserveForm.querySelector(".js-availability-status");
  list.replaceChildren();

  const candidates = data.rooms.filter((room) => plan.roomTypes.includes(room.type));
  const open = candidates.filter((room) => isRoomOpen(dateValue, room));

  if (open.length === 0) {
    status.textContent = "この日は満室です（デモ用の表示）。別の日をお選びください。";
    return;
  }

  status.textContent = open.length === 1
    ? "この日は残り1室です（デモ用の表示）。"
    : `この日は残り${open.length}室です（デモ用の表示）。ご希望の客室をお選びください。`;

  open.forEach((room, index) => {
    const type = roomTypeOf(room);
    const tooMany = guests.total > type.capacity;
    const wrapper = document.createElement("div");
    wrapper.className = "choice";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "room";
    input.value = room.id;
    input.id = `room-choice-${index}`;
    input.required = true;
    input.disabled = tooMany;
    if (room.id === (state.roomId || state.presetRoomId) && !tooMany) input.checked = true;
    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.textContent = `${room.name}（${type.label}）`;
    const note = document.createElement("small");
    note.textContent = tooMany
      ? `定員${type.capacity}名のため、この人数ではご利用いただけません`
      : `${yen(type.price)}〜／1名（定員${type.capacity}名）`;
    label.append(note);
    wrapper.append(input, label);
    list.append(wrapper);
  });
}

function fillConfirmation() {
  const plan = currentPlan();
  const room = data.rooms.find((item) => item.id === reserveForm.elements.room.value);
  const type = roomTypeOf(room);
  const guests = guestTotal();
  const nights = Number(reserveForm.elements.nights.value);
  const perAdult = type.price;
  const perChild = Math.round(type.price * data.childRate);
  const total = (guests.adults * perAdult + guests.children * perChild) * nights;
  const checkout = plan.checkout;
  const shuttleIn = reserveForm.elements.shuttleIn.selectedOptions[0].textContent;
  const shuttleOut = reserveForm.elements.shuttleOut.selectedOptions[0].textContent;

  const rows = [
    ["プラン", plan.name],
    ["ご宿泊", `${reserveForm.elements.date.value} から ${nights}泊`],
    ["ご人数", `大人${guests.adults}名・子ども${guests.children}名`],
    ["客室", `${room.name}（${type.label}）`],
    ["お食事", plan.meal],
    ["送迎", `行き：${shuttleIn}／帰り：${shuttleOut}`],
    ["チェックイン／アウト", `15:00／${checkout}`],
    ["お名前", reserveForm.elements.fullName.value],
    ["料金の目安（サンプル計算）", `${yen(total)}（税サ込・入湯税別。子どもは${Math.round(data.childRate * 100)}%）`]
  ];

  const list = reserveForm.querySelector(".js-confirm-list");
  list.replaceChildren();
  rows.forEach(([term, detail]) => {
    const dt = document.createElement("dt");
    dt.textContent = term;
    const dd = document.createElement("dd");
    dd.textContent = detail;
    list.append(dt, dd);
  });
}

function setupPlanChoices() {
  const container = reserveForm.querySelector(".js-plan-choices");
  data.plans.forEach((plan, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "choice";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "plan";
    input.value = plan.id;
    input.id = `plan-choice-${index}`;
    input.required = true;
    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.textContent = plan.name;
    const note = document.createElement("small");
    note.textContent = `${plan.priceLabel}／${plan.roomLabel}`;
    label.append(note);
    wrapper.append(input, label);
    container.append(wrapper);
  });
}

function applyUrlPreset() {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("room");
  let planId = params.get("plan");

  if (roomId && !planId) {
    const room = data.rooms.find((item) => item.id === roomId);
    if (room) planId = room.type === "special" ? "special" : "basic";
  }
  const input = planId && reserveForm.querySelector(`input[name="plan"][value="${planId}"]`);
  if (input) {
    input.checked = true;
    state.planId = planId;
  }
  if (roomId) state.presetRoomId = roomId;
}

function setupShuttle() {
  const fillSelect = (select, label, times) => {
    select.append(new Option("利用しない", "none"));
    times.forEach((time) => select.append(new Option(`${label} ${time}`, time)));
  };
  fillSelect(reserveForm.elements.shuttleIn, "谷口駅発", data.shuttle.toInn);
  fillSelect(reserveForm.elements.shuttleOut, "宿発", data.shuttle.fromInn);
}

if (reserveForm && data) {
  setupPlanChoices();
  setupShuttle();
  const dateInput = reserveForm.elements.date;
  dateInput.min = todayAsInputValue();
  applyUrlPreset();

  showStepsUpTo(0);
  reserveForm.querySelector(".js-complete").hidden = true;

  reserveForm.addEventListener("change", (event) => {
    const name = event.target.name;
    if (name === "plan") state.planId = event.target.value;
    if (name === "room") state.roomId = event.target.value;
    if (["plan", "date", "nights", "adults", "children"].includes(name)) {
      clearAvailability();
    }
  });

  reserveForm.addEventListener("click", (event) => {
    const next = event.target.closest(".js-next");
    if (!next) return;
    const step = next.closest(".reserve__step");
    if (!validateStep(step)) return;

    const index = steps.indexOf(step);
    if (step.id === "step-guests") {
      renderAvailability();
    }
    if (step.id === "step-availability") {
      const chosenRoom = reserveForm.elements.room;
      if (!chosenRoom || !chosenRoom.value) {
        reserveForm.querySelector(".js-availability-status").textContent = "ご宿泊できる客室がありません。日付や人数を変えてお試しください。";
        return;
      }
      state.roomId = chosenRoom.value;
    }
    if (step.id === "step-contact") {
      fillConfirmation();
    }
    showStepsUpTo(index + 1);
    steps[index + 1].scrollIntoView({ behavior: "smooth", block: "start" });
  });

  reserveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateStep(steps[steps.length - 1])) return;
    steps.forEach((step) => { step.hidden = true; });
    const complete = reserveForm.querySelector(".js-complete");
    complete.hidden = false;
    complete.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
