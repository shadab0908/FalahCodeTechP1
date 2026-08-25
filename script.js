document.addEventListener('DOMContentLoaded', () => {
    
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

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

    // --- INTRO & CURTAIN PEEL TIMELINE ---
    const tlIntro = gsap.timeline();

    // 1. Logo & Text Meet (Existing concept)
    tlIntro.to(".intro-logo", { x: 0, y: 0, duration: 1.2, ease: "power3.out", delay: 0.5 })
           .to(".intro-brand", { x: 0, y: 0, duration: 1.2, ease: "power3.out" }, "<");

    // 2. Background changes to Navy
    tlIntro.to("#intro-layer", { backgroundColor: "#071426", duration: 1 });

    // 3. Cinematic Curtain Peel Reveal
    tlIntro.set("#main-content", { opacity: 1 }) // Reveal content behind
           .to("#intro-layer", {
               rotationZ: -15, // Skew fabric
               rotationX: 45,  // Add 3D depth
               xPercent: -120, // Pull it off screen left
               yPercent: -100, // Pull it up
               borderBottomRightRadius: "50%", // Simulate curved peeling fabric
               duration: 2,
               ease: "power4.inOut"
           })
           .set("#intro-layer", { display: "none" }); // Remove from DOM flow

    // 4. Hero Animation (Triggers immediately as fabric peels)
    tlIntro.to(".hl-1", { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", duration: 1, ease: "power3.out" }, "-=1.2")
           .to(".hl-2", { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", duration: 1, ease: "power3.out" }, "-=1.0")
           .to(".hl-3", { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", duration: 1, ease: "power3.out" }, "-=0.8")
           .to(".hero-visual-wrapper", { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }, "-=1.0");


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

    // --- SELECTED WORK PARALLAX ---
    gsap.to(".work-container", {
        scale: 1,
        ease: "none",
        scrollTrigger: {
            trigger: ".sec-work",
            start: "top bottom",
            end: "center center",
            scrub: true
        }
    });
    
    gsap.to(".work-visual img", {
        scale: 1,
        ease: "none",
        scrollTrigger: {
            trigger: ".sec-work",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
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

    // --- OVERLAP PRECAUTION ---
    // Forces GSAP to mathematically recalculate section heights after all images load
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });

});