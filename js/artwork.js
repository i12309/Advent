/**
 * Original, resolution-independent illustrations for the thirteen postcards.
 * No fonts, images, network requests, or third-party artwork are required.
 * Slow motion is added by the host through the art-* class hooks.
 */

export const ART_PALETTES = Object.freeze({
  winter: { sky: ['#102d3b', '#42747d'], accent: '#d6e9e3', particle: 'snow', description: 'Первый снег, тёплые окна и дом на краю зимнего леса.' },
  'new-year': { sky: ['#152640', '#334c68'], accent: '#eac586', particle: 'snow', description: 'Нарядная ель, старые часы и маленький город в ожидании чуда.' },
  defender: { sky: ['#132f40', '#507b85'], accent: '#b7d8da', particle: 'stars', description: 'Свет маяка ведёт корабль домой через северное море.' },
  spring: { sky: ['#263f43', '#718d80'], accent: '#d6dbaa', particle: 'petals', description: 'Стеклянная оранжерея и первые ветви в цвету.' },
  'womens-day': { sky: ['#3c303f', '#84676e'], accent: '#efc3c4', particle: 'petals', description: 'Цветочная лавка, мимоза и целая охапка весеннего света.' },
  'may-day': { sky: ['#244743', '#72978c'], accent: '#e4dba8', particle: 'petals', description: 'Садовая беседка, воздушные змеи и длинный выходной.' },
  victory: { sky: ['#263339', '#776951'], accent: '#e5c699', particle: 'sparks', description: 'Тихий сквер памяти, вечный огонь и красные гвоздики.' },
  summer: { sky: ['#123e46', '#3e7779'], accent: '#e3dca7', particle: 'fireflies', description: 'Тёплое озеро, лодка у причала и огоньки в высокой траве.' },
  russia: { sky: ['#284757', '#849a9f'], accent: '#e1ddcc', particle: 'petals', description: 'Белые берёзы, широкая река и город на дальнем берегу.' },
  autumn: { sky: ['#393e36', '#958167'], accent: '#edc185', particle: 'leaves', description: 'Осенний парк, деревянный мостик и шелест золотых крон.' },
  knowledge: { sky: ['#344047', '#8f887b'], accent: '#e9cd96', particle: 'leaves', description: 'Старинная школа, книги и первый звонок золотой осени.' },
  unity: { sky: ['#252e45', '#645d77'], accent: '#e6c7a3', particle: 'stars', description: 'Мосты соединяют берега, а окна собирают город в одно целое.' },
  birthday: { sky: ['#3e2c3a', '#79646a'], accent: '#f0c38e', particle: 'confetti', description: 'Личный праздник в зимнем саду: свечи, гирлянды и самые тёплые пожелания.' },
});

const TITLES = {
  winter: 'Дом, который ждёт первый снег', 'new-year': 'Новогодняя площадь',
  defender: 'Маяк возвращения', spring: 'Оранжерея первой весны',
  'womens-day': 'Весенняя цветочная лавка', 'may-day': 'Выходной в саду',
  victory: 'Тихий свет памяти', summer: 'Вечер на летнем озере',
  russia: 'Река, берёзы и старый город', autumn: 'Золотой парк',
  knowledge: 'Школа на осенней улице', unity: 'Город соединённых берегов',
  birthday: 'День рождения в зимнем саду',
};

function random(seed = 19) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const f = (n) => Number(n.toFixed(2));
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (x1, y1, x2, y2, stroke, width = 1, extra = '') => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
const circle = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;

function defs(palette) {
  return `<defs>
    <linearGradient id="@sky" x2="0" y2="1"><stop stop-color="${palette.sky[0]}"/><stop offset="1" stop-color="${palette.sky[1]}"/></linearGradient>
    <linearGradient id="@snow" x1="0" y1="0" x2="0.7" y2="1"><stop stop-color="#bed6d5"/><stop offset=".45" stop-color="#9cbcc2"/><stop offset="1" stop-color="#4e7e8b"/></linearGradient>
    <linearGradient id="@snow-light" x2="0.4" y2="1"><stop stop-color="#e6e9db"/><stop offset="1" stop-color="#92b8bf"/></linearGradient>
    <linearGradient id="@wood" x2="1" y2=".3"><stop stop-color="#5e4d45"/><stop offset=".5" stop-color="#876348"/><stop offset="1" stop-color="#423d38"/></linearGradient>
    <linearGradient id="@glass" x2=".8" y2="1"><stop stop-color="#ffdf99"/><stop offset=".4" stop-color="#e5ad67"/><stop offset="1" stop-color="#b27348"/></linearGradient>
    <linearGradient id="@water" x2="0" y2="1"><stop stop-color="#74999a" stop-opacity=".46"/><stop offset="1" stop-color="#1c424f" stop-opacity=".9"/></linearGradient>
    <linearGradient id="@pine" x2=".85" y2=".4"><stop stop-color="#18383a"/><stop offset=".6" stop-color="#315854"/><stop offset="1" stop-color="#568079"/></linearGradient>
    <radialGradient id="@glow"><stop stop-color="#ffce80" stop-opacity=".45"/><stop offset=".45" stop-color="#e9bf82" stop-opacity=".13"/><stop offset="1" stop-color="#e9bf82" stop-opacity="0"/></radialGradient>
    <radialGradient id="@halo"><stop stop-color="#e2e9cf" stop-opacity=".17"/><stop offset="1" stop-color="#d8e5d2" stop-opacity="0"/></radialGradient>
    <linearGradient id="@mist" x2="0" y2="1"><stop stop-color="#b8d2cd" stop-opacity="0"/><stop offset=".6" stop-color="#b8d2cd" stop-opacity=".12"/><stop offset="1" stop-color="#b8d2cd" stop-opacity="0"/></linearGradient>
    <linearGradient id="@flame" x2="0" y2="1"><stop stop-color="#fff4c4"/><stop offset=".45" stop-color="#ffc96e"/><stop offset="1" stop-color="#c96c40"/></linearGradient>
    <filter id="@grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".055"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter>
    <filter id="@blur"><feGaussianBlur stdDeviation="2.5"/></filter>
  </defs>`;
}

function sky({ moonX = 1090, moonY = 220, moonR = 54, stars = true, clouds = true, sun = false } = {}) {
  const rng = random(28);
  let s = `<rect width="1400" height="1000" fill="url(#@sky)"/>`;
  s += circle(moonX, moonY, moonR * 3.7, 'url(#@halo)');
  if (stars) {
    for (let i = 0; i < 100; i++) {
      const x = f(rng() * 1400), y = f(35 + rng() * 550), r = f(.4 + rng() * 1.1);
      s += circle(x, y, r, '#e9e7ce', `opacity="${f(.15 + rng() * .5)}"${i % 13 === 0 ? ' class="art-star"' : ''}`);
    }
    s += `<g fill="none" stroke="#b9d1cb" stroke-width=".7" opacity=".12"><path d="M740 159L809 130 855 176 921 118M809 130L796 78M1114 379L1159 331 1228 346"/></g>`;
  }
  s += '<g class="art-moon">';
  s += circle(moonX, moonY, moonR, sun ? '#e6d8a7' : '#d5dfcc', 'opacity=".9"');
  if (!sun) {
    s += `<g fill="#94b0b0" opacity=".17">${circle(moonX - 14, moonY + 9, moonR * .24, '#94b0b0')}${circle(moonX + 15, moonY - 18, moonR * .14, '#94b0b0')}${circle(moonX + 8, moonY + 27, moonR * .1, '#94b0b0')}</g>`;
  }
  s += '</g>';
  if (clouds) {
    s += `<g fill="none" stroke="#b8d1cb" stroke-width="1" opacity=".11"><path d="M655 303C751 284 788 322 871 307S1036 278 1121 298M943 326C1032 310 1081 342 1183 322M190 438C281 425 311 449 406 432M287 459C352 447 389 464 447 456"/></g>`;
    s += `<path d="M0 412Q190 380 350 423T710 401 1040 420 1400 389V524H0Z" fill="url(#@mist)"/>`;
  }
  return s;
}

function mountainRange(snow = false) {
  let s = path('M0 648L133 535 218 588 354 433 433 507 516 455 625 561 754 392 881 512 979 438 1082 541 1219 405 1400 557V1000H0Z', '#284d5d', 'opacity=".48"');
  s += path('M0 683L150 586 236 632 348 543 458 620 553 535 680 654 786 519 913 593 1062 511 1227 620 1330 519 1400 576V1000H0Z', '#35616c', 'opacity=".58"');
  if (snow) {
    s += `<g fill="#afc9c8" opacity=".25"><path d="M299 487L354 433 433 507 375 478 354 456 340 482 324 475Z"/><path d="M697 459L754 392 827 456 785 437 760 415 745 439 732 431Z"/><path d="M1175 458L1219 405 1284 461 1234 438 1218 424 1205 446Z"/></g>`;
  }
  return s;
}

function pine(x, y, scale = 1, { snowy = false, dark = false, sway = true } = {}) {
  let s = `<g transform="translate(${x} ${y}) scale(${scale})"><g${sway ? ' class="art-sway"' : ''}>`;
  s += path('M-5 8L-3-276 4-280 7 8Z', dark ? '#172f32' : '#594d40');
  for (let n = 0; n < 8; n++) {
    const ty = -282 + n * 32, w = 12 + n * 12, bottom = ty + 77;
    s += path(`M0 ${ty}C${-w * .3} ${ty + 28} ${-w * .66} ${ty + 47} ${-w} ${bottom}Q${-w * .55} ${bottom - 7} -3 ${bottom - 13}Q${w * .45} ${bottom + 1} ${w + 8} ${bottom - 2}C${w * .6} ${ty + 47} ${w * .35} ${ty + 29} 0 ${ty}Z`, dark ? '#153a40' : 'url(#@pine)');
    s += path(`M-2 ${ty + 18}Q${-w * .26} ${ty + 47} ${-w * .72} ${bottom - 7}M4 ${ty + 38}L${w * .66} ${bottom - 4}`, 'none', 'stroke="#81a198" stroke-width="1.1" opacity=".32"');
    if (snowy) {
      s += path(`M0 ${ty + 1}Q${-w * .35} ${ty + 30} ${-w * .81} ${bottom - 14}Q${-w * .52} ${bottom - 21} -1 ${bottom - 26}Q${w * .3} ${bottom - 12} ${w * .72} ${bottom - 17}Q${w * .33} ${ty + 38} 0 ${ty + 1}Z`, '#a9c9ca', 'opacity=".83"');
      s += path(`M0 ${ty + 3}Q${-w * .2} ${ty + 30} ${-w * .52} ${bottom - 25}`, 'none', 'stroke="#d3dfd6" stroke-width="3" stroke-linecap="round" opacity=".65"');
    }
  }
  s += '</g></g>';
  return s;
}

function forestLine(y = 680, color = '#21474d', start = 0, end = 1400, seed = 33) {
  const rng = random(seed);
  let s = `<g opacity=".63" fill="${color}">`;
  for (let x = start; x < end; x += 16 + rng() * 15) {
    const h = 35 + rng() * 85;
    s += path(`M${f(x)} ${y}l${f(h * .2)} ${f(-h)} ${f(h * .24)} ${f(h)}Z`, color);
  }
  return s + '</g>';
}

function windowBox(x, y, w = 34, h = 48, arch = false, glow = true) {
  let s = glow ? `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w * 1.6}" ry="${h * 1.15}" fill="url(#@glow)"/>` : '';
  s += `<g class="art-window"><rect x="${x - 4}" y="${y - 4}" width="${w + 8}" height="${h + 8}" rx="${arch ? w * .5 : 1}" fill="#273f42"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${arch ? w * .43 : 0}" fill="url(#@glass)"/>`;
  s += line(x + w / 2, y, x + w / 2, y + h, '#675540', 2.7);
  s += line(x, y + h * .46, x + w, y + h * .46, '#675540', 2.7);
  s += `<path d="M${x + 2} ${y + 2}Q${x + w * .35} ${y + h * .15} ${x + 3} ${y + h - 2}M${x + w - 2} ${y + 2}Q${x + w * .7} ${y + h * .15} ${x + w - 3} ${y + h - 2}" fill="none" stroke="#f6d9ac" stroke-width="4" opacity=".35"/>`;
  s += line(x - 8, y + h + 5, x + w + 8, y + h + 5, '#b4b7a5', 4);
  return s + '</g>';
}

function cottage(x, y, scale = 1, { snowy = true, variant = false } = {}) {
  let s = `<g transform="translate(${x} ${y}) scale(${scale})">`;
  s += `<ellipse cx="146" cy="6" rx="230" ry="37" fill="#142f3b" opacity=".17"/>`;
  s += path('M-28-172L116-243 307-161 299 3 110 29-26-15Z', 'url(#@wood)');
  s += path('M110-228L304-158 299 3 109 28Z', '#4b4640', 'opacity=".55"');
  for (let y1 = -155; y1 < 11; y1 += 14) s += path(`M-24 ${y1}L108 ${y1 + 30} 300 ${y1 + 3}`, 'none', 'stroke="#ac8865" stroke-width="1" opacity=".44"');
  for (let x1 = -13; x1 < 105; x1 += 18) s += line(x1, -160, x1, 0, '#3b3d36', .8, 'opacity=".23"');
  s += path('M-66-168L64-315 170-179 111-145Z', '#3e4f51');
  s += path('M64-315L251-296 350-161 170-179Z', '#46636b');
  for (let i = 0; i < 10; i++) s += path(`M${72 + i * 17} ${-310 + i * 2}L${175 + i * 16} ${-182 + i * 1.5}`, 'none', 'stroke="#8ba5a5" stroke-width="1" opacity=".25"');
  if (snowy) {
    s += path('M-68-173Q-37-207-18-240L61-320Q154-320 253-301L350-166 336-157Q292-177 265-170L169-177Q138-205 114-242L62-299-45-165Z', 'url(#@snow-light)');
    s += path('M62-318L251-299 343-171M65-306L164-180M-55-171L59-309', 'none', 'stroke="#e1e7db" stroke-width="3" opacity=".85"');
    s += path('M172-177Q219-190 246-175T332-164', 'none', 'stroke="#dce3d6" stroke-width="6" stroke-linecap="round"');
  }
  s += path('M-49-165L64-291 157-173', 'none', 'stroke="#3c4140" stroke-width="9"');
  s += path('M-47-167L64-290 155-174', 'none', 'stroke="#9a927b" stroke-width="2"');
  s += path('M64-281L64-169M-19-194L64-211 124-188', 'none', 'stroke="#62594c" stroke-width="5"');
  s += windowBox(39, -243, 43, 48, true);
  s += windowBox(-8, -143, 42, 58);
  s += windowBox(62, -129, 37, 58);
  s += windowBox(178, -137, 42, 54);
  s += windowBox(245, -130, 29, 46);
  s += path('M133-78L165-75 165 16 132 20Z', '#272f2e');
  s += path('M138-72L160-70 160-22 138-19Z', 'url(#@glass)');
  s += line(149, -72, 149, -20, '#665544', 2);
  s += circle(157, -6, 2.4, '#c9aa70');
  s += path('M116 24L173 17 188 26 122 35 113 30Z', snowy ? '#c9d9cf' : '#9b8b6b');
  s += path('M121 35L189 26 202 36 124 46 111 40Z', snowy ? '#adc7c6' : '#89795c');
  s += path('M119 46L204 36 217 48 120 60 102 52Z', snowy ? '#8fb5b8' : '#6e6551');
  // Chimney, a crooked plume, finely drawn timber supports and a porch lantern.
  s += path('M230-284L230-345 255-343 255-265Z', '#726659');
  s += path('M226-345L259-343 258-334 226-336Z', snowy ? '#d1ded5' : '#a09378');
  for (let yy = -330; yy < -280; yy += 12) s += line(231, yy, 253, yy + 1, '#a79780', 1, 'opacity=".6"');
  s += `<g class="art-smoke" fill="none" stroke="#d2ddd2" stroke-linecap="round"><path d="M242-351C212-383 259-393 241-420S221-456 249-480" stroke-width="17" opacity=".1"/><path d="M242-350C225-381 263-399 248-429S236-461 259-492" stroke-width="4" opacity=".12"/></g>`;
  s += `<path d="M120-96L171-90 180-77 113-83Z" fill="${snowy ? '#c2d4cc' : '#8e7b5a'}"/><path d="M116-82V23M176-78V16" stroke="#675c4a" stroke-width="4"/>`;
  s += lamp(112, -93, .36);
  // A wood pile with rings is deliberately drawn, not a repeated decoration emoji.
  for (let i = 0; i < 11; i++) {
    const xx = -7 + (i % 4) * 15, yy = 7 - Math.floor(i / 4) * 13;
    s += circle(xx, yy, 7.3, '#aa8a65', 'stroke="#4d4940" stroke-width="1.4"');
    s += circle(xx, yy, 3.5, 'none', 'stroke="#756146" stroke-width=".7"');
  }
  if (variant) s += path('M-10-26Q20-45 52-22', 'none', 'stroke="#60836a" stroke-width="8"');
  return s + '</g>';
}

function lamp(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">${circle(0, -20, 68, 'url(#@glow)')}<path d="M0 0V-58M-12-31L0-42 12-31Z" fill="#243c3d" stroke="#344b45" stroke-width="3"/><path d="M-10-28H10L7-6H-7Z" fill="url(#@glass)" stroke="#4f594b" stroke-width="2"/><path d="M0-28V-7M-9-6H9" stroke="#55604e" stroke-width="2"/></g>`;
}

function fence(x, y, count = 10, scale = 1, snowy = false) {
  let s = `<g transform="translate(${x} ${y}) scale(${scale})" stroke-linejoin="round">`;
  s += `<path d="M0-33L${count * 24}-8M0-13L${count * 24} 12" stroke="#57695f" stroke-width="6"/>`;
  if (snowy) s += `<path d="M0-37L${count * 24}-12" stroke="#bfd7d0" stroke-width="4"/>`;
  for (let n = 0; n <= count; n++) {
    const yy = n * 2.5;
    s += `<path d="M${n * 24} ${yy + 17}V${yy - 45}" stroke="#7d8a76" stroke-width="5"/>`;
    if (snowy) s += `<path d="M${n * 24 - 4} ${yy - 45}h8" stroke="#d2ded2" stroke-width="4" stroke-linecap="round"/>`;
  }
  return s + '</g>';
}

function winterScene() {
  let s = sky({ moonX: 1080, moonY: 206, moonR: 61 }) + mountainRange(true);
  s += forestLine(706, '#284d59');
  s += path('M0 733Q224 660 439 717T810 700 1120 724 1400 682V1000H0Z', '#7199a4');
  // A distant settlement beneath the mountain ridge.
  s += `<g opacity=".58">${cottage(1086, 671, .23)}${cottage(1172, 685, .19)}${cottage(1245, 668, .16)}</g>`;
  s += path('M0 798C200 785 279 731 457 770S673 780 820 748 1208 750 1400 806V1000H0Z', 'url(#@snow)');
  s += pine(1276, 830, 1.64, { snowy: true });
  s += pine(1130, 764, .9, { snowy: true });
  s += pine(595, 788, .96, { snowy: true });
  s += path('M873 774C881 816 766 821 808 863S970 894 909 929 785 960 778 1000H538C571 929 807 925 739 883S757 818 849 770Z', '#c3d4cf', 'opacity=".6"');
  s += cottage(750, 777, 1.15);
  s += fence(531, 798, 6, .84, true);
  s += fence(1044, 820, 7, .9, true);
  s += `<g transform="translate(1020 780)">${lamp(0, 0, .72)}<path d="M0 0V67M-10 68H10" stroke="#53695f" stroke-width="5"/></g>`;
  s += pine(365, 997, 1.6, { snowy: true, dark: true });
  s += pine(1410, 1050, 1.75, { snowy: true, dark: true });
  s += path('M0 945C177 926 206 981 360 967S569 943 705 982L734 1000H0Z', '#2b5565', 'opacity=".6"');
  s += `<g fill="none" stroke="#c5d8d2" opacity=".3"><path d="M1010 932q53-14 106-2M1075 949q32-8 78-2M550 871q33-11 61-4M637 920q26-12 43-9"/></g>`;
  for (let i = 0; i < 7; i++) s += `<ellipse cx="${812 + Math.sin(i) * 8 - i * 8}" cy="${818 + i * 12}" rx="2" ry="4" fill="#6d9297" opacity=".5"/>`;
  return s;
}

function garland(x1, y1, x2, y2, sag = 36, n = 14) {
  let s = `<path d="M${x1} ${y1}Q${(x1 + x2) / 2} ${Math.max(y1, y2) + sag * 2} ${x2} ${y2}" fill="none" stroke="#3f5d55" stroke-width="2"/>`;
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x1 * (1 - t) + x2 * t, y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * (Math.max(y1, y2) + sag * 2) + t ** 2 * y2;
    s += circle(f(x), f(y + 5), 13, 'url(#@glow)');
    s += circle(f(x), f(y + 5), 2.4, '#ffe3a4', 'class="art-star"');
    s += line(f(x), f(y), f(x), f(y + 4), '#8f9c7b', .9);
  }
  return s;
}

function gift(x, y, w = 34, h = 30, color = '#9f695b') {
  return `<g transform="translate(${x} ${y})"><rect x="0" y="${-h}" width="${w}" height="${h}" rx="2" fill="${color}" stroke="#d0a97e" stroke-opacity=".3"/><path d="M${w * .48} ${-h}V0M0 ${-h + 5}H${w}" stroke="#dbb47a" stroke-width="3"/><path d="M${w * .5} ${-h}c-20-23-28 4 0 0 19-23 28 4 0 0" fill="none" stroke="#dbb47a" stroke-width="2"/></g>`;
}

function townHouse(x, y, w, h, color = '#57676a', { snow = false, roof = 'gable', lit = true } = {}) {
  let s = `<g transform="translate(${x} ${y})"><rect x="0" y="${-h}" width="${w}" height="${h}" fill="${color}"/><path d="M0-3H${w}" stroke="#253e49" stroke-width="5"/>`;
  if (roof === 'gable') s += path(`M-8 ${-h}L${w / 2} ${-h - w * .57} ${w + 8} ${-h}Z`, '#344f5b', snow ? 'stroke="#b8cecc" stroke-width="5"' : 'stroke="#71817a" stroke-width="2"');
  else s += path(`M-5 ${-h}H${w + 5}L${w - 4} ${-h - 21}H4Z`, '#3b505a', snow ? 'stroke="#b8cecc" stroke-width="4"' : '');
  for (let yy = -h + 25; yy < -15; yy += 42) {
    for (let xx = 14; xx < w - 12; xx += 29) {
      s += `<rect x="${xx}" y="${yy}" width="13" height="20" fill="${lit ? 'url(#@glass)' : '#243c46'}" opacity=".8"/><path d="M${xx - 2} ${yy + 22}h17M${xx + 6} ${yy}v20" stroke="#99937b" stroke-width="1.4"/>`;
    }
  }
  s += `<path d="M3 ${-h + 5}V-2M${w - 3} ${-h + 5}V-2" stroke="#b4b29a" stroke-opacity=".2" stroke-width="2"/></g>`;
  return s;
}

function newYearScene() {
  let s = sky({ moonX: 1185, moonY: 238, moonR: 46 });
  s += path('M0 654Q293 625 502 660T920 631 1400 653V1000H0Z', '#44677b');
  s += `<g opacity=".5">${townHouse(548, 713, 91, 148, '#57677a', { snow: true })}${townHouse(640, 707, 83, 204, '#6f7380', { snow: true })}${townHouse(1144, 719, 102, 166, '#576676', { snow: true })}${townHouse(1249, 727, 98, 139, '#6a7479', { snow: true })}</g>`;
  // A clock tower is the second focal point, keeping this postcard distinct from winter.
  s += `<g transform="translate(1080 713)"><path d="M-53 0V-330H52V0Z" fill="#5f6b74"/><path d="M-64-327L0-417 64-327Z" fill="#a8c4cc"/><path d="M0-417V-449" stroke="#b7c7c2" stroke-width="3"/>${circle(0, -280, 34, '#dfd9ba', 'stroke="#354c5c" stroke-width="7"')}${circle(0, -280, 27, 'none', 'stroke="#727e78" stroke-width="1"')}<path d="M0-305V-280L17-291" fill="none" stroke="#526169" stroke-width="3"/>${windowBox(-15, -193, 30, 52, true)}${windowBox(-15, -102, 30, 52, true)}<path d="M-59-229H59M-56-222H56M-54-39H54" stroke="#b1b9aa" stroke-width="4"/><path d="M-47-321V-2M47-321V-2" stroke="#adb7a6" stroke-width="2" opacity=".3"/></g>`;
  s += path('M0 773Q229 704 492 750T907 741 1400 776V1000H0Z', 'url(#@snow)');
  s += garland(512, 527, 1150, 502, 60, 26);
  s += pine(856, 814, 1.57, { snowy: true });
  // Fine strings of lights wind around the tree rather than floating randomly.
  for (let row = 0; row < 5; row++) {
    const yy = 446 + row * 66, ww = 28 + row * 24;
    s += garland(856 - ww, yy, 856 + ww, yy + 2, 14, 5 + row * 2);
    for (let j = 0; j < 4; j++) s += circle(856 - ww * .7 + j * ww * .47, yy + 26 + ((j % 2) * 11), 5, j % 2 ? '#d2b46f' : '#bc6b5d', 'stroke="#e5cc93" stroke-width=".7"');
  }
  s += circle(856, 370, 64, 'url(#@glow)');
  s += path('M856 346L862 363 880 363 866 374 871 391 856 381 841 391 846 374 832 363 850 363Z', '#edcc8b', 'stroke="#f8e7bf" stroke-width="1"');
  s += gift(773, 829, 59, 46, '#955c58') + gift(839, 843, 44, 34, '#b09b65') + gift(895, 822, 55, 47, '#6a9090') + gift(951, 838, 33, 29, '#8d646f');
  s += `<g transform="translate(603 804)">${lamp(0, -65, 1)}<path d="M0-65V67M-10 67H10" stroke="#405a5e" stroke-width="6"/></g>`;
  s += fence(1091, 837, 10, .9, true);
  s += pine(1356, 989, 1.46, { snowy: true, dark: true }) + pine(395, 967, 1.13, { snowy: true, dark: true });
  s += path('M691 1000Q732 915 826 855M1028 1000Q967 921 909 860', 'none', 'stroke="#bcd2d3" stroke-width="2" opacity=".4"');
  return s;
}

function waves(y = 740, rows = 11, color = '#a9c6c3') {
  const rng = random(69);
  let s = `<g class="art-water" fill="none" stroke="${color}" stroke-width="1" opacity=".25">`;
  for (let row = 0; row < rows; row++) {
    const yy = y + row * 15;
    for (let k = 0; k < 7; k++) {
      const x = 300 + rng() * 1050, w = 10 + rng() * 78;
      s += `<path d="M${f(x)} ${yy}q${f(w * .35)}-3 ${f(w)} 0"/>`;
    }
  }
  return s + '</g>';
}

function sailboat(x, y, scale = 1, large = false) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" class="art-boat"><path d="M-45 0H63L43 21H-24Z" fill="#253e45" stroke="#bdbaa1" stroke-width="2"/><path d="M7-130V5" stroke="#b8bda7" stroke-width="3"/><path d="M1-124L-43-13H1Z" fill="#c7d5c7" opacity=".85"/><path d="M14-110L61-16H14Z" fill="#a5c1bd"/><path d="M-34-18L0-110M20-99L52-22" fill="none" stroke="#e3dfc3" opacity=".3"/>${large ? '<rect x="-6" y="-17" width="28" height="13" fill="#ab9f7e"/><rect x="1" y="-14" width="6" height="6" fill="url(#@glass)"/>' : ''}<path d="M-53 27Q5 34 61 27" fill="none" stroke="#a0c4c2" opacity=".6"/></g>`;
}

function defenderScene() {
  let s = sky({ moonX: 786, moonY: 198, moonR: 51 }) + mountainRange(true);
  s += path('M0 683Q420 674 713 688T1400 670V1000H0Z', 'url(#@water)');
  s += waves(706, 18);
  s += path('M563 834L691 725 748 729 777 658 864 633 948 662 972 755 1078 783 1107 904 1400 1000H341Z', '#36515b');
  s += path('M696 726L748 733 783 665 863 641 932 669 945 705 868 679 808 703 778 771Z', '#77918f', 'opacity=".6"');
  s += path('M758 787L812 741 838 767 870 719 926 742M809 820L855 796 927 823 998 796M638 851L698 823 755 846', 'none', 'stroke="#95a8a0" stroke-width="1.2" opacity=".4"');
  // The taper, brick joints, gallery and lantern all remain vector-sharp at 4K.
  s += `<g transform="translate(857 702)"><path d="M-55 0L-31-358H32L55 0Z" fill="#c1c9b8"/><path d="M9-356H32L55 0H25Z" fill="#7f9e9b"/><path d="M-43-204H42L47-148H-47Z" fill="#a75f53" opacity=".9"/><path d="M-35-314H36L40-261H-40Z" fill="#a75f53" opacity=".9"/><path d="M-20 0V-56Q0-79 20-56V0Z" fill="#2b4850"/>${windowBox(-10, -113, 20, 27, true, false)}${windowBox(-9, -238, 18, 28, true, false)}<path d="M-49-359H49V-372H-49Z" fill="#3f5555"/><path d="M-35-374V-427H35V-374Z" fill="url(#@glass)"/><path d="M-40-429L0-459 40-429Z" fill="#44666b"/><path d="M0-460V-475" stroke="#a2b8aa" stroke-width="3"/><path d="M-25-426V-376M0-426V-376M25-426V-376" stroke="#4d665f" stroke-width="3"/><path d="M-51-393H51M-51-377V-399M-34-377V-399M34-377V-399M51-377V-399" fill="none" stroke="#86a29b" stroke-width="2.5"/>${circle(0, -402, 81, 'url(#@glow)')}<path d="M-31-357L-55-2M32-357L55-2" stroke="#e1dfc9" stroke-width="2" opacity=".5"/></g>`;
  s += `<path class="art-beacon" d="M857 301L1395 166V423Z" fill="#e7dab2" opacity=".07"/><path class="art-beacon" d="M857 301L310 217V384Z" fill="#e7dab2" opacity=".04"/>`;
  s += cottage(942, 750, .43, { snowy: false });
  s += sailboat(1195, 751, .73, true) + sailboat(528, 756, .33);
  s += path('M743 855C798 815 792 780 837 756M738 856L748 868M752 844L762 853M767 832L777 840M782 818L791 826', 'none', 'stroke="#a7b6a7" stroke-width="3" opacity=".65"');
  s += `<g fill="none" stroke="#b9d0c6" stroke-width="1.7" opacity=".65"><path d="M1078 480q13-12 27 0 12-14 25-4M1163 530q9-9 19 0 9-10 17-3M735 375q9-8 17 0 8-9 16-3"/></g>`;
  return s;
}

function deciduous(x, y, scale = 1, { colors = ['#6a876b', '#91a57c', '#b7bb82'], flowers = false, bare = false, birch = false, seed = 4 } = {}) {
  const rng = random(seed);
  let s = `<g transform="translate(${x} ${y}) scale(${scale})"><g class="art-sway">`;
  s += path('M-11 5Q1-98-12-189L-20-284-11-287Q3-189 5-126L13 5Z', birch ? '#cbd0bd' : '#62614e');
  s += path('M-1-88Q-25-149-81-182M-5-146Q37-213 72-247M-11-207Q-49-248-83-264M-1-123Q52-154 106-198M-14-259L7-328', 'none', `stroke="${birch ? '#a4b2a2' : '#777460'}" stroke-width="6" stroke-linecap="round"`);
  s += `<g fill="none" stroke="${birch ? '#a3b1a1' : '#85816a'}" stroke-width="2.1" stroke-linecap="round"><path d="M-54-168L-104-231M-46-162L-91-157M38-207L47-264M52-225L104-249M-41-241L-57-291M70-176L84-219M102-195L129-193M-5-293L-29-332M2-313L31-343"/></g>`;
  if (birch) {
    for (let i = 0; i < 15; i++) {
      const yy = -17 - i * 17;
      s += path(`M${f(-8 + rng() * 6)} ${yy}l${f(5 + rng() * 7)} 1`, 'none', 'stroke="#586b67" stroke-width="2.8"');
    }
  }
  if (!bare) {
    const clusters = [[-78, -224, 46, 55], [-53, -286, 55, 47], [3, -321, 47, 43], [54, -278, 60, 51], [91, -225, 51, 60], [28, -214, 69, 56], [-23, -178, 67, 42]];
    for (const [cx, cy, rx, ry] of clusters) {
      const color = colors[Math.floor(rng() * colors.length)];
      s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}" opacity=".1"/>`;
      for (let n = 0; n < 27; n++) {
        const a = rng() * Math.PI * 2, rr = Math.sqrt(rng()), px = f(cx + Math.cos(a) * rx * rr), py = f(cy + Math.sin(a) * ry * rr), size = f(3 + rng() * 6), rotation = f(rng() * 170 - 85);
        if (flowers) {
          s += `<g transform="translate(${px} ${py}) rotate(${rotation})" fill="${colors[Math.floor(rng() * colors.length)]}" opacity="${f(.4 + rng() * .5)}"><path d="M0-5C6-11 11-4 6 0 12 5 6 11 0 5-6 11-12 5-6 0-11-4-6-11 0-5Z" transform="scale(${f(size / 7)})"/><circle r="1.2" fill="#d9ba78"/></g>`;
        } else {
          s += `<path d="M${px} ${py}q${-size} ${-size * 1.1} 0 ${-size * 2}q${size} ${size * .9} 0 ${size * 2}Z" transform="rotate(${rotation} ${px} ${py})" fill="${colors[Math.floor(rng() * colors.length)]}" opacity="${f(.35 + rng() * .5)}"/>`;
        }
      }
    }
  }
  return s + '</g></g>';
}

function grass(x, y, width = 300, color = '#99b4a0', seed = 12, n = 48) {
  const rng = random(seed);
  let s = `<g fill="none" stroke="${color}" stroke-width="1.1" opacity=".7">`;
  for (let i = 0; i < n; i++) {
    const xx = x + rng() * width, yy = y + rng() * 16, h = 8 + rng() * 27;
    s += `<path d="M${f(xx)} ${f(yy)}q${f(-8 + rng() * 16)} ${f(-h * .6)} ${f(-12 + rng() * 24)} ${f(-h)}"/>`;
  }
  return s + '</g>';
}

function tulip(x, y, scale = 1, color = '#d2a4a5', bend = 0) {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M0 0Q${bend}-27 ${bend}-51" fill="none" stroke="#92a27d" stroke-width="2"/><path d="M0-5Q-23-13-19-34-1-25 0-5M1-14Q23-21 20-43 3-31 1-14" fill="#6d8d73"/><path d="M${bend}-48Q${bend - 15}-51 ${bend - 12}-69L${bend - 4}-64 ${bend + 1}-73 ${bend + 5}-64 ${bend + 13}-68Q${bend + 14}-50 ${bend}-48Z" fill="${color}"/><path d="M${bend + 1}-51L${bend + 1}-67" fill="none" stroke="#f0d1be" opacity=".45"/></g>`;
}

function potPlant(x, y, scale = 1, flower = false, color = '#b18773') {
  const rng = random(20);
  let s = `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-22-39H22L16 0H-16Z" fill="${color}"/><path d="M-25-41H25V-33H-25Z" fill="#b29378"/><path d="M-17-30L-12-4M-8-30L-5-4M5-30L4-4M16-30L11-4" stroke="#d4b99a" stroke-width="1" opacity=".35"/>`;
  if (flower) {
    for (let i = 0; i < 7; i++) s += tulip(-18 + i * 6, -40, .8 + rng() * .3, ['#d5b0a9', '#e2cda9', '#b86e77'][i % 3], -8 + i * 3);
  } else {
    s += `<g fill="none" stroke="#8aab8e" stroke-width="2"><path d="M0-40V-126M0-63Q-24-88-31-116M0-76Q26-101 30-139M0-93Q-19-116-18-139"/></g>`;
    s += `<g fill="#71977d" stroke="#acc0a0" stroke-opacity=".3" stroke-width="1"><path d="M-2-86Q-48-72-44-109-24-126-2-86Z"/><path d="M2-99Q17-144 39-136 57-111 2-99Z"/><path d="M-2-115Q-34-108-29-137-12-154-2-115Z"/><path d="M-1-126Q-13-155 6-163 24-147-1-126Z"/><path d="M0-65Q-25-57-27-81-7-94 0-65Z"/></g>`;
  }
  return s + '</g>';
}

function greenhouse(x, y, scale = 1, { party = false } = {}) {
  let s = `<g transform="translate(${x} ${y}) scale(${scale})">`;
  s += `<ellipse cx="0" cy="0" rx="218" ry="40" fill="#283e3b" opacity=".3"/>`;
  s += path('M-182-12V-228L0-343 182-228V-12Z', party ? '#8d7b76' : '#9cae91', 'opacity=".25"');
  s += path('M-175-16V-222L0-331 175-222V-16Z', 'url(#@glass)', `opacity="${party ? '.24' : '.11'}"`);
  // Plants are drawn behind the glass ribs.
  s += potPlant(-115, -22, .9) + potPlant(105, -20, 1.1) + potPlant(-63, -17, .7, true);
  s += path('M-188-9H188L198 8H-199Z', '#9caa95');
  s += path('M-195 8H195L210 23H-211Z', '#738d81');
  s += `<g fill="none" stroke="${party ? '#c5b49b' : '#b5c6ac'}" stroke-width="4"><path d="M-183-12V-228L0-343 183-228V-12M-183-228H183M-183-133H183M-183-50H183M-122-12V-226L0-343 122-226V-12M-61-12V-226L0-343 61-226V-12M0-343V-12"/><path d="M-183-228L0-265 183-228M-138-256L0-300 138-256" stroke-width="2.4"/></g>`;
  s += `<g stroke="#e1dfbd" opacity=".27"><path d="M-172-212L-127-160M-110-210L-65-155M67-212L111-160M127-211L173-158M-174-121L-132-70M69-121L109-71" stroke-width="2"/></g>`;
  s += path('M-39-11V-152Q0-187 39-152V-11Z', '#3a514b', 'stroke="#c0cbb0" stroke-width="4"');
  s += path('M-31-19V-147Q0-171 31-147V-19Z', 'url(#@glass)', `opacity="${party ? '.5' : '.21'}"`);
  s += `<path d="M0-166V-17M-33-111H33M-33-58H33" stroke="#b9c7ad" stroke-width="3"/>`;
  s += circle(11, -71, 2.8, '#d6c28f');
  s += `<path d="M0-343V-365M-10-353H10" stroke="#b9c7ad" stroke-width="3"/><path d="M-183-228L-195-238M183-228L195-238" stroke="#b9c7ad" stroke-width="3"/>`;
  return s + '</g>';
}

function meadowGround({ back = '#597c6a', front = '#2c574b', water = false } = {}) {
  return path('M0 725Q211 662 428 703T807 692 1140 708 1400 667V1000H0Z', back)
    + path('M0 811Q183 738 419 781T842 757 1153 780 1400 750V1000H0Z', front)
    + (water ? path('M777 727C719 770 894 796 803 841S569 898 692 1000H1083C854 898 892 865 899 833S791 765 805 726Z', 'url(#@water)') : '');
}

function springScene() {
  let s = sky({ moonX: 1104, moonY: 238, moonR: 64, sun: true, stars: false });
  s += path('M0 652Q212 527 414 619T827 584 1184 618 1400 566V1000H0Z', '#57766a', 'opacity=".45"');
  s += forestLine(702, '#456b5e') + meadowGround({ back: '#74937c', front: '#3b6658', water: true });
  s += deciduous(1143, 775, 1.33, { colors: ['#c8d5b1', '#e0d8ba', '#b8c6a2'], flowers: true, seed: 4 });
  s += greenhouse(863, 782, 1.05);
  s += deciduous(570, 805, 1.22, { colors: ['#c7c3ab', '#e0cfba', '#c8d5b1'], flowers: true, seed: 14 });
  s += fence(1067, 811, 11, .9);
  s += `<g fill="#a8b29a" stroke="#c4c9ac" stroke-width="1"><ellipse cx="825" cy="821" rx="29" ry="9"/><ellipse cx="834" cy="847" rx="30" ry="9"/><ellipse cx="810" cy="874" rx="32" ry="10"/><ellipse cx="774" cy="901" rx="35" ry="11"/></g>`;
  for (let i = 0; i < 12; i++) s += tulip(1044 + i * 18, 865 + Math.sin(i) * 8, .6 + (i % 3) * .14, ['#c5b4ab', '#dac9a1', '#d3a2a0'][i % 3], (i % 3 - 1) * 4);
  s += potPlant(677, 836, .8, true) + potPlant(1074, 814, .63, true);
  s += grass(510, 883, 230, '#9bb294', 5) + grass(1056, 917, 340, '#88a48a', 12, 68);
  s += `<g fill="none" stroke="#c8d3b6" stroke-width="1.5" opacity=".6"><path d="M789 425q9-9 18 0 10-9 18-2M835 403q8-7 16 0 8-8 16-1M1115 392q11-8 21 1 9-11 21-5"/></g>`;
  return s;
}

function flowerBasket(x, y, scale = 1, { yellow = false } = {}) {
  const rng = random(17);
  let s = `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-34-42H34L25 0H-25Z" fill="#a58a66"/><path d="M-31-35H31M-29-26H29M-27-17H27M-25-8H25" stroke="#dfbf8f" stroke-width="2" opacity=".5"/>`;
  for (let i = 0; i < 11; i++) {
    const xx = -45 + rng() * 90, yy = -63 - rng() * 42;
    s += `<path d="M0-39L${f(xx)} ${f(yy)}" stroke="#8da27a" stroke-width="1.6"/>`;
    s += `<g transform="translate(${f(xx)} ${f(yy)})" fill="${yellow ? '#d7c38b' : ['#b97d83', '#d7afb0', '#d4c2a7'][i % 3]}"><path d="M0-8C10-18 20-5 10 1 20 10 7 19 0 10-9 19-21 6-11 0-20-9-8-18 0-8Z"/><circle r="3" fill="#c9af78"/></g>`;
  }
  return s + '</g>';
}

function flowerShop() {
  let s = `<g transform="translate(715 786)"><path d="M-23 0V-318L304-318V0Z" fill="#846e6f"/><path d="M-33-319L140-405 318-319Z" fill="#665b67"/><path d="M-33-319L140-405 318-319M-32-310H317" stroke="#bdaba0" stroke-width="3" fill="none"/>`;
  s += windowBox(40, -292, 59, 66, true) + windowBox(178, -292, 59, 66, true);
  s += `<path d="M-17-213H297V-185H-17Z" fill="#57665e" stroke="#c5baa2" stroke-width="2"/>`;
  s += `<path d="M-20-183H302L328-142H-47Z" fill="#d1b5a4"/>`;
  for (let i = 0; i < 9; i++) s += path(`M${-18 + i * 37}-182h19l${6 + i} 40h-23Z`, '#8d636a', 'opacity=".88"');
  s += `<path d="M-47-143Q-35-121-23-142-11-121 1-142 13-121 25-142 37-121 49-142 61-121 73-142 85-121 97-142 109-121 121-142 133-121 145-142 157-121 169-142 181-121 193-142 205-121 217-142 229-121 241-142 253-121 265-142 277-121 289-142 301-121 313-142 321-125 328-142" fill="#bfa190" stroke="#dbb8a2" stroke-width="1.4"/>`;
  s += `<rect x="-1" y="-133" width="102" height="110" fill="#384b49" stroke="#a3a38c" stroke-width="4"/><rect x="189" y="-133" width="102" height="110" fill="#384b49" stroke="#a3a38c" stroke-width="4"/>`;
  s += `<rect x="110" y="-135" width="69" height="135" fill="#465d54" stroke="#a6a48b" stroke-width="3"/><path d="M119-125H170V-56H119Z" fill="url(#@glass)" opacity=".7"/><path d="M145-124V-57" stroke="#6b745d" stroke-width="3"/><circle cx="166" cy="-42" r="3" fill="#cfb281"/>`;
  s += flowerBasket(49, -25, .8) + flowerBasket(242, -25, .8, { yellow: true });
  s += `<path d="M-5-23H103M185-23H295" stroke="#ab9780" stroke-width="7"/><path d="M104 0H184L196 15H93Z" fill="#b7afa0"/>`;
  s += `<path d="M-13-306V-218M294-306V-218" stroke="#dbbb9e" stroke-width="2" opacity=".3"/>`;
  s += `<g fill="none" stroke="#76917c" stroke-width="6" opacity=".9"><path d="M6-316Q-15-260 13-219M280-316Q300-255 279-218"/></g>`;
  s += '</g>';
  return s;
}

function womensDayScene() {
  let s = sky({ moonX: 1060, moonY: 185, moonR: 55 });
  s += path('M0 697Q218 630 470 663T916 651 1400 665V1000H0Z', '#715d69', 'opacity=".7"');
  s += `<g opacity=".33">${townHouse(492, 720, 144, 238, '#97878b')}${townHouse(1120, 731, 133, 266, '#95868a')}${townHouse(1264, 739, 110, 207, '#7c777c')}</g>`;
  s += path('M0 827Q403 768 733 788T1400 786V1000H0Z', '#766b6b');
  s += `<g stroke="#bea899" opacity=".17" fill="none"><path d="M449 874H1400M399 924H1400M322 984H1400M741 806L588 1000M886 804L906 1000M1036 802L1235 1000"/></g>`;
  s += deciduous(1199, 841, 1.35, { colors: ['#d6aaad', '#c2919a', '#e3c4bf'], flowers: true, seed: 9 });
  s += flowerShop();
  s += flowerBasket(733, 820, .92, { yellow: true }) + potPlant(1059, 826, .96, true);
  s += `<g transform="translate(623 802)">${lamp(0, -95, .9)}<path d="M0-95V33M-9 33H9" stroke="#555958" stroke-width="5"/></g>`;
  s += flowerBasket(1087, 879, 1.22) + flowerBasket(587, 879, 1.05, { yellow: true });
  // A florist's bicycle, drawn with spokes and a basket of stems.
  s += `<g transform="translate(820 858)" fill="none" stroke="#b4aca0" stroke-width="2">${circle(-31, 0, 22, 'none')}${circle(47, 0, 22, 'none')}<path d="M-31 0L-10-34 19 0H-31L8-29 47 0 30-46H43M6-33L18-33M8-33L19 0"/><path d="M-31-22V22M-53 0H-9M47-22V22M25 0H69" stroke-width=".65" opacity=".7"/></g>`;
  s += flowerBasket(866, 815, .33);
  s += grass(1178, 940, 220, '#ab9e87', 2, 58);
  return s;
}

function pavilion(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cx="0" cy="8" rx="183" ry="28" fill="#253f3b" opacity=".3"/><path d="M-158-12H158L174 7H-174Z" fill="#b4b39a"/><path d="M-170 7H170L189 23H-189Z" fill="#8fa18a"/><path d="M-147-212H147L0-309Z" fill="#657d6d"/><path d="M-147-212L0-309 147-212M-156-207H156" fill="none" stroke="#bdc5aa" stroke-width="5"/><path d="M-137-205V-15M137-205V-15M-73-205V-15M73-205V-15" fill="none" stroke="#c0c6ab" stroke-width="7"/><path d="M-143-192Q-107-149-74-192M-68-192Q0-133 68-192M74-192Q107-149 143-192" fill="none" stroke="#b4c1a5" stroke-width="4"/><path d="M-137-67H-72M73-67H136M-137-28H-72M73-28H136" fill="none" stroke="#9eb195" stroke-width="4"/><path d="M-118-66V-29M-97-66V-29M96-66V-29M116-66V-29" fill="none" stroke="#9eb195" stroke-width="2.5"/><path d="M0-309V-333M-8-324H8" stroke="#c2c8ad" stroke-width="3"/>${garland(-132, -190, 134, -190, 30, 13)}<path d="M-49-32H49M-33-32V-7M33-32V-7" stroke="#788d70" stroke-width="6"/></g>`;
}

function kite(x, y, scale = 1, color = '#d5b889') {
  return `<g transform="translate(${x} ${y}) scale(${scale})" class="art-kite"><path d="M0-37L27 0 0 47-27 0Z" fill="${color}"/><path d="M0-37V47M-27 0H27" stroke="#e9ddbc" stroke-width="1.3"/><path d="M0 47C-24 71 20 85-1 113S-23 157-7 188" fill="none" stroke="#d1c6a2" stroke-width="1.3"/><path d="M-7 78L-19 68-20 83ZM-7 78L4 71 6 84ZM-11 133L-22 125-22 138ZM-11 133L1 126 1 139Z" fill="#cf9d88"/></g>`;
}

function mayDayScene() {
  let s = sky({ moonX: 1050, moonY: 222, moonR: 71, sun: true, stars: false });
  s += path('M0 650Q254 528 453 623T838 589 1165 638 1400 562V1000H0Z', '#5f8877', 'opacity=".65"');
  s += meadowGround({ back: '#8ba285', front: '#466e58' });
  s += deciduous(1184, 781, 1.5, { colors: ['#95ae89', '#b6c598', '#779977'], seed: 2 });
  s += deciduous(579, 805, 1.3, { colors: ['#80a185', '#aec293', '#99b691'], seed: 12 });
  s += pavilion(869, 788, 1.1);
  s += kite(1154, 361, .72, '#d5be94') + kite(710, 300, .48, '#cc9b82');
  s += `<path d="M1149 498Q1056 608 1093 771M706 391Q687 532 741 690" fill="none" stroke="#c4c5a2" opacity=".35" stroke-width="1"/>`;
  s += garland(551, 590, 1150, 616, 31, 20);
  s += `<path d="M697 899L822 857 954 902 837 954Z" fill="#bba58a"/><g stroke="#ebe0bb" opacity=".5"><path d="M725 890L862 943M759 879L896 930M795 868L932 916M727 909L854 867M764 924L892 882M800 940L929 896"/></g>`;
  s += `<g transform="translate(847 898)"><path d="M-28-31H28L23 0H-23Z" fill="#a4845e"/><path d="M-21-32Q0-70 21-32" fill="none" stroke="#cfb38a" stroke-width="4"/><path d="M-26-24H26M-25-16H25M-24-8H24" stroke="#d6ba8b" stroke-width="2" opacity=".6"/></g>`;
  for (let i = 0; i < 15; i++) s += tulip(1028 + i * 21, 875 + Math.sin(i * 2) * 12, .52, '#d8c5a2', Math.sin(i) * 5);
  s += grass(491, 917, 210, '#a8b991', 31) + grass(1070, 971, 330, '#8dac84', 23, 70);
  return s;
}

function dove(x, y, scale = 1, rotation = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rotation}) scale(${scale})" class="art-bird"><path d="M0 0C-13-11-18-27-16-44-2-39 10-26 12-12 21-27 39-32 54-28 44-15 31-7 17-4 27-3 30 1 26 5 22 10 16 10 11 7 3 18-7 25-20 28L-13 12-29 14-17 1Z" fill="#d8ddc7"/><path d="M-11-35L5-11M40-24L17-9M-17 20L0 8" fill="none" stroke="#a3b7ad" stroke-width="1.3"/><circle cx="23" cy="1" r="1.1" fill="#6d7e75"/><path d="M27 2L34 3 27 5" fill="#c5ad82"/></g>`;
}

function carnation(x, y, scale = 1, angle = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})"><path d="M0 0V-70M0-20L-18-39M0-38L13-56" fill="none" stroke="#819b76" stroke-width="2.2"/><path d="M-1-27Q-19-17-24-38-9-40-1-27M1-44Q15-37 19-58 5-59 1-44" fill="#6b8764"/><path d="M0-66L-5-71-12-69-11-77-18-82-11-87-13-95-4-93 0-102 5-93 13-96 12-87 19-82 12-77 13-69 5-71Z" fill="#b8645d"/><path d="M0-72L-6-81-2-92 4-81 10-85M-10-83L0-79 6-92" fill="none" stroke="#dc8b78" stroke-width="1.4"/></g>`;
}

function victoryScene() {
  let s = sky({ moonX: 1070, moonY: 242, moonR: 62, sun: true, stars: false });
  s += path('M0 688Q279 592 506 661T1001 639 1400 650V1000H0Z', '#657567', 'opacity=".6"');
  s += forestLine(719, '#4a6256');
  s += path('M0 794Q284 742 521 775T994 748 1400 785V1000H0Z', '#656b58');
  s += path('M644 739H1113L1342 1000H448Z', '#9d9881');
  s += `<g fill="none" stroke="#c2b89a" stroke-width="1" opacity=".4"><path d="M585 832H1193M516 920H1273M797 741L712 1000M949 741L1091 1000"/></g>`;
  s += deciduous(1177, 786, 1.44, { colors: ['#7e956e', '#a3ad7f', '#c2bd8a'], seed: 72 });
  s += pine(575, 802, 1.25, { dark: true });
  // A quiet, unlettered memorial stele; the light is the centre of the composition.
  s += `<g transform="translate(899 778)"><path d="M-47-6L-35-295 33-295 47-6Z" fill="#a5aa98"/><path d="M8-294H33L47-6H13Z" fill="#7d8d83"/><path d="M-34-295L0-329 34-295Z" fill="#c5c5ac"/><path d="M-29-284L-41-17" stroke="#d8d0b2" stroke-width="2"/><path d="M-55-9H55L72 6H-72Z" fill="#b2b39b"/><path d="M-67 6H67L89 21H-89Z" fill="#7d8c7d"/><path d="M-10-205L0-222 10-205 29-201 15-187 18-169 0-177-18-169-15-187-29-201Z" fill="#c4b67b" stroke="#ded0a0" stroke-width="1"/></g>`;
  s += `<g transform="translate(862 857)"><path d="M-119 10L-74-28 83-28 124 10 76 35H-76Z" fill="#65726a"/><path d="M-103 7L-69-20 78-20 107 7 69 25H-69Z" fill="#939984"/><path d="M0-44L19-9 71-3 32 13 43 44 0 24-44 44-33 13-72-3-19-9Z" fill="#b99b62" stroke="#d6bc80" stroke-width="1.7"/>${circle(0, -12, 92, 'url(#@glow)')}<g class="art-flame"><path d="M-16-14C-38-44 9-57-4-93 28-74 4-54 23-39 38-21 20-9 0-9Z" fill="url(#@flame)"/><path d="M-4-12C-18-28 3-45 2-61 20-39 7-30 13-19Z" fill="#fff0bb"/></g></g>`;
  s += dove(811, 390, 1.1, -13) + dove(996, 359, .65, 8) + dove(1138, 467, .55, -17);
  s += carnation(766, 896, .84, 63) + carnation(790, 904, .86, 72) + carnation(816, 909, .76, 86);
  s += carnation(1060, 914, .9, -21) + carnation(1090, 921, 1.02, 7) + carnation(1125, 914, .84, 22);
  s += grass(1130, 966, 270, '#a7b28e', 33, 62);
  return s;
}

function dock(x, y, scale = 1) {
  let s = `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M0 0L120-125 191-125 143 0Z" fill="#8b8e71"/>`;
  for (let i = 0; i <= 12; i++) {
    const t = i / 12, yy = -125 * t;
    s += line(f(120 * t), f(yy), f(143 + 48 * t), f(yy), '#3d625f', 2);
  }
  s += `<path d="M8 4V35M137 3V30M119-124V-148M193-122V-148" stroke="#686f5a" stroke-width="7"/><path d="M121-140Q158-128 191-140" fill="none" stroke="#b5bba0" stroke-width="2"/></g>`;
  return s;
}

function summerScene() {
  let s = sky({ moonX: 1079, moonY: 212, moonR: 58 });
  s += path('M0 607Q233 505 405 591T801 565 1177 601 1400 545V1000H0Z', '#356667', 'opacity=".65"');
  s += forestLine(670, '#315c5a');
  s += path('M0 670H1400V1000H0Z', 'url(#@water)');
  s += `<path d="M1046 679L1086 679 1191 1000H919Z" fill="#c7d3a7" opacity=".055"/>`;
  s += waves(686, 20, '#b4cdb4');
  s += path('M834 702Q1000 656 1400 736V1000H1156Q1166 886 1053 846T834 702Z', '#416a56');
  s += pine(1221, 775, 1.3) + pine(1110, 731, .78);
  s += cottage(929, 755, .63, { snowy: false });
  s += dock(813, 912, 1.1);
  s += sailboat(668, 798, .9, true) + sailboat(1177, 695, .32);
  s += `<g transform="translate(961 787)">${lamp(0, 0, .6)}<path d="M0 0V51" stroke="#798368" stroke-width="4"/></g>`;
  s += path('M0 917Q244 827 483 900T858 962 1400 938V1000H0Z', '#214e48');
  s += grass(444, 958, 365, '#839f79', 3, 85) + grass(1096, 972, 304, '#8fa780', 8, 72);
  s += `<g transform="translate(1225 925)" stroke="#82966e" stroke-width="2" fill="none"><path d="M0 48Q-13-30-26-54M10 52Q31-8 42-35M-10 52Q-25 12-46-10"/><path d="M-26-54L-30-77M42-35L48-57M-46-10L-52-25" stroke="#b49d71" stroke-width="7" stroke-linecap="round"/></g>`;
  const rng = random(8);
  for (let i = 0; i < 18; i++) {
    const xx = 470 + rng() * 860, yy = 761 + rng() * 191;
    s += circle(f(xx), f(yy), 13, 'url(#@glow)', 'class="art-star"') + circle(f(xx), f(yy), 1.5, '#e0df9c', 'class="art-star"');
  }
  return s;
}

function domeTower(x, y, scale = 1, color = '#c8c9b4', dome = '#a39962') {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-23 0V-87H23V0Z" fill="${color}"/><path d="M-27-87L-18-112H18L27-87Z" fill="#9cac99"/><path d="M-18-111V-141H18V-111Z" fill="${color}"/><path d="M0-194C-4-179-28-170-28-152-28-133 28-133 28-152 28-170 4-179 0-194Z" fill="${dome}"/><path d="M0-193V-213M-8-204H8" stroke="#d3c492" stroke-width="2.6"/><path d="M0-185Q-10-164-8-145" fill="none" stroke="#e1d6ad" stroke-width="1.2" opacity=".5"/><path d="M-8-11V-44Q0-56 8-44V-11ZM-7-67V-83Q0-94 7-83V-67Z" fill="#677f7b"/><path d="M-19-3V-80M19-3V-80" stroke="#ece0bb" stroke-width="1.5" opacity=".5"/></g>`;
}

function tricolor(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M0 0V-77" stroke="#bfc8b0" stroke-width="2"/><g class="art-flag"><path d="M1-76Q15-84 29-76T58-76V-62Q44-55 29-63T1-62Z" fill="#d8ded4"/><path d="M1-63Q15-71 29-63T58-63V-49Q44-42 29-50T1-49Z" fill="#6e97ac"/><path d="M1-50Q15-58 29-50T58-50V-36Q44-29 29-37T1-36Z" fill="#bd7876"/></g></g>`;
}

function russiaScene() {
  let s = sky({ moonX: 1053, moonY: 231, moonR: 65, sun: true, stars: false });
  s += path('M0 642Q244 547 434 616T879 600 1200 617 1400 580V1000H0Z', '#718b88', 'opacity=".63"');
  s += path('M0 697Q301 651 553 688T1086 667 1400 688V1000H0Z', '#5f7f75');
  s += `<g opacity=".82">${townHouse(844, 680, 75, 86, '#babba6')}${townHouse(920, 681, 65, 63, '#a1ae9f')}${domeTower(1025, 681, .89)}${domeTower(1089, 682, .63, '#b5bca8', '#6f9b8d')}${domeTower(963, 680, .57, '#c6c7b0', '#6f9b8d')}${townHouse(1125, 683, 70, 82, '#adbaa6')}${townHouse(1200, 687, 61, 57, '#a7b3a4')}${tricolor(1174, 596, .6)}</g>`;
  s += path('M0 728Q276 705 520 723T1028 718 1400 732V1000H0Z', 'url(#@water)');
  s += waves(738, 16);
  s += sailboat(936, 812, .47);
  s += path('M0 857Q156 792 354 841T704 868 1161 930 1400 889V1000H0Z', '#3c6556');
  s += deciduous(575, 898, 1.58, { birch: true, colors: ['#93aa8c', '#bdc99f', '#a7bd93'], seed: 42 });
  s += deciduous(1245, 914, 1.77, { birch: true, colors: ['#8ea785', '#b6c595', '#a6bc8b'], seed: 62 });
  s += deciduous(421, 916, 1.29, { birch: true, colors: ['#86a181', '#b2c39a', '#a1b68c'], seed: 23 });
  s += grass(520, 963, 495, '#adbd94', 29, 90);
  const rng = random(3);
  for (let i = 0; i < 22; i++) {
    const x = 604 + rng() * 480, y = 919 + rng() * 78;
    s += `<path d="M${f(x)} ${f(y)}v-15" stroke="#9fb58a" stroke-width="1"/><g transform="translate(${f(x)} ${f(y - 16)})" fill="#d5d8bc"><ellipse rx="2" ry="6"/><ellipse rx="2" ry="6" transform="rotate(60)"/><ellipse rx="2" ry="6" transform="rotate(120)"/><circle r="2.1" fill="#c3b67c"/></g>`;
  }
  return s;
}

function bench(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-60 0L-56-64M62 0L58-64" stroke="#3f4d43" stroke-width="5"/><path d="M-69-60H70V-50H-69ZM-69-43H70V-33H-69Z" fill="#a28c64"/><path d="M-72-22H72L80-11H-79Z" fill="#b19a6d"/><path d="M-64-12L-71 10M64-12L70 10M-65-38V-20M64-38V-20" stroke="#4a5645" stroke-width="5"/><path d="M-64-38H-78M64-38H78" stroke="#8a805f" stroke-width="4"/></g>`;
}

function bridge(x, y, scale = 1) {
  let s = `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-184 20Q0-79 184 20L180 39Q0-48-180 39Z" fill="#a59573"/><path d="M-185-29Q0-124 185-29" fill="none" stroke="#9f9272" stroke-width="7"/><path d="M-184-3Q0-101 184-3" fill="none" stroke="#7d7a5f" stroke-width="3"/>`;
  for (let i = 0; i <= 10; i++) {
    const t = i / 10, xx = -182 + t * 364, yy = -29 - 190 * t * (1 - t);
    s += line(f(xx), f(yy - 6), f(xx), f(yy + 50), '#b9aa81', 4);
  }
  for (let i = 0; i <= 22; i++) {
    const t = i / 22, xx = -179 + t * 358, yy = 21 - 194 * t * (1 - t);
    s += line(f(xx), f(yy), f(xx - 3), f(yy + 15), '#6f7761', 1.5);
  }
  return s + '</g>';
}

function autumnScene() {
  let s = sky({ moonX: 1079, moonY: 202, moonR: 67, sun: true, stars: false });
  s += path('M0 665Q261 591 501 649T976 630 1400 658V1000H0Z', '#737a61', 'opacity=".6"');
  s += meadowGround({ back: '#9a936e', front: '#5b6d52', water: true });
  s += deciduous(741, 742, 1.06, { colors: ['#b6975f', '#d0ad70', '#c28d5c'], seed: 21 });
  s += deciduous(1169, 795, 1.69, { colors: ['#ad8055', '#cda16b', '#dfbc7e'], seed: 10 });
  s += deciduous(543, 827, 1.64, { colors: ['#c59d62', '#aa8053', '#d9bb7f'], seed: 9 });
  s += path('M678 787Q851 725 1018 784L1139 831 1085 856Q909 756 731 823Z', '#ab9e7a', 'opacity=".75"');
  s += bridge(867, 844, 1.03);
  s += bench(1130, 885, .88);
  s += `<g transform="translate(694 792)">${lamp(0, -65, .82)}<path d="M0-65V75M-8 75H8" stroke="#56624e" stroke-width="5"/></g>`;
  s += grass(1019, 962, 380, '#acac7e', 48, 75);
  const rng = random(15);
  for (let i = 0; i < 40; i++) {
    const x = 488 + rng() * 840, y = 855 + rng() * 124;
    s += `<path d="M${f(x)} ${f(y)}q-9-8 4-12 8 9-4 12Z" fill="${['#c49962', '#ab7d57', '#d3b17a'][i % 3]}" transform="rotate(${f(rng() * 180)} ${f(x)} ${f(y)})" opacity=".6"/>`;
  }
  return s;
}

function schoolHouse() {
  let s = `<g transform="translate(704 792)"><path d="M0 0V-248H324V0Z" fill="#a28f7c"/><path d="M-18-250L160-342 344-250Z" fill="#5f6a67"/><path d="M-17-250L160-342 343-250" fill="none" stroke="#bebba0" stroke-width="4"/><path d="M-12-244H336M-7-132H331M0-11H324" stroke="#c2b394" stroke-width="5"/>`;
  for (let yy = -231; yy < -16; yy += 15) {
    s += line(4, yy, 320, yy, '#dcc8a3', 1, 'opacity=".2"');
  }
  s += windowBox(28, -216, 47, 61, true) + windowBox(112, -216, 47, 61, true) + windowBox(198, -216, 47, 61, true) + windowBox(271, -214, 29, 57, true);
  s += windowBox(28, -112, 47, 66) + windowBox(230, -112, 47, 66);
  s += `<path d="M116 0V-91Q162-139 208-91V0Z" fill="#4d5e51" stroke="#c7b997" stroke-width="6"/><path d="M129-1V-87Q162-120 195-87V-1Z" fill="#8d7960"/><path d="M136-81H188V-46H136Z" fill="url(#@glass)"/><path d="M162-103V0M132-39H192" stroke="#b6a984" stroke-width="3"/><circle cx="154" cy="-23" r="2.5" fill="#e0c68c"/><circle cx="172" cy="-23" r="2.5" fill="#e0c68c"/>`;
  s += `<path d="M100 1H224L240 14H84ZM84 14H240L258 29H67Z" fill="#bbb59a" stroke="#858e78" stroke-width="1"/>`;
  // A small open bell tower above the central gable.
  s += `<path d="M136-329V-399H188V-329Z" fill="#a0a18a"/><path d="M125-398L162-444 199-398Z" fill="#5c7870" stroke="#aabd9f" stroke-width="2"/><path d="M145-336V-380Q162-403 179-380V-336Z" fill="#455d53"/><path d="M162-384V-370M150-346Q151-369 162-371 174-369 175-346ZM148-345H177" stroke="#ddbd7e" fill="#b99e67" stroke-width="2"/><path d="M162-443V-456" stroke="#c2c1a0" stroke-width="3"/>`;
  s += `<path d="M11-239V-12M312-239V-12" stroke="#d5c5a4" stroke-width="5" opacity=".55"/>`;
  s += `</g>`;
  return s;
}

function books(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-49-15H50V0H-49Q-58-7-49-15Z" fill="#8a6658"/><path d="M-42-12H48V-3H-42Z" fill="#d5c7a5"/><path d="M-43-34H39V-18H-43Q-51-26-43-34Z" fill="#536b62"/><path d="M-37-31H37V-21H-37Z" fill="#d5c7a5"/><path d="M-31-52H51V-36H-31Q-39-44-31-52Z" fill="#ac966b"/><path d="M-24-49H49V-39H-24Z" fill="#e0d1ae"/><path d="M-38-8H44M-31-26H32M-19-44H45" stroke="#b4a584" stroke-width=".6"/><path d="M-13-33L-13-10-8-15-3-10-3-33Z" fill="#bd7c60"/></g>`;
}

function knowledgeScene() {
  let s = sky({ moonX: 1099, moonY: 232, moonR: 64, sun: true, stars: false });
  s += path('M0 680Q249 598 483 649T935 633 1400 637V1000H0Z', '#7a867c', 'opacity=".6"');
  s += `<g opacity=".35">${townHouse(513, 743, 119, 190, '#83928a')}${townHouse(1093, 737, 106, 167, '#a4a28d')}${townHouse(1210, 746, 124, 209, '#959c8d')}</g>`;
  s += path('M0 819Q287 744 555 783T1020 776 1400 790V1000H0Z', '#68755f');
  s += path('M743 793H972L1126 1000H549Z', '#a7a287');
  s += deciduous(1176, 835, 1.6, { colors: ['#bd9e65', '#dcc18a', '#b28b58'], seed: 54 });
  s += deciduous(575, 827, 1.26, { colors: ['#b9a56a', '#d7c28f', '#b99a65'], seed: 32 });
  s += schoolHouse();
  s += `<path d="M664 807V895M1068 807V895" stroke="#9b9a7c" stroke-width="9"/><path d="M662 850H709M1023 850H1070M663 875H708M1024 875H1067" stroke="#78836a" stroke-width="3"/>`;
  s += bench(1191, 910, .83);
  s += books(1166, 891, .75);
  s += `<g transform="translate(684 890)"><path d="M-28-39H28V1H-28Z" fill="#98725c" stroke="#bda084" stroke-width="2"/><path d="M-16-39V-51Q0-66 16-51V-39" fill="none" stroke="#98725c" stroke-width="5"/><path d="M-28-35Q0-23 28-35M-11-32V-17M11-32V-17" fill="none" stroke="#d2b48b" stroke-width="2"/></g>`;
  s += books(781, 951, .95) + grass(1091, 971, 310, '#b1b28b', 71, 75);
  s += `<g fill="none" stroke="#e4d7b3" stroke-width="2" opacity=".65"><path d="M725 426L755 415 786 429 755 420Z"/><path d="M755 420L744 432 749 420"/><path d="M744 435Q723 451 703 459" stroke-dasharray="3 6" stroke-width="1"/></g>`;
  return s;
}

function cityBridge(x, y, scale = 1) {
  let s = `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-240-39Q0-89 240-39V49H160C157-20 84-22 77 47H-76C-83-22-157-20-161 49H-240Z" fill="#9c9c90"/><path d="M-240-41Q0-91 240-41M-240-47Q0-97 240-47" fill="none" stroke="#d0c2aa" stroke-width="4"/><path d="M-238 39H-162M-76 39H77M161 39H238" stroke="#707e7d" stroke-width="4"/>`;
  for (let i = 0; i < 16; i++) {
    const xx = -228 + i * 30.4, yy = -49 - 150 * (i / 15) * (1 - i / 15);
    s += line(f(xx), f(yy - 26), f(xx), f(yy - 1), '#c9bfa6', 3);
  }
  s += `<path d="M-240-76Q0-127 240-76" fill="none" stroke="#c9bfa6" stroke-width="3"/>`;
  for (const xx of [-203, -94, 94, 203]) {
    const yy = -62 - (1 - Math.abs(xx) / 240) * 25;
    s += lamp(xx, yy - 40, .58) + line(xx, yy - 40, xx, yy, '#adb49e', 3);
  }
  return s + '</g>';
}

function unityScene() {
  let s = sky({ moonX: 1073, moonY: 194, moonR: 53 });
  s += path('M0 680Q223 621 478 663T910 633 1400 650V1000H0Z', '#5e6478', 'opacity=".55"');
  s += `<g opacity=".65">${townHouse(499, 692, 62, 113, '#737b86')}${townHouse(571, 696, 73, 147, '#8b858c')}${townHouse(653, 691, 81, 114, '#7b8290')}${townHouse(741, 690, 69, 164, '#a09191')}${townHouse(816, 690, 79, 125, '#8a858e')}${townHouse(905, 693, 82, 151, '#7c8590')}${townHouse(998, 695, 63, 120, '#a09896')}${townHouse(1068, 698, 73, 168, '#797f8c')}${townHouse(1151, 701, 91, 135, '#8d8a8b')}${townHouse(1255, 705, 85, 171, '#828590')}</g>`;
  s += path('M0 708H1400V1000H0Z', 'url(#@water)');
  s += waves(720, 18, '#c3b8b3');
  s += path('M0 727L560 745 653 785 530 866 0 873ZM1157 742L1400 714V868L1083 844 1045 793Z', '#767983');
  s += townHouse(424, 757, 123, 259, '#8f8791', { roof: 'flat' });
  s += townHouse(1148, 772, 144, 275, '#a39594');
  s += townHouse(1304, 776, 103, 214, '#8a8a95', { roof: 'flat' });
  s += tricolor(1236, 492, .8);
  s += cityBridge(855, 805, 1.1);
  // Small reflections under each lamp, interrupted by the slow water layer.
  s += `<g class="art-water" stroke="#e3be91" stroke-width="2" opacity=".25"><path d="M625 851h17M629 863h11M622 878h23M628 893h13M745 875h18M747 889h14M740 905h25M949 872h20M952 886h13M945 899h25M1061 849h19M1058 861h24M1064 879h14"/></g>`;
  s += `<g transform="translate(828 939)"><path d="M-38 0Q0 21 45 0L32 17H-23Z" fill="#b9b39f"/><path d="M-6 0V-47M-6-46L29-7H-6Z" fill="#c7bb9b" stroke="#e6d4b3" stroke-width="1"/><path d="M-42 23Q3 30 49 23" fill="none" stroke="#bdbfb2" opacity=".5"/></g>`;
  s += deciduous(470, 933, .84, { colors: ['#9f8867', '#b29e7a', '#8f8066'], seed: 93 });
  s += `<g transform="translate(1352 895)">${lamp(0, -79, 1)}<path d="M0-79V57" stroke="#b4b3a2" stroke-width="5"/></g>`;
  return s;
}

function balloon(x, y, scale = 1, color = '#b98c88') {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><g class="art-balloon"><path d="M0 0C-50-34-46-96 0-97 46-96 50-34 0 0Z" fill="${color}"/><path d="M-20-77Q-33-57-25-43" fill="none" stroke="#f1d8b7" stroke-width="4" stroke-linecap="round" opacity=".3"/><path d="M0 0L-4 6H4Z" fill="${color}"/><path d="M0 6C-18 35 19 58 0 92S-4 133 3 158" fill="none" stroke="#d4c5ac" stroke-width="1"/></g></g>`;
}

function cake(x, y, scale = 1) {
  let s = `<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cx="0" cy="5" rx="99" ry="19" fill="#7d6d64"/><path d="M-82 1H82V-10H-82Z" fill="#d3c3aa"/><ellipse cx="0" cy="-10" rx="87" ry="15" fill="#e3d0b1"/><path d="M-65-12V-63H65V-12Q0 9-65-12Z" fill="#b28875"/><ellipse cx="0" cy="-63" rx="65" ry="15" fill="#d9b69a"/><path d="M-65-58Q-55-39-46-53-34-36-23-51-12-35 0-50 13-36 26-51 39-37 51-54 60-42 65-58" fill="#ddc1a4"/>`;
  s += `<path d="M-42-65V-101H42V-65Q0-51-42-65Z" fill="#bb9682"/><ellipse cx="0" cy="-101" rx="42" ry="11" fill="#ebd7b8"/><path d="M-42-96Q-33-80-23-93-12-76 0-91 13-78 25-93 35-80 42-96" fill="#e6c8a8"/>`;
  for (const xx of [-25, 0, 25]) {
    s += `<path d="M${xx}-104V-129" stroke="#e0bd94" stroke-width="4"/><path d="M${xx - 1}-107l3-5M${xx - 1}-116l3-5" stroke="#a57975" stroke-width="1.2"/>`;
    s += circle(xx, -137, 25, 'url(#@glow)');
    s += `<path class="art-flame" d="M${xx}-131C${xx - 8}-137 ${xx}-143 ${xx}-149 ${xx + 8}-141 ${xx + 7}-135 ${xx}-131Z" fill="#ffe8b4"/>`;
  }
  s += `<path d="M-91 8H91L79 18H-79Z" fill="#c6b196"/><path d="M-4 18V44M-29 46H29" fill="none" stroke="#bcaa90" stroke-width="7"/>`;
  return s + '</g>';
}

function birthdayScene() {
  let s = sky({ moonX: 1094, moonY: 185, moonR: 52 });
  s += path('M0 693Q230 614 496 665T951 633 1400 650V1000H0Z', '#716b76', 'opacity=".55"');
  s += forestLine(744, '#554e61');
  s += path('M0 832Q250 738 508 784T934 767 1400 780V1000H0Z', '#9aacae');
  s += pine(1207, 797, 1.37, { snowy: true });
  s += pine(565, 822, 1.25, { snowy: true });
  s += `<ellipse cx="870" cy="688" rx="310" ry="290" fill="url(#@glow)"/>`;
  s += greenhouse(867, 822, 1.16, { party: true });
  s += `<path d="M648 552L866 416 1085 552" fill="none" stroke="#c9d5cc" stroke-width="7" stroke-linecap="round"/>`;
  s += garland(594, 523, 1159, 523, 54, 24);
  s += balloon(674, 651, .83, '#ba9292') + balloon(714, 607, .69, '#bba880') + balloon(1081, 665, .83, '#ae999e') + balloon(1127, 620, .65, '#c2b596');
  // Warm foreground table and a hand-drawn cake: the birthday's own focal point.
  s += `<g transform="translate(866 832)"><ellipse cx="0" cy="0" rx="111" ry="28" fill="#d0b5a1"/><path d="M-110 0Q0 37 110 0L102 76Q85 60 69 78 51 62 33 79 14 63 0 79-17 62-33 79-51 63-69 78-85 62-102 76Z" fill="#c3a08f"/><path d="M-107 3Q0 38 107 3" fill="none" stroke="#ebcdb1" stroke-width="2"/><path d="M-84 72L-89 99M84 72L89 99" stroke="#73615c" stroke-width="7"/></g>`;
  s += cake(866, 803, .94);
  s += gift(723, 888, 59, 60, '#8e737b') + gift(680, 897, 42, 37, '#ac9474') + gift(1018, 892, 68, 57, '#9c7f83') + gift(1080, 903, 39, 39, '#9aab9e');
  s += `<g transform="translate(1195 892)">${lamp(0, 0, .7)}<path d="M0 0V55" stroke="#767b6e" stroke-width="4"/></g>`;
  s += path('M0 961Q255 899 472 953T881 967 1400 955V1000H0Z', '#7d939d');
  s += `<g fill="none" stroke="#d3d9cb" stroke-width="1.4" opacity=".4"><path d="M654 942q33-9 63-2M1056 966q49-12 93-3M1234 936q40-9 76-2"/></g>`;
  return s;
}

function celebrationDetails(id) {
  if (id === 'victory') return dove(632, 485, .65, -14) + dove(1024, 450, .46, 4);
  if (['spring', 'womens-day', 'may-day', 'summer', 'russia', 'autumn', 'knowledge'].includes(id)) {
    return `<g opacity=".6">${dove(1100, 358, .5, -9)}${dove(1199, 402, .36, 11)}</g>`;
  }
  const colors = ['#e5c68b', '#c2dace', '#ddb1a0'];
  let s = '<g class="art-celebration" fill="none" stroke-linecap="round">';
  [[768, 263, 55], [1217, 365, 42], [1015, 95, 29]].forEach(([cx, cy, radius], n) => {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      s += line(f(cx + Math.cos(a) * radius * .35), f(cy + Math.sin(a) * radius * .35), f(cx + Math.cos(a) * radius), f(cy + Math.sin(a) * radius), colors[n], 1.25, 'opacity=".5"');
      s += circle(f(cx + Math.cos(a) * radius * 1.13), f(cy + Math.sin(a) * radius * 1.13), 1.3, colors[n], 'opacity=".6"');
    }
  });
  return s + '</g>';
}

const SCENES = Object.freeze({
  winter: winterScene, 'new-year': newYearScene, defender: defenderScene,
  spring: springScene, 'womens-day': womensDayScene, 'may-day': mayDayScene,
  victory: victoryScene, summer: summerScene, russia: russiaScene,
  autumn: autumnScene, knowledge: knowledgeScene, unity: unityScene, birthday: birthdayScene,
});

// Each mounted SVG gets its own definitions, including simultaneous gallery thumbnails.
let renderSerial = 0;

export function buildArtwork(eventId, { celebration = false } = {}) {
  const id = Object.hasOwn(SCENES, eventId) ? eventId : 'winter';
  const prefix = `advent-${id}-${++renderSerial}-`;
  const title = TITLES[id];
  const artwork = defs(ART_PALETTES[id]) + SCENES[id]() + (celebration ? celebrationDetails(id) : '')
    + '<rect width="1400" height="1000" fill="transparent" filter="url(#@grain)" pointer-events="none"/>';
  return `<svg xmlns="http://www.w3.org/2000/svg" class="scene-artwork" viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMid slice" role="img" aria-labelledby="${prefix}title"><title id="${prefix}title">${title}</title>${artwork.replaceAll('@', prefix)}</svg>`;
}
