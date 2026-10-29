# 内容文件格式

一个 JSON 文件 = 一组卡片（一篇笔记）。图片路径相对于这个 JSON 所在的文件夹。

```json
{
  "theme": "apple",
  "options": {
    "page": "gray",
    "accent": "blue",
    "corner": "round",
    "dark": "none",
    "lang": "zh",
    "account": "",
    "dots": true
  },
  "cards": [
    { "layout": "C02", "title": "……" }
  ]
}
```

## options（整组统一，不混用）

| 选项 | 可选值 | 默认 | 说明 |
|---|---|---|---|
| `page` | `gray` / `white` | `gray` | 页面底色 #F5F5F7 或纯白（纯白时圆角块反过来用浅灰） |
| `accent` | `blue` / `green` / `orange` / `purple` / `red` / `#色值` | `blue` | 强调色；选橙色时提示色自动改成加粗黑 |
| `corner` | `round` / `square` | `round` | 圆角 32px 或直角，整组统一 |
| `dark` | `none` / `cover` / `all` | `none` | 深色：不放 / 只有封面 / 整组。不替用户加深色页 |
| `lang` | `zh` / `en` | `zh` | 英文版：行距 1.47、大标题收紧字距；英文用句首大写 |
| `account` | 文字 | 空 | 页脚账号名。**只有用户明确要求才填** |
| `dots` | `true` / `false` | `true` | 右上角翻页圆点。照片为主的一组建议 `false` |

## 文字标记

| 写法 | 效果 | 规则 |
|---|---|---|
| `\n` | 换行 | 标题的换行写在内容里，一行一个意思 |
| `[词]` | 强调色 | **每页一处**，通常是标题里的一个词 |
| `**词**` | 正文里加深 | 关键半句 |
| `{词}` | 提示橙 | 日期、价格、待确认参数；每页最多一处 |
| `\|English\|` | 英文点缀字体（斜体衬线） | 照片页标题下面加一行英文 |

## 图片写法

字符串 `"a/photo.jpg"`，或对象：

```json
{ "src": "a/kettle.png", "pos": "50% 40%", "fx": "auto", "trim": true }
```

- `pos`：裁切对准哪里（照片铺满、宫格时用）
- `fx`：`auto`（产品位默认，自动判断）/ `gray`（浅灰或白底换底）/ `white` / `dark`（深色渐隐底图）/ `none`
- `trim: false`：不要自动裁空白

## 出图命令

```bash
node engine/render.cjs 内容.json 输出文件夹          # 出图 + 质检
node engine/render.cjs 内容.json 输出文件夹 --check  # 只预检
node engine/render.cjs 内容.json --browser=msedge    # 指定浏览器（chromium / msedge / chrome）
```

导出规格：1080 × 1440，sRGB，PNG；单张超过 5MB 自动转高质量 JPEG。没写输出文件夹时，建在内容文件旁边，名字是"日期-标题前几个字"。
