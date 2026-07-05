// ============ 三猫系统控制器 ============

const CatSystem = (function() {

    const cats = [];
    const MARGIN = 80;

    // ======== 行为树映射 ========

    function getBehaviorTree(typeKey) {
        if (typeKey === 'pipi'    && typeof PipiBehavior    !== 'undefined') return PipiBehavior;
        if (typeKey === 'baozang' && typeof BaozangBehavior  !== 'undefined') return BaozangBehavior;
        if (typeKey === 'xiaobu'  && typeof XiaobuBehavior   !== 'undefined') return XiaobuBehavior;
        return null;
    }

    // ======== 初始化 ========

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

        // 绑定行为树
        pipi._bt    = getBehaviorTree('pipi');
        baozang._bt = getBehaviorTree('baozang');
        xiaobu._bt  = getBehaviorTree('xiaobu');

        cats.push(pipi, baozang, xiaobu);
    }

    // ======== 感知层 ========

    function buildPerception(self) {
        var others = [];
        for (var i = 0; i < cats.length; i++) {
            if (cats[i] !== self) {
                others.push({
                    x:     cats[i].x,
                    y:     cats[i].y,
                    state: cats[i].state,
                    type:  cats[i].type,
                });
            }
        }

        var cursor = { x: 0, y: 0, active: false };
        if (typeof Renderer !== 'undefined') {
            var input = Renderer.getInput();
            cursor.x = input.mouseX;
            cursor.y = input.mouseY;
            cursor.active = input.mouseDown;
        }

        var particles = [];
        if (typeof ParticleSystem !== 'undefined') {
            particles = ParticleSystem.particles || [];
        }

        var theme = '';
        if (typeof ParticleSystem !== 'undefined') {
            theme = ParticleSystem.getCurrentTheme ? ParticleSystem.getCurrentTheme() : '';
        }

        return {
            thisCat:   { x: self.x, y: self.y, state: self.state, type: self.type },
            otherCats: others,
            cursor:    cursor,
            particles: particles,
            theme:     theme,
        };
    }

    // ======== AI 更新 ========

    function updateCat(s) {
        var now = Date.now();
        var t = CAT_TYPES[s.type];

        // 眨眼计时
        if (now > s.blinkTimer) {
            s.blinkFrame = 1;
            setTimeout(function() {
                s.blinkFrame = 2;
                setTimeout(function() {
                    s.blinkFrame = 0;
                }, 80);
            }, 50);
            s.blinkTimer = now + 2500 + Math.random() * 5000;
        }

        // 动画相位
        var phaseSpeed = s.state === 'walking' ? 0.12 : 0.025;
        s.animPhase += phaseSpeed;

        // 行为树评估
        if (s._bt) {
            var perception = buildPerception(s);
            BT.run(s._bt, s, perception);
        }

        // 走路移动
        if (s.state === 'walking') {
            walkUpdate(s, t);
        }

        // 边界
        s.x = Math.max(MARGIN, Math.min(window.innerWidth - MARGIN, s.x));
        s.y = Math.max(MARGIN, Math.min(window.innerHeight - MARGIN, s.y));
    }

    function walkUpdate(s, t) {
        var dx = s.targetX - s.x;
        var dy = s.targetY - s.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 4) {
            s.state = 'idle';
            s.facingRight = s.targetX > s.x;
        } else {
            s.x += (dx / dist) * t.speed;
            s.y += (dy / dist) * t.speed;
            s.facingRight = dx > 0;
        }
    }

    // ======== 渲染层接口 ========

    function update() {
        for (var i = 0; i < cats.length; i++) {
            try {
                updateCat(cats[i]);
            } catch(e) {
                // 行为树出错不阻断渲染循环
            }
        }
    }

    function draw(ctx) {
        for (var i = 0; i < cats.length; i++) {
            PetDraw.drawCat(ctx, cats[i].type, cats[i]);
        }
    }

    // ======== 启动 ========

    init();

    if (typeof Renderer !== 'undefined') {
        Renderer.addLayer({ update: update, draw: draw });
    }

    return {
        cats:   cats,
        update: update,
        draw:   draw,
    };

})();
