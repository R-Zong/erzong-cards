# erzong-cards (二宗卡片)

Turn text, screenshots, product shots and photos into **Apple-style** 3:4 cards, ready to post on Xiaohongshu (RedNote) and as WeChat image posts.

Layout only, no AI image generation: your local browser renders HTML layouts into 1080 × 1440 PNGs, so text stays sharp, colors stay accurate, and every run gives the same result.

[中文](README.md)

![Tutorial example](examples/tutorial/overview.png)

## What it does

- **You bring the content, it lays out the whole set.** Name a scenario ("a product intro", "turn this article into cards"). It splits the content into pages and picks a layout for each, then checks the page plan with you before rendering.
- **27 layouts**: covers, key points, steps, pitfalls, stats, bar charts, tables, cost lists, comparisons, before/after, product highlights, photo grids, full-bleed photos and more. The layout is chosen from the content.
- **Long-form, word for word.** If the reader needs the whole article, the original text is paginated automatically without cutting a word.
- **Image handling.** White or light-gray product shots are blended into the page color with no visible seam. Dark scene shots fade in smoothly. Photos are never filtered.
- **Checks its own output.** Text over images, text past the margins, orphaned characters, overflowing content and overused accent color are all flagged and fixed.
- **Adjustable.** Light-gray or white page, rounded or square corners, dark cover, 5 accent colors, Chinese or English.

## Good for

- Students: course notes, exam key points
- Teachers: concept explainers, lesson visuals
- Office workers: project reviews, annual summaries
- Social media managers: product intros, comparisons, screenshot breakdowns
- Lifestyle creators: travel, cafés, outfits, favorite things (with your own photos)

Not a good fit: scrapbook or heavily decorated styles, memes, promo posters.

## Examples

| Product intro | Screenshot breakdown | Travel |
|---|---|---|
| ![Product](examples/product/overview.png) | ![Screenshot](examples/screenshot/overview.png) | ![Travel](examples/travel/overview.png) |

Each example's content file is `examples/*/cards.json`, and the single cards are in `examples/*/out/`. The sample content is in Chinese; set `"lang": "en"` for English cards.

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

- Windows: double-click `skills/erzong-cards/install/安装.bat` (uses the built-in Edge browser)
- macOS / Linux: `bash skills/erzong-cards/install/install.sh` (uses your local Chrome)

If your tool cannot run commands, use the lite mode: it writes one HTML page; open it in a browser and click "下载全部图片" (download all). See `skills/erzong-cards/references/lite.md`.

## Usage

Just ask your assistant:

> Use erzong-cards to turn this article into Xiaohongshu cards, Apple style.
>
> Make a screenshot breakdown from this tweet. The first card has only the title and the screenshot.
>
> Make a travel set from these photos, white page, no page dots.

Or write a content file yourself and render it:

```bash
node skills/erzong-cards/engine/render.cjs examples/tutorial/cards.json out
```

The content file format is in `skills/erzong-cards/references/deck-format.md`; layout fields are in `references/layouts.md`.

## Fonts and assets

- Bundled fonts: Noto Sans SC, Noto Serif SC and Inter, all SIL OFL 1.1, subset to common Chinese characters (GB2312) so Windows and macOS render identically.
- Icons: Phosphor Icons (MIT).
- Example photo sources: `examples/SOURCES.md`.

## Disclaimer

"Apple-style" refers only to the restraint and white space of Apple's website layouts. The project uses no Apple names, logos, product images or fonts. **This project is not affiliated with Apple Inc.**

## Feedback

Questions and layout requests are welcome as [Issues](../../issues).

## Acknowledgements

Thanks to [guizang-social-card-skill](https://github.com/op7418/guizang-social-card-skill) by Guizang for showing what layout-driven card generation can do. erzong-cards takes a different path: restrained Apple-style layouts, built for non-designers, with automatic layout selection.

## License

[Apache License 2.0](LICENSE). Bundled fonts and icons keep their own licenses; see [NOTICE](NOTICE).
