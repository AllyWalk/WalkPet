// header.js
const SESSION_STORAGE_KEY = 'walkpet-session';
const RETURN_URL_KEY = 'walkpet-return-url';

function resolveAppUrl(path) {
    if (!path) return path;
    if (path.startsWith('/')) {
        return new URL(path.slice(1), window.location.origin).toString();
    }
    return new URL(path, window.location.href).toString();
}

function obtenerSesionLocal() {
    try {
        const valor = localStorage.getItem(SESSION_STORAGE_KEY);
        return valor ? JSON.parse(valor) : null;
    } catch (error) {
        console.warn('No se pudo leer la sesión local:', error);
        return null;
    }
}

function guardarSesionLocal(sesion) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sesion));
    window.dispatchEvent(new Event('auth:changed'));
}

function limpiarSesionLocal() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(RETURN_URL_KEY);
    window.dispatchEvent(new Event('auth:changed'));
}

function guardarDestinoAntesDeLogin(destino) {
    if (!destino || destino.includes('/IniciarSesion.html')) return;
    localStorage.setItem(RETURN_URL_KEY, destino);
}

function obtenerDestinoDespuesDeLogin() {
    try {
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get('redirect');
        if (redirectParam) return redirectParam;
    } catch (error) {
        console.warn('No se pudo leer el redirect:', error);
    }

    try {
        return localStorage.getItem(RETURN_URL_KEY) || '/Paginas/perfilUsuarios.html';
    } catch (error) {
        return '/Paginas/perfilUsuarios.html';
    }
}

function estaAutenticado() {
    return obtenerSesionLocal()?.activo === true;
}

function redirigirALogin(origen = null) {
    const destino = origen || window.location.pathname + window.location.search + window.location.hash;
    guardarDestinoAntesDeLogin(destino);
    const loginUrl = new URL(resolveAppUrl('/Paginas/IniciarSesion.html'));
    if (destino && !destino.includes('/IniciarSesion.html')) {
        loginUrl.searchParams.set('redirect', destino);
    }
    window.location.href = `${loginUrl.pathname}${loginUrl.search}${loginUrl.hash}`;
}

function redirigirDespuesDeLogin() {
    const destino = obtenerDestinoDespuesDeLogin();
    if (!destino) {
        window.location.href = '/Paginas/perfilUsuarios.html';
        return;
    }

    const destinoFinal = destino.startsWith('http')
        ? destino
        : resolveAppUrl(destino.startsWith('/') ? destino : `/${destino}`);

    window.location.href = destinoFinal;
}

function ajustarEnlacesHeader(rootElement) {
    if (!rootElement) return;
    const enlaces = rootElement.querySelectorAll('a[href]');
    enlaces.forEach((enlace) => {
        const href = enlace.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;
        if (href.startsWith('/')) {
            enlace.setAttribute('href', resolveAppUrl(href));
        }
    });
}

function actualizarEstadoHeader() {
    const badge = document.getElementById('user-badge');
    const username = document.getElementById('header-username');
    const userIcon = document.getElementById('header-user-icon');

    if (!badge || !username || !userIcon) return;

    const sesion = obtenerSesionLocal();

    if (sesion?.activo) {
        username.textContent = sesion.nombre || 'Noé Quintero';
        userIcon.innerHTML = '<i data-lucide="user" class="w-4 h-4"></i>';
        badge.setAttribute('href', '/Paginas/perfilUsuarios.html');
        badge.classList.remove('bg-violet-50/60', 'border-violet-100', 'text-violet-700');
        badge.classList.add('bg-emerald-50/60', 'border-emerald-100', 'text-emerald-700');
    } else {
        username.textContent = '';
        userIcon.textContent = '?';
        badge.setAttribute('href', '/Paginas/IniciarSesion.html');
        badge.classList.remove('bg-emerald-50/60', 'border-emerald-100', 'text-emerald-700');
        badge.classList.add('bg-violet-50/60', 'border-violet-100', 'text-violet-700');
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function getFallbackHeaderMarkup() {
    return `
        <header class="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50 transition-all">
            <div class="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                <a href="/" class="flex items-center gap-2">
                    <div class="w-[60px] h-auto flex items-center justify-center overflow-hidden">
                        <img src="/images/WalkPet 2.png" alt="WalkPet Logo" class="w-full h-auto object-contain block">
                    </div>
                    <span class="text-xl font-black text-gray-800 tracking-tight">Walk<span class="text-emerald-500">Pet</span></span>
                </a>
                <nav class="flex items-center gap-3 text-sm font-semibold text-gray-600">
                    <a href="/Paginas/Catalogo.html" class="hover:text-violet-700">Catálogo</a>
                    <a href="/Paginas/Market.html" class="hover:text-violet-700">Market</a>
                    <a href="/Paginas/IniciarSesion.html" class="text-emerald-600 hover:text-emerald-700">Iniciar sesión</a>
                </nav>
            </div>
        </header>
    `;
}

async function cargarHeader() {
    const headerElement = document.getElementById('main-header') || document.getElementById('header-container');

    if (!headerElement) {
        console.warn('No se encontró el contenedor del header en el DOM.');
        return;
    }

    try {
        const respuesta = await fetch(resolveAppUrl('/header.html'));
        if (!respuesta.ok) throw new Error(`HTTP error! status: ${respuesta.status}`);

        const data = await respuesta.text();
        headerElement.innerHTML = data;
        ajustarEnlacesHeader(headerElement);
        actualizarEstadoHeader();
    } catch (e) {
        console.error('Error al cargar el header:', e);
        headerElement.innerHTML = getFallbackHeaderMarkup();
        ajustarEnlacesHeader(headerElement);
        actualizarEstadoHeader();
    }
}

document.addEventListener('DOMContentLoaded', cargarHeader);
window.addEventListener('auth:changed', actualizarEstadoHeader);
window.cargarHeader = cargarHeader;
window.actualizarEstadoHeader = actualizarEstadoHeader;
window.resolveAppUrl = resolveAppUrl;
window.walkpetAuth = {
    SESSION_STORAGE_KEY,
    RETURN_URL_KEY,
    resolveAppUrl,
    obtenerSesionLocal,
    guardarSesionLocal,
    limpiarSesionLocal,
    estaAutenticado,
    guardarDestinoAntesDeLogin,
    obtenerDestinoDespuesDeLogin,
    redirigirALogin,
    redirigirDespuesDeLogin
};
window.estaAutenticado = estaAutenticado;