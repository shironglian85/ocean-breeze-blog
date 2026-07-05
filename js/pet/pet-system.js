// ============ 三猫系统控制器（基础版——随机走动 + 精灵图渲染） ============

const CatSystem = (function() {

    const cats = [];
    const MARGIN = 80;

    function init() {
        var pipi    = createCatState('pipi');
        var baozang = createCatState('baozang');
        var xiaobu  = createCatState('xiaobu');

        if (typeof PetDrawPipi    !== 'undefined') PetDrawPipi.install(pipi);
        if (typeof PetDrawBaozang !== 'undefined') PetDrawBaozang.install(baozang);

        pipi.x    = window.innerWidth * 0.6;
        pipi.y    = window.innerHeight * 0.7;

        baozang.x = window.innerWidth * 0.35;
        baozang.y = window.innerHeight * 0.5;

        xiaobu.x  = window.innerWidth * 0.3;
        xiaobu.y  = window.innerHeight * 0.35;

        cats.push(pipi, baozang, xiaobu);
    }

    function updateCat(s) {
        var now = Date.now();
        var t = CAT_TYPES[s.type];

        if (now > s.blinkTimer) {
            s.blinkFrame = 1;
            setTimeout(function() { s.blinkFrame = 2; setTimeout(function() { s.blinkFrame = 0; }, 80); }, 50);
            s.blinkTimer = now + 2500 + Math.random() * 5000;
        }

        var phaseSpeed = s.state === 'walking' ? 0.12 : 0.025;
        s.animPhase += phaseSpeed;

        if (now > s.stateTimer) pickNewState(s, t);

        if (s.state === 'walking') {
            var dx = s.targetX - s.x, dy = s.targetY - s.y;
            var dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 4) { pickNewState(s, t); }
            else { s.x += (dx/dist)*t.speed; s.y += (dy/dist)*t.speed; s.facingRight = dx > 0; }
        }

        s.x = Math.max(MARGIN, Math.min(window.innerWidth - MARGIN, s.x));
        s.y = Math.max(MARGIN, Math.min(window.innerHeight - MARGIN, s.y));
    }

    function pickNewState(s, t) {
        var now = Date.now();
        if (Math.random() < t.idleChance) {
            s.state = 'idle';
            s.stateTimer = now + t.idleMinTime + Math.random() * (t.idleMaxTime - t.idleMinTime);
        } else {
            s.state = 'walking';
            s.stateTimer = now + t.walkMinTime + Math.random() * (t.walkMaxTime - t.walkMinTime);
            s.targetX = MARGIN + Math.random() * (window.innerWidth  - MARGIN*2);
            s.targetY = MARGIN + Math.random() * (window.innerHeight - MARGIN*2);
        }
    }

    function update() { for (var i=0; i<cats.length; i++) updateCat(cats[i]); }
    function draw(ctx) { for (var i=0; i<cats.length; i++) PetDraw.drawCat(ctx, cats[i].type, cats[i]); }

    init();

    return { cats: cats, update: update, draw: draw };
})();
