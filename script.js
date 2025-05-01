const users = {
    1111: "1111",
    2222: "2222",
    3333: "3333",
    4444: "5555"
};

let couples = [];
let chicks = [];
let currentLanguage = 'ar';

const translations = {
    ar: {
        loginTitle: "تسجيل الدخول",
        usernamePlaceholder: "اسم المستخدم",
        passwordPlaceholder: "كلمة المرور",
        loginButton: "دخول",
        dashboardTitle: "لوحة التحكم",
        noEggsTitle: "الأزواج بدون بيض",
        withEggsTitle: "الأزواج مع بيض",
        withTreatmentTitle: "الأزواج مع علاج",
        withEggsTreatmentTitle: "الأزواج مع بيض وعلاج",
        chicksTitle: "الفراخ تحت المراقبة",
        addButton: "➕ إضافة زوج جديد",
        error: "اسم المستخدم أو كلمة المرور خاطئة!",
    },
    hi: {
        loginTitle: "लॉगिन करें",
        usernamePlaceholder: "उपयोगकर्ता नाम",
        passwordPlaceholder: "पासवर्ड",
        loginButton: "लॉगिन",
        dashboardTitle: "डैशबोर्ड",
        noEggsTitle: "बिना अंडे वाले जोड़े",
        withEggsTitle: "अंडे वाले जोड़े",
        withTreatmentTitle: "इलाज वाले जोड़े",
        withEggsTreatmentTitle: "अंडे और इलाज वाले जोड़े",
        chicksTitle: "निरीक्षण के तहत चूजे",
        addButton: "➕ नया जोड़ा जोड़ें",
        error: "उपयोगकर्ता नाम या पासवर्ड गलत है!",
    }
};

function selectLanguage(lang) {
    currentLanguage = lang;
    document.getElementById("language-selection").style.display = "none";
    document.getElementById("login-section").style.display = "block";
    translatePage();
}

function translatePage() {
    const t = translations[currentLanguage];
    document.getElementById("login-title").innerText = t.loginTitle;
    document.getElementById("username").placeholder = t.usernamePlaceholder;
    document.getElementById("password").placeholder = t.passwordPlaceholder;
    document.getElementById("login-button").innerText = t.loginButton;
    document.getElementById("dashboard-title").innerText = t.dashboardTitle;
}

function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    if (users[user] === pass) {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        loadCouples(); // تحميل الأزواج بعد تسجيل الدخول
    } else {
        document.getElementById("error-message").innerText = translations[currentLanguage].error;
    }
}

// تحميل الأزواج من الـ Backend
function loadCouples() {
    fetch('/get-couples')
        .then(response => response.json())
        .then(data => {
            couples = data;
            renderTables();  // عرض الأزواج في الجداول
        });
}

// عرض الأزواج في الجداول
function renderTables() {
    document.getElementById("no-eggs-table").innerHTML = renderRows(couples.filter(c => c.egg_count === 0 && !c.treatment));
    document.getElementById("with-eggs-table").innerHTML = renderRows(couples.filter(c => c.egg_count > 0 && !c.treatment));
    document.getElementById("with-treatment-table").innerHTML = renderRows(couples.filter(c => c.treatment && c.egg_count === 0));
    document.getElementById("with-eggs-treatment-table").innerHTML = renderRows(couples.filter(c => c.treatment && c.egg_count > 0));
    document.getElementById("chicks-table").innerHTML = renderChicks();
}

// عرض البيانات في الجداول
function renderRows(data) {
    const t = translations[currentLanguage];
    let rows = `<tr><th>${t.number}</th><th>${t.cage}</th><th>${t.eggs}</th><th>${t.hatchDays}</th><th>${t.treatment}</th><th>${t.treatmentDays}</th><th>${t.successfulHatches}</th><th>${t.edit}</th><th>${t.delete}</th></tr>`;
    data.forEach((c, index) => {
        rows += `<tr>
                    <td>${c.couple_id}</td>
                    <td>${c.cage}</td>
                    <td>${c.egg_count}</td>
                    <td>${c.hatch_date}</td>
                    <td>${c.treatment || '-'}</td>
                    <td>${c.treatment_days || '-'}</td>
                    <td>${c.successful_hatches}</td>
                    <td><button onclick="editRecord(${index})">${t.edit}</button></td>
                    <td><button onclick="deleteRecord(${index})">${t.delete}</button></td>
                </tr>`;
    });
    return rows;
}

// عرض الفراخ
function renderChicks() {
    const t = translations[currentLanguage];
    let rows = `<tr><th>${t.chickHatchDate}</th><th>${t.chickAge}</th></tr>`;
    chicks.forEach(ch => {
        let daysOld = calculateDays(new Date(ch.hatch_date));
        rows += `<tr><td>${ch.hatch_date}</td><td>${daysOld}</td></tr>`;
    });
    return rows;
}

function calculateDays(date) {
    let today = new Date();
    let diffTime = today - date;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// إضافة زوج جديد
function addNewRecord() {
    let couple = {
        coupleId: prompt("رقم الزوج:"),
        eggCount: parseInt(prompt("عدد البيض:"), 10),
        treatment: prompt("اسم العلاج (أو اتركه فارغ):"),
        treatmentStart: new Date(),
        treatmentDays: prompt("مدة التحريم بالأيام:"),
        hatchDate: new Date()
    };

    fetch('/add-couple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couple)
    })
    .then(response => response.json())
    .then(() => {
        loadCouples();  // إعادة تحميل الأزواج
    });
}

// تعديل زوج
function editRecord(index) {
    let c = couples[index];
    c.coupleId = prompt("رقم الزوج:", c.coupleId);
    c.eggCount = parseInt(prompt("عدد البيض:", c.eggCount), 10);
    c.treatment = prompt("اسم العلاج:", c.treatment);
    c.treatmentDays = parseInt(prompt("مدة التحريم بالأيام:", c.treatmentDays), 10);
    
    fetch(`/update-couple/${c.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c)
    })
    .then(response => response.json())
    .then(() => {
        loadCouples();  // إعادة تحميل الأزواج بعد التعديل
    });
}

// حذف زوج
function deleteRecord(index) {
    const couple = couples[index];
    fetch(`/delete-couple/${couple.id}`, {
        method: 'DELETE'
    })
    .then(() => {
        loadCouples();  // إعادة تحميل الأزواج بعد الحذف
    });
}
