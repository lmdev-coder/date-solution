// ================== НАСТРОЙКИ ==================
const NETLIFY_URL = 'https://date-solution.netlify.app'; // ← замените на ваш URL Netlify
// ==================================================

// ================== СОСТОЯНИЕ ==================
let selectedTime = null;
let selectedPlace = null;
let giftAnswer = null; // 'yes'
let authHash = null;

// ================== ХЕШИРОВАНИЕ ПАРОЛЯ ==================
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ================== ПЕРЕКЛЮЧЕНИЕ ШАГОВ ==================
function showStep(stepId) {
  document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
  document.getElementById(stepId).classList.add('active');
}

// ================== ШАГ 0: ВХОД ==================
document.getElementById('login-btn').addEventListener('click', checkPassword);
document.getElementById('password-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') checkPassword();
});

async function checkPassword() {
  const input = document.getElementById('password-input');
  const errorEl = document.getElementById('login-error');
  const password = input.value;

  if (!password) {
    errorEl.textContent = 'Введи пароль 😾';
    return;
  }

  try {
    const hash = await hashPassword(password);
    const response = await fetch(`${NETLIFY_URL}/.netlify/functions/validate-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hash}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (response.ok) {
      authHash = hash;
      sessionStorage.setItem('authHash', hash);
      errorEl.textContent = '';
      showStep('step-question');
    } else {
      errorEl.textContent = 'Неверный пароль, попробуй ещё раз 😿';
    }
  } catch (err) {
    errorEl.textContent = 'Ошибка соединения с сервером 🐾';
    console.error(err);
  }
}

// Автоматический вход, если уже вводили пароль
const savedHash = sessionStorage.getItem('authHash');
if (savedHash) {
  authHash = savedHash;
  showStep('step-question');
}

// ================== ШАГ 1: ВОПРОС "ПОЗАВТРАЕМ ВМЕСТЕ?" ==================
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const buttonsContainer = document.getElementById('buttons-container');

function swapButtons() {
  const first = buttonsContainer.firstElementChild;
  const second = buttonsContainer.lastElementChild;
  if (first && second) {
    buttonsContainer.insertBefore(second, first);
  }
}

btnNo.addEventListener('mouseenter', swapButtons);
btnNo.addEventListener('touchstart', (e) => {
  e.preventDefault();
  swapButtons();
}, { passive: false });

btnYes.addEventListener('click', () => showStep('step-time'));
btnNo.addEventListener('click', () => showStep('step-time'));

// ================== ШАГ 2: ВЫБОР ВРЕМЕНИ ==================
document.querySelectorAll('.time-option.active-option').forEach(option => {
  option.addEventListener('click', () => {
    selectedTime = option.dataset.time;
    showStep('step-place');
  });
});

// ================== ШАГ 3: ВЫБОР МЕСТА ==================
document.querySelectorAll('.place-option').forEach(option => {
  option.addEventListener('click', () => {
    selectedPlace = option.dataset.place;
    showStep('step-gift');
  });
});

// ================== ШАГ 4: ВОПРОС О ПОДАРКЕ ==================
const btnGiftYes = document.getElementById('btn-gift-yes');
const btnGiftNo = document.getElementById('btn-gift-no');
const giftButtonsContainer = document.getElementById('gift-buttons-container');

function swapGiftButtons() {
  const first = giftButtonsContainer.firstElementChild;
  const second = giftButtonsContainer.lastElementChild;
  if (first && second) {
    giftButtonsContainer.insertBefore(second, first);
  }
}

btnGiftNo.addEventListener('mouseenter', swapGiftButtons);
btnGiftNo.addEventListener('touchstart', (e) => {
  e.preventDefault();
  swapGiftButtons();
}, { passive: false });

btnGiftYes.addEventListener('click', () => {
  giftAnswer = 'yes';
  showFinalInvitation();
});
btnGiftNo.addEventListener('click', () => {
  giftAnswer = 'yes'; // всё равно да
  showFinalInvitation();
});

// ================== ШАГ 5: ФИНАЛЬНОЕ СООБЩЕНИЕ ==================
function showFinalInvitation() {
  const messageEl = document.getElementById('final-message');
  messageEl.innerHTML = `
    Отправлю, что заеду за тобой после массажа и мы поедем на завтрак.<br>
    Сладких снов, булочка 💕🌙
  `;
  showStep('step-final');
  saveResponseToServer();
}

// ================== СОХРАНЕНИЕ ЧЕРЕЗ NETLIFY ==================
async function saveResponseToServer() {
  const statusEl = document.getElementById('save-status');
  statusEl.textContent = 'Сохраняю ответ...';

  try {
    const response = await fetch(`${NETLIFY_URL}/.netlify/functions/save-response`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authHash}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        time: selectedTime,
        place: selectedPlace,
        gift: giftAnswer,
      }),
    });

    if (response.ok) {
      statusEl.textContent = 'Ответ успешно сохранён! 💾';
    } else {
      const data = await response.json();
      throw new Error(data.error || 'Ошибка сохранения');
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Не удалось сохранить ответ (${err.message}). Но это не важно, главное — ты согласилась(ся)! 😽`;
  }
}
