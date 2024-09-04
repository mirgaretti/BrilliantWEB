function updateCardfile(value) {
    const cardfile = document.getElementById('cardfile');
    cardfile.value = value + '.xml';
}

async function displayEditValues(id, fetchAddress, columnsFull, displayNameFull, containerId) {
    const response = await fetch(fetchAddress, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id })
    });

    const result = await response.json();
    const staffContainer = document.getElementById(containerId);
    columnsFull.forEach((column, index) => {
        if (column == 'Active') return;

        if (column == 'topic' && result.type == 'Akuvox') return;
        if (column == 'cardfile' && result.type == 'ODNFC') return;

        const container = document.createElement('div');
        container.classList.add('line');
        const label = document.createElement('p');

        label.textContent = displayNameFull[index];
        container.appendChild(label);

        if (column == 'Code' || column == 'ip' || column == 'mac') {
            const block = document.createElement('div');

            const input = document.createElement('input');
            input.classList.add('edit');
            input.type = 'text';
            input.id = column;
            input.placeholder = displayNameFull[index];
            input.value = result[column] || '';
            if (column == 'ip') {
                input.maxLength = '15';
            } else if (column == 'mac') {
                input.maxLength = '12';
                input.id = 'mac';
                input.addEventListener('input', function() {
                        console.log(input.value);
                        updateCardfile(input.value);
                });

            } else {
                input.maxLength = '20';
            }
            const p = document.createElement('p');
            p.classList.add('notice');
            p.textContent = 'Такой ' + displayNameFull[index].toLowerCase() + ' уже существует!';
            p.id = 'notice' + column.charAt(0).toUpperCase() + column.slice(1);

            block.appendChild(input);
            block.appendChild(p);

            container.appendChild(block);
        } else if (column == 'type') {
            const toogleContainer = document.createElement('div')
            toogleContainer.classList.add('toggle-container');
            toogleContainer.id = 'type';
	    toogleContainer.style.cursor='auto';

            const displayDiv = document.createElement('div');
            displayDiv.style = 'display:flex'
            const p = document.createElement('p');
            p.textContent = result.type;
            const toogleSlider = document.createElement('div');
            toogleSlider.classList.add('toggle-slider');
	    toogleSlider.style.transform='translateX(0)';
            displayDiv.appendChild(p)
            displayDiv.appendChild(toogleSlider)
            toogleContainer.appendChild(displayDiv)

            container.appendChild(toogleContainer);

        }
        else {
            const input = document.createElement('input');
            input.classList.add('edit');
            input.type = 'text';
            input.id = column;
            input.placeholder = displayNameFull[index];
            input.value = result[column] || '';
            if (column == 'cardfile') {
                input.maxLength = '16';
            } else if (column == 'name' || column == 'Name') {
                input.maxLength = '50';
            } else {
                input.maxLength = '20';
            }
            container.appendChild(input);
        }
        staffContainer.appendChild(container);
    });
}
