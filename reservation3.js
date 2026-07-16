/* 로컬(Live Server + 별도 json-server)에서는 절대경로로 3000번 포트를 직접 가리키고,
   배포 환경에서는 상대경로(같은 폴더)를 씀 */
const DB_URL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : '.';
const urlParams = new URLSearchParams(location.search);
const idx = parseInt(urlParams.get('idx'));

let roomData = null;
let priceData = [];
let seasonData = [];
let holidayData = [];
let reservationData = [];
let extraGuests = 0;

async function init() {
    const [rooms, prices, seasons, holidays, reservations] = await Promise.all([
        fetch(`${DB_URL}/rooms/${idx}`).then(r => r.json()),
        fetch(`${DB_URL}/price?room_id=${idx}`).then(r => r.json()),
        fetch(`${DB_URL}/season`).then(r => r.json()),
        fetch(`${DB_URL}/holiday`).then(r => r.json()),
        fetch(`${DB_URL}/reservation?room_id=${idx}`).then(r => r.json()),
    ]);

    roomData = rooms;
    priceData = prices;
    seasonData = seasons;
    holidayData = holidays;
    reservationData = reservations;

    renderRoomInfo();

    const calendar = document.getElementById('calendar');
    calendar.setReservedDates(reservationData, idx);

    /* 날짜 선택 이벤트 */
    calendar.addEventListener('dateSelected', (e) => {
        const { checkin, checkout } = e.detail;
        if (checkin && checkout) {
            calculatePrice(checkin, checkout);
            /* 예약하기 버튼 활성화 */
            document.getElementById('reserveBtn').classList.remove('inactive');
            document.getElementById('reserveBtn').classList.add('confirm');
        } else {
            document.getElementById('totalPrice').textContent = '0';
            /* 예약하기 버튼 비활성화 */
            document.getElementById('reserveBtn').classList.remove('confirm');
            document.getElementById('reserveBtn').classList.add('inactive');
        }
    });

    initDropdown();
}

function renderRoomInfo() {
    document.getElementById('roomTitle').textContent =
        roomData.name_eng.toUpperCase();

    initRoomImgSlider();

    document.getElementById('roomDesc').textContent = roomData.desc;
    document.getElementById('roomDescEng').textContent = roomData.desc_eng;
}

/* 날짜가 성수기인지 확인 */
function getSeason(dateStr) {
    const date = new Date(dateStr);
    for (const s of seasonData) {
        const start = new Date(s.start_date);
        const end = new Date(s.end_date);
        if (date >= start && date <= end) return s.id;
    }
    return 1;
}

/* 공휴일 확인 */
function isHoliday(dateStr) {
    return holidayData.some(h => h.holiday_date === dateStr);
}

/* 주말 확인 */
function isWeekend(dateStr) {
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6;
}

/* 하루 요금 계산 */
function getDayPrice(dateStr) {
    const seasonId = getSeason(dateStr);
    const price = priceData.find(p => p.season_id === seasonId);
    if (!price) return 0;
    if (isHoliday(dateStr)) return price.holiday_price;
    if (isWeekend(dateStr)) return price.weekend_price;
    return price.weekday_price;
}

/* 전체 요금 계산 */
function calculatePrice(checkin, checkout) {
    const start = new Date(checkin);
    const end = new Date(checkout);
    let total = 0;

    const cur = new Date(start);
    while (cur < end) {
        const dateStr = cur.toISOString().split('T')[0];
        const dayPrice = getDayPrice(dateStr);
        const extraPrice = dayPrice * 0.2 * extraGuests;
        total += dayPrice + extraPrice;
        cur.setDate(cur.getDate() + 1);
    }

    document.getElementById('totalPrice').textContent = total.toLocaleString();
}

function initDropdown() {
    const selectWrap = document.getElementById('extraGuestWrap');
    const selected = document.getElementById('extraGuestSelected');
    const options = document.getElementById('extraGuestOptions');

    const maxExtra = roomData.capacity - roomData.min;

    options.innerHTML = '';
    const noneOption = document.createElement('li');
    noneOption.dataset.value = '0';
    noneOption.textContent = '없음';
    options.appendChild(noneOption);

    for (let i = 1; i <= maxExtra; i++) {
        const li = document.createElement('li');
        li.dataset.value = String(i);
        li.textContent = `${i}명`;
        options.appendChild(li);
    }

    selected.addEventListener('click', () => {
        options.classList.toggle('open');
    });

    options.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
            selected.textContent = li.textContent;
            extraGuests = parseInt(li.dataset.value);
            options.classList.remove('open');

            const calendar = document.getElementById('calendar');
            const { checkin, checkout } = calendar.getSelectedDates();
            if (checkin && checkout) {
                calculatePrice(checkin, checkout);
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!selectWrap.contains(e.target)) {
            options.classList.remove('open');
        }
    });
}

/* 예약하기 버튼 */
document.getElementById('reserveBtn').addEventListener('click', () => {
    const calendar = document.getElementById('calendar');
    const { checkin, checkout } = calendar.getSelectedDates();

    if (!checkin || !checkout) {
        document.getElementById('alertModal').show('날짜를 선택해주세요.');
        return;
    }

    const total = document.getElementById('totalPrice').textContent.replace(/,/g, '');
    location.href = `reservation5.html?idx=${idx}&checkin=${checkin}&checkout=${checkout}&guests=${extraGuests}&total=${total}`;
});

init();