// تسجيل الدخول
document.getElementById('login-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    }).then(response => {
        if (response.status === 200) {
            window.location.href = '/dashboard';
        } else {
            document.getElementById('error-message').innerText = "اسم المستخدم أو كلمة المرور غير صحيحة!";
        }
    });
});

// إضافة زوج جديد
function addCouple() {
    const coupleId = prompt("رقم الزوج:");
    const eggCount = parseInt(prompt("عدد البيض:")) || 0;
    const treatment = prompt("اسم العلاج (إن وجد):");
    const treatmentDays = treatment ? parseInt(prompt("مدة العلاج (أيام):")) : null;

    const data = {
        coupleId,
        eggCount,
        treatment,
        treatmentDays
    };

    fetch('/add-couple', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(() => loadCouples());
}

// حذف زوج
function deleteCouple(id) {
    if (!confirm('هل تريد حذف هذا الزوج؟')) return;

    fetch(`/delete-couple/${id}`, {
        method: 'DELETE'
    })
    .then(res => {
        if (!res.ok) throw new Error('فشل في الحذف');
        loadCouples();
    })
    .catch(err => alert(err.message));
}

// تحميل بيانات الأزواج
function loadCouples() {
    fetch('/get-couples')
        .then(res => res.json())
        .then(data => {
            const sorted = data.sort((a, b) => parseInt(a.couple_id) - parseInt(b.couple_id));
            document.getElementById('no-eggs-table').innerHTML = renderCouples(sorted);
        });

    fetch('/get-chicks')
        .then(res => res.json())
        .then(data => {
            document.getElementById('chicks-table').innerHTML = renderChicks(data);
        });
}

// توليد صفوف جدول الأزواج
function renderCouples(couples) {
    let html = `<tr><th>رقم الزوج</th><th>البيض</th><th>العلاج</th><th>تاريخ الفقس</th><th>العد التنازلي</th><th>حذف</th></tr>`;
    couples.forEach(c => {
        const daysLeft = c.hatch_date ? calcDaysLeft(c.hatch_date) : '-';
        const color = c.status === 'treatment' ? 'red' : (c.status === 'eggs' ? 'green' : '');
        html += `
            <tr style="background-color: ${color};">
                <td>${c.couple_id}</td>
                <td>${c.egg_count}</td>
                <td>${c.treatment || '-'}</td>
                <td>${c.hatch_date || '-'}</td>
                <td>${daysLeft}</td>
                <td><button onclick="deleteCouple(${c.id})">🗑</button></td>
            </tr>
        `;
    });
    return html;
}

// جدول الفراخ
function renderChicks(chicks) {
    let html = `<tr><th>رقم الزوج</th><th>تاريخ الفقس</th><th>مر على الفقس</th><th>العد التنازلي للذبح</th></tr>`;
    chicks.forEach(c => {
        html += `
            <tr>
                <td>${c.couple_id}</td>
                <td>${c.hatch_date}</td>
                <td>${c.days_since_hatch} يوم</td>
                <td>${c.days_until_slaughter} يوم</td>
            </tr>
        `;
    });
    return html;
}

// حساب الأيام المتبقية للفقس
function calcDaysLeft(hatchDate) {
    const now = new Date();
    const target = new Date(hatchDate);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? `${diff} يوم` : 'فقس';
}

// تحميل البيانات عند بداية الصفحة
window.onload = loadCouples;
