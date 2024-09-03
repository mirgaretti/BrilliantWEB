const importPath = document.getElementById('importPath');
const exportPath = document.getElementById('exportPath');
const samePath = document.getElementById('samePath');
const savePath = document.getElementById('savePath');

async function displayPath() {
    const response = await fetch('/getPath', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const result = await response.json();
    importPath.value = result.importPath;
    exportPath.value = result.exportPath;
    if (importPath.value == exportPath.value) {
        samePath.src = '../../images/checkbox-checked.svg'
    }
}

displayPath()

function updateFileexport(value) {
    exportPath.value = samePath.src.includes('-checked') ? value : '';
}

samePath.addEventListener('click', function () {
    if (samePath.src.includes('unchecked')) {
        samePath.src = '../../images/checkbox-checked.svg'
    } else {
        samePath.src = '../../images/checkbox-unchecked.svg'
    }
    if (exportPath.value == importPath.value) {
        exportPath.value = '';
    } else {
        updateFileexport(importPath.value);
    }
});

savePath.addEventListener('click', async function () {
    const response = await fetch('/setPath', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ importPath: importPath.value, exportPath: exportPath.value })
    });
    console.log(response);
    if (response.ok) {
        window.location.href = '/hostsPage?path=true';        
    } else {
        window.location.href = '/hostsPage?path=false';
    }
});