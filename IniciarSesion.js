    const SESSION_STORAGE_KEY = 'walkpet-session';

    document.addEventListener("DOMContentLoaded", () => {
        // Inicializar iconos de Lucide al cargar la app
        lucide.createIcons();

        // Elementos de las vistas
        const vistaLogin = document.getElementById("vista-login");
        const vistaRegistro = document.getElementById("vista-registro");
        const vistaOlvido = document.getElementById("vista-olvido");

        // Formularios
        const formLogin = document.getElementById("form-login");
        const formRegistro = document.getElementById("form-registro");
        const formOlvido = document.getElementById("form-olvido");

        // Botones de acción de navegación
        const btnIrRegistro = document.getElementById("btn-ir-registro");
        const btnIrOlvido = document.getElementById("btn-ir-olvido");
        const btnVolverLogin1 = document.getElementById("btn-volver-login-1");
        const btnVolverLogin2 = document.getElementById("btn-volver-login-2");

        // Contenedor para los mensajes informativos flotantes
        const contenedorAlertas = document.getElementById("contenedor-alertas");
        const labelTerminos = document.getElementById("label-terminos");
        const linkTerminos = document.getElementById("link-terminos");
        const linkPrivacidad = document.getElementById("link-privacidad");
        const modalTerminos = document.getElementById("modal-terminos");
        const btnCerrarTerminos = document.getElementById("btn-cerrar-terminos");

        function abrirModalTerminos(e) {
            if (e) e.preventDefault();
            modalTerminos.classList.remove("hidden");
            modalTerminos.classList.add("flex");
        }

        function cerrarModalTerminos() {
            modalTerminos.classList.add("hidden");
            modalTerminos.classList.remove("flex");
        }

        // Función para mostrar mensajes dinámicos flotantes (Toast)
        function mostrarMensaje(texto, colorClase) {
            const alerta = document.createElement("div");
            alerta.className = `p-4 text-xs font-bold text-white ${colorClase} rounded-xl shadow-lg transition-all duration-300 opacity-0 transform translate-y-2 flex items-center gap-2 pointer-events-auto`;
            alerta.innerHTML = `<i data-lucide="info" class="w-4 h-4"></i> <span>${texto}</span>`;
            
            contenedorAlertas.appendChild(alerta);
            lucide.createIcons(); // Renderiza los nuevos iconos inyectados

            // Forzar reflow para animación de entrada
            setTimeout(() => {
                alerta.classList.remove("opacity-0", "translate-y-2");
            }, 10);

            // Desvanecer y remover después de 3.5 segundos
            setTimeout(() => {
                alerta.classList.add("opacity-0", "translate-y-2");
                setTimeout(() => alerta.remove(), 300);
            }, 3500);
        }

        // Función reutilizable para cambiar de pantalla con animación fluida
        function cambiarVista(vistaAOcultar, vistaAMostrar) {
            vistaAOcultar.classList.add("opacity-0", "scale-95");
            vistaAOcultar.classList.remove("scale-100");
            
            setTimeout(() => {
                vistaAOcultar.classList.add("hidden");
                vistaAMostrar.classList.remove("hidden");
                
                setTimeout(() => {
                    vistaAMostrar.classList.remove("opacity-0", "scale-95");
                    vistaAMostrar.classList.add("scale-100");
                }, 20);
            }, 200);
        }

        // Eventos para interactuar entre pantallas convencionales
        btnIrRegistro.addEventListener("click", () => cambiarVista(vistaLogin, vistaRegistro));
        labelTerminos.addEventListener("click", abrirModalTerminos);
        linkTerminos.addEventListener("click", abrirModalTerminos);
        linkPrivacidad.addEventListener("click", abrirModalTerminos);
        btnCerrarTerminos.addEventListener("click", cerrarModalTerminos);
        modalTerminos.addEventListener("click", (e) => {
            if (e.target === modalTerminos) cerrarModalTerminos();
        });
        btnIrOlvido.addEventListener("click", () => cambiarVista(vistaLogin, vistaOlvido));
        btnVolverLogin1.addEventListener("click", () => cambiarVista(vistaRegistro, vistaLogin));
        btnVolverLogin2.addEventListener("click", () => cambiarVista(vistaOlvido, vistaLogin));

        // ACCIÓN: Envío de Login (Redirección directa sin validar)
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ activo: true, nombre: 'Noé Quintero' }));
            window.dispatchEvent(new Event('auth:changed'));
            const destino = new URLSearchParams(window.location.search).get('redirect') || localStorage.getItem('walkpet-return-url') || '/Paginas/perfilUsuarios.html';
            const destinoFinal = destino.startsWith('http') ? destino : new URL(destino.startsWith('/') ? destino.slice(1) : destino, window.location.origin).toString();
            window.location.href = destinoFinal;
        });

        // ACCIÓN: Envío de Registro (Volver a login + Mensaje exitoso sin validar)
        formRegistro.addEventListener("submit", (e) => {
            e.preventDefault();
            formRegistro.reset(); 
            cambiarVista(vistaRegistro, vistaLogin);
            mostrarMensaje("Registrado con éxito", "bg-emerald-600");
        });

        // ACCIÓN: Recuperar contraseña (Mensaje de envío exitoso sin validar)
        formOlvido.addEventListener("submit", (e) => {
            e.preventDefault();
            formOlvido.reset(); 
            mostrarMensaje("Envío exitoso", "bg-blue-600");
        });
    });
