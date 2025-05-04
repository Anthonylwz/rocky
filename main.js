// Espera a que el DOM esté completamente cargado y listo
document.addEventListener('DOMContentLoaded', function() {

    console.log("Buscando a Rocky - JS Iniciado");

    // --- CONFIGURACIÓN INICIAL (¡AJUSTAR ESTOS VALORES!) ---
    // Fecha y hora aproximada de desaparición (¡Asegúrate que coincida con el texto del HTML!)
    const disappearanceDateString = '2025-05-03T09:00:00'; // FORMATO: YYYY-MM-DDTHH:mm:ss (Sábado 3 Mayo 2025, 9 AM)
    
    // Coordenadas [Latitud, Longitud] de la última ubicación conocida
    // ¡¡IMPORTANTE!! ACTUALIZA ESTAS COORDENADAS CON LA UBICACIÓN REAL
    const lastSeenCoords = [-12.0464, -77.0428]; // [Latitud, Longitud] (Ejemplo: Plaza Mayor, Lima, Perú)
    
    const mapInitialZoom = 15; // Zoom inicial del mapa
    const mapMaxZoom = 18;     // Zoom máximo permitido

    // Texto para el popup del marcador principal en el mapa
    const mapMarkerPopupText = `<b>¡Rocky fue visto aquí por última vez!</b><br>Aprox. ${new Date(disappearanceDateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} a las ${new Date(disappearanceDateString).toLocaleTimeString('es-ES', { hour: '2-digit', minute:'2-digit' })}`;
    
    // Textos para compartir (asegúrate que coincidan con los meta tags si es posible)
    const shareInfo = {
        title: "¡URGENTE! Buscando a Rocky",
        text: `Ayúdanos a encontrar a Rocky, cachorro Pitbull perdido en [Actualiza Ciudad/Distrito aquí] desde el ${new Date(disappearanceDateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}. ¡Tiene heterocromía! #BuscandoARocky Más info aquí:`,
        url: window.location.href 
    };


    // --- FUNCIONES AUXILIARES ---

    // Calcular días transcurridos desde una fecha hasta hoy
    function calculateDaysMissing(startDateString) {
        try {
            const startDate = new Date(startDateString);
            const today = new Date();
            // Normalizar a medianoche para contar días completos
            const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            const timeDiff = todayDay.getTime() - startDay.getTime();
            // Calcula la diferencia en días. Math.max asegura que no sea negativo.
            const daysDiff = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24))); 
            return daysDiff;
        } catch (e) {
            console.error("Error al calcular días desaparecidos:", e);
            return "--"; // Valor por defecto en caso de error
        }
    }

    // --- INICIALIZACIÓN DE ELEMENTOS Y BIBLIOTECAS ---

    // 1. Contador de Días Desaparecido
    const daysCounterElement = document.getElementById('days-counter');
    if (daysCounterElement) {
        const daysMissing = calculateDaysMissing(disappearanceDateString);
        daysCounterElement.textContent = daysMissing;
        console.log(`Días desaparecido calculado: ${daysMissing}`);
    } else {
        console.warn('Elemento #days-counter no encontrado.');
    }

    // 2. Carrusel Principal (Slick Carousel)
    // Asegurarse que jQuery y Slick estén cargados
    if (typeof $ !== 'undefined' && $.fn.slick) { 
        const $mainCarousel = $('#main-photo-carousel');
        if ($mainCarousel.length) {
            $mainCarousel.slick({
                dots: true,           // Mostrar puntos de navegación
                infinite: true,       // Bucle infinito
                speed: 600,           // Velocidad de transición (ms) - más suave
                fade: true,           // Efecto de desvanecimiento
                cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)', // Transición más elegante
                autoplay: true,       // Reproducción automática
                autoplaySpeed: 4500,  // Tiempo entre diapositivas (ms)
                arrows: true,         // Mostrar flechas de navegación
                pauseOnHover: true,   // Pausar al pasar el mouse
                adaptiveHeight: false, // Mantener altura fija (evita saltos si las imágenes varían)
                // Puedes personalizar flechas si usas FontAwesome u otra librería de iconos
                // prevArrow: '<button type="button" class="slick-prev"><i class="fas fa-chevron-left"></i></button>', 
                // nextArrow: '<button type="button" class="slick-next"><i class="fas fa-chevron-right"></i></button>' 
            });
            console.log('Slick Carousel inicializado en #main-photo-carousel');
        } else {
             console.warn('Elemento #main-photo-carousel no encontrado para Slick.');
        }
    } else {
        console.warn('jQuery o Slick Carousel no están cargados. El carrusel principal no funcionará.');
    }

    // 3. Mapa Interactivo (Leaflet)
    const mapElement = document.getElementById('interactive-map');
    if (mapElement && typeof L !== 'undefined') { 
        try {
            // Inicializar mapa
            const map = L.map('interactive-map', {
                 scrollWheelZoom: false // Desactivar zoom con rueda por defecto (mejor UX)
            }).setView(lastSeenCoords, mapInitialZoom);

            // Añadir capa de tiles (mapa base - OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: mapMaxZoom,
            }).addTo(map);
            
            // Añadir control de escala
            L.control.scale().addTo(map);

            // Crear un icono personalizado (pata)
            // ¡NECESITAS CREAR ESTA IMAGEN 'marker-paw-accent.png' y ponerla en tu carpeta 'images'!
            const pawIcon = L.icon({
                iconUrl: 'images/marker-paw-accent.png', 
                iconSize:     [38, 38], // Tamaño del icono [ancho, alto]
                iconAnchor:   [19, 38], // Punto del icono que corresponde a la coordenada [mitad-ancho, alto]
                popupAnchor:  [0, -40] // Punto donde se abre el popup relativo al iconAnchor [eje-x, eje-y]
            });
            
            // Añadir marcador "Última vez visto" con el icono personalizado
            const marker = L.marker(lastSeenCoords, {icon: pawIcon}).addTo(map);
            // Añadir popup al marcador y abrirlo por defecto
            marker.bindPopup(mapMarkerPopupText).openPopup(); 

            // Re-activar zoom con rueda al hacer clic en el mapa
             map.on('click', () => {
               if (!map.scrollWheelZoom.enabled()) {
                 map.scrollWheelZoom.enable();
                 mapElement.style.cursor = 'grab'; // Cambiar cursor para indicar que se puede mover
                 console.log("Scroll wheel zoom activado en mapa.");
               }
             });
             map.on('blur', () => { // Desactivar al salir del mapa (cuando pierde el foco)
                 map.scrollWheelZoom.disable();
                 mapElement.style.cursor = 'pointer'; // Cursor normal
                 console.log("Scroll wheel zoom desactivado en mapa.");
             });

            console.log('Mapa Leaflet inicializado.');
            
             // Futuro: Aquí podrías añadir lógica para otros marcadores (avistamientos) o polígonos (zonas buscadas).

        } catch (e) {
             console.error("Error al inicializar Leaflet:", e);
             mapElement.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--color-error);">Error al cargar el mapa. Verifica las coordenadas y la conexión.</p>'; 
        }

    } else {
         if (!mapElement) console.warn('Elemento del mapa #interactive-map no encontrado.');
         if (typeof L === 'undefined') console.warn('Leaflet.js no está cargado. El mapa no funcionará.');
    }

    // 4. Galería con Lightbox (Lightbox2)
    // Se inicializa automáticamente si los atributos data-lightbox están correctos en el HTML.
    // Opciones globales de configuración (opcional):
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
          'resizeDuration': 300, // Duración animación redimensionado (ms)
          'fadeDuration': 400,   // Duración fade in/out (ms)
          'imageFadeDuration': 400, // Duración fade de la imagen (ms)
          'wrapAround': true,     // Navegar en bucle por la galería
          'disableScrolling': true, // Evitar scroll del fondo al abrir Lightbox
          'albumLabel': "Foto %1 de %2" // Texto traducido para el contador
        });
        console.log('Lightbox2 configurado.');
    } else {
         console.warn('Lightbox2 no está cargado. La galería de fotos no tendrá zoom interactivo.');
    }

    // 5. Formulario de Avistamientos (Validación Frontend y Simulación de Envío)
    const sightingForm = document.getElementById('sighting-form');
    const formConfirmation = document.getElementById('form-confirmation'); // Mensaje de éxito

    if (sightingForm && formConfirmation) {
        sightingForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Previene el envío real del formulario por defecto
            console.log('Intento de envío de formulario de avistamiento.');

            // --- Validación Frontend Simple ---
            let isValid = true;
            // Selecciona todos los campos que tienen el atributo 'required'
            const requiredFields = sightingForm.querySelectorAll('[required]');
            
            // Limpiar errores previos (quitar clase 'validation-error')
            sightingForm.querySelectorAll('.validation-error').forEach(el => el.classList.remove('validation-error'));
            formConfirmation.style.display = 'none'; // Ocultar mensaje de confirmación previo

            requiredFields.forEach(field => {
                // Validación básica: campo no vacío (después de quitar espacios en blanco)
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('validation-error'); // Añadir clase para estilo de error
                    console.warn(`Campo requerido vacío: ${field.name}`); 
                }
                // Podrías añadir más validaciones aquí (ej. formato de email/teléfono) si es necesario
            });

            // --- Procesar si el formulario es válido ---
            if (isValid) {
                console.log('Formulario válido. Simulando envío...');
                const submitButton = sightingForm.querySelector('button[type="submit"]');
                if(submitButton) submitButton.disabled = true; // Deshabilitar botón para evitar envíos múltiples
                
                // --- SIMULACIÓN DE ENVÍO ---
                // ** En una aplicación real, aquí harías la llamada al backend **
                // Ejemplo con fetch():
                // const formData = new FormData(sightingForm);
                // fetch('backend_script.php', { // Reemplaza con tu script de backend
                //     method: 'POST',
                //     body: formData 
                // })
                // .then(response => {
                //     if (!response.ok) { throw new Error('Network response was not ok ' + response.statusText); }
                //     return response.json(); // o response.text() si tu backend no devuelve JSON
                // })
                // .then(data => {
                //     console.log('Respuesta del servidor:', data);
                //     formConfirmation.textContent = "¡Gracias! Tu reporte ha sido recibido."; // Mensaje éxito real
                //     formConfirmation.style.display = 'block'; 
                //     sightingForm.reset(); 
                // })
                // .catch(error => {
                //     console.error('Error en el envío del formulario:', error);
                //     formConfirmation.textContent = "Error al enviar el reporte. Inténtalo de nuevo o contáctanos directamente.";
                //     formConfirmation.style.color = 'var(--color-error)'; // Color rojo para error
                //     formConfirmation.style.display = 'block';
                // })
                // .finally(() => {
                //     if(submitButton) submitButton.disabled = false; // Reactivar botón
                // });

                // --- Simulación de éxito (para demostración sin backend) ---
                setTimeout(() => {
                    formConfirmation.textContent = "¡Gracias! Tu reporte ha sido enviado."; // Mensaje estándar
                    formConfirmation.style.color = 'var(--color-success)'; // Asegurar color verde
                    formConfirmation.style.display = 'block'; 
                    sightingForm.reset(); // Limpiar el formulario
                    if(submitButton) submitButton.disabled = false; // Reactivar botón
                     // Opcional: scroll suave hacia el mensaje de confirmación
                     formConfirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Opcional: Ocultar mensaje después de un tiempo
                    setTimeout(() => {
                        formConfirmation.style.display = 'none';
                    }, 7000); // Ocultar después de 7 segundos
                }, 1000); // Simular un pequeño retraso (como si fuera una llamada de red)

            } else {
                console.error('El formulario contiene errores. No se envió.');
                // Opcional: alertar al usuario (mejor si los estilos CSS ya indican el error)
                // alert('Por favor, revisa los campos marcados en rojo y completa la información requerida.'); 
                 // Opcional: Enfocar el primer campo con error para facilitar la corrección
                 sightingForm.querySelector('.validation-error')?.focus();
            }
        });
         console.log('Listener de submit añadido al formulario #sighting-form.');
    } else {
         if (!sightingForm) console.warn('Formulario #sighting-form no encontrado.');
         if (!formConfirmation) console.warn('Elemento de confirmación #form-confirmation no encontrado.');
    }

    // 6. Actualizar Año en Footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear(); // Obtiene el año actual
        console.log('Año actualizado en footer.');
    } else {
         console.warn('Elemento #current-year no encontrado en footer.');
    }

    // 7. Smooth Scrolling para anclas internas (ej. #about-rocky)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Evitar scroll si es solo '#' o si es un control de librería (Lightbox, Slick)
            if (href === '#' || this.hasAttribute('data-lightbox') || this.closest('.slick-slider')) {
                return; 
            }
            
            try {
                const targetElement = document.querySelector(href);
                if(targetElement) {
                    e.preventDefault(); // Prevenir el salto brusco del navegador
                    
                    // Calcular el offset del header fijo para no tapar el inicio de la sección
                    const headerOffset = document.querySelector('.site-header')?.offsetHeight || 0; // Alto del header o 0 si no existe
                    const elementPosition = targetElement.getBoundingClientRect().top; // Posición relativa al viewport
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 15; // Posición absoluta - alto header - espacio extra

                    // Hacer scroll suave a la posición calculada
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth" // Animación suave
                    });
                    console.log(`Scroll suave hacia: ${href}`);
                }
            } catch (error) {
                 // Capturar errores si el selector del href es inválido
                 console.warn(`No se encontró el elemento para el ancla ${href} o el selector es inválido: ${error}`);
            }
        });
    });
     console.log('Listeners de scroll suave añadidos a las anclas.');

    // 8. Botón Compartir Genérico (Web Share API si está disponible)
    const shareButton = document.getElementById('share-button');
    if (shareButton) {
        shareButton.addEventListener('click', function() {
            if (navigator.share) { // Comprobar si la API Web Share está soportada
                navigator.share({
                    title: shareInfo.title,
                    text: shareInfo.text,
                    url: shareInfo.url,
                })
                .then(() => console.log('Contenido compartido con éxito vía Web Share API.'))
                .catch((error) => console.error('Error al compartir vía Web Share API:', error));
            } else {
                // Fallback si Web Share API no está disponible
                console.warn('Web Share API no soportada en este navegador/dispositivo.');
                // Informar al usuario que use los botones específicos (WhatsApp, Facebook, etc.)
                alert('Tu navegador no permite compartir directamente. Por favor, usa los botones específicos de WhatsApp, Facebook o Twitter que están más abajo.');
                // Opcional: hacer scroll a la sección de botones de redes sociales
                document.querySelector('.social-share-buttons')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        console.log('Listener añadido al botón genérico #share-button.');
    } else {
        console.warn('Botón #share-button no encontrado.');
    }

    // 9. Animaciones de Entrada al Hacer Scroll (Usando Intersection Observer)
    // Selecciona elementos que deben animarse al entrar en pantalla
    const sectionsToAnimate = document.querySelectorAll('.fade-in-section, .timeline-item'); 
    
    // Verificar si Intersection Observer es soportado y si hay elementos para animar
    if ('IntersectionObserver' in window && sectionsToAnimate.length > 0) {
        const observerOptions = {
            root: null, // Observar en relación al viewport
            threshold: 0.1, // El elemento debe estar visible al 10% para disparar la animación
            // rootMargin: '0px 0px -50px 0px' // Opcional: Ajusta el área de observación (ej. dispara 50px antes de que entre completamente)
        };

        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // Si el elemento está intersectando (visible en pantalla)
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible'); // Añadir clase para activar la animación CSS
                    console.log(`Elemento animado por visibilidad: ${entry.target.id || entry.target.className}`);
                    // Opcional: Dejar de observar el elemento una vez que ha sido animado (mejor rendimiento)
                    observer.unobserve(entry.target); 
                }
                 // Opcional: quitar la clase si sale del viewport (para re-animar cada vez que entra)
                 // else { 
                 //     entry.target.classList.remove('is-visible'); 
                 // }
            });
        }, observerOptions);

        // Empezar a observar cada elemento seleccionado
        sectionsToAnimate.forEach(section => {
            sectionObserver.observe(section);
        });
        console.log('Intersection Observer configurado para animaciones de entrada.');

    } else {
         // Fallback si Intersection Observer no es soportado o no hay elementos para animar
         // Simplemente asegura que los elementos sean visibles por defecto
         sectionsToAnimate.forEach(section => {
             section.style.opacity = '1';
             section.style.transform = 'translateY(0)'; // Resetea posible transform inicial
         });
         if (!('IntersectionObserver' in window)) {
            console.warn('Intersection Observer no es soportado por este navegador. Las animaciones de entrada no funcionarán.');
         }
    }


    console.log("Buscando a Rocky - JS Finalizado y listo.");

}); // Fin de DOMContentLoaded