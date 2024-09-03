const columns = ['name', 'ip', 'mac', 'cardfile', 'location'];
const displayName = [ 'Название', 'IP-адрес', 'MAC-адрес', 'Название файла', 'Месторасположение'];
let rowCount;

function updateURL() {
    const url = new URL(window.location.href);
    const addResult = url.searchParams.get('add');
    const editResult = url.searchParams.get('edit');
    const pathResult = url.searchParams.get('path');
    const deleteResult = url.searchParams.get('delete');
    const exportResult = url.searchParams.get('export');
    url.searchParams.delete('add');
    url.searchParams.delete('edit');
    url.searchParams.delete('path');
    url.searchParams.delete('delete');
    url.searchParams.delete('export');
    window.history.replaceState({}, document.title, url);
    displayNotification(addResult, editResult, exportResult, '', deleteResult, pathResult)
}

window.addEventListener('load',updateURL);

async function displayHostsTable() {
    try {
        const response = await fetch('/getHosts'); 
        const rows = await response.json();
        rowCount = rows.length;

        // headers
        const headerRow = document.getElementById("tableHeaders");
        displayName.forEach((name, index) => {
            const th = document.createElement("th");
            th.innerHTML = `${name}`;
            th.addEventListener('click', () => {
                sortTable(index);
            })
            headerRow.appendChild(th);
        });

        for (let i = 1; i < 3; i += 1) {
            const th = document.createElement("th");
            headerRow.appendChild(th);
        }

        // body
        const th = document.createElement("th");
        th.innerHTML = `<a href="/addHostsPage"><img src="../../images/add.svg"/></a>`;
        headerRow.appendChild(th);

        const tableBody = document.getElementById("tableBody");
        rows.forEach((row) => {
	        const tr = document.createElement("tr");
            columns.forEach((column) => {
                const td = document.createElement("td");
                td.textContent = row[column] || '';
                tr.appendChild(td);
            });

            const importTd = document.createElement("td");
            importTd.innerHTML = `
                <img src="../../images/import.svg" onclick="ifFileExists(${row.id})" />
            `;
            const editTd = document.createElement("td");
            editTd.innerHTML = `
                <a href="/editHostsPage/${row.id}"><img src="../../images/edit.svg" /></a>
            `;
            const deleteTd = document.createElement("td");
            deleteTd.innerHTML = `
                <img src="../../images/delete.svg" onclick="openConfirmationModal(${row.id}, '/deleteHosts', '', '/hostsPage', '?delete=', 'Удалить запись?', 'Удалить')" />
            `;
            tr.appendChild(importTd);
            tr.appendChild(editTd);
            tr.appendChild(deleteTd);

            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

displayHostsTable();
