// ============ 宝藏行为树 ============
// 安静稳重，偏好角落发呆，被追时逃跑

var BaozangBehavior = (function() {
    return BT.Selector([

        // 1. 炼狱主题远离火焰
        BT.Sequence([
            BT.Condition(function(p) { return p.theme === 'hell'; }),
            BT.Action(function(cat, p) { return Actions.fleeFromParticles(cat, p); }),
        ]),

        // 2. 被追时逃跑（无随机，条件触发）
        BT.Sequence([
            BT.Condition(function(p) {
                var nearest = Actions.findNearestCat(p.thisCat, p);
                return nearest && Actions.distance(p.thisCat, nearest) < 180;
            }),
            BT.Action(function(cat, p) { return Actions.fleeFromNearestCat(cat, p); }),
        ]),

        // 3. 偶尔追逐粒子
        BT.Action(function(cat, p) {
            return p.theme !== 'hell' ? Actions.chaseNearestParticleMaybe(cat, p, 0.015) : 'failure';
        }),

        // 4. 偶尔依偎
        BT.Action(function(cat, p) {
            return Actions.snuggleMaybe(cat, p, 0.005);
        }),

        // 5. 发呆为主
        BT.Action(function(cat, p) { return Actions.idle(cat, p); }),

    ]);
})();
