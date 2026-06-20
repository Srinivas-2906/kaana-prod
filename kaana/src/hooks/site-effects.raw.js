    // DOM Elements
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursorFollower');
    const header = document.getElementById('header');
    const menuButton = document.getElementById('menuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const scrollProgress = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');
    const contactForm = document.getElementById('contactForm');
    const staggerItems = document.querySelectorAll('.stagger-item');
    const revealUpElements = document.querySelectorAll('.reveal-up');
    const revealLeftElements = document.querySelectorAll('.reveal-left');
    const revealRightElements = document.querySelectorAll('.reveal-right');
    const scaleInElements = document.querySelectorAll('.scale-in');
    const rotateInElements = document.querySelectorAll('.rotate-in');
    const blurInElements = document.querySelectorAll('.blur-in');
    const clipRevealElements = document.querySelectorAll('.clip-reveal');
    const processSteps = document.querySelectorAll('.process-step');
    const processNavBtns = document.querySelectorAll('.process-nav-btn');
    const processDotBtns = document.querySelectorAll('.process-dot-btn');
    const processImage = document.getElementById('processImage');
    const processStepLabel = document.getElementById('processStepLabel');
    const processStepTitle = document.getElementById('processStepTitle');
    const heroTitle = document.getElementById('heroTitle');
    const linkTriggers = document.querySelectorAll('.link-trigger');
    const pageTransition = document.getElementById('pageTransition');
    const aiChatButton = document.getElementById('aiChatButton');
    const aiChatPanel = document.getElementById('aiChatPanel');
    const aiChatClose = document.getElementById('aiChatClose');
    const aiChatMessages = document.getElementById('aiChatMessages');
    const aiChatInput = document.getElementById('aiChatInput');
    const aiChatSend = document.getElementById('aiChatSend');
    const aiTyping = document.getElementById('aiTyping');
    const textGeneratorInput = document.getElementById('textGeneratorInput');
    const textGeneratorButton = document.getElementById('textGeneratorButton');
    const textGeneratorOutput = document.getElementById('textGeneratorOutput');
    const demoChatInput = document.getElementById('demoChatInput');
    const demoChatSend = document.getElementById('demoChatSend');
    const demoChatMessages = document.getElementById('demoChatMessages');

    // Process Images
    const processImages = [
      'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ];

    // Process Step Titles
    const processStepTitles = [
      'Discovery & Research',
      'Strategy & Planning',
      'Design & Prototyping',
      'Development',
      'Launch & Optimization'
    ];

    // AI Chat Responses
    const aiResponses = [
      "I can help you implement digital solutions for your business. What specific challenges are you facing?",
      "Our web design services can help you create a stunning online presence. Would you like to learn more?",
      "Kāna's chatbot solutions can automate customer service tasks. Shall I explain how?",
      "We specialize in creating custom e-commerce platforms tailored to your industry. What sector are you in?",
      "Our Print & Digital Marketing strategies can help increase your online visibility. Would you like a demonstration?",
      "I'd be happy to schedule a consultation with our specialists. When would work best for you?"
    ];

    // Demo Chat Responses
    const demoChatResponses = {
      "web design": "Our web design services create responsive, user-friendly websites that look great on all devices. We focus on creating intuitive navigation, fast loading times, and designs that convert visitors into customers. Would you like to see some examples of our recent work?",
      "app": "Our app development team creates native and cross-platform mobile applications for iOS and Android. We handle everything from UI/UX design to development, testing, and deployment. Our apps are built with scalability and performance in mind. What type of app are you interested in developing?",
      "chatbot": "Our chatbot solutions use advanced natural language processing to provide 24/7 customer support, answer FAQs, and even process orders or bookings. They can be integrated with your website, social media platforms, or messaging apps. Would you like to know more about implementation?",
      "e-commerce": "Our e-commerce solutions include custom online stores with secure payment processing, inventory management, and marketing tools. We can build on platforms like Shopify or WooCommerce, or create custom solutions for unique requirements. What products do you sell online?",
      "marketing": "Our Print & Digital Marketing services include Instagram boosts, Google Ads, Facebook Ads, YouTube promotions, SEO, content marketing, social media management, PPC advertising, and email campaigns. We create data-driven strategies that increase your online visibility and drive conversions. Which marketing channels are you currently using?",
      
      "contact": "You can reach our team at kaana.srinivas@gmail.com or call us at +91 90087 47926. Alternatively, you can fill out the contact form on our website, and we'll get back to you within 24 hours. Would you like me to connect you with a project manager now?"
    };

    // AI Text Generator Responses
    const textGeneratorResponses = {
      "web design": "Responsive web design is essential in today's multi-device world. It ensures your website provides an optimal viewing experience across a wide range of devices, from desktop computers to smartphones. Benefits include improved user experience, better SEO rankings, easier maintenance, increased conversion rates, and broader reach. By implementing responsive design principles, businesses can ensure their digital presence remains effective regardless of how users access their content.",
      "app development": "Mobile app development creates powerful opportunities for businesses to engage customers and streamline operations. Well-designed apps can enhance brand loyalty, provide valuable user data, enable direct marketing channels, and create new revenue streams. The development process typically includes discovery, planning, UI/UX design, development, testing, and deployment phases. Choosing between native, hybrid, or web apps depends on your specific business needs, target audience, and functionality requirements.",
      "e-commerce": "E-commerce platforms enable businesses to sell products and services online, reaching customers globally without geographical limitations. Key benefits include lower operational costs, 24/7 sales capability, personalized shopping experiences, and valuable customer insights through data analytics. Successful e-commerce implementations require secure payment processing, intuitive product navigation, mobile optimization, and seamless checkout experiences. Strategic inventory management and marketing automation further enhance the effectiveness of online stores.",
      "chatbot": "Chatbots transform customer service by providing instant, 24/7 support without human intervention. These AI-powered assistants can handle multiple inquiries simultaneously, reducing wait times and improving customer satisfaction. Beyond answering FAQs, advanced chatbots can process orders, make recommendations, and collect valuable customer data. Implementation requires careful planning of conversation flows, integration with existing systems, and continuous training to improve accuracy. The return on investment typically comes from reduced support costs and increased customer engagement.",
      "Print & Digital Marketing": "Print & Digital Marketing encompasses various online strategies to promote brands and connect with potential customers. Effective campaigns typically combine SEO, content marketing, social media, email marketing, and paid advertising. The advantages include precise audience targeting, real-time campaign optimization, measurable results, and cost-effectiveness compared to traditional marketing. Success requires understanding your audience, creating valuable content, optimizing for search engines, engaging on social platforms, and analyzing performance data to continuously refine your approach. Channels include Instagram boosts, Google Ads, Facebook Ads, YouTube promotions, PPC, SEO, content marketing, social media management, and email campaigns.",
      "analytics": "Data analytics transforms raw information into actionable business insights. By implementing robust analytics solutions, companies can identify trends, understand customer behavior, optimize operations, and make data-driven decisions. The process typically involves data collection, cleaning, analysis, visualization, and interpretation. Modern analytics platforms offer real-time dashboards, predictive modeling, and machine learning capabilities to extract maximum value from your data. This strategic approach leads to improved efficiency, reduced costs, and competitive advantages in the marketplace."
    };

    // Initialize Grid Lines
    function initGridLines() {
      const gridLines = document.getElementById('gridLines');
      
      // Create horizontal lines
      for (let i = 0; i < 10; i++) {
        const line = document.createElement('div');
        line.classList.add('grid-line', 'grid-line-horizontal');
        line.style.top = `${(i + 1) * 10}%`;
        gridLines.appendChild(line);
      }
      
      // Create vertical lines
      for (let i = 0; i < 10; i++) {
        const line = document.createElement('div');
        line.classList.add('grid-line', 'grid-line-vertical');
        line.style.left = `${(i + 1) * 10}%`;
        gridLines.appendChild(line);
      }
    }

    // Initialize Particles
    function initParticles() {
      const canvas = document.getElementById('particles-canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      // Particle class
      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = Math.random() * 2 + 0.5;
          this.speedX = Math.random() * 0.5 - 0.25;
          this.speedY = Math.random() * 0.5 - 0.25;
          this.color = '#00D4FF';
          this.opacity = Math.random() * 0.5 + 0.1;
        }
        
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          
          if (this.x < 0 || this.x > canvas.width) {
            this.speedX = -this.speedX;
          }
          
          if (this.y < 0 || this.y > canvas.height) {
            this.speedY = -this.speedY;
          }
        }
        
        draw() {
          ctx.fillStyle = this.color;
          ctx.globalAlpha = this.opacity;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Create particles
      const particles = [];
      const particleCount = 100;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
      
      // Animation loop
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();
        }
        
        // Draw connections
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
        
        requestAnimationFrame(animate);
      }
      
      animate();
    }

    // Initialize Neural Network
    function initNeuralNetwork() {
      const canvas = document.getElementById('neural-network');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      // Node class
      class Node {
        constructor(x, y, layer) {
          this.x = x;
          this.y = y;
          this.radius = 3;
          this.layer = layer;
          this.connections = [];
          this.color = '#00D4FF';
        }
        
        draw() {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        connect(node) {
          this.connections.push(node);
        }
        
        drawConnections() {
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 0.2;
          ctx.globalAlpha = 0.2;
          
          for (let i = 0; i < this.connections.length; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.connections[i].x, this.connections[i].y);
            ctx.stroke();
          }
        }
      }
      
      // Create neural network
      const layers = 4;
      const nodesPerLayer = [10, 14, 14, 8];
      const nodes = [];
      
      // Create nodes
      for (let layer = 0; layer < layers; layer++) {
        for (let i = 0; i < nodesPerLayer[layer]; i++) {
          const x = (layer + 1) * canvas.width / (layers + 1);
          const y = (i + 1) * canvas.height / (nodesPerLayer[layer] + 1);
          nodes.push(new Node(x, y, layer));
        }
      }
      
      // Create connections
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        if (node.layer < layers - 1) {
          const nextLayer = nodes.filter(n => n.layer === node.layer + 1);
          
          for (let j = 0; j < nextLayer.length; j++) {
            node.connect(nextLayer[j]);
          }
        }
      }
      
      // Animation loop
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].drawConnections();
        }
        
        // Draw nodes
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].draw();
        }
        
        requestAnimationFrame(animate);
      }
      
      animate();
    }

    // Initialize Hero Swiper
    function initHeroSwiper() {
      new Swiper('.hero-swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        pagination: {
          el: '.hero-swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          640: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 1,
          },
          1024: {
            slidesPerView: 1,
          },
        }
      });
    }

    // Custom Cursor
    function initCustomCursor() {
      if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
          cursor.style.left = e.clientX + 'px';
          cursor.style.top = e.clientY + 'px';
          
          setTimeout(() => {
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
          }, 100);
        });

        document.addEventListener('mousedown', () => {
          cursor.classList.add('active');
          cursorFollower.classList.add('active');
        });

        document.addEventListener('mouseup', () => {
          cursor.classList.remove('active');
          cursorFollower.classList.remove('active');
        });

        const links = document.querySelectorAll('a, button');
        links.forEach(link => {
          link.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            cursorFollower.classList.add('active');
          });
          
          link.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            cursorFollower.classList.remove('active');
          });
        });
      }
    }

    // Scroll Progress
    function initScrollProgress() {
      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        
        scrollProgress.style.transform = `scaleX(${progress / 100})`;
        
        if (scrollTop > 50) {
          header.classList.add('bg-dark/80');
          header.classList.add('backdrop-blur-md');
        } else {
          header.classList.remove('bg-dark/80');
          header.classList.remove('backdrop-blur-md');
        }
        
        // Show/hide back to top button
        if (scrollTop > 300) {
          backToTop.classList.add('opacity-100');
          backToTop.classList.remove('pointer-events-none');
        } else {
          backToTop.classList.remove('opacity-100');
          backToTop.classList.add('pointer-events-none');
        }
        
        // Update active nav link based on scroll position
        const sections = document.querySelectorAll('section[id]');
        let currentSection = '';
        
        sections.forEach(section => {
          const sectionTop = section.offsetTop - 100;
          const sectionHeight = section.offsetHeight;
          if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
          }
        });
        
        navLinks.forEach(link => {
          link.classList.remove('text-accent');
          if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('text-accent');
          }
        });
        
        mobileNavLinks.forEach(link => {
          link.classList.remove('text-accent');
          if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('text-accent');
          }
        });
      });
    }

    // Reveal on Scroll
    function initRevealOnScroll() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      }, { threshold: 0.1 });
      
      revealUpElements.forEach(element => {
        observer.observe(element);
      });
      
      revealLeftElements.forEach(element => {
        observer.observe(element);
      });
      
      revealRightElements.forEach(element => {
        observer.observe(element);
      });
      
      scaleInElements.forEach(element => {
        observer.observe(element);
      });
      
      rotateInElements.forEach(element => {
        observer.observe(element);
      });
      
      blurInElements.forEach(element => {
        observer.observe(element);
      });
      
      clipRevealElements.forEach(element => {
        observer.observe(element);
      });
      
      staggerItems.forEach(element => {
        observer.observe(element);
      });
    }

    // Mobile Menu Toggle
    function initMobileMenu() {
      menuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('opacity-0');
        mobileMenu.classList.toggle('pointer-events-none');
        
        // Toggle menu button appearance
        const spans = menuButton.querySelectorAll('span');
        if (!mobileMenu.classList.contains('opacity-0')) {
          spans[0].style.transform = 'translateY(3px) rotate(45deg)';
          spans[1].style.transform = 'translateY(-3px) rotate(-45deg)';
        } else {
          spans[0].style.transform = 'none';
          spans[1].style.transform = 'none';
        }
      });

      // Close mobile menu when clicking a link (except careers)
      mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          // Don't close if it's a careers trigger
          if (link.classList.contains('careers-trigger')) {
            e.preventDefault();
            // Close mobile menu first
            mobileMenu.classList.add('opacity-0');
            mobileMenu.classList.add('pointer-events-none');
            
            // Reset menu button appearance
            const spans = menuButton.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.transform = 'none';
            
            // Open careers modal after a small delay
            setTimeout(() => {
              openCareersModal();
            }, 300);
            return;
          }
          
          mobileMenu.classList.add('opacity-0');
          mobileMenu.classList.add('pointer-events-none');
          
          // Reset menu button appearance
          const spans = menuButton.querySelectorAll('span');
          spans[0].style.transform = 'none';
          spans[1].style.transform = 'none';
        });
      });
    }

    // Careers Modal
    let careersModal, careersCloseBtn;
    let careersModalInitialized = false;

    function openCareersModal() {
      const modal = document.getElementById('careersModal');
      if (!modal) return;
      modal.classList.add('active');
      document.body.classList.add('modal-open');
      // Reset scroll position
      modal.scrollTop = 0;
    }

    function closeCareersModal() {
      const modal = document.getElementById('careersModal');
      if (!modal) return;
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }

    function initCareersModal() {
      careersModal = document.getElementById('careersModal');
      careersCloseBtn = document.getElementById('careersCloseBtn');
      
      if (careersModalInitialized || !careersModal) return;
      careersModalInitialized = true;

      const careersTriggers = document.querySelectorAll('.careers-trigger');

      // Open modal on careers trigger click
      careersTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          openCareersModal();
        });
      });

      // Close modal on close button click
      if (careersCloseBtn) {
        careersCloseBtn.addEventListener('click', () => {
          closeCareersModal();
        });
      }

      // Close modal when clicking outside (on backdrop)
      careersModal.addEventListener('click', (e) => {
        if (e.target === careersModal) {
          closeCareersModal();
        }
      });

      // Close modal on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && careersModal && careersModal.classList.contains('active')) {
          closeCareersModal();
        }
      });

      // Close modal when clicking apply button (it will navigate to contact)
      const careersApplyBtns = document.querySelectorAll('.careers-apply-btn');
      careersApplyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          closeCareersModal();
        });
      });
    }

    // Testimonial Slider
    function initTestimonialSlider() {
      const slider = document.getElementById('testimonialSlider');
      const track = slider.querySelector('.minimal-slider-track');
      const dots = slider.querySelectorAll('.minimal-slider-dot');
      let currentSlide = 0;
      
      function goToSlide(index) {
        track.style.transform = `translateX(-${index * 100}%)`;
        
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
        
        currentSlide = index;
      }
      
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          goToSlide(index);
        });
      });
      
      // Auto slide
      setInterval(() => {
        const nextSlide = (currentSlide + 1) % dots.length;
        goToSlide(nextSlide);
      }, 5000);
    }

    // Process Timeline
    function initProcessTimeline() {
      let currentStep = 0;
      
      function updateProcessStep(index) {
        // Update active step
        processSteps.forEach((step, i) => {
          step.classList.toggle('active', i === index);
        });
        
        // Update process dots
        processDotBtns.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
        
        // Update process image
        processImage.style.opacity = 0;
        setTimeout(() => {
          processImage.src = processImages[index];
          processStepLabel.textContent = `Step 0${index + 1}`;
          processStepTitle.textContent = processStepTitles[index];
          processImage.style.opacity = 1;
        }, 300);
        
        currentStep = index;
      }
      
      // Process navigation buttons
      processNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const direction = btn.getAttribute('data-direction');
          let newStep = currentStep;
          
          if (direction === 'prev') {
            newStep = (currentStep - 1 + processSteps.length) % processSteps.length;
          } else {
            newStep = (currentStep + 1) % processSteps.length;
          }
          
          updateProcessStep(newStep);
        });
      });
      
      // Process dot buttons
      processDotBtns.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          updateProcessStep(index);
        });
      });
      
      // Scroll to activate steps
      const processObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const step = parseInt(entry.target.getAttribute('data-step')) - 1;
            updateProcessStep(step);
          }
        });
      }, { threshold: 0.5 });
      
      processSteps.forEach(step => {
        processObserver.observe(step);
      });
    }

    // Magnetic Buttons
    function initMagneticButtons() {
      const magneticItems = document.querySelectorAll('.magnetic-wrap');
      
      magneticItems.forEach(magneticWrap => {
        const magneticArea = magneticWrap.querySelector('.magnetic-area');
        
        magneticWrap.addEventListener('mousemove', (e) => {
          const rect = magneticWrap.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const distanceX = e.clientX - centerX;
          const distanceY = e.clientY - centerY;
          
          magneticArea.style.transform = `translate(${distanceX * 0.2}px, ${distanceY * 0.2}px)`;
        });
        
        magneticWrap.addEventListener('mouseleave', () => {
          magneticArea.style.transform = 'translate(0, 0)';
        });
      });
    }

    // Split Text Animation
    function initSplitText() {
      if (typeof SplitType === 'undefined') return;
      const splitText = new SplitType('#heroTitle', { types: 'chars' });
      // Ensure visibility even if GSAP is unavailable
      heroTitle.classList.add('active');
      if (typeof gsap !== 'undefined' && splitText && splitText.chars) {
        gsap.from(splitText.chars, {
          opacity: 0,
          y: 50,
          stagger: 0.02,
          duration: 0.8,
          ease: 'power4.out'
        });
      }
    }

    // Link Click Animation
    function initLinkClickAnimation() {
      linkTriggers.forEach(link => {
        link.addEventListener('click', (e) => {
          // Create ripple effect
          const ripple = document.createElement('div');
          ripple.classList.add('link-click-ripple');
          ripple.style.left = `${e.clientX}px`;
          ripple.style.top = `${e.clientY}px`;
          document.body.appendChild(ripple);
          
          // Remove ripple after animation
          setTimeout(() => {
            ripple.remove();
          }, 600);
          
          // If it's an anchor link, don't trigger page transition
          if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
            return;
          }
          
          // Trigger page transition for non-anchor links
          if (link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            
            pageTransition.classList.add('active');
            
            setTimeout(() => {
              window.location.href = link.getAttribute('href');
            }, 500);
          }
        });
      });
    }

    // AI Chat Widget
    function initAiChatWidget() {
      aiChatButton.addEventListener('click', () => {
        aiChatPanel.classList.add('active');
      });
      
      aiChatClose.addEventListener('click', () => {
        aiChatPanel.classList.remove('active');
      });
      
      function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('ai-message', 'ai-message-user');
        messageElement.textContent = message;
        aiChatMessages.appendChild(messageElement);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
      }
      
      function addBotMessage(message) {
        // Add typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('ai-typing');
        
        for (let i = 0; i < 3; i++) {
          const dot = document.createElement('div');
          dot.classList.add('ai-typing-dot');
          typingIndicator.appendChild(dot);
        }
        
        aiChatMessages.appendChild(typingIndicator);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        
        // Remove typing indicator and add message after delay
        setTimeout(() => {
          typingIndicator.remove();
          
          const messageElement = document.createElement('div');
          messageElement.classList.add('ai-message', 'ai-message-bot');
          messageElement.textContent = message;
          aiChatMessages.appendChild(messageElement);
          aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        }, 1500);
      }
      
      function handleUserMessage() {
        const message = aiChatInput.value.trim();
        
        if (message) {
          addUserMessage(message);
          aiChatInput.value = '';
          
          // Get random response
          const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
          addBotMessage(response);
        }
      }
      
      aiChatSend.addEventListener('click', handleUserMessage);
      
      aiChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleUserMessage();
        }
      });
    }

    // AI Text Generator
    function initAiTextGenerator() {
      function generateResponse(inputRaw) {
        const input = inputRaw.trim().toLowerCase();
        if (!input) return;
        textGeneratorOutput.innerHTML = '<div class="ai-typing"><div class="ai-typing-dot"></div><div class="ai-typing-dot"></div><div class="ai-typing-dot"></div></div>';
        setTimeout(() => {
          let response = '';
          for (const keyword in textGeneratorResponses) {
            if (input.includes(keyword)) {
              response = textGeneratorResponses[keyword];
              break;
            }
          }
          if (!response) {
            // Lightly tailored generic scaffold
            response = `Here’s a concise outline to get you started on ${inputRaw}:

1) Goal and audience
2) Key benefits and differentiators
3) Implementation steps (stack, timeline, owners)
4) Launch checklist (QA, SEO, analytics)
5) Growth plan (iterations, experiments, KPIs)`;
          }
          // Stream the response for realism
          const container = document.createElement('div');
          container.className = 'text-light whitespace-pre-line';
          textGeneratorOutput.innerHTML = '';
          textGeneratorOutput.appendChild(container);
          let i = 0;
          const interval = setInterval(() => {
            container.textContent += response.charAt(i);
            i++;
            if (i >= response.length) clearInterval(interval);
          }, 12);
        }, 500);
      }

      textGeneratorButton.addEventListener('click', () => {
        generateResponse(textGeneratorInput.value);
      });
      textGeneratorInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generateResponse(textGeneratorInput.value);
      });
    }

    // Demo Chat
    function initDemoChat() {
      function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('ai-message', 'ai-message-user');
        messageElement.textContent = message;
        demoChatMessages.appendChild(messageElement);
        demoChatMessages.scrollTop = demoChatMessages.scrollHeight;
      }
      
      function addBotMessage(message) {
        // Add typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('ai-typing');
        
        for (let i = 0; i < 3; i++) {
          const dot = document.createElement('div');
          dot.classList.add('ai-typing-dot');
          typingIndicator.appendChild(dot);
        }
        
        demoChatMessages.appendChild(typingIndicator);
        demoChatMessages.scrollTop = demoChatMessages.scrollHeight;
        
        // Remove typing indicator and add message after delay with streaming
        setTimeout(() => {
          typingIndicator.remove();
          const messageElement = document.createElement('div');
          messageElement.classList.add('ai-message', 'ai-message-bot');
          demoChatMessages.appendChild(messageElement);
          demoChatMessages.scrollTop = demoChatMessages.scrollHeight;
          let i = 0;
          const interval = setInterval(() => {
            messageElement.textContent += message.charAt(i);
            i++;
            demoChatMessages.scrollTop = demoChatMessages.scrollHeight;
            if (i >= message.length) clearInterval(interval);
          }, 12);
        }, 500);
      }
      
      function respond(message) {
        // Find matching response
        let response = "I'm sorry, I don't have information about that specific topic. Would you like to know about our web design, app development, chatbot, e-commerce, or Print & Digital Marketing services?";
        for (const keyword in demoChatResponses) {
          if (message.toLowerCase().includes(keyword)) {
            response = demoChatResponses[keyword];
            break;
          }
        }
        addBotMessage(response);
      }

      function handleUserMessage() {
        const message = demoChatInput.value.trim();
        
        if (message) {
          addUserMessage(message);
          demoChatInput.value = '';
          respond(message);
        }
      }
      
      demoChatSend.addEventListener('click', handleUserMessage);
      
      demoChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleUserMessage();
        }
      });

      // Quick replies
      const quickReplies = [
        { label: 'Services', text: 'web design, app, chatbot, e-commerce, marketing' },
        { label: 'Timeline', text: 'How long does a project take?' },
        { label: 'Portfolio', text: 'Can I see portfolio examples?' }
      ];
      const quickWrap = document.getElementById('demoQuickReplies');
      if (quickWrap) {
        quickReplies.forEach(q => {
          const btn = document.createElement('button');
          btn.className = 'text-xs px-3 py-1 border border-neutral-700 rounded-sm hover:border-accent hover:text-accent transition-colors';
          btn.textContent = q.label;
          btn.addEventListener('click', () => {
            addUserMessage(q.label);
            respond(q.text);
          });
          quickWrap.appendChild(btn);
        });
      }
    }

    // AI Typing Animation
    function initAiTypingAnimation() {
      if (!aiTyping) return;
      const prompts = [
        'How can I help transform your business with digital solutions today?',
        'Ask me about web design, apps, chatbots, or e‑commerce.',
        'Type a topic and I’ll draft a quick outline for you.'
      ];
      let idx = 0;
      function type(text, cb) {
        aiTyping.textContent = '';
        let i = 0;
        (function loop() {
          if (i < text.length) {
            aiTyping.textContent += text.charAt(i++);
            setTimeout(loop, 35);
          } else if (cb) cb();
        })();
      }
      function cycle() {
        type(prompts[idx], () => setTimeout(() => {
          idx = (idx + 1) % prompts.length;
          cycle();
        }, 1600));
      }
      cycle();
    }

    // Back to Top
    function initBackToTop() {
      backToTop.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
    
    // Contact Form
    function initContactForm() {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // In a real application, you would handle form submission here
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
      });
    }

    // Initialize everything when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
      initGridLines();
      initParticles();
      initNeuralNetwork();
      initHeroSwiper();
      initCustomCursor();
      initScrollProgress();
      initRevealOnScroll();
      initMobileMenu();
      initCareersModal();
      initTestimonialSlider();
      initProcessTimeline();
      initMagneticButtons();
      // Removed split-text animation to prevent line wrapping glitches
      initLinkClickAnimation();
      initAiChatWidget();
      initAiTextGenerator();
      initDemoChat();
      initAiTypingAnimation();
      initBackToTop();
      initContactForm();
