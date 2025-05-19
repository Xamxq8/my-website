window.onload = loadAll;

// helper to fetch JSON
async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  return res.json();
}

// load & render data
async function loadAll() {
  const couples = await fetchJSON('/get-couples');
  const chicks  = await fetchJSON('/get-chicks');
  renderCouples(couples);
  renderChicks(chicks);
}

// render couples table
function renderCouples(data) {
  const tbl = document.getElementById('no-eggs-table');
  let html = `
    <tr>
      <th>رقم الزوج</th>
      <th>البيض</th>
      <th>مدة العلاج (أيام)</th>
      <th>حذف</th>
    </tr>`;
  data.forEach(r => {
    const cls = r.status === 'treatment' ? 'red'
              : r.status === 'eggs'      ? 'green'
              : '';
    html += `
      <tr class="${cls}">
        <td>${r.couple_id}</td>
        <td>${r.egg_count}</td>
        <td>${r.treatment_days}</td>
        <td><button onclick="del(${r.id})">🗑</button></td>
      </tr>`;
  });
  tbl.innerHTML = html;
}

// render chicks table
function renderChicks(data) {
  const tbl = document.getElementById('chicks-table');
  let html = `
    <tr>
      <th>ID</th>
      <th>تاريخ الفقس</th>
      <th>منذ الفقس (أيام)</th>
    </tr>`;
  data.forEach(r => {
    html += `
      <tr>
        <td>${r.id}</td>
        <td>${r.hatch_date}</td>
        <td>${r.days_since_hatch}</td>
      </tr>`;
  });
  tbl.innerHTML = html;
}

// add new couple
function addCouple() {
  const id   = prompt('رقم الزوج');
  const eggs = +prompt('عدد البيض');
  const days = +prompt('مدة العلاج (أيام)');
  fetchJSON('/add-couple', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ coupleId: id, eggCount: eggs, treatmentDays: days })
  }).then(loadAll);
}

// delete a couple
function del(id) {
  if (!confirm('تأكيد الحذف؟')) return;
  fetchJSON(`/delete-couple/${id}`, { method: 'DELETE' })
    .then(loadAll);
}
