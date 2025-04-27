// بيانات تسجيل الدخول
const users = {
    user1: "1111",
    user2: "2222",
    user3: "3333",
    user4: "4444",
    user5: "5555"
};

// بيانات الأزواج والفراخ
let couples = [];
let chicks = [];
let currentLanguage = 'ar';

// ترجمات
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
        number: "رقم الزوج",
        cage: "رقم الخانة",
        eggs: "عدد البيض",
        hatchDays: "الأيام للتفقيس",
        treatment: "العلاج",
        treatmentDays: "مدة التحريم",
        successfulHatches: "الإنتاجات",
        edit: "✏️ تعديل",
        delete: "🗑️ حذف",
        chickHatchDate: "تاريخ الفقس",
        chickAge: "عمر الفرخ بالأيام"
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
        number: "जोड़े का नंबर",
        cage: "पिंजरे का नंबर",
        eggs: "अंडों की संख्या",
        hatchDays: "हैचिंग तक दिन",
        treatment: "उपचार",
        treatmentDays: "निषेध अवधि",
        successfulHatches: "सफल हैचिंग",
        edit: "✏️ संपादित करें",
        delete: "🗑️ हटाएँ",
        chickHatchDate: "फूटने की तारीख",
        chickAge: "चूजे की उम्र (दिनों में)"
    }
};

// اختيار اللغة
function selectLanguage(lang) {
    currentLanguage = lang;
    document.getElementById("language-selection").style.display = "none";
    document.getElementById("login-section").style.display = "block";
    translatePage();
}

// ترجمة الصفحة حسب اللغة
function translatePage() {
    const t = translations[currentLanguage];
    document.getElementById("login-title").innerText = t.loginTitle;
    document.getElementById("username").placeholder = t.usernamePlaceholder;
    document.getElementById("password").placeholder = t.passwordPlaceholder;
    document.getElementById("login-button").innerText = t.loginButton;
    document.getElementById("dashboard-title").innerText = t.dashboardTitle;
    document.getElementById("no-eggs-title").innerText = t.noEggsTitle;
    document.getElementById("with-eggs-title").innerText = t.withEggsTitle;
    document.getElementById("with-treatment-title").innerText = t.withTreatmentTitle;
    document.getElementById("with-eggs-treatment-title").innerText = t.withEggsTreatmentTitle;
    document.getElementById("chicks-title").innerText = t.chicksTitle;
    document.getElementById("add-button").innerText = t.addButton;
}

// تسجيل الدخول
function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    if (users[user] === pass) {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        renderTables();
    } else {
        document.getElementById("error-message").innerText = translations[currentLanguage].error;
    }
}

// عرض الجداول
function renderTables() {
    document.getElementById("no-eggs-table").innerHTML = renderRows(couples.filter(c => c.eggs === 0 && !c.treatment));
    document.getElementById("with-eggs-table").innerHTML = renderRows(couples.filter(c => c.eggs > 0 && !c.treatment));
    document.getElementById("with-treatment-table").innerHTML = renderRows(couples.filter(c => c.treatment && c.eggs === 0));
    document.getElementById("with-eggs-treatment-table").innerHTML = renderRows(couples.filter(c => c.treatment && c.eggs > 0));
    document.getElementById("chicks-table").innerHTML = renderChicks();
}

function renderRows(data) {
    const t = translations[currentLanguage];
    let rows = `<tr><th>${t.number}</th><th>${t.cage}</th><th>${t.eggs}</th><th>${t.hatchDays}</th><th>${t.treatment}</th><th>${t.treatmentDays}</th><th>${t.successfulHatches}</th><th>${t.edit}</th><th>${t.delete}</th></tr>`;
    data.forEach((c, index) => {
        let today = new Date();
        let treatmentEnd = new Date(c.treatmentDate);
        treatmentEnd.setDate(treatmentEnd.getDate() + c.treatmentDays);
        let className = (c.treatment && today < treatmentEnd) ? "red" : "";

        rows += `<tr class="${className}">
            <td>${c.number}</td>
            <td>${c.cage}</td>
            <td>${c.eggs}</td>
            <td>${c.hatchDays}</td>
            <td>${c.treatment || '-'}</td>
            <td>${c.treatmentDays || '-'}</td>
            <td>${c.successfulHatches}</td>
            <td><button onclick="editRecord(${index})">${t.edit}</button></td>
            <td><button onclick="deleteRecord(${index})">${t.delete}</button></td>
        </tr>`;
    });
    return rows;
}

function renderChicks() {
    const t = translations[currentLanguage];
    let rows = `<tr><th>${t.chickHatchDate}</th><th>${t.chickAge}</th></tr>`;
    chicks.forEach(ch => {
        let daysOld = calculateDays(new Date(ch.hatchDate));
        let className = daysOld >= 18 ? "green" : "";
        rows += `<tr class="${className}">
            <td>${ch.hatchDate}</td>
            <td>${daysOld}</td>
        </tr>`;
    });
    return rows;
}

function calculateDays(date) {
    let today = new Date();
    let diffTime = today - date;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function addNewRecord() {
    let number = prompt("رقم الزوج:");
    let cage = prompt("رقم الخانة:");
    let eggs = parseInt(prompt("عدد البيض:"), 10);
    let hatchDays = parseInt(prompt("عدد الأيام المتبقية للتفقيس:"), 10);
    let treatment = prompt("اسم العلاج (أو اتركه فارغ):");
    let treatmentDays = treatment ? parseInt(prompt("مدة التحريم بالأيام:"), 10) : 0;
    let successfulHatches = parseInt(prompt("عدد الإنتاجات الناجحة:"), 10);

    couples.push({
        number,
        cage,
        eggs,
        hatchDays,
        treatment,
        treatmentDays,
        treatmentDate: new Date(),
        successfulHatches
    });

    if (eggs > 0) {
        chicks.push({
            hatchDate: new Date()
        });
    }

    renderTables();
}

function editRecord(index) {
    let c = couples[index];
    c.number = prompt("رقم الزوج:", c.number);
    c.cage = prompt("رقم الخانة:", c.cage);
    c.eggs = parseInt(prompt("عدد البيض:", c.eggs), 10);
    c.hatchDays = parseInt(prompt("عدد الأيام المتبقية للتفقيس:", c.hatchDays), 10);
    c.treatment = prompt("اسم العلاج (أو فارغ إذا مافي):", c.treatment);
    c.treatmentDays = c.treatment ? parseInt(prompt("مدة التحريم بالأيام:", c.treatmentDays), 10) : 0;
    c.successfulHatches = parseInt(prompt("عدد الإنتاجات الناجحة:", c.successfulHatches), 10);
    if (!c.treatment) {
        c.treatmentDays = 0;
    }
    renderTables();
}

function deleteRecord(index) {
    if (confirm("هل أنت متأكد أنك تريد حذف هذا الزوج؟")) {
        couples.splice(index, 1);
        renderTables();
    }
}
