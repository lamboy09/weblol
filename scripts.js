// JavaScript Document

/*

TemplateMo 600 Prism Flux

https://templatemo.com/tm-600-prism-flux

*/


// Portfolio data for carousel

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

        // Skills data
        const skillsData = [
            { name: 'React.js', icon: '⚛️', level: 95, category: 'frontend' },
            { name: 'Node.js', icon: '🟢', level: 90, category: 'backend' },
            { name: 'TypeScript', icon: '📘', level: 88, category: 'frontend' },
            { name: 'AWS', icon: '☁️', level: 92, category: 'cloud' },
            { name: 'Docker', icon: '🐳', level: 85, category: 'cloud' },
            { name: 'Python', icon: '🐍', level: 93, category: 'backend' },
            { name: 'Kubernetes', icon: '☸️', level: 82, category: 'cloud' },
            { name: 'GraphQL', icon: '◈', level: 87, category: 'backend' },
            { name: 'TensorFlow', icon: '🤖', level: 78, category: 'emerging' },
            { name: 'Blockchain', icon: '🔗', level: 75, category: 'emerging' },
            { name: 'Vue.js', icon: '💚', level: 85, category: 'frontend' },
            { name: 'MongoDB', icon: '🍃', level: 90, category: 'backend' }
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
                    behavior: 'smooth'
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
                        <img src="${data.image}" alt="${data.title}">
                    </div>
                    <h3 class="card-title">${data.title}</h3>
                    <button class="card-cta" onclick="scrollToSection('about')">Explore</button>
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
                item.style.transition = 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
                
                // Adjust spacing based on screen size
                let spacing1 = 400;
                let spacing2 = 600;
                let spacing3 = 750;
                
                if (isMobile) {
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

        // Initialize hexagonal skills grid
        function initSkillsGrid() {
            const skillsGrid = document.getElementById('skillsGrid');
            const categoryTabs = document.querySelectorAll('.category-tab');
            
            function displaySkills(category = 'all') {
                skillsGrid.innerHTML = '';
                
                const filteredSkills = category === 'all' 
                    ? skillsData 
                    : skillsData.filter(skill => skill.category === category);
                
                filteredSkills.forEach((skill, index) => {
                    const hexagon = document.createElement('div');
                    hexagon.className = 'skill-hexagon';
                    hexagon.style.animationDelay = `${index * 0.1}s`;
                    
                    hexagon.innerHTML = `
                        <div class="hexagon-inner">
                            <div class="hexagon-content">
                                <div class="skill-icon-hex">${skill.icon}</div>
                                <div class="skill-name-hex">${skill.name}</div>
                                <div class="skill-level">
                                    <div class="skill-level-fill" style="width: ${skill.level}%"></div>
                                </div>
                                <div class="skill-percentage-hex">${skill.level}%</div>
                            </div>
                        </div>
                    `;
                    
                    skillsGrid.appendChild(hexagon);
                });
            }
            
            categoryTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    categoryTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    displaySkills(tab.dataset.category);
                });
            });
            
            displaySkills();
        }

        // Event listeners
        document.getElementById('nextBtn').addEventListener('click', () => nextSlide(true));
        document.getElementById('prevBtn').addEventListener('click', () => prevSlide(true));

        // Auto-rotate carousel
        setInterval(nextSlide, 5000);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
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
        initSkillsGrid();
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
            'class-7': [],
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

            items.forEach(item => {
                const figure = document.createElement('figure');
                figure.className = 'gallery-item';
                figure.innerHTML = `
                    <img src="${item.src}" alt="${item.subject} activity" loading="lazy">
                    <figcaption>${item.subject}</figcaption>
                `;
                galleryGrid.appendChild(figure);
            });
        }

        initClassesGallery();

        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');

        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Header scroll effect
        const header = document.getElementById('header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

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
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
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

        window.addEventListener('scroll', updateActiveNav);

        // Animated counter for stats
        function animateCounter(element) {
            const target = parseInt(element.dataset.target);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const counter = setInterval(() => {
                current += step;
                if (current >= target) {
                    element.textContent = target;
                    clearInterval(counter);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, 16);
        }

        // Intersection Observer for stats animation
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    statNumbers.forEach(number => {
                        if (!number.classList.contains('animated')) {
                            number.classList.add('animated');
                            animateCounter(number);
                        }
                    });
                }
            });
        }, observerOptions);

        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            observer.observe(statsSection);
        }

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
        });