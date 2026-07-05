// ============ 小不行为树 ============
// 好奇但胆小，爱追粒子，被追逃跑

var XiaobuBehavior = (function() {
    return BT.Selector([

        // 1. 炼狱主题远离火焰
        BT.Sequence([
            BT.Condition(function(p) { return p.theme === 'hell'; }),
            BT.Action(function(cat, p) { return Actions.fleeFromParticles(cat, p); }),
        ]),

        // 2. 被追时逃跑
        BT.Sequence([
            BT.Condition(function(p) {
                var nearest = Actions.findNearestCat(p.thisCat, p);
                return nearest && Actions.distance(p.thisCat, nearest) < 200;
            }),
            BT.Action(function(cat, p) { return Actions.fleeFromNearestCat(cat, p); }),
        ]),

        // 3. 追逐粒子（好奇心强）
        BT.Action(function(cat, p) {
            return p.theme !== 'hell' ? Actions.chaseNearestParticleMaybe(cat, p, 0.04) : 'failure';
        }),

        // 4. 偶尔依偎
        BT.Action(function(cat, p) {
            return Actions.snuggleMaybe(cat, p, 0.008);
        }),

        // 5. 靠近光标
        BT.Action(function(cat, p) {
            return p.cursor && p.cursor.active ? Actions.approachCursor(cat, p) : 'failure';
        }),

        // 6. 随机散步
        BT.Action(function(cat, p) { return Actions.walkRandomly(cat, p); }),

    ]);
})();
