// get navbar script
fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
    document.getElementById('side-navbar').innerHTML = data;
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-btn').forEach(button => {
        if (button.getAttribute('onclick')?.includes(currentPage)) {
        button.classList.add('hidden-button');
        }
    });
});