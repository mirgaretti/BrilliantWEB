const savePath = document.getElementById("savePath");
const filename = document.getElementById("filename");
const macAddressPattern = /^[a-zA-Z0-9]+$/;

savePath.addEventListener('click', async function() {
    if (filename.value == '' || !filename?.value?.match(macAddressPattern)) {
        filename.classList.add('warning');
        filename.addEventListener('focus', function() {
            filename.classList.remove('warning');
        })
    } else {
        savePath.style.cursor = 'wait';
        const response = await fetch('/download-xml', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename: filename.value })
        });
        const url = new URL(window.location.href);
        if (response.ok) {
            url.searchParams.set('export', 'true')
            window.history.replaceState({}, document.title, url);
        } else {
            url.searchParams.set('export', 'false')
            window.history.replaceState({}, document.title, url);
        }
        updateURL();
        filename.value = '';
        savePath.style.cursor = 'pointer';
    }
})
