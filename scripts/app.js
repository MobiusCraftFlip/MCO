require("./navbar");

const body = document.querySelector('body');
const toggle = document.getElementById('toggle');

toggle.addEventListener("click", () => {
    console.log(body.classList.contains('dark'))
    const bodyCheck = body.classList.contains('dark');
    if (bodyCheck) {
        body.className = ''
    } else {
        body.className = "dark"
  }
})