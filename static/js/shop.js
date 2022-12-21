const botonPlatillos = document.querySelector('.bplatillos');
const botonBebidas = document.querySelector('.bbebidas');
const key = document.querySelector('#csrf').value;
const menu = document.querySelector('.menu');

const generarLoader = () => {return `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;}

const enviarXML = (producto) => {
    while (menu.firstElementChild) menu.removeChild(menu.firstElementChild);
    const loader = document.createElement('div');
    loader.innerHTML = generarLoader();
    menu.appendChild(loader);
    const xml = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTPRequest");
    const obj = JSON.stringify({"producto": producto})
    xml.open('POST', `${window.origin}/shop/producto`)
    xml.setRequestHeader("Content-Type", "application/json");
    xml.setRequestHeader('X-CSRFToken', key);
    xml.addEventListener('load', (data) => {
        const datos = JSON.parse(data.target.response);
        menu.removeChild(loader);
        if ("error" in datos) return alert(datos['error']);
        for (const producto of datos['productos']) {
            const div = document.createElement('div');
            div.className = datos['class'];
            div.innerHTML = producto;
            menu.appendChild(div);
        }
        botonPlatillos.disabled = false;
        botonBebidas.disabled = false;
    })
    xml.send(obj)
}

botonPlatillos.addEventListener('click', () => {
    botonPlatillos.disabled = true;
    botonBebidas.disabled = true;
    enviarXML("platillos");
})

botonBebidas.addEventListener('click', () => {
    botonBebidas.disabled = true;
    botonPlatillos.disabled = true;
    enviarXML('bebidas');
})