// ============ 宝藏特有绘制（白手套 + 矮脚长身 + 脸部白斑） ============

const PetDrawBaozang = (function() {

    // 白色脸部标记（下巴/嘴部白斑）
    function drawFaceWhite(ctx, t, s, headPos) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(headPos.x, headPos.y, t.headR, 0, Math.PI * 2);
        ctx.clip();

        // 下巴和嘴部白色区域
        ctx.beginPath();
        ctx.arc(headPos.x + t.headR * 0.1, headPos.y + t.headR * 0.3,
                t.headR * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#fafafa';
        ctx.fill();

        // 两眼之间一点白（blaze）
        ctx.beginPath();
        ctx.ellipse(headPos.x - t.headR * 0.05, headPos.y - t.headR * 0.4,
                    t.headR * 0.2, t.headR * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#fafafa';
        ctx.fill();

        ctx.restore();
    }

    // 白手套（四只白色爪尖）
    function drawWhiteSocks(ctx, t, s) {
        const legY = t.bodyH / 2 - 2;
        const positions = [-t.bodyW * 0.25, t.bodyW * 0.2];

        let offsets = [0, 0];
        if (s.state === 'walking') {
            offsets[0] = Math.sin(s.animPhase) * 3;
            offsets[1] = Math.sin(s.animPhase + Math.PI) * 3;
        }

        ctx.save();
        positions.forEach(function(lx, i) {
            // 白色爪套 — 覆盖腿的下半部分
            const sockY = legY + t.legLen / 2 - 3 + offsets[i] * 0.3;
            ctx.beginPath();
            ctx.ellipse(lx, sockY, t.legW / 2 + 1, t.legLen * 0.35, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#fafafa';
            ctx.fill();

            // 粉色肉垫
            ctx.beginPath();
            ctx.ellipse(lx, sockY + t.legLen * 0.2, t.legW * 0.3, 2.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#e8c0c0';
            ctx.fill();
        });
        ctx.restore();
    }

    // 长身体调整（加长躯干视觉效果）
    function drawLongBody(ctx, t, s) {
        // 在身体下方加一点阴影，强调长度
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, t.bodyH * 0.15, t.bodyW * 0.42, t.bodyH * 0.1, 0, 0, Math.PI * 2);
        ctx.fillStyle = t.furDark;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.restore();
    }

    function install(catState) {
        catState.drawSpecial = function(ctx, t, s, headPos) {
            drawFaceWhite(ctx, t, s, headPos);
            drawWhiteSocks(ctx, t, s);
            drawLongBody(ctx, t, s);
        };
    }

    return { install: install };
})();
