let sortOrder = 'asc'; 

window.sortTable = (column) => {
    const table = document.getElementById('myTable');
    const tbody = table.querySelector('tbody');
    const rowsArray = Array.from(tbody.rows);
    console.log(rowsArray);
    // let headersRow = rowsArray.shift();
    
    const compare = (rowA, rowB) => {
        const cellA = rowA.cells[column] ? rowA.cells[column].innerText.toLowerCase() : '';
        const cellB = rowB.cells[column] ? rowB.cells[column].innerText.toLowerCase() : '';
        return sortOrder === 'asc' ? cellA > cellB ? 1 : -1 : cellA < cellB ? 1 : -1;
    };
    const emptyRows = rowsArray.slice(rowCount);
    rowsArray.splice(rowCount);
    rowsArray.sort(compare);
    while (emptyRows.length) {
        rowsArray.push(emptyRows.pop());
    }

    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    // tbody.appendChild(headersRow); 
    while (rowsArray.length) {
        tbody.appendChild(rowsArray.shift());
    }

    sortOrder = (sortOrder === 'asc') ? 'desc' : 'asc';
}