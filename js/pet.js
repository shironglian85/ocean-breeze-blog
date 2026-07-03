// ============ 页面宠物：像素小猫 ============

(function() {
    const WALK_GIF = 'pet/cat-sprite/catwalkx4.gif';
    const SPRITE_SHEET = 'pet/cat-sprite/catspritesx4.gif';

    // 创建容器
    const pet = document.createElement('div');
    pet.id = 'pagePet';
    pet.innerHTML = `
        <canvas id="petCanvas" width="80" height="70"></canvas>
        <img id="petGif" src="${WALK_GIF}" style="display:none;width:72px;height:60px;" />
        <div class="cat-hearts" id="catHearts"></div>
    `;
    document.body.appendChild(pet);

    const canvas = pet.querySelector('#petCanvas');
    const ctx = canvas.getContext('2d');
    const gifImg = pet.querySelector('#petGif');

    // 从 GIF 截取第一帧作为静止图
    let idleFrame = null;
    let spriteFrames = [];
    const FRAME_W = 80;
    const FRAME_H = 70;

    // 加载静止帧
    function captureIdleFrame() {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = FRAME_W;
        offCanvas.height = FRAME_H;
        const offCtx = offCanvas.getContext('2d');
        offCtx.drawImage(gifImg, 0, 0, FRAME_W, FRAME_H);
        idleFrame = offCanvas;
    }

    // 尝试加载精灵图
    const spriteImg = new Image();
    spriteImg.onload = function() {
        // 解析精灵图帧 (假设横向排列，每帧 ~91px 宽)
        const sheetW = spriteImg.width;
        const sheetH = spriteImg.height;
        const numFrames = Math.floor(sheetW / FRAME_W);
        for (let i = 0; i < numFrames; i++) {
            const fc = document.createElement('canvas');
            fc.width = FRAME_W;
            fc.height = FRAME_H;
            const fctx = fc.getContext('2d');
            fctx.drawImage(spriteImg, i * FRAME_W, 0, FRAME_W, FRAME_H, 0, 0, FRAME_W, FRAME_H);
            spriteFrames.push(fc);
        }
    };
    spriteImg.src = SPRITE_SHEET;

    // 等 GIF 加载后截图
    gifImg.onload = function() {
        if (!idleFrame) captureIdleFrame();
    };
    // GIF 可能已缓存
    if (gifImg.complete) captureIdleFrame();

    // 状态
    let state = 'idle';
    let posX = window.innerWidth * 0.72;
    let posY = window.innerHeight * 0.65;
    let targetX = posX;
    let targetY = posY;
    let facingRight = true;
    let stateTimer = 0;
    let blinkTimer = 0;
    let nextBlink = 150;
    let walkPhase = 0;
    let frameIdx = 0;
    let frameTimer = 0;
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let dragResumeTimer = 0;

    const SPEED = 0.7;

    pet.style.left = posX + 'px';
    pet.style.top = posY + 'px';

    function pickNewState() {
        const r = Math.random();
        if (r < 0.45) {
            startWalking();
        } else if (r < 0.8) {
            state = 'idle';
            stateTimer = Date.now() + 2500 + Math.random() * 5000;
            pet.classList.remove('walking', 'sitting');
            pet.classList.add('idling');
        } else {
            state = 'sitting';
            stateTimer = Date.now() + 3000 + Math.random() * 4000;
            pet.classList.remove('walking', 'idling');
            pet.classList.add('sitting');
        }
    }

    function startWalking() {
        state = 'walking';
        stateTimer = Date.now() + 2000 + Math.random() * 3500;
        pet.classList.remove('idling', 'sitting');
        pet.classList.add('walking');
        const margin = 100;
        targetX = margin + Math.random() * (window.innerWidth - margin * 2);
        targetY = margin + Math.random() * (window.innerHeight - margin * 2);
        facingRight = targetX > posX;
    }

    // 拖动
    let clickStart = 0;
    pet.addEventListener('mousedown', (e) => {
        clickStart = Date.now();
        e.preventDefault();
        isDragging = true;
        pet.classList.add('dragging');
        pet.classList.remove('walking', 'idling', 'sitting');
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
        targetX = posX;
        targetY = posY;
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

    // 触摸支持
    pet.addEventListener('touchstart', (e) => {
        clickStart = Date.now();
        e.preventDefault();
        isDragging = true;
        pet.classList.add('dragging');
        pet.classList.remove('walking', 'idling', 'sitting');
        const touch = e.touches[0];
        dragOffsetX = touch.clientX - posX;
        dragOffsetY = touch.clientY - posY;
        dragResumeTimer = 0;
    });
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        posX = touch.clientX - dragOffsetX;
        posY = touch.clientY - dragOffsetY;
        targetX = posX;
        targetY = posY;
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

        if (isDragging || now < dragResumeTimer) {
            pet.style.left = posX + 'px';
            pet.style.top = posY + 'px';
        }

        if (isDragging || now < dragResumeTimer) {
            // 画静止帧
            drawIdle();
            blinkTimer++;
            if (blinkTimer > nextBlink) {
                blinkTimer = 0;
                nextBlink = 80 + Math.floor(Math.random() * 300);
            }
            requestAnimationFrame(update);
            return;
        }

        if (now > stateTimer) pickNewState();

        // 移动
        if (state === 'walking') {
            const dx = targetX - posX;
            const dy = targetY - posY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 3) {
                pickNewState();
            } else {
                posX += (dx / dist) * SPEED;
                posY += (dy / dist) * SPEED;
                walkPhase += 0.12;
                const bounce = Math.abs(Math.sin(walkPhase)) * 2;
                pet.style.left = posX + 'px';
                pet.style.top = (posY + bounce) + 'px';
                // 走路的帧动画
                frameTimer++;
                if (frameTimer > 6) {
                    frameTimer = 0;
                    frameIdx = (frameIdx + 1) % (spriteFrames.length || 4);
                }
                drawFrame(frameIdx);
            }
        } else {
            pet.style.left = posX + 'px';
            pet.style.top = posY + 'px';
            drawIdle();
        }

        // 翻转朝向
        canvas.style.transform = facingRight ? 'scaleX(1)' : 'scaleX(-1)';

        // 眨眼
        blinkTimer++;
        if (blinkTimer > nextBlink) {
            blinkTimer = 0;
            nextBlink = 80 + Math.floor(Math.random() * 300);
        }

        requestAnimationFrame(update);
    }

    function drawIdle() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (spriteFrames.length > 0) {
            ctx.drawImage(spriteFrames[0], 0, 0, FRAME_W, FRAME_H);
        } else if (idleFrame) {
            ctx.drawImage(idleFrame, 0, 0);
        }
    }

    function drawFrame(idx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (spriteFrames.length > 0) {
            idx = idx % spriteFrames.length;
            ctx.drawImage(spriteFrames[idx], 0, 0, FRAME_W, FRAME_H);
        } else if (idleFrame) {
            // 没有精灵图，用 GIF 显示（会自己动）
            ctx.drawImage(gifImg, 0, 0, FRAME_W, FRAME_H);
        }
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
