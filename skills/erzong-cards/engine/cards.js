/* =========================================================
   二宗卡片 · 排版引擎（浏览器端）
   读取 window.DECK（内容文件），按版式生成卡片，处理图片，做预检和质检。
   完整档由 render.cjs 调用出 PNG；简易档直接在浏览器里打开。
   ========================================================= */
(function () {
  'use strict';
  const W = 1080, H = 1440, M = 72;
  const CN = { C01: '产品封面', C02: '大字封面', C03: '截图封面', T01: '段落页', T02: '长文', T03: '要点列表', T04: '清单', T05: '大金句', T06: '避坑页', T07: '结尾提问',
    N01: '上文下数', N02: '数据页', N03: '条形图', N04: '表格', N05: '金额清单', X01: '便当格', X02: '拆解页', X03: '双列对比', X04: '状态清单', X05: '步骤流程', X06: '改造前后',
    G01: '产品速览', G02: '单品亮点', I01: '单图分享', I02: '照片宫格', I03: '照片速览', I04: '连拼' };
  const ACCENTS = { blue: 1, green: 1, orange: 1, purple: 1, red: 1 };
  const PAGE = { gray: [245, 245, 247], white: [255, 255, 255], dark: [0, 0, 0] };

  /* ---------- 文字标记：[强调] **加深** {提示} \n 换行 ---------- */
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function md(s) {
    if (s == null) return '';
    if (Array.isArray(s)) s = s.join('\n');
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\[([^\]]+)\]/g, '<span class="accent">$1</span>')
      .replace(/\{([^}]+)\}/g, '<span class="tip">$1</span>')
      .replace(/\|([^|]+)\|/g, '<span class="en-accent">$1</span>')
      .replace(/\n/g, '<br>');
  }
  const plain = s => (Array.isArray(s) ? s.join('') : String(s == null ? '' : s)).replace(/\*\*|\[|\]|\{|\}|\|/g, '').replace(/\n/g, '');
  const lines = s => (Array.isArray(s) ? s : String(s == null ? '' : s).split('\n')).map(plain);
  /* 中文按字数，英文按“单词 × 2.2”折算，和中文上限共用一张表 */
  function len(s) {
    const t = plain(s); if (!t) return 0;
    const cjk = (t.match(/[㐀-鿿豈-﫿]/g) || []).length;
    const words = (t.replace(/[㐀-鿿豈-﫿]/g, ' ').match(/[A-Za-z0-9][A-Za-z0-9'’.%-]*/g) || []).length;
    return cjk ? cjk + words : Math.round(words * 2.2);
  }

  /* ---------- 图片 ---------- */
  const imgSpec = s => (typeof s === 'string' ? { src: s } : (s || {}));
  function img(spec, cls, role) {
    const s = imgSpec(spec); if (!s.src) return '';
    const st = s.pos ? ` style="object-position:${esc(s.pos)}"` : '';
    return `<img class="${cls || ''}" src="${esc(s.src)}" alt=""${st} data-role="${role || 'photo'}"${s.fx ? ` data-fx="${esc(s.fx)}"` : ''}${s.trim === false ? ' data-notrim="1"' : ''}>`;
  }
  const frame = (spec, cls, style) => spec ? `<div class="frame ${cls || ''}"${style ? ` style="${style}"` : ''}>${img(spec, '', 'photo')}</div>` : '';
  const ico = (name, cls) => name ? `<svg class="ico ${cls || ''}" data-icon="${esc(name)}" viewBox="0 0 256 256"></svg>` : '';
  const eb = c => c.eyebrow ? `<p class="eyebrow">${md(c.eyebrow)}</p>` : '';
  const title = (c, cls) => c.title ? `<h2 class="t-page ttl ${cls || ''}">${md(c.title)}</h2>` : '';
  function stat(n) {
    return `<div class="stat">${n.label ? `<p class="lab">${md(n.label)}</p>` : ''}<p class="val">${md(n.value)}${n.unit ? `<small>${md(n.unit)}</small>` : ''}</p>` +
      `${n.title ? `<p class="st">${md(n.title)}</p>` : ''}${n.note ? `<p class="d">${md(n.note)}</p>` : ''}</div>`;
  }
  function stats(ns) {
    ns = ns || []; const k = ns.length >= 4 ? 'stats4' : ns.length === 3 ? 'stats3' : ns.length === 2 ? 'stats2' : 'stats1';
    if (k === 'stats4') ns = ns.slice(0, 4).map(n => Object.assign({}, n, { note: '' }));
    if (k === 'stats3') return `<div class="stats3">${ns.map(n => `<div class="stat"><div>${n.label ? `<p class="lab">${md(n.label)}</p>` : ''}<p class="val">${md(n.value)}${n.unit ? `<small>${md(n.unit)}</small>` : ''}</p></div><div>${n.title ? `<p class="st">${md(n.title)}</p>` : ''}${n.note ? `<p class="d">${md(n.note)}</p>` : ''}</div></div>`).join('')}</div>`;
    return `<div class="${k}">${ns.map(stat).join('')}</div>`;
  }

  /* ---------- 版式：返回 { cls, html, bg } ---------- */
  const L = {
    C01: c => ({ html: `${eb(c)}<h1 class="t-cover ttl">${md(c.title)}</h1>${c.sub ? `<p class="sub">${md(c.sub)}</p>` : ''}<div class="hero">${img(c.image, 'prod', 'product')}</div>` }),
    C02: c => {
      const ls = lines(c.title); const big = ls.length <= 2 && ls.every(l => len(l) <= 4) && c.size !== 'normal';
      const diag = c.images && c.images.length;
      const al = c.align === 'left' ? '' : ' center';
      return { cls: diag ? 'diag' : '', html: `<div class="grp${al}" style="display:flex;flex-direction:column">${eb(c)}<h1 class="t-cover ttl${big ? ' big' : ''}">${md(c.title)}</h1>${c.sub ? `<p class="sub">${md(c.sub)}</p>` : ''}</div>` +
        (diag ? img(c.images[0], 'prod d1', 'product') + (c.images[1] ? img(c.images[1], 'prod d2', 'product') : '') : '') };
    },
    C03: c => {
      const s = imgSpec(c.shot); const mode = s.long || '';
      return { cls: c._cont ? 'cont' : '', html: (c._cont ? `<p class="cont-tag">${md(c._cont)}</p>` : `${eb(c)}${title(c)}`) +
        `<div class="shot ${mode === 'fade' ? 'fade clip' : mode === 'crop' || mode === 'split' ? 'clip' : ''}" data-long="${esc(mode)}">${img(s, 'shotimg', 'shot')}</div>` };
    },
    T01: c => ({ html: `${c.image ? frame(c.image) : ''}${eb(c)}${title(c)}${c.body ? `<p class="body">${md(c.body)}</p>` : ''}` }),
    T02: c => ({ html: `<div class="flow"></div>` }),
    T03: c => ({ html: `${eb(c)}${title(c)}<div class="items">${(c.items || []).map((it, i) => { it = typeof it === 'string' ? { t: it } : it;
      return `<div class="it">${it.icon ? ico(it.icon, '') : `<span class="n">${String(i + 1).padStart(2, '0')}</span>`}<div><p class="t">${md(it.t)}</p>${it.d ? `<p class="d">${md(it.d)}</p>` : ''}</div></div>`; }).join('')}</div>` }),
    T04: c => ({ html: `${eb(c)}${title(c)}<div class="list">${(c.items || []).map((it, i) => `<div class="li"><span class="n">${String(i + 1).padStart(2, '0')}</span><p class="t">${md(typeof it === 'string' ? it : it.t)}</p></div>`).join('')}</div>` }),
    T05: c => ({ html: `${eb(c)}<p class="q ttl">${md(c.quote || c.title)}</p>${c.by ? `<p class="by">${md(c.by)}</p>` : ''}` }),
    T06: c => ({ html: `${eb(c)}${title(c)}<div class="rows">${(c.items || []).map(it => { it = typeof it === 'string' ? { t: it } : it;
      return `<div class="r"><span class="x">✕</span><div><p class="t">${md(it.t)}</p>${it.d ? `<p class="d">${md(it.d)}</p>` : ''}</div></div>`; }).join('')}</div>` }),
    T07: c => ({ html: `${eb(c)}<p class="q ttl">${md(c.question || c.title)}</p>${c.sub ? `<p class="sub">${md(c.sub)}</p>` : ''}` }),
    N01: c => ({ html: `${eb(c)}${title(c)}${c.body ? `<p class="body">${md(c.body)}</p>` : ''}<div class="rule"></div>${stats(c.numbers)}` }),
    N02: c => ({ html: `${eb(c)}${title(c)}${stats(c.numbers)}` }),
    N03: c => {
      const bs = c.bars || []; const max = Math.max(...bs.map(b => parseFloat(b.v) || 0), 1);
      const top = Math.max(...bs.map(b => parseFloat(b.v) || 0));
      return { html: `${eb(c)}${title(c)}<div class="bars">${bs.map(b => `<div class="b${(parseFloat(b.v) || 0) === top && c.highlight !== false ? ' top' : ''}"><span class="k">${md(b.k)}</span><div class="track"><div class="fill" style="width:${Math.max(2, (parseFloat(b.v) || 0) / max * 100)}%"></div></div><span class="v">${md(b.label || b.v)}</span></div>`).join('')}</div>${c.note ? `<p class="note">${md(c.note)}</p>` : ''}` };
    },
    N04: c => ({ html: `${eb(c)}${title(c)}<div class="block"><table>${c.head ? `<tr>${c.head.map(h => `<th>${md(h)}</th>`).join('')}</tr>` : ''}${(c.rows || []).map(r => `<tr>${r.map(x => `<td>${md(x)}</td>`).join('')}</tr>`).join('')}</table></div>${c.note ? `<p class="note">${md(c.note)}</p>` : ''}` }),
    N05: c => ({ html: `${eb(c)}${title(c)}<div class="rows">${(c.items || []).map(it => `<div class="r"><span class="k">${md(it.k)}${it.d ? `<small>${md(it.d)}</small>` : ''}</span><span class="v">${md(it.v)}</span></div>`).join('')}</div>` +
      `${c.total ? `<div class="total"><span class="k">${md(c.total.k)}</span><span class="v num">${md(c.total.v)}</span></div>` : ''}${c.note ? `<p class="note">${md(c.note)}</p>` : ''}` }),
    X01: c => ({ html: `${eb(c)}${title(c)}<div class="grid">${(c.cells || []).map(x => x.image
      ? `<div class="cell img${x.wide ? ' wide' : ''}">${img(x.image, '', 'photo')}</div>`
      : `<div class="cell${x.wide ? ' wide' : ''}">${ico(x.icon)}<p class="t">${md(x.t)}</p>${x.d ? `<p class="d">${md(x.d)}</p>` : ''}</div>`).join('')}</div>` }),
    X02: c => ({ html: `<div class="grp${c.align === 'left' ? '' : ' center'}" style="display:flex;flex-direction:column">${eb(c)}${title(c)}${c.sub ? `<p class="sub" style="margin-top:24px">${md(c.sub)}</p>` : ''}<div class="blocks">${(c.blocks || []).map(b => {
      const media = b.image ? `<div class="media">${img(b.image, '', 'photo')}</div>` : '';
      return `<div class="bk${media ? ' has-media' : ''}">${media}<div>${b.tag ? `<span class="pill line">${md(b.tag)}</span>` : ''}${b.num ? `<p class="big">${md(b.num)}</p>` : ''}<p class="t">${md(b.t)}</p>${b.d ? `<p class="d">${md(b.d)}</p>` : ''}</div></div>`; }).join('')}</div></div>` }),
    X03: c => {
      const A = c.left || {}, B = c.right || {}, rows = c.rows || [];
      const stack = c.direction === 'tb' || (c.direction !== 'lr' && rows.some(r => len(r[0]) > 9 || len(r[1]) > 9));
      if (stack) return { cls: 'stack', html: `${eb(c)}${title(c)}<div class="stk">${[[A, 0], [B, 1]].map(([P, k]) => `<div class="block"><p class="nm">${md(P.name)}</p><ul>${rows.filter(r => r[k] && r[k] !== '—').map(r => `<li>${md(r[k])}</li>`).join('')}</ul></div>`).join('')}</div>` };
      const cell = x => !x || x === '—' ? `<div class="c none">—</div>` : `<div class="c">${md(x)}</div>`;
      return { html: `${eb(c)}${title(c)}<div class="heads">${[A, B].map(P => `<div class="hd">${P.image ? `<div class="pimg">${img(P.image, 'prod', 'product')}</div>` : ''}<p class="nm">${md(P.name)}</p></div>`).join('')}</div>` +
        `<div class="rows">${rows.map(r => `<div class="row">${r[2] ? cell(r[0]).replace('<div class="c">', `<div class="c">${ico(r[2])}`) : cell(r[0])}${r[2] ? cell(r[1]).replace('<div class="c">', `<div class="c">${ico(r[2])}`) : cell(r[1])}</div>`).join('')}</div>` };
    },
    X04: c => ({ html: `${eb(c)}${title(c)}<div class="rows">${(c.items || []).map(it => {
      const k = { done: 'solid', doing: 'line', todo: 'faint' }[it.status] || 'line';
      return `<div class="r"><span class="pill ${k}">${md(it.label || '')}</span><div><p class="t">${md(it.t)}</p>${it.d ? `<p class="d">${md(it.d)}</p>` : ''}</div></div>`; }).join('')}</div>` }),
    X05: c => ({ html: `${eb(c)}${title(c)}<div class="steps">${(c.steps || []).map((s, i) => { s = typeof s === 'string' ? { t: s } : s;
      return `<div class="st"><span class="n">${i + 1}</span><div><p class="t">${md(s.t)}</p>${s.d ? `<p class="d">${md(s.d)}</p>` : ''}</div></div>`; }).join('')}</div>` }),
    X06: c => {
      const A = c.before || {}, B = c.after || {}; const pics = A.image && B.image;
      const side = (P, k, def) => pics ? `<div class="side ${k}">${frame(P.image)}<p class="tag">${md(P.label || def)}</p></div>` : `<div class="blk ${k}"><p class="tag">${md(P.label || def)}</p><p class="c">${md(P.text)}</p></div>`;
      return { html: `${eb(c)}${title(c)}<div class="${pics ? 'pair' : 'tb'}" data-dir="${esc(c.direction || '')}">${side(A, 'before', '之前')}${side(B, 'after', '之后')}</div>` };
    },
    G01: c => ({ html: (c.products || []).slice(0, 2).map(p => `<div class="seg"><p class="nm ttl">${md(p.name)}</p>${p.points ? `<p class="pts">${md(p.points)}</p>` : ''}${p.desc ? `<p class="desc">${md(p.desc)}</p>` : ''}<div class="pimg">${img(p.image, 'prod', 'product')}</div></div>`).join('') }),
    G02: c => {
      const hs = (c.highlights || []).slice(0, 3);
      return { html: `${eb(c)}<h2 class="t-page ttl">${md(c.name || c.title)}</h2>${c.points ? `<p class="pts">${md(c.points)}</p>` : ''}${c.desc ? `<p class="body desc">${md(c.desc)}</p>` : ''}` +
        `<div class="pimg">${img(c.image, 'prod', 'product')}</div><div class="hl${hs.length === 2 ? ' two' : ''}">${hs.map(h => `<div class="block narrow"><p class="t">${md(h.t)}</p>${h.d ? `<p class="d">${md(h.d)}</p>` : ''}${h.image ? `<div class="mini">${img(h.image, '', 'photo')}</div>` : ''}</div>`).join('')}</div>` };
    },
    I01: c => {
      const mode = c.mode || 'embed'; const s = imgSpec(c.photo || c.image);
      if (mode === 'full') return { cls: 'full', bg: `${img(s, 'bg', 'bgphoto')}`, mainCls: 'pos-' + (c.pos || 'top'),
        html: `<h1 class="ttl">${md(c.title)}</h1>${c.sub ? `<p class="sub">${md(c.sub)}</p>` : ''}` };
      if (mode === 'bleed') return { cls: 'bleed', pre: `<div class="hero">${img(s, 'heroimg', 'bgphoto')}</div>`, html: `${eb(c)}${title(c)}${c.body ? `<p class="body">${md(c.body)}</p>` : ''}` };
      if (mode === 'note') return { cls: 'note', html: `${frame(s)}${c.meta ? `<p class="meta">${ico(c.icon || 'map-pin')}<span>${md(c.meta)}</span></p>` : ''}${c.title ? `<p class="line ttl">${md(c.title)}</p>` : ''}` };
      return { cls: 'embed', html: `${c.meta ? `<p class="meta">${md(c.meta)}</p>` : ''}${eb(c)}${title(c)}${frame(s)}${c.cap ? `<p class="cap">${md(c.cap)}</p>` : ''}` };
    },
    I02: c => {
      const ps = (c.photos || []).slice(0, 4).map(imgSpec);
      return { html: `${eb(c)}${title(c)}<div class="grid" data-n="${ps.length}" data-arr="${esc(c.arrange || '')}">${ps.map((p, i) => `<figure class="f${i}">${frame(p)}${p.cap ? `<figcaption>${md(p.cap)}</figcaption>` : ''}</figure>`).join('')}</div>${c.quote ? `<p class="quote">${md(c.quote)}</p>` : ''}` };
    },
    I03: c => ({ html: `${eb(c)}${title(c)}${frame(c.photo || c.image)}<div class="stats">${(c.stats || []).slice(0, 3).map(s => `<div><p class="l">${md(s.l)}</p><p class="v">${md(s.v)}${s.u ? `<small>${md(s.u)}</small>` : ''}</p></div>`).join('')}</div>` }),
    I04: c => ({ html: '' })
  };

  /* ---------- 预检：容量（版式自带的上限） ---------- */
  const LIM = {
    C01: { title: 12, lines: 2 }, C02: { title: 12, lines: 2, sub: 16 }, C03: { title: 24, lines: 2 },
    T01: { title: 12, body: 100 }, T03: { title: 12, items: 4, it: 12, d: 30 }, T04: { title: 12, items: 8, it: 14 }, T05: { quote: 36 },
    T06: { title: 12, items: 4, it: 12, d: 22 }, T07: { question: 24 },
    N01: { title: 12, body: 80, numbers: 3 }, N02: { title: 12, numbers: 4 }, N03: { title: 12, bars: 6 }, N04: { title: 12, cols: 3, rows: 5, cell: 8 }, N05: { title: 12, items: 5 },
    X01: { title: 12, cells: 6, it: 10, d: 30 }, X02: { title: 12, blocks: 3, it: 10, d: 24 }, X03: { title: 12, rows: 7 }, X04: { title: 12, items: 4, it: 12, d: 22 },
    X05: { title: 12, steps: 5, it: 12, d: 22 }, G01: { products: 2, name: 12 }, G02: { name: 12, highlights: 3, it: 10, d: 12 },
    I01: { title: 16 }, I02: { title: 12, photos: 4 }, I03: { title: 12 }
  };
  function check(deck) {
    const out = []; const add = (i, m) => out.push(`第 ${i + 1} 张（${(deck.cards[i] || {}).layout}）：${m}`);
    const cs = window.ERZONG_CHARSET || ''; const miss = new Set();
    const scan = v => { if (typeof v === 'string') { for (const ch of plain(v)) if (ch.charCodeAt(0) > 0x2e7f && !cs.includes(ch)) miss.add(ch); } else if (v && typeof v === 'object') Object.values(v).forEach(scan); };
    (deck.cards || []).forEach((c, i) => {
      scan(c);
      if (!L[c.layout]) { add(i, `没有这个版式（可用：${Object.keys(L).join(' ')}）`); return; }
      const lim = LIM[c.layout] || {};
      const t = c.title || c.name;
      if (lim.title && t && len(t) > lim.title) add(i, `标题 ${len(t)} 字，这个版式最多 ${lim.title} 字`);
      if (lim.lines && t && lines(t).length > lim.lines) add(i, `标题 ${lines(t).length} 行，最多 ${lim.lines} 行`);
      if (c.layout === 'C01' || c.layout === 'C02') lines(t).forEach(l => { if (len(l) > 6) add(i, `封面标题一行最多 6 字：「${l}」`); });
      if (lim.sub && c.sub && len(c.sub) > lim.sub) add(i, `副标题 ${len(c.sub)} 字，最多 ${lim.sub} 字`);
      if (lim.body && c.body && len(c.body) > lim.body) add(i, `正文 ${len(c.body)} 字，最多 ${lim.body} 字（多了拆页，或改用 T02 长文）`);
      if (lim.quote && c.quote && len(c.quote) > lim.quote) add(i, `金句 ${len(c.quote)} 字，最多 ${lim.quote} 字`);
      if (lim.question && c.question && len(c.question) > lim.question) add(i, `问题 ${len(c.question)} 字，最多 ${lim.question} 字`);
      for (const k of ['items', 'numbers', 'bars', 'cells', 'blocks', 'rows', 'steps', 'products', 'highlights', 'photos']) {
        const arr = c[k]; if (!arr || !lim[k]) continue;
        if (arr.length > lim[k]) add(i, `${k} 有 ${arr.length} 项，这个版式最多 ${lim[k]} 项（建议拆页）`);
        if (lim.it || lim.d) arr.forEach(x => { if (typeof x === 'string') x = { t: x };
          if (lim.it && x && x.t && len(x.t) > lim.it) add(i, `「${plain(x.t)}」${len(x.t)} 字，小标题最多 ${lim.it} 字`);
          if (lim.d && x && x.d && len(x.d) > lim.d) add(i, `说明「${plain(x.d).slice(0, 10)}…」${len(x.d)} 字，最多 ${lim.d} 字`); });
      }
      if (c.layout === 'N04') { if ((c.head || c.rows[0] || []).length > 3) add(i, '表格最多 3 列'); (c.rows || []).forEach(r => r.forEach(x => { if (len(x) > 8) add(i, `表格「${plain(x)}」超过 8 字`); })); }
      if (c.layout === 'G01' && (c.products || []).some(p => len(p.name) > 12)) add(i, '产品名最多 12 字');
      if (c.layout === 'N02' && (c.numbers || []).length < 2) add(i, '数据页至少 2 个数字（只有 1 个可以改用 N01 或 T05）');
      if (c.layout === 'C01' && !c.image) add(i, '产品封面没有产品图，建议改用 C02 大字封面');
      if (/[\u{1F300}-\u{1FAFF}☀-➿]/u.test(JSON.stringify(c))) add(i, '有 emoji，苹果风一般不用，要去掉吗？');
    });
    const n = (deck.cards || []).length;
    if (n > 18) out.push(`一共 ${n} 张，小红书一篇最多 18 张`); else if (n > 9) out.push(`一共 ${n} 张，超过 9 张：公众号图片消息发不了，小红书部分版本要分两次选`);
    if (miss.size) out.push(`这些字随包字体里没有，会用系统字体显示，可能不一致：${[...miss].join(' ')}`);
    return out;
  }

  /* ---------- 生成卡片 ---------- */
  function shell(id, c, i, opt) {
    const s = document.createElement('section');
    const dark = c.dark === true || (c.dark !== false && (opt.dark === 'all' || (opt.dark === 'cover' && i === 0)));
    s.className = `card L-${c.layout}${dark ? ' dark' : ''}${c.font === 'serif' ? ' serif' : ''}`;
    s.id = id; s.dataset.layout = c.layout; s.dataset.name = c.file || CN[c.layout] || c.layout;
    return s;
  }
  function fill(s, c, opt) {
    const r = L[c.layout](c);
    if (r.cls) r.cls.split(' ').forEach(k => k && s.classList.add(k));
    const foot = c.source || opt.account ? `<div class="foot"><span class="acct">${md([opt.account, c.source].filter(Boolean).join(' · '))}</span></div>` : '';
    s.innerHTML = (r.bg || '') + (r.pre || '') + `<div class="main ${r.mainCls || ''}">${r.html}</div>` + foot + '<div class="dots"></div>';
    if (c.align === 'center' && !['C02', 'X02'].includes(c.layout)) s.querySelector('.main').classList.add('center');
    return s;
  }

  /* T02 长文：原文一字不删，按段落自动分页；段落放不下就在句号处拆开；小标题不落在页底 */
  function longform(sheet, c, opt, mk) {
    const blocks = (c.blocks || []).map(b => typeof b === 'string' ? { p: b } : b);
    let s = mk(), f = s.querySelector('.flow'); const pages = [s];
    const limit = () => H - M - (s.querySelector('.foot') ? 44 + 40 : 0) - 8;
    const fits = () => f.getBoundingClientRect().bottom - s.getBoundingClientRect().top <= limit();
    const el = b => {
      if (b.h != null) { const e = document.createElement('h3'); e.innerHTML = md(b.h); return [e]; }
      if (b.image) { const e = document.createElement('div'); e.className = 'frame'; e.style.height = (b.height || 760) + 'px'; e.innerHTML = img(b.image, '', 'photo');
        if (!b.cap) return [e]; const p = document.createElement('p'); p.className = 'cap'; p.innerHTML = md(b.cap); return [e, p]; }
      const e = document.createElement('p'); e.innerHTML = md(b.p); return [e];
    };
    const q = blocks.slice();
    while (q.length) {
      const b = q.shift(); const els = el(b); els.forEach(e => f.appendChild(e));
      if (fits()) continue;
      els.forEach(e => e.remove());
      if (b.p != null && f.children.length) {
        const parts = String(b.p).split(/(?<=[。！？；.!?;])/); let head = ''; const p = document.createElement('p'); f.appendChild(p);
        for (let i = 0; i < parts.length; i++) { p.innerHTML = md(head + parts[i]); if (!fits()) { p.innerHTML = md(head); q.unshift({ p: parts.slice(i).join('') }); break; } head += parts[i]; }
        if (!head) { p.remove(); q.shift(); q.unshift(b); }
      } else if (!f.children.length) { f.appendChild(els[0]); /* 单块比一页还高：照放，质检会报 */ for (const e of els.slice(1)) f.appendChild(e); }
      else q.unshift(b);
      const last = f.lastElementChild; if (last && last.tagName === 'H3') { q.unshift({ h: last.innerHTML.replace(/<br>/g, '\n') }); last.remove(); }
      if (q.length) { s = mk(); f = s.querySelector('.flow'); pages.push(s); }
    }
    return pages;
  }

  /* C03 长截图分页：每页放一段，第二页起标“接上页” */
  function splitShot(c, natW, natH) {
    const firstH = c._firstH || 900, restH = c._restH || 1100; const scale = 936 / natW; const total = natH * scale;
    const parts = []; let y = 0, k = 0;
    while (y < total - 4) { const h = k === 0 ? firstH : restH; parts.push([y / scale, Math.min(total, y + h) / scale]); y += h; k++; }
    return parts;
  }

  async function build(deck, root) {
    const opt = Object.assign({ page: 'gray', accent: 'blue', corner: 'round', dark: 'none', lang: 'zh', account: '', dots: true }, deck.options || {});
    const body = document.body;
    body.classList.toggle('opt-white', opt.page === 'white');
    body.classList.toggle('opt-square', opt.corner === 'square');
    body.classList.add('lang-' + opt.lang);
    let accCls = '';
    if (ACCENTS[opt.accent]) accCls = 'ac-' + opt.accent; else if (/^#/.test(opt.accent)) document.documentElement.style.setProperty('--accent', opt.accent);
    if (accCls) body.classList.add(accCls);
    document.documentElement.lang = opt.lang === 'en' ? 'en' : 'zh-CN';
    const sheet = root || document.querySelector('.sheet');
    sheet.innerHTML = '';
    let n = 0; const id = () => 'c' + String(++n).padStart(2, '0');
    const cards = [];
    for (let i = 0; i < deck.cards.length; i++) {
      const c = deck.cards[i]; if (!L[c.layout]) continue;
      if (c.layout === 'T02') {
        const mk = () => { const s = fill(shell(id(), c, i, opt), c, opt); if (accCls) s.classList.add(accCls); sheet.appendChild(s); return s; };
        await document.fonts.ready; longform(sheet, c, opt, mk).forEach(s => cards.push(s));
        continue;
      }
      if (c.layout === 'I04') {
        const k = Math.min(3, Math.max(2, c.count || 2)); const s0 = imgSpec(c.photo || c.image);
        for (let j = 0; j < k; j++) {
          const s = shell(id(), c, i, opt); s.classList.add('nodots');
          const t = j === 0 && c.title ? `<h1 class="ttl">${md(c.title)}</h1>` : '';
          s.innerHTML = `<div class="strip" style="left:${-j * W}px;width:${k * W}px">${img(s0, '', 'bgphoto')}</div><div class="main pos-${c.pos || 'top'}">${t}</div>` + (opt.account || c.source ? `<div class="foot"><span class="acct">${md([opt.account, c.source].filter(Boolean).join(' · '))}</span></div>` : '') + '<div class="dots"></div>';
          sheet.appendChild(s); cards.push(s);
        }
        continue;
      }
      if (c.layout === 'C03' && imgSpec(c.shot).long === 'split') {
        const s = fill(shell(id(), c, i, opt), c, opt); sheet.appendChild(s); cards.push(s); s.dataset.split = i;
        continue;
      }
      const s = fill(shell(id(), c, i, opt), c, opt); sheet.appendChild(s); cards.push(s);
    }
    await loadAll(sheet);
    // 长截图分页：等图片尺寸出来后展开
    for (const s of [...sheet.querySelectorAll('[data-split]')]) {
      const c = deck.cards[+s.dataset.split]; const im = s.querySelector('img.shotimg'); const sp = imgSpec(c.shot);
      const shot = s.querySelector('.shot'); shot.classList.remove('clip');
      const firstH = H - M - 40 - (shot.getBoundingClientRect().top - s.getBoundingClientRect().top) - (s.querySelector('.foot') ? 84 : 0);
      c._firstH = Math.max(400, firstH); c._restH = H - M - 40 - (78 + 72 + 77) - (s.querySelector('.foot') ? 84 : 0);
      const parts = splitShot(c, im.naturalWidth, im.naturalHeight);
      const setPart = (el, [a, b]) => { const sc = 936 / im.naturalWidth; const box = el.querySelector('.shot'); box.style.height = ((b - a) * sc) + 'px';
        const ii = box.querySelector('img'); ii.style.marginTop = (-a * sc) + 'px'; };
      setPart(s, parts[0]); let after = s;
      parts.slice(1).forEach(pt => { const cc = Object.assign({}, c, { _cont: sp.contLabel || (opt.lang === 'en' ? 'Continued' : '接上页') });
        const ns = fill(shell(id(), cc, 99, opt), cc, opt); ns.querySelector('.shot').classList.remove('clip'); after.after(ns); after = ns; setPart(ns, pt); });
      delete s.dataset.split;
    }
    const all = [...sheet.querySelectorAll('.card')];
    all.forEach((s, j) => { s.id = 'c' + String(j + 1).padStart(2, '0'); });
    await loadAll(sheet);
    await processImages(sheet, opt);
    layoutPass(sheet);
    dots(all, opt);
    await icons(sheet);
    await document.fonts.ready;
    return all;
  }

  function loadAll(root) {
    return Promise.all([...root.querySelectorAll('img')].map(im => im.complete && im.naturalWidth ? 0 : new Promise(r => { im.onload = im.onerror = r; })));
  }

  /* 依赖图片方向的排法：X06、I02、X03 产品图 */
  function layoutPass(root) {
    for (const p of root.querySelectorAll('.L-X06 .pair')) {
      const ims = [...p.querySelectorAll('img,canvas')]; const portrait = ims.every(i => (i.naturalHeight || i.height) >= (i.naturalWidth || i.width) * 1.05);
      const dir = p.dataset.dir || (portrait ? 'lr' : 'tb'); p.className = dir;
    }
    for (const g of root.querySelectorAll('.L-I02 .grid')) {
      const n = +g.dataset.n; const ims = [...g.querySelectorAll('img')];
      const land = ims.filter(i => i.naturalWidth > i.naturalHeight * 1.1).length;
      let k = g.dataset.arr;
      if (!k) k = n === 2 ? (land === 2 ? 'g2v' : 'g2h') : n === 3 ? (land === 0 ? 'g3s' : 'g3') : n >= 4 ? 'g4' : 'g1';
      g.classList.add(k);
    }
  }

  /* ---------- 翻页圆点：右上角；只有 1 张、照片为主的组、满版照片页不放 ---------- */
  function dots(all, opt) {
    const show = opt.dots !== false && all.length > 1;
    all.forEach((s, i) => {
      const d = s.querySelector('.dots'); if (!d) return;
      if (!show || s.classList.contains('full') || s.classList.contains('bleed') || s.classList.contains('nodots')) { d.remove(); return; }
      const N = all.length; let a = 0, b = N;
      if (N > 9) { a = Math.min(Math.max(0, i - 4), N - 9); b = a + 9; }
      let h = ''; for (let j = a; j < b; j++) { const edge = N > 9 && ((j === a && a > 0) || (j === b - 1 && b < N)); h += `<i class="${j === i ? 'on' : edge ? 'sm' : ''}"></i>`; }
      d.innerHTML = h;
    });
  }

  /* ---------- 图标（Phosphor，MIT） ---------- */
  async function icons(root) {
    const P = window.PHOSPHOR || {};
    for (const svg of root.querySelectorAll('svg[data-icon]')) {
      const w = svg.closest('.L-X03,.L-I01') ? 'regular' : 'bold';
      const set = P[w] || P.regular || P.bold || {}; const d = set[svg.dataset.icon];
      if (d) svg.innerHTML = d; else { svg.dataset.missing = 1; svg.remove(); }
    }
  }

  /* ---------- 图片处理（canvas） ----------
     white / gray：白底、浅灰底产品图 → 除以底色、乘以页面色，四边羽化 80px，接缝为零
     dark：深色场景图放进黑底页 → 按人眼亮度慢慢浮出，底部淡出
     trim：自动裁掉产品图四周的空白底
     auto（产品图位默认）：看四角颜色自动判断                                   */
  function pageRGB(card) {
    const c = getComputedStyle(card).backgroundColor.match(/\d+/g).map(Number); return c.slice(0, 3);
  }
  function corners(d, w, h) {
    const pts = []; const k = Math.max(2, Math.round(Math.min(w, h) * .02));
    for (const [x0, y0] of [[0, 0], [w - k, 0], [0, h - k], [w - k, h - k]]) {
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let y = y0; y < y0 + k; y++) for (let x = x0; x < x0 + k; x++) { const o = (y * w + x) * 4; r += d[o]; g += d[o + 1]; b += d[o + 2]; a += d[o + 3]; n++; }
      pts.push([r / n, g / n, b / n, a / n]);
    }
    const avg = [0, 1, 2, 3].map(i => pts.reduce((s, p) => s + p[i], 0) / 4);
    const spread = Math.max(...pts.map(p => Math.abs(p[0] - avg[0]) + Math.abs(p[1] - avg[1]) + Math.abs(p[2] - avg[2])));
    return { avg, spread };
  }
  async function processImages(root, opt) {
    for (const im of [...root.querySelectorAll('img')]) {
      if (!im.naturalWidth) { im.dataset.broken = 1; continue; }
      const card = im.closest('.card'); const role = im.dataset.role; let fx = im.dataset.fx || (role === 'product' ? 'auto' : '');
      if (!fx || fx === 'none') continue;
      let cv, ctx, data;
      try {
        cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight;
        ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.drawImage(im, 0, 0); data = ctx.getImageData(0, 0, cv.width, cv.height);
      } catch (e) { im.dataset.fxfail = '图片处理需要用完整档（render.cjs）出图'; continue; }
      const { avg, spread } = corners(data.data, cv.width, cv.height);
      const pg = pageRGB(card); const darkCard = card.classList.contains('dark');
      if (fx === 'auto') {
        if (avg[3] < 250) fx = 'alpha';
        else if (spread > 24) { im.dataset.fxwarn = '产品图背景不是纯色，没有换底；建议换一张白底或透明底产品图'; continue; }
        else { const lum = (avg[0] + avg[1] + avg[2]) / 3; fx = darkCard ? (lum < 60 ? 'dark' : 'keep') : (lum > 170 ? 'gray' : 'keep'); }
        if (fx === 'keep') { im.dataset.fxwarn = darkCard ? '浅底产品图放在深色页上会有一块底色，建议换透明底图或改浅色封面' : '深底产品图放在浅色页上会有一块底色，建议换图或开启深色封面'; continue; }
      }
      // 自动裁掉空白底
      let box = [0, 0, cv.width, cv.height];
      if ((fx === 'gray' || fx === 'white' || fx === 'alpha') && !im.dataset.notrim && role === 'product') box = trimBox(data, avg, fx === 'alpha');
      if (fx === 'gray' || fx === 'white') {
        const [x0, y0, x1, y1] = box; const w = x1 - x0, h = y1 - y0;
        const out = ctx.createImageData(w, h); const d = data.data, o = out.data;
        const disp = im.getBoundingClientRect().width || 800; const fe = Math.max(8, Math.round(80 * (w / Math.min(disp, w)) * (cv.width / w)));
        const ss = t => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
        const bg = fx === 'white' ? [255, 255, 255] : avg;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const si = ((y + y0) * cv.width + (x + x0)) * 4, di = (y * w + x) * 4;
          const al = ss(x / fe) * ss((w - 1 - x) / fe) * ss(y / fe) * ss((h - 1 - y) / fe);
          for (let k = 0; k < 3; k++) { const v = Math.min(1, d[si + k] / Math.max(1, bg[k])) * pg[k]; o[di + k] = pg[k] * (1 - al) + v * al; }
          o[di + 3] = 255;
        }
        cv.width = w; cv.height = h; ctx.putImageData(out, 0, 0);
        swap(im, cv);
      } else if (fx === 'alpha') {
        const [x0, y0, x1, y1] = box; const w = x1 - x0, h = y1 - y0; const tmp = ctx.getImageData(x0, y0, w, h); cv.width = w; cv.height = h; ctx.putImageData(tmp, 0, 0); swap(im, cv);
      } else if (fx === 'dark') {
        bakeDark(im, card);
      }
    }
  }
  function trimBox(data, bg, alpha) {
    const { width: w, height: h, data: d } = data; let x0 = w, y0 = h, x1 = 0, y1 = 0; const step = Math.max(1, Math.round(Math.max(w, h) / 1200));
    for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) {
      const o = (y * w + x) * 4; const on = alpha ? d[o + 3] > 16 : Math.abs(d[o] - bg[0]) + Math.abs(d[o + 1] - bg[1]) + Math.abs(d[o + 2] - bg[2]) > 30;
      if (on) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (x1 <= x0 || y1 <= y0) return [0, 0, w, h];
    const pad = Math.round(Math.max(x1 - x0, y1 - y0) * .06);
    return [Math.max(0, x0 - pad), Math.max(0, y0 - pad), Math.min(w, x1 + pad + 1), Math.min(h, y1 + pad + 1)];
  }
  function swap(im, cv) {
    cv.className = im.className; cv.style.cssText = im.style.cssText; cv.dataset.role = im.dataset.role; cv.dataset.fxdone = 1;
    cv.naturalWidth = cv.width; cv.naturalHeight = cv.height;
    im.replaceWith(cv);
  }
  /* 深色场景图：烘焙成整张 1080 × 1440 底图（图片位置照版式里的位置） */
  function bakeDark(im, card) {
    const cr = card.getBoundingClientRect(); const hero = im.parentElement.getBoundingClientRect();
    const Wd = W + 80, Hd = Wd * im.naturalHeight / im.naturalWidth;
    const T = Math.min(hero.top - cr.top, H - Hd * .82), Lf = -40;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.drawImage(im, Lf, T, Wd, Hd);
    const id = ctx.getImageData(0, 0, W, H), d = id.data;
    const ss = (a, b, v) => { let t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
    const y0 = T, y1 = T + Math.min(500, Hd * .45), y3 = Math.min(H - 60, T + Hd), y2 = y3 - Math.min(260, Hd * .25);
    for (let y = 0; y < H; y++) { const top = Math.pow(ss(y0, y1, y), 2.2), bot = 1 - ss(y2, y3, y);
      for (let x = 0; x < W; x++) { const a = top * bot * ss(-40, 140, x) * (1 - ss(940, 1120, x)); const o = (y * W + x) * 4; d[o] *= a; d[o + 1] *= a; d[o + 2] *= a; } }
    ctx.putImageData(id, 0, 0);
    cv.className = 'bg'; cv.dataset.role = 'bgbaked'; cv.dataset.visible = [0, 100, Math.max(0, (y0 + (y1 - y0) * .5) / H * 100), y3 / H * 100].join(' ');
    card.prepend(cv); im.style.visibility = 'hidden'; im.dataset.baked = 1;
  }

  /* ---------- 满版照片：字放安静区域，深浅自动 ---------- */
  function regionStats(src, card, rects) {
    try {
      const cv = document.createElement('canvas'); cv.width = W / 4; cv.height = H / 4; const ctx = cv.getContext('2d', { willReadFrequently: true });
      const cr = card.getBoundingClientRect(); const r = src.getBoundingClientRect();
      // 按 object-fit:cover 的实际位置画
      const nw = src.naturalWidth || src.width, nh = src.naturalHeight || src.height; const sc = Math.max(r.width / nw, r.height / nh);
      const pos = (getComputedStyle(src).objectPosition || '50% 50%').split(' ').map(v => parseFloat(v) / 100);
      const dw = nw * sc, dh = nh * sc; const ox = (r.width - dw) * (isNaN(pos[0]) ? .5 : pos[0]), oy = (r.height - dh) * (isNaN(pos[1]) ? .5 : pos[1]);
      ctx.drawImage(src, (r.left - cr.left + ox) / 4, (r.top - cr.top + oy) / 4, dw / 4, dh / 4);
      let s = 0, s2 = 0, n = 0;
      for (const q of rects) {
        const x = Math.max(0, (q.left - cr.left) / 4 | 0), y = Math.max(0, (q.top - cr.top) / 4 | 0), w = Math.max(1, q.width / 4 | 0), h = Math.max(1, q.height / 4 | 0);
        const d = ctx.getImageData(x, y, Math.min(w, cv.width - x), Math.min(h, cv.height - y)).data;
        for (let i = 0; i < d.length; i += 4) { const l = (.2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]) / 255; s += l; s2 += l * l; n++; }
      }
      const m = s / n; return { mean: m, sd: Math.sqrt(Math.max(0, s2 / n - m * m)) };
    } catch (e) { return null; }
  }
  function tonePass(root) {
    for (const card of root.querySelectorAll('.L-I01.full,.L-I04')) {
      const src = card.querySelector('.bg,.strip img,.strip canvas'); const t = card.querySelector('.main');
      if (!src || !t || !t.children.length) { card.classList.add('tone-dark'); continue; }
      const rects = [...t.children].map(e => e.getBoundingClientRect());
      const st = regionStats(src, card, rects); card._quiet = st;
      card.classList.remove('tone-dark', 'tone-light');
      card.classList.add(st && st.mean > .58 ? 'tone-light' : 'tone-dark');
    }
  }

  /* ---------- 质检（渲染后） ---------- */
  function qa(root) {
    const res = [];
    for (const c of root.querySelectorAll('.card')) {
      const cr = c.getBoundingClientRect(); const is = [];
      if (Math.round(cr.width) !== W || Math.round(cr.height) !== H) is.push('尺寸不是 1080×1440');
      const full = c.classList.contains('full') || c.classList.contains('L-I04');
      const texts = [...c.querySelectorAll('h1,h2,h3,p,.acct,figcaption,td,th,li,.pill')].filter(t => t.textContent.trim());
      const clip = (el, q) => { const box = el.closest && el.parentElement && el.parentElement.closest('.shot,.frame,.cell,.media,.mini,.hero,.strip'); if (!box) return q; const b = box.getBoundingClientRect(); return { left: Math.max(q.left, b.left), right: Math.min(q.right, b.right), top: Math.max(q.top, b.top), bottom: Math.min(q.bottom, b.bottom) }; };
      const vis = el => { let q = clip(el, el.getBoundingClientRect()); const v = el.dataset && el.dataset.visible; if (v) { const [l, r, t, b] = v.split(' ').map(Number); q = { left: q.left + q.width * l / 100, right: q.left + q.width * r / 100, top: q.top + q.height * t / 100, bottom: q.top + q.height * b / 100 }; }
        else if (el.closest('.diag')) { const dx = q.width * .18, dy = q.height * .18; q = { left: q.left + dx, right: q.right - dx, top: q.top + dy, bottom: q.bottom - dy }; } return q; };
      const pics = [...c.querySelectorAll('img,canvas')].filter(i => !i.dataset.baked && i.style.visibility !== 'hidden' && !i.classList.contains('bg') && !i.closest('.strip') && !i.closest('.hero.bleedhero'));
      const lineRects = t => { const r = document.createRange(); r.selectNodeContents(t); return [...r.getClientRects()].filter(x => x.width > 0); };
      const hit = (a, b, p = 0) => a.right > b.left - p && a.left < b.right + p && a.bottom > b.top - p && a.top < b.bottom + p;
      for (const t of texts) {
        for (const lr of lineRects(t)) {
          if (lr.left < cr.left + M - 1 || lr.right > cr.right - M + 1 || lr.top < cr.top + M - 1 || lr.bottom > cr.bottom - M + 1) { is.push('文字超出边距：' + t.textContent.trim().slice(0, 10)); break; }
        }
        if (!full) for (const lr of lineRects(t)) { let bad = false;
          for (const p of pics) { if (p.closest('.frame,.cell,.media,.mini,.pimg,.hero,.shot') && t.closest('.frame,.cell,.media,.mini')) continue; if (hit(lr, vis(p))) { bad = true; break; } }
          const bk = c.querySelector('.bg[data-role=bgbaked]'); if (bk && hit(lr, vis(bk))) bad = true;
          if (bad) { is.push('文字压图：' + t.textContent.trim().slice(0, 10)); break; } }
      }
      // 内容溢出（被卡片裁掉）
      const main = c.querySelector('.main'); if (main && main.scrollHeight > main.clientHeight + 2) is.push('内容放不下，超出 ' + (main.scrollHeight - main.clientHeight) + 'px（建议精简或拆页）');
      for (const blk of c.querySelectorAll('.block,.cell,.bk,.blk')) if (blk.scrollHeight > blk.clientHeight + 2) { is.push('圆角块里的字放不下：' + blk.textContent.trim().slice(0, 8)); break; }
      // 不换行的字（大数字、金额）是否挤出所在的栏
      for (const v of c.querySelectorAll('.val,.v,.big,.pill')) { const pr = v.parentElement.getBoundingClientRect(); const rs = lineRects(v);
        if (rs.length && Math.max(...rs.map(x => x.right)) > Math.min(pr.right, cr.right - M) + 1) { is.push('数字或标签太长，挤出了这一栏：' + v.textContent.trim().slice(0, 10)); break; } }
      // 翻页圆点不碰字、不碰图
      for (const d of c.querySelectorAll('.dots')) { const r = d.getBoundingClientRect();
        for (const t of texts) if (lineRects(t).some(x => hit(x, r, 24))) { is.push('圆点碰字：' + t.textContent.trim().slice(0, 8)); break; }
        for (const p of c.querySelectorAll('img,canvas,.ph,.shot,.block,.frame,.cell')) { if (p.dataset.baked || p.style.visibility === 'hidden') continue; if (hit(vis(p), r, 24)) { is.push('圆点碰图'); break; } } }
      // 孤字：最后一行少于 3 个字
      for (const t of c.querySelectorAll('p,h1,h2,h3')) {
        const rs = lineRects(t); if (rs.length < 2) continue; const fs = parseFloat(getComputedStyle(t).fontSize); const ls = [];
        for (const r of rs.sort((a, b) => a.bottom - b.bottom)) { const x = ls.find(l => Math.abs(l.b - r.bottom) < fs * .6); if (x) x.w += r.width; else ls.push({ b: r.bottom, w: r.width }); }
        if (ls.length > 1 && ls[ls.length - 1].w / fs < 2.5) is.push('孤字：' + t.textContent.trim().slice(-6));
      }
      // 标题位置：顶部 ≥ 150px（贴顶照片、满版照片除外）
      const tt = c.querySelector('.ttl'); if (tt && !full && !c.classList.contains('bleed') && !c.classList.contains('L-G01')) { const top = tt.getBoundingClientRect().top - cr.top; if (top < 148) is.push(`标题太靠上（离顶 ${Math.round(top)}px，要 ≥ 150px）`); }
      // 强调色每页一处、提示橙每页一处
      const nAcc = c.querySelectorAll('.accent').length, nTip = c.querySelectorAll('.tip').length;
      if (nAcc > 1) is.push(`强调色用了 ${nAcc} 处（每页一处）`);
      if (nTip > 1) is.push(`提示橙用了 ${nTip} 处（每页最多一处）`);
      // 满版照片：标题下面够不够安静
      if (c._quiet && c._quiet.sd > .17) is.push('满版照片：标题压在照片的复杂区域（换个位置 pos，或改用贴顶 bleed / 上字下图 embed）');
      // 图片
      for (const im of c.querySelectorAll('img')) {
        if (im.dataset.broken) is.push('图片打不开：' + im.getAttribute('src'));
        if (im.dataset.fxwarn) is.push(im.dataset.fxwarn);
        if (im.dataset.fxfail) is.push(im.dataset.fxfail);
        const r = im.getBoundingClientRect(); const fit = getComputedStyle(im).objectFit;
        if (im.naturalWidth && r.width > 0) { const need = fit === 'cover' ? Math.max(r.width / im.naturalWidth, r.height / im.naturalHeight) : r.width / im.naturalWidth;
          if (need > 1.25 && !im.dataset.baked) is.push(`图片放大了 ${need.toFixed(1)} 倍，可能会糊（换更清楚的原图）`); }
      }
      // 截图：太长 / 字太小
      const sh = c.querySelector('.shot'); const si = sh && sh.querySelector('img');
      if (sh && si && si.naturalWidth && !sh.dataset.long) { const disp = sh.getBoundingClientRect().width * si.naturalHeight / si.naturalWidth; const room = cr.bottom - M - sh.getBoundingClientRect().top - (c.querySelector('.foot') ? 84 : 0);
        if (disp > room + 2) is.push('长截图，一张放不下：先问用户 ①裁关键一段 crop ②底部渐隐 fade ③分页 split（三选一）'); }
      if (si && si.naturalWidth && si.naturalWidth < 900) is.push(`截图宽只有 ${si.naturalWidth}px，放大后字会糊`);
      for (const s of c.querySelectorAll('svg[data-missing]')) is.push('没有这个图标：' + s.dataset.icon);
      res.push({ id: c.id, name: c.dataset.name, layout: c.dataset.layout, issues: [...new Set(is)] });
    }
    return res;
  }

  function badges(root, list) {
    root.querySelectorAll('.qa').forEach(e => e.remove());
    for (const r of list) if (r.issues.length) { const c = root.querySelector('#' + r.id); const b = document.createElement('div'); b.className = 'qa'; b.textContent = r.issues.join(' ｜ '); c.appendChild(b); }
  }

  async function run() {
    const deck = window.DECK; if (!deck) return;
    const pre = check(deck);
    const all = await build(deck);
    tonePass(document);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const q = qa(document);
    badges(document, q);
    window.ERZONG_RESULT = { check: pre, qa: q, cards: all.map(s => ({ id: s.id, name: s.dataset.name, layout: s.dataset.layout })) };
    const bar = document.querySelector('.toolbar .msg');
    if (bar) { const n = q.filter(x => x.issues.length).length; bar.textContent = `${all.length} 张 · ${pre.length ? '预检提醒 ' + pre.length + ' 条 · ' : ''}${n ? n + ' 张有问题（红色标记）' : '质检通过'}`; }
    if (pre.length) console.log('[预检]\n' + pre.join('\n'));
    return window.ERZONG_RESULT;
  }
  window.ERZONG = { run, check, layouts: Object.keys(L), names: CN };
  window.ERZONG_READY = (document.readyState === 'loading' ? new Promise(r => document.addEventListener('DOMContentLoaded', r)) : Promise.resolve()).then(run);
})();
