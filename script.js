document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.status === 200) {
            window.location.href = '/dashboard';  // الانتقال إلى لوحة التحكم
        } else {
            document.getElementById('error-message').innerText = "اسم المستخدم أو كلمة المرور غير صحيحة!";
        }
    });
});
