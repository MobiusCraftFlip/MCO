(()=>{"use strict";var e={887:()=>{document.getElementById("navbar-ham").addEventListener("click",(()=>{let e=document.getElementById("navbar-ham-menu"),t=document.getElementById("navbar-ham");e.classList.toggle("is-active"),t.classList.toggle("is-active")}))}},t={};function s(n){var a=t[n];if(void 0!==a)return a.exports;var c=t[n]={exports:{}};return e[n](c,c.exports,s),c.exports}(()=>{s(887);const e=document.querySelector("body");document.getElementById("toggle").addEventListener("click",(()=>{console.log(e.classList.contains("dark"));const t=e.classList.contains("dark");e.className=t?"":"dark"}))})()})();