// ================================================================
//                    SCRIPT.JS - نسخه کامل
//         شامل تمام مراحل ۱ تا ۵ + صفحه نهایی
// ================================================================

// ===================== متغیرهای عمومی =====================
let currentLevel = 1;
const totalLevels = 5;
let redirectTimer = null;

// ===================== مدیریت صفحات =====================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('hidden');
        screen.classList.add('active');
    }
}

// ===================== لودینگ =====================
function simulateLoading() {
    let progress = 0;
    const ring = document.getElementById('progressRing');
    const label = document.getElementById('progressLabel');
    const interval = setInterval(() => {
        progress += 1 + Math.floor(Math.random() * 5);
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        const deg = (progress / 100) * 360;
        ring.style.background = `conic-gradient(#f0b0d0 ${deg}deg, #2a1f3a ${deg}deg)`;
        label.textContent = progress + '%';
        if (progress === 100) {
            setTimeout(() => {
                showScreen('password-screen');
                document.getElementById('passwordInput').focus();
            }, 400);
        }
    }, 70);
}
simulateLoading();

// ===================== پسورد =====================
document.getElementById('passwordBtn').addEventListener('click', handlePassword);
document.getElementById('passwordInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handlePassword();
});

function handlePassword() {
    const input = document.getElementById('passwordInput');
    if (input.value.trim() === 'Samin') {
        showScreen('game-screen');
        // حروف مرحله ۱ رو نشون بده
        document.querySelectorAll('#level1-container .letter.hidden').forEach(el => {
            el.classList.remove('hidden');
            el.classList.add('found');
        });
        initLevel1();
    } else {
        input.classList.add('error-shake');
        setTimeout(() => input.classList.remove('error-shake'), 600);
        input.value = '';
        input.focus();
    }
}

// ===================== مدیریت مراحل =====================
function showLevel(levelNum) {
    document.querySelectorAll('.level-container').forEach(el => {
        el.classList.remove('active-level');
        el.classList.add('hidden-level');
    });
    const target = document.getElementById(`level${levelNum}-container`);
    if (target) {
        target.classList.remove('hidden-level');
        target.classList.add('active-level');
    }
    currentLevel = levelNum;
}

// ===================== تابع کانفتی =====================
function launchConfetti(count = 60, colors = ['#ff6b9d', '#ffb6c1', '#ffd1dc', '#ff8aac', '#ffd700', '#ffa5b9']) {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    for (let i = 0; i < count; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + '%';
        c.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.style.width = (4 + Math.random() * 10) + 'px';
        c.style.height = (4 + Math.random() * 10) + 'px';
        c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        c.style.animationDuration = (1.8 + Math.random() * 3) + 's';
        c.style.animationDelay = Math.random() * 2.5 + 's';
        container.appendChild(c);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 5000);
}

// ===================== شافل آرایه =====================
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ===================== انتقال به مرحله بعد =====================
function goToNextLevel() {
    if (currentLevel < totalLevels) {
        const nextLevel = currentLevel + 1;
        showLevel(nextLevel);
        // راه‌اندازی مرحله بعد
        switch(nextLevel) {
            case 2: initLevel2(); break;
            case 3: initLevel3(); break;
            case 4: initLevel4(); break;
            case 5: initLevel5(); break;
        }
    } else {
        // اگه مرحله ۵ تموم شد بره به صفحه نهایی
        setTimeout(() => {
            showScreen('final-screen');
            initFinalScreen();
        }, 600);
    }
}

// ================================================================
//                    سطح ۱: بازی حافظه (کارت‌ها)
// ================================================================
function initLevel1() {
    const puzzleGrid = document.getElementById('puzzleGrid');
    const progressText = document.getElementById('progressTextLevel1');
    const successOverlay = document.getElementById('successOverlay');
    const letterReveal = document.getElementById('letterReveal');
    const successMsg = document.getElementById('successMsg');
    const successSub = document.getElementById('successSub');
    const timerText = document.getElementById('timerText');

    const imageUrls = ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg', '07.jpg'];
    const totalPairs = 7;
    const totalCards = 14;
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let isLocked = false;
    let gameCompleted = false;

    puzzleGrid.innerHTML = '';
    progressText.textContent = `0 / ${totalPairs} جفت پیدا شد`;
    successOverlay.classList.remove('show');

    let cardData = [];
    for (let i = 0; i < totalPairs; i++) {
        const imgIndex = i % imageUrls.length;
        cardData.push({ id: i, img: imageUrls[imgIndex] });
        cardData.push({ id: i, img: imageUrls[imgIndex] });
    }
    shuffleArray(cardData);

    const isMobile = window.innerWidth <= 600;
    const cols = isMobile ? 4 : 7;
    const rows = Math.ceil(totalCards / cols);
    puzzleGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    puzzleGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    cardData.forEach((data) => {
        const slot = document.createElement('div');
        slot.className = 'puzzle-slot';
        slot.dataset.cardId = data.id;
        slot.dataset.matched = 'false';
        slot.dataset.flipped = 'false';

        const back = document.createElement('div');
        back.className = 'card-back';
        back.textContent = '✦';
        slot.appendChild(back);

        const front = document.createElement('div');
        front.className = 'card-front';
        front.style.backgroundImage = `url(${data.img})`;
        slot.appendChild(front);

        slot.addEventListener('click', () => onCardClick(slot));
        slot.addEventListener('touchstart', (e) => {
            e.preventDefault();
            onCardClick(slot);
        }, { passive: false });

        puzzleGrid.appendChild(slot);
        cards.push(slot);
    });

    function onCardClick(card) {
        if (isLocked || gameCompleted) return;
        if (card.dataset.matched === 'true') return;
        if (card.dataset.flipped === 'true') return;
        if (flippedCards.length >= 2) return;

        card.dataset.flipped = 'true';
        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            isLocked = true;
            const card1 = flippedCards[0];
            const card2 = flippedCards[1];

            if (card1.dataset.cardId === card2.dataset.cardId) {
                card1.dataset.matched = 'true';
                card2.dataset.matched = 'true';
                card1.classList.add('matched');
                card2.classList.add('matched');
                matchedPairs++;
                flippedCards = [];
                isLocked = false;
                progressText.textContent = `${matchedPairs} / ${totalPairs} جفت پیدا شد`;

                if (matchedPairs === totalPairs) {
                    gameCompleted = true;
                    setTimeout(() => {
                        // نمایش حرف "د"
                        const letterEl = document.getElementById('l1-letter0');
                        if (letterEl) {
                            letterEl.classList.remove('hidden');
                            letterEl.classList.add('found');
                        }
                        letterReveal.textContent = 'د';
                        successMsg.textContent = '"حرف اول پیدا شد..."';
                        successSub.textContent = '✨ مرحله ۱ کامل شد ✨';
                        successOverlay.classList.add('show');
                        launchConfetti();
                        
                        // تایمر برای رفتن به مرحله بعد
                        let countdown = 3;
                        timerText.textContent = `⏳ ${countdown} ثانیه تا مرحله بعد...`;
                        if (redirectTimer) clearInterval(redirectTimer);
                        redirectTimer = setInterval(() => {
                            countdown--;
                            if (countdown > 0) {
                                timerText.textContent = `⏳ ${countdown} ثانیه تا مرحله بعد...`;
                            } else {
                                clearInterval(redirectTimer);
                                timerText.textContent = '🔄 در حال انتقال...';
                                goToNextLevel();
                            }
                        }, 1000);
                    }, 500);
                }
            } else {
                card1.classList.add('wrong');
                card2.classList.add('wrong');
                setTimeout(() => {
                    card1.dataset.flipped = 'false';
                    card2.dataset.flipped = 'false';
                    card1.classList.remove('flipped', 'wrong');
                    card2.classList.remove('flipped', 'wrong');
                    flippedCards = [];
                    isLocked = false;
                }, 600);
            }
        }
    }
}

// ================================================================
//                    سطح ۲: پیدا کردن کلمات
// ================================================================
function initLevel2() {
    const targetWords = [
        { word: 'خوژگل', color: '#ff6b9d' },
        { word: 'عشقم', color: '#6bcfff' },
        { word: 'زندگیم', color: '#6bff9d' }
    ];

    const allLetters = ['خ', 'و', 'ژ', 'گ', 'ل', 'ع', 'ش', 'ق', 'م', 'ز', 'ن', 'د', 'گ', 'ی', 'م'];
    const lettersGrid = document.getElementById('lettersGrid');
    const progressText = document.getElementById('progressTextLevel2');
    const successOverlay = document.getElementById('successOverlay');
    const letterReveal = document.getElementById('letterReveal');
    const successMsg = document.getElementById('successMsg');
    const successSub = document.getElementById('successSub');
    const timerText = document.getElementById('timerText');

    let foundWords = [false, false, false];
    let selectedLetters = [];
    let letterTiles = [];
    let totalFound = 0;
    let gameCompleted = false;

    // ریست کلمات پیدا شده
    ['word1', 'word2', 'word3'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = `❓ کلمه ${i + 1}`;
            el.classList.remove('found');
            el.style.borderColor = '';
            el.style.color = '';
        }
    });

    lettersGrid.innerHTML = '';
    progressText.textContent = '0 / 3 کلمه پیدا شد';
    successOverlay.classList.remove('show');

    // ایجاد حروف
    let letters = [...allLetters];
    while (letters.length < 30) {
        letters.push(allLetters[Math.floor(Math.random() * allLetters.length)]);
    }
    shuffleArray(letters);
    letters = letters.slice(0, 30);

    const isMobile = window.innerWidth <= 600;
    const cols = isMobile ? 5 : 6;
    const rows = Math.ceil(letters.length / cols);
    lettersGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    lettersGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    letters.forEach((char) => {
        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.textContent = char;
        tile.dataset.char = char;
        tile.dataset.found = 'false';

        let belongsTo = -1;
        targetWords.forEach((tw, i) => {
            if (tw.word.includes(char)) belongsTo = i;
        });
        tile.dataset.belongsTo = belongsTo;

        tile.addEventListener('click', () => onTileClick(tile));
        tile.addEventListener('touchstart', (e) => {
            e.preventDefault();
            onTileClick(tile);
        }, { passive: false });

        lettersGrid.appendChild(tile);
        letterTiles.push(tile);
    });

    // هایلایت کردن حروف مرتبط با کلمات
    targetWords.forEach((tw, wordIdx) => {
        const chars = tw.word.split('');
        const indices = [];
        letterTiles.forEach((tile, idx) => {
            if (chars.includes(tile.dataset.char) && tile.dataset.found === 'false') {
                indices.push(idx);
            }
        });
        const shuffled = shuffleArray([...indices]);
        const selected = shuffled.slice(0, 3);
        selected.forEach(idx => {
            if (letterTiles[idx]) {
                letterTiles[idx].style.borderColor = targetWords[wordIdx].color;
                letterTiles[idx].style.boxShadow = `0 0 15px ${targetWords[wordIdx].color}33`;
            }
        });
    });

    function onTileClick(tile) {
        if (gameCompleted) return;
        if (tile.dataset.found === 'true') return;
        if (selectedLetters.includes(tile)) {
            tile.classList.remove('selected');
            selectedLetters = selectedLetters.filter(t => t !== tile);
            return;
        }

        tile.classList.add('selected');
        selectedLetters.push(tile);
        checkWords();
    }

    function checkWords() {
        const selectedChars = selectedLetters.map(t => t.dataset.char).join('');

        targetWords.forEach((tw, index) => {
            if (foundWords[index]) return;

            if (selectedChars === tw.word) {
                foundWords[index] = true;
                totalFound++;
                progressText.textContent = `${totalFound} / 3 کلمه پیدا شد`;

                selectedLetters.forEach(t => {
                    t.dataset.found = 'true';
                    t.classList.add('found');
                    t.classList.remove('selected');
                    t.style.borderColor = tw.color;
                    t.style.boxShadow = `0 0 20px ${tw.color}44`;
                });

                const badges = ['word1', 'word2', 'word3'];
                const el = document.getElementById(badges[index]);
                if (el) {
                    el.textContent = `✅ ${tw.word}`;
                    el.classList.add('found');
                    el.style.borderColor = tw.color;
                    el.style.color = tw.color;
                }

                selectedLetters = [];
                launchConfetti();

                if (totalFound === 3) {
                    gameCompleted = true;
                    setTimeout(() => {
                        // نمایش حرف "خ"
                        const letterEl = document.getElementById('l2-letter1');
                        if (letterEl) {
                            letterEl.classList.remove('hidden');
                            letterEl.classList.add('found');
                        }
                        letterReveal.textContent = 'خ';
                        successMsg.textContent = '"حرف دوم پیدا شد..."';
                        successSub.textContent = '✨ مرحله ۲ کامل شد ✨';
                        successOverlay.classList.add('show');
                        launchConfetti();

                        let countdown = 3;
                        timerText.textContent = `⏳ ${countdown} ثانیه تا مرحله بعد...`;
                        if (redirectTimer) clearInterval(redirectTimer);
                        redirectTimer = setInterval(() => {
                            countdown--;
                            if (countdown > 0) {
                                timerText.textContent = `⏳ ${countdown} ثانیه تا مرحله بعد...`;
                            } else {
                                clearInterval(redirectTimer);
                                timerText.textContent = '🔄 در حال انتقال...';
                                goToNextLevel();
                            }
                        }, 1000);
                    }, 600);
                }
                return;
            }
        });

        if (selectedLetters.length >= 6) {
            selectedLetters.forEach(t => {
                t.classList.remove('selected');
                t.classList.add('wrong');
                setTimeout(() => t.classList.remove('wrong'), 500);
            });
            selectedLetters = [];
        }
    }
}

// ================================================================
//                    سطح ۳: پیدا کردن ایموجی متفاوت
// ================================================================
function initLevel3() {
    const emojiGrid = document.getElementById('emojiGrid');
    const attemptSpan = document.getElementById('attemptCount');
    const successOverlay = document.getElementById('successOverlay');
    const letterReveal = document.getElementById('letterReveal');
    const successMsg = document.getElementById('successMsg');
    const successSub = document.getElementById('successSub');
    const timerText = document.getElementById('timerText');

    const TOTAL_EMOJIS = 30;
    const MAIN_EMOJI = '💗';
    const TARGET_EMOJI = '🎀';

    let attempts = 0;
    let gameCompleted = false;
    let targetIndex = -1;

    emojiGrid.innerHTML = '';
    attempts = 0;
    attemptSpan.textContent = '0';
    gameCompleted = false;
    successOverlay.classList.remove('show');

    // ساخت آرایه ایموجی‌ها
    let emojis = [];
    for (let i = 0; i < TOTAL_EMOJIS; i++) {
        emojis.push(MAIN_EMOJI);
    }
    targetIndex = Math.floor(Math.random() * TOTAL_EMOJIS);
    emojis[targetIndex] = TARGET_EMOJI;

    emojiGrid.style.gridTemplateColumns = 'repeat(6, 1fr)';

    emojis.forEach((emoji, index) => {
        const tile = document.createElement('div');
        tile.className = 'emoji-tile';
        tile.textContent = emoji;
        tile.dataset.index = index;
        tile.dataset.isTarget = (index === targetIndex) ? 'true' : 'false';
        tile.addEventListener('click', () => onTileClick(tile));
        tile.addEventListener('touchstart', (e) => {
            e.preventDefault();
            onTileClick(tile);
        }, { passive: false });
        emojiGrid.appendChild(tile);
    });

    function onTileClick(tile) {
        if (gameCompleted) return;

        const isTarget = tile.dataset.isTarget === 'true';

        if (!isTarget) {
            attempts++;
            attemptSpan.textContent = attempts;
            tile.classList.add('wrong');
            setTimeout(() => tile.classList.remove('wrong'), 500);
            return;
        }

        // درست
        gameCompleted = true;
        tile.classList.add('found-success');
        launchConfetti();

        // نمایش حرف "ت"
        const letterEl = document.getElementById('l3-letter2');
        if (letterEl) {
            letterEl.classList.remove('hidden');
            letterEl.classList.add('found');
        }

        setTimeout(() => {
            letterReveal.textContent = 'ت';
            successMsg.textContent = '"حرف سوم پیدا شد..."';
            successSub.textContent = '✨ مرحله ۳ کامل شد ✨';
            successOverlay.classList.add('show');
            launchConfetti();

            let countdown = 3;
            timerText.textContent = `⏳ ${countdown} ثانیه تا مرحله بعد...`;
            if (redirectTimer) clearInterval(redirectTimer);
            redirectTimer = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    timerText.textContent = `⏳ ${countdown} ثانیه تا مرحله بعد...`;
                } else {
                    clearInterval(redirectTimer);
                    timerText.textContent = '🔄 در حال انتقال...';
                    goToNextLevel();
                }
            }, 1000);
        }, 500);
    }
}

// ================================================================
//                    سطح ۴: جور کردن نیمه قلب‌ها
// ================================================================
function initLevel4() {
    const PAIRS = [
        { id: 0, color: '#ff6b9d', left: '◀', right: '▶', emoji: '💗' },
        { id: 1, color: '#ff1744', left: '◀', right: '▶', emoji: '❤️' },
        { id: 2, color: '#ff4081', left: '◀', right: '▶', emoji: '💖' },
        { id: 3, color: '#f06292', left: '◀', right: '▶', emoji: '💕' },
        { id: 4, color: '#ec407a', left: '◀', right: '▶', emoji: '💓' },
        { id: 5, color: '#d81b60', left: '◀', right: '▶', emoji: '💘' }
    ];

    const LOVE_MESSAGES = [
        "نیمه‌ات را پیدا کردی... 💗",
        "هر قلبی یه جفت داره... ❤️",
        "تو نیمه گمشده‌ای... 💖",
        "دل تو برای کی می‌تپه؟ 💕",
        "عشق یعنی پیدا کردن هم‌رنگ... 💓",
        "قلب تو مال کیه؟ 💘"
    ];

    const heartGrid = document.getElementById('heartGrid');
    const progressFill = document.getElementById('progressFill');
    const progressLabel = document.getElementById('progressLabel');
    const pairCountSpan = document.getElementById('pairCount');
    const loveMessage = document.getElementById('loveMessage');
    const loveText = document.getElementById('loveText');
    const successOverlay = document.getElementById('successOverlay');
    const letterReveal = document.getElementById('letterReveal');
    const successMsg = document.getElementById('successMsg');
    const successSub = document.getElementById('successSub');
    const timerText = document.getElementById('timerText');

    let tiles = [];
    let selected = [];
    let matchedPairs = 0;
    let isLocked = false;
    let gameCompleted = false;
    let messageTimeout = null;

    heartGrid.innerHTML = '';
    selected = [];
    matchedPairs = 0;
    isLocked = false;
    gameCompleted = false;
    loveMessage.classList.remove('show');
    successOverlay.classList.remove('show');
    updateProgress();

    // ساخت جفت‌ها
    let halfCards = [];
    PAIRS.forEach((pair, idx) => {
        halfCards.push({ pairId: idx, side: 'left', display: pair.left, color: pair.color, emoji: pair.emoji });
        halfCards.push({ pairId: idx, side: 'right', display: pair.right, color: pair.color, emoji: pair.emoji });
    });
    shuffleArray(halfCards);

    heartGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';

    halfCards.forEach((data) => {
        const tile = document.createElement('div');
        tile.className = 'heart-tile';
        tile.dataset.pairId = data.pairId;
        tile.dataset.side = data.side;
        tile.dataset.color = data.color;
        tile.dataset.matched = 'false';

        const halfSpan = document.createElement('span');
        halfSpan.className = 'half-heart';
        halfSpan.textContent = data.display;
        halfSpan.style.color = data.color;
        halfSpan.style.textShadow = `0 0 20px ${data.color}33`;
        tile.appendChild(halfSpan);

        tile.addEventListener('click', () => onTileClick(tile));
        tile.addEventListener('touchstart', (e) => {
            e.preventDefault();
            onTileClick(tile);
        }, { passive: false });

        heartGrid.appendChild(tile);
        tiles.push(tile);
    });

    function updateProgress() {
        const pct = (matchedPairs / PAIRS.length) * 100;
        progressFill.style.width = pct + '%';
        progressLabel.textContent = `💗 ${matchedPairs} از ${PAIRS.length} قلب کامل شد`;
        pairCountSpan.textContent = matchedPairs;
    }

    function showLoveMessage(index) {
        if (messageTimeout) clearTimeout(messageTimeout);
        const msg = LOVE_MESSAGES[index % LOVE_MESSAGES.length];
        loveText.textContent = msg;
        loveMessage.classList.add('show');
        messageTimeout = setTimeout(() => {
            loveMessage.classList.remove('show');
        }, 1800);
    }

    function onTileClick(tile) {
        if (isLocked) return;
        if (gameCompleted) return;
        if (tile.dataset.matched === 'true') return;
        if (selected.includes(tile)) return;
        if (selected.length >= 2) return;

        tile.classList.add('selected');
        selected.push(tile);

        if (selected.length === 2) {
            isLocked = true;
            const tile1 = selected[0];
            const tile2 = selected[1];
            const pairId1 = parseInt(tile1.dataset.pairId);
            const pairId2 = parseInt(tile2.dataset.pairId);

            if (pairId1 === pairId2) {
                tile1.dataset.matched = 'true';
                tile2.dataset.matched = 'true';
                tile1.classList.remove('selected');
                tile2.classList.remove('selected');
                tile1.classList.add('matched');
                tile2.classList.add('matched');

                const span1 = tile1.querySelector('.half-heart');
                const span2 = tile2.querySelector('.half-heart');
                const color = tile1.dataset.color;
                span1.textContent = '💗';
                span1.style.color = color;
                span1.style.textShadow = `0 0 30px ${color}66`;
                span2.textContent = '💗';
                span2.style.color = color;
                span2.style.textShadow = `0 0 30px ${color}66`;

                matchedPairs++;
                updateProgress();
                showLoveMessage(matchedPairs - 1);
                launchConfetti(25, ['#ff6b9d', '#ffb6c1', '#ffd1dc', '#ff8aac']);

                selected = [];
                isLocked = false;

                if (matchedPairs === PAIRS.length) {
                    gameCompleted = true;
                    setTimeout(() => {
                        // نمایش حرف "ر"
                        const letterEl = document.getElementById('l4-letter3');
                        if (letterEl) {
                            letterEl.classList.remove('hidden');
                            letterEl.classList.add('found');
                        }
                        letterReveal.textContent = 'ر';
                        successMsg.textContent = '"نیمه‌ات رو پیدا کردی... 💕"';
                        successSub.textContent = '✨ قلب‌هایت کامل شد ✨';
                        successOverlay.classList.add('show');
                        launchConfetti(80, ['#ff6b9d', '#ffb6c1', '#ffd1dc', '#ff8aac', '#ff4d7a']);

                        let countdown = 3;
                        timerText.textContent = `⏳ ${countdown} ثانیه تا مرحله بعد...`;
                        if (redirectTimer) clearInterval(redirectTimer);
                        redirectTimer = setInterval(() => {
                            countdown--;
                            if (countdown > 0) {
                                timerText.textContent = `⏳ ${countdown} ثانیه تا مرحله بعد...`;
                            } else {
                                clearInterval(redirectTimer);
                                timerText.textContent = '🔄 در حال انتقال...';
                                goToNextLevel();
                            }
                        }, 1000);
                    }, 400);
                }
            } else {
                tile1.classList.add('wrong');
                tile2.classList.add('wrong');
                setTimeout(() => {
                    tile1.classList.remove('selected', 'wrong');
                    tile2.classList.remove('selected', 'wrong');
                    selected = [];
                    isLocked = false;
                }, 550);
            }
        }
    }
}

// ================================================================
//                    سطح ۵: معمای عشق
// ================================================================
function initLevel5() {
    const RIDDLES = [{
        id: 0,
        title: 'معمای ۱',
        text: 'من همیشه باهاتم، ولی نمی‌تونیم همدیگه رو لمس کنیم. من تو رو می‌بینم، تو من رو می‌بینی. من کی هستم؟',
        correct: 0,
        options: [
            { emoji: '🪞', label: 'آینه' },
            { emoji: '🌙', label: 'ماه' },
            { emoji: '☀️', label: 'خورشید' },
            { emoji: '⭐', label: 'ستاره' }
        ],
        emoji: '🪞',
        desc: 'آینه‌ای که همیشه توی اون به خودت نگاه میکنی...'
    }, {
        id: 1,
        title: 'معمای ۲',
        text: 'من کوچیکم ولی بزرگترین جای دنیا رو دارم. من توی سینه‌ات جا دارم، ولی کل دنیا رو توی خودم نگه میدارم. من چی هستم؟',
        correct: 0,
        options: [
            { emoji: '💗', label: 'قلب' },
            { emoji: '🧠', label: 'مغز' },
            { emoji: '👻', label: 'روح' },
            { emoji: '💭', label: 'فکر' }
        ],
        emoji: '💗',
        desc: 'قلبی که همیشه برای تو می‌تپه...'
    }, {
        id: 2,
        title: 'معمای ۳',
        text: 'من بی‌صدام ولی بلندترین صدای دنیا رو دارم. من ناپیدام ولی همه جا هستم. من چی هستم؟',
        correct: 0,
        options: [
            { emoji: '❤️', label: 'عشق' },
            { emoji: '🤝', label: 'دوستی' },
            { emoji: '👨‍👩‍👧', label: 'خانواده' },
            { emoji: '🌈', label: 'امید' }
        ],
        emoji: '❤️',
        desc: 'عشقی که هیچوقت تموم نمیشه...'
    }, {
        id: 3,
        title: 'معمای ۴',
        text: 'من توی چشمانت هستم، توی لبخندت، توی صدایت. من تو رو زیبا میکنم. من چی هستم؟',
        correct: 0,
        options: [
            { emoji: '👀', label: 'نگاه عاشقانه' },
            { emoji: '😊', label: 'لبخند' },
            { emoji: '🤗', label: 'بغل کردن' },
            { emoji: '😘', label: 'بوسه' }
        ],
        emoji: '👀',
        desc: 'نگاهی که همیشه منتظرته...'
    }];

    const LOVE_MESSAGES = [
        '🪞 "آینه‌ای که همیشه توی اون به خودت نگاه میکنی..."',
        '💗 "قلبی که همیشه برای تو می‌تپه..."',
        '❤️ "عشقی که هیچوقت تموم نمیشه..."',
        '👀 "نگاهی که همیشه منتظرته..."'
    ];

    const FRAME_IMAGES = ['🪞', '💗', '❤️', '👀'];
    const FRAME_LABELS = ['آینه', 'قلب', 'عشق', 'نگاه'];

    const framesGrid = document.getElementById('framesGrid');
    const heartFill = document.getElementById('heartFill');
    const heartCount = document.getElementById('heartCount');
    const progressFill5 = document.getElementById('progressFill5');
    const solveCount = document.getElementById('solveCount');
    const riddleModal = document.getElementById('riddleModal');
    const riddleNumber = document.getElementById('riddleNumber');
    const riddleText = document.getElementById('riddleText');
    const riddleOptions = document.getElementById('riddleOptions');
    const loveMessage5 = document.getElementById('loveMessage5');
    const modalClose = document.getElementById('modalClose');
    const successOverlay = document.getElementById('successOverlay');
    const letterReveal = document.getElementById('letterReveal');
    const successMsg = document.getElementById('successMsg');
    const successSub = document.getElementById('successSub');
    const timerText = document.getElementById('timerText');

    let solved = [false, false, false, false];
    let currentRiddle = 0;
    let isModalOpen = false;
    let isLocked = false;
    let gameCompleted = false;

    framesGrid.innerHTML = '';
    heartFill.style.clipPath = 'inset(100% 0 0 0)';
    heartFill.classList.remove('partial', 'complete');
    heartCount.textContent = '0/4';
    progressFill5.style.width = '0%';
    solveCount.textContent = '0';
    successOverlay.classList.remove('show');

    // ساخت قاب‌ها
    for (let i = 0; i < RIDDLES.length; i++) {
        const frame = document.createElement('div');
        frame.className = 'frame-tile';
        frame.dataset.index = i;
        frame.dataset.solved = 'false';

        const num = document.createElement('span');
        num.className = 'frame-number';
        num.textContent = `✦ ${i + 1}`;
        frame.appendChild(num);

        const content = document.createElement('div');
        content.className = 'frame-content';

        const qMark = document.createElement('span');
        qMark.className = 'question-mark';
        qMark.textContent = '?';
        content.appendChild(qMark);

        const emoji = document.createElement('span');
        emoji.className = 'frame-emoji';
        emoji.textContent = FRAME_IMAGES[i];
        content.appendChild(emoji);

        const label = document.createElement('span');
        label.className = 'frame-label';
        label.textContent = FRAME_LABELS[i];
        content.appendChild(label);

        const desc = document.createElement('span');
        desc.className = 'frame-desc';
        desc.textContent = RIDDLES[i].desc;
        content.appendChild(desc);

        frame.appendChild(content);

        const glow = document.createElement('div');
        glow.className = 'solve-glow';
        frame.appendChild(glow);

        frame.addEventListener('click', () => onFrameClick(i));
        frame.addEventListener('touchstart', (e) => {
            e.preventDefault();
            onFrameClick(i);
        }, { passive: false });

        framesGrid.appendChild(frame);
    }

    function updateHeart() {
        const done = solved.filter(Boolean).length;
        const pct = (done / RIDDLES.length) * 100;
        const clip = (100 - pct) + '% 0 0 0';
        heartFill.style.clipPath = `inset(0 ${clip})`;

        if (done === RIDDLES.length) {
            heartFill.classList.add('complete');
            heartFill.classList.remove('partial');
        } else if (done > 0) {
            heartFill.classList.add('partial');
            heartFill.classList.remove('complete');
        } else {
            heartFill.classList.remove('partial', 'complete');
        }

        heartCount.textContent = `${done}/${RIDDLES.length}`;
        progressFill5.style.width = pct + '%';
        solveCount.textContent = done;
    }

    function onFrameClick(index) {
        if (isLocked || gameCompleted) return;
        if (solved[index]) return;

        for (let i = 0; i < index; i++) {
            if (!solved[i]) {
                const frame = framesGrid.children[i];
                frame.classList.add('wrong-anim');
                setTimeout(() => frame.classList.remove('wrong-anim'), 500);
                return;
            }
        }

        currentRiddle = index;
        openRiddle(index);
    }

    function openRiddle(index) {
        const riddle = RIDDLES[index];
        riddleNumber.textContent = `✦ ${riddle.title} ✦`;
        riddleText.textContent = riddle.text;
        loveMessage5.textContent = '';
        loveMessage5.classList.remove('show');
        isModalOpen = true;
        isLocked = true;

        riddleOptions.innerHTML = '';
        const shuffledOptions = shuffleArray([...riddle.options]);
        shuffledOptions.forEach((opt) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span class="opt-emoji">${opt.emoji}</span> ${opt.label}`;
            btn.addEventListener('click', () => onOptionClick(index, btn, opt.label));
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                onOptionClick(index, btn, opt.label);
            }, { passive: false });
            riddleOptions.appendChild(btn);
        });

        riddleModal.classList.add('show');
    }

    function closeRiddle() {
        riddleModal.classList.remove('show');
        isModalOpen = false;
        isLocked = false;
    }

    modalClose.addEventListener('click', closeRiddle);

    function onOptionClick(riddleIndex, btn, label) {
        if (solved[riddleIndex]) return;
        if (btn.classList.contains('disabled')) return;

        const riddle = RIDDLES[riddleIndex];
        const isCorrect = label === riddle.options[riddle.correct].label;

        document.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));

        if (isCorrect) {
            btn.classList.add('correct');
            solveRiddle(riddleIndex);
        } else {
            btn.classList.add('wrong');
            setTimeout(() => {
                btn.classList.remove('wrong', 'disabled');
                document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('disabled'));
            }, 500);
        }
    }

    function solveRiddle(index) {
        solved[index] = true;

        const frame = framesGrid.children[index];
        frame.dataset.solved = 'true';
        frame.classList.add('solved');
        frame.classList.remove('wrong-anim');

        loveMessage5.textContent = LOVE_MESSAGES[index];
        loveMessage5.classList.add('show');

        launchConfetti(30, ['#ffd700', '#ff6b9d', '#ffb6c1']);
        updateHeart();

        setTimeout(() => {
            closeRiddle();
            if (solved.every(Boolean)) {
                setTimeout(() => completeGame(), 400);
            }
        }, 1500);
    }

    function completeGame() {
        if (gameCompleted) return;
        gameCompleted = true;

        // نمایش حرف "م"
        const letterEl = document.getElementById('l5-letter4');
        if (letterEl) {
            letterEl.classList.remove('hidden');
            letterEl.classList.add('found');
        }

        launchConfetti(100, ['#ffd700', '#ff6b9d', '#ffb6c1', '#ffd1dc', '#ff8aac']);

        setTimeout(() => {
            letterReveal.textContent = 'م';
            successMsg.textContent = '"عشق رو پیدا کردی... 💕"';
            successSub.textContent = '✨ ۴ معمای عشق رو حل کردی ✨';
            successOverlay.classList.add('show');
            launchConfetti(80, ['#ffd700', '#ff6b9d', '#ffb6c1', '#ffd1dc']);

            let countdown = 3;
            timerText.textContent = `⏳ ${countdown} ثانیه تا مرحله بعد...`;
            if (redirectTimer) clearInterval(redirectTimer);
            redirectTimer = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    timerText.textContent = `⏳ ${countdown} ثانیه تا مرحله بعد...`;
                } else {
                    clearInterval(redirectTimer);
                    timerText.textContent = '🔄 در حال انتقال...';
                    goToNextLevel();
                }
            }, 1000);
        }, 600);
    }

    // بستن مودال با ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalOpen) {
            closeRiddle();
        }
    });
}

// ================================================================
//                    صفحه نهایی (تخته نقاشی)
// ================================================================
function initFinalScreen() {
    const canvas = document.getElementById('drawCanvas');
    const ctx = canvas.getContext('2d');
    const canvasHint = document.getElementById('canvasHint');

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentColor = '#ff6b9d';
    let lineWidth = 4;
    let drawHistory = [];
    let historyIndex = -1;
    let emojiSelected = false;

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const width = rect.width - 4;
        const aspectRatio = 16 / 9;
        const height = width / aspectRatio;
        canvas.width = width * 2;
        canvas.height = height * 2;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(2, 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = currentColor;
        redrawHistory();
    }

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;
        return { x, y };
    }

    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        const pos = getPos(e);
        lastX = pos.x;
        lastY = pos.y;
        canvasHint.style.opacity = '0';
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
    }

    function draw(e) {
        e.preventDefault();
        if (!isDrawing) return;
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastX = pos.x;
        lastY = pos.y;
    }

    function stopDrawing(e) {
        if (isDrawing) {
            isDrawing = false;
            const imageData = canvas.toDataURL();
            drawHistory = drawHistory.slice(0, historyIndex + 1);
            drawHistory.push(imageData);
            historyIndex = drawHistory.length - 1;
        }
    }

    function redrawHistory() {
        if (historyIndex >= 0 && historyIndex < drawHistory.length) {
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
                ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
            };
            img.src = drawHistory[historyIndex];
            canvasHint.style.opacity = '0';
        } else {
            ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
            canvasHint.style.opacity = '1';
        }
    }

    // ====== رویدادهای نقاشی ======
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });

    // ====== رنگ‌ها ======
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            this.classList.add('active');
            currentColor = this.dataset.color;
            ctx.strokeStyle = currentColor;
        });
    });

    // ====== پاک کردن ======
    document.getElementById('clearCanvasBtn').addEventListener('click', function() {
        ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
        drawHistory = [];
        historyIndex = -1;
        canvasHint.style.opacity = '1';
    });

    // ====== برگرد ======
    document.getElementById('undoCanvasBtn').addEventListener('click', function() {
        if (historyIndex > 0) {
            historyIndex--;
            redrawHistory();
        }
    });

    // ====== ایموجی ======
    document.querySelectorAll('.emoji-grid-final .emoji-item').forEach(item => {
        item.addEventListener('click', function() {
            if (emojiSelected && this.classList.contains('selected')) {
                this.classList.remove('selected', 'pop');
                document.querySelectorAll('.emoji-grid-final .emoji-item').forEach(el => {
                    el.classList.remove('dimmed');
                    el.style.opacity = '1';
                    el.style.pointerEvents = 'auto';
                    el.style.transform = 'scale(1)';
                });
                emojiSelected = false;
                return;
            }

            document.querySelectorAll('.emoji-grid-final .emoji-item').forEach(el => {
                el.classList.remove('selected', 'dimmed', 'pop');
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
                el.style.transform = 'scale(1)';
            });

            this.classList.add('selected', 'pop');
            document.querySelectorAll('.emoji-grid-final .emoji-item').forEach(el => {
                if (el !== this) {
                    el.classList.add('dimmed');
                    el.style.opacity = '0.12';
                    el.style.pointerEvents = 'none';
                    el.style.transform = 'scale(0.7)';
                }
            });

            emojiSelected = true;
            launchConfetti(20, ['#ff6b9d', '#ffd700']);
        });

        item.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.click();
        }, { passive: false });
    });

    // ====== مقداردهی اولیه ======
    resizeCanvas();
    drawHistory.push(canvas.toDataURL());
    historyIndex = 0;

    // کانفتی خوش‌آمدگویی
    setTimeout(() => {
        launchConfetti(35, ['#ff6b9d', '#ffb6c1', '#ffd1dc']);
    }, 600);

    // ====== ریسایز ======
    window.addEventListener('resize', resizeCanvas);

    // ====== دکمه‌ها ======
    document.getElementById('restartBtn')?.addEventListener('click', () => {
        location.reload();
    });

    document.getElementById('homeBtn')?.addEventListener('click', () => {
        showScreen('password-screen');
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
    });

    // جلوگیری از اسکرول
    document.addEventListener('touchmove', function(e) {
        if (e.target.closest('.board')) {
            if (e.target.tagName === 'TEXTAREA') return;
            e.preventDefault();
        }
    }, { passive: false });

    console.log('✨ تخته عشق آماده است!');
}

// ================================================================
//                    راه‌اندازی اولیه
// ================================================================
// همه چیز از لودینگ شروع میشه و بعدش پسورد
console.log('🎀 Samin Game loaded successfully!');