let productosData = [];

function estaAutenticado() {
    try {
        return JSON.parse(localStorage.getItem('walkpet-session') || 'null')?.activo === true;
    } catch (error) {
        return false;
    }
}

function redirigirALogin(origen = null) {
    const destino = origen || window.location.pathname + window.location.search + window.location.hash;
    if (destino && !destino.includes('/IniciarSesion.html')) {
        localStorage.setItem('walkpet-return-url', destino);
    }

    const loginUrl = new URL('/Paginas/IniciarSesion.html', window.location.origin);
    loginUrl.searchParams.set('redirect', destino);
    window.location.href = loginUrl.toString();
}

function mostrarPopupSimulado(titulo, mensaje) {
    const popupExistente = document.getElementById('popup-simulado');
    if (popupExistente) popupExistente.remove();

    const popup = document.createElement('div');
    popup.id = 'popup-simulado';
    popup.className = 'fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4';
    popup.innerHTML = `
        <div class="bg-white rounded-[32px] shadow-2xl p-8 max-w-md w-full text-center transform transition-all duration-300 scale-95 animate-[popIn_0.25s_ease-out_forwards]">
            <button type="button" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onclick="this.closest('#popup-simulado').remove()">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <i data-lucide="check-circle" class="w-8 h-8 text-emerald-600"></i>
            </div>
            <h3 class="text-2xl font-black text-gray-900">${titulo}</h3>
            <p class="mt-3 text-sm text-gray-600">${mensaje}</p>
            <div class="mt-6 h-2 rounded-full bg-emerald-100 overflow-hidden">
                <div class="h-full w-full bg-emerald-500 rounded-full animate-[loadingBar_2.2s_linear_forwards]"></div>
            </div>
        </div>
    `;

    document.body.appendChild(popup);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => {
        popup.classList.add('opacity-0');
        setTimeout(() => popup.remove(), 250);
    }, 2200);
}

function manejarAccionProtegida(titulo, mensaje) {
    if (!estaAutenticado()) {
        redirigirALogin();
        return false;
    }

    mostrarPopupSimulado(titulo, mensaje);
    return true;
}

async function iniciarApp() {
    await cargarHeader(); // Primero cargamos el header
    await init();         // Luego cargamos los productos (tu función original)
    renderCarrito();      // Finalmente renderizamos el carrito
    renderPromocionesHero();
}

// Ejecutar todo al cargar la página
document.addEventListener('DOMContentLoaded', iniciarApp);
async function init() {
    try {
        const respuesta = await fetch('/productos.json');
        productosData = await respuesta.json();
        renderizar(productosData);
    } catch (e) { console.error("Error al cargar productos:", e); }
}

// 1. Renderizado de productos
function renderizar(lista) {
    const grid = document.getElementById('productos-grid');
    if (!grid) return;

    grid.innerHTML = lista.map(p => `
        <div class="bg-white border rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
                <div class="w-full h-40 bg-gray-50 rounded-xl flex items-center justify-center mb-4 relative">
                    <span class="absolute top-2 left-2 ${p.badgeColor} text-[10px] font-bold px-2 py-1 rounded-full">${p.etiqueta}</span>
                    <img src="${p.imagen}" alt="${p.titulo}" class="w-20 h-20 object-contain">
                </div>
                <h3 class="font-black text-gray-800 mb-1">${p.titulo}</h3>
                <p class="text-xs text-gray-500 mb-3 line-clamp-2">${p.descripcion}</p>
                <button onclick="verDetalles(${p.id})" class="text-xs text-violet-600 font-bold hover:underline mb-4">Ver detalles</button>
            </div>
            <div>
                <span class="text-xl font-black mb-3 block">$${p.precio.toFixed(2)}</span>
                <div class="flex gap-2">
                    <input type="number" id="cant-${p.id}" value="1" min="1" class="w-16 p-2 border rounded-xl text-center font-bold text-sm">
                    <button onclick="agregarAlCarrito(${p.id})" class="flex-1 bg-violet-700 text-white font-black py-2 rounded-xl text-xs hover:bg-violet-800 transition-colors">
                        Agregar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// 2. Lógica Modal Detalles
function verDetalles(id) {
    const p = productosData.find(item => item.id === id);
    if (!p) return;
    
    const modal = document.getElementById('modal-producto');
    document.getElementById('modal-titulo').textContent = p.titulo;
    document.getElementById('modal-descripcion').textContent = p.descripcion;
    document.getElementById('modal-precio').textContent = `$${p.precio.toFixed(2)}`;
    
    // Conectar botón agregar del modal
    const btn = document.getElementById('modal-btn-agregar');
    btn.onclick = () => { agregarAlCarrito(p.id); cerrarModalDetalles(); };

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => modal.classList.add('opacity-100'), 10);
}

function cerrarModalDetalles() {
    const modal = document.getElementById('modal-producto');
    modal.classList.remove('opacity-100');
    setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 300);
}

// 3. Lógica Modal Recomendados
function agregarAlCarrito(id) {
    if (!estaAutenticado()) {
        redirigirALogin();
        return;
    }

    const p = productosData.find(item => item.id === id);
    const cantidad = document.getElementById(`cant-${id}`)?.value || 1;
    
    console.log(`Agregando ${cantidad} unidad(es) de: ${p.titulo}`);
    mostrarPopupSimulado('Añadido con éxito', 'Producto añadido al carrito');

    const modalRec = document.getElementById('modal-recomendados');
    const gridRec = document.getElementById('grid-recomendados');
    
    const sugerencias = productosData
        .filter(item => item.categoria === p.categoria && item.id !== p.id)
        .slice(0, 2);
    gridRec.innerHTML = sugerencias.map(s => `
        <div class="group border border-gray-100 rounded-2xl p-4 hover:border-violet-300 hover:shadow-lg transition-all duration-300 flex flex-col items-center">
            <img src="${s.imagen}" class="w-20 h-20 mb-3 object-contain group-hover:scale-110 transition-transform">
            <p class="text-xs font-bold text-gray-700 text-center mb-1 line-clamp-1">${s.titulo}</p>
            <span class="text-lg font-black text-violet-700 mb-3">$${s.precio.toFixed(2)}</span>
            <button onclick="agregarAlCarrito(${s.id})" class="w-full py-2 bg-gray-50 group-hover:bg-violet-700 group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors">
                Agregar +
            </button>
        </div>
    `).join('');

    modalRec.classList.remove('hidden');
    modalRec.classList.add('flex');
    setTimeout(() => modalRec.classList.add('opacity-100'), 10);
}

function cerrarModalRecomendados() {
    const modal = document.getElementById('modal-recomendados');
    modal.classList.remove('opacity-100');
    setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 300);
}

function renderPromocionesHero() {
    const contenedor = document.getElementById('contenedor-promociones');
    const promocionesSimuladas = [
        { titulo: 'Primavera Saludable', descripcion: '20% en productos de cuidado e higiene', codigo: 'PRIMAVERA20' },
        { titulo: 'Envío Gratis', descripcion: 'Envío sin costo en compras mayores a $500', codigo: 'ENVIOFREE' },
        { titulo: 'Pack Mascota', descripcion: '15% en kits de aseo y accesorios', codigo: 'PACK15' }
    ];

    contenedor.innerHTML = promocionesSimuladas.map(p => `
        <div class="bg-white/10 border border-white/15 rounded-3xl p-5 shadow-sm backdrop-blur-sm">
            <p class="text-[11px] uppercase tracking-[0.3em] text-white/80 font-bold mb-3">Promoción vigente</p>
            <h4 class="font-black text-white text-lg mb-2">${p.titulo}</h4>
            <p class="text-sm text-white/80 mb-4">${p.descripcion}</p>
            <div class="flex items-center justify-between gap-3">
                <span class="text-[10px] uppercase tracking-[0.3em] text-white/70 font-bold">Código</span>
                <span class="text-xs font-black text-white">${p.codigo}</span>
            </div>
        </div>
    `).join('');
}

function togglePromocionesHero() {
    const contenedor = document.getElementById('contenedor-promociones');
    const boton = document.getElementById('btn-toggle-promociones');
    if (!contenedor || !boton) return;

    if (!contenedor.innerHTML.trim()) {
        renderPromocionesHero();
    }

    const abierto = !contenedor.classList.contains('hidden');
    if (abierto) {
        contenedor.classList.add('hidden');
        boton.textContent = 'Ver promociones vigentes';
    } else {
        contenedor.classList.remove('hidden');
        boton.textContent = 'Ocultar promociones';
        contenedor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function validarCodigoPromocion() {
    const codigo = document.getElementById('input-codigo-promocion').value.trim().toUpperCase();
    const mensaje = document.getElementById('mensaje-promocion');
    const codigosValidos = ['PRIMAVERA20', 'ENVIOFREE', 'PACK15', 'VIP25'];

    mensaje.classList.remove('text-emerald-600');
    mensaje.classList.remove('text-red-600');
    mensaje.classList.add('text-red-200');

    if (!codigo || !codigosValidos.includes(codigo)) {
        mensaje.textContent = 'Promoción no válida';
        mensaje.classList.remove('hidden');
        return;
    }

    mensaje.textContent = '¡Código válido! Oferta aplicada.';
    mensaje.classList.remove('hidden');
    mensaje.classList.remove('text-red-200');
    mensaje.classList.add('text-emerald-200');
}

// 4. Listeners generales
document.getElementById('btn-cerrar-modal')?.addEventListener('click', cerrarModalDetalles);
document.getElementById('btn-cerrar-recomendados')?.addEventListener('click', cerrarModalRecomendados);
document.getElementById('btn-seguir-comprando')?.addEventListener('click', cerrarModalRecomendados);
document.getElementById('btn-aplicar-promocion')?.addEventListener('click', validarCodigoPromocion);
document.getElementById('btn-toggle-promociones')?.addEventListener('click', togglePromocionesHero);

// Cierre al dar clic fuera de los modales
window.addEventListener('click', (e) => {
    const m1 = document.getElementById('modal-producto');
    const m2 = document.getElementById('modal-recomendados');
    if (e.target === m1) cerrarModalDetalles();
    if (e.target === m2) cerrarModalRecomendados();
});

// 5. Buscador y Filtros
document.getElementById('input-busqueda')?.addEventListener('input', (e) => {
    const b = e.target.value.toLowerCase();
    renderizar(productosData.filter(p => p.titulo.toLowerCase().includes(b) || p.descripcion.toLowerCase().includes(b)));
});

document.querySelectorAll('.btn-filtro').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const cat = e.target.dataset.target;
        document.querySelectorAll('.btn-filtro').forEach(b => {
            b.classList.remove('bg-violet-700', 'text-white', 'shadow-sm');
            b.classList.add('bg-gray-100', 'text-gray-600');
            if (b.dataset.target === 'ofertas') {
                b.classList.remove('text-white');
                b.classList.add('text-red-600', 'border', 'border-red-100');
            } else {
                b.classList.remove('text-red-600', 'border', 'border-red-100');
            }
        });

        btn.classList.add('bg-violet-700', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-gray-100', 'text-gray-600', 'border', 'border-red-100');

        renderizar(cat === 'todos' ? productosData : productosData.filter(p => p.categoria === cat));
    });
});

        let carrito = [
            { id: 1, nombre: "Cama Ortopédica", precio: 650, cantidad: 1, img: "/images/Cama Ortopedica.jpg" },
            { id: 2, nombre: "Juguete Dispensador", precio: 120, cantidad: 1, img: "/images/Dispensador.jpg" }
        ];

        function renderCarrito() {
            const container = document.getElementById('lista-carrito');
            container.innerHTML = '';
            let total = 0;

            carrito.forEach(item => {
                total += item.precio * item.cantidad;
                container.innerHTML += `
                    <div class="flex items-center gap-6">
                        <div class="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center">
                            <img src="${item.img}" class="w-12 h-12 object-contain">
                        </div>
                        <div class="flex-1">
                            <h3 class="font-bold">${item.nombre}</h3>
                            <p class="text-violet-600 font-semibold">$${item.precio.toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col items-end gap-2">
                            <div class="flex items-center bg-slate-50 rounded-full p-1 border">
                                <button onclick="cambiarCantidad(${item.id}, -1)" class="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full">-</button>
                                <span class="w-8 text-center font-bold">${item.cantidad}</span>
                                <button onclick="cambiarCantidad(${item.id}, 1)" class="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full">+</button>
                            </div>
                            <button onclick="eliminarProducto(${item.id})" class="text-slate-400 hover:text-red-500 text-xs flex items-center gap-1">
                                <i data-lucide="trash-2" class="w-3 h-3"></i> Eliminar
                            </button>
                        </div>
                    </div>
                `;
            });
            document.getElementById('total-final').innerText = `$${total.toFixed(2)}`;
            lucide.createIcons();
        }

        function cambiarCantidad(id, delta) {
            const item = carrito.find(p => p.id === id);
            if (item) {
                item.cantidad += delta;
                if (item.cantidad <= 0) {
                    eliminarProducto(id);
                } else {
                    renderCarrito();
                }
            }
        }

        function eliminarProducto(id) {
            carrito = carrito.filter(p => p.id !== id);
            mostrarToast();
            renderCarrito();
        }

        function mostrarToast() {
            const toast = document.getElementById('toast');
            toast.classList.remove('translate-y-[-100px]');
            setTimeout(() => toast.classList.add('translate-y-[-100px]'), 2000);
        }