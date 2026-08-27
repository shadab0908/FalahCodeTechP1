document.addEventListener('DOMContentLoaded', () => {
    
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // --- THEME MANAGEMENT ---
    const htmlEl = document.documentElement;
    const themeBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('falahcode_theme');
    
    // 1. Check local storage
    if (savedTheme) {
        htmlEl.setAttribute('data-theme', savedTheme);
    } 
    // 2. Fallback to system preference
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        htmlEl.setAttribute('data-theme', 'light');
    }

    // 3. Toggle mechanism
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = htmlEl.getAttribute('data-theme');
            const next = current === 'light' ? 'dark' : 'light';
            htmlEl.setAttribute('data-theme', next);
            localStorage.setItem('falahcode_theme', next);
        });
    }

    // --- CUSTOM CURSOR ---
    const cursor = document.getElementById('cursor');
    const cursorText = cursor.querySelector('.cursor-text');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Follow mouse
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        gsap.to(cursor, {
            x: mouseX,
            y: mouseY,
            duration: 0.1,
            ease: "power2.out"
        });
    });

    // Hover elements with data-cursor attribute
    const hoverElements = document.querySelectorAll('[data-cursor]');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            const text = el.getAttribute('data-cursor');
            cursorText.innerText = text;
            cursor.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            cursorText.innerText = "";
        });
    });
    
    // --- FULL-SCREEN NAVIGATION MENU ---
    const navMenuBtn = document.querySelector('.nav-menu');
    const menuCloseBtn = document.querySelector('.menu-close-btn');
    const menuLinks = document.querySelectorAll('.menu-link');
    const body = document.body;
    let isMenuOpen = false;

    // Scroll Lock mechanism to prevent horizontal layout shift
    function lockScroll() {
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        body.style.paddingRight = `${scrollBarWidth}px`;
        body.style.overflow = 'hidden';
    }
    function unlockScroll() {
        body.style.paddingRight = '';
        body.style.overflow = '';
    }

    // GSAP Timeline for Menu Animation
    const tlMenu = gsap.timeline({ 
        paused: true, 
        onReverseComplete: unlockScroll 
    });
    
    tlMenu.to(".full-menu-overlay", { autoAlpha: 1, duration: 0.4, ease: "power2.inOut" })
          .from(".menu-brand, .menu-close-btn", { y: -20, opacity: 0, duration: 0.4, ease: "power2.out" }, "-=0.2")
          .from(".menu-link", { y: 40, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" }, "-=0.3")
          .from(".menu-secondary", { y: 20, opacity: 0, duration: 0.4, ease: "power2.out" }, "-=0.2");

    function openMenu() {
        if(isMenuOpen) return;
        isMenuOpen = true;
        navMenuBtn.setAttribute('aria-expanded', 'true');
        lockScroll();
        tlMenu.timeScale(1).play();
        // Accessibility Focus Management
        setTimeout(() => { if (menuCloseBtn) menuCloseBtn.focus(); }, 500);
    }

    function closeMenu() {
        if(!isMenuOpen) return;
        isMenuOpen = false;
        navMenuBtn.setAttribute('aria-expanded', 'false');
        tlMenu.timeScale(1.5).reverse(); // Speed up slightly on close
        // Return focus
        navMenuBtn.focus();
    }

    // Menu Event Listeners
    navMenuBtn.addEventListener('click', openMenu);
    
    // Allow keyboard activation (Enter/Space) for the custom div button
    navMenuBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openMenu();
        }
    });
    
    menuCloseBtn.addEventListener('click', closeMenu);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });

    // Smooth scroll for Single-Page Links inside the Menu
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                closeMenu();
                // Delay scroll slightly to allow the menu to begin closing smoothly
                setTimeout(() => {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
        });
    });

    // --- INTRO & CURTAIN PEEL TIMELINE (SESSION STORAGE FIX) ---
    const hasPlayedIntro = sessionStorage.getItem('falahcode_intro_played');

    if (!hasPlayedIntro) {
        const tlIntro = gsap.timeline({
            onComplete: () => {
                // Record that the intro has finished playing
                sessionStorage.setItem('falahcode_intro_played', 'true');
            }
        });

        // 1. Logo & Text Meet
        tlIntro.to(".intro-logo", { x: 0, y: 0, duration: 1.2, ease: "power3.out", delay: 0.5 })
               .to(".intro-brand", { x: 0, y: 0, duration: 1.2, ease: "power3.out" }, "<");

        // 2. Background changes to Navy
        tlIntro.to("#intro-layer", { backgroundColor: "#071426", duration: 1 });

        // 3. Cinematic Curtain Peel Reveal
        tlIntro.set("#main-content", { opacity: 1 }) 
               .to("#intro-layer", {
                   rotationZ: -15, rotationX: 45, xPercent: -120, yPercent: -100, borderBottomRightRadius: "50%", duration: 2, ease: "power4.inOut"
               })
               .set("#intro-layer", { display: "none" }); 

        // 4. Hero Animation
        tlIntro.to(".hl-1", { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", duration: 1, ease: "power3.out" }, "-=1.2")
               .to(".hl-2", { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", duration: 1, ease: "power3.out" }, "-=1.0")
               .to(".hl-3", { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", duration: 1, ease: "power3.out" }, "-=0.8")
               .to(".hero-visual-wrapper", { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }, "-=1.0");
    } else {
        // Instantly skip the intro if already played this session
        gsap.set("#intro-layer", { display: "none" });
        gsap.set("#main-content", { opacity: 1 });
        gsap.set(".hl-1, .hl-2, .hl-3", { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" });
        gsap.set(".hero-visual-wrapper", { opacity: 1, scale: 1 });
    }
    
    // --- ADDED: HERO CHROMA TILT LOGIC ---
    const visualWrapper = document.querySelector('.hero-visual-wrapper');
    const tiltContainer = document.querySelector('.hero-tilt-container');

    if (visualWrapper && tiltContainer) {
        visualWrapper.addEventListener('mousemove', (e) => {
            const rect = visualWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;  
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -15; 
            const rotateY = ((x - centerX) / centerX) * 15;
            
            const chromaX = ((x - centerX) / centerX) * 12;
            const chromaY = ((y - centerY) / centerY) * 12;
            
            tiltContainer.style.setProperty('--rotate-x', `${rotateX}deg`);
            tiltContainer.style.setProperty('--rotate-y', `${rotateY}deg`);
            tiltContainer.style.setProperty('--chroma-x', `${chromaX}px`);
            tiltContainer.style.setProperty('--chroma-y', `${chromaY}px`);
        });
        
        visualWrapper.addEventListener('mouseleave', () => {
            tiltContainer.style.setProperty('--rotate-x', `0deg`);
            tiltContainer.style.setProperty('--rotate-y', `0deg`);
            tiltContainer.style.setProperty('--chroma-x', `0px`);
            tiltContainer.style.setProperty('--chroma-y', `0px`);
        });
    }

    // --- ADDED: CORE ECOSYSTEM SPARKLING STARS LOGIC (THEME AWARE) ---
    const canvas = document.getElementById('ecosystem-stars');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let stars = [];

        function resizeCanvas() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            initStars();
        }

        function initStars() {
            stars = [];
            // FalahCode Light Mode Background Subtle Tones
            const lightColors = ['15, 58, 102', '46, 143, 224', '79, 163, 237'];
            
            for (let i = 0; i < 700; i++) {
                const randomLight = lightColors[Math.floor(Math.random() * lightColors.length)];
                
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 1.5 + 0.3,
                    alpha: Math.random(),
                    speed: (Math.random() * 0.015) + 0.005,
                    direction: Math.random() > 0.5 ? 1 : -1,
                    darkColor: '0, 240, 255',
                    lightColor: randomLight
                });
            }
        }

        function animateStars() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';

            stars.forEach(star => {
                star.alpha += star.speed * star.direction;
                if (star.alpha >= 0.8) {
                    star.alpha = 0.8;
                    star.direction = -1;
                } else if (star.alpha <= 0.05) {
                    star.alpha = 0.05;
                    star.direction = 1;
                }

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                
                // Switch colors and adjust density strictly per theme
                const colorRGB = isLight ? star.lightColor : star.darkColor;
                const finalAlpha = isLight ? star.alpha * 0.5 : star.alpha; // Mute alpha for cleaner light mode
                
                ctx.fillStyle = `rgba(${colorRGB}, ${finalAlpha})`; 
                ctx.fill();
            });

            requestAnimationFrame(animateStars);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animateStars();
    }


    // --- WHAT WE BUILD SCROLL SEQUENCE ---
    const buildLabels = gsap.utils.toArray('.b-label');
    const tlBuild = gsap.timeline({
        scrollTrigger: {
            trigger: ".sec-build",
            start: "top top",
            end: "+=3000",
            pin: true, // PIN THE ENTIRE SECTION, NOT JUST THE INNER WRAPPER
            scrub: 1
        }
    });

    // Animate through labels
    buildLabels.forEach((label, i) => {
        tlBuild.to(label, { y: 0, opacity: 1, duration: 1 }) 
               .to(".build-image", { filter: `hue-rotate(${i * 45}deg) brightness(${1 + (i*0.1)})`, duration: 1 }, "<") 
               .to(label, { y: -50, opacity: 0, duration: 1 }, "+=1"); 
    });

    // --- WHY FALAHCODE TEXT SEQUENCE ---
    const tlWhy = gsap.timeline({
        scrollTrigger: {
            trigger: ".sec-why",
            start: "top top",
            end: "+=2000",
            pin: true, // PIN THE ENTIRE SECTION
            scrub: 1
        }
    });

    // Move the words container up sequentially
    tlWhy.to(".why-words", { y: -300, ease: "none" }); // 100px per word
    // --- CONTACT FORM AJAX & UI STATES ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const feedback = document.getElementById('formFeedback');
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Basic Spam Protection (Honeypot)
            if (contactForm._honey.value) return; 

            // Loading State
            submitBtn.disabled = true;
            btnText.innerText = 'SUBMITTING...';
            feedback.innerText = '';
            feedback.className = 'form-feedback';

            const formData = new FormData(contactForm);

            try {
                const response = await fetch('api/contact.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();

                if (response.ok && result.success) {
                    // Success State
                    contactForm.reset();
                    btnText.innerText = 'MESSAGE RECEIVED ✓';
                    feedback.innerText = 'Thank you. We will be in touch shortly.';
                    feedback.classList.add('feedback-success');
                } else {
                    throw new Error(result.message || 'Server error');
                }
            } catch (error) {
                // Error State
                btnText.innerText = 'ERROR';
                feedback.innerText = 'Unable to send message. Please try again.';
                feedback.classList.add('feedback-error');
            } finally {
                // Reset Button State after delay
                setTimeout(() => { 
                    btnText.innerText = 'START A PROJECT'; 
                    submitBtn.disabled = false; 
                }, 4000);
            }
        });
    }
    // --- OVERLAP PRECAUTION ---
    // Forces GSAP to mathematically recalculate section heights after all images load
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });

});