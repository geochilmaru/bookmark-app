const form = document.getElementById('bookmark-form');
const urlInput = document.getElementById('url');
const titleInput = document.getElementById('title');
const categoryInput = document.getElementById('category');
const editIdInput = document.getElementById('edit-id');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const bookmarkList = document.getElementById('bookmark-list');
const emptyState = document.getElementById('empty-state');
const countLabel = document.getElementById('bookmark-count');
const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('category-filter');
const categoryDropdown = document.getElementById('category-dropdown');
const toast = document.getElementById('toast');
const urlError = document.getElementById('url-error');
const urlDuplicate = document.getElementById('url-duplicate');

let activeCategory = '전체';
let toastTimer = null;
let allCategories = [];
let dropdownActiveIndex = -1;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2500);
}

async function fetchCategories() {
  const res = await fetch('/api/categories');
  allCategories = await res.json();

  const existing = [...categoryFilter.querySelectorAll('.filter-btn')].map(b => b.dataset.category);
  allCategories.forEach(cat => {
    if (!existing.includes(cat)) {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.category = cat;
      btn.textContent = cat;
      btn.addEventListener('click', () => setCategory(cat));
      categoryFilter.appendChild(btn);
    }
  });

  categoryFilter.querySelectorAll('.filter-btn').forEach(btn => {
    if (!['전체', ...allCategories].includes(btn.dataset.category)) {
      btn.remove();
    }
  });
}

function renderDropdown(query) {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? allCategories.filter(c => c.toLowerCase().includes(q))
    : allCategories;

  if (filtered.length === 0) {
    closeDropdown();
    return;
  }

  dropdownActiveIndex = -1;
  categoryDropdown.innerHTML = filtered.map(c => {
    const highlighted = q
      ? c.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>')
      : c;
    return `<li data-value="${escapeHtml(c)}">${highlighted}</li>`;
  }).join('');

  categoryDropdown.querySelectorAll('li').forEach(li => {
    li.addEventListener('mousedown', (e) => {
      e.preventDefault();
      categoryInput.value = li.dataset.value;
      closeDropdown();
    });
  });

  categoryDropdown.classList.remove('hidden');
}

function closeDropdown() {
  categoryDropdown.classList.add('hidden');
  dropdownActiveIndex = -1;
}

function updateActiveItem() {
  const items = categoryDropdown.querySelectorAll('li');
  items.forEach((li, i) => li.classList.toggle('active', i === dropdownActiveIndex));
  if (dropdownActiveIndex >= 0) {
    items[dropdownActiveIndex].scrollIntoView({ block: 'nearest' });
  }
}

function setCategory(cat) {
  activeCategory = cat;
  categoryFilter.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === cat);
  });
  loadBookmarks();
}

async function loadBookmarks() {
  const q = searchInput.value.trim();
  const params = new URLSearchParams();
  if (activeCategory !== '전체') params.set('category', activeCategory);
  if (q) params.set('q', q);

  const res = await fetch(`/api/bookmarks?${params}`);
  const bookmarks = await res.json();

  bookmarkList.innerHTML = '';
  countLabel.textContent = `총 ${bookmarks.length}개`;

  if (bookmarks.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  bookmarks.forEach(b => {
    const li = document.createElement('li');
    li.className = 'bookmark-item';

    const faviconUrl = `https://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(b.url)}`;

    li.innerHTML = `
      <img class="bookmark-favicon" src="${faviconUrl}" alt="" onerror="this.style.display='none'" />
      <div class="bookmark-info">
        <div class="bookmark-title">${escapeHtml(b.title)}</div>
        <a class="bookmark-url" href="${escapeHtml(b.url)}" target="_blank" rel="noopener">${escapeHtml(b.url)}</a>
      </div>
      <span class="bookmark-category">${escapeHtml(b.category)}</span>
      <div class="bookmark-actions">
        <button class="btn-edit" data-id="${b.id}">수정</button>
        <button class="btn-delete" data-id="${b.id}">삭제</button>
      </div>
    `;

    li.querySelector('.btn-edit').addEventListener('click', () => startEdit(b));
    li.querySelector('.btn-delete').addEventListener('click', () => showDeleteConfirm(li, b.id));

    bookmarkList.appendChild(li);
  });
}

function startEdit(b) {
  formTitle.textContent = '북마크 수정';
  editIdInput.value = b.id;
  urlInput.value = b.url;
  titleInput.value = b.title;
  categoryInput.value = b.category;
  submitBtn.textContent = '저장';
  cancelBtn.classList.remove('hidden');
  urlInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  form.reset();
  editIdInput.value = '';
  formTitle.textContent = '북마크 추가';
  submitBtn.textContent = '추가';
  cancelBtn.classList.add('hidden');
  setUrlError('');
  clearDuplicate();
}

function showDeleteConfirm(li, id) {
  const actions = li.querySelector('.bookmark-actions');
  actions.classList.add('hidden');

  const confirm = document.createElement('div');
  confirm.className = 'delete-confirm';
  confirm.innerHTML = `
    <span>삭제하시겠습니까?</span>
    <button class="btn-confirm-delete">삭제</button>
    <button class="btn-cancel-delete">취소</button>
  `;

  confirm.querySelector('.btn-confirm-delete').addEventListener('click', async () => {
    await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' });
    showToast('북마크가 삭제되었습니다.');
    await fetchCategories();
    await loadBookmarks();
  });

  confirm.querySelector('.btn-cancel-delete').addEventListener('click', () => {
    confirm.remove();
    actions.classList.remove('hidden');
  });

  li.appendChild(confirm);
}

function validateUrl(val) {
  if (!val) return '';
  try {
    const url = new URL(val);
    if (!['http:', 'https:'].includes(url.protocol)) return '유효하지 않은 URL 형식입니다.';
    if (!url.hostname.includes('.')) return '올바른 도메인을 입력해 주세요.';
    return '';
  } catch {
    return '유효하지 않은 URL 형식입니다.';
  }
}

function clearDuplicate() {
  urlDuplicate.classList.add('hidden');
  urlDuplicate.innerHTML = '';
}

async function checkDuplicate(urlVal) {
  clearDuplicate();
  const currentEditId = editIdInput.value;
  const res = await fetch(`/api/bookmarks/check?url=${encodeURIComponent(urlVal)}`);
  const existing = await res.json();
  if (!existing || existing.id === currentEditId) return;

  urlDuplicate.innerHTML = `
    <div class="url-duplicate-info">
      이미 저장된 북마크입니다.<br>
      <strong>${escapeHtml(existing.title)}</strong> · ${escapeHtml(existing.category)}
    </div>
    <div class="url-duplicate-actions">
      <button class="btn-overwrite" type="button">덮어쓰기</button>
      <button class="btn-keep" type="button">유지</button>
    </div>
  `;
  urlDuplicate.classList.remove('hidden');

  urlDuplicate.querySelector('.btn-overwrite').addEventListener('click', () => {
    editIdInput.value = existing.id;
    titleInput.value = existing.title;
    categoryInput.value = existing.category;
    formTitle.textContent = '북마크 수정';
    submitBtn.textContent = '저장';
    cancelBtn.classList.remove('hidden');
    clearDuplicate();
    titleInput.focus();
  });

  urlDuplicate.querySelector('.btn-keep').addEventListener('click', () => {
    clearDuplicate();
    urlInput.focus();
  });
}

function setUrlError(msg) {
  if (msg) {
    urlInput.classList.add('input-error');
    urlError.textContent = msg;
    urlError.classList.remove('hidden');
  } else {
    urlInput.classList.remove('input-error');
    urlError.classList.add('hidden');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = editIdInput.value;
  let urlVal = urlInput.value.trim();
  if (urlVal && !/^https?:\/\//i.test(urlVal)) urlVal = 'https://' + urlVal;

  const errMsg = validateUrl(urlVal);
  if (errMsg) {
    setUrlError(errMsg);
    urlInput.focus();
    return;
  }
  setUrlError('');

  const body = {
    url: urlVal,
    title: titleInput.value.trim(),
    category: categoryInput.value.trim() || '미분류',
  };

  if (id) {
    await fetch(`/api/bookmarks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    showToast('북마크가 수정되었습니다.');
  } else {
    await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    showToast('북마크가 추가되었습니다.');
  }

  resetForm();
  await fetchCategories();
  await loadBookmarks();
});

cancelBtn.addEventListener('click', resetForm);

categoryInput.addEventListener('focus', () => renderDropdown(categoryInput.value));
categoryInput.addEventListener('input', () => renderDropdown(categoryInput.value));
categoryInput.addEventListener('blur', () => setTimeout(closeDropdown, 150));

categoryInput.addEventListener('keydown', (e) => {
  const items = categoryDropdown.querySelectorAll('li');
  if (categoryDropdown.classList.contains('hidden') || items.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    dropdownActiveIndex = Math.min(dropdownActiveIndex + 1, items.length - 1);
    updateActiveItem();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    dropdownActiveIndex = Math.max(dropdownActiveIndex - 1, -1);
    updateActiveItem();
  } else if (e.key === 'Enter' && dropdownActiveIndex >= 0) {
    e.preventDefault();
    categoryInput.value = items[dropdownActiveIndex].dataset.value;
    closeDropdown();
  } else if (e.key === 'Escape') {
    closeDropdown();
  }
});

urlInput.addEventListener('blur', () => {
  let val = urlInput.value.trim();
  if (val && !/^https?:\/\//i.test(val)) {
    val = 'https://' + val;
    urlInput.value = val;
  }
  const errMsg = validateUrl(val);
  setUrlError(errMsg);
  if (!errMsg && val) checkDuplicate(val);
});

urlInput.addEventListener('input', () => {
  if (urlInput.classList.contains('input-error')) {
    setUrlError(validateUrl(urlInput.value.trim()));
  }
});

searchInput.addEventListener('input', loadBookmarks);

categoryFilter.querySelector('[data-category="전체"]').addEventListener('click', () => setCategory('전체'));

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

fetchCategories().then(loadBookmarks);
