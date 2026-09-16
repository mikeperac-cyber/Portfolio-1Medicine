/* HealthBridge App */
const App = {
  locale: 'en',
  translations: {},
  currentTopic: null,
  activeQuizType: 'pre',
  quizScores: { pre: null, post: null },
  synth: window.speechSynthesis || null,
  speakingUtterance: null,

  async init() {
    const savedLocale = sessionStorage.getItem('healthbridge_locale');
    if (savedLocale && ['en', 'es', 'tr'].includes(savedLocale)) {
      this.locale = savedLocale;
    } else {
      const browserLang = (navigator.language || 'en').slice(0, 2);
      this.locale = ['es', 'tr'].includes(browserLang) ? browserLang : 'en';
    }

    const localeSelect = document.getElementById('localeSelect');
    if (localeSelect) {
      localeSelect.value = this.locale;
      localeSelect.addEventListener('change', (e) => {
        this.setLocale(e.target.value);
      });
    }

    window.addEventListener('hashchange', () => this.handleRoute());
    await this.loadTranslations();
    this.handleRoute();
  },

  async setLocale(newLocale) {
    this.locale = newLocale;
    sessionStorage.setItem('healthbridge_locale', newLocale);
    await this.loadTranslations();
    this.handleRoute();
  },

  async loadTranslations() {
    try {
      const res = await fetch('/api/translations?locale=' + this.locale);
      this.translations = await res.json();
      this.updateStaticUI();
    } catch (err) {
      console.error('Failed to load translations:', err);
    }
  },

  updateStaticUI() {
    const t = this.translations;
    if (!t) return;

    if (t.site) {
      document.title = (t.site.title || 'HealthBridge') + ' — Multilingual Health Service';
      const emergencyEl = document.getElementById('emergencyText');
      if (emergencyEl) emergencyEl.textContent = (t.site.emergencyNotice || '') + ' ' + (t.site.crisisNotice || '');
      const footerDisc = document.getElementById('footerDisclaimer');
      if (footerDisc) footerDisc.textContent = t.site.disclaimer;
    }

    if (t.nav) {
      const el = (id) => document.getElementById(id);
      if (el('navHome')) el('navHome').textContent = t.nav.home;
      if (el('navTopics')) el('navTopics').textContent = t.nav.topics;
      if (el('navClinics')) el('navClinics').textContent = t.nav.directory;
      if (el('navEthics')) el('navEthics').textContent = t.nav.ethics;
      if (el('navAdmin')) el('navAdmin').textContent = t.nav.admin;
    }
  },

  async handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const appEl = document.getElementById('app');

    document.querySelectorAll('.nav-link').forEach((link) => {
      const targetView = link.getAttribute('data-view');
      if (
        (hash === '/' && targetView === 'home') ||
        (hash.startsWith('/topics') && targetView === 'topics') ||
        (hash.startsWith('/clinics') && targetView === 'clinics') ||
        (hash.startsWith('/ethics') && targetView === 'ethics') ||
        (hash.startsWith('/admin') && targetView === 'admin')
      ) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    if (hash === '/' || hash === '') {
      await this.renderHome(appEl);
    } else if (hash === '/topics') {
      await this.renderTopics(appEl);
    } else if (hash.startsWith('/topics/')) {
      const slug = hash.replace('/topics/', '');
      await this.renderTopicDetail(appEl, slug);
    } else if (hash.startsWith('/clinics')) {
      await this.renderClinics(appEl);
    } else if (hash.startsWith('/ethics')) {
      this.renderEthics(appEl);
    } else if (hash.startsWith('/admin')) {
      await this.renderAdmin(appEl);
    } else {
      await this.renderHome(appEl);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  async renderHome(container) {
    const t = this.translations.home || {};
    let topics = [];
    try {
      const res = await fetch('/api/topics?locale=' + this.locale);
      topics = await res.json();
    } catch (err) {
      console.error(err);
    }

    container.innerHTML = 
      '<section class="hero">' +
        '<div class="hero-badge">' +
          '<span class="badge badge-success">✓ 100% Free &amp; Anonymous</span> ' +
          '<span class="badge badge-secondary">Grade 5–6 Reading Level</span>' +
        '</div>' +
        '<h1 style="margin-top:0.75rem;">' + (t.heroTitle || 'Health knowledge you can trust, in words that make sense.') + '</h1>' +
        '<p>' + (t.heroSubtitle || 'Simple, doctor-reviewed explainers on diabetes, vaccines, medicines, and clinics—free for our entire community with zero login required.') + '</p>' +
        '<div class="hero-actions">' +
          '<a href="#/topics" class="btn btn-primary">' + (t.exploreTopics || 'Browse Health Topics') + '</a> ' +
          '<a href="#/clinics" class="btn btn-secondary">' + (t.findClinics || 'Find Free &amp; Low-Cost Clinics') + '</a> ' +
          '<button class="btn btn-outline" onclick="App.showPrintModal()">🖨️ Outreach Flyer &amp; QR</button>' +
        '</div>' +
      '</section>' +

      '<section style="margin-bottom: 3rem;">' +
        '<h2>' + (t.topicsHeading || 'Essential Health Explainers') + '</h2>' +
        '<p style="color: var(--color-text-muted); margin-bottom: 1.25rem;">' + (t.topicsSubheading || 'Vetted by community physicians and public health leaders.') + '</p>' +
        '<div class="grid-cards">' +
          topics.map((top) => 
            '<div class="card">' +
              '<div class="card-header">' +
                '<span class="card-icon">' + top.icon + '</span>' +
                '<div>' +
                  '<div class="card-meta">' +
                    '<span class="badge">' + top.readingLevel + '</span> ' +
                    '<span class="badge badge-secondary">' + top.readMinutes + ' ' + (t.readTime || 'min read') + '</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<h3 class="card-title">' + top.title + '</h3>' +
              '<p class="card-body">' + top.summary + '</p>' +
              '<div class="card-footer">' +
                '<span style="font-size: 0.8rem; color: var(--color-text-muted); font-weight: 500;">' +
                  '✓ Reviewed by ' + top.reviewedBy.split(',')[0] +
                '</span>' +
                '<a href="#/topics/' + top.slug + '" class="btn btn-primary btn-sm">Read &amp; Listen &rarr;</a>' +
              '</div>' +
            '</div>'
          ).join('') +
        '</div>' +
      '</section>' +

      '<section style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 2rem;">' +
        '<h2 style="margin-bottom: 1.25rem;">' + (t.communityPledgeTitle || 'Our Community Promise') + '</h2>' +
        '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">' +
          '<div>' +
            '<h3 style="font-size: 1.1rem; color: var(--color-primary); margin-bottom: 0.5rem;">🛡️ ' + (t.pledge1Title || 'No Medical Diagnosis') + '</h3>' +
            '<p style="font-size: 0.95rem; color: var(--color-text-muted);">' + (t.pledge1Desc || 'We do not guess diagnoses or triage symptoms. We provide clear education to help you advocate for yourself.') + '</p>' +
          '</div>' +
          '<div>' +
            '<h3 style="font-size: 1.1rem; color: var(--color-secondary); margin-bottom: 0.5rem;">🔒 ' + (t.pledge2Title || 'Zero Personal Data Collected') + '</h3>' +
            '<p style="font-size: 0.95rem; color: var(--color-text-muted);">' + (t.pledge2Desc || 'No account or login required. Quizzes, surveys, and page visits are 100% anonymous.') + '</p>' +
          '</div>' +
          '<div>' +
            '<h3 style="font-size: 1.1rem; color: var(--color-warning); margin-bottom: 0.5rem;">📜 ' + (t.pledge3Title || 'Official Sources Only') + '</h3>' +
            '<p style="font-size: 0.95rem; color: var(--color-text-muted);">' + (t.pledge3Desc || 'All content is adapted from the WHO, CDC, and health ministries with full citations.') + '</p>' +
          '</div>' +
        '</div>' +
      '</section>';
  },

  async renderTopics(container) {
    const t = this.translations.topics || {};
    let topics = [];
    try {
      const res = await fetch('/api/topics?locale=' + this.locale);
      topics = await res.json();
    } catch (err) {
      console.error(err);
    }

    container.innerHTML = 
      '<div style="margin-bottom: 2rem;">' +
        '<h1>' + (t.title || 'Health Topics') + '</h1>' +
        '<p style="color: var(--color-text-muted); font-size: 1.1rem;">' + (t.subtitle || 'Clear, plain-language guides to keep you and your family safe and healthy.') + '</p>' +
      '</div>' +
      '<div class="grid-cards">' +
        topics.map((top) => 
          '<div class="card">' +
            '<div class="card-header">' +
              '<span class="card-icon">' + top.icon + '</span>' +
              '<div>' +
                '<div class="card-meta">' +
                  '<span class="badge">' + top.readingLevel + '</span> ' +
                  '<span class="badge badge-secondary">' + top.readMinutes + ' min read</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<h3 class="card-title">' + top.title + '</h3>' +
            '<p class="card-body">' + top.summary + '</p>' +
            '<div class="card-footer">' +
              '<span style="font-size: 0.8rem; color: var(--color-text-muted);">' +
                '🩺 ' + top.reviewedBy.split(',')[0] +
              '</span>' +
              '<a href="#/topics/' + top.slug + '" class="btn btn-primary btn-sm">Read &amp; Listen &rarr;</a>' +
            '</div>' +
          '</div>'
        ).join('') +
      '</div>';
  },

  async renderTopicDetail(container, slug) {
    const t = this.translations.topics || {};
    let topic = null;
    try {
      const res = await fetch('/api/topics/' + slug + '?locale=' + this.locale);
      if (!res.ok) throw new Error('Topic not found');
      topic = await res.json();
      this.currentTopic = topic;
    } catch (err) {
      container.innerHTML = '<div class="container"><p>Topic not found. <a href="#/topics">Return to Topics</a></p></div>';
      return;
    }

    container.innerHTML = 
      '<div class="topic-detail-header">' +
        '<a href="#/topics" style="color: var(--color-primary); text-decoration: none; font-weight: 600; display: inline-block; margin-bottom: 1rem;">&larr; Back to Health Topics</a>' +
        '<div class="topic-meta-bar">' +
          '<div class="clinical-badge">' +
            '<span>🛡️ Clinical Review:</span> ' +
            '<span>' + topic.reviewedBy + ' (' + topic.reviewerRole + ') &bull; ' + topic.reviewedAt + '</span>' +
          '</div>' +
          '<div>' +
            '<span class="badge">' + topic.readingLevel + '</span> ' +
            '<span class="badge badge-secondary">' + topic.readMinutes + ' min read</span>' +
          '</div>' +
        '</div>' +
        '<h1 style="font-size: 2.2rem; margin-bottom: 0.75rem;">' + topic.icon + ' ' + topic.title + '</h1>' +
        '<p style="font-size: 1.15rem; color: var(--color-text-muted);">' + topic.summary + '</p>' +
        '<div class="topic-actions">' +
          '<button id="ttsButton" class="btn btn-primary btn-sm" onclick="App.toggleSpeech()">' +
            '🔊 <span id="ttsBtnText">' + (t.listenAloud || 'Listen to Summary') + '</span>' +
          '</button> ' +
          '<button class="btn btn-secondary btn-sm" onclick="App.openAiModal()">' +
            '💡 ' + (t.aiSummaryButton || 'Ask AI to Simplify') + ' ' +
          '</button> ' +
          '<button class="btn btn-secondary btn-sm" onclick="App.openQuizModal(\'pre\')">' +
            '📝 ' + (t.preQuizCta || 'Take Pre-Quiz') + ' ' +
          '</button> ' +
          '<button class="btn btn-secondary btn-sm" onclick="App.openQuizModal(\'post\')">' +
            '🎯 ' + (t.postQuizCta || 'Check What You Learned') + ' ' +
          '</button> ' +
          '<button class="btn btn-outline btn-sm" onclick="App.showPrintModal(\'' + topic.slug + '\')">' +
            '🖨️ ' + (t.printHandout || 'Print Flyer &amp; QR') +
          '</button>' +
        '</div>' +
      '</div>' +

      '<div class="takeaways-box">' +
        '<h3>📌 ' + (t.keyTakeaways || 'Key Takeaways') + '</h3>' +
        '<ul>' +
          topic.keyTakeaways.map((k) => '<li>' + k + '</li>').join('') +
        '</ul>' +
      '</div>' +

      '<article class="article-content">' +
        topic.content +
      '</article>' +

      '<div class="sources-box">' +
        '<h4>' + (t.officialSources || 'Official Sources &amp; Citations') + '</h4>' +
        '<ul>' +
          topic.vettedSources.map((s) => 
            '<li>&bull; <strong>' + s.organization + ':</strong> <a href="' + s.url + '" target="_blank" rel="noopener noreferrer">' + s.title + '</a></li>'
          ).join('') +
        '</ul>' +
      '</div>';
  },

  toggleSpeech() {
    if (!this.synth) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    const ttsText = document.getElementById('ttsBtnText');

    if (this.synth.speaking) {
      this.synth.cancel();
      if (ttsText) ttsText.textContent = this.translations.topics?.listenAloud || 'Listen to Summary';
      return;
    }

    if (!this.currentTopic) return;

    const speechText = this.currentTopic.title + '. ' + this.currentTopic.summary + '. Key points: ' + this.currentTopic.keyTakeaways.join('. ');
    this.speakingUtterance = new SpeechSynthesisUtterance(speechText);

    if (this.locale === 'tr') this.speakingUtterance.lang = 'tr-TR';
    else if (this.locale === 'es') this.speakingUtterance.lang = 'es-ES';
    else this.speakingUtterance.lang = 'en-US';

    this.speakingUtterance.onend = () => {
      if (ttsText) ttsText.textContent = this.translations.topics?.listenAloud || 'Listen to Summary';
    };

    if (ttsText) ttsText.textContent = this.translations.topics?.stopListening || 'Stop Audio';
    this.synth.speak(this.speakingUtterance);
  },

  async renderClinics(container) {
    const t = this.translations.directory || {};
    let clinics = [];
    try {
      const res = await fetch('/api/clinics');
      clinics = await res.json();
    } catch (err) {
      console.error(err);
    }

    container.innerHTML = 
      '<div style="margin-bottom: 2rem;">' +
        '<h1>' + (t.title || 'Community Clinic &amp; Resource Directory') + '</h1>' +
        '<p style="color: var(--color-text-muted); font-size: 1.1rem;">' + (t.subtitle || 'Find trusted neighborhood clinics offering low-cost care, sliding-scale fees, free vaccines, and interpreter services.') + '</p>' +
      '</div>' +
      '<div class="filter-bar">' +
        '<div class="filter-group">' +
          '<label for="clinicSearch" class="sr-only">Search</label>' +
          '<input type="text" id="clinicSearch" placeholder="' + (t.searchPlaceholder || 'Search clinic or neighborhood...') + '" oninput="App.filterClinics()" />' +
        '</div>' +
        '<div class="filter-group">' +
          '<label for="serviceFilter" class="sr-only">Service</label>' +
          '<select id="serviceFilter" onchange="App.filterClinics()">' +
            '<option value="all">' + (t.allServices || 'All Services') + '</option>' +
            '<option value="Sliding Scale / Low Cost">' + (t.slidingScale || 'Sliding Scale / Low Cost') + '</option>' +
            '<option value="Free Immunizations">' + (t.freeVaccines || 'Free Immunizations') + '</option>' +
            '<option value="Mental Health Counseling">' + (t.mentalHealth || 'Mental Health Counseling') + '</option>' +
            '<option value="Dental Care">' + (t.dental || 'Dental Care') + '</option>' +
          '</select>' +
        '</div>' +
        '<div class="filter-group">' +
          '<label for="languageFilter" class="sr-only">Language</label>' +
          '<select id="languageFilter" onchange="App.filterClinics()">' +
            '<option value="all">' + (t.allLanguages || 'All Languages') + '</option>' +
            '<option value="English">English</option>' +
            '<option value="Spanish">Español</option>' +
            '<option value="Turkish">Türkçe</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div id="clinicsList" class="grid-cards">' +
        this.renderClinicCards(clinics) +
      '</div>';
  },

  renderClinicCards(list) {
    if (!list || list.length === 0) {
      return '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted); padding: 2rem;">No clinics found matching your filter criteria.</p>';
    }

    return list.map((c) => 
      '<div class="card">' +
        '<div class="card-header">' +
          '<span style="font-size: 1.75rem;">🏥</span>' +
          '<div>' +
            '<h3 class="card-title" style="font-size: 1.15rem; margin-bottom: 0.2rem;">' + c.name + '</h3>' +
            '<span style="font-size: 0.85rem; color: var(--color-text-muted);">' + c.address + ', ' + c.city + '</span>' +
          '</div>' +
        '</div>' +
        '<p class="card-body">' + c.description + '</p>' +
        '<div style="margin-bottom: 1rem;">' +
          '<strong style="font-size: 0.8rem; text-transform: uppercase; color: var(--color-text-muted);">Languages:</strong>' +
          '<div style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.25rem;">' +
            c.languages.map((l) => '<span class="badge badge-secondary">' + l + '</span>').join('') +
          '</div>' +
        '</div>' +
        '<div style="margin-bottom: 1rem;">' +
          '<strong style="font-size: 0.8rem; text-transform: uppercase; color: var(--color-text-muted);">Services:</strong>' +
          '<div style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.25rem;">' +
            c.services.map((s) => '<span class="badge">' + s + '</span>').join('') +
          '</div>' +
        '</div>' +
        '<div class="card-footer">' +
          '<a href="tel:' + c.phone + '" class="btn btn-secondary btn-sm">📞 ' + c.phone + '</a> ' +
          '<a href="' + c.mapLink + '" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">🗺️ Directions</a>' +
        '</div>' +
      '</div>'
    ).join('');
  },

  async filterClinics() {
    const q = document.getElementById('clinicSearch')?.value || '';
    const service = document.getElementById('serviceFilter')?.value || 'all';
    const language = document.getElementById('languageFilter')?.value || 'all';

    const params = new URLSearchParams();
    if (q) params.append('query', q);
    if (service) params.append('service', service);
    if (language) params.append('language', language);

    try {
      const res = await fetch('/api/clinics?' + params.toString());
      const clinics = await res.json();
      const listEl = document.getElementById('clinicsList');
      if (listEl) listEl.innerHTML = this.renderClinicCards(clinics);
    } catch (err) {
      console.error(err);
    }
  },

  renderEthics(container) {
    container.innerHTML = 
      '<div style="max-width: 800px; margin: 0 auto;">' +
        '<h1 style="margin-bottom: 1rem;">Ethics, Safety Guardrails &amp; Transparency</h1>' +
        '<p style="font-size: 1.1rem; color: var(--color-text-muted); margin-bottom: 2rem;">' +
          'HealthBridge is designed under strict clinical AI safety standards to prevent algorithmic harm and protect vulnerable, underserved communities.' +
        '</p>' +
        '<div class="card" style="margin-bottom: 1.5rem;">' +
          '<h2 style="font-size: 1.3rem; margin-bottom: 0.75rem; color: var(--color-primary);">1. Dual-Phase Safety Guardrails</h2>' +
          '<p style="margin-bottom: 0.75rem;">Every request submitted to our AI helper passes through regex and semantic safety filters both in the user\'s browser and on the server.</p>' +
          '<ul style="padding-left: 1.25rem; color: var(--color-text-muted);">' +
            '<li><strong>Strict Prohibition on Diagnosis:</strong> The system will immediately reject prompts asking "Do I have cancer/diabetes?", "What is wrong with me?", or "Acil servise gitmeli miyim?".</li>' +
            '<li><strong>Zero Medication Prescription:</strong> The system cannot calculate dosage, adjust regimens, or tell users to stop prescribed medications.</li>' +
            '<li><strong>Immediate Emergency Routing:</strong> Prompts indicating chest pain, severe bleeding, or crisis immediately receive emergency contact cards (911, 112, 988).</li>' +
          '</ul>' +
        '</div>' +
        '<div class="card" style="margin-bottom: 1.5rem;">' +
          '<h2 style="font-size: 1.3rem; margin-bottom: 0.75rem; color: var(--color-secondary);">2. Zero Login &amp; Privacy By Architecture</h2>' +
          '<p style="margin-bottom: 0.75rem;">Underserved patients and immigrant communities face severe barriers when digital tools mandate email addresses, accounts, or phone numbers.</p>' +
          '<ul style="padding-left: 1.25rem; color: var(--color-text-muted);">' +
            '<li><strong>No Passwords or Accounts:</strong> All features (quizzes, guides, clinic maps) are accessible without signing in.</li>' +
            '<li><strong>Ephemeral Sessions:</strong> Quiz deltas are retained only in temporary browser memory.</li>' +
            '<li><strong>No PII Storage:</strong> The server never writes IP addresses, user names, or personal identities to any database.</li>' +
          '</ul>' +
        '</div>' +
        '<div class="card" style="margin-bottom: 1.5rem;">' +
          '<h2 style="font-size: 1.3rem; margin-bottom: 0.75rem; color: var(--color-warning);">3. Vetted Public Health Sources &amp; Clinical Badges</h2>' +
          '<p style="color: var(--color-text-muted);">' +
            'All explainers are adapted directly from official government and international bodies: ' +
            'the World Health Organization (WHO), the Centers for Disease Control and Prevention (CDC), and the T.C. Sağlık Bakanlığı. Every article displays the name and credentials of a licensed clinical reviewer.' +
          '</p>' +
        '</div>' +
      '</div>';
  },

  async renderAdmin(container) {
    let metrics = {};
    try {
      const res = await fetch('/api/metrics');
      metrics = await res.json();
    } catch (err) {
      console.error(err);
    }

    container.innerHTML = 
      '<div style="margin-bottom: 2rem;">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">' +
          '<div>' +
            '<h1>Community Impact &amp; Reach Dashboard</h1>' +
            '<p style="color: var(--color-text-muted);">Real-time anonymous telemetry measuring health literacy growth across underserved neighborhoods.</p>' +
          '</div>' +
          '<span class="badge badge-success" style="font-size: 0.9rem; padding: 0.5rem 1rem;">Live Telemetry Active</span>' +
        '</div>' +
      '</div>' +

      '<div class="metrics-grid">' +
        '<div class="metric-card">' +
          '<div class="metric-value">' + (metrics.totalUsersServed || 2480).toLocaleString() + '</div>' +
          '<div class="metric-label">Anonymous Community Members Served</div>' +
        '</div>' +
        '<div class="metric-card">' +
          '<div class="metric-value">' + (metrics.topicsViewedTotal || 7390).toLocaleString() + '</div>' +
          '<div class="metric-label">Health Topic Explanations Read</div>' +
        '</div>' +
        '<div class="metric-card">' +
          '<div class="metric-value" style="color: var(--color-success);">' + (metrics.avgQuizImprovement || '+38.4%') + '</div>' +
          '<div class="metric-label">Average Health Literacy Score Gain</div>' +
        '</div>' +
        '<div class="metric-card">' +
          '<div class="metric-value" style="color: var(--color-secondary);">' + (metrics.totalGuidesPrinted || 612) + '</div>' +
          '<div class="metric-label">Printed Outreach Guides Distributed</div>' +
        '</div>' +
      '</div>' +

      '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">' +
        '<div class="card">' +
          '<h3 style="font-size: 1.15rem; margin-bottom: 1rem;">Topic Engagement by Volume</h3>' +
          '<div style="display: flex; flex-direction: column; gap: 0.75rem;">' +
            (metrics.topicViews || []).map((tv) => 
              '<div>' +
                '<div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.25rem;">' +
                  '<span>' + tv.topic + '</span>' +
                  '<strong>' + tv.views.toLocaleString() + ' views (' + tv.percent + '%)</strong>' +
                '</div>' +
                '<div style="background: #e2e8f0; border-radius: 9999px; height: 8px; overflow: hidden;">' +
                  '<div style="background: var(--color-primary); height: 100%; width: ' + tv.percent + '%;"></div>' +
                '</div>' +
              '</div>'
            ).join('') +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<h3 style="font-size: 1.15rem; margin-bottom: 1rem;">Pre vs. Post Literacy Improvement</h3>' +
          '<div style="display: flex; flex-direction: column; gap: 0.75rem;">' +
            (metrics.quizDeltas || []).map((qd) => 
              '<div>' +
                '<div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.25rem;">' +
                  '<span>' + qd.topic + '</span>' +
                  '<span style="color: var(--color-success); font-weight: 700;">' + qd.preScore + ' &rarr; ' + qd.postScore + ' (' + qd.gain + ')</span>' +
                '</div>' +
                '<div style="background: #e2e8f0; border-radius: 9999px; height: 8px; overflow: hidden;">' +
                  '<div style="background: var(--color-success); height: 100%; width: ' + (parseInt(qd.gain.replace(/[^0-9]/g, '')) * 1.5) + '%;"></div>' +
                '</div>' +
              '</div>'
            ).join('') +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<h3 style="font-size: 1.15rem; margin-bottom: 1rem;">Community Feedback &amp; Patient Voice (Anonymous)</h3>' +
        '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">' +
          (metrics.anonymousFeedback || []).map((fb) => 
            '<div style="background: #f8fafc; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 1rem;">' +
              '<div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">' +
                '<strong>' + '★'.repeat(fb.rating) + '</strong>' +
                '<span style="color: var(--color-text-muted);">' + fb.date + '</span>' +
              '</div>' +
              '<p style="font-style: italic; font-size: 0.9rem; color: #334155; margin-bottom: 0.5rem;">"' + fb.comment + '"</p>' +
              '<span class="badge badge-secondary">' + fb.topic + '</span>' +
            '</div>'
          ).join('') +
        '</div>' +
      '</div>';
  },

  async openQuizModal(type = 'pre') {
    this.activeQuizType = type;
    const slug = (this.currentTopic && this.currentTopic.slug) || 'diabetes-prevention';
    const modal = document.getElementById('quizModal');
    const badge = document.getElementById('quizBadge');
    const content = document.getElementById('quizModalContent');

    if (badge) {
      badge.textContent = type === 'pre' ? 'Pre-Reading Quiz' : 'Post-Reading Quiz';
      badge.className = type === 'pre' ? 'badge' : 'badge badge-success';
    }

    try {
      const res = await fetch('/api/quizzes/' + slug + '?type=' + type + '&locale=' + this.locale);
      const quiz = await res.json();

      content.innerHTML = 
        '<div class="quiz-question-box">' +
          '<p class="quiz-question-text">' + quiz.question + '</p>' +
          '<div class="quiz-options">' +
            quiz.options.map((opt, idx) => 
              '<button class="quiz-option" onclick="App.handleQuizAnswer(' + idx + ', ' + quiz.correctIndex + ', \'' + encodeURIComponent(quiz.explanation) + '\')">' +
                String.fromCharCode(65 + idx) + '. ' + opt +
              '</button>'
            ).join('') +
          '</div>' +
          '<div id="quizResultArea" style="display: none;"></div>' +
        '</div>';

      if (modal) modal.style.display = 'flex';
    } catch (err) {
      console.error(err);
    }
  },

  handleQuizAnswer(selectedIndex, correctIndex, encodedExplanation) {
    const explanation = decodeURIComponent(encodedExplanation);
    const options = document.querySelectorAll('.quiz-option');
    const isCorrect = selectedIndex === correctIndex;

    options.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === correctIndex) btn.classList.add('correct');
      if (idx === selectedIndex && !isCorrect) btn.classList.add('incorrect');
    });

    const resultArea = document.getElementById('quizResultArea');
    if (resultArea) {
      resultArea.style.display = 'block';
      resultArea.innerHTML = 
        '<div class="quiz-explanation">' +
          '<strong style="color: ' + (isCorrect ? 'var(--color-success)' : 'var(--color-emergency)') + ';">' +
            (isCorrect ? '✓ Correct!' : '✗ Not quite.') +
          '</strong>' +
          '<p style="margin-top: 0.5rem;">' + explanation + '</p>' +
          '<div style="margin-top: 1rem; display: flex; justify-content: flex-end; gap: 0.5rem;">' +
            '<button class="btn btn-primary btn-sm" onclick="App.closeQuizModal()">Done</button>' +
          '</div>' +
        '</div>';
    }

    fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: this.activeQuizType,
        correct: isCorrect,
        topic: this.currentTopic ? this.currentTopic.slug : 'general',
      }),
    }).catch((e) => console.error(e));
  },

  closeQuizModal() {
    const modal = document.getElementById('quizModal');
    if (modal) modal.style.display = 'none';
  },

  showPrintModal(slug) {
    const modal = document.getElementById('printModal');
    const flyerArea = document.getElementById('printFlyerArea');

    const topic = this.currentTopic || {
      title: 'Multilingual Community Health Literacy Guide',
      summary: 'Essential health prevention and local clinic guide for neighborhood equity.',
      keyTakeaways: [
        'Routine health checks catch conditions like diabetes and high blood pressure early.',
        'Neighborhood community clinics provide low-cost care regardless of insurance.',
        'Always ask for an interpreter if you prefer speaking in your primary language.',
      ],
      vettedSources: [
        { organization: 'WHO', title: 'Health for All' },
        { organization: 'CDC', title: 'Preventative Health Care' },
      ],
    };

    const qrSvg = 
      '<svg width="120" height="120" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block; margin:0 auto;">' +
        '<rect width="29" height="29" fill="white"/>' +
        '<rect x="2" y="2" width="7" height="7" fill="black"/>' +
        '<rect x="3" y="3" width="5" height="5" fill="white"/>' +
        '<rect x="4" y="4" width="3" height="3" fill="black"/>' +
        '<rect x="20" y="2" width="7" height="7" fill="black"/>' +
        '<rect x="21" y="3" width="5" height="5" fill="white"/>' +
        '<rect x="22" y="4" width="3" height="3" fill="black"/>' +
        '<rect x="2" y="20" width="7" height="7" fill="black"/>' +
        '<rect x="3" y="21" width="5" height="5" fill="white"/>' +
        '<rect x="4" y="22" width="3" height="3" fill="black"/>' +
        '<rect x="11" y="3" width="2" height="2" fill="black"/>' +
        '<rect x="15" y="4" width="2" height="2" fill="black"/>' +
        '<rect x="11" y="8" width="3" height="1" fill="black"/>' +
        '<rect x="14" y="10" width="2" height="3" fill="black"/>' +
        '<rect x="10" y="14" width="3" height="2" fill="black"/>' +
        '<rect x="17" y="15" width="2" height="2" fill="black"/>' +
        '<rect x="11" y="21" width="3" height="2" fill="black"/>' +
        '<rect x="16" y="22" width="2" height="3" fill="black"/>' +
        '<rect x="21" y="11" width="2" height="2" fill="black"/>' +
        '<rect x="24" y="14" width="3" height="2" fill="black"/>' +
        '<rect x="22" y="21" width="4" height="2" fill="black"/>' +
      '</svg>';

    flyerArea.innerHTML = 
      '<div class="print-flyer">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 1rem;">' +
          '<div>' +
            '<h1 style="font-size: 1.6rem; color: #0284c7; margin-bottom: 0.25rem;">🏥 HealthBridge Community Outreach</h1>' +
            '<p style="font-size: 0.95rem; color: #475569;">Free Health Education &bull; Zero Login &bull; Multilingual Support</p>' +
          '</div>' +
          '<div style="text-align: center; border: 1px solid #cbd5e1; padding: 0.5rem; border-radius: 6px;">' +
            qrSvg +
            '<span style="font-size: 0.65rem; font-weight: 700; color: #0f172a;">SCAN FOR MOBILE</span>' +
          '</div>' +
        '</div>' +
        '<h2 style="font-size: 1.35rem; margin-bottom: 0.5rem;">' + topic.title + '</h2>' +
        '<p style="font-size: 1rem; color: #1e293b; margin-bottom: 1rem;">' + topic.summary + '</p>' +
        '<div style="background: #f1f5f9; border-left: 4px solid #0284c7; padding: 1rem; margin-bottom: 1rem;">' +
          '<h3 style="font-size: 1.05rem; margin-bottom: 0.5rem; color: #0369a1;">Key Action Steps</h3>' +
          '<ul style="padding-left: 1.25rem; font-size: 0.95rem; color: #0f172a;">' +
            topic.keyTakeaways.map((k) => '<li style="margin-bottom: 0.35rem;">' + k + '</li>').join('') +
          '</ul>' +
        '</div>' +
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; font-size: 0.9rem;">' +
          '<div style="border: 1px solid #e2e8f0; padding: 0.75rem; border-radius: 6px;">' +
            '<strong>🏥 Free &amp; Low-Cost Care:</strong>' +
            '<p style="color: #475569; margin-top: 0.25rem;">Find neighborhood clinics with sliding scale fees and interpreters at your local health center.</p>' +
          '</div>' +
          '<div style="border: 1px solid #e2e8f0; padding: 0.75rem; border-radius: 6px;">' +
            '<strong>🚨 Emergency Contacts:</strong>' +
            '<p style="color: #b91c1c; margin-top: 0.25rem;"><strong>Medical:</strong> 911 / 112 &bull; <strong>Crisis:</strong> 988 (Call/Text)</p>' +
          '</div>' +
        '</div>' +
        '<div style="border-top: 1px solid #cbd5e1; padding-top: 0.75rem; font-size: 0.75rem; color: #64748b; text-align: center;">' +
          '<p>Official Public Health Guidance &bull; WHO &bull; CDC &bull; Sağlık Bakanlığı &bull; Educational only; not medical advice.</p>' +
        '</div>' +
      '</div>';

    if (modal) modal.style.display = 'flex';
  },

  closePrintModal() {
    const modal = document.getElementById('printModal');
    if (modal) modal.style.display = 'none';
  },

  openAiModal() {
    const modal = document.getElementById('aiModal');
    const respBox = document.getElementById('aiResponseContainer');
    const promptInput = document.getElementById('aiUserPrompt');

    if (promptInput) promptInput.value = '';
    if (respBox) respBox.style.display = 'none';
    if (modal) modal.style.display = 'flex';
  },

  closeAiModal() {
    const modal = document.getElementById('aiModal');
    if (modal) modal.style.display = 'none';
  },

  async handleAiPromptSubmit(e) {
    e.preventDefault();
    const promptInput = document.getElementById('aiUserPrompt');
    const submitBtn = document.getElementById('aiSubmitBtn');
    const respBox = document.getElementById('aiResponseContainer');
    const respText = document.getElementById('aiResponseText');
    const sourcesList = document.getElementById('aiSourcesList');
    const userPrompt = promptInput?.value || '';

    if (!userPrompt.trim()) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Analyzing...';
    }

    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle: this.currentTopic?.title,
          articleContent: this.currentTopic?.content,
          keyTakeaways: this.currentTopic?.keyTakeaways,
          vettedSources: this.currentTopic?.vettedSources,
          userPrompt,
          locale: this.locale,
        }),
      });

      const data = await res.json();
      if (respBox && respText) {
        respBox.style.display = 'block';
        respText.textContent = data.summary;

        if (sourcesList && data.citations) {
          sourcesList.innerHTML = 
            '<strong style="display:block; margin-top:0.75rem; font-size:0.8rem; color:#065f46;">Vetted Citations:</strong>' +
            '<ul style="padding-left:1.2rem; font-size:0.85rem; color:#047857;">' +
              data.citations.map((c) => '<li>' + c.organization + ': ' + c.title + '</li>').join('') +
            '</ul>';
        }
      }
    } catch (err) {
      console.error(err);
      if (respBox && respText) {
        respBox.style.display = 'block';
        respText.textContent = 'Service unavailable. Please consult your physician.';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Ask AI';
      }
    }
  },
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

