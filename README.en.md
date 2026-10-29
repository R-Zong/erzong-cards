# erzong-cards · Apple-style cards for Xiaohongshu (RedNote) and WeChat

![License](https://img.shields.io/badge/License-Apache_2.0-0066CC?style=flat-square)
![Size](https://img.shields.io/badge/size-3%3A4_1080x1440-1D1D1F?style=flat-square)
![Layouts](https://img.shields.io/badge/layouts-27-6E6E73?style=flat-square)
![Claude Code](https://img.shields.io/badge/Claude_Code-supported-6B5B95?style=flat-square)
![Codex](https://img.shields.io/badge/Codex-supported-222222?style=flat-square)

[中文](README.md)

**Clean cards in the style of Apple's website, made from your own words.**
You write the content. It handles layout, color and white space: picks from 27 layouts, blends product shots into the page, checks its own output, and never rewrites a word without asking.

![erzong-cards examples](docs/images/hero.png)

## Why I made this

I wanted a set of cards that felt like mine.

A lot of cards out there feel AI-made and pack too much onto one page, so the reader's attention has nowhere to land. erzong-cards follows one rule: **one card, one idea.** Let white space do the work, use color once, and make sure the reader actually remembers something.

I built it for myself first, and I'm sharing it as open source.

— Erzong (二宗)

## Start in 30 seconds

Send this to your AI assistant (anything that can run commands, such as Claude Code or Codex):

```text
Install erzong-cards: clone https://github.com/R-Zong/erzong-cards,
copy its skills/erzong-cards folder to ~/.claude/skills/erzong-cards,
then run npm install inside that folder's engine directory. Tell me whether SKILL.md is there.
```

Then just ask:

```text
Use erzong-cards to turn this article into Xiaohongshu cards, about 6 of them.
Turn this long article into cards word for word. Don't cut anything.
Here's our new kettle (white-background photo attached). Make a product intro set.
Make a screenshot breakdown from this tweet. The first card has only the title and the screenshot.
Make a travel set from these 4 photos, white page, no page dots.
Make a 3-step tutorial on clearing spam texts from your phone.
```

It shows you a page plan first (how many cards, what goes on each), and renders only after you agree.

## What makes it different

- ✍️ **Your words stay yours.** When something doesn't fit, it suggests and asks. No filler, no "follow me" lines.
- 🧩 **27 layouts, picked for you.** Covers, key points, steps, pitfalls, quotes, stats, bar charts, tables, cost lists, comparisons, before/after, product highlights, photo grids, full-bleed photos, panoramas.
- 📖 **Long-form, word for word.** Articles are paginated automatically; paragraphs split at sentence ends, headings never end up at the bottom of a page.
- 🫧 **Seamless product shots.** White and light-gray backgrounds are blended into the page while keeping the product's own shadow; dark scene shots fade in.
- 🔍 **Checks its own work.** Text over images, text past the margins, orphans, overflow, titles set too high, too many accent colors, blurry images: all flagged and fixed.
- 🎛 **One line to restyle.** Light-gray or white page, rounded or square corners, dark cover, 5 accent colors, Chinese or English.
- 💻 **Double-click install on Windows.** Uses the built-in Edge browser, no extra download. Fonts are bundled, so Windows and macOS render the same.
- 🔒 **Rendered on your machine.** Layout and rendering happen locally, offline.

<img src="docs/images/before-after.png" alt="Product shot before and after" width="640">

## 27 layouts

Grouped by what the page needs to do: covers (C), text (T), numbers (N), structure (X), products (G), photos (I). You can also name one directly: "use the steps layout for page 2".

![27 layouts](docs/images/layouts.png)

Capacity and usage for each layout: [`references/layouts.md`](skills/erzong-cards/references/layouts.md) (Chinese).

## Good for

- **Students**: course notes, exam key points
- **Teachers**: concept explainers, lesson visuals
- **Office workers**: project reviews, annual summaries
- **Social media managers**: product intros, comparisons, screenshot breakdowns
- **Lifestyle creators**: travel, cafés, outfits, favorite things (with your own photos)

**Not a good fit**: scrapbook or heavily decorated styles, memes, promo posters. It will tell you so instead of forcing it.

## Rules we keep

1. **One card, one idea.** One title, one main element, at most one supporting element.
2. **White space does the work.** Content fills about half the page.
3. **Color, once.** One accent per page, usually a word in the title.
4. **Font sizes are fixed.** If it doesn't fit, split the page; never shrink the text.
5. **No words put in your mouth.** No rewriting, no filler, no calls to follow.
6. **Photos stay as they are.** No filters, no color shifts, no frames.

## Examples

| Tutorial | Product intro | Screenshot breakdown | Travel |
|---|---|---|---|
| ![](examples/tutorial/overview.png) | ![](examples/product/overview.png) | ![](examples/screenshot/overview.png) | ![](examples/travel/overview.png) |

Content files are in `examples/*/cards.json`; single cards in `examples/*/out/`. The sample content is in Chinese; set `"lang": "en"` for English cards.

## Install

The skill itself is the `skills/erzong-cards` folder.

**1. Put the folder where your tool looks for skills**

| Tool | Location |
|---|---|
| Claude Code | `~/.claude/skills/erzong-cards` (or `.claude/skills/` in a project) |
| Claude (web / desktop) | Zip `skills/erzong-cards` and upload it under Skills in settings |
| Codex | `~/.codex/skills/erzong-cards` |
| Other tools that read SKILL.md | That tool's skills folder |

**2. Install the render engine (once)**

Requires [Node.js](https://nodejs.org) (LTS).

- Windows: double-click `skills/erzong-cards/install/安装.bat`
- macOS / Linux: `bash skills/erzong-cards/install/install.sh`

If your tool cannot run commands, use the lite mode: it writes one HTML page; open it in a browser and click "下载全部图片" (download all). See [`references/lite.md`](skills/erzong-cards/references/lite.md).

## FAQ

**Do I need to code?**
No. Once installed, just ask in plain words. If you like, you can also edit `cards.json` yourself and render.

**Why not AI image generation?**
Generated images often get text wrong and change every run. erzong-cards renders real web layouts: sharp text, exact colors, and changing one word changes only that word.

**Can I use it commercially?**
The code is Apache 2.0, so yes. Bundled fonts are SIL OFL and icons are MIT, both fine for commercial use. Example photos are for demonstration only.

**English?**
Yes. Set `"lang": "en"` and line height, letter spacing and punctuation follow English conventions.

**How many cards per set?**
Xiaohongshu allows up to 18 per post; 9 or fewer is recommended (WeChat image messages allow 9). It warns you when you go over.

**Is this related to Apple?**
No. "Apple-style" refers only to the restraint and white space of Apple's website. No Apple names, logos, product images or fonts are used.

## What's next

- Verified installs on more platforms (WorkBuddy, Qwen and others)
- An English accent font for photo cards
- A second theme (likely lifestyle and mood)

Requests and bug reports are welcome as [Issues](../../issues).

## Acknowledgements

Thanks to [guizang-social-card-skill](https://github.com/op7418/guizang-social-card-skill) by Guizang for showing what layout-driven card generation can do. erzong-cards takes a different path: restrained Apple-style layouts, built for non-designers, with automatic layout selection.

## License

[Apache License 2.0](LICENSE). Bundled fonts and icons keep their own licenses; see [NOTICE](NOTICE).
