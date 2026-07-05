// ============ 猫的程序化绘制（共用） ============

const PetDraw = (function() {

    // ======== 精灵图加载 ========
    var sprites = {};
    var spritesReady = false;

    (function loadSprites() {
        var map = {
            pipi: 'pet/sprites/pipi-bg.png',
            baozang: 'pet/sprites/baozang-bg.png',
            xiaobu: 'pet/sprites/xiaobu-bg.png',
        };
        var keys = Object.keys(map);
        var loaded = 0;

        keys.forEach(function(key) {
            var img = new Image();
            img.onload = function() {
                sprites[key] = img;
                loaded++;
                if (loaded >= keys.length) spritesReady = true;
            };
            img.onerror = function() {
                loaded++;
                if (loaded >= keys.length) spritesReady = true;
            };
            img.src = map[key];
        });
    })();

    // ======== 基础形状 ========

    function drawBody(ctx, t, s) {
        const bw = t.bodyW, bh = t.bodyH;
        // 呼吸动画（idle 时身体微微缩放）
        let scaleY = 1;
        if (s.state === 'idle') {
            scaleY = 1 + Math.sin(s.animPhase) * 0.04;
        }

        ctx.save();
        ctx.scale(1, scaleY);

        // 身体主体
        ctx.beginPath();
        ctx.ellipse(0, 0, bw / 2, bh / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = t.fur;
        ctx.fill();
        ctx.strokeStyle = t.furDark;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 腹部浅色
        ctx.beginPath();
        ctx.ellipse(bw * 0.06, bh * 0.15, bw * 0.32, bh * 0.28, 0, 0, Math.PI * 2);
        ctx.fillStyle = t.furLight;
        ctx.fill();

        ctx.restore();
    }

    function drawHead(ctx, t, s) {
        const headX = t.bodyW / 2 + t.headR * 0.25;
        const headY = -t.bodyH * 0.15;

        ctx.beginPath();
        ctx.arc(headX, headY, t.headR, 0, Math.PI * 2);
        ctx.fillStyle = t.fur;
        ctx.fill();
        ctx.strokeStyle = t.furDark;
        ctx.lineWidth = 1;
        ctx.stroke();

        return { x: headX, y: headY };
    }

    function drawEars(ctx, t, s, headPos) {
        const earBaseY = headPos.y - t.headR * 0.75;
        const spread = t.headR * 0.55;
        const earTipY = earBaseY - t.earH;

        // 左耳
        ctx.beginPath();
        ctx.moveTo(headPos.x - spread - t.earW / 2, earBaseY);
        ctx.lineTo(headPos.x - spread, earTipY);
        ctx.lineTo(headPos.x - spread + t.earW, earBaseY);
        ctx.closePath();
        ctx.fillStyle = t.fur;
        ctx.fill();
        ctx.strokeStyle = t.furDark;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 左耳内侧
        ctx.beginPath();
        ctx.moveTo(headPos.x - spread - t.earW * 0.2, earBaseY);
        ctx.lineTo(headPos.x - spread, earTipY + 3);
        ctx.lineTo(headPos.x - spread + t.earW * 0.6, earBaseY);
        ctx.closePath();
        ctx.fillStyle = t.earInner;
        ctx.fill();

        // 右耳
        ctx.beginPath();
        ctx.moveTo(headPos.x + spread - t.earW, earBaseY);
        ctx.lineTo(headPos.x + spread, earTipY);
        ctx.lineTo(headPos.x + spread + t.earW / 2, earBaseY);
        ctx.closePath();
        ctx.fillStyle = t.fur;
        ctx.fill();
        ctx.strokeStyle = t.furDark;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 右耳内侧
        ctx.beginPath();
        ctx.moveTo(headPos.x + spread - t.earW * 0.6, earBaseY);
        ctx.lineTo(headPos.x + spread, earTipY + 3);
        ctx.lineTo(headPos.x + spread + t.earW * 0.2, earBaseY);
        ctx.closePath();
        ctx.fillStyle = t.earInner;
        ctx.fill();
    }

    function drawEyes(ctx, t, s, headPos) {
        const eyeY = headPos.y - t.headR * 0.1;
        const spread = t.headR * 0.4;
        const eyeR = t.headR * 0.22;

        // 眨眼动画
        let eyeScaleY = 1;
        if (s.blinkFrame >= 2) {
            eyeScaleY = 0.1;  // 闭眼
        } else if (s.blinkFrame === 1) {
            eyeScaleY = 0.5;  // 半闭
        }

        // 左眼
        drawOneEye(ctx, headPos.x - spread, eyeY, eyeR, eyeScaleY, t, s);
        // 右眼
        drawOneEye(ctx, headPos.x + spread, eyeY, eyeR, eyeScaleY, t, s);
    }

    function drawOneEye(ctx, cx, cy, r, scaleY, t, s) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, scaleY);

        // 眼白
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // 虹膜
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
        ctx.fillStyle = t.eyeColor;
        ctx.fill();

        // 瞳孔
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#111';
        ctx.fill();

        // 高光
        ctx.beginPath();
        ctx.arc(r * 0.25, -r * 0.3, r * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        ctx.restore();
    }

    function drawNose(ctx, t, s, headPos) {
        const noseX = headPos.x + t.headR * 0.35;
        const noseY = headPos.y + t.headR * 0.25;

        ctx.beginPath();
        ctx.moveTo(noseX, noseY - 3);
        ctx.lineTo(noseX + 3.5, noseY + 2);
        ctx.lineTo(noseX - 3.5, noseY + 2);
        ctx.closePath();
        ctx.fillStyle = t.noseColor;
        ctx.fill();

        // 嘴巴
        ctx.beginPath();
        ctx.moveTo(noseX, noseY + 2);
        ctx.lineTo(noseX + 5, noseY + 7);
        ctx.moveTo(noseX, noseY + 2);
        ctx.lineTo(noseX - 5, noseY + 7);
        ctx.strokeStyle = t.furDark;
        ctx.lineWidth = 0.8;
        ctx.stroke();
    }

    function drawWhiskers(ctx, t, s, headPos) {
        const wx = headPos.x + t.headR * 0.2;
        const wy = headPos.y + t.headR * 0.25;
        const len = t.headR * 0.9;

        ctx.strokeStyle = t.furDark;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.5;

        // 左侧胡须（从猫视角）
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(wx - 4, wy + i * 4);
            ctx.lineTo(wx - 4 - len, wy + i * 4 - len * 0.15);
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
    }

    function drawLegs(ctx, t, s) {
        const legY = t.bodyH / 2 - 2;
        const positions = [-t.bodyW * 0.25, t.bodyW * 0.2];

        // 走路时腿交替摆动
        let offsets = [0, 0];
        if (s.state === 'walking') {
            offsets[0] = Math.sin(s.animPhase) * 3;
            offsets[1] = Math.sin(s.animPhase + Math.PI) * 3;
        }

        positions.forEach(function(lx, i) {
            ctx.beginPath();
            ctx.ellipse(lx, legY + offsets[i] * 0.3, t.legW / 2, t.legLen / 2, 0, 0, Math.PI * 2);
            ctx.fillStyle = t.fur;
            ctx.fill();

            // 小爪垫
            ctx.beginPath();
            ctx.ellipse(lx, legY + t.legLen / 2 - 3, t.legW * 0.35, 3, 0, 0, Math.PI * 2);
            ctx.fillStyle = t.furLight;
            ctx.fill();
        });
    }

    function drawTail(ctx, t, s) {
        const tx = -t.bodyW / 2;
        const ty = t.bodyH * 0.1;

        let tailPhase = s.animPhase;
        if (s.state === 'idle') {
            tailPhase *= 0.4;  // 待机时尾巴慢速摇摆
        }

        const wave = Math.sin(tailPhase) * t.tailCurve * 20;
        const midX = tx - t.tailLen * 0.35;
        const midY = ty + wave * 0.5;
        const endX = tx - t.tailLen * 0.7;
        const endY = ty + wave;

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.quadraticCurveTo(midX, midY, endX, endY);
        ctx.strokeStyle = t.fur;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 尾巴尖端
        ctx.beginPath();
        ctx.arc(endX, endY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = t.furLight;
        ctx.fill();
    }

    // ======== 主绘制入口 ========

    // 程序化绘制（保留为 fallback）
    function drawCatProcedural(ctx, typeKey, s) {
        const t = CAT_TYPES[typeKey];
        if (!t) return;

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.translate(s.x, s.y);

        let bounceY = 0;
        if (s.state === 'walking') {
            bounceY = Math.sin(s.animPhase) * 4;
        }
        ctx.translate(0, bounceY);

        if (!s.facingRight) {
            ctx.scale(-1, 1);
        }

        drawTail(ctx, t, s);
        drawLegs(ctx, t, s);
        drawBody(ctx, t, s);
        const headPos = drawHead(ctx, t, s);
        drawEars(ctx, t, s, headPos);
        drawEyes(ctx, t, s, headPos);
        drawNose(ctx, t, s, headPos);
        drawWhiskers(ctx, t, s, headPos);

        if (s.drawSpecial) {
            s.drawSpecial(ctx, t, s, headPos);
        }

        ctx.restore();
    }

    // 精灵图绘制
    function drawCatSprite(ctx, typeKey, s) {
        var t = CAT_TYPES[typeKey];
        if (!t) return;

        var sprite = sprites[typeKey];
        if (!sprite || !sprite.complete || sprite.naturalWidth === 0) return;

        var drawW = sprite.naturalWidth;
        var drawH = sprite.naturalHeight;
        // 缩放到适合屏幕的尺寸（目标宽约 bodyW * 3 像素）
        var targetW = t.bodyW * 3 * (t.renderScale || 1.0);
        var scale = targetW / drawW;
        drawW = targetW;
        drawH = drawH * scale;

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.translate(s.x, s.y);

        var bounceY = 0;
        if (s.state === 'walking') {
            bounceY = Math.sin(s.animPhase) * 4;
        }
        ctx.translate(0, bounceY);

        var dir = s.facingRight ? 1 : -1;
        ctx.scale(dir, 1);

        ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);

        ctx.restore();
    }

    function drawCat(ctx, typeKey, s) {
        var img = sprites[typeKey];
        if (spritesReady && img && img.complete && img.naturalWidth > 0) {
            drawCatSprite(ctx, typeKey, s);
        } else {
            drawCatProcedural(ctx, typeKey, s);
        }
    }

    return { drawCat: drawCat };

})();
