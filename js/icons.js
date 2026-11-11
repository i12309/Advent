const paths = {
  brand: '<path d="M16 2 20 12 30 16 20 20 16 30 12 20 2 16 12 12Z"/><circle cx="16" cy="16" r="3"/>',
  grid: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/>',
  pause: '<path d="M8 5v14M16 5v14"/>', play: '<path d="m8 4 12 8-12 8Z"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  collapse: '<path d="M3 8h5V3m13 5h-5V3M8 21v-5H3m13 5v-5h5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',
  'arrow-left': '<path d="m14 6-6 6 6 6M8 12h12"/>',
  'arrow-right': '<path d="m10 6 6 6-6 6M4 12h12"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/><path d="M20 2v4m-2-2h4"/>',
  snowflake: '<path d="M12 2v20M3.34 7l17.32 10M3.34 17 20.66 7M9 3l3 3 3-3M9 21l3-3 3 3M3 10l4-1-1-4M18 19l-1-4 4-1M6 19l1-4-4-1M21 10l-4-1 1-4"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/>',
  sprout: '<path d="M12 22V12C3 13 3 5 3 5s9-2 9 7c0-10 9-10 9-10s2 10-9 10"/>',
  flower: '<path d="M12 10c-8-11 8-11 0 0 11-8 11 8 0 0 8 11-8 11 0 0-11 8-11-8 0 0Zm0 3v9m0-3c-5 0-5-4-5-4 5 0 5 4 5 4Z"/><circle cx="12" cy="10" r="2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  flame: '<path d="M13 2c1 7-6 7-3 12 2-1 3-3 3-5 8 7 4 13-1 13S2 17 6 11c-1 5 2 5 2 4-2-7 5-8 5-13Z"/>',
  landscape: '<path d="M2 19h20M3 16l5-8 5 8m-2-4 4-6 6 10"/><circle cx="5" cy="5" r="2"/>',
  leaf: '<path d="M20 3C9 1 1 9 5 16s18 4 15-13ZM4 21 16 9m-9 9v-7m4 3h6"/>',
  book: '<path d="M12 6C8 3 3 4 3 4v15s5-1 9 2c4-3 9-2 9-2V4s-5-1-9 2Zm0 0v15M6 8l3 1m6 0 3-1M6 12l3 1m6 0 3-1"/>',
  lantern: '<path d="M8 5a4 4 0 0 1 8 0M6 7h12l-1 13H7L6 7Zm0 13h12M5 7h14M12 11v5"/>',
  gift: '<path d="M3 8h18v5H3Zm2 5v8h14v-8M12 8v13M12 8C2 8 6 0 10 4l2 4Zm0 0c10 0 6-8 2-4l-2 4Z"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  heart: '<path d="M12 21C2 14 0 8 5 4c3-2 6 0 7 2 1-2 4-4 7-2 5 4 3 10-7 17Z"/>',
};
export function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 ${name === 'brand' ? '32 32' : '24 24'}" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sparkles}</svg>`;
}
export function hydrateIcons(root = document) {
  for (const element of root.querySelectorAll('[data-icon]')) element.innerHTML = icon(element.dataset.icon);
}
