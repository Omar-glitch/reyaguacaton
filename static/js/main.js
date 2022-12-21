const header = document.querySelector('#header');
const lista = document.querySelector('.header-lista ul');
const boton_to_top = document.querySelector('.mover-arriba');
let tog = true;
let btnLista = document.querySelector('header .barras');
const barras = document.querySelectorAll('.barras .lineSi');

if (document.querySelector('#editar-user')){
    const bEditarUsuario = document.querySelector('#editar-user');  

    bEditarUsuario.addEventListener('click', (e) => {
        e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();
        window.location = `${window.origin}/user`;
        console.log(bEditarUsuario)
    })
}

if (document.querySelector('#superImg')){
    const superImg = document.querySelector('#superImg');
    const d = new Date();
    superImg.src =  `${superImg.src}?timestamp=` + d.getTime();
}

btnLista.addEventListener('click', () => {
    barras[0].classList.toggle('animaBarras1');
    barras[1].classList.toggle('animaBarras2');
    barras[2].classList.toggle('animaBarras3');

    lista.style.transition = "left .4s";
    lista.style.left = (tog) ? '0' : "-100%";

    tog = !tog;
});

const transitionend = () => {lista.style.transition = "none";}
lista.addEventListener('transitionend', transitionend);

const imgUser = document.querySelector('.img-usuario');

let posicion = window.pageYOffset;

const background_header = () => {
    let nposicion = window.pageYOffset;
    boton_to_top.style.right = (nposicion > 300) ? "0.625rem" : "-6.25rem";
    header.style.top = (nposicion > posicion) ? `-${header.offsetHeight / 16}rem` : 0;
    header.style.boxShadow = (nposicion > 150) ? "0 0 0.3125rem var(--dark)" : "none";
    header.firstElementChild.style.background = (nposicion > 150) ? "var(--darkgreen)" : "transparent";
    header.children[1].style.background = (nposicion > 150) ? "var(--light)" : "transparent";
    
    lista.style.setProperty("--color", nposicion > 150 ? "var(--darkgreen)" : "var(--light)");
    lista.style.setProperty("--color2", nposicion > 150 ? "var(--light)" : "var(--dark)");
    
    posicion = nposicion;
}

window.addEventListener('scroll', background_header)

background_header();

boton_to_top.addEventListener('click', () => {window.scroll(0, 0);})