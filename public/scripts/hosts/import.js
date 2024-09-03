async function ifFileExists(id) {
    try {
        const response = await fetch('/check-file/' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log(response);
        openImportConfirmModal(id, response.ok);
    } catch (error) {
        console.error('Произошла ошибка:', error);
    }
}

function openImportConfirmModal(id, fileexists) {
    const modal = document.getElementById('confirmationModal');
    const confirmationTextElement = document.getElementById('confirmationText');
    const confirmButton = document.getElementById('confirmButton');
    const cancelButton = document.getElementById('cancelButton');
    
    console.log(fileexists);
  
    if (fileexists) {
        modal.style.display = 'block';
        confirmationTextElement.textContent = 'Файл существует!';
        confirmButton.textContent = 'Импорт';
        cancelButton.textContent = 'Отмена';

        confirmButton.onclick = async function() {
            const response = await fetch('/import/' + id, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                window.location.href = '/staffPage?scope=main&import=true';
            } else {
                window.location.href = '/staffPage?scope=main&import=false';
            }
            modal.style.display = 'none';
        };
    
        cancelButton.onclick = function() {
            modal.style.display = 'none';
        };
    } else {
        modal.style.display = 'block';
        confirmationTextElement.textContent = 'Файл не найден!';
        confirmButton.textContent = 'Ок';
        cancelButton.textContent = 'Отмена';

        confirmButton.onclick = function() {
            modal.style.display = 'none';
        };
    
        cancelButton.onclick = function() {
            modal.style.display = 'none';
        };
    }
}