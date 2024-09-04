window.onload = async () => {
    const url = new URL(window.location.href);
    let count = url.searchParams.get('count');
    if (count) {
        url.searchParams.delete('count');
        window.history.replaceState({}, document.title, url);
        if (Number(count) > 100 || Number(count) < 1) {
            count = '10';
        }
        await displayNotifications(count);
    } else {
        await displayNotifications('10');
    }
}

const socket = io();

socket.on(`notification`, (notification) => {
    console.log('notification', notification);
    addNotification(notification, 'prepend')
});

socket.on('confirm', (confirm) => {
    console.log('confirm', confirm);
    if (confirm.toggle == '0') {
        updateComment(confirm.id, confirm.value, confirm.commentTime);
    } else {
        console.log('Already updated');
    }
});
  
async function displayNotifications(count) {
    try {
        const response = await fetch('/getNotifications?count=' + count);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const notifications = await response.json();
        notifications.forEach(notification => addNotification(notification, 'append'));
    } catch (error) {
        console.error('Ошибка при загрузке уведомлений:', error);
    }
}

function addNotification(notification, order) {
    const notificationsDiv = document.getElementById('notifications');
    const div = document.createElement('div');
    div.id = notification.id;
    div.className = `notification-block${notification.toggle != '0' ? ' checked' : ''}`;
    div.style.border = `2px solid ${notification.color}`;
    div.style.backgroundColor = notification.toggle != '0' ? 'white' : notification.background;
    
    if (notification.toggle == '0' && notification.topic.startsWith('SOS')) {
        div.innerHTML = `
            <p style="display: flex; flex-direction: row; justify-content: space-between; align-items: center">${notification.payload} <a href="/location?type=${notification.topic}" style="display: flex; align-items: center;" id="map-${notification.id}"><img src="../../images/map.svg" style="margin: 0; width: 30px; height: 30px;"/></a></p>
            <hr style="border-top: 2px solid ${notification.color}">
        `;        
    } else {
        div.innerHTML = `
            <p>${notification.payload}</p>
            <hr style="border-top: 2px solid ${notification.color}">
        `;    
    }
    if (notification.toggle != '0' && notification.comment != null && notification.commentTime != null) {
        div.innerHTML += `
            <p class="comment">${notification.comment}</p>
            <span><img src="../../images/time.svg" />${notification.currtime}</span>
            <span class="comment-time"><img src="../../images/checked.svg" />${notification.commentTime}</span>
        `;
    } else {
        div.addEventListener("click", listeners);
        div.innerHTML += `<span id="span${notification.id}"><img src="../../images/time.svg" class="time" />${notification.currtime}</span>`;
    }

    if (order == 'append') {
        notificationsDiv.appendChild(div);
    } else {
        notificationsDiv.prepend(div);
    }
    
    const location = document.getElementById(`map-${notification.id}`);
    if (location) {
        location.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }
}

const handleInput = () => {
    valueInput.style.border = "";
    valueInput.style.backgroundColor = "";
    valueInput.style.filter = "";
};

function listeners (event) {
    const selectedBlock = event.target;
  
    if (!selectedBlock.classList.contains("checked")) {
        selectedBlock.classList.add("checked");
        let mainBlock;
        if (event.target.closest('.notification-block')) {
            mainBlock = event.target.closest('.notification-block');
            mainBlock.classList.add("checked")
        }
        
        mainBlock.removeEventListener("click", listeners);
        
        const overlay = document.getElementById("overlay");
        const modal = document.getElementById("confirmationModal");
        const valueInput = document.getElementById("valueInput");
        const confirmBtn = document.getElementById("confirmButton");
        const cancelBtn = document.getElementById("cancelButton");
        
        modal.style.display = "block";
        overlay.style.display = "block";
        
        confirmBtn.onclick = async function () {
            const value = valueInput.value.trim();
            if (value !== "") {
                valueInput.value = "Сообщение подтверждено";
                const data = { id: mainBlock.id, value: value };
                await sendFetch(data);
            
                modal.style.display = "none";
                overlay.style.display = "none";
            } else {
                valueInput.style.border = "2px solid red";
                valueInput.style.backgroundColor = "#FDD";
                valueInput.style.filter =
                "drop-shadow(0px 5px 15px rgba(255, 38, 38, 0.25)) drop-shadow(0px -5px 15px rgba(255, 38, 38, 0.25))";
                valueInput.addEventListener("input", handleInput);
            }
        };
        cancelBtn.onclick = function () {
            modal.style.display = "none";
            overlay.style.display = "none";
        };
    }
}

async function sendFetch(data) {
    fetch("/setChecked", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({data}),
    })
      .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok.");
            }
      })
      .catch((error) => console.error("Error:", error));
}

function updateComment (id, value, commentTime) {
    const mainBlock = document.getElementById(id);
    mainBlock.style.backgroundColor = "white";
    const locationLink = mainBlock.querySelector('a[href^="/location?type="]');
    if (locationLink) locationLink.remove();
    
    mainBlock.classList.add("checked");
    const prevSpan = document.getElementById(`span${id}`);
    mainBlock.removeEventListener("click", listeners);

    const commentBlock = document.createElement("p");
    commentBlock.textContent = value;
    commentBlock.classList.add("comment");

    const infoBlock = document.createElement("span");
    infoBlock.innerHTML = `<img src="../../images/time.svg">${prevSpan.textContent}`;

    const timeSpan = document.createElement("span");
    timeSpan.innerHTML = `<img src="../../images/checked.svg">${commentTime}`;
    timeSpan.classList.add("comment-time");

    mainBlock.appendChild(commentBlock);
    mainBlock.appendChild(infoBlock);
    mainBlock.appendChild(timeSpan);
    prevSpan.parentNode.removeChild(prevSpan);
}


const settings = document.getElementById('settings');

settings.addEventListener('click', () => {
    const overlay = document.getElementById("overlay");
    const modal = document.getElementById("settingsModal");
    const settingsInput = document.getElementById("settingsInput");
    const settingsBtn = document.getElementById("settingsConfirmButton");
    const settingsCancelBtn = document.getElementById("settingsCancelButton");

    modal.style.display = "block";
    overlay.style.display = "block";

    settingsBtn.onclick = async function () {
        const value = settingsInput.value.trim();   
        if (value !== "") {
            window.location.href = '/journal?count=' + value;
        }
    };

    settingsCancelBtn.onclick = function () {
        modal.style.display = "none";
        overlay.style.display = "none";
    };
})

const input = document.getElementById('settingsInput');

input.addEventListener('input', function() {
    if (this.value < 1) {
        this.value = 1;
    } else if (this.value > 100) {
        this.value = 100;
    }
});