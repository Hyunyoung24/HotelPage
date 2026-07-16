/* 로컬(Live Server + 별도 json-server)에서는 절대경로로 3000번 포트를 직접 가리키고,
   배포 환경(같은 서버가 --static으로 프론트+API를 함께 서빙)에서는 상대경로를 씀 */
const DB_URL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : '..';
const urlParams = new URLSearchParams(location.search);
const idx = parseInt(urlParams.get('idx'));
const checkin = urlParams.get('checkin');
const checkout = urlParams.get('checkout');
const guests = parseInt(urlParams.get('guests')) || 0;
const total = parseInt(urlParams.get('total')) || 0;

const roomNames = {
    1: 'STANDARD',
    2: 'DELUXE',
    3: 'PREMIUM',
    4: 'SWEET'
};

document.getElementById('roomName').textContent = roomNames[idx] || '';
document.getElementById('guestCount').textContent = guests === 0 ? '0' : `${guests}명`;
document.getElementById('totalPrice').textContent = total.toLocaleString();

function showError(input, message) {
    let error = input.parentNode.querySelector('.res5-error');
    if (!error) {
        error = document.createElement('p');
        error.className = 'res5-error';
        input.after(error);
    }
    error.textContent = message;
    input.classList.add('error');
}

function clearError(input) {
    const error = input.parentNode.querySelector('.res5-error');
    if (error) error.remove();
    input.classList.remove('error');
}

function validate() {
    let isValid = true;

    const nameInput = document.getElementById('customerName');
    if (!nameInput.value.trim()) {
        showError(nameInput, '필수 입력 값입니다.');
        isValid = false;
    } else {
        clearError(nameInput);
    }

    const phoneInput = document.getElementById('phoneNumber');
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneInput.value.trim()) {
        showError(phoneInput, '필수 입력 값입니다.');
        isValid = false;
    } else if (!phoneRegex.test(phoneInput.value.trim())) {
        showError(phoneInput, '올바른 전화번호 형식이 아닙니다. (전화번호는 - 없이 숫자만 입력해주세요)');
        isValid = false;
    } else {
        clearError(phoneInput);
    }

    return isValid;
}

document.getElementById('customerName').addEventListener('input', () => {
    const input = document.getElementById('customerName');
    if (input.value.trim()) clearError(input);
});

document.getElementById('phoneNumber').addEventListener('input', () => {
    const input = document.getElementById('phoneNumber');
    const phoneRegex = /^[0-9]{10,11}$/;
    if (phoneRegex.test(input.value.trim())) clearError(input);
});

window.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');

    fetch(`${DB_URL}/reservation?room_id=${idx}`)
        .then(r => r.json())
        .then(reservations => {
            calendar.setReservedDates(reservations, idx);

            if (checkin && checkout) {
                calendar.checkin = checkin;
                calendar.checkout = checkout;
                calendar.currentYear = parseInt(checkin.split('-')[0]);
                calendar.currentMonth = parseInt(checkin.split('-')[1]) - 1;
                calendar.renderTitle();
                calendar.renderBody();
            }
        });
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    history.back();
});

document.getElementById('reserveBtn').addEventListener('click', async () => {
    if (!validate()) return;

    const customerName = document.getElementById('customerName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();

    const body = {
        room_id: idx,
        check_in_date: checkin,
        check_out_date: checkout,
        number_of_guests: guests + 2,
        customer_name: customerName,
        phone_number: phoneNumber,
        total_price: total,
    };

    try {
        const res = await fetch(`${DB_URL}/reservation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            document.getElementById('alertModal').show('예약이 완료되었습니다.');
            document.getElementById('alertModal')
                .querySelector('#alertCloseBtn')
                .addEventListener('click', () => {
                    location.href = '../index.html';
                }, { once: true });
        } else {
            document.getElementById('alertModal').show('예약에 실패했습니다. 다시 시도해주세요.');
        }
    } catch (err) {
        document.getElementById('alertModal').show('서버에 연결할 수 없습니다.');
    }
});