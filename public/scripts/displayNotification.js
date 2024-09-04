function displayNotification(addResult, editResult, exportResult, importResult, deleteResult, pathResult) {
    console.log(addResult, editResult, exportResult, importResult, deleteResult, pathResult);
    console.log('hello');
    const notif = document.getElementById('notification');
    const notifText = document.getElementById('notificationText');
    if (addResult === 'true' || addResult === 'false') {
        notif.style.backgroundImage = addResult === 'true' ? 'url(../images/notification-success.svg)' :'url(../images/notification-error.svg)';
        notifText.textContent = addResult === 'true' ? 'Новая запись успешно добавлена' : 'Ошибка добавления новой записи';
    } else if (editResult === 'true' || editResult === 'false') {
        notif.style.backgroundImage = editResult === 'true' ? 'url(../images/notification-success.svg)' :'url(../images/notification-error.svg)';
        notifText.textContent = editResult === 'true' ? 'Изменения успешно сохранены' : 'Ошибка изменения записи';        
    } else if (exportResult === 'true' || exportResult === 'false') {
        notif.style.backgroundImage = exportResult === 'true' ? 'url(../images/notification-success.svg)' :'url(../images/notification-error.svg)';
        notifText.textContent = exportResult === 'true' ? 'Файл успешно скачан' : 'Ошибка скачивания файла';        
    } else if (importResult === 'true' || importResult === 'false') {
        notif.style.backgroundImage = importResult === 'true' ? 'url(../images/notification-success.svg)' :'url(../images/notification-error.svg)';
        notifText.textContent = importResult === 'true' ? 'Файл успешно загружен' : 'Ошибка загрузки файла';        
    } else if (deleteResult === 'true' || deleteResult === 'false') {
        notif.style.backgroundImage = deleteResult === 'true' ? 'url(../images/notification-success.svg)' :'url(../images/notification-error.svg)';
        notifText.textContent = deleteResult === 'true' ? 'Запись успешно удалена' : 'Ошибка удаления записи';        
    } else if (pathResult === 'true' || pathResult === 'false') {
        notif.style.backgroundImage = pathResult === 'true' ? 'url(../images/notification-success.svg)' :'url(../images/notification-error.svg)';
        notifText.textContent = pathResult === 'true' ? 'Путь к файлам успешно записан' : 'Ошибка записи пути к файлам';        
    }       
    
    notif.style.display = 'block';
    setTimeout(() => {
        notif.classList.add('hide'); 
        setTimeout(() => {
            notif.style.display = 'none'; 
            notif.classList.remove('hide');
        }, 500); 
    }, 5000);
}