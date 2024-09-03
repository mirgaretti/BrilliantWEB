const host = document.getElementById('host');
const port = document.getElementById('port');
const username = document.getElementById('username');
const password = document.getElementById('password');

async function displayMQTT() {
    const response = await fetch('/getMqtt', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const result = await response.json();
    console.log(result);
    host.value = result.host;
    port.value = result.port;
    username.value = result.username;
    password.value = result.password.charAt(0) + '*****' + result.password.charAt(result.password.length - 1);
}

displayMQTT();

//=================================== Check MQTT 
const socket = io();
const statusMqtt = document.getElementById('status');
    
socket.on('mqtt_status', (status) => {
    statusMqtt.textContent = status;
});

const check = document.getElementById('check');

check.addEventListener('click', async function () {
    check.style.cursor = 'wait';
    const response = await fetch('/checkMqtt', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const result = await response.json();
    console.log(result);
    if (result.success) {
        let secondsPassed = 1;
        check.style.backgroundColor = 'green';
        check.disabled = 'true';
        check.style.opacity = '0.6';
        check.textContent = `Подключено (${secondsPassed}с)`;
        const timerInterval = setInterval(() => {
            secondsPassed++;
            check.textContent = `Подключено (${secondsPassed}с)`;
        }, 1000);

        setTimeout(() => {
            clearInterval(timerInterval);
            check.textContent = 'Проверить подключение';
            check.style.backgroundColor = '#285E9A';
            check.style.opacity = '1';
            check.style.cursor = 'pointer';
        }, 3000);
        check.disabled = false;
    } else {
        let secondsPassed = 1;
        check.style.backgroundColor = 'red';
        check.disabled = 'true';
        check.style.opacity = '0.6';
        check.textContent = `Ошибка подключения (${secondsPassed}с)`;
        const timerInterval = setInterval(() => {
            secondsPassed++;
            check.textContent = `Ошибка подключения (${secondsPassed}с)`;
        }, 1000);

        setTimeout(() => {
            clearInterval(timerInterval);
            check.textContent = 'Проверить подключение';
            check.style.backgroundColor = '#285E9A';
            check.style.opacity = '1';
            check.style.cursor = 'pointer';
        }, 3000);
        check.disabled = false;        
    }
})



