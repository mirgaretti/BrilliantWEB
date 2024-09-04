const socket = io();

socket.emit('alert'); 

socket.on('alert', (alert) => {
    console.log(alert);
    const sos = document.querySelectorAll('.sos');
    sos.forEach(s => {
        s.style.display = 'none';
    })
    alert.forEach(a => {
        document.getElementById(a).style.display = 'block';
    })
});

window.addEventListener('load',updateURL);

function updateURL() {
    const url = new URL(window.location.href);
    const type = url.searchParams.get('type');
    if (type) {
        url.searchParams.delete('type');
        window.history.replaceState({}, document.title, url);
        displayNotification(type);
    }
}

function displayNotification(type) {
    const alarm = document.getElementById(type); 
    alarm.classList.add('visible'); 

    setTimeout(() => {
        alarm.style.opacity = 0; 
        setTimeout(() => {
            alarm.classList.remove('visible'); 
        }, 500); 
    }, 1500); 
}

socket.on('signal', (signal) => {
    console.log(signal);
    const area = document.getElementById('signal');
    area.style.height = `${signal*5}px`;
});

socket.on('status', (status) => {
    console.log(status);
    const area = document.getElementById('signal');
    if (status == 'RSSI/SOS/GW/002/001') {
        area.style.display = 'block';
    } else if (status == 'RSSI/Cancel/GW/002/001') {
        area.style.display = 'none';
    }
});
