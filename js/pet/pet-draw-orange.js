// ============ 小橘特有绘制（虎斑条纹 + 活力弹跳） ============

const PetDrawOrange = (function() {

    // 虎斑条纹 — 在身体上画深色条纹
    function drawTabbyStripes(ctx, t, s, headPos) {
        if (s.state === 'sleeping') return; // 睡觉时不画条纹（卷起来了）

        ctx.save();
        ctx.strokeStyle = t.furDark;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = 0.45;
        ctx.lineCap = 'round';

        // 身体上有 3-4 条竖纹（从背部向下）
        const stripeCount = 4;
        const bodyTop = -t.bodyH / 2 + 1;
        const bodyBot = t.bodyH / 2 - 4;
        const startX = -t.bodyW * 0.22;
        const endX = t.bodyW * 0.22;

        for (let i = 0; i < stripeCount; i++) {
            const sx = startX + (endX - startX) * (i + 0.3) / stripeCount;
            ctx.beginPath();
            ctx.moveTo(sx, bodyTop);
            ctx.lineTo(sx - 3, bodyBot);
            ctx.stroke();
        }

        // 额头的 M 纹（经典虎斑特征）
        const fx = headPos.x;
        const fy = headPos.y - t.headR * 0.35;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(fx - 8, fy + 5);
        ctx.lineTo(fx - 3, fy - 3);
        ctx.lineTo(fx, fy + 2);
        ctx.lineTo(fx + 3, fy - 3);
        ctx.lineTo(fx + 8, fy + 5);
        ctx.stroke();

        ctx.restore();
    }

    // 注册小橘的特有绘制
    function install(catState) {
        catState.drawSpecial = function(ctx, t, s, headPos) {
            drawTabbyStripes(ctx, t, s, headPos);
        };
    }

    return { install: install };
})();
