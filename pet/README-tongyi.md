# 猫咪形象生成 — 通义万相工作流

## 前置准备

1. 打开 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 登录阿里云账号 →「API-KEY 管理」→ 创建 Key（格式 `sk-` 开头）
3. 新用户免费 50-100 张图片

## 模型选择

| 模型 | 用途 | 说明 |
|------|------|------|
| `wan2.6-t2i` | **文生图（推荐）** | 纯文字描述，不用参考图。简单提示词效果好 |
| `wan2.6-image` | 图生图/编辑 | 传 1-4 张参考图。适合改细节，但局部编辑不稳定 |

## 生成步骤

### 1. 写提示词

**成功模板**（皮皮同款画风）：
```
a cute cartoon game sprite of a [猫的描述],
[关键特征1], [关键特征2], ...,
side walking view, plain light background, no text
```

画风稳定关键词：`cute cartoon game sprite` + `side walking view` + `plain light background` + `no text`

### 2. 调用 API

```bash
curl -s --location "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <API_KEY>" \
  -d '{
    "model": "wan2.6-t2i",
    "input": {
      "messages": [{"role":"user","content":[{"text":"<提示词>"}]}]
    },
    "parameters": {"n": 1, "size": "1024*1024", "watermark": false}
  }' > response.json
```

### 3. 提取并下载图片

```bash
URL=$(node -e "const d=require('./response.json'); \
  console.log(d.output.choices[0].message.content.find(c=>c.type==='image').image)")
curl -L "$URL" -o pet/sprites/<name>-sprite.png
```

⚠️ 图片 URL 约 5-10 分钟过期，生成后立即下载。

### 4. 版本管理

每次生成保存为带版本号的文件：
```
pet/sprites/<name>-v1.png
pet/sprites/<name>-v2.png
pet/sprites/<name>-sprite.png  ← 当前使用版本
```

## 提示词关键要素

对每只猫，确保覆盖这些维度：

| 维度 | 示例词 |
|------|--------|
| 品种 | British Shorthair, Munchkin |
| 毛色 | cow pattern, silver shaded, blue-gray |
| 眼睛 | copper golden, deep dark green, with black eyeliner |
| 脸型 | round chubby face, short pink nose |
| 体型 | chubby stocky body, long slender body, short thick legs |
| 特殊标记 | yin yang face, white paws/socks, split face pattern |
| 神态 | cute innocent expression, simple cute expression |

## 经验教训

- ❌ 参考图容易干扰模型对细节的判断（脸部斑纹、毛色）
- ✅ 简单英文提示词比复杂中文描述更稳定
- ❌ 图编辑模式（`wan2.6-image`）不适合局部像素级修改
- ✅ 不满意就重新生成，比反复调提示词更高效
- ✅ 生成多版本，人眼对比选择 > 无限迭代

## 费用

| 模型 | 单价 |
|------|------|
| `wan2.6-t2i` | ¥0.04-0.12/张 |
| `wan2.6-image` | ¥0.04-0.20/张 |

新用户免费 50-100 张。
