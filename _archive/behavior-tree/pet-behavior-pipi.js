// ============ 皮皮行为树 ============
// 活泼好动，喜欢追逐，对光标好奇

var PipiBehavior = (function() {
    return BT.Selector([

        // 1. 炼狱主题远离火焰
        BT.Sequence([
            BT.Condition(function(p) { return p.theme === 'hell'; }),
            BT.Action(function(cat, p) { return Actions.fleeFromParticles(cat, p); }),
        ]),

        // 2. 追逐粒子（动作内部决定概率和持续）
        BT.Action(function(cat, p) {
            return p.theme !== 'hell' ? Actions.chaseNearestParticleMaybe(cat, p, 0.03) : 'failure';
        }),

        // 3. 追其他猫
        BT.Action(function(cat, p) {
            return Actions.chaseNearestCatMaybe(cat, p, 0.01);
        }),

        // 4. 靠近光标
        BT.Action(function(cat, p) {
            return p.cursor && p.cursor.active ? Actions.approachCursor(cat, p) : 'failure';
        }),

        // 5. 随机散步
        BT.Action(function(cat, p) { return Actions.walkRandomly(cat, p); }),

    ]);
})();
