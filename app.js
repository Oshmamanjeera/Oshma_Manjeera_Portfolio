document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. CUSTOM CURSOR
    // ----------------------------------------------------
    const cursorDot = document.querySelector('.custom-cursor-dot');
    const cursorCircle = document.querySelector('.custom-cursor-circle');
    
    let mouseX = 0, mouseY = 0;
    let circleX = 0, circleY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });
    
    // Smooth custom cursor lag (linear interpolation)
    function animateCursor() {
        const lerpFactor = 0.15;
        circleX += (mouseX - circleX) * lerpFactor;
        circleY += (mouseY - circleY) * lerpFactor;
        
        cursorCircle.style.left = circleX + 'px';
        cursorCircle.style.top = circleY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    // Add hover effect states for links & interactive items
    const interactiveElements = document.querySelectorAll('a, button, .filter-btn, .project-card, .slider-group input, .social-icon, .btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('hovering');
        });
    });

    // ----------------------------------------------------
    // 2. MOBILE MENU
    // ----------------------------------------------------
    const menuBtn = document.querySelector('.menu-btn');
    const navMenu = document.querySelector('nav');
    
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking nav link
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Active Navigation Highlighting on Scroll
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // ----------------------------------------------------
    // 3. BACKGROUND CANVAS PARTICLES
    // ----------------------------------------------------
    const bgCanvas = document.getElementById('bg-canvas');
    const ctx = bgCanvas.getContext('2d');
    
    let particlesArray = [];
    const particleCount = 70;
    const maxDistance = 120;
    
    function resizeBgCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeBgCanvas);
    resizeBgCanvas();
    
    class Particle {
        constructor() {
            this.x = Math.random() * bgCanvas.width;
            this.y = Math.random() * bgCanvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2 + 1;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Boundary collision
            if (this.x < 0 || this.x > bgCanvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > bgCanvas.height) this.vy = -this.vy;
            
            // Mouse Interaction (Push away slightly)
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.hypot(dx, dy);
            if (dist < 100) {
                const force = (100 - dist) / 100;
                this.x += (dx / dist) * force * 2;
                this.y += (dy / dist) * force * 2;
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
            ctx.fill();
        }
    }
    
    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < particleCount; i++) {
            particlesArray.push(new Particle());
        }
    }
    initParticles();
    
    function animateParticles() {
        ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        particlesArray.forEach(p => {
            p.update();
            p.draw();
        });
        
        // Draw connection lines
        for (let i = 0; i < particlesArray.length; i++) {
            for (let j = i + 1; j < particlesArray.length; j++) {
                const dx = particlesArray[i].x - particlesArray[j].x;
                const dy = particlesArray[i].y - particlesArray[j].y;
                const dist = Math.hypot(dx, dy);
                
                if (dist < maxDistance) {
                    const alpha = (maxDistance - dist) / maxDistance * 0.15;
                    ctx.strokeStyle = `rgba(191, 90, 242, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // ----------------------------------------------------
    // 4. INTERSECTION OBSERVER FOR REVEALS
    // ----------------------------------------------------
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Animate once
            }
        });
    }, observerOptions);
    
    revealElements.forEach(el => revealObserver.observe(el));

    // Project Card Mouse Spotlight Tracker
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // ----------------------------------------------------
    // 5. PROJECT GRID FILTERING
    // ----------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Toggle active filter button style
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    card.style.display = 'flex';
                    // Trigger fade in animation
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px) scale(0.95)';
                    // Delay hiding item to let transition finish
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // ----------------------------------------------------
    // 6. CREATIVE SANDBOX: QUANTUM EEG SIMULATOR
    // ----------------------------------------------------
    const sandboxCanvas = document.getElementById('sandbox-canvas');
    const sCtx = sandboxCanvas.getContext('2d');
    
    // Control elements
    const eegNoiseSlider = document.getElementById('eeg-noise');
    const eegSeizureSlider = document.getElementById('eeg-seizure');
    const qEntangleSlider = document.getElementById('q-entangle');
    
    const noiseVal = document.getElementById('noise-val');
    const seizureVal = document.getElementById('seizure-val');
    const entangleVal = document.getElementById('entangle-val');
    
    const runBtn = document.getElementById('btn-run-clf');
    const injectBtn = document.getElementById('btn-inject-seizure');
    const statusText = document.getElementById('status-txt');
    const indicatorDot = document.querySelector('.sandbox-status span');
    
    let isClassifying = false;
    let clfProgress = 0;
    let seizureTriggered = false;
    let seizureTimer = 0;
    
    function resizeSandboxCanvas() {
        const rect = sandboxCanvas.parentElement.getBoundingClientRect();
        sandboxCanvas.width = rect.width;
        sandboxCanvas.height = rect.height || 380;
    }
    window.addEventListener('resize', resizeSandboxCanvas);
    resizeSandboxCanvas();
    
    // Handle slider visual updates
    eegNoiseSlider.addEventListener('input', (e) => {
        noiseVal.textContent = e.target.value + '%';
    });
    
    eegSeizureSlider.addEventListener('input', (e) => {
        seizureVal.textContent = Math.round(e.target.value * 10) / 10 + ' Hz';
    });
    
    qEntangleSlider.addEventListener('input', (e) => {
        entangleVal.textContent = e.target.value + '%';
    });
    
    // Inject seizure state
    injectBtn.addEventListener('click', () => {
        seizureTriggered = true;
        seizureTimer = 180; // duration in frames (3 seconds at 60fps)
        eegSeizureSlider.value = 18; // peak frequency
        seizureVal.textContent = '18 Hz';
        
        statusText.textContent = "Detecting anomalies...";
        indicatorDot.style.backgroundColor = '#ff2d55';
    });
    
    // Run Simulated Classifier
    runBtn.addEventListener('click', () => {
        if (isClassifying) return;
        isClassifying = true;
        clfProgress = 0;
        runBtn.textContent = 'Analyzing...';
        runBtn.disabled = true;
    });
    
    let frame = 0;
    
    function drawSandbox() {
        sCtx.clearRect(0, 0, sandboxCanvas.width, sandboxCanvas.height);
        frame++;
        
        // Grab current control states
        const noise = parseFloat(eegNoiseSlider.value) / 100;
        let frequency = parseFloat(eegSeizureSlider.value);
        const entanglement = parseFloat(qEntangleSlider.value) / 100;
        
        // Seizure simulation timer loop
        if (seizureTriggered) {
            seizureTimer--;
            if (seizureTimer <= 0) {
                seizureTriggered = false;
                eegSeizureSlider.value = 6;
                seizureVal.textContent = '6 Hz';
                statusText.textContent = "Quantum Core Standing By";
                indicatorDot.style.backgroundColor = '#00f2fe';
            }
        }
        
        // Draw Wave grids/channels
        const channels = 4;
        const channelHeight = sandboxCanvas.height / (channels + 1);
        const colors = ['#00f2fe', '#bf5af2', '#ff2d55', '#4cd964'];
        
        for (let c = 0; c < channels; c++) {
            sCtx.strokeStyle = colors[c];
            sCtx.lineWidth = 2;
            sCtx.beginPath();
            
            const midY = channelHeight * (c + 1);
            
            for (let x = 0; x < sandboxCanvas.width; x++) {
                // Wave dynamics (Normal alpha/theta waves vs high-amplitude seizure spikes)
                let amplitude = 12;
                let waveFreq = frequency;
                
                // If it is a seizure, increase amplitude and change pattern
                if (frequency > 12) {
                    amplitude = 35; // Spike-and-wave amplitude discharge
                    // Create spike-and-wave morphology
                    const baseWave = Math.sin(x * 0.05 * waveFreq + frame * 0.1);
                    const spikeWave = Math.abs(Math.sin(x * 0.025 * waveFreq + frame * 0.05)) * 1.5;
                    const combined = (baseWave + spikeWave) * amplitude;
                    
                    // Add noise jitter
                    const noiseJitter = (Math.random() - 0.5) * noise * 30;
                    
                    const y = midY + combined + noiseJitter;
                    if (x === 0) sCtx.moveTo(x, y);
                    else sCtx.lineTo(x, y);
                } else {
                    // Normal EEG wave math
                    const wave1 = Math.sin(x * 0.02 * waveFreq + frame * 0.05) * amplitude;
                    const wave2 = Math.cos(x * 0.008 * waveFreq * 1.5 - frame * 0.03) * (amplitude * 0.5);
                    const noiseJitter = (Math.random() - 0.5) * noise * 15;
                    
                    const y = midY + wave1 + wave2 + noiseJitter;
                    if (x === 0) sCtx.moveTo(x, y);
                    else sCtx.lineTo(x, y);
                }
            }
            sCtx.stroke();
        }
        
        // Drawing quantum decision bounds / prediction accuracy UI overlay
        if (isClassifying) {
            clfProgress += 1;
            
            // Draw progress sweep
            sCtx.fillStyle = 'rgba(0, 242, 254, 0.05)';
            const sweepX = (clfProgress / 100) * sandboxCanvas.width;
            sCtx.fillRect(0, 0, sweepX, sandboxCanvas.height);
            
            sCtx.strokeStyle = 'rgba(0, 242, 254, 0.6)';
            sCtx.lineWidth = 1;
            sCtx.beginPath();
            sCtx.moveTo(sweepX, 0);
            sCtx.lineTo(sweepX, sandboxCanvas.height);
            sCtx.stroke();
            
            // Draw classification node checks
            if (clfProgress % 10 === 0) {
                const nodeX = Math.random() * sweepX;
                const nodeY = Math.random() * sandboxCanvas.height;
                sCtx.fillStyle = '#bf5af2';
                sCtx.beginPath();
                sCtx.arc(nodeX, nodeY, 6, 0, Math.PI*2);
                sCtx.fill();
            }
            
            if (clfProgress >= 100) {
                isClassifying = false;
                runBtn.textContent = 'Run VQC Classifier';
                runBtn.disabled = false;
                
                // Calculate simulated VQC classification accuracy
                // Base accuracy depends on Quantum Entanglement slider and Noise
                const finalAccuracy = Math.min(99.4, (80 + (entanglement * 15) - (noise * 10))).toFixed(1);
                
                if (frequency > 12) {
                    statusText.innerHTML = `<span style="color:#ff2d55">Seizure Detected (VQC Accuracy: ${finalAccuracy}%)</span>`;
                    indicatorDot.style.backgroundColor = '#ff2d55';
                } else {
                    statusText.innerHTML = `<span style="color:#4cd964">EEG Normal (VQC Accuracy: ${finalAccuracy}%)</span>`;
                    indicatorDot.style.backgroundColor = '#4cd964';
                }
            }
        }
        
        requestAnimationFrame(drawSandbox);
    }
    
    // Initiate sandbox animation
    drawSandbox();
});
