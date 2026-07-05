// ============ 动作库 ============
// 所有可复用的行为动作。每个函数签名: (cat, perception) → 'success' | 'failure' | 'running'
// 新增动作只需在此文件加函数即可。

const Actions = (function() {

    var MARGIN = 80;

    // ======== 基础移动 ========

    // 随机走——选择一个目标点走到那里
    function walkRandomly(cat, p) {
        var now = Date.now();
        if (!cat._walkTarget || now > cat._walkTimer || arrived(cat)) {
            cat._walkTarget = {
                x: MARGIN + Math.random() * (window.innerWidth  - MARGIN * 2),
                y: MARGIN + Math.random() * (window.innerHeight - MARGIN * 2),
            };
            cat._walkTimer = now + 3000 + Math.random() * 5000;
        }
        cat.targetX = cat._walkTarget.x;
        cat.targetY = cat._walkTarget.y;
        cat.state = 'walking';
        cat.facingRight = cat.targetX > cat.x;
        return 'running';
    }

    // 走向某个坐标——到达后 success
    function walkTo(cat, tx, ty) {
        cat.targetX = tx;
        cat.targetY = ty;
        cat.state = 'walking';
        cat.facingRight = tx > cat.x;
        if (Math.abs(cat.x - tx) < 5 && Math.abs(cat.y - ty) < 5) {
            cat.state = 'idle';
            return 'success';
        }
        return 'running';
    }

    // 发呆
    function idle(cat, p) {
        cat.state = 'idle';
        if (!cat._idleUntil) {
            cat._idleUntil = Date.now() + 2000 + Math.random() * 4000;
        }
        if (Date.now() > cat._idleUntil) {
            cat._idleUntil = 0;
            return 'success';
        }
        return 'running';
    }

    // ======== 社交互动 ========

    // 追逐最近的猫
    function chaseNearestCat(cat, p) {
        var nearest = findNearestCat(cat, p);
        if (!nearest) return 'failure';
        var dist = distance(cat, nearest);
        if (dist < 200) {
            return walkTo(cat, nearest.x, nearest.y);
        }
        return 'failure';  // 太远不追
    }

    // 逃离最近的猫
    function fleeFromNearestCat(cat, p) {
        var nearest = findNearestCat(cat, p);
        if (!nearest) return 'failure';
        var dist = distance(cat, nearest);
        if (dist < 300) {
            var fx = cat.x + (cat.x - nearest.x) * 1.5;
            var fy = cat.y + (cat.y - nearest.y) * 1.5;
            fx = Math.max(MARGIN, Math.min(window.innerWidth  - MARGIN, fx));
            fy = Math.max(MARGIN, Math.min(window.innerHeight - MARGIN, fy));
            return walkTo(cat, fx, fy);
        }
        return 'failure';
    }

    // 靠近其他idle的猫依偎
    function snuggleNearIdleCat(cat, p) {
        var candidates = p.otherCats.filter(function(c) {
            return c.state === 'idle' && distance(cat, c) < 250;
        });
        if (candidates.length === 0) return 'failure';
        var target = candidates[0];
        return walkTo(cat, target.x + 40, target.y + 10);
    }

    // ======== 光标互动 ========

    // 被光标吸引走过去
    function approachCursor(cat, p) {
        if (!p.cursor || !p.cursor.active) return 'failure';
        var dist = distance(cat, p.cursor);
        if (dist < 50) {
            cat.state = 'idle';
            return 'success';
        }
        if (dist < 300) {
            return walkTo(cat, p.cursor.x, p.cursor.y);
        }
        return 'failure';
    }

    // ======== 粒子互动 ========

    // 追逐最近的粒子——锁定目标，避免每帧换方向
    function chaseNearestParticle(cat, p) {
        if (!p.particles || p.particles.length === 0) return 'failure';
        // 如果已锁定目标且还没追上，继续追
        if (cat._chaseTarget) {
            var d = distance(cat, cat._chaseTarget);
            if (d > 6) return walkTo(cat, cat._chaseTarget.x, cat._chaseTarget.y);
            cat._chaseTarget = null;
        }
        var nearest = null, minDist = 180;
        for (var i = 0; i < p.particles.length; i++) {
            var pt = p.particles[i];
            var d = Math.hypot(cat.x - pt.x, cat.y - pt.y);
            if (d < minDist) { minDist = d; nearest = pt; }
        }
        if (!nearest) return 'failure';
        cat._chaseTarget = nearest;
        return walkTo(cat, nearest.x, nearest.y);
    }

    // 追逐粒子——随机触发，触发后持续到追到
    function chaseNearestParticleMaybe(cat, p, prob) {
        if (!p.particles || p.particles.length === 0) return 'failure';
        // 已有锁定的追逐目标，继续
        if (cat._chaseTarget) {
            var d = Actions.distance(cat, cat._chaseTarget);
            if (d > 6) return walkTo(cat, cat._chaseTarget.x, cat._chaseTarget.y);
            cat._chaseTarget = null; // 追到了
        }
        // 没有目标，概率触发新追逐
        if (Math.random() > prob) return 'failure';
        var nearest = null, minDist = 180;
        for (var i = 0; i < p.particles.length; i++) {
            var pt = p.particles[i];
            var d = Actions.distance(cat, pt);
            if (d < minDist) { minDist = d; nearest = pt; }
        }
        if (!nearest) return 'failure';
        cat._chaseTarget = nearest;
        return walkTo(cat, nearest.x, nearest.y);
    }

    // 追逐其他猫——随机触发，触发后持续
    function chaseNearestCatMaybe(cat, p, prob) {
        if (cat._chaseCat) {
            var c = cat._chaseCat;
            if (Actions.distance(cat, c) > 12) return walkTo(cat, c.x, c.y);
            cat._chaseCat = null;
        }
        if (Math.random() > prob) return 'failure';
        var nearest = Actions.findNearestCat(cat, p);
        if (!nearest || Actions.distance(cat, nearest) > 400) return 'failure';
        cat._chaseCat = nearest;
        return walkTo(cat, nearest.x, nearest.y);
    }

    // 依偎——随机触发，触发后持续到到位
    function snuggleMaybe(cat, p, prob) {
        if (cat._snuggleTarget) {
            var t = cat._snuggleTarget;
            if (Actions.distance(cat, t) > 8) return walkTo(cat, t.x, t.y);
            cat._snuggleTarget = null;
            cat.state = 'idle';
            return 'success';
        }
        if (Math.random() > prob) return 'failure';
        var candidates = p.otherCats.filter(function(c) {
            return c.state === 'idle' && Actions.distance(cat, c) < 300;
        });
        if (candidates.length === 0) return 'failure';
        var target = candidates[0];
        cat._snuggleTarget = { x: target.x + 40, y: target.y + 10 };
        return walkTo(cat, cat._snuggleTarget.x, cat._snuggleTarget.y);
    }

    // 远离粒子（火焰主题用）
    function fleeFromParticles(cat, p) {
        if (!p.particles || p.particles.length === 0) return 'failure';
        var danger = false, avgX = 0, avgY = 0, count = 0;
        for (var i = 0; i < p.particles.length; i++) {
            var pt = p.particles[i];
            if (Math.hypot(cat.x - pt.x, cat.y - pt.y) < 250) {
                avgX += pt.x; avgY += pt.y; count++; danger = true;
            }
        }
        if (!danger) return 'failure';
        avgX /= count; avgY /= count;
        var fx = cat.x + (cat.x - avgX) * 2;
        var fy = cat.y + (cat.y - avgY) * 2;
        fx = Math.max(MARGIN, Math.min(window.innerWidth  - MARGIN, fx));
        fy = Math.max(MARGIN, Math.min(window.innerHeight - MARGIN, fy));
        return walkTo(cat, fx, fy);
    }

    // ======== 工具函数 ========

    function findNearestCat(cat, p) {
        var nearest = null, minDist = Infinity;
        p.otherCats.forEach(function(c) {
            var d = distance(cat, c);
            if (d < minDist) { minDist = d; nearest = c; }
        });
        return nearest;
    }

    function distance(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function arrived(cat) {
        return Math.abs(cat.x - cat.targetX) < 4 && Math.abs(cat.y - cat.targetY) < 4;
    }

    return {
        walkRandomly: walkRandomly,
        walkTo: walkTo,
        idle: idle,
        chaseNearestCat: chaseNearestCat,
        fleeFromNearestCat: fleeFromNearestCat,
        snuggleNearIdleCat: snuggleNearIdleCat,
        approachCursor: approachCursor,
        chaseNearestParticle: chaseNearestParticle,
        chaseNearestParticleMaybe: chaseNearestParticleMaybe,
        chaseNearestCatMaybe: chaseNearestCatMaybe,
        snuggleMaybe: snuggleMaybe,
        fleeFromParticles: fleeFromParticles,
        findNearestCat: findNearestCat,
        distance: distance,
    };

})();
