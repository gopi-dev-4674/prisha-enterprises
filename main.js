/* Prisha Enterprises - Master JavaScript
   Vanilla JS for animations, typewriter, counter, navbar scroll, & live status
*/

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

  if (hamburger && mobileMenu && mobileMenuOverlay) {
    function toggleMenu() {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      mobileMenuOverlay.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    }

    hamburger.addEventListener('click', toggleMenu);
    mobileMenuOverlay.addEventListener('click', toggleMenu);

    // Close menu when link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (mobileMenu.classList.contains('open')) {
          toggleMenu();
        }
      });
    });
  }

  // 2. Sticky Navbar Effect on Scroll
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // 3. Typewriter Effect (Hero Headline)
  const typewriterElement = document.getElementById('typewriter');
  if (typewriterElement) {
    const phrases = [
      "Screen Repair in 1–2 Hours",
      "Premium Screen Guards",
      "Mobile Accessories & Skins"
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
      const currentPhrase = phrases[phraseIndex];
      
      if (isDeleting) {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
      } else {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 100;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        typeSpeed = 2200; // Pause at end of phrase
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 400; // Pause before starting next phrase
      }

      setTimeout(type, typeSpeed);
    }

    type();
  }

  // 4. Scroll IntersectionObserver for Fade-in-up animations
  const fadeElements = document.querySelectorAll('.fade-in-up');
  if (fadeElements.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Optional: stop observing once revealed
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    fadeElements.forEach((el, index) => {
      // Set stagger delay if inside a grid
      if (!el.style.getPropertyValue('--stagger-index')) {
        el.style.setProperty('--stagger-index', index % 4);
      }
      scrollObserver.observe(el);
    });
  }

  // 5. Animated Counter Count-up from 0
  const counterElements = document.querySelectorAll('.counter');
  if (counterElements.length > 0) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-target'));
          const decimals = parseInt(el.getAttribute('data-decimals') || '0');
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 2000; // ms
          const stepTime = 20; // ms
          const totalSteps = duration / stepTime;
          let currentStep = 0;

          const counterInterval = setInterval(() => {
            currentStep++;
            const progress = currentStep / totalSteps;
            // Ease out quad
            const easedProgress = progress * (2 - progress);
            const currentValue = easedProgress * target;

            if (currentStep >= totalSteps) {
              el.textContent = target.toFixed(decimals) + suffix;
              clearInterval(counterInterval);
            } else {
              el.textContent = currentValue.toFixed(decimals) + suffix;
            }
          }, stepTime);

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counterElements.forEach(el => counterObserver.observe(el));
  }

  // 6. Live Shop Open/Closed Status Detector
  const liveStatusContainer = document.getElementById('liveStatus');
  if (liveStatusContainer) {
    function updateShopStatus() {
      // Get IST time (India Standard Time UTC+5:30)
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istDate = new Date(utc + (3600000 * 5.5));

      const day = istDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const hour = istDate.getHours();
      const minute = istDate.getMinutes();
      const totalMinutes = hour * 60 + minute;

      let isOpen = false;

      if (day >= 1 && day <= 5) {
        // Mon-Fri: 9 AM (540 mins) to 9 PM (1260 mins)
        if (totalMinutes >= 540 && totalMinutes < 1260) {
          isOpen = true;
        }
      } else if (day === 6) {
        // Saturday: 10 AM (600 mins) to 10 PM (1320 mins)
        if (totalMinutes >= 600 && totalMinutes < 1320) {
          isOpen = true;
        }
      } // Sunday closed

      if (isOpen) {
        liveStatusContainer.className = 'live-status open';
        liveStatusContainer.innerHTML = '<span class="status-dot"></span> OPEN NOW (Closes tonight)';
      } else {
        liveStatusContainer.className = 'live-status closed';
        liveStatusContainer.innerHTML = '<span class="status-dot"></span> CLOSED NOW (Opens ' + (day === 0 ? 'Mon 9 AM' : 'Tomorrow') + ')';
      }
    }

    updateShopStatus();
  }

  // 7. Hero Section Clean Scroll Behavior (No layout shift transform)
  const heroBackground = document.querySelector('.hero-parallax');
  if (heroBackground) {
    heroBackground.style.transform = 'none';
  }

  // ==========================================================================
  // 8. DYNAMIC INJECTION OF AI ASSISTANT MODAL & FLOATING FAB
  // ==========================================================================
  const modalHTML = `
    <!-- Floating AI FAB Button -->
    <button id="aiFabBtn" class="ai-fab" aria-label="Open AI Diagnostics & Assistant">
      <span class="ai-fab-dot"></span>
      <span>✨ AI Diagnostics & Chat</span>
    </button>

    <!-- AI Modal Overlay & Panel -->
    <div id="aiModalOverlay" class="ai-modal-overlay"></div>
    <div id="aiModalPanel" class="ai-modal-panel">
      <!-- Modal Header -->
      <div class="ai-modal-header">
        <div class="ai-modal-title">
          <span>⚡</span>
          <span style="font-weight: 700;">Prisha AI Studio Hub</span>
        </div>
        <button id="aiModalClose" class="ai-modal-close" aria-label="Close Modal">&times;</button>
      </div>

      <!-- Navigation Tabs -->
      <div class="ai-modal-tabs">
        <button class="ai-tab-btn active" data-tab="chat">💬 AI Assistant</button>
        <button class="ai-tab-btn" data-tab="thinking">🧠 Deep Diagnostics</button>
        <button class="ai-tab-btn" data-tab="generator">🎨 Skin Visualizer</button>
      </div>

      <!-- Modal Body -->
      <div class="ai-modal-body">
        <!-- TAB 1: AI Chatbot (gemini-3.5-flash) -->
        <div id="tabChat" class="ai-tab-content" style="display: flex; flex-direction: column; height: 100%;">
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <span>Instant answers on repairs, screen guards, delivery & pricing</span>
            <span style="color: var(--accent-green); font-weight: 600;">Gemini 3.5 Flash</span>
          </div>

          <div id="chatThread" class="chat-thread">
            <div class="chat-bubble assistant">
              👋 Hi! I'm your <strong>Prisha Enterprises AI Assistant</strong> in Horamavu, Bengaluru.<br/><br/>
              How can I help you today? Ask me about screen repairs, gorilla glass pricing, store hours, or booking free doorstep pick-up!
            </div>
          </div>

          <div class="quick-prompts">
            <button class="quick-chip" data-prompt="How much is screen replacement for iPhone 13?">📱 Screen Repair Cost</button>
            <button class="quick-chip" data-prompt="What are your shop opening hours in Horamavu?">🕒 Shop Hours</button>
            <button class="quick-chip" data-prompt="Do you provide free doorstep delivery in Hoysala Nagar?">🚚 Free Pick & Delivery</button>
            <button class="quick-chip" data-prompt="What's the difference between gorilla glass & bulletproof guard?">🛡️ Screen Guard Types</button>
          </div>

          <form id="chatForm" class="chat-input-row">
            <input type="text" id="chatInput" class="chat-input" placeholder="Type your message here..." required autocomplete="off" />
            <button type="submit" class="btn btn-primary btn-sm">Send 🚀</button>
          </form>
        </div>

        <!-- TAB 2: Deep Thinking Diagnostics (gemini-3.1-pro-preview with ThinkingLevel.HIGH) -->
        <div id="tabThinking" class="ai-tab-content" style="display: none;">
          <div class="thinking-badge">
            <span>🧠 HIGH REASONING ENGINE</span> &bull; <span>Gemini 3.1 Pro (Thinking Mode)</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">
            Describe your smartphone issue for an expert hardware fault diagnosis, teardown analysis, and price estimate.
          </p>

          <form id="diagnoseForm">
            <div class="form-group">
              <label class="form-label" for="diagModel">Device Brand & Model *</label>
              <input type="text" id="diagModel" class="form-control" placeholder="e.g. iPhone 14 Pro, Samsung S23 Ultra, Redmi Note 12" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="diagIssue">Primary Issue Category *</label>
              <select id="diagIssue" class="form-select" required>
                <option value="Cracked Screen / Display Flickering">📱 Cracked Screen / Touch Failure</option>
                <option value="Battery Draining Fast / Swollen Battery">🔋 Battery Replacement Needed</option>
                <option value="Charging Port Loose / Not Charging">⚡ Charging Port Issue</option>
                <option value="Water Damage / Phone Dropped in Liquid">💧 Water Damage Recovery</option>
                <option value="Camera Lens Cracked / Blurry Focus">📷 Camera Lens Repair</option>
                <option value="Speaker / Mic Sound Distorted">🔊 Speaker / Microphone Fault</option>
                <option value="Other Component Repair">🛠️ Other Component Fault</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="diagNotes">Specific Symptoms / Notes (Optional)</label>
              <textarea id="diagNotes" class="form-control" rows="3" placeholder="e.g. Screen turned green after drop, touch works on right side only..."></textarea>
            </div>

            <button type="submit" id="btnDiagnose" class="btn btn-primary w-full">
              <span>⚡ Run Deep AI Reasoning Diagnosis</span>
            </button>
          </form>

          <div id="diagResultContainer" style="display: none;"></div>
        </div>

        <!-- TAB 3: Skin Visualizer & Image Generator (gemini-3.1-flash-image with 1K/2K/4K) -->
        <div id="tabGenerator" class="ai-tab-content" style="display: none;">
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <span>Generate custom phone skin & case previews</span>
            <span style="color: var(--accent-green); font-weight: 600;">Gemini 3.1 Flash Image</span>
          </div>

          <form id="genImageForm">
            <div class="form-group">
              <label class="form-label" for="genPrompt">Custom Skin Design Idea *</label>
              <input type="text" id="genPrompt" class="form-control" placeholder="e.g. Cyberpunk glowing emerald circuit wrap, Matte carbon fiber..." required />
            </div>

            <div class="grid-2" style="gap: 12px;">
              <div>
                <label class="form-label">Image Resolution (Affordance)</label>
                <div class="resolution-pills" id="resPills">
                  <div class="res-pill active" data-size="1K">1K</div>
                  <div class="res-pill" data-size="2K">2K</div>
                  <div class="res-pill" data-size="4K">4K</div>
                </div>
              </div>

              <div>
                <label class="form-label" for="genAspect">Aspect Ratio</label>
                <select id="genAspect" class="form-select">
                  <option value="1:1" selected>1:1 (Square Skin)</option>
                  <option value="9:16">9:16 (Phone Screen)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                </select>
              </div>
            </div>

            <button type="submit" id="btnGenImage" class="btn btn-primary w-full" style="margin-top: 14px;">
              <span>✨ Generate High-Res Preview</span>
            </button>
          </form>

          <div id="genImageStage" class="image-preview-stage">
            <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 20px;">
              🎨 Your high-resolution AI generated skin preview will appear here.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Modal Open / Close Logic
  const fabBtn = document.getElementById('aiFabBtn');
  const overlay = document.getElementById('aiModalOverlay');
  const panel = document.getElementById('aiModalPanel');
  const closeBtn = document.getElementById('aiModalClose');

  function openAiModal(tabName = 'chat') {
    overlay.classList.add('open');
    panel.classList.add('open');
    switchAiTab(tabName);
  }

  function closeAiModal() {
    overlay.classList.remove('open');
    panel.classList.remove('open');
  }

  if (fabBtn) fabBtn.addEventListener('click', () => openAiModal('chat'));
  if (overlay) overlay.addEventListener('click', closeAiModal);
  if (closeBtn) closeBtn.addEventListener('click', closeAiModal);

  // Tab Switching Logic
  const tabBtns = document.querySelectorAll('.ai-tab-btn');
  const tabContents = {
    chat: document.getElementById('tabChat'),
    thinking: document.getElementById('tabThinking'),
    generator: document.getElementById('tabGenerator')
  };

  function switchAiTab(selectedTab) {
    tabBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === selectedTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    Object.keys(tabContents).forEach(key => {
      if (key === selectedTab && tabContents[key]) {
        tabContents[key].style.display = key === 'chat' ? 'flex' : 'block';
      } else if (tabContents[key]) {
        tabContents[key].style.display = 'none';
      }
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchAiTab(btn.getAttribute('data-tab'));
    });
  });

  // Export helper for opening modal from external buttons (e.g. hero CTA buttons)
  window.openPrishaAiModal = openAiModal;

  // --------------------------------------------------------------------------
  // CHAT LOGIC (gemini-3.5-flash)
  // --------------------------------------------------------------------------
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatThread = document.getElementById('chatThread');
  let chatHistory = [];

  function appendChatMessage(role, text) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    
    // Simple markdown formatting
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');

    bubble.innerHTML = formatted;
    chatThread.appendChild(bubble);
    chatThread.scrollTop = chatThread.scrollHeight;
  }

  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userText = chatInput.value.trim();
      if (!userText) return;

      appendChatMessage('user', userText);
      chatInput.value = '';

      chatHistory.push({ role: 'user', content: userText });

      // Show typing indicator
      const typingBubble = document.createElement('div');
      typingBubble.className = 'chat-bubble assistant';
      typingBubble.id = 'typingBubble';
      typingBubble.innerHTML = `<em>AI Assistant is typing...</em>`;
      chatThread.appendChild(typingBubble);
      chatThread.scrollTop = chatThread.scrollHeight;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: chatHistory })
        });

        const data = await response.json();
        const typingEl = document.getElementById('typingBubble');
        if (typingEl) typingEl.remove();

        if (response.ok && data.text) {
          appendChatMessage('assistant', data.text);
          chatHistory.push({ role: 'assistant', content: data.text });
        } else {
          appendChatMessage('assistant', `⚠️ Sorry, I ran into an issue: ${data.error || 'Please try again or call +91 99004 42171 directly!'}`);
        }
      } catch (err) {
        const typingEl = document.getElementById('typingBubble');
        if (typingEl) typingEl.remove();
        appendChatMessage('assistant', '⚠️ Network error. Please check your connection or call +91 99004 42171.');
      }
    });
  }

  // Quick Chips Click Event
  document.querySelectorAll('.quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-prompt');
      if (promptText && chatInput) {
        chatInput.value = promptText;
        chatForm.dispatchEvent(new Event('submit'));
      }
    });
  });

  // --------------------------------------------------------------------------
  // DEEP THINKING DIAGNOSTIC LOGIC (gemini-3.1-pro-preview with ThinkingLevel.HIGH)
  // --------------------------------------------------------------------------
  const diagnoseForm = document.getElementById('diagnoseForm');
  const diagResultContainer = document.getElementById('diagResultContainer');
  const btnDiagnose = document.getElementById('btnDiagnose');

  if (diagnoseForm) {
    diagnoseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const deviceModel = document.getElementById('diagModel').value.trim();
      const issueCategory = document.getElementById('diagIssue').value;
      const details = document.getElementById('diagNotes').value.trim();

      if (!deviceModel) return;

      btnDiagnose.disabled = true;
      btnDiagnose.innerHTML = `<span class="loading-spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></span> <span>Thinking High-Level Reasoning...</span>`;
      
      diagResultContainer.style.display = 'block';
      diagResultContainer.innerHTML = `
        <div class="diagnostic-result-card" style="border-color: rgba(74, 222, 128, 0.4);">
          <div style="font-size: 0.85rem; color: var(--accent-green); font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span class="loading-spinner" style="width:14px;height:14px;border-width:2px;"></span>
            <span>Gemini 3.1 Pro is executing deep hardware diagnostic reasoning...</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Evaluating circuit teardown models, component fault patterns, and local Horamavu pricing database...</p>
        </div>
      `;

      try {
        const response = await fetch('/api/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceModel, issueCategory, details })
        });

        const data = await response.json();

        btnDiagnose.disabled = false;
        btnDiagnose.innerHTML = `<span>⚡ Run Deep AI Reasoning Diagnosis</span>`;

        if (response.ok && data.text) {
          let formattedText = data.text
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--accent);">$1</strong>')
            .replace(/### (.*?)\n/g, '<h4 style="font-size: 1.05rem; margin: 14px 0 6px; color:var(--text);">$1</h4>')
            .replace(/## (.*?)\n/g, '<h3 style="font-size: 1.15rem; margin: 16px 0 8px; color:var(--accent);">$1</h3>')
            .replace(/\n/g, '<br/>');

          diagResultContainer.innerHTML = `
            <div class="diagnostic-result-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
                <h4 style="font-size: 1.1rem; color: var(--text);">📋 Diagnostic & Technical Analysis Report</h4>
                <span style="font-size: 0.75rem; background: var(--accent); color: var(--btn-primary-text); padding: 2px 8px; border-radius: 4px; font-weight: 700;">Verified Expert AI</span>
              </div>
              <div style="font-size: 0.9rem; color: var(--text); line-height: 1.6;">
                ${formattedText}
              </div>
              <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; color: var(--muted);">Horamavu Repair Slot: <strong>1–2 Hours Express</strong></span>
                <a href="tel:+919900442171" class="btn btn-primary btn-sm">📞 Call +91 99004 42171</a>
              </div>
            </div>
          `;
        } else {
          diagResultContainer.innerHTML = `
            <div class="diagnostic-result-card" style="border-color: #ef4444;">
              <p style="color: #ef4444; font-size: 0.9rem;">⚠️ Diagnostic failed: ${data.error || 'Please try again.'}</p>
            </div>
          `;
        }
      } catch (err) {
        btnDiagnose.disabled = false;
        btnDiagnose.innerHTML = `<span>⚡ Run Deep AI Reasoning Diagnosis</span>`;
        diagResultContainer.innerHTML = `
          <div class="diagnostic-result-card" style="border-color: #ef4444;">
            <p style="color: #ef4444; font-size: 0.9rem;">⚠️ Connection error. Please check your network.</p>
          </div>
        `;
      }
    });
  }

  // --------------------------------------------------------------------------
  // IMAGE GENERATOR LOGIC (gemini-3.1-flash-image with 1K, 2K, 4K)
  // --------------------------------------------------------------------------
  const genImageForm = document.getElementById('genImageForm');
  const genPromptInput = document.getElementById('genPrompt');
  const genAspectSelect = document.getElementById('genAspect');
  const genImageStage = document.getElementById('genImageStage');
  const btnGenImage = document.getElementById('btnGenImage');

  let selectedSize = '1K';
  const resPills = document.querySelectorAll('#resPills .res-pill');
  resPills.forEach(pill => {
    pill.addEventListener('click', () => {
      resPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedSize = pill.getAttribute('data-size');
    });
  });

  if (genImageForm) {
    genImageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const promptVal = genPromptInput.value.trim();
      if (!promptVal) return;

      const aspectVal = genAspectSelect.value;

      btnGenImage.disabled = true;
      btnGenImage.innerHTML = `<span class="loading-spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></span> <span>Rendering ${selectedSize} AI Preview...</span>`;

      genImageStage.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div class="loading-spinner" style="margin: 0 auto 16px;"></div>
          <p style="font-size: 0.9rem; color: var(--accent-green); font-weight: 600; margin-bottom: 4px;">Generating High-Res ${selectedSize} Mobile Skin Design...</p>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Gemini 3.1 Flash Image is texturing & rendering your design.</p>
        </div>
      `;

      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptVal,
            size: selectedSize,
            aspectRatio: aspectVal
          })
        });

        const data = await response.json();

        btnGenImage.disabled = false;
        btnGenImage.innerHTML = `<span>✨ Generate High-Res Preview</span>`;

        if (response.ok && data.imageUrl) {
          genImageStage.innerHTML = `
            <div style="width: 100%; position: relative;">
              <img src="${data.imageUrl}" alt="${promptVal}" />
              <div style="padding: 14px; background: #161616; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent-green);">Resolution: ${data.size} (${data.aspectRatio})</span>
                  <a href="${data.imageUrl}" download="prisha-custom-skin-${selectedSize}.png" class="btn btn-ghost btn-sm">📥 Download High-Res</a>
                </div>
                <a href="https://wa.me/919900442171?text=${encodeURIComponent("Hi Prisha Enterprises! I designed this phone skin concept: " + promptVal + ". Can you print and apply it for my phone?")}" target="_blank" class="btn btn-primary btn-sm w-full">
                  💬 Request Print at Prisha Enterprises (+91 99004 42171)
                </a>
              </div>
            </div>
          `;
        } else {
          genImageStage.innerHTML = `
            <div style="text-align: center; color: #ef4444; padding: 30px 20px;">
              ⚠️ ${data.error || 'Failed to generate skin image. Please try again with a different description.'}
            </div>
          `;
        }
      } catch (err) {
        btnGenImage.disabled = false;
        btnGenImage.innerHTML = `<span>✨ Generate High-Res Preview</span>`;
        genImageStage.innerHTML = `
          <div style="text-align: center; color: #ef4444; padding: 30px 20px;">
            ⚠️ Network error. Please try again.
          </div>
        `;
      }
    });
  }
});

// ==========================================================================
// HERO REPAIR WORKSTATION CANVAS & SIMULATOR LOGIC
// ==========================================================================
const repairImages = {
  counter: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=800&q=80',
  motherboard: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  screen: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
};

window.switchRepairMode = function(mode) {
  const bgImg = document.getElementById('repairVideoBg');
  const btnCounter = document.getElementById('btnModeCounter');
  const btnMotherboard = document.getElementById('btnModeMotherboard');
  const btnScreen = document.getElementById('btnModeScreen');
  const hudTitle = document.getElementById('hudTitle');
  const hudSub = document.getElementById('hudSub');
  const hudVal = document.getElementById('hudValue');

  [btnCounter, btnMotherboard, btnScreen].forEach(btn => btn && btn.classList.remove('active'));

  if (mode === 'counter') {
    if (btnCounter) btnCounter.classList.add('active');
    if (bgImg) bgImg.src = repairImages.counter;
    if (hudTitle) hudTitle.innerHTML = `<span>🏪 HORAMAVU WORKSTATION</span>`;
    if (hudSub) hudSub.textContent = `Master Technician at Counter - Live Queue`;
    if (hudVal) hudVal.textContent = `STATUS: READY`;
  } else if (mode === 'motherboard') {
    if (btnMotherboard) btnMotherboard.classList.add('active');
    if (bgImg) bgImg.src = repairImages.motherboard;
    if (hudTitle) hudTitle.innerHTML = `<span>🔬 MOTHERBOARD IC REPAIR</span>`;
    if (hudSub) hudSub.textContent = `Micro-soldering & BGA Reballing`;
    if (hudVal) hudVal.textContent = `5.1V / 2.1A OK`;
  } else if (mode === 'screen') {
    if (btnScreen) btnScreen.classList.add('active');
    if (bgImg) bgImg.src = repairImages.screen;
    if (hudTitle) hudTitle.innerHTML = `<span>📱 OLED SCREEN & GLASS</span>`;
    if (hudSub) hudSub.textContent = `UV OCA Laminating & Separation`;
    if (hudVal) hudVal.textContent = `VACUUM: -98kPa`;
  }
};

window.setRepairStep = function(step) {
  for (let i = 1; i <= 4; i++) {
    const pill = document.getElementById(`pillStep${i}`);
    if (pill) {
      if (i === step) pill.classList.add('active');
      else pill.classList.remove('active');
    }
  }

  const hudVal = document.getElementById('hudValue');
  const hudSub = document.getElementById('hudSub');
  if (step === 1) {
    if (hudSub) hudSub.textContent = `Multi-point Thermal & Voltage Inspection`;
    if (hudVal) hudVal.textContent = `DIAG: 100% DONE`;
  } else if (step === 2) {
    if (hudSub) hudSub.textContent = `Precision Laser IC Heating & Micro-soldering`;
    if (hudVal) hudVal.textContent = `TEMP: 350°C OK`;
  } else if (step === 3) {
    if (hudSub) hudSub.textContent = `Dust-free Clean Room Assembly`;
    if (hudVal) hudVal.textContent = `SEAL: DUST-PROOF`;
  } else if (step === 4) {
    if (hudSub) hudSub.textContent = `Quality Check & Warranty Seal Attached`;
    if (hudVal) hudVal.textContent = `QC: PASSED ✅`;
  }
};

function initRepairCanvas() {
  const canvas = document.getElementById('repairCanvasOverlay');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    if (canvas.parentElement) {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const particles = [];
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: Math.random() * (canvas.width || 300),
      y: Math.random() * (canvas.height || 200),
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? '#22c55e' : '#38bdf8'
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 65) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(34, 197, 94, ${0.8 - dist / 65})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
}

document.addEventListener('DOMContentLoaded', () => {
  initRepairCanvas();
});

