const loginModal = document.getElementById('loginModal');
const mainModal = document.getElementById('loginRegisterModal');
const registerModal = document.getElementById('registerModal');
const formLogin = document.getElementById('formLogin');
const formRegister = document.getElementById('formRegister');

function toggleLoginModal() {
    clearErrors();
    clearInputs();
    if (mainModal.classList.contains("hidden")) {
        mainModal.classList.remove("hidden");
        registerModal.classList.add("hidden");
    } else {
        mainModal.classList.add("hidden");
        registerModal.classList.add('hidden');
        if (loginModal.classList.contains('hidden')) {
            loginModal.classList.remove('hidden');
        }
    }
}

function toggleRegisterModal() {
    clearErrors();
    clearInputs();
    if (registerModal.classList.contains("hidden")) {
        registerModal.classList.remove("hidden");
        loginModal.classList.add("hidden");
    } else {
        registerModal.classList.add("hidden");
        loginModal.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    formLogin.onsubmit = (event) => {
        event.preventDefault(); // Impede o envio do formulário
        if (!validateLoginData()) {
            return;
        }
        formLogin.submit();
    };
    formRegister.onsubmit = (event) => {
        event.preventDefault(); // Impede o envio do formulário
        if (!validateRegisterData()) {
            return;
        };
        formRegister.submit();
    };
});

function validateLoginData() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    let valid = true;
    if (!validateEmail(email) || password.length <= 8) {
        showError('loginError', 'Email ou senha inválidos.')
        valid = false;
    }
    return valid;
}

function validateRegisterData() {
    const email = document.getElementById('registerEmail').value;
    const cpf = document.getElementById('cpf').value;
    const name = document.getElementById('name').value;
    const birthdate = document.getElementById('birthdate').value;
    const phone = document.getElementById('phoneNumber').value;
    const password = document.getElementById('registerPassword').value;
    let valid = true;
    // Validação de email
    if (!validateEmail(email)) {
        showError('registerEmailError', 'Email inválido.');
        valid = false;
    }
    // Validação de CPF
    if (!validateCpf(cpf)) {
        showError('cpfError', 'Número de CPF inválido.');
        valid = false;
    }
    // Validação de nome
    if (name.length <= 3) {
        showError('nameError', 'Nome inválido. O nome deve ter pelo menos 3 caracteres.');
        valid = false;
    }
    // Validação de data de nascimento
    if (!validateBirthdate(birthdate)) {
        showError('birthdateError', 'Data de nascimento inválida.');
        valid = false;
    }
    // Validação de telefone
    if (!validatePhone(phone)) {
        showError('phoneError', 'Número de telefone inválido.');
        valid = false;
    }
    // Validação de senha
    if (!validatePassword(password)) {
        showError('registerPasswordError', 'Senha inválida. A senha deve ter letras maiúsculas, minúsculas, números e caracteres especiais.');
        valid = false;
    }
    return valid;
}

function showError(elementId, message) {
    document.getElementById(elementId).textContent = message;
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => element.textContent = '');
}

function clearInputs() {
    // Seleciona todos os inputs do formulário
    const registerInputs = document.querySelectorAll('#formRegister input');
    const loginInputs = document.querySelectorAll('#formLogin input');
    // Itera sobre os inputs e limpa seus valores
    registerInputs.forEach(input => {
        input.value = '';
    });

    loginInputs.forEach(input => {
        input.value = '';
    });
}

// Função para validar email
function validateEmail(email) {
    if (email.length == 0) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Função para validar a senha ((?=.*[a-z]): Garante que há pelo menos uma letra minúscula.
// (?=.*[A-Z]): Garante que há pelo menos uma letra maiúscula.
// (?=.*\d): Garante que há pelo menos um número (qualquer dígito de 0-9).
// (?=.*[\W_]): Garante que há pelo menos um caractere especial (qualquer coisa que não seja uma letra ou número, incluindo underscore _).
// .{8,}: Garante que a senha tenha pelo menos 8 caracteres de comprimento.)
function validatePassword(password) {
    if (password.length < 8) return false;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
}

function validateBirthdate(birthdate) {
    if (birthdate.length == 0) return false;
    // Verifica se a data está em um formato válido (dd/mm/yyyy)
    // const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    // return dateRegex.test(birthdate);
    return true;
}

function validatePhone(phone) {
    if (phone.length < 11) return false;
    return true;
    // Verifica se o telefone contém DDD e 9 dígitos
    // const phoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
    // return phoneRegex.test(phone);
}

function validateCpf(cpf) {
    if (cpf.length != 11) return false;
    let sum;
    let remainder;
    sum = 0;
    if (cpf === "00000000000") return false;
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}