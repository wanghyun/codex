async function includeCommonLayout() {
  const includeTargets = [
    { selector: '[data-include="header"]', path: '/header.html' },
    { selector: '[data-include="footer"]', path: '/footer.html' }
  ];

  await Promise.all(
    includeTargets.map(async ({ selector, path }) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Include load failed: ${path}`);
      el.innerHTML = await res.text();
    })
  );
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await includeCommonLayout();
    if (window.PageData?.init) {
      await window.PageData.init();
    }
    if (window.Editor?.init) {
      await window.Editor.init();
    }
  } catch (error) {
    console.error('사이트 초기화 실패:', error);
  }
});
