# 二宗卡片 erzong-cards

把文字、截图、产品图、照片排成**苹果风**的 3:4 卡片，小红书图文、公众号贴图都能直接发。

只排版，不生图：用本机浏览器把网页排版渲染成 1080 × 1440 的 PNG，字清楚、颜色准、每次结果一样。

[English](README.en.md)

![教程拆解示例](examples/tutorial/overview.png)

## 它能做什么

- **你给内容，它排一整组**：说个场景（"做个产品介绍""把这篇文章做成图"），它会按场景分页、选版式，先跟你确认分页再出图。
- **27 个版式**：封面、要点、步骤、避坑、数据、条形图、表格、算账、对比、改造前后、产品亮点、照片宫格、满版照片……按内容自动选。
- **长文一个字都不删**：要完整阅读时，原文自动分页排版。
- **图片自动处理**：白底、浅灰底产品图自动换成页面底色，看不出接缝；深色场景图自动渐隐；照片不加滤镜。
- **出图后自己检查**：文字压图、超出边距、孤字、内容放不下、强调色用多了，都会标出来再修。
- **苹果风可调**：浅灰 / 纯白底、圆角 / 直角、深色封面、5 种强调色、中文 / 英文。

## 适合这些场景

- 学生｜课程笔记、考试重点
- 老师｜知识点讲解、课件配图
- 职场人｜项目复盘、年度总结、述职
- 新媒体运营｜产品介绍、测评对比、截图解读
- 生活方式博主｜旅行、探店、穿搭、好物分享（用你自己的照片）

不太适合：手账风、重装饰风格、搞笑段子、促销海报。

## 示例

| 产品介绍 | 截图解读 | 旅行分享 |
|---|---|---|
| ![产品介绍](examples/product/overview.png) | ![截图解读](examples/screenshot/overview.png) | ![旅行分享](examples/travel/overview.png) |

每个示例的内容文件在 `examples/*/cards.json`，单张图在 `examples/*/out/`。

## 安装

技能本体是 `skills/erzong-cards` 这个文件夹。

**1. 把文件夹放到你用的平台**

| 平台 | 放到哪里 |
|---|---|
| Claude Code | `~/.claude/skills/erzong-cards`（或项目里的 `.claude/skills/`） |
| Claude 网页 / 桌面版 | 把 `skills/erzong-cards` 打成 zip，在设置的技能（Skills）里上传 |
| Codex | `~/.codex/skills/erzong-cards` |
| 其他支持 SKILL.md 的平台（WorkBuddy、千问等） | 放到该平台的技能目录 |

**2. 装出图引擎（只需一次）**

需要 [Node.js](https://nodejs.org)（LTS 版）。

- Windows：双击 `skills/erzong-cards/install/安装.bat`（用国内镜像，出图用系统自带的 Edge）
- Mac / Linux：`bash skills/erzong-cards/install/install.sh`（出图用本机 Chrome）

平台不能运行命令时，也可以用简易档：生成一个网页，用浏览器打开后点"下载全部图片"。见 `skills/erzong-cards/references/lite.md`。

## 怎么用

直接跟 AI 说：

> 用二宗卡片，把下面这篇文章做成小红书图文，苹果风。
>
> 把这张推文截图做成截图解读，第一张只放标题和截图。
>
> 这几张旅行照片做一组分享，白底，不要翻页圆点。

也可以自己写内容文件再出图：

```bash
node skills/erzong-cards/engine/render.cjs examples/tutorial/cards.json 输出文件夹
```

内容文件格式见 `skills/erzong-cards/references/deck-format.md`，版式字段见 `references/layouts.md`。

## 字体与素材

- 随包字体：思源黑体（Noto Sans SC）、思源宋体（Noto Serif SC）、Inter，均为 SIL OFL 1.1，已按常用字（GB2312）截取，Windows / Mac 出图一致。
- 图标：Phosphor Icons（MIT）。
- 示例照片来源见 `examples/SOURCES.md`。

## 说明

"苹果风"只借鉴苹果官网排版的克制和留白，不使用 Apple 的名字、标志、产品图和字体。**本项目与 Apple 公司无关。**

## 反馈

有问题或想要的版式，欢迎提 [Issue](../../issues)。

## 致谢

感谢歸藏的 [guizang-social-card-skill](https://github.com/op7418/guizang-social-card-skill)，让我们看到用排版出图的更多可能。二宗卡片走的是另一条路：苹果风的克制排版，面向不懂设计的普通人，自动判断版式。

## 协议

[Apache License 2.0](LICENSE)。随包字体和图标保留各自的协议，见 [NOTICE](NOTICE)。
