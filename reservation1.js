
/* 로컬(Live Server + 별도 json-server)에서는 절대경로로 3000번 포트를 직접 가리키고,
   배포 환경에서는 상대경로(같은 폴더)를 씀 */
const DB_URL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : '.';

async function init() {
    const [rooms, prices, seasons] = await Promise.all([
        fetch(`${DB_URL}/rooms`).then(r => r.json()),
        fetch(`${DB_URL}/price`).then(r => r.json()),
        fetch(`${DB_URL}/season`).then(r => r.json()),
    ]);

    renderPriceTable(rooms, prices, seasons);
}

function renderPriceTable(rooms, prices, seasons) {
    const tbody = document.querySelector('.price-table tbody');
    tbody.innerHTML = '';

    /* 비수기/성수기 season_id 찾기 */
    const offSeason = seasons.find(s => s.name === '비수기') || seasons[0];
    const peakSeason = seasons.find(s => s.name === '성수기') || seasons[1];

    rooms.forEach(room => {
        /* 비수기 요금 */
        const offPrice = prices.find(p => p.room_id === room.id && p.season_id === offSeason.id);
        /* 성수기 요금 */
        const peakPrice = prices.find(p => p.room_id === room.id && p.season_id === peakSeason.id);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${room.name}</td>
            <td>${room.area}㎡</td>
            <td>${room.min}/${room.capacity}</td>
            <td>${offPrice ? offPrice.weekday_price.toLocaleString() : '-'}</td>
            <td>${offPrice ? offPrice.weekend_price.toLocaleString() : '-'}</td>
            <td>${offPrice ? offPrice.holiday_price.toLocaleString() : '-'}</td>
            <td>${peakPrice ? peakPrice.weekday_price.toLocaleString() : '-'}</td>
            <td>${peakPrice ? peakPrice.weekend_price.toLocaleString() : '-'}</td>
            <td>${peakPrice ? peakPrice.holiday_price.toLocaleString() : '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

init();

/* PC에서 마우스 드래그로 가격표를 옆으로 스크롤 (텍스트 드래그 선택은 막음) */
document.querySelectorAll('.table-wrap').forEach(track => {
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
        isDown = false;
    });

    track.addEventListener('mouseup', () => {
        isDown = false;
    });

    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.5;
        track.scrollLeft = scrollLeft - walk;
    });
});