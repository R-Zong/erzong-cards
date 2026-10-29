#!/usr/bin/env node
/* 二宗卡片 · 出图（完整档）
   用法：node render.cjs <内容文件.json> [输出文件夹] [--check] [--browser=chromium|msedge|chrome]
   - --check   只做预检（字数、条数、缺字），不出图
   - 输出：01-封面.png …、总览.png、预览.html（可在浏览器里打开修改）               */
'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v === undefined ? true : v]; }));
const pos = args.filter(a => !a.startsWith('--'));
if (!pos[0]) { console.log('用法：node render.cjs <内容文件.json> [输出文件夹] [--check] [--browser=msedge]'); process.exit(1); }

const SKILL = path.resolve(__dirname, '..');
const deckPath = path.resolve(pos[0]);
const deck = JSON.parse(fs.readFileSync(deckPath, 'utf8'));
const theme = (deck.theme || 'apple').replace(/[^a-z0-9-]/gi, '');
const stamp = new Date().toISOString().slice(0, 10);
const firstTitle = String(((deck.cards || [])[0] || {}).title || '').replace(/[\[\]{}*|\n]/g, '').replace(/[\\/:*?"<>|]/g, '').slice(0, 8);
const outDir = path.resolve(pos[1] || path.join(path.dirname(deckPath), `${stamp}-${firstTitle || 'cards'}`));

function loadPlaywright() {
  for (const m of ['playwright', 'playwright-core']) {
    try { return require(m); } catch (e) { /* 继续找 */ }
    try { return require(path.join(__dirname, 'node_modules', m)); } catch (e) { /* 继续找 */ }
  }
  console.error('没有找到 Playwright。请先运行安装：Windows 双击 install/安装.bat；Mac / Linux 运行 bash install/install.sh');
  process.exit(2);
}

async function launch(chromium) {
  const tries = flags.browser ? [flags.browser] : ['chromium', 'msedge', 'chrome'];
  const base = { args: ['--allow-file-access-from-files', '--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb'] };
  let last;
  for (const t of tries) {
    try { return await chromium.launch(t === 'chromium' ? base : Object.assign({ channel: t }, base)); } catch (e) { last = e; }
  }
  console.error('打不开浏览器。Windows 会用自带的 Edge；Mac 请先装 Chrome。\n' + (last && last.message.split('\n')[0]));
  process.exit(3);
}

function pageHTML() {
  const u = p => pathToFileURL(path.join(SKILL, p)).href;
  const base = pathToFileURL(path.dirname(deckPath) + path.sep).href;
  const json = JSON.stringify(deck).replace(/</g, '\\u003c');
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>二宗卡片 · 预览</title>
<base href="${base}">
<link rel="stylesheet" href="${u('fonts/fonts.css')}">
<link rel="stylesheet" href="${u(`themes/${theme}/theme.css`)}">
<script src="${u('engine/charset.js')}"></script>
<script src="${u('icons/phosphor-bold.js')}"></script>
<script src="${u('icons/phosphor-regular.js')}"></script>
<script src="${u('icons/phosphor-fill.js')}"></script>
<script>window.DECK=${json};</script>
<script src="${u('engine/cards.js')}"></script>
</head><body><div class="toolbar"><b>二宗卡片</b><span class="msg">排版中…</span></div><main class="sheet"></main></body></html>`;
}

(async () => {
  const { chromium } = loadPlaywright();
  fs.mkdirSync(outDir, { recursive: true });
  const htmlPath = path.join(outDir, '预览.html');
  fs.writeFileSync(htmlPath, pageHTML());
  const browser = await launch(chromium);
  const page = await browser.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 1 });
  await page.route('**/*', r => (r.request().url().startsWith('file:') || r.request().url().startsWith('data:') ? r.continue() : r.abort()));   // 出图不联网
  page.on('pageerror', e => console.error('页面出错：', e.message));
  await page.goto(pathToFileURL(htmlPath).href);
  const res = await page.evaluate(() => window.ERZONG_READY);
  if (!res) { console.error('内容文件没有卡片'); process.exit(4); }

  console.log(`\n二宗卡片：${res.cards.length} 张 → ${outDir}`);
  if (res.check.length) console.log('\n【预检提醒】（建议改好再出；改字前先问用户）\n- ' + res.check.join('\n- '));
  const bad = res.qa.filter(x => x.issues.length);
  console.log('\n【质检】' + (bad.length ? '' : '全部通过'));
  for (const r of res.qa) console.log(`${r.id} ${r.layout} ${r.name}：${r.issues.length ? r.issues.join(' | ') : 'OK'}`);
  if (flags.check) { await browser.close(); return; }

  await page.evaluate(() => document.body.classList.add('shooting'));
  const files = [];
  for (let i = 0; i < res.cards.length; i++) {
    const c = res.cards[i]; const base = `${String(i + 1).padStart(2, '0')}-${c.name}`;
    const el = page.locator('#' + c.id);
    let file = path.join(outDir, base + '.png');
    await el.screenshot({ path: file, type: 'png' });
    if (fs.statSync(file).size > 5 * 1024 * 1024) {           // 小红书单张上限 5MB：自动转高质量 JPEG
      fs.unlinkSync(file); file = path.join(outDir, base + '.jpg'); await el.screenshot({ path: file, type: 'jpeg', quality: 92 });
    }
    files.push(path.basename(file));
  }
  // 总览：像信息流一样一排三张，方便一眼检查整组是否统一
  await page.evaluate(() => { const s = document.querySelector('.sheet'); s.style.cssText = 'width:3400px;zoom:.3;gap:60px;padding:60px;background:#fff'; });
  await page.locator('.sheet').screenshot({ path: path.join(outDir, '总览.png') });
  await browser.close();
  console.log('\n已导出：' + files.join('、') + '、总览.png、预览.html');
  if (bad.length) process.exitCode = 10;
})();
