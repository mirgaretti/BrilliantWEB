function logout() {
    fetch('/logout', { 
        method: 'POST' 
    }).then(() => window.location.reload());
}