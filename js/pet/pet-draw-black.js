// ============ 墨墨特有绘制（发光的金色眼睛 + 隐身渐变） ============

const PetDrawBlack = (function() {

    // 发光眼睛 — 在眼睛周围加一层光晕
    function drawGlowEyes(ctx, t, s, headPos) {
        if (s.state === 'sleeping') return;

        const eyeY = headPos.y - t.headR * 0.1;
        const spread = t.headR * 0.4;
        const eyeR = t.headR * 0.22;

        ctx.save();
        ctx.globalAlpha = 0.25 + Math.sin(s.animPhase * 0.7) * 0.1; // 呼吸式光晕

        // 左眼光晕
        drawGlow(ctx, headPos.x - spread, eyeY, eyeR * 1.8, t.eyeColor);
        // 右眼光晕
        drawGlow(ctx, headPos.x + spread, eyeY, eyeR * 1.8, t.eyeColor);

        ctx.restore();
    }

    function drawGlow(ctx, cx, cy, r, color) {
        const grad = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
    }

    function install(catState) {
        catState.drawSpecial = function(ctx, t, s, headPos) {
            drawGlowEyes(ctx, t, s, headPos);
        };
    }

    return { install: install };
})();
