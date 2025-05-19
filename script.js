window.onload = loadAll;

// دالة مساعدة لجلب JSON
async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  return res.json();
}

// تحميل البيانات وعرضها
async function loadAll() {
  const couples = await fetchJSON('/get-couples');
  const chicks  = await fetchJSON('/get-chicks');
  renderCouples(couples);
  renderChicks(chicks);
}

// عرض قائمة الأزواج
function renderCouples(data) {
  const tbl = document.getElementById('no-eggs-table');
  // رأس الجدول
  let html = `
    <tr>
      <th>رقم الزوج</th>
      <th>البيض</th>
      <th>مدة العلاج (أيام)</th>
      <th>حذف</th>
    </tr>`;
  // الصفوف
  data.forEach(r => {
    const cls = r.status === 'treatment'
              ? 'red'
              : r.status === 'eggs'
              ? 'green'
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

// عرض جدول الفراخ
function renderChicks(data) {
  const tbl = document.getElementById('chicks-table');
  // رأس الجدول
  let html = `
    <tr>
      <th>ID</th>
      <th>تاريخ الفقس</th>
      <th>منذ الفقس (أيام)</th>
    </tr>`;
  // الصفوف
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

// إضافة زوج جديد
function addCouple() {
  const id   = prompt('رقم الزوج');
  const eggs = +prompt('عدد البيض');
  const days = +prompt('مدة العلاج (أيام)');
  fetchJSON('/add-couple', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ coupleId: id, eggCount: eggs, treatmentDays: days })
  }).then(loadAll);
}

// حذف زوج
function del(id) {
  if (!confirm('تأكيد الحذف؟')) return;
  fetchJSON(`/delete-couple/${id}`, { method: 'DELETE' })
    .then(loadAll);
}
