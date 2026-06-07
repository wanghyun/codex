(function () {
  function getByPath(obj, path) {
    return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  }

  function setText(data) {
    document.querySelectorAll('[data-edit]').forEach((el) => {
      const key = el.dataset.edit;
      const value = getByPath(data, key);
      if (typeof value === 'string') el.textContent = value;
    });
  }

  function setLinks(data) {
    document.querySelectorAll('[data-edit-link]').forEach((el) => {
      const key = el.dataset.editLink;
      const value = getByPath(data, key);
      if (!value) return;
      if (typeof value.href === 'string') el.setAttribute('href', value.href);
      if (typeof value.label === 'string') el.textContent = value.label;
    });
  }

  function setImages(data) {
    document.querySelectorAll('[data-edit-image]').forEach((el) => {
      const key = el.dataset.editImage;
      const value = getByPath(data, key);
      if (!value) return;
      const src = typeof value === 'string' ? value : value.src;
      const alt = typeof value === 'object' ? value.alt : null;
      if (src) {
        if (el.tagName === 'IMG') {
          el.src = src;
          if (alt) el.alt = alt;
        } else {
          el.style.backgroundImage = `url('${src}')`;
          if (alt) el.setAttribute('aria-label', alt);
        }
      }
    });
  }

  function renderArrays(data) {
    document.querySelectorAll('[data-render]').forEach((el) => {
      const key = el.dataset.render;
      const type = el.dataset.renderType || 'gallery';
      const items = getByPath(data, key);
      if (!Array.isArray(items)) return;

      if (type === 'gallery') {
        el.innerHTML = items
          .map(
            (item, idx) => `
            <article class="gallery-item">
              <img src="${item.src}" alt="${item.alt || ''}" data-edit-image="${key}.${idx}" />
              <button type="button" class="edit-image-btn" data-edit-image-trigger="${key}.${idx}">이미지 변경</button>
              <p data-edit="${key}.${idx}.caption">${item.caption || ''}</p>
            </article>`
          )
          .join('');
      }

      if (type === 'cards') {
        el.innerHTML = items
          .map(
            (item, idx) => `
            <article class="card-item">
              <h3 data-edit="${key}.${idx}.title">${item.title || ''}</h3>
              <p data-edit="${key}.${idx}.desc">${item.desc || ''}</p>
              <a href="${item.link?.href || '#'}" data-edit-link="${key}.${idx}.link">${item.link?.label || ''}</a>
            </article>`
          )
          .join('');
      }
    });
  }

  async function init() {
    const page = document.body.dataset.page;
    if (!page) return;
    const res = await fetch(`/data/${page}.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`페이지 데이터 로드 실패: ${page}`);
    const data = await res.json();
    window.__PAGE_DATA__ = data;
    setText(data);
    setLinks(data);
    setImages(data);
    renderArrays(data);
  }

  window.PageData = { init };
})();
