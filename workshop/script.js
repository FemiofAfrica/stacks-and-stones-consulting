(function() {
  'use strict';

  /* ─── REDUCED MOTION ─── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) {
    document.body.classList.add('reduce-motion');
  }
  prefersReduced.addEventListener('change', (e) => {
    document.body.classList.toggle('reduce-motion', e.matches);
  });

  /* ─── HEADER SCROLL STATE ─── */
  const header = document.querySelector('.ws-header');
  if (header) {
    const updateHeader = () => {
      header.classList.toggle('scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  /* ─── SCROLL REVEAL ─── */
  const revealEls = document.querySelectorAll('.ws-section .reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    revealEls.forEach((el) => observer.observe(el));
  }

  /* ─── SMOOTH SCROLL ─── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ═══════════════════════════════════════
     AI CAPABILITY AUDIT QUIZ
     ═══════════════════════════════════════ */
  const quiz = document.getElementById('quiz');
  if (quiz) {
    const questions = quiz.querySelectorAll('.quiz-question');
    const progressBar = document.getElementById('quiz-progress-bar');
    const resultEl = document.getElementById('quiz-result');
    const resultTitle = document.getElementById('quiz-result-title');
    const resultScore = document.getElementById('quiz-result-score');
    const resultText = document.getElementById('quiz-result-text');
    const resultRecs = document.getElementById('quiz-result-recs');
    const retakeBtn = document.getElementById('quiz-retake');
    const emailInput = document.getElementById('quiz-email');
    const phoneInput = document.getElementById('quiz-phone');
    const emailBtn = document.getElementById('quiz-email-btn');

    // Google Form config
    const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfeulW8QXhS2XYI-ZIXj01CunFclaJGIDl6S0ZJpKL1-uAkfA/formResponse';
    const ENTRY_IDS = {
      1: 'entry.1646956508',   // hours
      2: 'entry.2089935750',   // time sink
      3: 'entry.1945997843',   // AI experience
      4: 'entry.502146189',    // industry
      5: 'entry.1401871249',   // team size
      6: 'entry.168774361',    // frustration
      email: 'entry.2126477864',
      phone: 'entry.1929819026'
    };

    // Map quiz internal values → Google Form option labels
    const VALUE_MAP = {
      1: { '1': '<5', '2': '5-10', '3': '10-20', '4': '20+' },
      2: { 'customer': 'Customer service', 'admin': 'Admin', 'finance': 'Finance', 'content': 'Content', 'other': 'Other' },
      3: { 'none': 'Never tried', 'tried': 'Tried but couldn\'t stick', 'occasional': 'Occasional', 'regular': 'Regular' },
      4: { 'retail': 'Retail/E-commerce', 'professional': 'Professional Services', 'tech': 'Tech/Fintech', 'nonprofit': 'NGO', 'other': 'Other' },
      5: { 'solo': 'Solo', 'small': '2-10', 'medium': '11-50', 'enterprise': '50+' },
      6: { 'time': 'Time wasted', 'errors': 'Errors', 'tools': 'Wrong tools', 'knowledge': 'Don\'t know how to apply' }
    };

    // Store answers
    const answers = {};
    const totalQs = questions.length; // 7
    let currentQ = 1;
    let submitted = false;

    // Submit to Google Forms
    const submitToGoogleForm = (email, phone) => {
      const formData = new URLSearchParams();

      // Add each answered question
      for (let q = 1; q <= 6; q++) {
        const val = answers[q];
        if (val && VALUE_MAP[q] && VALUE_MAP[q][val]) {
          formData.append(ENTRY_IDS[q], VALUE_MAP[q][val]);
        }
      }

      // Add email
      if (email) {
        formData.append(ENTRY_IDS.email, email);
      }

      // Add phone if available
      if (phone && ENTRY_IDS.phone) {
        formData.append(ENTRY_IDS.phone, phone);
      }

      // Submit via fetch (CORS-friendly beacon)
      fetch(FORM_URL, {
        method: 'POST',
        mode: 'no-cors',  // Google Forms doesn't support CORS; we fire and forget
        body: formData
      }).catch(() => {
        // Silent fail — Google Forms no-cors returns opaque response
      });
    };

    // Result profiles
    const getResult = (answers) => {
      const hours = parseInt(answers['1']) || 1;
      const aiExp = answers['3'] || 'none';
      const frustration = answers['6'] || 'time';
      const industry = answers['4'] || 'other';

      // Composite readiness score: hours + ai experience
      let readiness = 0;
      if (hours >= 3) readiness += 2;
      if (hours >= 2) readiness += 1;
      if (aiExp === 'none' || aiExp === 'tried') readiness += 1;
      if (aiExp === 'regular') readiness -= 1;

      let profile, text, recs;

      if (readiness >= 3) {
        profile = 'High Potential, Low System';
        text = 'You\'re spending serious time on manual work and haven\'t found the right AI approach yet. That means the biggest gains are still sitting on the table — and you\'ll see dramatic results from even one or two automated workflows. The workshop is designed for exactly this.';
        recs = [
          'You\'ll start with the highest-impact workflow for your industry',
          'Bring a specific task — we\'ll automate it live',
          'The sales/operations track is likely your biggest win'
        ];
      } else if (readiness >= 2) {
        profile = 'Aware, Exploring';
        text = 'You know AI can help and you\'ve dabbled, but you haven\'t built anything systematic. The workshop bridges that gap — you\'ll leave with working automations, not just ideas.';
        recs = [
          'Pick the track that matches your biggest time sink',
          'The content/marketing track is great for quick wins',
          'Your peer match will help you spot patterns you missed'
        ];
      } else {
        profile = 'Ready to Start';
        text = 'You\'re already using AI in some form — but the workshop will take you from occasional use to systematic automation. You\'ll build workflows that run without you.';
        recs = [
          'The finance/admin track will save you the most hours',
          'Your peer will benefit from your AI familiarity',
          'Focus on automating the tasks you still do manually'
        ];
      }

      return { profile, text, recs, industry };
    };

    const showQuestion = (num) => {
      questions.forEach((q) => q.classList.toggle('active', parseInt(q.dataset.q) === num));
      const progress = ((num - 1) / totalQs) * 100;
      if (progressBar) progressBar.style.width = progress + '%';
      currentQ = num;

      // Focus email field when reaching Q7
      if (num === 7 && emailInput) {
        setTimeout(() => emailInput.focus(), 300);
      }
    };

    const showResult = () => {
      questions.forEach((q) => q.classList.remove('active'));
      if (progressBar) progressBar.style.width = '100%';

      const result = getResult(answers);
      resultTitle.textContent = 'Your AI Automation Readiness';
      resultScore.textContent = result.profile;
      resultText.textContent = result.text;

      resultRecs.innerHTML = '';
      result.recs.forEach((rec, i) => {
        const p = document.createElement('p');
        p.className = 'quiz-result-rec';
        p.innerHTML = '<strong>' + (i + 1) + '.</strong> ' + rec;
        resultRecs.appendChild(p);
      });

      resultEl.hidden = false;
    };

    // Handle option clicks (Q1–Q6)
    quiz.querySelectorAll('.quiz-opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const questionEl = btn.closest('.quiz-question');
        const qNum = parseInt(questionEl.dataset.q);

        // Deselect siblings
        questionEl.querySelectorAll('.quiz-opt').forEach((opt) => opt.classList.remove('selected'));
        btn.classList.add('selected');

        // Store answer
        answers[qNum] = btn.dataset.value;

        // Auto-advance
        setTimeout(() => showQuestion(qNum + 1), 250);
      });
    });

    // Handle email submission (Q7)
    if (emailBtn && emailInput) {
      const submitEmail = () => {
        const email = emailInput.value.trim();
        if (!email || !email.includes('@')) {
          emailInput.focus();
          emailInput.style.borderColor = '#b58268'; // terracotta error
          return;
        }
        emailInput.style.borderColor = '';
        answers[7] = email;

        // Get phone
        const phone = phoneInput ? phoneInput.value.trim() : '';
        answers.phone = phone;

        // Submit to Google Forms
        submitToGoogleForm(email, phone);

        // Show result
        setTimeout(showResult, 300);
      };

      emailBtn.addEventListener('click', submitEmail);
      emailInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitEmail();
        }
      });
    }

    // Retake
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        // Reset all
        Object.keys(answers).forEach((k) => delete answers[k]);
        quiz.querySelectorAll('.quiz-opt').forEach((opt) => opt.classList.remove('selected'));
        if (emailInput) {
          emailInput.value = '';
          emailInput.style.borderColor = '';
        }
        if (phoneInput) {
          phoneInput.value = '';
        }
        resultEl.hidden = true;
        showQuestion(1);
      });
    }

    // Init
    showQuestion(1);
  }

  /* ─── FAQ ACCORDION ─── */
  // Already works natively with <details>/<summary>

})();
