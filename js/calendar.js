class ReservationCalendar extends HTMLElement {
    connectedCallback() {
        this.readonly = this.hasAttribute('readonly');
        this.datesonly = this.hasAttribute('datesonly');
        this.checkin = null;
        this.checkout = null;

        const today = new Date();
        this.currentYear = today.getFullYear();
        this.currentMonth = today.getMonth();

        this.reservedDates = new Set();
        this.roomId = null;

        this.render();
        this.bindEvents();
    }

    setReservedDates(reservations, roomId) {
        this.roomId = roomId;
        this.reservedDates = new Set();
        reservations
            .filter(r => r.room_id === roomId)
            .forEach(r => {
                const start = new Date(r.check_in_date);
                const end = new Date(r.check_out_date);
                const cur = new Date(start);
                while (cur < end) {
                    this.reservedDates.add(cur.toISOString().split('T')[0]);
                    cur.setDate(cur.getDate() + 1);
                }
            });
        this.renderBody();
    }

    render() {
        const summaryHTML = this.readonly ? `
        <div class="calendar-readonly-summary">
            <div class="res5-row">
                <span class="res5-label">입실</span>
                <div class="res5-readonly" id="checkinDisplay">-</div>
            </div>
            <div class="res5-row">
                <span class="res5-label">퇴실</span>
                <div class="res5-readonly" id="checkoutDisplay">-</div>
            </div>
        </div>` : '';

        this.innerHTML = `
        <div class="calendar-wrap">
            <div class="calendar-header">
                <button class="cal-prev">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <span class="cal-title"></span>
                <button class="cal-next">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>
            <div class="calendar-grid">
                <div class="cal-day-header">일</div>
                <div class="cal-day-header">월</div>
                <div class="cal-day-header">화</div>
                <div class="cal-day-header">수</div>
                <div class="cal-day-header">목</div>
                <div class="cal-day-header">금</div>
                <div class="cal-day-header">토</div>
            </div>
            <div class="calendar-body"></div>
        </div>
        ${summaryHTML}`;

        this.renderTitle();
        this.renderBody();
    }

    renderReadonlySummary() {
        if (!this.readonly) return;
        const checkinEl = this.querySelector('#checkinDisplay');
        const checkoutEl = this.querySelector('#checkoutDisplay');
        if (checkinEl) checkinEl.textContent = this.checkin || '-';
        if (checkoutEl) checkoutEl.textContent = this.checkout || '-';
    }

    renderTitle() {
        this.querySelector('.cal-title').textContent =
        `${this.currentYear}년 ${this.currentMonth + 1}월`;

        /* 이번 달이면 이전 달 버튼 비활성화 */
        const today = new Date();
        const prevBtn = this.querySelector('.cal-prev');
        if (
            this.currentYear === today.getFullYear() &&
            this.currentMonth === today.getMonth()
        ) {
            prevBtn.disabled = true;
            prevBtn.style.opacity = '0.3';
            prevBtn.style.cursor = 'default';
        } else {
            prevBtn.disabled = false;
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
        }
    }

    renderBody() {
        const body = this.querySelector('.calendar-body');
        body.innerHTML = '';

        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const lastDate = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalCells = 42;
        const prevMonthLastDate = new Date(this.currentYear, this.currentMonth, 0).getDate();

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'cal-cell';

            if (i < firstDay) {
                const d = prevMonthLastDate - firstDay + i + 1;
                cell.classList.add('other-month', 'disabled');
                cell.innerHTML = `<span class="cal-num">${d}</span>`;
            } else if (i >= firstDay + lastDate) {
                const d = i - firstDay - lastDate + 1;
                cell.classList.add('other-month', 'disabled');
                cell.innerHTML = `<span class="cal-num">${d}</span>`;
            } else {
                const d = i - firstDay + 1;
                const date = new Date(this.currentYear, this.currentMonth, d);
                const dateStr = date.toISOString().split('T')[0];
                const dayOfWeek = date.getDay();

                cell.dataset.date = dateStr;
                cell.innerHTML = `<span class="cal-num">${d}</span>`;

                if (dayOfWeek === 0) cell.classList.add('sunday');
                if (dayOfWeek === 6) cell.classList.add('saturday');

                if (date < today) {
                    cell.classList.add('disabled');
                } else if (this.reservedDates.has(dateStr)) {
                    cell.classList.add('reserved');
                    cell.innerHTML += `<span class="cal-label">예약완료</span>`;
                }

                if (this.checkin && this.checkout) {
                    if (dateStr >= this.checkin && dateStr <= this.checkout) {
                        cell.classList.add('in-range');
                        if (dateStr === this.checkin) {
                            cell.classList.add('selected');
                            cell.innerHTML += `<span class="cal-label white">입실</span>`;
                        }
                        if (dateStr === this.checkout) {
                            cell.classList.add('selected');
                            cell.innerHTML += `<span class="cal-label white">퇴실</span>`;
                        }
                    }
                } else if (this.checkin && dateStr === this.checkin) {
                    cell.classList.add('selected');
                    cell.innerHTML += `<span class="cal-label white">입실</span>`;
                }
            }

            body.appendChild(cell);
        }

        this.renderReadonlySummary();
    }

    bindEvents() {
        this.querySelector('.cal-prev').addEventListener('click', () => {
            const today = new Date();
            if (
                this.currentYear === today.getFullYear() &&
                this.currentMonth === today.getMonth()
            ) return;
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.renderTitle();
            this.renderBody();
        });

        this.querySelector('.cal-next').addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.renderTitle();
            this.renderBody();
        });

        this.querySelector('.calendar-body').addEventListener('click', (e) => {
            if (this.readonly) return;
            if (this.readonly || this.datesonly) return;

            const cell = e.target.closest('.cal-cell');
            if (
                !cell ||
                cell.classList.contains('disabled') ||
                cell.classList.contains('reserved')
            ) return;

            const dateStr = cell.dataset.date;
            if (!dateStr) return;

            /* 체크인만 선택된 상태에서 체크인을 다시 클릭 -> 선택 취소 */
            if (this.checkin && !this.checkout && dateStr === this.checkin) {
                this.checkin = null;
                this.renderBody();
                this.dispatchEvent(new CustomEvent('dateSelected', {
                    bubbles: true,
                    detail: { checkin: null, checkout: null }
                }));
                return;
            }

            /* 체크아웃까지 선택된 상태에서 체크아웃을 다시 클릭
               -> 체크아웃만 취소되고 체크인은 그대로 유지 */
            if (this.checkin && this.checkout && dateStr === this.checkout) {
                this.checkout = null;
                this.renderBody();
                this.dispatchEvent(new CustomEvent('dateSelected', {
                    bubbles: true,
                    detail: { checkin: this.checkin, checkout: null }
                }));
                return;
            }

            let newCheckin;
            let newCheckout;

            if (!this.checkin || (this.checkin && this.checkout)) {
                /* 새로 시작 */
                newCheckin = dateStr;
                newCheckout = null;
            } else if (dateStr < this.checkin) {
                /* 체크인보다 이전 날짜를 클릭 -> 기존 체크인은 체크아웃으로,
                   클릭한(더 이른) 날짜가 새 체크인이 됨 */
                newCheckin = dateStr;
                newCheckout = this.checkin;
            } else {
                /* 체크인 이후 날짜 클릭 -> 체크아웃 후보 */
                newCheckin = this.checkin;
                newCheckout = dateStr;
            }

            if (newCheckout) {
                const checkinDate = new Date(newCheckin);
                const checkoutDate = new Date(newCheckout);
                const nights = (checkoutDate - checkinDate) / (1000 * 60 * 60 * 24);
                if (nights > 6) {
                    document.getElementById('alertModal').show('6일 이상 예약하실 수 없습니다.');
                    return;
                }

                const cur = new Date(checkinDate);
                cur.setDate(cur.getDate() + 1);
                let hasReserved = false;
                while (cur < checkoutDate) {
                    if (this.reservedDates.has(cur.toISOString().split('T')[0])) {
                        hasReserved = true;
                        break;
                    }
                    cur.setDate(cur.getDate() + 1);
                }
                if (hasReserved) {
                    document.getElementById('alertModal').show('해당 일자에 이미 예약되어 있는 객실입니다.');
                    return;
                }
            }

            this.checkin = newCheckin;
            this.checkout = newCheckout;

            this.renderBody();

            this.dispatchEvent(new CustomEvent('dateSelected', {
                bubbles: true,
                detail: {
                    checkin: this.checkin,
                    checkout: this.checkout,
                }
            }));
        });
    }

    getSelectedDates() {
        return {
            checkin: this.checkin,
            checkout: this.checkout,
        };
    }
}

customElements.define('reservation-calendar', ReservationCalendar);