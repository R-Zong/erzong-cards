/* 二宗卡片 · 简易档下载（不需要安装任何东西）
   把每张卡片画成 1080 × 1440 的 PNG 下载下来。
   原理：卡片 + 样式 + 字体 一起放进 SVG，再画到 canvas 上。
   需要浏览器能读到字体文件：用平台的网页预览、或本地网页服务打开都可以；
   直接双击打开 .html 时，部分浏览器会拦截读取，这时请改用完整档（render.cjs）。          */
(function () {
  'use strict';
  const toData = async url => { const r = await fetch(url); if (!r.ok) throw new Error(url); const b = await r.blob();
    return await new Promise((ok, no) => { const f = new FileReader(); f.onload = () => ok(f.result); f.onerror = no; f.readAsDataURL(b); }); };
  async function cssText() {
    let out = '';
    for (const sh of document.styleSheets) {
      let rules; try { rules = sh.cssRules; } catch (e) { throw new Error('读不到样式文件'); }
      for (const r of rules) {
        let t = r.cssText;
        if (r.type === CSSRule.FONT_FACE_RULE) {
          const m = t.match(/url\("?([^")]+)"?\)/); if (m) { const abs = new URL(m[1], sh.href || location.href).href; t = t.replace(m[0], `url("${await toData(abs)}")`); }
        }
        out += t + '\n';
      }
    }
    return out;
  }
  async function inlineImages(node) {
    for (const im of node.querySelectorAll('img')) { if (im.src.startsWith('data:')) continue; try { im.src = await toData(im.src); } catch (e) { /* 读不到就留空 */ } }
    const live = document.querySelectorAll('#' + node.id + ' canvas'); const cl = node.querySelectorAll('canvas');
    cl.forEach((c, i) => { try { const im = document.createElement('img'); im.src = live[i].toDataURL(); im.className = c.className; im.style.cssText = c.style.cssText; c.replaceWith(im); } catch (e) { } });
  }
  async function shot(card, css) {
    const clone = card.cloneNode(true); clone.querySelectorAll('.qa').forEach(e => e.remove());
    await inlineImages(clone);
    const cls = document.body.className.replace('shooting', '');
    const html = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" class="${cls}" style="margin:0"><style>${css.replace(/<\/style/g, '')}</style>${html}</div></foreignObject></svg>`;
    const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await img.decode(); await new Promise(r => setTimeout(r, 120));
    const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1440; cv.getContext('2d').drawImage(img, 0, 0);
    return cv.toDataURL('image/png');
  }
  async function downloadAll(btn) {
    const msg = document.querySelector('.toolbar .msg'); btn.disabled = true;
    try {
      const css = await cssText(); const cards = [...document.querySelectorAll('.card')];
      for (let i = 0; i < cards.length; i++) {
        msg.textContent = `正在导出第 ${i + 1} / ${cards.length} 张…`;
        const url = await shot(cards[i], css); const a = document.createElement('a');
        a.href = url; a.download = `${String(i + 1).padStart(2, '0')}-${cards[i].dataset.name}.png`; document.body.appendChild(a); a.click(); a.remove();
        await new Promise(r => setTimeout(r, 300));
      }
      msg.textContent = `已导出 ${cards.length} 张`;
    } catch (e) {
      msg.textContent = '这个打开方式读不到字体或图片，下载不了。请用完整档出图（node engine/render.cjs），或用平台的网页预览打开。';
    }
    btn.disabled = false;
  }
  window.ERZONG_EXPORT = downloadAll;
})();
