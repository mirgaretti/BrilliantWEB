window.checkConfirmationModal = async () => {
    const ipInput = document.getElementById('ip');
    const noticeIp = document.getElementById('noticeIp');
    const macInput = document.getElementById('mac');
    const noticeMac = document.getElementById('noticeMac');
    const nameInput = document.getElementById('name');
    const locationInput = document.getElementById('location');
    const ipAddressPattern = /^\d{1,3}(\.\d{1,3}){3}$/;
    const macAddressPattern = /^[a-zA-Z0-9]+$/;
    let isMatches = 1;
    if (!ipInput?.value?.match(ipAddressPattern)) {
        ipInput.classList.add('warning');
        ipInput.addEventListener('focus', function () {
            ipInput.classList.remove('warning');
        });
        isMatches = 0;
    }
    if ((macInput?.value?.length !== 12 || !macInput?.value?.match(macAddressPattern))) {
        macInput.classList.add('warning');
        macInput.addEventListener('focus', function () {
            macInput.classList.remove('warning');
        });
        isMatches = 0;
    }
    if (!nameInput.value.length) {
        nameInput.classList.add('warning');
        nameInput.addEventListener('focus', function () {
            nameInput.classList.remove('warning');
        });
        isMatches = 0;
    }
    if (!locationInput.value.length) {
        locationInput.classList.add('warning');
        locationInput.addEventListener('focus', function () {
            locationInput.classList.remove('warning');
        });
        isMatches = 0;
    }
    if (isMatches == 1) {
        let data = {};
        const inputs = document.querySelectorAll('.addHosts');
        inputs.forEach(input => {
            data[input.id] = input.value;
        });

        const response = await fetch('/checkHosts/0', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.ip === 'true' || result.mac === 'true') {
            if (result.ip == 'true') {
                ipInput.classList.add('warning');
                noticeIp.style.display = 'block';
                ipInput.addEventListener('focus', function () {
                    ipInput.classList.remove('warning');
                    noticeIp.style.display = 'none';
                });
            }
            if (result.mac == 'true') {
                macInput.classList.add('warning');
                noticeMac.style.display = 'block';
                macInput.addEventListener('focus', function () {
                    macInput.classList.remove('warning');
                    noticeMac.style.display = 'none';
                });
            }
        } else {
            console.log('success');
            openConfirmationModal('', '/addHosts', data, '/hostsPage', '?add=', 'Сохранить изменения?', 'Сохранить');
        }
    }
}

function updateCardfile(value) {
    const cardfile = document.getElementById('cardfile');
    cardfile.value = value + '.xml';
}