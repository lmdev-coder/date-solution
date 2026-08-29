// ================== НАСТРОЙКИ ==================
const NETLIFY_URL = 'https://date-solution.netlify.app'; // ← замените на ваш URL Netlify
const CORRECT_PASSWORD_HASH = null; // не нужно, хеш на сервере

// ================== СОСТОЯНИЕ ==================
let selectedTime = null;
let selectedPlace = null;
let authHash = null; // сюда сохраним хеш пароля после проверки

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
    // Хешируем пароль и отправляем на сервер
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
      authHash = hash; // сохраняем для последующих запросов
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

// ================== ШАГ 1: ИГРА С КНОПКАМИ ==================
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
    showFinalInvitation();
  });
});

// ================== ШАГ 4: ФИНАЛЬНОЕ ПРИГЛАШЕНИЕ ==================
function formatTimeMinus30(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  let totalMin = h * 60 + m - 30;
  if (totalMin < 0) totalMin += 24 * 60;
  return `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
}

function showFinalInvitation() {
  const pickUpTime = formatTimeMinus30(selectedTime);
  document.getElementById('final-message').innerHTML =
    `Заберу тебя сегодня в <strong>${pickUpTime}</strong>, солнышко 💕😊`;
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
