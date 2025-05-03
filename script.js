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

// تحميل بيانات الأزواج
function loadCouples() {
    fetch('/get-couples')
        .then(res => res.json())
        .then(data => {
            const noEggs = data.filter(c => c.status === 'no_eggs');
            const withEggs = data.filter(c => c.status === 'eggs');
            const underTreatment = data.filter(c => c.status === 'treatment');

            document.getElementById('no-eggs-table').innerHTML = renderCouples(noEggs);
            document.getElementById('with-eggs-table').innerHTML = renderCouples(withEggs);
            document.getElementById('with-treatment-table').innerHTML = renderCouples(underTreatment);
        });

    fetch('/get-chicks')
        .then(res => res.json())
        .then(data => {
            document.getElementById('chicks-table').innerHTML = renderChicks(data);
        });
}

// توليد صفوف جدول الأزواج
function renderCouples(couples) {
    let html = `<tr><th>رقم الزوج</th><th>البيض</th><th>العلاج</th><th>تاريخ الفقس</th><th>العد التنازلي</th></tr>`;
    couples.forEach(c => {
        const daysLeft = c.hatch_date ? calcDaysLeft(c.hatch_date) : '-';
        const color = c.status === 'treatment' ? 'red' : (c.status === 'eggs' ? 'green' : '');
        html += `
            <tr class="${color}">
                <td>${c.couple_id}</td>
                <td>${c.egg_count}</td>
                <td>${c.treatment || '-'}</td>
                <td>${c.hatch_date || '-'}</td>
                <td>${daysLeft}</td>
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

// تشغيل عند تحميل الصفحة
window.onload = loadCouples;
