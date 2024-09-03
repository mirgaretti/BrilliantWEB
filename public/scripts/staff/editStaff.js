const id = window.location.href.split('?')[0].split('/').pop();
const columnsFull = [ 'Active', 'Name', 'Admin', 'Role', 'Code', 'PublishTopicIn', 'PublishPayloadIn', 'PublishTopicOut', 'PublishPayloadOut',
    'DoorNum', 'WebRelay', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun', 'TimeStart', 'TimeEnd', 'Floor', 'Cloud', 'DeviceName', 
    'Addr', 'Tags', 'Frequency', 'DayStart', 'DayEnd', 'CardType', 'Schedule1', 'Schedule2', 'Schedule3', 'Schedule3', 'Schedule4', 'Schedule5'];    
const displayNameFull = [ '', 'Имя', 'Админ', 'Роль', 'Код', 'Publish Topic In', 'Publish Payload In', 'Publish Topic Out', 'Publish Payload Out',
    'DoorNum', 'WebRelay', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun', 'TimeStart', 'TimeEnd', 'Floor', 'Cloud', 'DeviceName', 
    'Addr', 'Tags', 'Frequency', 'DayStart', 'DayEnd', 'CardType', 'Schedule1', 'Schedule2', 'Schedule3', 'Schedule3', 'Schedule4', 'Schedule5']; 

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

