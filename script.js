// التحقق من بيانات تسجيل الدخول
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // إرسال بيانات تسجيل الدخول إلى السيرفر
  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(response => {
    if (response.status === 200) {
      document.getElementById("login-section").style.display = "none";
      document.getElementById("dashboard").style.display = "block";
      loadCouples(); // تحميل الأزواج بعد تسجيل الدخول
    } else {
      document.getElementById("error-message").innerText = "اسم المستخدم أو كلمة المرور غير صحيحة!";
    }
  });
});

// تحميل الأزواج
function loadCouples() {
  fetch('/get-couples')
    .then(response => response.json())
    .then(data => {
      const tableBody = document.querySelector("#couplesTable tbody");
      tableBody.innerHTML = ""; // مسح البيانات السابقة
      data.forEach(couple => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${couple.couple_id}</td>
          <td>${couple.egg_count}</td>
          <td>${couple.treatment}</td>
          <td><button onclick="deleteCouple(${couple.id})">حذف</button></td>
        `;
        tableBody.appendChild(row);
      });
    });
}

// حذف زوج
function deleteCouple(id) {
  fetch(`/delete-couple/${id}`, { method: 'DELETE' })
    .then(() => {
      loadCouples(); // إعادة تحميل الأزواج بعد الحذف
    });
}

// إضافة زوج جديد
function addNewRecord() {
  const couple = {
    coupleId: prompt("رقم الزوج:"),
    eggCount: parseInt(prompt("عدد البيض:"), 10),
    treatment: prompt("اسم العلاج (أو اتركه فارغ):"),
    treatmentStart: new Date(),
    treatmentDays: parseInt(prompt("مدة العلاج بالأيام:"), 10),
    hatchDate: new Date()  // التاريخ سيتم تحديده تلقائيًا
  };

  fetch('/add-couple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(couple)
  })
  .then(() => {
    loadCouples();  // إعادة تحميل الأزواج بعد إضافة الزوج
  });
}

// تعديل الزوج
function editRecord(id) {
  const couple = {
    coupleId: prompt("رقم الزوج:"),
    eggCount: parseInt(prompt("عدد البيض:"), 10),
    treatment: prompt("اسم العلاج (أو اتركه فارغ):"),
    treatmentStart: new Date(),
    treatmentDays: parseInt(prompt("مدة العلاج بالأيام:"), 10),
    hatchDate: new Date()  // التاريخ سيتم تحديده تلقائيًا
  };

  fetch(`/update-couple/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(couple)
  })
  .then(() => {
    loadCouples();  // إعادة تحميل الأزواج بعد تعديل الزوج
  });
}
