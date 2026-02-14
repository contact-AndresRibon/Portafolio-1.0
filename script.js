// ============================================
// COMMON FUNCTIONALITY - Todas las páginas
// ============================================

// Navegación con scroll
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Animaciones de entrada con Intersection Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Smooth scrolling para los enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// THREE.JS BACKGROUND - Todas las páginas
// ============================================

let scene, camera, renderer, particles;

function initThree() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Crear partículas
    const geometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x3b82f6,
        size: 0.02,
        transparent: true,
        opacity: 0.6
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 5;

    // Líneas conectoras
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.1
    });

    const linePositions = [];
    for (let i = 0; i < 20; i++) {
        linePositions.push(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
        );
    }

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    if (particles) {
        particles.rotation.x += 0.001;
        particles.rotation.y += 0.002;
    }

    renderer.render(scene, camera);
}

// Responsive Three.js
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Inicializar Three.js cuando la página cargue
window.addEventListener('load', initThree);

// ============================================
// LIGHTBOX - Páginas de proyectos
// ============================================

(function() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lbImage = lightbox.querySelector('.lb-image');
    const lbCaption = lightbox.querySelector('.lb-caption');
    const btnClose = lightbox.querySelector('.lb-close');
    const btnPrev = lightbox.querySelector('.lb-prev');
    const btnNext = lightbox.querySelector('.lb-next');

    const imgs = Array.from(document.querySelectorAll('.projects-grid .project-card img'));
    let idx = 0;

    function open(i) {
        const img = imgs[i];
        lbImage.src = img.dataset.full || img.src;
        lbImage.alt = img.alt || '';
        lbCaption.textContent = img.closest('figure').querySelector('.project-title')?.textContent || '';
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        idx = i;
    }

    function close() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        lbImage.src = '';
    }

    function showPrev() { open((idx - 1 + imgs.length) % imgs.length); }
    function showNext() { open((idx + 1) % imgs.length); }

    imgs.forEach((img, i) => img.addEventListener('click', () => open(i)));
    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', showPrev);
    btnNext.addEventListener('click', showNext);

    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });
})();

// ============================================
// CAROUSEL - Páginas de proyectos
// ============================================

(function() {
    const track = document.querySelector('.carousel-track');
    if (!track) return;

    const items = Array.from(track.children);
    const prev = document.querySelector('.carousel-prev') || document.querySelector('.prev');
    const next = document.querySelector('.carousel-next') || document.querySelector('.next');
    const dotsWrap = document.querySelector('.carousel-dots');

    let index = 0;

    function update() {
        track.style.transform = `translateX(-${index * 100}%)`;
        
        // Actualizar dots si existen
        if (dotsWrap) {
            const dots = dotsWrap.querySelectorAll('button');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }
    }

    // Crear dots
    if (dotsWrap) {
        items.forEach((_, i) => {
            const btn = document.createElement('button');
            btn.classList.toggle('active', i === 0);
            btn.addEventListener('click', () => { index = i; update(); });
            dotsWrap.appendChild(btn);
        });
    }

    if (prev) prev.addEventListener('click', () => { index = (index - 1 + items.length) % items.length; update(); });
    if (next) next.addEventListener('click', () => { index = (index + 1) % items.length; update(); });

    // Auto-play
    let autoplay = setInterval(() => { index = (index + 1) % items.length; update(); }, 5000);
    if (prev) prev.addEventListener('mouseenter', () => clearInterval(autoplay));
    if (next) next.addEventListener('mouseenter', () => clearInterval(autoplay));
    if (dotsWrap) dotsWrap.addEventListener('mouseenter', () => clearInterval(autoplay));
})();

// ============================================
// MOBILE NAV TOGGLE - Páginas de proyectos
// ============================================

(function() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.querySelector('#navbar .nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('active');
        });
    }
})();

// ============================================
// ABOUT CAROUSEL - Páginas de proyectos
// ============================================

(function() {
    const slides = document.querySelectorAll('.about-projects .carousel-slide');
    const indicators = document.querySelectorAll('.about-projects .indicator');
    const track = document.querySelector('.about-projects .carousel-track');

    if (!track || slides.length === 0) return;

    let currentSlide = 0;

    function updateCarousel() {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;

        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }

    function moveSlide(direction) {
        currentSlide += direction;

        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        } else if (currentSlide >= slides.length) {
            currentSlide = 0;
        }

        updateCarousel();
    }

    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
    }

    // Auto-play
    let autoplayInterval = setInterval(() => {
        moveSlide(1);
    }, 5000);

    // Pausar autoplay
    const carouselContainer = document.querySelector('.about-projects .carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            clearInterval(autoplayInterval);
        });

        carouselContainer.addEventListener('mouseleave', () => {
            autoplayInterval = setInterval(() => {
                moveSlide(1);
            }, 5000);
        });
    }

    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            moveSlide(-1);
        } else if (e.key === 'ArrowRight') {
            moveSlide(1);
        }
    });

    // Soporte para gestos táctiles
    let touchStartX = 0;
    let touchEndX = 0;

    if (carouselContainer) {
        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        carouselContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            moveSlide(1);
        }
        if (touchEndX > touchStartX + 50) {
            moveSlide(-1);
        }
    }
})();
