// ================== НАСТРОЙКИ ==================
const NETLIFY_URL = 'https://date-solution.netlify.app'; // ← ваш URL

// ================== СОСТОЯНИЕ ==================
let selectedCountries = [];  // массив выбранных стран
let selectedHotel = null;
let selectedDates = null;
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

// ================== ШАГ 1: ВОПРОС "ПОЕДЕШЬ В ОТПУСК?" ==================
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

btnYes.addEventListener('click', () => showStep('step-countries'));
btnNo.addEventListener('click', () => showStep('step-countries'));

// ================== ШАГ 2: МУЛЬТИСЕЛЕКТ СТРАН ==================
const countryButtons = document.querySelectorAll('.country-option');
countryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('selected');
    const country = btn.dataset.country;
    if (btn.classList.contains('selected')) {
      selectedCountries.push(country);
    } else {
      selectedCountries = selectedCountries.filter(c => c !== country);
    }
  });
});

document.getElementById('btn-countries-next').addEventListener('click', () => {
  if (selectedCountries.length > 0) {
    showStep('step-hotel');
  } else {
    alert('Выбери хотя бы одну страну 😉');
  }
});

// ================== ШАГ 3: ВЫБОР ОТЕЛЯ ==================
document.querySelectorAll('.hotel-option.active-option').forEach(option => {
  option.addEventListener('click', () => {
    selectedHotel = option.dataset.hotel;
    showStep('step-dates');
  });
});

// ================== ШАГ 4: ВЫБОР ДАТ ==================
document.querySelectorAll('.date-option.active-option').forEach(option => {
  option.addEventListener('click', () => {
    selectedDates = option.dataset.dates;
    showFinalInvitation();
  });
});

// ================== ШАГ 5: ФИНАЛЬНОЕ СООБЩЕНИЕ ==================
function showFinalInvitation() {
  const messageEl = document.getElementById('final-message');
  messageEl.innerHTML = `
    Люблю тебя, красоточка! ❤️<br>
    Ты выбрала лететь в одну из этих стран: ${selectedCountries.join(' или ')}<br>
    Отель: ${selectedHotel}<br>
    Даты: ${selectedDates}
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
        countries: selectedCountries,
        hotel: selectedHotel,
        dates: selectedDates,
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
