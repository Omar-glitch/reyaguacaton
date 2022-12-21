const key = document.querySelector('#key').value;
const padre = document.querySelector('.contC');
const form = document.querySelector('#form')

if (document.querySelector('#imageUsuario')) {
    const imagenU = document.querySelector('#imageUsuario');
    const date = new Date();
    imagenU.src = `${imagenU.src}?` + date.getTime();
}

const crearParrafos = (texto, clase) => {
    const p = document.createElement('p');
    p.className = clase;
    p.innerHTML = texto;
    return p;
}

const delete_child = (parent) => {
    if (!parent) return;
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

const contactUs = () => {
    const bEnviar = document.querySelector('#enviar');
    const loader = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;
    const textarea = document.querySelector('#fcom');
    textarea.innerHTML = '';
    
    bEnviar.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        const xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        const form = document.querySelector('#form');
        const formData = new FormData(form);
        form.reset();
        while (padre.firstChild) padre.removeChild(padre.firstChild);
        padre.innerHTML = loader;
    
        xhr.open('POST', `${window.origin}/contactUs/mensaje`);
        xhr.setRequestHeader('X-CRFToken', key);
        xhr.addEventListener('load', (data) => {
            datos = JSON.parse(data.target.response);
            while(padre.firstChild) padre.removeChild(padre.firstChild);
            padre.innerHTML = datos['div'];
            contactUs();
            const cont = document.querySelectorAll('.formContenido');
            if (document.querySelectorAll('.errores')) {
                document.querySelectorAll('.errores').
                    forEach(e => {e.parentElement.removeChild(e)})
            }
            
            if ('session' in datos) return alert(datos['session']);
            
            if ('error' in datos){
                for (const i in datos['error']) {
                    if (typeof(datos['error'][i]) === undefined) continue;
                    let p = crearParrafos(datos['error'][i], 'errores');
                    cont[i].appendChild(p);
                }
                return 0;
            };
            return alert('Mensaje enviado pa');
        })
        xhr.send(formData)
    })
}

contactUs();