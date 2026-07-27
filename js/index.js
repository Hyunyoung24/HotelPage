document.querySelectorAll('.scroll-track').forEach(track => {
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
        const walk = (x - startX) * 1.5;   /* 스크롤 속도, 조정 가능 */
        track.scrollLeft = scrollLeft - walk;
    });
});

const modalOverlay = document.getElementById('modalOverlay');
const modalImg = document.getElementById('modalImg');


document.querySelectorAll('#roomsTrack img').forEach(img => {
    img.style.cursor = 'pointer';
    img.style.pointerEvents = 'auto';

    img.addEventListener('click', (e) => {
        if (Math.abs(e.movementX) > 5 || Math.abs(e.movementY) > 5) return;
        modalImg.src = img.src;
        modalOverlay.classList.add('active');
    });
});

modalOverlay.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
    modalImg.src = '';
});