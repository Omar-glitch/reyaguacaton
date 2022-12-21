const menus = document.querySelectorAll('.menu-platillos')
let contPlatillos = menus[0];
let contBebidas = menus[1];
let platillos = document.querySelectorAll('.platillos');
let botonI = document.querySelector('.botonI');
let botonD = document.querySelector('.botonD');
let botonI2 = document.querySelector('.botonI2');
let botonD2 = document.querySelector('.botonD2');
let portada = document.querySelector('.portada');
let contador = 0;
let img1 = 'url("static/img/aguacate4.jpg")';
let img2 = 'url("static/img/aguacate.jpg")';
let img3 = 'url("static/img/receta8.jpg")';
let botonTienda = document.querySelector('.ver-tienda');


function cambiarPortada(img){
    portada.style.background = img;
    portada.style.backgroundRepeat = 'no-repeat';
    portada.style.backgroundPosition = 'center';
    portada.style.backgroundAttachment = 'fixed';
    portada.style.backgroundSize = 'cover';
};

cambiarPortada(img2)
setInterval(() => {
    if (contador == 0){
        cambiarPortada(img2);
        contador++;
    } else if (contador == 1){
        cambiarPortada(img1);
        contador++;
    } else {
        cambiarPortada(img3);
        contador = 0;
    }
}, 10000);

class SliderUniversal{
    constructor(padre, botonD, botonI){
        this.padre = padre;
        this.posicionI = 0; this.posicionF = 0; this.posicionS = 0;
        this.bool = true; this.bool2 = true; this.drag = true; this.bool3 = false; this.marginL = 0;
        this.botonD = botonD; this.botonI = botonI; this.margin = 0; // ojo el margin actual del elemento
        this.animacion = null; this.na = false;
    }

    verifica2 = () => {
        let hijo = this.padre.firstElementChild;
        let margin = parseInt(window.getComputedStyle(hijo).marginRight);
        let w = hijo.offsetWidth;

        if (Math.abs(this.margin) >= (w + margin) * 2) {
            this.margin = 0;
            this.posicionS = 0;
            this.marginL = 0;
            this.posicionI = this.posicionF;
            let hi = (!this.bool3) ? this.padre.firstElementChild : this.padre.lastElementChild;
            hijo.style.marginLeft = '0';
            let clon = hi.cloneNode(true);
            (this.bool3) ? this.padre.insertBefore(clon, this.padre.firstElementChild) : this.padre.appendChild(clon);
            this.padre.removeChild(hi)
        }
    }

    animaDelete = () => {
        let hijo = this.padre.firstElementChild;
        let margin = parseInt(window.getComputedStyle(hijo).marginRight);
        let w = hijo.offsetWidth;
        (this.bool3) ? this.margin -= 34 : this.margin += 34; // Ojo la velocidad tiene que ser multiplo de "(w + margin) * 2"

        hijo.style.marginLeft = `${this.margin}px`;
        if (Math.abs(this.margin) >= (w + margin) * 2) {
            let hi = (this.bool3) ? this.padre.firstElementChild : this.padre.lastElementChild;
            hijo.style.marginLeft = '0';
            this.margin = 0;
            this.bool2 = false; this.bool4 = false;
            let clon = hi.cloneNode(true);
            this.posicionS = 0;
            this.drag =true;
            (!this.bool3) ? this.padre.insertBefore(clon, this.padre.firstElementChild) : this.padre.appendChild(clon);
            this.padre.removeChild(hi);
            cancelAnimationFrame(this.animacion)
        }

        if (this.bool2) requestAnimationFrame(this.animaDelete);
    }

    animaDelete2 = () => {
        let hijo = this.padre.firstElementChild;
        this.margin = this.posicionS * 2;

        hijo.style.marginLeft = `${this.margin}px`;

        if (this.bool2) requestAnimationFrame(this.animaDelete2);
    }

    posicionX = (e) => {return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;}

    mouseDown = (e) => {
        if (this.bool && this.drag) {
            this.bool = false;
            this.bool2 = true;
            this.posicionS = this.margin / 2;
            (this.na) ? this.na = false: this.na = true;
            this.posicionI = this.posicionX(e);
            this.posicionF = this.posicionI;
            this.marginL =  parseInt(window.getComputedStyle(this.padre.firstElementChild).marginLeft.split('p')[0]);
            
            this.animacion = requestAnimationFrame(this.animaDelete2);
        }
    }
    
    mouseMove = (e) => {
        if (!this.bool) {
            this.posicionF = this.posicionX(e);
            this.posicionS = this.posicionF - this.posicionI + this.marginL / 2;
            this.verifica2();
            this.posicionF -this.posicionI > 0 ? this.bool3 = true : this.bool3 = false;
        }
    }

    animaNa = () => {
        let hijo = this.padre.firstElementChild;
        this.margin += (this.margin > 0) ? -10 : 10;
        hijo.style.marginLeft = `${this.margin}px`;
        
        if (this.margin > -10 && this.margin < 10) {
            this.margin = 0;
            this.na = false;
            hijo.style.marginLeft = '0';
            cancelAnimationFrame(this.animacion)
        }
        if (this.na) requestAnimationFrame(this.animaNa)
    }

    animaNomas = () => {
        let hijo = this.padre.firstElementChild;
        let w = hijo.offsetWidth;
        let margin = parseInt(window.getComputedStyle(hijo).marginRight.split('p')[0])
        this.margin += (this.margin > 0) ? 20 : -20;
        hijo.style.marginLeft = `${this.margin}px`;

        if (Math.abs(this.margin) >= (w + margin) * 2){
            this.na = false;
            hijo.style.marginLeft = '0';
            let hi = (this.margin > 0) ? this.padre.lastElementChild: this.padre.firstElementChild;
            let clon = hi.cloneNode(true);
            (this.margin > 0) ? this.padre.insertBefore(clon, this.padre.firstElementChild) : this.padre.appendChild(clon);
            this.padre.removeChild(hi)
            this.margin = 0;

            cancelAnimationFrame(this.animacion)
        }

        if (this.na) requestAnimationFrame(this.animaNomas);
    }

    mouseUp = () => {
        if (!this.bool) {
            this.bool = true;
            this.bool3 = false;
            this.bool2 = true;
            this.na = true;
            if (this.drag) this.bool2 = false;
            cancelAnimationFrame(this.animacion)
            
            if (this.margin != 0) {
                if (Math.abs(this.margin) <= 100) {this.animacion = requestAnimationFrame(this.animaNa)}
                if (Math.abs(this.margin) > 100) {this.animacionn = requestAnimationFrame(this.animaNomas)} 
            }
        }
    }
    // Los botones Izquierda y Derecha
    verifica = (bool) => {
        if (!this.bool4) {
            this.bool2 = true;
            this.bool3 = bool;
            this.drag = false;
            this.bool4 = true;
    
            this.animacion = requestAnimationFrame(this.animaDelete)
        }
    }
}

const slider1 = new SliderUniversal(contPlatillos, botonD, botonI)

slider1.padre.addEventListener('mousedown', slider1.mouseDown);
slider1.padre.addEventListener('mousemove', slider1.mouseMove);
slider1.padre.addEventListener('mouseup', slider1.mouseUp);
slider1.padre.addEventListener('mouseleave', slider1.mouseUp);

slider1.padre.addEventListener('touchstart', slider1.mouseDown);
slider1.padre.addEventListener('touchmove', slider1.mouseMove);
slider1.padre.addEventListener('touchend', slider1.mouseUp);

slider1.botonD.addEventListener('click', () => {slider1.verifica(true)})
slider1.botonI.addEventListener('click', () => {slider1.verifica(false)});

const slider2 = new SliderUniversal(contBebidas, botonD2, botonI2)

slider2.padre.addEventListener('mousedown', slider2.mouseDown);
slider2.padre.addEventListener('mousemove', slider2.mouseMove);
slider2.padre.addEventListener('mouseup', slider2.mouseUp);
slider2.padre.addEventListener('mouseleave', slider2.mouseUp);

slider2.padre.addEventListener('touchstart', slider2.mouseDown);
slider2.padre.addEventListener('touchmove', slider2.mouseMove);
slider2.padre.addEventListener('touchend', slider2.mouseUp);

slider2.botonD.addEventListener('click', () => {slider2.verifica(true)})
slider2.botonI.addEventListener('click', () => {slider2.verifica(false)})