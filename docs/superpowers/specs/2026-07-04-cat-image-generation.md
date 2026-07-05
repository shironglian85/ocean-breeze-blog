# 猫咪卡通形象生成 — 子项目设计文档

> 主项目：Ocean Breeze Blog · 2026-07-04

## 一、背景

Ocean Breeze Blog 主项目已完成 Phase 1（渲染引擎）和 Phase 2（双猫系统基础），Canvas 上已可渲染两只基于几何图形的简陋猫形象（皮皮/奶牛猫、宝藏/蓝猫矮脚）。当前卡在：**猫的视觉形象不好看**。

主项目后续 Phase 3-5（行为树互动、右键菜单、介绍页、博客增强）都依赖猫的最终形象，因此形象生成必须先落地。

## 二、目标

为两只真实猫咪产出能在 Canvas 上渲染的卡通形象，并沉淀一套可复用的"加新猫 / 改形象"操作流程。

**输入**：两只猫的照片（`皮皮/`、`宝藏/` 目录下约 70 张 JPG + 6 个 MP4）+ 文字描述

**输出**：
- 每只猫的精灵图或可渲染形象（在 Canvas 上能看）
- 一个操作文档：以后要加新猫或修改现有猫的形象，知道按什么步骤做

## 三、约束

1. 最终渲染在现有 `#petCanvas` 上（`renderer.js` 统一驱动）
2. 与现有 `CatSystem` 接口兼容 — `PetDraw.drawCat(ctx, typeKey, state)` 保持可用
3. 两只猫的特性必须体现：皮皮的奶牛黑白斑+肥胖、宝藏的蓝灰毛+矮脚+白手套+白脸

## 四、方案：Nano Banana 2 via MCP

### 4.1 为什么选 Nano Banana 2

用 Google 的 Nano Banana 2（`gemini-3.1-flash-image`），通过 `@nanobanana/mcp` 插件直接在 Claude Code 中调用。

| 维度 | Nano Banana 2 | 备选：gpt-image-2 |
|------|--------------|-------------------|
| 安装 | `claude mcp add nanobanana` 一行 | 需要自己写 curl/Node 脚本 |
| 成本 | $0.034/千张 ≈ 免费 | $0.006-0.05/张 |
| 速度 | ~4秒/张 | 中等 |
| 漫画/插画风格 | 🏆 更强（动漫、Ghibli 风） | 写实更强 |
| 参考图数量 | 最多 14 张 | 最多 16 张 |
| API 集成 | MCP 插件自动管理 | 手动管理 token + 请求 |
| 在 Claude Code 中 | 直接用自然语言："生成一张…" | 需要 `curl` 调用 |

对猫卡通形象的需求（插画风、多参考图、低成本迭代），Nano Banana 2 更合适。

### 4.2 Nano Banana 2 安装与配置

**前提**：一个 Google API Key → 在 [aistudio.google.com/apikey](https://aistudio.google.com/apikey) 免费获取。

**安装**（在项目目录下执行）：

```bash
claude mcp add nanobanana -e GEMINI_API_KEY=你的密钥 -- npx -y @nanobanana/mcp
```

安装后，Claude Code 会话中获得以下工具：
- `generate_image` — 文生图
- `edit_image` — 图生图 / 参考图编辑
- `list_models` — 查看可用模型

### 4.3 生成猫咪形象的工作流

**第 1 步：挑选参考图**

从 `皮皮/` 和 `宝藏/` 目录中各挑 4-6 张最能代表外貌特征的照片（正面、侧面、站立、坐姿），确保：
- 猫的斑纹/颜色清晰可见
- 眼睛颜色可辨认
- 不同角度覆盖

**第 2 步：生成皮皮的卡通形象**

在 Claude Code 中发出（自然语言即可）：

> 用 Nano Banana 生成一张皮皮的卡通精灵图。皮皮是一只 18 斤的英短奶牛猫，白色身体上有大块黑色斑块（背部、右脸面罩），黑色尾巴，铜金色大眼睛。风格参考：可爱卡通像素风游戏精灵，侧面行走姿态，透明背景。参考图：[附上挑选的皮皮照片路径]。

**第 3 步：生成宝藏的卡通形象**

> 用 Nano Banana 生成一张宝藏的卡通精灵图。宝藏是一只蓝灰色英短，矮脚（Munchkin 短腿），身体偏长，四只脚是白色的（像穿了白袜子），下巴和嘴部有白色标记。铜金色眼睛。风格同皮皮。

**第 4 步：迭代精调**

根据生成效果调整提示词（更胖/更瘦、斑块位置、颜色深浅），必要时重新挑参考图。Nano Banana 的 4 秒出图速度让快速迭代可行。

### 4.4 渲染集成：Canvas drawImage

生成满意的精灵图后，用 `ctx.drawImage()` 替换当前 `PetDraw` 的程序化几何绘制。保留 `PetDraw` 架构接口不变：

```javascript
// PetDraw.drawCat() 内部改为：
//   程序化绘制 → fallback
//   精灵图模式 → ctx.drawImage(spriteSheets[typeKey], frameX, 0, fw, fh, ...)
```

### 4.5 长期备选

如果要切换模型（比如 gpt-image-2 的提示词遵循度更高），只需改生成环节，集成代码不变。

## 五、不在范围

- 优化现有程序化绘制
- 修改行为树 / 互动系统（主项目 Phase 3）
- 修改粒子系统 / 主题系统
- 新建 HTML 页面

## 六、和主项目的关系

```
主项目 Phase 1-2 ✅ → 子项目：猫咪形象 → Phase 3：行为树互动 → Phase 4-5
```

形象生成完成后，主项目 Phase 3 直接用最终形象开发互动功能。

## 七、验收标准

- [ ] `@nanobanana/mcp` 在 Claude Code 中安装成功，`generate_image` 可用
- [ ] 生成一张皮皮的卡通形象，视觉上可辨识奶牛猫特征
- [ ] 生成一张宝藏的卡通形象，视觉上可辨识蓝猫矮脚白手套特征
- [ ] 精灵图集成到 Canvas 渲染中，替换当前几何绘制
- [ ] 操作文档记录到项目目录

---

*文档版本：v1.1 · 2026-07-04*
