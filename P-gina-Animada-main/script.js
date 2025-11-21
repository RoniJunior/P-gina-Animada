const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// Forms
const signupForm = document.getElementById('signup-form');
const signinForm = document.getElementById('signin-form');

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message || 'Cadastro realizado com sucesso.');
                container.classList.remove('active');
            } else {
                alert(data.error || 'Erro no cadastro.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao comunicar com o servidor.');
        }
    });
}

if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message || 'Login bem-sucedido.');
                // TODO: redirect to protected page or set client session
            } else {
                alert(data.error || 'Credenciais inválidas.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao comunicar com o servidor.');
        }
    });
}