document.querySelectorAll('.room-card').forEach((card, i) => {
    card.addEventListener('click', () => {
        location.href = `reservation3.html?idx=${i + 1}`;
    });
});