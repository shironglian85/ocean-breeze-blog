// ============ 行为树执行引擎 ============
// 不包含任何具体行为——只提供节点类型和运行器。
// 新增动作加在 pet-behavior-actions.js，新增猫行为树加在 pet-behavior-<name>.js。

const BT = (function() {

    // ======== 节点工厂 ========

    // Selector: 依次执行子节点，遇到 success/running 停止，全 failure 才 failure
    function Selector(children) {
        return { type: 'selector', children: children };
    }

    // Sequence: 依次执行子节点，遇到 failure 停止，全 success 才 success
    function Sequence(children) {
        return { type: 'sequence', children: children };
    }

    // Condition: 调用 fn(perception)，返回 true 则 success，否则 failure
    function Condition(fn) {
        return { type: 'condition', fn: fn };
    }

    // Action: 调用 fn(cat, perception)，返回 'success' | 'failure' | 'running'
    function Action(fn) {
        return { type: 'action', fn: fn };
    }

    // ======== 运行器 ========

    // 每帧从根节点开始评估，depth-first
    function run(node, cat, perception) {
        if (node.type === 'selector') {
            for (var i = 0; i < node.children.length; i++) {
                var result = run(node.children[i], cat, perception);
                if (result !== 'failure') return result;  // success 或 running 都向上冒泡
            }
            return 'failure';
        }

        if (node.type === 'sequence') {
            for (var i = 0; i < node.children.length; i++) {
                var result = run(node.children[i], cat, perception);
                if (result !== 'success') return result;  // failure 或 running 冒泡
            }
            return 'success';
        }

        if (node.type === 'condition') {
            return node.fn(perception) ? 'success' : 'failure';
        }

        if (node.type === 'action') {
            return node.fn(cat, perception);
        }

        return 'failure';
    }

    return {
        Selector:  Selector,
        Sequence:  Sequence,
        Condition: Condition,
        Action:    Action,
        run:       run,
    };

})();
