(()=>{"use strict";const e=document.getElementById("form-name"),n=document.getElementById("form-name-help"),t=document.getElementById("form-username"),s=document.getElementById("form-username-help"),r=document.getElementById("form-email"),a=document.getElementById("form-email-help"),d=document.getElementById("form-password"),o=document.getElementById("form-password-help"),i=document.getElementById("form-repassword-help"),m=document.getElementById("form-repassword");let l=document.getElementById("submit-button"),u=[],c=window.location,h=c.protocol+"//"+c.hostname+":"+c.port+"/check-username-availability";fetch(h).then((e=>e.json())).then((e=>u=e));let g={password:!1,rePassword:!1};if(e){let d={name:!1,email:!1,username:!1,password:!1,rePassword:!1};e.addEventListener("blur",(()=>{let t=e.value;""===t?(E(e),E(n),n.hidden=!1,n.innerText="Enter your First Name",d.name=!1):(w(e),w(n),e.hidden=!1,n.innerText=`Hi ${t}, Welcome to MCO`,d.name=!0,v())})),t.addEventListener("blur",(()=>{let e=t.value;var n;""===e?(E(t),E(s),s.hidden=!1,s.innerText="Enter a username",d.username=!1):(n=e,u.includes(n)?(E(t),E(s),s.hidden=!1,s.innerText="Someone already took that username sadly.",d.username=!1):(w(t),w(s),s.hidden=!1,s.innerText="That's seems a good one!",d.username=!0,v()))})),r.addEventListener("blur",(()=>{let e=r.value;""===e?(E(r),E(a),a.hidden=!1,a.innerText="Enter an email",d.email=!1):/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(e).toLowerCase())?(w(r),w(a),a.hidden=!1,a.innerText="All set!",d.email=!0,v()):(E(r),E(a),a.hidden=!1,a.innerText="Invalid email! Did you miss something?",d.email=!1)}))}function v(){for(const e of Object.values(g))if(!e)return;l.removeAttribute("disabled")}function w(e){e.classList.add("is-success"),e.classList.remove("is-danger")}function E(e){e.classList.add("is-danger"),e.classList.remove("is-success")}d.addEventListener("blur",(()=>{let e=d.value;var n;""===e?(E(d),E(o),o.hidden=!1,o.innerText="Enter a password",g.password=!1):(n=e,/(?=.*[0-9])/.test(String(n).toLowerCase())&&n.length>7?(w(d),w(o),o.hidden=!1,o.innerText="Almost Done!",g.password=!0,v()):(E(d),E(o),o.hidden=!1,o.innerText="Please make it 8 or more charecters and having atleast one number",g.password=!1))})),m.addEventListener("change",(()=>{m.value!=d.value?(E(m),E(i),i.hidden=!1,i.innerText="Uh Oh! Passwords don't match!",g.rePassword=!1):(w(m),w(i),i.hidden=!1,i.innerText="Passwords match! Wohoo!",g.rePassword=!0,v())}))})();