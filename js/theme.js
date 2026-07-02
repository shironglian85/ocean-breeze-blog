// ============ 主题 & 公共模块 ============

        // ============ 主题系统 ============
        const themePalettes = {
            sunset: {
                name: '🌅 落日微醺',
                dark: { bg:'#1a1008', card:'#241810', accent:'#f08c3c', accent2:'#f4a85c', text:'#ede4d8', muted:'#a89080', border:'#3a2818', hover:'#2c1c10', heroFrom:'#140b04', heroVia:'#1f0f08', heroTo:'#1a1008', glow:'240,140,60', particle:'244,168,92' },
                light:{ bg:'#fdf5ed', card:'#ffffff', accent:'#e07820', accent2:'#f08c3c', text:'#2a1a10', muted:'#8a6a50', border:'#e8d4c0', hover:'#f8e8d8', heroFrom:'#fce4c8', heroVia:'#f8d4a8', heroTo:'#fdf5ed', glow:'224,120,32', particle:'240,140,60' }
            },
            forest: {
                name: '🌿 森林物语',
                dark: { bg:'#0d1f15', card:'#162819', accent:'#5daa6f', accent2:'#7ab89b', text:'#dfe8e0', muted:'#8a9a8a', border:'#1f3a24', hover:'#1c3022', heroFrom:'#0a1a0f', heroVia:'#0f2415', heroTo:'#0d1f15', glow:'93,170,111', particle:'93,170,111' },
                light:{ bg:'#f0f5f1', card:'#ffffff', accent:'#3d7a4f', accent2:'#5daa6f', text:'#1a2a1d', muted:'#5a7a5a', border:'#c8dcc8', hover:'#e0ece0', heroFrom:'#b8d4b8', heroVia:'#d4e8d4', heroTo:'#f0f5f1', glow:'61,122,79', particle:'61,122,79' }
            },
            ocean: {
                name: '🌊 海风微澜',
                dark: { bg:'#0a1628', card:'#0f1f3a', accent:'#00b4d8', accent2:'#48cae4', text:'#e0e8f0', muted:'#8899aa', border:'#1a3050', hover:'#122844', heroFrom:'#001d3d', heroVia:'#003566', heroTo:'#0a1628', glow:'0,180,216', particle:'0,180,216' },
                light:{ bg:'#e8f4f8', card:'#ffffff', accent:'#0077b6', accent2:'#00b4d8', text:'#1a2a3a', muted:'#5a6a7a', border:'#c8dce4', hover:'#d8ecf4', heroFrom:'#90e0ef', heroVia:'#caf0f8', heroTo:'#e8f4f8', glow:'0,119,182', particle:'0,119,182' }
            },
            space: {
                name: '🌌 星辰低语',
                dark: { bg:'#080510', card:'#120c1f', accent:'#8b5cf6', accent2:'#a78bfa', text:'#e2e0e8', muted:'#8880a0', border:'#1e1840', hover:'#1a1430', heroFrom:'#050510', heroVia:'#0d0830', heroTo:'#080510', glow:'139,92,246', particle:'167,139,250' },
                light:{ bg:'#1a1525', card:'#241f35', accent:'#7c3aed', accent2:'#8b5cf6', text:'#e8e4f0', muted:'#9688b0', border:'#302840', hover:'#2a2240', heroFrom:'#120d20', heroVia:'#1a1040', heroTo:'#1a1525', glow:'124,58,237', particle:'139,92,246' }
            },
        };

        let currentTheme = localStorage.getItem('blog-palette') || 'sunset';
        let isLightMode = localStorage.getItem('blog-mode') === 'light';

        function applyTheme() {
            const palette = themePalettes[currentTheme];
            const colors = isLightMode ? palette.light : palette.dark;

            const root = document.documentElement;
            Object.entries(colors).forEach(([key, val]) => {
                root.style.setProperty(`--${key}`, val);
            });

            // 更新主题按钮图标
            document.getElementById('themeBtn').textContent = isLightMode ? '☀️' : '🌙';

            // 更新主题选择器高亮
            document.querySelectorAll('.theme-card').forEach(card => {
                card.classList.toggle('active', card.dataset.theme === currentTheme);
            });

            // 更新标题和页脚
            const themeName = themePalettes[currentTheme].name;
            document.title = `${themeName} · ${isLightMode ? '浅色' : '深色'}`;
            document.getElementById('blogTitle').textContent = themeName;
            document.getElementById('blogFooter').innerHTML = `© 2026 ${themeName.split(' ').slice(1).join(' ')} · 用 ❤️ 和 ☕ 搭建`;
            localStorage.setItem('blog-mode', isLightMode ? 'light' : 'dark');
            // 主题切换后重建粒子
            if (typeof initParticles === 'function') initParticles();
        }

        // 渲染主题选择器
        function renderThemePicker() {
            const picker = document.getElementById('themePicker');
            picker.innerHTML = Object.entries(themePalettes).map(([key, t]) => {
                const colors = isLightMode ? t.light : t.dark;
                return `<div class="theme-card" data-theme="${key}" onclick="switchTheme('${key}')"
                    style="flex:1;text-align:center;padding:10px 6px;border-radius:10px;cursor:pointer;border:2px solid ${key === currentTheme ? 'var(--accent)' : 'var(--border)'};background:${colors.card};transition:all 0.3s;font-size:1.4em;">
                    <div>${t.name.split(' ')[0]}</div>
                    <div style="display:flex;gap:4px;justify-content:center;margin-top:5px;">
                        <span style="width:10px;height:10px;border-radius:50%;background:${colors.accent};filter:brightness(1.5);"></span>
                        <span style="width:10px;height:10px;border-radius:50%;background:${colors.accent};"></span>
                        <span style="width:10px;height:10px;border-radius:50%;background:${colors.accent};filter:brightness(0.5);"></span>
                    </div>
                </div>`;
            }).join('');
        }

        function switchTheme(key) {
            currentTheme = key;
            renderThemePicker();
            applyTheme();
        }

        // 浮动按钮切换深色/浅色
        document.getElementById('themeBtn').addEventListener('click', () => {
            isLightMode = !isLightMode;
            renderThemePicker();
            applyTheme();
        });


        // ============ 座右铭管理 ============
        const defaultPhrases = [
            '代码是写给人看的，顺带能在机器上运行',
            'Stay hungry, stay foolish',
            '每一天都是学习的机会',
            '把想法变成代码，把代码变成世界'
        ];

        function loadPhrases() {
            const saved = localStorage.getItem('blog-phrases');
            if (saved) return JSON.parse(saved);
            localStorage.setItem('blog-phrases', JSON.stringify(defaultPhrases));
            return [...defaultPhrases];
        }

        function savePhrases(arr) {
            localStorage.setItem('blog-phrases', JSON.stringify(arr));
        }

        let phrases = loadPhrases();

        // 座右铭弹窗
        const quoteOverlay = document.getElementById('quoteOverlay');
        document.getElementById('quoteEditBtn').addEventListener('click', () => {
            renderQuoteList();
            quoteOverlay.classList.add('active');
        });
        document.getElementById('quoteCancelBtn').addEventListener('click', () => {
            quoteOverlay.classList.remove('active');
        });
        quoteOverlay.addEventListener('click', (e) => {
            if (e.target === quoteOverlay) quoteOverlay.classList.remove('active');
        });

        function renderQuoteList() {
            const list = document.getElementById('quoteList');
            list.innerHTML = phrases.map((q, i) => `
                <div class="quote-item">
                    <span>${q}</span>
                    <button onclick="deletePhrase(${i})" title="删除">✕</button>
                </div>
            `).join('');
        }

        function deletePhrase(idx) {
            if (phrases.length <= 1) { alert('至少保留一条座右铭！'); return; }
            phrases.splice(idx, 1);
            savePhrases(phrases);
            renderQuoteList();
            // 重置打字动画索引
            if (phraseIdx >= phrases.length) { phraseIdx = 0; charIdx = 0; isDeleting = false; }
        }

        document.getElementById('addQuoteBtn').addEventListener('click', () => {
            const input = document.getElementById('newQuote');
            const val = input.value.trim();
            if (!val) { alert('请输入内容！'); return; }
            phrases.push(val);
            savePhrases(phrases);
            input.value = '';
            renderQuoteList();
        });


        // ============ 打字效果 ============
        let phraseIdx = 0, charIdx = 0, isDeleting = false;
        const typingEl = document.getElementById('typing-text');

        function typeEffect() {
            const current = phrases[phraseIdx];
            if (isDeleting) {
                typingEl.textContent = current.substring(0, charIdx - 1);
                charIdx--;
            } else {
                typingEl.textContent = current.substring(0, charIdx + 1);
                charIdx++;
            }

            let speed = isDeleting ? 40 : 80;
            if (!isDeleting && charIdx === current.length) {
                speed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                speed = 400;
            }
            setTimeout(typeEffect, speed);
        }
        typeEffect();


        // ============ 粒子背景 ============
        const canvas = document.getElementById('particles');
        const ctx = canvas.getContext('2d');
        let particles = [];

        function resizeCanvas() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });

        function initParticles() {
            particles = [];
            const count = Math.floor(canvas.width / 14);
            for (let i = 0; i < count; i++) {
                if (currentTheme === 'forest') {
                    particles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        r: Math.random() * 3 + 1,
                        vx: (Math.random() - 0.5) * 0.4,
                        vy: Math.random() * 0.3 + 0.1,
                        alpha: Math.random() * 0.4 + 0.2,
                        rotation: Math.random() * Math.PI * 2,
                        rotSpeed: (Math.random() - 0.5) * 0.02,
                        wobble: Math.random() * 0.3,
                        wobbleSpeed: Math.random() * 0.02 + 0.01,
                    });
                } else if (currentTheme === 'sunset') {
                    // 落日：浮游余烬
                    particles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        r: Math.random() * 3.5 + 1.2,
                        vx: (Math.random() - 0.5) * 0.6,
                        vy: -(Math.random() * 0.6 + 0.3),
                        alpha: Math.random() * 0.5 + 0.45,
                        wobble: Math.random() * 0.5,
                        wobbleSpeed: Math.random() * 0.025 + 0.012,
                        life: Math.random(),
                    });
                } else if (currentTheme === 'space') {
                    // 太空：星辰
                    const isShootingStar = Math.random() < 0.08;
                    particles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        r: isShootingStar ? 1.2 : Math.random() * 2.2 + 0.3,
                        vx: isShootingStar ? -(Math.random() * 2 + 2) : (Math.random() - 0.5) * 0.15,
                        vy: isShootingStar ? (Math.random() - 0.5) * 0.3 : (Math.random() - 0.5) * 0.15,
                        alpha: Math.random() * 0.7 + 0.3,
                        twinkleSpeed: Math.random() * 0.03 + 0.005,
                        twinklePhase: Math.random() * Math.PI * 2,
                        isShootingStar,
                        trail: [],
                    });
                } else {
                    // 海洋：上浮气泡
                    particles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        r: Math.random() * 3.5 + 1,
                        vx: (Math.random() - 0.5) * 0.3,
                        vy: -(Math.random() * 0.4 + 0.15),
                        alpha: Math.random() * 0.35 + 0.15,
                        wobble: Math.random() * 0.5,
                        wobbleSpeed: Math.random() * 0.015 + 0.008,
                    });
                }
            }
        }
        initParticles();

        function drawBubble(ctx, x, y, r, color, alpha) {
            // 气泡主体（半透明圆形）
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${alpha * 0.3})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(${color}, ${alpha * 0.8})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            // 高光点（模拟水面反光）
            ctx.beginPath();
            ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
            ctx.fill();
        }

        function drawLeaf(ctx, x, y, r, rotation, color, alpha) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.beginPath();
            ctx.ellipse(0, 0, r, r * 0.45, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${alpha})`;
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-r, 0);
            ctx.lineTo(r, 0);
            ctx.strokeStyle = `rgba(${color}, ${alpha * 0.5})`;
            ctx.lineWidth = 0.3;
            ctx.stroke();
            ctx.restore();
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const style = getComputedStyle(document.documentElement);
            const color = style.getPropertyValue('--particle').trim();

            if (currentTheme === 'forest') {
                particles.forEach((p) => {
                    p.x += p.vx + Math.sin(p.y * p.wobbleSpeed) * p.wobble;
                    p.y += p.vy;
                    p.rotation += p.rotSpeed;
                    if (p.y > canvas.height + 20) { p.y = -10; p.x = Math.random() * canvas.width; }
                    if (p.x < -20) p.x = canvas.width + 10;
                    if (p.x > canvas.width + 20) p.x = -10;
                    drawLeaf(ctx, p.x, p.y, p.r, p.rotation, color, p.alpha);
                });
            } else if (currentTheme === 'sunset') {
                // 落日：浮游余烬
                particles.forEach((p) => {
                    p.x += p.vx + Math.sin(p.y * p.wobbleSpeed) * p.wobble;
                    p.y += p.vy;
                    p.life += 0.0004;
                    if (p.life > 1) p.life = 0;
                    if (p.y < -20 || p.life === 0) {
                        p.y = canvas.height + Math.random() * 20;
                        p.x = Math.random() * canvas.width;
                    }
                    if (p.x < -20) p.x = canvas.width + 10;
                    if (p.x > canvas.width + 20) p.x = -10;

                    const fadeAlpha = p.alpha * (1 - p.life);
                    // 大光晕
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${color}, ${fadeAlpha * 0.15})`;
                    ctx.fill();
                    // 中光晕
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${color}, ${fadeAlpha * 0.35})`;
                    ctx.fill();
                    // 核心
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                    gradient.addColorStop(0, `rgba(255, 240, 200, ${fadeAlpha})`);
                    gradient.addColorStop(0.4, `rgba(255, 180, 100, ${fadeAlpha * 0.8})`);
                    gradient.addColorStop(1, `rgba(${color}, 0)`);
                    ctx.fillStyle = gradient;
                    ctx.fill();
                });
            } else if (currentTheme === 'space') {
                // 太空：闪烁星辰 + 流星
                particles.forEach((p) => {
                    if (p.isShootingStar) {
                        p.x += p.vx;
                        p.y += p.vy;
                        if (p.x < -40 || p.y < -40 || p.y > canvas.height + 40) {
                            // 重置流星位置
                            p.x = canvas.width + Math.random() * 100;
                            p.y = Math.random() * canvas.height;
                            p.vx = -(Math.random() * 2 + 2);
                            p.vy = (Math.random() - 0.5) * 0.3;
                        }
                        // 流星轨迹（尾迹在移动方向的反方向）
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p.x - p.vx * 8, p.y - p.vy * 8);
                        ctx.strokeStyle = `rgba(${color}, ${p.alpha * 0.7})`;
                        ctx.lineWidth = p.r;
                        ctx.stroke();
                        // 流星头部
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                        ctx.fill();
                    } else {
                        // 普通星辰：缓慢漂移 + 闪烁
                        p.x += p.vx;
                        p.y += p.vy;
                        if (p.x < -10) p.x = canvas.width + 5;
                        if (p.x > canvas.width + 10) p.x = -5;
                        if (p.y < -10) p.y = canvas.height + 5;
                        if (p.y > canvas.height + 10) p.y = -5;

                        const twinkle = Math.sin(p.twinklePhase) * 0.3;
                        const currentAlpha = Math.max(0.1, Math.min(1, p.alpha + twinkle));
                        p.twinklePhase += p.twinkleSpeed;

                        // 星辉（外圈光晕）
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${color}, ${currentAlpha * 0.15})`;
                        ctx.fill();
                        // 星星主体
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.9})`;
                        ctx.fill();
                    }
                });
            } else {
                // 海洋：上浮气泡
                particles.forEach((p) => {
                    p.x += p.vx + Math.sin(p.y * p.wobbleSpeed) * p.wobble;
                    p.y += p.vy;
                    if (p.y < -20) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
                    if (p.x < -20) p.x = canvas.width + 10;
                    if (p.x > canvas.width + 20) p.x = -10;
                    drawBubble(ctx, p.x, p.y, p.r, color, p.alpha);
                });
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

        // 主题初始化（放在粒子代码之后，确保 canvas 已就绪）
        renderThemePicker();
        applyTheme();


        // ============ 阅读进度条 ============
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            document.getElementById('progressBar').style.width = progress + '%';

            // 回到顶部按钮
            document.getElementById('backTop').classList.toggle('visible', scrollTop > 400);
        });

        document.getElementById('backTop').addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // ============ 模拟访客数 ============
        const today = new Date().toDateString();
        const stored = JSON.parse(localStorage.getItem('visitor') || '{}');
        if (stored.date !== today) {
            stored.date = today;
            stored.count = Math.floor(Math.random() * 50) + 10;
            localStorage.setItem('visitor', JSON.stringify(stored));
        }
        document.getElementById('visitorCount').innerHTML =
            `👀 今日访客：<strong style="color:var(--accent);">${stored.count}</strong>`;

