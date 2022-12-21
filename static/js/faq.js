let preguntas = document.querySelectorAll('.preguntas');
let respuestas = document.querySelectorAll('.respuesta');
const key = document.querySelector('#key').value;
const ver = document.querySelector('#ver');
const contenedor = document.querySelector('#comentarios');
const documento = document.querySelector('body');

const generarLoader = () => {return `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;}

const cambiarImagen = () => {
    const imagenes = document.querySelectorAll('.img-random');
    for (const imagen of imagenes) {
        const date = new Date();
        imagen.src = `${imagen.src}?${date.getTime()}`;
    }
}

const enviarXML = (url, obj) => {
    const xml = (window.XMLHttpRequest) ? new XMLHttpRequest(): new ActiveXObject("Microsoft.XMLHTTPRequest");
    const boton = documento.querySelector('#ver');
    boton.disabled = true;
    boton.innerHTML = "Cargando...";

    xml.open('POST', url);
    xml.setRequestHeader('X-CSRFToken', key);
    xml.setRequestHeader('Content-Type', "application/json");
    xml.addEventListener('load', (data) => {
        console.log(data.target.response)
        const datos = JSON.parse(data.target.response);
        boton.disabled = false;
        boton.innerHTML = "Ver más";
        if ("error" in datos) return alert(datos['error']);
        if (datos['coment'].length <= 0) {
            boton.parentElement.removeChild(boton);
            return alert('Ya no hay más mensajes');  
        } 
        for (const dato of datos['coment']) {
            const div = document.createElement('div');
            div.className = "comentario";
            div.innerHTML = dato;
            contenedor.appendChild(div);
        }
        cambiarImagen();
        perfilUsuario()
    })
    xml.send(obj)
}

const perfilUsuario = () => {
    const botones = document.querySelectorAll('.perfil-usuario');

    for (const boton of botones) {
        if (boton.getAttribute('event')) continue;
        boton.setAttribute('event', "true");
        boton.addEventListener('click', () => {
            const identificador = boton.parentElement.children[2].value;
            obj = JSON.stringify({"_id": identificador})
            if (document.querySelector('.background-user')){const deleteDiv = document.querySelector('.background-user');deleteDiv.parentElement.removeChild(deleteDiv);}
            const div = document.createElement('div');
            div.className = 'background-user';
            documento.appendChild(div)
            const loader = document.createElement('div');
            loader.innerHTML = generarLoader();
            div.appendChild(loader);
            div.addEventListener('click', (e) => {
                e.preventDefault; e.stopImmediatePropagation(); e.stopPropagation();
                documento.removeChild(div);
            })
            const xml = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTPRequest');
            xml.open('POST', `${window.origin}/faq/user`)
            xml.setRequestHeader('X-CSRFToken', key);
            xml.setRequestHeader('Content-Type', "application/json");
            xml.addEventListener('load', (data) => {
                const datos = JSON.parse(data.target.response);
                div.removeChild(loader);
                if ("error" in datos){
                    documento.removeChild(div)
                    return alert(datos['error'])
                }
                div.innerHTML = datos["information"];
                const imaner = document.querySelector('#img-user-random');
                const date = new Date();
                try{
                    imaner.src = `${imaner.src}?${date.getTime()}`;
                }catch (e){}
            })
            xml.send(obj)
        })
    }
}
perfilUsuario()

ver.addEventListener('click', () => {
    const hijos = contenedor.children.length;
    const obj = JSON.stringify({"ver" : hijos});
    enviarXML(`${window.origin}/faq/comentarios`, obj)
})

cambiarImagen();

preguntas.forEach(element => {
    element.addEventListener('click', () => {
        const caret_down = element.children[1];
        const p = element.children[2];
        if (p.style.maxHeight == '120px'){
            p.style.transition = '.2s';
            p.style.maxHeight = '0';
            caret_down.style.transform = 'rotate(0deg)';
        }   else {
            p.style.transition = '.5s';
            p.style.maxHeight = '120px';
            caret_down.style.transform = 'rotate(180deg)';
        }
    })
});