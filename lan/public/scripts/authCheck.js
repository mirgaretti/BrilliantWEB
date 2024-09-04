setInterval(() => {
  fetch('/auth-check')
    .then((value) => {
        
        return value.text();
    })
    .then((value) => {
        
        if (value === 'no-auth') window.location.reload();
    })
    .catch(() => window.location.reload());
}, 30000);