/* =========================================
   Lógica del Tema Oscuro / Claro
   ========================================= */
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const htmlElement = document.documentElement;

// Verificar preferencia guardada en localStorage
const savedTheme = localStorage.getItem('theme');
// Verificar preferencia del sistema operativo
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Inicializar el tema basado en las preferencias
if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);
} else if (prefersDark) {
    htmlElement.setAttribute('data-theme', 'dark');
    updateIcon('dark');
}

// Event listener para el botón de cambio de tema
themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Aplicar nuevo tema
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcon(newTheme);
});

// Función para actualizar el icono del sol/luna
function updateIcon(theme) {
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-moon';
    } else {
        themeIcon.className = 'fas fa-sun';
    }
}

/* =========================================
   Menú Hamburguesa para Móviles
   ========================================= */
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li');

// Alternar clase active al hacer clic en la hamburguesa
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Cerrar el menú al hacer clic en cualquier enlace (para una mejor UX en móviles)
links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

/* =========================================
   Animación de aparición al hacer scroll (Fade-in suave)
   ========================================= */
// Configuración del Intersection Observer
const observerOptions = {
    threshold: 0.15, // Porcentaje del elemento visible antes de disparar
    rootMargin: "0px 0px -50px 0px"
};

// Crear el observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Añadir estilos para mostrar el elemento
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            // Dejar de observar una vez que ha aparecido
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Seleccionar todos los elementos a animar
const animatedElements = document.querySelectorAll('.glass-card, .section-title, .hero-content');

// Preparar los elementos y observarlos
animatedElements.forEach(el => {
    // Estado inicial (oculto)
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    
    // Iniciar observación
    observer.observe(el);
});

/* =========================================
   Manejo del formulario (Prevenir recarga)
   ========================================= */
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Recoger datos del formulario
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Preparar el asunto y cuerpo del correo
        const subject = encodeURIComponent(`Nuevo mensaje de ${name} (Portafolio)`);
        const body = encodeURIComponent(`Nombre: ${name}\nCorreo de contacto: ${email}\n\nMensaje:\n${message}`);
        
        // Simulación de envío visual y abrir cliente de correo
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<span>Abriendo correo...</span> <i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;
        
        setTimeout(() => {
            // Abrir el cliente de correo por defecto
            window.location.href = `mailto:juancastelan546@gmail.com?subject=${subject}&body=${body}`;
            
            btn.innerHTML = '<span>¡Listo!</span> <i class="fas fa-check"></i>';
            btn.classList.add('success');
            contactForm.reset();
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                btn.classList.remove('success');
            }, 3000);
            
        }, 1000);
    });
}

/* =========================================
   Integración WebGL (Three.js) - Proyecto Setup 3D
   ========================================= */
const container = document.getElementById('blender-canvas-container');

if (container) {
    (async () => {
        try {
            const THREE = await import('three');
            const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
            const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');

            // 1. Escena y Cámara
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
            camera.position.set(0, 1.5, 4);

            // 2. Renderizador
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.domElement.style.width = '100%';
            renderer.domElement.style.height = '100%';
            renderer.domElement.style.outline = 'none';
            renderer.domElement.style.borderRadius = '20px';
            renderer.domElement.style.cursor = 'pointer'; // Indicar interactividad
            container.appendChild(renderer.domElement);

            // 3. Controles
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 1.5;
            controls.minDistance = 1;
            controls.maxDistance = 10;
            controls.target.set(0, 0.5, 0);

            // 4. Iluminación
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
            directionalLight.position.set(5, 10, 7);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            // =========================================
            // REQUISITOS DEL USUARIO: Audio, Raycaster y Monitor
            // =========================================

            // Crear objeto de audio nativo con loop
            const bgMusic = new Audio('assets/Images/Menu.mp3');
            bgMusic.loop = true;
            let isMusicPlaying = false;

            // Configurar Raycaster y Vector2 para el mouse
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();

            // Variables para el monitor y texturas
            let monitorMaterial = null;
            let originalTexture = null;
            let originalEmissive = null;
            const textureLoader = new THREE.TextureLoader();
            const arknightsTexture = textureLoader.load('assets/Images/arknights.jpg');
            arknightsTexture.flipY = false; // Ajuste estándar para modelos GLTF
            arknightsTexture.colorSpace = THREE.SRGBColorSpace;

            // Cargar Modelo 3D
            const loader = new GLTFLoader();
            loader.load(
                'assets/3d/Setup Juan Castelán.glb',
                (gltf) => {
                    const setupModel = gltf.scene;
                    
                    setupModel.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    setupModel.position.set(0, -0.5, 0);
                    scene.add(setupModel);
                },
                undefined,
                (error) => {
                    console.error('Error al cargar el modelo 3D:', error);
                }
            );

            // Prevenir que la rotación de cámara (arrastre) se registre como un clic en la pantalla
            let isDragging = false;
            let startX = 0;
            let startY = 0;

            renderer.domElement.addEventListener('mousedown', (e) => {
                startX = e.clientX;
                startY = e.clientY;
                isDragging = false;
            });

            renderer.domElement.addEventListener('mousemove', (e) => {
                const diffX = Math.abs(e.clientX - startX);
                const diffY = Math.abs(e.clientY - startY);
                if (diffX > 5 || diffY > 5) {
                    isDragging = true;
                }
            });

            // Evento Click para el Raycaster
            renderer.domElement.addEventListener('click', (event) => {
                if (isDragging) return; // Si arrastró para rotar la cámara, ignorar clic

                // Calcular posición del mouse en coordenadas normalizadas (-1 a +1)
                const rect = renderer.domElement.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

                // Actualizar raycaster con la cámara y posición del mouse
                raycaster.setFromCamera(mouse, camera);

                // Calcular intersecciones con todos los objetos de la escena
                const intersects = raycaster.intersectObjects(scene.children, true);

                if (intersects.length > 0) {
                    // Tomar el primer objeto impactado
                    const clickedObject = intersects[0].object;
                    
                    // Buscar si el objeto o su material se llama "Monitor"
                    const objectName = clickedObject.name.toLowerCase();
                    const materialName = clickedObject.material.name ? clickedObject.material.name.toLowerCase() : '';

                    console.log('Objeto clickeado:', clickedObject.name, '| Material:', clickedObject.material.name);

                    // Si el nombre incluye monitor o pantalla (screen)
                    if (objectName.includes('monitor') || materialName.includes('monitor') || objectName.includes('screen') || materialName.includes('screen') || objectName.includes('pantalla')) {
                        
                        // Guardar la referencia al material del monitor y sus texturas originales la primera vez
                        if (!monitorMaterial) {
                            monitorMaterial = clickedObject.material;
                            originalTexture = monitorMaterial.map;
                            originalEmissive = monitorMaterial.emissiveMap;
                        }

                        // Toggle de la música y la imagen
                        if (!isMusicPlaying) {
                            // Reproducir (esto maneja el autoplay bypass ya que es desencadenado por el click del usuario)
                            bgMusic.play().catch(e => console.log('Autoplay bloqueado:', e));
                            isMusicPlaying = true;
                            
                            // Cambiar textura a la imagen
                            monitorMaterial.map = arknightsTexture;
                            monitorMaterial.emissiveMap = arknightsTexture;
                            monitorMaterial.emissive = new THREE.Color(0xffffff);
                            monitorMaterial.emissiveIntensity = 1.0;
                            monitorMaterial.needsUpdate = true;
                        } else {
                            // Pausar
                            bgMusic.pause();
                            isMusicPlaying = false;
                            
                            // Restaurar textura original
                            monitorMaterial.map = originalTexture;
                            monitorMaterial.emissiveMap = originalEmissive;
                            monitorMaterial.emissive = new THREE.Color(0x000000);
                            monitorMaterial.emissiveIntensity = 0;
                            monitorMaterial.needsUpdate = true;
                        }
                    }
                }
            });

            // Animación
            function animate() {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            }
            animate();

            // Responsive
            window.addEventListener('resize', () => {
                if (!container) return;
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            });

            // Controles de Zoom Manuales
            const zoomInBtn = document.getElementById('zoom-in');
            const zoomOutBtn = document.getElementById('zoom-out');
            if (zoomInBtn) {
                zoomInBtn.addEventListener('click', () => {
                    camera.position.lerp(controls.target, 0.25);
                    controls.update();
                });
            }
            if (zoomOutBtn) {
                zoomOutBtn.addEventListener('click', () => {
                    const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
                    camera.position.addScaledVector(direction, 0.5);
                    controls.update();
                });
            }

        } catch (error) {
            console.error("Error cargando Three.js:", error);
        }
    })();
}
