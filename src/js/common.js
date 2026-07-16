class PageHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <header>
            <div class="title">
                <a href="/index.html">H</a>
            </div>
            <nav class="navbar" id="navbar">
                <ul class="menu">
                    <li>
                        <a href="#">ABOUT</a>
                        <ul class="sub">
                            <li><a href="#">호텔 소개</a></li>
                            <li><a href="#">오시는길</a></li>
                        </ul>
                    </li>
                    <li>
                        <a href="#">ROOMS</a>
                        <ul class="sub">
                            <li><a href="#">ROOM 1</a></li>
                            <li><a href="#">ROOM 2</a></li>
                            <li><a href="#">ROOM 3</a></li>
                        </ul>
                    </li>
                    <li>
                        <a href="#">RESERVATION</a>
                        <ul class="sub">
                            <li><a href="/html/reservation1.html">예약안내</a></li>
                            <li><a href="/html/reservation2.html">실시간예약</a></li>
                        </ul>
                    </li>
                    <li>
                        <a href="#">COMMUNITY</a>
                        <ul class="sub">
                            <li><a href="#">공지사항</a></li>
                            <li><a href="#">이벤트</a></li>
                            <li><a href="#">FAQ</a></li>
                        </ul>
                    </li>
                </ul>
            </nav>
        </header>`;

        /* 모바일에서 서브메뉴 아코디언 토글 (한 번에 하나만 열림) */
        const menuItems = this.querySelectorAll('.menu > li');

        menuItems.forEach(li => {
            const link = li.querySelector('a');
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 1000) {
                    e.preventDefault();
                    const wasOpen = li.classList.contains('open');
                    menuItems.forEach(other => other.classList.remove('open'));
                    if (!wasOpen) {
                        li.classList.add('open');
                    }
                }
            });
        });

        /* 메뉴 외부 클릭 시 닫기 */
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                menuItems.forEach(li => li.classList.remove('open'));
            }
        });
    }
}
customElements.define("page-header", PageHeader);

class PageFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer>
            <div class="footer_title">
                <h1>H</h1>
            </div>
            <div class="footer_sns">
                <button class="sns" id="instagram">
                    <i class="fa-brands fa-instagram"></i>
                </button>                
                <button class="sns" id="facebook">
                    <i class="fa-brands fa-facebook"></i>
                </button>
                <button class="sns" id="youtube">
                    <i class="fa-brands fa-youtube"></i>
                </button>
            </div>
            <div class="footer_address">
                <p>경기 성남시 분당구 황새울로392번길 5 한국폴리텍대학 융합기술교육원</p>
            </div>
            <div class="footer_phone">
                <span>사업자등록번호 000-00-0000</span>
                <span>전화 012-345-6789</span>
                <span>팩스 01-234-5678</span>
            </div>
            <div class="footer_button">
                <button class="ftrBtn" id="termsofuse">이용약관</button>
                <button class="ftrBtn" id="privacypolicy">개인정보처리방침</button>
            </div>
            <div class="footer_copyright">
                <p>Copyrightⓒ 2025 예약연습 All rights reserved.</p>
            </div>
        </footer>`;
    }
}

customElements.define("page-footer", PageFooter);

class ToTopButton extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <button class="topBtn" id="topBtn">
            <i class="fa-solid fa-arrow-up"></i>
        </button>
        `;

        document.getElementById("topBtn").addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

customElements.define("top-button", ToTopButton);

class PageBanner extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute('title') || '';
        const subtitle = this.getAttribute('subtitle') || '';
        const bg = this.getAttribute('bg') || '';

        this.innerHTML = `
        <div class="page-banner" style="background-image: url('${bg}')">
            <div class="page-banner-text">
                <h2>${title}</h2>
                <p>${subtitle}</p>
            </div>
        </div>`;
    }
}

customElements.define('page-banner', PageBanner);

class CancellationPolicy extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="cancellation-policy">
            <p class="policy-title">취소 및 환불 규정</p>
            <div class="policy-content">
                <p>숙박 예정일 1일 전 18시까지는 위약금 없이 취소 및 변경이 가능합니다.</p>
                <p id="no_show">
                숙박 예정일 1일 전 18시 이후 취소/변경 및 노쇼(No-show) 발생 시,
                <span>- 성수기 : 최초 1일 숙박 요금의 80%가 위약금으로 부과됩니다.</span>
                <span>- 비수기(성수기 외 기간) : 최초 1일 숙박 요금의 10%가 위약금으로 부과됩니다.</span>
                </p>
                <p>일부 패키지의 경우 별도의 취소규정이 적용됩니다.</p>
            </div>
        </div>`;
    }
}

customElements.define('cancellation-policy', CancellationPolicy);

class AlertModal extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="alert-overlay" id="alertOverlay">
            <div class="alert-modal">
                <p class="alert-text" id="alertText"></p>
                <button class="alert-btn" id="alertCloseBtn">확인</button>
            </div>
        </div>`;

        this.querySelector('#alertCloseBtn').addEventListener('click', () => {
            this.hide();
        });

        this.querySelector('#alertOverlay').addEventListener('click', (e) => {
            if (e.target === this.querySelector('#alertOverlay')) {
                this.hide();
            }
        });
    }

    show(message) {
        this.querySelector('#alertText').textContent = message;
        this.querySelector('#alertOverlay').classList.add('active');
    }

    hide() {
        this.querySelector('#alertOverlay').classList.remove('active');
    }
}

customElements.define('alert-modal', AlertModal);