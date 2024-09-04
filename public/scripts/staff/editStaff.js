const id = window.location.href.split('?')[0].split('/').pop();
const columnsFull = [ 'Active', 'Name', 'Role', 'Code', 'PublishTopicIn', 'PublishPayloadIn', 'PublishTopicOut', 'PublishPayloadOut',
    'Floor', 'WebRelay', 'ScheduleRelay', 'CardType'];    
const displayNameFull = [ '', 'Имя', 'Роль', 'Код', , 'Топик In', 'Текст In', 'Топик Out', 'Текст Out',
    'Этаж', 'Веб-реле', 'Расписание', 'Тип карты']; 

displayEditValues(id, '/getStaffById/', columnsFull, displayNameFull, 'staff-container');

//==============================================
const requiresStaff = ['Name', 'Admin', 'Role', 'Code', 'PublishTopicIn', 'PublishPayloadIn', 'PublishTopicOut', 'PublishPayloadOut'];

window.checkConfirmationModal = async () => {
    let isMatches = 1;
    requiresStaff.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (!field.value.length) {
            field.classList.add('warning');
            isMatches = 0;
        } 
        field.addEventListener('focus', function() {
            field.classList.remove('warning');
        }); 
    });
    if (isMatches == 1) {
        const data = {};
        const inputs = document.querySelectorAll('.edit');
        inputs.forEach(input => {
            data[input.id] = input.value; 
        });

        const response = await fetch('/checkStaff/' + id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        
        if (result.code === 'true') {
            const code = document.getElementById('Code');
            const noticeCode = document.getElementById('noticeCode');
            code.classList.add('warning');
            noticeCode.style.display = 'block';
            code.addEventListener('focus', function() {
                code.classList.remove('warning');
                noticeCode.style.display = 'none';
            }); 
        } else {
            openConfirmationModal(id, '/updateStaff', data, '/staffPage', '?edit=', 'Сохранить изменения?', 'Сохранить');
        }        
    }
} 

