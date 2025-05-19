async function fetchJSON(url, opts) {
    const res = await fetch(url, opts);
    return res.json();
  }
  
  function renderCouples(data) {
    const tbl = document.getElementById('no-eggs-table');
    const html = data.map(r=>{
      const cls = r.status==='treatment'? 'red'
                : r.status==='eggs'? 'green'
                : '';
      return `<tr class="${cls}">
        <td>${r.couple_id}</td>
        <td>${r.egg_count}</td>
        <td>${r.treatment_days}</td>
        <td>
          <button onclick="del(${r.id})">🗑</button>
        </td>
      </tr>`;
    }).join('');
    tbl.innerHTML = `<tr>
      <th>رقم الزوج</th><th>البيض</th><th>العلاج (أيام)</th><th>حذف</th>
    </tr>` + html;
  }
  
  function renderChicks(data) {
    const tbl = document.getElementById('chicks-table');
    const html = data.map(r=>`
      <tr>
        <td>${r.id}</td><td>${r.hatch_date}</td><td>${r.days_since_hatch}</td>
      </tr>
    `).join('');
    tbl.innerHTML = `<tr>
      <th>ID</th><th>تاريخ الفقس</th><th>منذ الفقس (أيام)</th>
    </tr>` + html;
  }
  
  async function loadAll() {
    const couples = await fetchJSON('/get-couples');
    const chicks  = await fetchJSON('/get-chicks');
    renderCouples(couples);
    renderChicks(chicks);
  }
  
  function addCouple() {
    const id = prompt('رقم الزوج');
    const eggs = +prompt('عدد البيض');
    const days = +prompt('مدة العلاج');
    fetchJSON('/add-couple', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ coupleId:id, eggCount:eggs, treatmentDays:days })
    }).then(loadAll);
  }
  
  function del(id) {
    fetchJSON(`/delete-couple/${id}`,{ method:'DELETE' })
      .then(loadAll);
  }
  
  window.onload = loadAll;
  