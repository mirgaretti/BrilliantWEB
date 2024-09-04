function openConfirmationModal(recordId, route, data, redirection, redirectParam, confirmText, confirmButtonText) {
    const modal = document.getElementById('confirmationModal');
    const overlay = document.getElementById('overlay');
    modal.style.display = 'block';
    overlay.style.display = 'block';
    
    const confirmButton = document.getElementById('confirmButton');
    const cancelButton = document.getElementById('cancelButton');
    const confirmTextElement = document.getElementById('confirmationText');
    confirmTextElement.textContent = confirmText;
    confirmButton.textContent = confirmButtonText;
    
    confirmButton.onclick = async function() {
        let response;
        if (data) {
            response = await fetch(route + '/' + recordId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch(route + '/' + recordId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        }
        const result = await response.json();
        const url = redirection + redirectParam + (result.success ? 'true' : 'false');
        window.location.href = url;
        modal.style.display = 'none';
        overlay.style.display = 'none';
    };

    cancelButton.onclick = function() {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    };
}