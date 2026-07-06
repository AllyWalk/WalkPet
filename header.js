// header.js
async function cargarHeader() {
    // Busca cualquiera de los dos IDs posibles para ser flexible
    const headerElement = document.getElementById('main-header') || document.getElementById('header-container');
    
    if (!headerElement) {
        console.warn("No se encontró el contenedor del header en el DOM.");
        return;
    }

    try {
        const respuesta = await fetch('/header.html');
        if (!respuesta.ok) throw new Error(`HTTP error! status: ${respuesta.status}`);
        
        const data = await respuesta.text();
        headerElement.innerHTML = data;

        // Recargar iconos de Lucide
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (e) {
        console.error("Error al cargar el header:", e);
    }
}

document.addEventListener('DOMContentLoaded', cargarHeader);