const $ = (id) => document.getElementById(id);

async function requestJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
}

function renderState(data) {
  $('keyword').textContent = data.keyword;
  $('score').textContent = data.score;
  $('usedCount').textContent = data.used_count;
  $('message').textContent = data.message || '';
}

function renderMatched(match) {
  const box = $('matched');
  if (!match) {
    box.classList.add('hidden');
    box.innerHTML = '';
    return;
  }
  box.classList.remove('hidden');
  box.innerHTML = `<strong>${match.line}</strong><br><span>${match.dynasty} · ${match.author}《${match.title}》</span>`;
}

async function loadLibrary(keyword) {
  const items = await requestJson(`/api/library?keyword=${encodeURIComponent(keyword || '')}`);
  $('library').innerHTML = items.slice(0, 8).map(item => (
    `<div class="poem-item"><strong>${item.line}</strong><span>${item.dynasty} · ${item.author}《${item.title}》</span></div>`
  )).join('') || '<p class="message">暂无参考诗句。</p>';
}

async function refresh() {
  const data = await requestJson('/api/state');
  renderState(data);
  loadLibrary(data.keyword);
}

$('submit').addEventListener('click', async () => {
  const answer = $('answer').value.trim();
  if (!answer) {
    $('message').textContent = '先写一句诗吧。';
    return;
  }
  const data = await requestJson('/api/answer', {
    method: 'POST',
    body: JSON.stringify({ answer }),
  });
  renderState(data);
  renderMatched(data.matched);
  if (data.ok) $('answer').value = '';
  loadLibrary(data.keyword);
});

$('hint').addEventListener('click', async () => {
  const data = await requestJson('/api/state');
  renderState({ ...data, message: `提示：${data.hint.masked} —— ${data.hint.dynasty} · ${data.hint.author}` });
});

$('newRound').addEventListener('click', async () => {
  const data = await requestJson('/api/new', { method: 'POST', body: JSON.stringify({}) });
  renderState(data);
  renderMatched(null);
  $('answer').value = '';
  loadLibrary(data.keyword);
});

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', async () => {
    const data = await requestJson('/api/new', {
      method: 'POST',
      body: JSON.stringify({ keyword: chip.dataset.keyword }),
    });
    renderState(data);
    renderMatched(null);
    $('answer').value = '';
    loadLibrary(data.keyword);
  });
});

$('answer').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) $('submit').click();
});

refresh();
