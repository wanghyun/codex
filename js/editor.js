(function () {
  let isAdmin = false;

  function getByPath(obj, path) {
    return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  }

  function setByPath(obj, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((acc, key) => {
      if (!acc[key]) acc[key] = Number.isInteger(Number(key)) ? [] : {};
      return acc[key];
    }, obj);
    target[last] = value;
  }

  async function checkSession() {
    const res = await fetch('/api/session-check.php', { credentials: 'include' });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.authenticated);
  }

  async function login() {
    const password = prompt('관리자 비밀번호를 입력하세요');
    if (!password) return false;
    const res = await fetch('/api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password })
    });
    return res.ok;
  }

  async function logout() {
    await fetch('/api/logout.php', { method: 'POST', credentials: 'include' });
    location.reload();
  }

  function attachTextEditors() {
    document.querySelectorAll('[data-edit]').forEach((el) => {
      el.contentEditable = 'true';
      el.classList.add('is-editable');
      el.addEventListener('input', () => {
        setByPath(window.__PAGE_DATA__, el.dataset.edit, el.textContent.trim());
      });
    });
  }

  function attachImageEditors() {
    document.querySelectorAll('[data-edit-image-trigger]').forEach((btn) => {
      btn.hidden = false;
      btn.addEventListener('click', () => {
        const key = btn.dataset.editImageTrigger;
        const current = getByPath(window.__PAGE_DATA__, key);
        const currentSrc = typeof current === 'string' ? current : current?.src || '';
        const nextSrc = prompt('새 이미지 URL', currentSrc);
        if (!nextSrc) return;
        if (typeof current === 'string') {
          setByPath(window.__PAGE_DATA__, key, nextSrc);
        } else {
          setByPath(window.__PAGE_DATA__, `${key}.src`, nextSrc);
        }
        const target = document.querySelector(`[data-edit-image="${key}"]`);
        if (target?.tagName === 'IMG') {
          target.src = nextSrc;
        } else if (target) {
          target.style.backgroundImage = `url('${nextSrc}')`;
        }
      });
    });
  }

  async function save() {
    const page = document.body.dataset.page;
    const res = await fetch('/api/save-page-json.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ page, data: window.__PAGE_DATA__ })
    });
    if (!res.ok) throw new Error('저장 실패');
    alert('저장되었습니다.');
  }

  function injectSaveButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'page-save-btn';
    btn.textContent = '저장';
    btn.addEventListener('click', () => save().catch((e) => alert(e.message)));
    document.body.appendChild(btn);
  }

  async function init() {
    isAdmin = await checkSession();

    const loginBtn = document.getElementById('admin-login-btn');
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (loginBtn) {
      loginBtn.onclick = async () => {
        const ok = await login();
        if (ok) location.reload();
      };
      loginBtn.hidden = isAdmin;
    }

    if (logoutBtn) {
      logoutBtn.onclick = logout;
      logoutBtn.hidden = !isAdmin;
    }

    if (!isAdmin) return;
    document.body.classList.add('is-edit-mode');
    attachTextEditors();
    attachImageEditors();
    injectSaveButton();
  }

  window.Editor = { init };
})();
