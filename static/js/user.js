const aside = document.querySelector('#aside');
const boton = document.querySelector('.usuario-info');
const main = document.querySelector('#main');

const key = document.querySelector('#csrf').value;
const padre = document.querySelector('#user');

const imagenUsuario = document.querySelector('#imagen-usuario');
const cerrarSesion = document.querySelector('#cerrarSesion');

// Funciones
const eliminarHijo = (id) => {
    if (document.querySelector(`#${id}`)) {
        let hijoA = document.querySelector(`#${id}`);
        hijoA.parentElement.removeChild(hijoA);
    }
}

cerrarSesion.addEventListener('click', () => {
    const ask = confirm('¿Cerrar Sesión?');
    if (!ask) return;
    window.onbeforeunload = null;
    const obj = JSON.stringify({"csesion":true});
    const xml = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTPRequest");
    xml.open('POST', `${window.origin}/session`);
    xml.setRequestHeader('X-CSRFToken', key);
    xml.setRequestHeader('Content-Type', "application/json");
    xml.addEventListener('load', () => {
        window.location = `${window.origin}/login`;
    })
    xml.send(obj)
})

const obtenerNameJPG = (imagen) => {const d = new Date();return `${imagen.src.split('/')[imagen.src.split('/').length -1]}?timestamp=;` + d.getTime()}
let nombreImagenC = obtenerNameJPG(imagenUsuario);
imagenUsuario.src = document.querySelector('#img').src = `/static/imgR/${nombreImagenC}?`;

const crearAviso = (id, texto) => {
    let contenedorUser = document.querySelector('#user');
    eliminarHijo(id);
    let p = document.createElement('p');
    p.id = id;
    p.innerHTML = texto;
    contenedorUser.appendChild(p)
}

const eliminarLoader = (padre, loader) => {padre.removeChild(loader)}

const generarLoader = (padre) => {
    const loader = document.createElement('div');
    loader.className = "lds-dual-ring";
    padre.appendChild(loader);
    return loader;
}

const enviarXML = (objJson, func) => {
    const loader = generarLoader(padre);
    const xml = (window.XMLHttpRequest) ? new XMLHttpRequest(): new ActiveXObject("Microsoft.XMLHTTPRequest");
    xml.open("POST", `${window.origin}/json`)
    xml.setRequestHeader("X-CSRFToken", key)
    xml.setRequestHeader('Content-Type', "application/json");
    xml.addEventListener('load', (data) => {
        eliminarLoader(padre, loader);
        const datos = JSON.parse(data.target.response)
        padre.innerHTML = datos['div'];
        imagenUsuario.src = document.querySelector('#img').src = `/static/imgR/${nombreImagenC}`;
        func();
    })
    xml.send(objJson)
}

const enviarXML2 = (formulario, func, func2) => {
    const form = new FormData(formulario);
    while (padre.firstChild) padre.removeChild(padre.firstChild);
    const loader = generarLoader(padre);
    const xml = (window.XMLHttpRequest) ? new XMLHttpRequest: new ActiveXObject('Microsoft.XMLHTTP');
    xml.open('POST', `${window.origin}/user`);
    xml.setRequestHeader('X-CSRFToken', key);
    xml.addEventListener('load', (data) => {
        const datos = JSON.parse(data.target.response);
        eliminarLoader(padre, loader)
        if ('texto' in datos) {if (datos['texto'].length > 0)alert(datos['texto']);};
        if ('error' in datos) {padre.innerHTML = datos['div']; document.querySelector('#img').src = imagenUsuario.src;func2();return crearAviso('pError', datos['error']);} 
        padre.innerHTML = datos['div'];
        if (datos['img']) {
            const d = new Date();
            imagenUsuario.src = `/static/imgR/${datos['img']}?timestamp=` + d.getTime();
            nombreImagenC = obtenerNameJPG(imagenUsuario);
        }
        document.querySelector('#img').src = imagenUsuario.src;
        func();
    })
    xml.send(form)
}

boton.addEventListener('click', (e) => {
    e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();
    const mheight = (main.offsetWidth < 700) ? '100%' : '130px';
    aside.style.maxHeight = (window.getComputedStyle(aside).maxHeight == '0px') ? mheight : '0';
});

const vistaF = () => {
    window.onbeforeunload = null;
    const bContrasena = document.querySelector('#contrasena');
    const bEditar = document.querySelector('#editar');
    const bEliminar = document.querySelector('#eliminar');

    bContrasena.addEventListener('click', () => {
        while (padre.firstChild) padre.removeChild(padre.firstChild);
        const obj = JSON.stringify({"cambiar": true});
        enviarXML(obj, cambiarContra)
    })

    bEditar.addEventListener('click', () => {
        while (padre.firstChild) padre.removeChild(padre.firstChild);
        const obj = JSON.stringify({"editar": true})
        enviarXML(obj, editarF)
    })

    bEliminar.addEventListener('click', () => {
        while (padre.firstChild) padre.removeChild(padre.firstChild);
        const obj = JSON.stringify({"eliminar": true})
        enviarXML(obj, eliminarF)
    })
}

const cambiarContra = () => {
    const contrasena = document.querySelector('#contrasena');
    const ncontrasena = document.querySelector('#ncontrasena');
    const bCambiar = document.querySelector('#enviar');
    const bCancelar = document.querySelector('#cancelar')
    const formulario = document.querySelector('#formulario');

    bCambiar.addEventListener('click', () => {
        const form = new FormData(formulario);
        while(padre.firstChild) padre.removeChild(padre.firstChild);
        const xml = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTPRequest");
        const loader = generarLoader(padre)
        xml.open("POST", `${window.origin}/cambiarContra`);
        xml.setRequestHeader("X-CSRFToken", key);
        xml.addEventListener('load', (data) => {
            eliminarLoader(padre, loader);
            datos = JSON.parse(data.target.response);
            if ("error" in datos) {
                padre.innerHTML = datos['div']
                cambiarContra()
                const descripcion = document.querySelector('.descripcion')
                const contenedor = document.createElement('div');
                contenedor.className = "contenedorError";
                for (const error of datos["error"]) {
                    const p = document.createElement('p');
                    p.innerHTML = error;
                    p.className = "errorCambio";
                    contenedor.appendChild(p)
                }
                document.querySelector('#img').src = imagenUsuario.src;
                return descripcion.appendChild(contenedor)
            };
            padre.innerHTML = datos["div"];
            document.querySelector('#img').src = imagenUsuario.src;
            vistaF();
            alert("Contraseña cambiada correctamente");
        })
        xml.send(form);
    })

    bCancelar.addEventListener('click', () => {
        const ask = (contrasena.value.length != 0 || ncontrasena.value.length != 0) ? confirm('¿No quieres cambiar contraseña? (No se guardarán los cambios)') : true; 
        const formulario = document.querySelector('#formulario');
        if (!ask) return;
        formulario.reset();
        
        while (padre.firstChild) padre.removeChild(padre.firstChild);
        const obj = JSON.stringify({"vista": true});

        enviarXML(obj, vistaF);
    })
}

const editarF = () => {
    const bGuardar = document.querySelector('#enviar');
    const bCancelar = document.querySelector('#cancelar');
    const lfile = document.querySelector('#lfile');
    const inputFile = document.querySelector('#file');
    const textarea = document.querySelector('#desc');
    const formulario = document.querySelector('#formulario');

    window.onbeforeunload = preguntarAntesDeSalir;
    function preguntarAntesDeSalir(){return "¿Seguro que quieres salir?";}

    bGuardar.addEventListener('click', () => {
        enviarXML2(formulario, vistaF, editarF);
    })
    
    inputFile.addEventListener('input', () => {
        let xml = (window.XMLHttpRequest) ? new XMLHttpRequest(): new ActiveXObject('Microsoft.XMLHTTP');
        const imagen = document.querySelector('#img');
        const loader = generarLoader(lfile);
        
        const form = new FormData(formulario)
        xml.open('POST', `${window.origin}/imagen`);
        xml.setRequestHeader('X-CSRFToken', key);
        xml.addEventListener('load', (data) => {
            eliminarLoader(lfile, loader);
            const datos = JSON.parse(data.target.response);
            if ('error' in datos) return crearAviso('pError', datos['error']);
            eliminarHijo('pError');
            const d = new Date();
            imagen.src = imagenUsuario.src = `/static/imgR/${datos['img']}?timestamp=` + d.getTime();
        })
        xml.send(form)
    })

    bCancelar.addEventListener('click', () => {
        const ask = (inputFile.value.length != 0 || textarea.value.length != 0) ? confirm('Salir del modo de edición (No se guardarán los cambios)') : true; 
        const formulario = document.querySelector('#formulario');
        const image  = document.querySelector('#img');
        if (!ask) return;
        formulario.reset();
        
        while (padre.firstChild) padre.removeChild(padre.firstChild);
        const obj = JSON.stringify({"vista": true});

        enviarXML(obj, vistaF);
    })
}

const eliminarF = () => {
    const formulario = document.querySelector('#formulario');
    const bEliminar = document.querySelector('#enviar');
    const bCancelar = document.querySelector('#cancelar');

    bEliminar.addEventListener('click', () => {
        const xml = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTPRequest");
        const form = new FormData(formulario);
        while (padre.firstChild) padre.removeChild(padre.firstChild);
        const loader = generarLoader(padre);
        xml.open('POST', `${window.origin}/eliminar`)
        xml.setRequestHeader('X-CSRFToken', key);
        xml.addEventListener('load', (data) => {
            eliminarLoader(padre, loader);
            const datos = JSON.parse(data.target.response);
            if ("eliminar" in datos) {
                padre.innerHTML = datos['div'];
                crearAviso("pError", "Contraseña incorrecta")
                document.querySelector('#img').src = imagenUsuario.src;
                return eliminarF();
            }
            alert('Hasta pronto')
            window.location = `${window.origin}/register`;
        })
        xml.send(form)
    })

    bCancelar.addEventListener('click', () => {
        while(padre.firstChild)padre.removeChild(padre.firstChild);
        const obj = JSON.stringify({"vista": true});
        enviarXML(obj, vistaF)
    })
}

vistaF();
// Eventos window
window.addEventListener('click', (e) => {if (!aside.contains(e.target)) aside.style.maxHeight = '0';})
window.addEventListener('resize', () => {aside.style.maxHeight = '0';})