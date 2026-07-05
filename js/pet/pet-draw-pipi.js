// ============ 皮皮特有绘制（奶牛猫黑白斑块 + 圆胖体型） ============

const PetDrawPipi = (function() {

    function drawCowPatches(ctx, t, s, headPos) {
        // ---- 头部黑色斑块（clip 在头圆范围内） ----
        ctx.save();
        ctx.beginPath();
        ctx.arc(headPos.x, headPos.y, t.headR - 1, 0, Math.PI * 2);
        ctx.clip();

        // 右侧大片面罩（奶牛猫典型特征：半边黑脸）
        ctx.beginPath();
        ctx.arc(headPos.x + t.headR * 0.25, headPos.y - t.headR * 0.1,
                t.headR * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = t.furDark;
        ctx.fill();

        // 左侧小斑
        ctx.beginPath();
        ctx.arc(headPos.x - t.headR * 0.45, headPos.y + t.headR * 0.15,
                t.headR * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = t.furDark;
        ctx.fill();

        ctx.restore();

        // ---- 身体背部大块黑色 ----
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, -t.bodyH * 0.15, t.bodyW * 0.38, t.bodyH * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = t.furDark;
        ctx.fill();
        ctx.restore();

        // ---- 身体后部小斑点 ----
        ctx.save();
        ctx.beginPath();
        ctx.arc(-t.bodyW * 0.22, t.bodyH * 0.05, t.bodyW * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = t.furDark;
        ctx.fill();
        ctx.restore();

        // ---- 黑色尾巴（覆盖原有尾巴颜色） ----
        // 因为尾巴在 head 之前绘制，这里用深色重绘尾巴
        const tx = -t.bodyW / 2;
        const ty = t.bodyH * 0.1;
        let tailPhase = s.animPhase;
        if (s.state === 'idle') tailPhase *= 0.4;
        const wave = Math.sin(tailPhase) * t.tailCurve * 20;
        const midX = tx - t.tailLen * 0.35;
        const midY = ty + wave * 0.5;
        const endX = tx - t.tailLen * 0.7;
        const endY = ty + wave;

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.quadraticCurveTo(midX, midY, endX, endY);
        ctx.strokeStyle = t.furDark;
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(endX, endY, 4, 0, Math.PI * 2);
        ctx.fillStyle = t.furDark;
        ctx.fill();
    }

    function install(catState) {
        catState.drawSpecial = function(ctx, t, s, headPos) {
            drawCowPatches(ctx, t, s, headPos);
        };
    }

    return { install: install };
})();
