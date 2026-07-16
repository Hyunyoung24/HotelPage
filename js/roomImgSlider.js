const images = ['thumb1', 'thumb2', 'thumb3', 'thumb4'];
let currentIdx = 0;

function initRoomImgSlider() {
    const slider = document.getElementById('roomImgSlider');
    const thumbList = document.getElementById('roomThumbList');

    images.forEach((name) => {
        const img = document.createElement('img');
        img.src = `../img/${name}.jpg`;
        img.className = 'room-img-slide';
        slider.appendChild(img);
    });

    function slideTo(idx) {
        currentIdx = idx;
        slider.style.transform = `translateX(-${idx * 100}%)`;
        document.querySelectorAll('.room-thumb')
            .forEach((t, i) => t.classList.toggle('active', i === idx));
    }

    images.forEach((name, i) => {
        const thumb = document.createElement('img');
        thumb.src = `../img/${name}.jpg`;
        thumb.alt = `썸네일 ${i + 1}`;
        thumb.className = 'room-thumb';
        if (i === 0) thumb.classList.add('active');
        thumb.addEventListener('click', () => slideTo(i));
        thumbList.appendChild(thumb);
    });

    let startX = 0;
    let isDragging = false;

    slider.style.cursor = 'grab';

    slider.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startX = e.pageX;
        isDragging = true;
    });

    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        slider.style.cursor = 'grab';
        const diff = e.pageX - startX;
        if (Math.abs(diff) < 50) return;
        if (diff < 0 && currentIdx < images.length - 1) {
            slideTo(currentIdx + 1);
        } else if (diff > 0 && currentIdx > 0) {
            slideTo(currentIdx - 1);
        }
    });

    slider.addEventListener('mouseleave', () => {
        slider.style.cursor = 'grab';
    });
}