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
        
        // Simulación de envío
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<span>Enviando...</span> <i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.innerHTML = '<span>¡Mensaje Enviado!</span> <i class="fas fa-check"></i>';
            btn.classList.add('success');
            contactForm.reset();
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                btn.classList.remove('success');
            }, 3000);
            
        }, 1500);
    });
}
