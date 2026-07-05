// ============ 页面宠物：像素小猫 ============

(function() {
    const WALK_GIF = 'pet/cat-sprite/catwalkx4.gif';

    const pet = document.createElement('div');
    pet.id = 'pagePet';
    pet.innerHTML = `
        <img src="${WALK_GIF}" style="width:72px;height:60px;display:block;" />
        <div class="cat-hearts" id="catHearts"></div>
    `;
    document.body.appendChild(pet);

    const img = pet.querySelector('img');

    let state = 'idle';
    let posX = window.innerWidth * 0.72;
    let posY = window.innerHeight * 0.65;
    let targetX = posX, targetY = posY;
    let facingRight = true;
    let stateTimer = 0;
    let dragResumeTimer = 0;
    let isDragging = false;
    let dragOffsetX = 0, dragOffsetY = 0;
    let walkPhase = 0;

    const SPEED = 0.7;

    pet.style.left = posX + 'px';
    pet.style.top = posY + 'px';

    function pickNewState() {
        if (Math.random() < 0.45) {
            state = 'walking';
            stateTimer = Date.now() + 2000 + Math.random() * 3500;
            pet.classList.remove('idling');
            pet.classList.add('walking');
            const margin = 100;
            targetX = margin + Math.random() * (window.innerWidth - margin * 2);
            targetY = margin + Math.random() * (window.innerHeight - margin * 2);
            facingRight = targetX > posX;
        } else {
            state = 'idle';
            stateTimer = Date.now() + 2500 + Math.random() * 5000;
            pet.classList.remove('walking');
            pet.classList.add('idling');
        }
    }

    let clickStart = 0;
    pet.addEventListener('mousedown', (e) => {
        clickStart = Date.now(); e.preventDefault();
        isDragging = true;
        pet.classList.add('dragging');
        pet.classList.remove('walking', 'idling');
        dragOffsetX = e.clientX - posX;
        dragOffsetY = e.clientY - posY;
        dragResumeTimer = 0;
    });
    pet.addEventListener('click', (e) => {
        if (Date.now() - clickStart > 200) return;
        e.stopPropagation();
        spawnHearts();
        pet.classList.add('petted');
        setTimeout(() => pet.classList.remove('petted'), 400);
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        posX = e.clientX - dragOffsetX;
        posY = e.clientY - dragOffsetY;
        targetX = posX; targetY = posY;
        pet.style.left = posX + 'px';
        pet.style.top = posY + 'px';
    });
    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        pet.classList.remove('dragging');
        dragResumeTimer = Date.now() + 3000;
        state = 'idle';
        pet.classList.add('idling');
    });
    pet.addEventListener('touchstart', (e) => {
        clickStart = Date.now(); e.preventDefault();
        isDragging = true;
        pet.classList.add('dragging');
        pet.classList.remove('walking', 'idling');
        const t = e.touches[0];
        dragOffsetX = t.clientX - posX;
        dragOffsetY = t.clientY - posY;
        dragResumeTimer = 0;
    });
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const t = e.touches[0];
        posX = t.clientX - dragOffsetX;
        posY = t.clientY - dragOffsetY;
        targetX = posX; targetY = posY;
        pet.style.left = posX + 'px';
        pet.style.top = posY + 'px';
    });
    document.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        pet.classList.remove('dragging');
        dragResumeTimer = Date.now() + 3000;
        state = 'idle';
        pet.classList.add('idling');
    });

    function spawnHearts() {
        const container = document.getElementById('catHearts');
        const hearts = ['❤️','💕','💖','✨','😻','🐟'];
        for (let i = 0; i < 6; i++) {
            const h = document.createElement('span');
            h.className = 'heart-particle';
            h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            h.style.left = (Math.random() * 50 - 25) + 'px';
            h.style.animationDelay = (i * 0.06) + 's';
            h.style.animationDuration = (0.9 + Math.random() * 0.5) + 's';
            container.appendChild(h);
            setTimeout(() => h.remove(), 1600);
        }
    }

    function update() {
        const now = Date.now();

        if (!isDragging && now >= dragResumeTimer) {
            if (now > stateTimer) pickNewState();
            if (state === 'walking') {
                const dx = targetX - posX;
                const dy = targetY - posY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 3) {
                    pickNewState();
                } else {
                    posX += (dx / dist) * SPEED;
                    posY += (dy / dist) * SPEED;
                    walkPhase += 0.1;
                    pet.style.left = posX + 'px';
                    pet.style.top = (posY + Math.abs(Math.sin(walkPhase)) * 2) + 'px';
                }
            } else {
                pet.style.left = posX + 'px';
                pet.style.top = posY + 'px';
            }
        }

        img.style.transform = facingRight ? 'scaleX(1)' : 'scaleX(-1)';
        requestAnimationFrame(update);
    }

    window.addEventListener('resize', () => {
        posX = Math.min(posX, window.innerWidth - 100);
        posY = Math.min(posY, window.innerHeight - 100);
        targetX = Math.min(targetX, window.innerWidth - 100);
        targetY = Math.min(targetY, window.innerHeight - 100);
    });

    stateTimer = Date.now() + 1000;
    update();
})();
