# 猫咪形象管理

## 目录结构

```
pet/
├── sprites/              # AI 生成的精灵图
│   ├── pipi-sprite.png   # 皮皮（奶牛猫）
│   └── baozang-sprite.png # 宝藏（蓝猫矮脚）
├── 皮皮/                 # 真猫参考照片（8张精选）
├── 宝藏/                 # 真猫参考照片（12张）
├── cat-sprite/           # 旧 GIF 素材（保留）
└── README.md
```

## 生成新猫形象的步骤

### 1. 准备 API Key

通义万相 API：在 [阿里云百炼控制台](https://bailian.console.aliyun.com/) 创建 `sk-` 开头的 Key。

### 2. 准备参考照片

在 `pet/` 下新建以猫名命名的文件夹，放入 6-12 张精选照片。

### 3. 生成精灵图

```bash
# 替换 <API_KEY> 和提示词中的猫描述
curl -s --location "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <API_KEY>" \
  -d '{
    "model": "wan2.6-t2i",
    "input": {
      "messages": [{"role":"user","content":[{"text":"<猫的外貌描述>"}]}]
    },
    "parameters": {"n": 1, "size": "1024*1024"}
  }' > response.json

# 从返回结果提取图片 URL 并下载
URL=$(node -e "const d=require('./response.json'); console.log(d.output.choices[0].message.content[0].image)")
curl -L "$URL" -o pet/sprites/<name>-sprite.png
```

⚠️ 图片 URL 过期时间约 5-10 分钟，生成后立即下载。

### 4. 注册到系统

在 `js/pet/pet-types.js` 的 `CAT_TYPES` 中添加新猫的参数定义。

在 `js/pet/pet-system.js` 的 `init()` 中调用 `createCatState('<id>')` 创建新猫。

精灵图自动由 `js/pet/pet-draw.js` 加载，无需额外配置。

## 修改现有猫的形象

直接重新生成精灵图，覆盖 `pet/sprites/<name>-sprite.png` 即可。系统会在刷新页面后自动加载新图。

## 切换回程序化绘制

删除或移动 `pet/sprites/` 下对应猫的 PNG 文件，系统自动回退到几何图形绘制。

## 费用

| 模型 | 单价 |
|------|------|
| `wan2.6-t2i` | ¥0.04-0.12/张 |
| `qwen-image-2.0-pro` | ¥0.12-0.20/张 |

新用户免费 50-100 张。
