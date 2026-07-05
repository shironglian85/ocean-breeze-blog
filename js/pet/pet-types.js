// ============ 两只猫的角色参数定义 ============

const CAT_TYPES = {
    pipi: {
        id: 'pipi',
        name: '皮皮',
        emoji: '🐄',
        // 体型 —— 18斤英短，圆胖
        bodyW: 60, bodyH: 40,          // 大圆身体
        headR: 22,                      // 大圆脸（英短特征）
        earH: 14, earW: 10,             // 英短耳朵偏小圆
        tailLen: 24, tailCurve: 0.3,   // 尾巴较短粗
        legLen: 12, legW: 10,           // 短粗腿
        // 颜色 — 奶牛猫（黑白花）
        fur: '#f5f5f5',                 // 白底
        furLight: '#ffffff',            // 纯白
        furDark: '#1a1a1a',            // 黑色斑块
        earInner: '#f0d8d0',           // 耳朵内侧粉色
        eyeColor: '#daa520',           // 铜金色眼睛
        noseColor: '#e89090',          // 粉鼻子
        // 性格 — 懒散的胖子
        speed: 0.45,                    // 很慢
        idleChance: 0.75,              // 大部分时间躺着
        idleMinTime: 4000, idleMaxTime: 12000,
        walkMinTime: 1000, walkMaxTime: 2500,
        walkRange: 0.25,               // 活动范围小
        specials: ['cowPatches', 'chubbyBelly'],
        renderScale: 1.4,               // 屏幕渲染缩放
    },

    baozang: {
        id: 'baozang',
        name: '宝藏',
        emoji: '🐱',
        // 体型 — 矮脚长身蓝猫
        bodyW: 56, bodyH: 26,           // 长身体
        headR: 17,                       // 正常头
        earH: 15, earW: 9,
        tailLen: 46, tailCurve: 0.45,   // 长尾巴
        legLen: 8, legW: 9,             // 矮脚！显著短
        // 颜色 — 蓝灰色 + 白手套
        fur: '#8a9bb5',                 // 蓝灰色
        furLight: '#b8c5d6',           // 浅灰
        furDark: '#5a6b85',            // 深灰
        earInner: '#c8b8c0',
        eyeColor: '#daa520',           // 铜金色眼睛（蓝猫常见）
        noseColor: '#b89090',          // 灰粉鼻子
        // 性格 — 矮脚稳重
        speed: 0.5,                     // 腿短慢悠悠
        idleChance: 0.55,
        idleMinTime: 3000, idleMaxTime: 8000,
        walkMinTime: 2000, walkMaxTime: 4000,
        walkRange: 0.4,
        specials: ['whiteSocks', 'longBody'],
        renderScale: 0.91,              // 宝藏约皮皮一半，放大1.3倍
    },

    xiaobu: {
        id: 'xiaobu',
        name: '小不',
        emoji: '🐱',
        // 体型 — 银渐层，约皮皮4/5大小
        bodyW: 54, bodyH: 34,
        headR: 19,
        earH: 13, earW: 9,
        tailLen: 38, tailCurve: 0.4,
        legLen: 14, legW: 9,
        // 颜色 — 银渐层
        fur: '#e8e0d8',                 // 奶白银灰
        furLight: '#f5f2ee',           // 纯白底绒
        furDark: '#b0a89e',            // 深银灰毛尖
        earInner: '#f0d8d8',          // 粉白耳内
        eyeColor: '#2e6b2e',          // 深墨绿色眼睛
        noseColor: '#e8b0a0',         // 粉鼻头
        // 性格 — 安静粘人
        speed: 0.55,
        idleChance: 0.55,
        idleMinTime: 3000, idleMaxTime: 8000,
        walkMinTime: 1800, walkMaxTime: 3500,
        walkRange: 0.45,
        specials: [],
        renderScale: 1.1,              // 比皮皮略小
    },
};

// 每只猫的运行时状态
function createCatState(typeKey) {
    const margin = 100;
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    return {
        type: typeKey,
        x: margin + Math.random() * Math.max(100, ww - margin * 2),
        y: margin + Math.random() * Math.max(100, wh - margin * 2),
        targetX: 0, targetY: 0,
        facingRight: Math.random() > 0.5,
        state: 'idle',
        stateTimer: Date.now() + 500 + Math.random() * 2000,
        animPhase: Math.random() * Math.PI * 2,
        blinkTimer: Date.now() + 2000 + Math.random() * 4000,
        blinkFrame: 0,
        alpha: 1,
        boostTimer: 0,
    };
}
