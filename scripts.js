// JavaScript Document

// Portfolio data for carousel

        // Respect users who prefer reduced motion (used for smooth scrolling)
        const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const portfolioData = [
            {
                id: 1,
                title: 'CLASS 10',
                image: 'images/10th/FEATURED.jpeg',
                tech: []
            },
            {
                id: 2,
                title: 'CLASS 10',
                image: 'images/10th/featured%20(2).jpeg',
                tech: []
            },
            {
                id: 3,
                title: 'CLASS 10',
                image: 'images/10th/FEATURED.jpeg',
                tech: []
            },
            {
                id: 4,
                title: 'CLASS 10',
                image: 'images/10th/featured%20(2).jpeg',
                tech: []
            }
        ];

        // Scroll to section function
        function scrollToSection(sectionId) {
            const section = document.getElementById(sectionId);
            const header = document.getElementById('header');
            if (section) {
                const headerHeight = header.offsetHeight;
                const targetPosition = section.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: REDUCED_MOTION ? 'auto' : 'smooth'
                });
            }
        }

        // Initialize particles for philosophy section
        function initParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = 15;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                // Random horizontal position
                particle.style.left = Math.random() * 100 + '%';
                
                // Start particles at random vertical positions throughout the section
                particle.style.top = Math.random() * 100 + '%';
                
                // Random animation delay for natural movement
                particle.style.animationDelay = Math.random() * 20 + 's';
                
                // Random animation duration for variety
                particle.style.animationDuration = (18 + Math.random() * 8) + 's';
                
                particlesContainer.appendChild(particle);
            }
        }

        // Initialize carousel
        let currentIndex = 0;
        const carousel = document.getElementById('carousel');
        const indicatorsContainer = document.getElementById('indicators');

        function createCarouselItem(data, index) {
            const item = document.createElement('div');
            item.className = 'carousel-item';
            item.dataset.index = index;
            
            item.innerHTML = `
                <div class="card">
                    <div class="card-number">0${data.id}</div>
                    <div class="card-image">
                        <img src="${data.image}" alt="${data.title}" decoding="async">
                    </div>
                    <h3 class="card-title">${data.title}</h3>
                    <button class="card-cta" onclick="scrollToSection('classes')">Explore</button>
                </div>
            `;
            
            return item;
        }

        function initCarousel() {
            // Create carousel items
            portfolioData.forEach((data, index) => {
                const item = createCarouselItem(data, index);
                carousel.appendChild(item);
                
                // Create indicator
                const indicator = document.createElement('div');
                indicator.className = 'indicator';
                if (index === 0) indicator.classList.add('active');
                indicator.dataset.index = index;
                indicator.addEventListener('click', () => goToSlide(index));
                indicatorsContainer.appendChild(indicator);
            });
            
            updateCarousel();
        }

        function updateCarousel() {
            const items = document.querySelectorAll('.carousel-item');
            const indicators = document.querySelectorAll('.indicator');
            const totalItems = items.length;
            const isMobile = window.innerWidth <= 768;
            const isTablet = window.innerWidth <= 1024;
            
            items.forEach((item, index) => {
                // Calculate relative position
                let offset = index - currentIndex;
                
                // Wrap around for continuous rotation
                if (offset > totalItems / 2) {
                    offset -= totalItems;
                } else if (offset < -totalItems / 2) {
                    offset += totalItems;
                }
                
                const absOffset = Math.abs(offset);
                const sign = offset < 0 ? -1 : 1;
                
                // Reset transform
                item.style.transform = '';
                item.style.opacity = '';
                item.style.zIndex = '';
                item.style.transition = REDUCED_MOTION ? 'none' : 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
                
                // Adjust spacing based on screen size
                let spacing1 = 400;
                let spacing2 = 600;
                let spacing3 = 750;
                const isCompact = window.innerWidth <= 380;

                if (isCompact) {
                    spacing1 = 240;   // small phones: tighter ring
                    spacing2 = 360;
                    spacing3 = 460;
                } else if (isMobile) {
                    spacing1 = 280;  // Was 400, now 100px closer
                    spacing2 = 420;  // Was 600, now 180px closer
                    spacing3 = 550;  // Was 750, now 200px closer
                } else if (isTablet) {
                    spacing1 = 340;
                    spacing2 = 520;
                    spacing3 = 650;
                }
                
                if (absOffset === 0) {
                    // Center item
                    item.style.transform = 'translate(-50%, -50%) translateZ(0) scale(1)';
                    item.style.opacity = '1';
                    item.style.zIndex = '10';
                } else if (absOffset === 1) {
                    // Side items
                    const translateX = sign * spacing1;
                    const rotation = isMobile ? 25 : 30;
                    const scale = isMobile ? 0.88 : 0.85;
                    item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-200px) rotateY(${-sign * rotation}deg) scale(${scale})`;
                    item.style.opacity = '0.8';
                    item.style.zIndex = '5';
                } else if (absOffset === 2) {
                    // Further side items
                    const translateX = sign * spacing2;
                    const rotation = isMobile ? 35 : 40;
                    const scale = isMobile ? 0.75 : 0.7;
                    item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-350px) rotateY(${-sign * rotation}deg) scale(${scale})`;
                    item.style.opacity = '0.5';
                    item.style.zIndex = '3';
                } else if (absOffset === 3) {
                    // Even further items
                    const translateX = sign * spacing3;
                    const rotation = isMobile ? 40 : 45;
                    const scale = isMobile ? 0.65 : 0.6;
                    item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-450px) rotateY(${-sign * rotation}deg) scale(${scale})`;
                    item.style.opacity = '0.3';
                    item.style.zIndex = '2';
                } else {
                    // Hidden items (behind)
                    item.style.transform = 'translate(-50%, -50%) translateZ(-500px) scale(0.5)';
                    item.style.opacity = '0';
                    item.style.zIndex = '1';
                }
            });
            
            // Update indicators
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
        }

        function nextSlide(userInitiated) {
            currentIndex = (currentIndex + 1) % portfolioData.length;
            updateCarousel();
            if (userInitiated) startAutoRotate();
        }

        function prevSlide(userInitiated) {
            currentIndex = (currentIndex - 1 + portfolioData.length) % portfolioData.length;
            updateCarousel();
            if (userInitiated) startAutoRotate();
        }

        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
            startAutoRotate();
        }

        // Event listeners
        document.getElementById('nextBtn').addEventListener('click', () => nextSlide(true));
        document.getElementById('prevBtn').addEventListener('click', () => prevSlide(true));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (viewerState && viewerState.open) return; // image viewer owns keys while open
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        });

        // Update carousel on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateCarousel();
            }, 250);
        });

        // Initialize on load
        initCarousel();
        initParticles();

        // Continuous auto-rotation of the featured carousel (infinite loop)
        function startAutoRotate() {
            clearInterval(autoRotateTimer);
            autoRotateTimer = setInterval(nextSlide, 4000);
        }

        let autoRotateTimer = null;
        startAutoRotate();

        // Classes gallery data (image files grouped by subject folder)
        const classesData = {
            'class-3': [],
            'class-4': [],
            'class-5': [],
            'class-6': [],
            'class-7': [
                { src: 'images/7th/math.jpeg', subject: 'Math' },
                { src: 'images/7th/math%20(2).jpeg', subject: 'Math' },
                { src: 'images/7th/math%20(3).jpeg', subject: 'Math' },
                { src: 'images/7th/science.jpeg', subject: 'Science' },
                { src: 'images/7th/science.jpg', subject: 'Science' },
                { src: 'images/7th/social.jpeg', subject: 'Social' },
                { src: 'images/7th/social.jpg', subject: 'Social' },
                { src: 'images/7th/social%20(2).jpeg', subject: 'Social' },
                { src: 'images/7th/social%20(2).jpg', subject: 'Social' },
                { src: 'images/7th/sociall.jpeg', subject: 'Social' },
                { src: 'images/7th/socialll.jpeg', subject: 'Social' },
                { src: 'images/7th/socialll.jpg', subject: 'Social' },
                { src: 'images/7th/socialll%20(2).jpg', subject: 'Social' },
                { src: 'images/7th/english.jpeg', subject: 'English' },
                { src: 'images/7th/english.jpg', subject: 'English' },
                { src: 'images/7th/telugu.jpg', subject: 'Telugu' },
                { src: 'images/7th/teluguu.jpg', subject: 'Telugu' },
                { src: 'images/7th/teluguu%20(2).jpg', subject: 'Telugu' },
                { src: 'images/7th/hindii.jpg', subject: 'Hindi' },
                { src: 'images/7th/sanskrit.jpeg', subject: 'Sanskrit' }
            ],
            'class-8': [],
            'class-9': [],
            'class-10': [
                { src: 'images/10th/math.jpeg', subject: 'Math' },
                { src: 'images/10th/math%20(2).jpeg', subject: 'Math' },
                { src: 'images/10th/math%20(3).jpeg', subject: 'Math' },
                { src: 'images/10th/mathh.jpeg', subject: 'Math' },
                { src: 'images/10th/science.jpeg', subject: 'Science' },
                { src: 'images/10th/science%20(2).jpeg', subject: 'Science' },
                { src: 'images/10th/science%20(3).jpeg', subject: 'Science' },
                { src: 'images/10th/scienceee.jpeg', subject: 'Science' },
                { src: 'images/10th/scince.jpeg', subject: 'Science' },
                { src: 'images/10th/social.jpeg', subject: 'Social' },
                { src: 'images/10th/social%20(2).jpeg', subject: 'Social' },
                { src: 'images/10th/sociall.jpeg', subject: 'Social' },
                { src: 'images/10th/socialll.jpeg', subject: 'Social' },
                { src: 'images/10th/sociallll.jpeg', subject: 'Social' },
                { src: 'images/10th/social%3Blll.jpeg', subject: 'Social' },
                { src: 'images/10th/socialllll.jpeg', subject: 'Social' },
                { src: 'images/10th/socialllllllllll.jpeg', subject: 'Social' },
                { src: 'images/10th/socialllllllllllllllllll.jpeg', subject: 'Social' },
                { src: 'images/10th/english.jpeg', subject: 'English' },
                { src: 'images/10th/english%20(2).jpeg', subject: 'English' },
                { src: 'images/10th/english%20(3).jpeg', subject: 'English' },
                { src: 'images/10th/telugu.jpeg', subject: 'Telugu' },
                { src: 'images/10th/teluguuuuuu.jpeg', subject: 'Telugu' },
                { src: 'images/10th/hindi.jpeg', subject: 'Hindi' },
                { src: 'images/10th/hindii.jpeg', subject: 'Hindi' },
                { src: 'images/10th/hindiiii.jpeg', subject: 'Hindi' },
                { src: 'images/10th/sanskrit.jpeg', subject: 'Sanskrit' }
            ]
        };

        const classOrder = ['class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8', 'class-9', 'class-10'];

        // Initialize classes gallery
        function initClassesGallery() {
            const classPicker = document.getElementById('classPicker');
            const galleryGrid = document.getElementById('galleryGrid');
            if (!classPicker || !galleryGrid) return;

            classOrder.forEach(key => {
                const tab = document.createElement('div');
                tab.className = 'category-tab';
                tab.dataset.classKey = key;
                tab.textContent = 'Class ' + key.split('-')[1];
                tab.addEventListener('click', () => selectClass(key));
                classPicker.appendChild(tab);
            });

            selectClass('class-10');
        }

        function selectClass(key) {
            document.querySelectorAll('.class-picker .category-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.classKey === key);
            });
            const caption = document.getElementById('galleryCaption');
            if (caption) {
                caption.textContent = 'CLASS ' + key.split('-')[1].toUpperCase();
            }

            const galleryGrid = document.getElementById('galleryGrid');
            const items = classesData[key] || [];
            galleryGrid.innerHTML = '';

            if (items.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'gallery-empty';
                emptyState.innerHTML = `
                    <p>No images available for this class yet</p>
                    <span>Images will be added soon</span>
                `;
                galleryGrid.appendChild(emptyState);
                return;
            }

            items.forEach((item, index) => {
                const figure = document.createElement('figure');
                figure.className = 'gallery-item';
                figure.innerHTML = `
                    <img src="${item.src}" alt="${item.subject} activity" loading="lazy" decoding="async">
                    <figcaption>${item.subject}</figcaption>
                `;
                // Click to expand in the image viewer
                figure.addEventListener('click', () => openImageViewer(items, index));
                galleryGrid.appendChild(figure);
            });
        }

        initClassesGallery();

        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');

        // Open/close the mobile menu; lock background scrolling while it is open
        function closeMobileMenu() {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        }

        function isMenuOpen() {
            return navMenu.classList.contains('active');
        }

        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            const open = navMenu.classList.contains('active');
            document.body.classList.toggle('menu-open', open);
            menuToggle.setAttribute('aria-expanded', String(open));
        });

        // Close the menu when tapping anywhere outside the panel or hamburger
        document.addEventListener('pointerdown', (e) => {
            if (!isMenuOpen()) return;
            if (navMenu.contains(e.target) || menuToggle.contains(e.target)) return;
            closeMobileMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMenuOpen()) closeMobileMenu();
        });

        // Stop auto-rotation while the tab is hidden (saves battery / CPU)
        function pauseAutoRotate() {
            clearInterval(autoRotateTimer);
            autoRotateTimer = null;
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                pauseAutoRotate();
            } else {
                startAutoRotate();
            }
        });

        // Finger swipes rotate the featured carousel; vertical swipes keep
        // scrolling the page naturally (touch-action: pan-y on the container).
        (function initCarouselSwipe() {
            const zone = carousel;
            if (!zone) return;

            let startX = 0;
            let startY = 0;
            let tracking = false;

            zone.addEventListener('touchstart', (e) => {
                if (e.touches.length !== 1) return;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                tracking = true;
                pauseAutoRotate();
            }, { passive: true });

            zone.addEventListener('touchend', (e) => {
                if (!tracking) return;
                tracking = false;
                const touch = e.changedTouches[0];
                if (!touch) return;
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;
                if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                    dx < 0 ? nextSlide(true) : prevSlide(true);
                }
                startAutoRotate();
            }, { passive: true });

            zone.addEventListener('touchcancel', () => {
                tracking = false;
                startAutoRotate();
            }, { passive: true });
        })();

        // Header scroll effect
        const header = document.getElementById('header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });

        // Smooth scrolling and active navigation
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    const startY = window.scrollY;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: REDUCED_MOTION ? 'auto' : 'smooth'
                    });

                    // Fallback: if the smooth scroll never starts (suspended
                    // rendering contexts), jump instantly so navigation always lands
                    setTimeout(() => {
                        if (Math.abs(window.scrollY - startY) < 0.5) {
                            window.scrollTo(0, targetPosition);
                        }
                    }, 150);
                    
                    // Close mobile menu if open
                    closeMobileMenu();
                }
            });
        });

        // Update active navigation on scroll
        function updateActiveNav() {
            const scrollPosition = window.scrollY + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        const href = link.getAttribute('href').substring(1);
                        if (href === sectionId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', updateActiveNav, { passive: true });

        // Loading screen
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loader = document.getElementById('loader');
                loader.classList.add('hidden');
            }, 1500);
        });

        // Add parallax effect to the hero carousel (scoped so it cannot
        // overlap the sections that follow the hero)
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.hero .carousel-container');
            if (parallax) {
                parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        }, { passive: true });

        /* ========== Premium Theme System (Dark default / Light) ========== */

        const THEME_STORAGE_KEY = 'kd-theme';
        const themeToggleBtn = document.getElementById('themeToggle');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let themeAnimRunning = false;

        function getTheme() {
            return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        }

        // Centralised switch - HTML + CSS variables handle every section,
        // nothing here touches individual elements or the carousel.
        function setTheme(theme) {
            if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            if (themeToggleBtn) {
                themeToggleBtn.setAttribute(
                    'aria-label',
                    theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
                );
                themeToggleBtn.setAttribute(
                    'title',
                    theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
                );
            }
            try {
                localStorage.setItem(THEME_STORAGE_KEY, theme);
            } catch (err) { /* storage unavailable */ }
        }

        // Largest distance from the wave origin to any viewport corner
        function waveRadius(x, y) {
            const dx = Math.max(x, window.innerWidth - x);
            const dy = Math.max(y, window.innerHeight - y);
            return Math.hypot(dx, dy);
        }

        // Fallback for browsers without the View Transitions API:
        // a soft colour wave (new theme with a subtle accent rim) expands
        // from the toggle button, and text/surface colours glide as it passes.
        function fallbackWaveTransition(x, y, nextTheme) {
            const maxDistance = waveRadius(x, y) + 80;
            const wave = document.createElement('div');
            wave.className = 'theme-wave';
            const core = nextTheme === 'light' ? '#F3F0E8' : '#0A0A0A';
            const rim = nextTheme === 'light'
                ? 'rgba(153, 69, 255, 0.16)'
                : 'rgba(0, 255, 255, 0.18)';

            wave.style.left = x + 'px';
            wave.style.top = y + 'px';
            wave.style.width = maxDistance * 2 + 'px';
            wave.style.height = maxDistance * 2 + 'px';
            wave.style.background =
                'radial-gradient(circle, ' + core + ' 0%, ' + core + ' 60%, ' + rim + ' 82%, ' + core + ' 100%)';
            document.body.appendChild(wave);

            const waveAnimation = wave.animate(
                [
                    { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
                    { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.8 },
                    { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }
                ],
                { duration: 1400, easing: 'cubic-bezier(0.65, 0, 0.25, 1)' }
            );

            // Swap the theme while the wave still covers most of the screen
            setTimeout(() => {
                document.documentElement.classList.add('theme-transition');
                setTheme(nextTheme);
                setTimeout(() => {
                    document.documentElement.classList.remove('theme-transition');
                }, 1000);
            }, 620);

            waveAnimation.finished.finally(() => {
                wave.remove();
                themeAnimRunning = false;
            });
        }

        // Premium wave: the new theme spreads as an organic circle from the
        // toggle button using the View Transitions API where available.
        function waveTransition(x, y, nextTheme) {
            if (themeAnimRunning) return;
            themeAnimRunning = true;

            // Watchdog: if a transition never settles (e.g. the page is
            // hidden and no rendering frames are produced), re-enable the
            // toggle so it can't get stuck.
            window.setTimeout(() => { themeAnimRunning = false; }, 1800);

            if (prefersReducedMotion) {
                setTheme(nextTheme);
                themeAnimRunning = false;
                return;
            }

            if (document.startViewTransition) {
                const maxDistance = waveRadius(x, y);
                const transition = document.startViewTransition(() => setTheme(nextTheme));

                transition.ready.then(() => {
                    document.documentElement.animate(
                        {
                            clipPath: [
                                'circle(' + (maxDistance * 0.02) + 'px at ' + x + 'px ' + y + 'px)',
                                'circle(' + (maxDistance + 60) + 'px at ' + x + 'px ' + y + 'px)'
                            ]
                        },
                        {
                            duration: 1100,
                            easing: 'cubic-bezier(0.65, 0, 0.2, 1)',
                            pseudoElement: '::view-transition-new(root)'
                        }
                    );
                }).catch(() => {});

                transition.finished.finally(() => {
                    themeAnimRunning = false;
                });
            } else {
                fallbackWaveTransition(x, y, nextTheme);
            }
        }

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                const rect = themeToggleBtn.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                waveTransition(x, y, getTheme() === 'dark' ? 'light' : 'dark');
            });
        }

        /* ========== Gallery Image Viewer (click to expand) ========== */

        const viewerState = {
            overlay: null,
            stage: null,
            img: null,
            subjectEl: null,
            countEl: null,
            descEl: null,
            prevBtn: null,
            nextBtn: null,
            closeBtn: null,
            items: [],
            index: 0,
            open: false,
            busy: false
        };

        const VIEWER_FADE_MS = 250;
        const VIEWER_ZOOM_MS = 420;

        // Build the full-screen viewer once; all chrome is styled from theme
        // variables, so Dark / Light modes need no extra handling here.
        function ensureImageViewer() {
            if (viewerState.overlay) return;

            const overlay = document.createElement('div');
            overlay.id = 'imageView';
            overlay.className = 'image-viewer';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-label', 'Expanded image viewer');
            overlay.innerHTML = `
                <button type="button" class="viewer-btn viewer-close" id="viewerClose" aria-label="Close viewer">&#215;</button>
                <div class="viewer-stage" id="viewerStage">
                    <img class="viewer-img" id="viewerImg" alt="" decoding="async">
                </div>
                <div class="viewer-bar">
                    <button type="button" class="viewer-btn viewer-nav" id="viewerPrev" aria-label="Previous image">&#8249;</button>
                    <div class="viewer-caption">
                        <p class="viewer-subject" id="viewerSubject"></p>
                        <p class="viewer-count" id="viewerCount"></p>
                        <p class="viewer-desc" id="viewerDesc" hidden></p>
                    </div>
                    <button type="button" class="viewer-btn viewer-nav" id="viewerNext" aria-label="Next image">&#8250;</button>
                </div>
            `;
            document.body.appendChild(overlay);

            viewerState.overlay = overlay;
            viewerState.stage = overlay.querySelector('#viewerStage');
            viewerState.img = overlay.querySelector('#viewerImg');
            viewerState.subjectEl = overlay.querySelector('#viewerSubject');
            viewerState.countEl = overlay.querySelector('#viewerCount');
            viewerState.descEl = overlay.querySelector('#viewerDesc');
            viewerState.prevBtn = overlay.querySelector('#viewerPrev');
            viewerState.nextBtn = overlay.querySelector('#viewerNext');
            viewerState.closeBtn = overlay.querySelector('#viewerClose');

            viewerState.closeBtn.addEventListener('click', closeImageViewer);
            viewerState.prevBtn.addEventListener('click', () => stepImageViewer(-1));
            viewerState.nextBtn.addEventListener('click', () => stepImageViewer(1));

            // Horizontal swipes navigate the gallery; vertical swipes are left alone
            let swipeStartX = 0;
            let swipeStartY = 0;
            let swipeTracking = false;

            viewerState.stage.addEventListener('touchstart', (e) => {
                if (e.touches.length !== 1) return;
                swipeStartX = e.touches[0].clientX;
                swipeStartY = e.touches[0].clientY;
                swipeTracking = true;
            }, { passive: true });

            viewerState.stage.addEventListener('touchend', (e) => {
                if (!swipeTracking) return;
                swipeTracking = false;
                const touch = e.changedTouches[0];
                if (!touch) return;
                const dx = touch.clientX - swipeStartX;
                const dy = touch.clientY - swipeStartY;
                if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                    stepImageViewer(dx < 0 ? 1 : -1);
                }
            }, { passive: true });

            viewerState.stage.addEventListener('touchcancel', () => {
                swipeTracking = false;
            }, { passive: true });
        }

        // Find the currently displayed gallery thumbnail so the open/close
        // animation can connect the viewer to its original position.
        function thumbRectFor(viewerIndex) {
            const item = viewerState.items[viewerIndex];
            if (!item || !item.src) return null;
            const img = document.querySelector('#galleryGrid .gallery-item img[src="' + item.src + '"]');
            return img ? img.getBoundingClientRect() : null;
        }

        // Fit the full original image inside the stage without changing its
        // aspect ratio, then return the displayed size.
        function displayedFitSize() {
            const stage = viewerState.stage;
            const img = viewerState.img;
            const nw = img.naturalWidth;
            const nh = img.naturalHeight;
            if (!nw || !nh) return null;
            const scale = Math.min(stage.clientWidth / nw, stage.clientHeight / nh);
            return { width: nw * scale, height: nh * scale };
        }

        function applyViewerStart(startFromThumb) {
            const img = viewerState.img;

            if (REDUCED_MOTION) {
                img.style.transition = 'none';
                img.style.transform = '';
                img.style.opacity = '1';
                setTimeout(() => { img.style.transition = ''; }, 50);
                return;
            }

            const rect = startFromThumb ? thumbRectFor(viewerState.index) : null;
            const fit = displayedFitSize();
            let startStyle;

            if (rect && fit && rect.width > 0) {
                // Grow out of the clicked thumbnail
                const stageRect = viewerState.stage.getBoundingClientRect();
                const dx = (rect.left + rect.width / 2) - (stageRect.left + stageRect.width / 2);
                const dy = (rect.top + rect.height / 2) - (stageRect.top + stageRect.height / 2);
                const s = Math.min(Math.max(rect.width / fit.width, 0.02), 1);
                startStyle = 'translate(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
            } else {
                // Subtle zoom-in for next/previous navigation
                startStyle = 'scale(0.94)';
            }

            img.style.transition = 'none';
            img.style.transform = startStyle;
            img.style.opacity = startFromThumb ? '0' : '0.3';
            void img.offsetWidth; // commit the start position without animating

            img.style.transition = '';
            setTimeout(() => {
                img.style.transform = '';
                img.style.opacity = '1';
            }, 40);
        }

        function showViewerImage(index, startFromThumb) {
            viewerState.index = index;
            const item = viewerState.items[index];
            const img = viewerState.img;
            const src = img.getAttribute('src');

            viewerState.overlay.classList.toggle('single', viewerState.items.length < 2);
            viewerState.subjectEl.textContent = item.subject;
            viewerState.countEl.textContent = (index + 1) + ' / ' + viewerState.items.length;

            // Admin-published description (optional per image; stays completely
            // hidden while empty so visitors never see a placeholder)
            const desc = (item.description || '').trim();
            viewerState.descEl.textContent = desc;
            viewerState.descEl.hidden = desc === '';
            viewerState.overlay.classList.toggle('described', desc !== '');

            if (src !== item.src) {
                img.removeAttribute('src');
                img.style.opacity = '0';
            }
            img.setAttribute('src', item.src);
            img.setAttribute('alt', item.subject + ' activity photo');

            // Flip the class markers only after the pixels are ready so there
            // is no flash of the previous image; cached thumbnails resolve fast.
            const reveal = () => applyViewerStart(startFromThumb);
            if (img.decode) {
                img.decode().then(reveal).catch(reveal);
            } else {
                img.addEventListener('load', reveal, { once: true });
            }

            // Preload the neighbours so next/previous feels instant
            const count = viewerState.items.length;
            if (count > 1) {
                [-1, 1].forEach(offset => {
                    const neighbour = viewerState.items[(index + offset + count) % count];
                    if (neighbour) {
                        const pre = new Image();
                        pre.decoding = 'async';
                        pre.src = neighbour.src;
                    }
                });
            }
        }

        function openImageViewer(items, index) {
            if (viewerState.open || viewerState.busy) return;
            if (!items || !items.length) return;

            ensureImageViewer();
            viewerState.items = items;
            viewerState.open = true;
            viewerState.busy = true;

            document.body.classList.add('viewer-open');
            viewerState.overlay.classList.add('open');
            showViewerImage(index, true);

            setTimeout(() => {
                viewerState.overlay.classList.add('in');
            }, 40);

            setTimeout(() => { viewerState.busy = false; }, VIEWER_FADE_MS + 60);
            viewerState.closeBtn.focus({ preventScroll: true });
        }

        function closeImageViewer() {
            if (!viewerState.open || viewerState.busy) return;
            viewerState.busy = true;

            const img = viewerState.img;
            const shrinkBack = () => {
                viewerState.overlay.classList.remove('in');
                setTimeout(() => {
                    viewerState.overlay.classList.remove('open');
                    document.body.classList.remove('viewer-open');
                    viewerState.open = false;
                    viewerState.busy = false;
                    img.removeAttribute('src');
                    img.style.transform = '';
                    img.style.opacity = '';
                    viewerState.closeBtn.blur();
                }, REDUCED_MOTION ? 0 : VIEWER_FADE_MS + 40);
            };

            if (REDUCED_MOTION) {
                shrinkBack();
                return;
            }

            // Reverse the opening movement back toward the thumbnail
            const rect = thumbRectFor(viewerState.index);
            const fit = displayedFitSize();
            if (rect && fit && rect.width > 0) {
                const stageRect = viewerState.stage.getBoundingClientRect();
                const dx = (rect.left + rect.width / 2) - (stageRect.left + stageRect.width / 2);
                const dy = (rect.top + rect.height / 2) - (stageRect.top + stageRect.height / 2);
                const s = Math.min(Math.max(rect.width / fit.width, 0.02), 1);
                img.style.opacity = '0';
                img.style.transform = 'translate(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
            } else {
                img.style.opacity = '0';
            }
            setTimeout(shrinkBack, VIEWER_ZOOM_MS);
        }

        function stepImageViewer(offset) {
            if (!viewerState.open || viewerState.busy) return;
            const count = viewerState.items.length;
            if (count < 2) return;
            viewerState.index = (viewerState.index + offset + count) % count;
            showViewerImage(viewerState.index, false);
        }

        // Keyboard controls for the viewer (the carousel skips keys while
        // the viewer is open, so Escape and the arrow keys act only here).
        document.addEventListener('keydown', (e) => {
            if (!viewerState.open) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                closeImageViewer();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                stepImageViewer(1);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                stepImageViewer(-1);
            }
        });

        /* ========== Published gallery content (Supabase public read) ========== */
        // These two values are PUBLIC by design (publishable key) - the row
        // level security policy on the table limits this key to reading
        // published rows only. All writes go through protected server functions.
        const KD_SUPABASE = {
            url: 'https://jafeokzowtmgcbbnnfls.supabase.co',
            anon: 'sb_publishable_oa2my3vXMLln33z0v9NZ3w_8XdMYoUX'
        };
        window.KD_CLASSES = classesData;

        // Merge published descriptions/uploads into the galleries once.
        // Any failure (offline, hosting without functions, misconfig) leaves
        // the bundled gallery exactly as it is today.
        (async function loadPublishedContent() {
            if (!KD_SUPABASE.url || !KD_SUPABASE.anon) return;
            let rows;
            try {
                let res = await fetch(
                    KD_SUPABASE.url + '/rest/v1/gallery_images?published=eq.true&select=src,subject,class_key,description&order=created_at.asc',
                    { headers: { apikey: KD_SUPABASE.anon, Authorization: 'Bearer ' + KD_SUPABASE.anon } }
                );
                if (!res.ok) {
                    // Retry with the key only in the apikey header (setup dependent)
                    res = await fetch(
                        KD_SUPABASE.url + '/rest/v1/gallery_images?published=eq.true&select=src,subject,class_key,description&order=created_at.asc',
                        { headers: { apikey: KD_SUPABASE.anon } }
                    );
                }
                if (!res.ok) return;
                rows = await res.json();
            } catch (err) {
                return; // offline / blocked - bundled gallery remains in place
            }

            let touched = false;
            rows.forEach(row => {
                if (!row || !row.src) return;
                const srcKey = String(row.src).split('?')[0];
                // Find the bundled item by src in any class (class may have been
                // moved in the dashboard; descriptions bind to the photo itself.
                // The query part of upload URLs is only cache-busting.)
                let existing = null;
                Object.keys(classesData).forEach(key => {
                    if (existing) return;
                    existing = (classesData[key] || []).find(item => String(item.src).split('?')[0] === srcKey);
                });
                if (existing) {
                    existing.description = row.description || '';
                    existing.src = row.src; // keep the cache-busted URL live
                    touched = true;
                } else if (/^https?:\/\//i.test(row.src)) {
                    // Uploaded images come from Supabase Storage and are additive
                    const targetKey = classesData[row.class_key] ? row.class_key : 'class-10';
                    classesData[targetKey].push({
                        src: row.src,
                        subject: row.subject || 'Photos',
                        description: row.description || ''
                    });
                    touched = true;
                }
            });

            if (touched) {
                const activeTab = document.querySelector('.class-picker .category-tab.active');
                if (activeTab) selectClass(activeTab.dataset.classKey);
            }
        })();