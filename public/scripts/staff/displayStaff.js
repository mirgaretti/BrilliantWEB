const columnsMain = ['Active', 'Name', 'Admin', 'Role', 'Code', 'PublishTopicIn', 'PublishPayloadIn', 'PublishTopicOut', 'PublishPayloadOut'];
const displayNameMain = [ '', 'Имя', 'Админ', 'Роль', 'Код', 'Publish Topic In', 'Publish Payload In', 'Publish Topic Out', 'Publish Payload Out'];

const columnsFull = [ 'Active', 'Name', 'Admin', 'Role', 'Code', 'PublishTopicIn', 'PublishPayloadIn', 'PublishTopicOut', 'PublishPayloadOut',
    'DoorNum', 'WebRelay', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun', 'TimeStart', 'TimeEnd', 'Floor', 'Cloud', 'DeviceName', 
    'Addr', 'Tags', 'Frequency', 'DayStart', 'DayEnd', 'CardType', 'Schedule1', 'Schedule2', 'Schedule3', 'Schedule3', 'Schedule4', 'Schedule5'];    
const displayNameFull = [ '', 'Имя', 'Админ', 'Роль', 'Код', 'Publish Topic In', 'Publish Payload In', 'Publish Topic Out', 'Publish Payload Out',
    'DoorNum', 'WebRelay', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun', 'TimeStart', 'TimeEnd', 'Floor', 'Cloud', 'DeviceName', 
    'Addr', 'Tags', 'Frequency', 'DayStart', 'DayEnd', 'CardType', 'Schedule1', 'Schedule2', 'Schedule3', 'Schedule3', 'Schedule4', 'Schedule5']; 

const url = new URL(window.location.href);
const scope = url.searchParams.get('scope');

function updateURL() {
    const url = new URL(window.location.href);
    const importResult = url.searchParams.get('import');
    const editResult = url.searchParams.get('edit');
    const exportResult = url.searchParams.get('export');
    const deleteResult = url.searchParams.get('delete');
    url.searchParams.delete('import');
    url.searchParams.delete('edit');
    url.searchParams.delete('export');
    url.searchParams.delete('delete');
    window.history.replaceState({}, document.title, url);
    displayNotification('', editResult, importResult, exportResult, deleteResult, '')
}

window.addEventListener('load', updateURL);

async function displayStaffTable() {
    try {
        const response = await fetch('/getStaff?scope=' + scope); 
        const rows = await response.json();
        rowCount = rows.length;

        // headers
        const headerRow = document.getElementById("tableHeaders");
        if (scope == 'full') {
            displayNameFull.forEach((name, index) => {
                const th = document.createElement("th");
                th.innerHTML = `${name}`;
                th.addEventListener('click', () => {
                    sortTable(index);
                })
                headerRow.appendChild(th);
            });  
        } else {
            displayNameMain.forEach((name, index) => {
                const th = document.createElement("th");
                th.innerHTML = `${name}`;
                th.addEventListener('click', () => {
                    sortTable(index);
                })
                headerRow.appendChild(th);
            });              
        }

        const th = document.createElement("th");
        headerRow.appendChild(th);
        const thSettings = document.createElement("th");
        if (scope == 'full') {  
            thSettings.innerHTML = `<a href="/staffPage?scope=main"><img src="../../images/advanced.svg"/></a>`;
        } else {
            thSettings.innerHTML = `<a href="/staffPage?scope=full"><img src="../../images/settings.svg"/></a>`;
        }
        headerRow.appendChild(thSettings);

        // body
        const tableBody = document.getElementById("tableBody");
        rows.forEach((row) => {
            const tr = document.createElement("tr");
            if (scope == 'full') {  
                columnsFull.forEach((column) => {
                    const td = document.createElement("td");
                    if (column === 'Active') {
                        console.log(row[column].data[0]);
                        td.innerHTML = `<img onclick="chahgeStaffStatus(event, ${row.id})" src="${row[column].data[0] == '1' ? '../images/checkbox-checked.svg' : '../images/checkbox-unchecked.svg'}" />`;
                    } else {
                        td.textContent = row[column] || '';
                    }
                    tr.appendChild(td);
                }); 
            } else {
                columnsMain.forEach((column) => {
                    const td = document.createElement("td");
                    if (column === 'Active') {
                        td.innerHTML = `<img onclick="chahgeStaffStatus(event, ${row.id})" src="${row[column].data[0] == '1' ? '../images/checkbox-checked.svg' : '../images/checkbox-unchecked.svg'}" />`;
                    } else {
                        td.textContent = row[column] || '';
                    }
                    tr.appendChild(td);
                });
            }

            const editTd = document.createElement("td");
            editTd.innerHTML = `
                <a href="/editStaffPage/${row.id}"><img src="../../images/edit.svg" /></a>
            `;
            const deleteTd = document.createElement("td");
            deleteTd.innerHTML = `
                <img src="../../images/delete.svg" onclick="openConfirmationModal(${row.id}, '/deleteStaff', '', '/staffPage', '?delete=', 'Удалить запись?', 'Удалить')" />
            `;
            tr.appendChild(editTd);
            tr.appendChild(deleteTd);

            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

displayStaffTable();

async function chahgeStaffStatus(e, id) {
    let isChecked;
    if (e.target.src.includes('-checked.svg')) {
        isChecked = 0;
    } else if (e.target.src.includes('-unchecked.svg')) {
        isChecked = 1;
    }
    const response = await fetch('/setActive/' + id, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isChecked: isChecked })
    });
    if (response.ok) {
        if (e.target.src.includes('-checked.svg')) {
            e.target.src = '../images/checkbox-unchecked.svg';
        } else if (e.target.src.includes('-unchecked.svg')) {
            e.target.src = '../images/checkbox-checked.svg';
        }
    }
}

