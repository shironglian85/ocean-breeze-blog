// ============ Ocean Breeze 统一渲染引擎 ============

(function() {
    // 全屏宠物 Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'petCanvas';
    canvas.style.cssText = [
        'position:fixed',
        'top:0;left:0',
        'width:100%;height:100%',
        'z-index:160',
        'pointer-events:none',   // 不阻止页面点击，事件走 document 监听
        'display:block',
    ].join(';');
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
        canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
        ctx.setTransform(
            window.devicePixelRatio || 1, 0, 0,
            window.devicePixelRatio || 1, 0, 0
        );
    }
    resize();
    window.addEventListener('resize', resize);

    // ======== 渲染层管理 ========
    const layers = [];   // { update(), draw(ctx) }

    // ======== 主循环 ========
    function loop() {
        ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            if (layer.update) layer.update();
        }
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            if (layer.draw) layer.draw(ctx);
        }

        requestAnimationFrame(loop);
    }

    // ======== 输入事件分发 ========
    // Canvas 设置了 pointer-events:none，所以事件监听挂在 document 上。
    // 鼠标坐标通过 clientX/clientY 获取（即 canvas 逻辑坐标）。
    const inputState = {
        mouseX: 0, mouseY: 0,
        mouseDown: false,
        rightClick: false,
    };

    document.addEventListener('mousemove', function(e) {
        inputState.mouseX = e.clientX;
        inputState.mouseY = e.clientY;
    });

    document.addEventListener('mousedown', function(e) {
        if (e.button === 0) inputState.mouseDown = true;
        if (e.button === 2) {
            inputState.rightClick = true;
            inputState.mouseX = e.clientX;
            inputState.mouseY = e.clientY;
        }
    });

    document.addEventListener('mouseup', function(e) {
        if (e.button === 0) inputState.mouseDown = false;
    });

    document.addEventListener('contextmenu', function(e) {
        // 不阻止默认行为——后续阶段在特定条件下才阻止
    });

    // 触摸事件
    document.addEventListener('touchmove', function(e) {
        if (e.touches.length > 0) {
            inputState.mouseX = e.touches[0].clientX;
            inputState.mouseY = e.touches[0].clientY;
        }
    }, { passive: true });

    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 0) {
            inputState.mouseX = e.touches[0].clientX;
            inputState.mouseY = e.touches[0].clientY;
            inputState.mouseDown = true;
        }
    });

    document.addEventListener('touchend', function() {
        inputState.mouseDown = false;
    });

    // ======== 公开 API ========
    window.Renderer = {
        canvas,
        ctx,

        addLayer: function(layer) {
            if (!layers.includes(layer)) {
                layers.push(layer);
            }
        },

        removeLayer: function(layer) {
            const idx = layers.indexOf(layer);
            if (idx >= 0) layers.splice(idx, 1);
        },

        getInput: function() {
            return inputState;
        },

        start: function() {
            requestAnimationFrame(loop);
        },

        resize: resize,

        // ======== Canvas UI 原语 ========
        UI: {
            // 圆角矩形
            roundRect: function(ctx, x, y, w, h, r, fill, stroke, lw) {
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                if (fill) { ctx.fillStyle = fill; ctx.fill(); }
                if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
            },

            // 自动换行文本块 — 返回总绘制高度
            textBlock: function(ctx, text, x, y, maxWidth, lineHeight) {
                const lines = [];
                const paragraphs = text.split('\n');
                for (const para of paragraphs) {
                    if (para === '') { lines.push(''); continue; }
                    let line = '';
                    for (const ch of para) {
                        const test = line + ch;
                        if (ctx.measureText(test).width > maxWidth && line.length > 0) {
                            lines.push(line);
                            line = ch;
                        } else {
                            line = test;
                        }
                    }
                    if (line) lines.push(line);
                }

                const lh = lineHeight || 20;
                lines.forEach(function(ln, i) {
                    ctx.fillText(ln, x, y + (i + 1) * lh);
                });
                return lines.length * lh;
            },

            // 面板（带标题栏 + 关闭按钮区）
            panel: function(ctx, x, y, w, h, title) {
                // 阴影
                ctx.shadowColor = 'rgba(0,0,0,0.4)';
                ctx.shadowBlur = 20;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 4;
                Renderer.UI.roundRect(ctx, x, y, w, h, 14, 'rgba(30,20,16,0.95)', 'rgba(200,140,100,0.4)', 1.5);
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;

                // 标题栏分割线
                if (title) {
                    ctx.fillStyle = 'rgba(200,140,100,0.3)';
                    ctx.fillRect(x + 16, y + 42, w - 32, 1);
                    ctx.fillStyle = '#e8c8a0';
                    ctx.font = 'bold 16px "PingFang SC","Microsoft YaHei",sans-serif';
                    ctx.fillText(title, x + 20, y + 30);
                }
            },

            // 按钮 — 返回 {x,y,w,h} 供 hit-test
            button: function(ctx, x, y, w, h, text, hovered) {
                if (hovered) {
                    Renderer.UI.roundRect(ctx, x, y, w, h, 8, 'rgba(200,140,100,0.3)', 'rgba(200,140,100,0.7)', 1.5);
                    ctx.fillStyle = '#fff';
                } else {
                    Renderer.UI.roundRect(ctx, x, y, w, h, 8, 'rgba(200,140,100,0.1)', 'rgba(200,140,100,0.3)', 1);
                    ctx.fillStyle = '#d0b090';
                }
                ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, x + w / 2, y + h / 2);
                ctx.textAlign = 'left';
                ctx.textBaseline = 'alphabetic';
                return { x: x, y: y, w: w, h: h };
            },

            // 滚动指示器
            scrollbar: function(ctx, x, y, h, contentH, scrollY) {
                if (contentH <= h) return; // 内容不够长，不显示
                const thumbH = Math.max(30, (h / contentH) * h);
                const thumbY = y + (scrollY / contentH) * h;
                // 轨道
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                ctx.fillRect(x, y, 6, h);
                // 滑块
                Renderer.UI.roundRect(ctx, x, thumbY, 6, thumbH, 3, 'rgba(200,140,100,0.5)', null);
            },
        },
    };
})();
