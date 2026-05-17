/* =========================================
   Lógica del Tema Oscuro / Claro
   ========================================= */
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);
} else if (prefersDark) {
    htmlElement.setAttribute('data-theme', 'dark');
    updateIcon('dark');
}

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcon(newTheme);
});

function updateIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

/* =========================================
   Menú Hamburguesa para Móviles
   ========================================= */
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

/* =========================================
   Animación de aparición al hacer scroll
   ========================================= */
const observerOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const animatedElements = document.querySelectorAll('.glass-card, .section-title, .hero-content');
animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

/* =========================================
   Formulario de contacto
   ========================================= */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name    = document.getElementById('name').value;
        const email   = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        const subject = encodeURIComponent(`Nuevo mensaje de ${name} (Portafolio)`);
        const body    = encodeURIComponent(`Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}`);
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>Abriendo correo...</span> <i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;
        setTimeout(() => {
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
   Integración WebGL (Three.js)
   ========================================= */
const container = document.getElementById('blender-canvas-container');

if (container) {
    (async () => {
        try {
            const THREE = await import('three');
            const { GLTFLoader }    = await import('three/addons/loaders/GLTFLoader.js');
            const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');

            // 1. Escena y Cámara
            const scene  = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
            camera.position.set(0, 1.5, 4);

            // 2. Renderizador
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.domElement.style.cssText = 'width:100%;height:100%;outline:none;border-radius:20px;cursor:grab;';
            container.style.position = 'relative';
            container.appendChild(renderer.domElement);

            // Tooltip de pista visual
            const hint = document.createElement('div');
            hint.id = 'monitor-hint';
            hint.textContent = '🖱️ Haz clic en el monitor';
            hint.style.cssText = `
                position:absolute;bottom:60px;left:50%;transform:translateX(-50%);
                background:rgba(0,0,0,0.7);color:#00d4ff;padding:6px 14px;
                border-radius:20px;font-size:0.78rem;font-family:monospace;
                pointer-events:none;border:1px solid rgba(0,212,255,0.4);
                backdrop-filter:blur(4px);z-index:10;white-space:nowrap;
                transition:opacity 0.5s ease;
            `;
            container.appendChild(hint);

            // 3. Controles
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping   = true;
            controls.dampingFactor   = 0.05;
            controls.autoRotate      = true;
            controls.autoRotateSpeed = 1.5;
            controls.minDistance     = 1;
            controls.maxDistance     = 10;
            controls.target.set(0, 0.5, 0);

            // 4. Iluminación
            scene.add(new THREE.AmbientLight(0xffffff, 0.8));
            const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
            dirLight.position.set(5, 10, 7);
            dirLight.castShadow = true;
            scene.add(dirLight);

            // =========================================
            // Audio y textura del monitor
            // =========================================
            const bgMusic = new Audio('assets/Images/Menu.mp3');
            bgMusic.loop  = true;
            let isMusicPlaying = false;

            const raycaster = new THREE.Raycaster();
            const mouse     = new THREE.Vector2();

            // Variables del monitor
            let monitorMaterial = null;
            let originalMap     = null;
            let originalColor   = null;
            let monitorUVBounds = null; // UV bounds de la cara de la pantalla (pre-escaneados)

            // Variables para el sistema de partículas (Plane001)
            const activeParticleSystems = [];

            function createCircleTexture() {
                const size = 64;
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                
                const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
                grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
                grad.addColorStop(0.25, 'rgba(0, 212, 255, 0.8)'); // Núcleo Cyan neón
                grad.addColorStop(0.55, 'rgba(189, 0, 255, 0.3)'); // Aura Violeta neón
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, size, size);
                
                return new THREE.CanvasTexture(canvas);
            }
            
            const particleTexture = createCircleTexture();

            function createParticleBurst(point) {
                const count = 90;
                const geometry = new THREE.BufferGeometry();
                const positions = new Float32Array(count * 3);
                const velocities = [];
                const colors = new Float32Array(count * 3);
                
                const colorChoices = [
                    new THREE.Color(0x00d4ff), // Cyan eléctrico
                    new THREE.Color(0xbd00ff), // Púrpura neón
                    new THREE.Color(0x00ff99)  // Verde neón
                ];

                for (let i = 0; i < count; i++) {
                    // Posición inicial (con un ligerísimo offset aleatorio)
                    positions[i * 3]     = point.x + (Math.random() - 0.5) * 0.05;
                    positions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.05;
                    positions[i * 3 + 2] = point.z + (Math.random() - 0.5) * 0.05;

                    // Velocidad de explosión esférica con bias vertical
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos((Math.random() * 2) - 1);
                    const speed = 0.5 + Math.random() * 1.5;
                    
                    velocities.push(new THREE.Vector3(
                        Math.sin(phi) * Math.cos(theta) * speed,
                        Math.abs(Math.sin(phi) * Math.sin(theta)) * speed + 0.5, // Empuje hacia arriba
                        Math.cos(phi) * speed
                    ));

                    // Color aleatorio del palette
                    const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
                    colors[i * 3]     = color.r;
                    colors[i * 3 + 1] = color.g;
                    colors[i * 3 + 2] = color.b;
                }

                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

                const material = new THREE.PointsMaterial({
                    size: 0.12,
                    map: particleTexture,
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                    vertexColors: true,
                    opacity: 1.0
                });

                const points = new THREE.Points(geometry, material);
                scene.add(points);

                activeParticleSystems.push({
                    points: points,
                    velocities: velocities,
                    age: 0,
                    maxAge: 50 // ~0.8 segundos de duración
                });
            }

            const textureLoader    = new THREE.TextureLoader();
            const arknightsTexture = textureLoader.load('assets/Images/arknights.jpg');
            arknightsTexture.flipY      = true; // default para imágenes JPG normales
            arknightsTexture.colorSpace = THREE.SRGBColorSpace;
            arknightsTexture.wrapS      = THREE.RepeatWrapping;
            arknightsTexture.wrapT      = THREE.RepeatWrapping;

            // 5. Cargar Modelo 3D
            const loader = new GLTFLoader();
            loader.load(
                'assets/3d/Setup Juan Castelán.glb',
                (gltf) => {
                    const model = gltf.scene;
                    model.traverse(child => {
                        if (child.isMesh) {
                            child.castShadow = child.receiveShadow = true;
                            // Pre-escanear Cube009 para encontrar la cara de la pantalla
                            if (child.name === 'Cube009') {
                                const uvA = child.geometry.attributes.uv;
                                const nA  = child.geometry.attributes.normal;
                                const gi  = child.geometry.index;
                                if (gi && uvA && nA) {
                                    const grp = new Map();
                                    const fc  = Math.floor(gi.count / 3);
                                    for (let fi = 0; fi < fc; fi++) {
                                        const ia = gi.getX(fi*3), ib = gi.getX(fi*3+1), ic = gi.getX(fi*3+2);
                                        const key = [
                                            Math.round((nA.getX(ia)+nA.getX(ib)+nA.getX(ic))/3*10)/10,
                                            Math.round((nA.getY(ia)+nA.getY(ib)+nA.getY(ic))/3*10)/10,
                                            Math.round((nA.getZ(ia)+nA.getZ(ib)+nA.getZ(ic))/3*10)/10
                                        ].join(',');
                                        if (!grp.has(key)) grp.set(key, []);
                                        grp.get(key).push(fi);
                                    }
                                    let best = 0;
                                    for (const [, faces] of grp) {
                                        let mnu=Infinity,mxu=-Infinity,mnv=Infinity,mxv=-Infinity;
                                        for (const fi of faces) for (let v=0;v<3;v++) {
                                            const vi=gi.getX(fi*3+v), u=uvA.getX(vi), vv=uvA.getY(vi);
                                            if(u<mnu)mnu=u; if(u>mxu)mxu=u; if(vv<mnv)mnv=vv; if(vv>mxv)mxv=vv;
                                        }
                                        const area=(mxu-mnu)*(mxv-mnv);
                                        if(area>best){best=area;monitorUVBounds={minU:mnu,maxU:mxu,minV:mnv,maxV:mxv};}
                                    }
                                    if(monitorUVBounds)
                                        console.log(`✅ Screen UV: U[${monitorUVBounds.minU.toFixed(4)}-${monitorUVBounds.maxU.toFixed(4)}] V[${monitorUVBounds.minV.toFixed(4)}-${monitorUVBounds.maxV.toFixed(4)}]`);
                                }
                            }
                        }
                    });
                    model.position.set(0, -0.5, 0);
                    scene.add(model);
                },
                undefined,
                (err) => console.error('Error al cargar modelo:', err)
            );

            // =========================================
            // Detección de arrastre vs clic
            // =========================================
            let isDragging = false, startX = 0, startY = 0;

            renderer.domElement.addEventListener('mousedown', e => {
                startX = e.clientX; startY = e.clientY; isDragging = false;
            });
            renderer.domElement.addEventListener('mousemove', e => {
                if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5)
                    isDragging = true;
            });

            // =========================================
            // Clic en el monitor con Raycaster
            // =========================================
            renderer.domElement.addEventListener('click', (event) => {
                if (isDragging) return;

                const rect = renderer.domElement.getBoundingClientRect();
                mouse.x =  ((event.clientX - rect.left) / rect.width)  * 2 - 1;
                mouse.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(scene.children, true);
                if (!intersects.length) return;

                const clickedObject = intersects[0].object;
                const objName  = clickedObject.name.toLowerCase();
                const matName  = clickedObject.material
                    ? (Array.isArray(clickedObject.material)
                        ? clickedObject.material.map(m => m.name).join(',').toLowerCase()
                        : (clickedObject.material.name || '').toLowerCase())
                    : '';

                console.log('Objeto clickeado:', clickedObject.name, '| Material:', matName);

                // --- Partículas al presionar Plane001 / material.001 ---
                const isPlane = ['plane001', 'material.001'].some(kw => objName.includes(kw) || matName.includes(kw));
                if (isPlane) {
                    createParticleBurst(intersects[0].point);
                    return;
                }

                const keywords = ['monitor','screen','pantalla','display','lcd','tv','panel','cube009','material.009'];
                if (!keywords.some(kw => objName.includes(kw) || matName.includes(kw))) return;

                // --- PRIMER CLIC: calcular repeat/offset con UV pre-escaneados ---
                if (!monitorMaterial && monitorUVBounds) {
                    const { minU, maxU, minV, maxV } = monitorUVBounds;
                    const rangeU = Math.max(maxU - minU, 0.001);
                    const rangeV = Math.max(maxV - minV, 0.001);
                    console.log(`✅ Usando UV pre-scan: U[${minU.toFixed(4)}-${maxU.toFixed(4)}] V[${minV.toFixed(4)}-${maxV.toFixed(4)}]`);
                    
                    // La pantalla en Blender está rotada 90 grados:
                    // El eje V (rango 0.74) corresponde a la ANCHURA del monitor (X de la textura)
                    // El eje U (rango 0.48) corresponde a la ALTURA del monitor (Y de la textura)
                    arknightsTexture.matrixAutoUpdate = false;
                    arknightsTexture.matrix.set(
                        0,          1 / rangeV, -minV / rangeV,  // X_textura depende de V
                        1 / rangeU, 0,          -minU / rangeU,  // Y_textura depende de U
                        0,          0,          1
                    );
                    arknightsTexture.needsUpdate = true;
                    const hitMesh = intersects[0].object;
                    monitorMaterial = Array.isArray(hitMesh.material) ? hitMesh.material[0] : hitMesh.material;
                    originalMap   = monitorMaterial.map;
                    originalColor = monitorMaterial.color ? monitorMaterial.color.clone() : null;
                }

                // Toggle música e imagen
                if (!isMusicPlaying) {
                    bgMusic.play().catch(e => console.warn('Autoplay bloqueado:', e));
                    isMusicPlaying = true;
                    // Forzar color blanco para que la textura no se multiplique por negro
                    if (monitorMaterial.color) monitorMaterial.color.setHex(0xffffff);
                    monitorMaterial.map               = arknightsTexture;
                    monitorMaterial.emissive          = new THREE.Color(0xffffff);
                    monitorMaterial.emissiveMap       = arknightsTexture;
                    monitorMaterial.emissiveIntensity = 1.5;
                    monitorMaterial.needsUpdate       = true;
                    hint.textContent = '🔊 Música ON — clic para apagar';
                    hint.style.color = '#00ff99';
                    hint.style.borderColor = 'rgba(0,255,153,0.4)';
                } else {
                    bgMusic.pause();
                    bgMusic.currentTime = 0;
                    isMusicPlaying = false;
                    // Restaurar color y mapa originales
                    if (originalColor && monitorMaterial.color) monitorMaterial.color.copy(originalColor);
                    monitorMaterial.map               = originalMap;
                    monitorMaterial.emissive          = new THREE.Color(0x000000);
                    monitorMaterial.emissiveMap       = null;
                    monitorMaterial.emissiveIntensity = 0;
                    monitorMaterial.needsUpdate       = true;
                    hint.textContent = '🖱️ Haz clic en el monitor';
                    hint.style.color = '#00d4ff';
                    hint.style.borderColor = 'rgba(0,212,255,0.4)';
                }
            });

            // Animación
            function animate() {
                requestAnimationFrame(animate);

                // Actualizar partículas activas
                for (let i = activeParticleSystems.length - 1; i >= 0; i--) {
                    const sys = activeParticleSystems[i];
                    sys.age++;
                    
                    const positions = sys.points.geometry.attributes.position.array;
                    for (let j = 0; j < sys.velocities.length; j++) {
                        const vel = sys.velocities[j];
                        // Mover partículas
                        positions[j * 3]     += vel.x * 0.016;
                        positions[j * 3 + 1] += vel.y * 0.016;
                        positions[j * 3 + 2] += vel.z * 0.016;
                        
                        // Gravedad (caída elegante)
                        vel.y -= 0.02;
                    }
                    sys.points.geometry.attributes.position.needsUpdate = true;
                    
                    // Desvanecer opacidad y encoger tamaño
                    sys.points.material.opacity = 1 - (sys.age / sys.maxAge);
                    sys.points.material.size = 0.12 * (1 - (sys.age / sys.maxAge));
                    
                    if (sys.age >= sys.maxAge) {
                        scene.remove(sys.points);
                        sys.points.geometry.dispose();
                        sys.points.material.dispose();
                        activeParticleSystems.splice(i, 1);
                    }
                }

                controls.update();
                renderer.render(scene, camera);
            }
            animate();

            // Responsive
            window.addEventListener('resize', () => {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            });

            // Zoom manual
            const zoomInBtn  = document.getElementById('zoom-in');
            const zoomOutBtn = document.getElementById('zoom-out');
            if (zoomInBtn)  zoomInBtn.addEventListener('click', () => { camera.position.lerp(controls.target, 0.25); controls.update(); });
            if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => {
                const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
                camera.position.addScaledVector(dir, 0.5);
                controls.update();
            });

        } catch (error) {
            console.error("Error cargando Three.js:", error);
        }
    })();
}
