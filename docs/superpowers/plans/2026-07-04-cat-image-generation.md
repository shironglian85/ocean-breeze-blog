# 猫咪卡通形象生成 — 实施计划

> **执行方式:** 内联执行（非代码任务占多数，需要在当前会话中与用户交互完成）
> 步骤使用 checkbox (`- [ ]`) 语法跟踪。

**目标:** 用 Nano Banana 2 为皮皮和宝藏生成卡通精灵图，集成到 Canvas 渲染中，替换当前程序化几何绘制。

**架构:** Nano Banana 2 MCP 插件生图 → 精灵图保存到 `pet/sprites/` → `PetDraw` 内部改用 `ctx.drawImage()` 渲染

**技术栈:** `@nanobanana/mcp`、Google Gemini API、Canvas 2D API

## 全局约束

- 猫咪特征必须准确：皮皮=黑白奶牛猫+圆胖，宝藏=蓝灰矮脚+白手套+白脸
- 与现有 `PetDraw.drawCat(ctx, typeKey, state)` 接口兼容
- 不修改 `renderer.js`、`CatSystem`、粒子/主题系统
- 不创建新的 HTML 页面

---

### 文件变更清单

| 文件 | 操作 | 职责 |
|------|------|------|
| `pet/sprites/pipi-sprite.png` | 新建 | 皮皮精灵图 |
| `pet/sprites/baozang-sprite.png` | 新建 | 宝藏精灵图 |
| `js/pet/pet-draw.js` | 修改 | 增加精灵图加载 + drawImage 渲染分支 |
| `pet/README.md` | 新建 | 猫形象生成操作文档 |

---

### Task 1: 安装 Nano Banana MCP

**交付物:** `@nanobanana/mcp` 在 Claude Code 中可用，`generate_image` 工具可调用。

- [ ] **Step 1: 获取 Google API Key**

打开 https://aistudio.google.com/apikey → 登录 Google 账号 → 点击 "Create API Key" → 复制密钥。

- [ ] **Step 2: 安装 MCP 插件**

```bash
claude mcp add nanobanana -e GEMINI_API_KEY=你的密钥 -- npx -y @nanobanana/mcp
```

预期输出: MCP server 添加成功。

- [ ] **Step 3: 验证安装**

在当前会话中发出:
> 用 Nano Banana 列出可用模型

预期: 返回 `gemini-3.1-flash-image`（默认）、`gemini-3-pro-image` 等。

- [ ] **Step 4: 提交配置**

```bash
git add .claude/
git commit -m "chore: add nanobanana MCP for image generation"
```

---

### Task 2: 挑选参考图

**交付物:** 每只猫 4-6 张精选参考照片的路径列表。

- [ ] **Step 1: 浏览皮皮照片**

查看 `皮皮/` 目录下约 70 张 JPG，挑选标准：
- 正面脸部清晰（看清黑白斑块分布、眼睛颜色）
- 全身侧面站立（看清体型、比例）
- 坐姿或趴姿（看清身体花纹）
- 光线充足、无遮挡

- [ ] **Step 2: 浏览宝藏照片**

查看 `宝藏/` 目录下 12 张 JPG，挑选标准同上，特别关注：
- 能看清四条腿的白手套
- 能看清脸部白色标记
- 能看清矮脚特征

- [ ] **Step 3: 记录参考图路径**

在对话中记录每只猫的 4-6 张参考图路径，格式：
```
皮皮参考图: 皮皮/微信图片_xxx.jpg, 皮皮/微信图片_yyy.jpg, ...
宝藏参考图: 宝藏/微信图片_xxx.jpg, 宝藏/微信图片_yyy.jpg, ...
```

---

### Task 3: 生成皮皮卡通形象

**交付物:** `pet/sprites/pipi-sprite.png`

- [ ] **Step 1: 生成初版**

在对话中发出（附参考图）:

> 用 Nano Banana 生成一张皮皮的卡通形象。皮皮是一只18斤的英短奶牛猫，非常圆胖，白色身体底毛，身上有大块不规则的黑色斑块（背部一大块黑色、右半边脸是黑色面罩、左眼周围有一小块黑色斑点），黑色尾巴，铜金色圆眼睛，短粗的腿。可爱卡通插画风格，精灵图风，侧面行走姿态，透明或纯色背景。分辨率1024x1024。

- [ ] **Step 2: 对照真猫调整**

对比生成图和真猫照片，调整提示词中的偏差：
- 斑块位置不对 → 在提示词中更精确描述
- 体型不够胖 → 强调 "extremely round and chubby, like a ball"
- 颜色不对 → 调整颜色描述词

- [ ] **Step 3: 确认并保存**

效果满意后，将图片保存到:
```
pet/sprites/pipi-sprite.png
```

- [ ] **Step 4: 提交**

```bash
git add pet/sprites/pipi-sprite.png
git commit -m "feat: add Pipi cat sprite"
```

---

### Task 4: 生成宝藏卡通形象

**交付物:** `pet/sprites/baozang-sprite.png`

- [ ] **Step 1: 生成初版**

> 用 Nano Banana 生成一张宝藏的卡通形象。宝藏是一只蓝灰色英国短毛猫，矮脚（Munchkin短腿，腿非常短），身体偏长，四个脚爪是白色的（像穿了白色短袜），下巴和嘴部有白色区域，两眼之间有一点白色竖线。铜金色圆眼睛。可爱卡通插画风格，精灵图风，侧面姿态，透明或纯色背景。分辨率1024x1024。

- [ ] **Step 2: 对照真猫调整**

同上，迭代到视觉特征准确。

- [ ] **Step 3: 确认并保存**

```
pet/sprites/baozang-sprite.png
```

- [ ] **Step 4: 提交**

```bash
git add pet/sprites/baozang-sprite.png
git commit -m "feat: add Baozang cat sprite"
```

---

### Task 5: Canvas drawImage 集成

**文件:**
- 修改: `js/pet/pet-draw.js`
- 创建: `pet/sprites/pipi-sprite.png`（Task 3 产出）
- 创建: `pet/sprites/baozang-sprite.png`（Task 4 产出）

**接口:**
- 消费: `CAT_TYPES`（来自 `pet-types.js`）
- 消费: 猫状态对象 `s`（来自 `CatSystem.cats[]`）
- 产出: `PetDraw.drawCat(ctx, typeKey, s)` — 接口不变，内部改为精灵图渲染

- [ ] **Step 1: 在 PetDraw 中加载精灵图**

在 `js/pet/pet-draw.js` 的 IIFE 顶部添加精灵图加载逻辑：

```javascript
const PetDraw = (function() {

    // 精灵图缓存
    const sprites = {};
    let spritesLoaded = false;

    // 加载精灵图
    function loadSprites() {
        const spriteMap = {
            pipi:    'pet/sprites/pipi-sprite.png',
            baozang: 'pet/sprites/baozang-sprite.png',
        };
        let loaded = 0;
        const total = Object.keys(spriteMap).length;

        Object.entries(spriteMap).forEach(function(entry) {
            var typeKey = entry[0];
            var src = entry[1];
            var img = new Image();
            img.onload = function() {
                loaded++;
                if (loaded >= total) { spritesLoaded = true; }
            };
            img.onerror = function() {
                // 加载失败时静默回退到程序化绘制
                loaded++;
                if (loaded >= total) { spritesLoaded = true; }
            };
            img.src = src;
            sprites[typeKey] = img;
        });
    }
    loadSprites();
```

- [ ] **Step 2: 修改 drawCat 入口函数，增加精灵图分支**

将当前 `drawCat` 函数重命名为 `drawCatProcedural`，新建 `drawCat` 作为路由：

```javascript
    // 原程序化绘制（重命名保留）
    function drawCatProcedural(ctx, typeKey, s) {
        // ... 现有代码不变 ...
    }

    // 新入口：精灵图优先，程序化 fallback
    function drawCat(ctx, typeKey, s) {
        var sprite = sprites[typeKey];

        if (sprite && spritesLoaded && sprite.complete && sprite.naturalWidth > 0) {
            // 精灵图模式
            ctx.save();
            ctx.globalAlpha = s.alpha;
            ctx.translate(s.x, s.y);

            // 走路弹跳
            var bounceY = 0;
            if (s.state === 'walking') {
                bounceY = Math.sin(s.animPhase) * 4;
            }
            ctx.translate(0, bounceY);

            // 朝向
            var scaleX = s.facingRight ? 1 : -1;

            // 精灵图绘制尺寸（保持比例）
            var drawW = CAT_TYPES[typeKey].bodyW * 2.2;
            var drawH = CAT_TYPES[typeKey].bodyH * 2.8;

            ctx.scale(scaleX, 1);
            ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);

            ctx.restore();
        } else {
            // fallback：程序化绘制
            drawCatProcedural(ctx, typeKey, s);
        }
    }

    return { drawCat: drawCat };
})();
```

- [ ] **Step 3: 浏览器验证**

打开 `index.html`，确认：
- 精灵图加载成功后猫呈现为卡通形象
- 如果精灵图加载失败，自动回退到程序化绘制
- 走路弹跳 + 朝向翻转正常工作
- 两只猫的视觉特征和真猫一致

- [ ] **Step 4: 提交**

```bash
git add js/pet/pet-draw.js
git commit -m "feat: integrate sprites via drawImage with procedural fallback"
```

---

### Task 6: 操作文档沉淀

**文件:** 创建 `pet/README.md`

- [ ] **Step 1: 编写操作文档**

保存为 `pet/README.md`：

```markdown
# 猫咪形象管理

## 目录结构

pet/
├── sprites/           # 精灵图（Nano Banana 2 生成）
│   ├── pipi-sprite.png
│   └── baozang-sprite.png
├── cat-sprite/        # 旧 GIF 素材（保留）
├── README.md          # 本文档
├── 皮皮/              # 皮皮真猫照片（参考用）
└── 宝藏/              # 宝藏真猫照片（参考用）

## 生成新猫形象

1. 准备 4-6 张真猫参考照片（正面、侧面、坐姿各 1-2 张）
2. 用 Nano Banana 2 生成：
   > 用 Nano Banana 生成一张[猫名]的卡通形象。[描述外貌特征：颜色、斑纹、体型、眼睛]。可爱卡通插画风格，精灵图风，侧面姿态，透明背景。分辨率1024x1024。
3. 对照真猫迭代调整提示词
4. 保存到 pet/sprites/[cat-key]-sprite.png
5. 在 js/pet/pet-types.js 中注册（如为新猫）或直接覆盖（如为更新）

## 修改现有猫形象

1. 修改 js/pet/pet-types.js 中对应猫的参数（颜色、体型等）
2. 重新生成精灵图（参照上节步骤 2-4）
3. 精灵图自动被 PetDraw 加载，无需改其他代码
```

- [ ] **Step 2: 提交**

```bash
git add pet/README.md
git commit -m "docs: add cat sprite management guide"
```

---

## 验收清单

- [ ] `@nanobanana/mcp` 安装成功，`generate_image` 可调用
- [ ] 皮皮精灵图生成并保存到 `pet/sprites/pipi-sprite.png`
- [ ] 宝藏精灵图生成并保存到 `pet/sprites/baozang-sprite.png`
- [ ] Canvas 渲染使用精灵图，猫形象辨识度明显提升
- [ ] 精灵图加载失败时自动回退到程序化绘制
- [ ] `pet/README.md` 操作文档完整
