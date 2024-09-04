const secret = document.getElementById('secret');

secret.addEventListener('click', () => {
    const password = document.getElementById('password');
    if (password.type === 'password') {
        password.type = 'text';
        secret.src = '../../images/eye-slash.svg';
    } else {
        password.type = 'password';
        secret.src = '../../images/eye.svg';
    }
})

document.getElementById('loginForm').addEventListener('submit', function(event) {
    let isValid = true;
    const inputWrappers = this.querySelectorAll('.login-input-wrapper');

    inputWrappers.forEach(wrapper => {
        const input = wrapper.querySelector('input');
        if (!input.value) {
            isValid = false;
            wrapper.classList.add('input-error'); 
            input.addEventListener('focus', function () {
                wrapper.classList.remove('input-error')
            }); 
        } 
    });

    if (!isValid) {
        event.preventDefault(); 
    }
});