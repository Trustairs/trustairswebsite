/* ═══════════════════════════════════════
   TRUST + AIRS — Interactive JS
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Navigation scroll effect ─── */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 60) {
      nav.style.background = 'rgba(26,46,74,0.98)';
    } else {
      nav.style.background = 'rgba(26,46,74,0.97)';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─── Mobile hamburger ─── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  /* ─── Smooth scroll for anchor links ─── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ─── Scroll reveal ─── */
  const revealEls = document.querySelectorAll(
    '.pillar, .airs-card, .resource-card, .outcome-card, .stat-card, ' +
    '.compare__col, .dual-lens__card, .reg-row, .roadmap__item, ' +
    '.airs-pillar-vis, .airs-outcome'
  );

  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 5 === 1) el.classList.add('reveal-delay-1');
    if (i % 5 === 2) el.classList.add('reveal-delay-2');
    if (i % 5 === 3) el.classList.add('reveal-delay-3');
    if (i % 5 === 4) el.classList.add('reveal-delay-4');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ─── Video player ─── */
  const video = document.getElementById('mainVideo');
  const overlay = document.getElementById('videoOverlay');
  const playBtn = document.getElementById('videoPlayBtn');

  if (video && overlay) {
    const playVideo = () => {
      video.play().then(() => {
        overlay.classList.add('hidden');
      }).catch(() => {
        // video file may not be present yet
        overlay.classList.add('hidden');
      });
    };

    overlay.addEventListener('click', playVideo);

    video.addEventListener('pause', () => {
      overlay.classList.remove('hidden');
    });

    video.addEventListener('ended', () => {
      overlay.classList.remove('hidden');
    });
  }

  /* ─── Drag & drop upload ─── */
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const uploadList = document.getElementById('uploadList');
  let selectedFiles = [];

  if (dropzone) {
    ['dragenter', 'dragover'].forEach(evt => {
      dropzone.addEventListener(evt, e => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(evt => {
      dropzone.addEventListener(evt, e => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });
    dropzone.addEventListener('drop', e => {
      const files = Array.from(e.dataTransfer.files);
      addFiles(files);
    });
    fileInput.addEventListener('change', () => {
      const files = Array.from(fileInput.files);
      addFiles(files);
      fileInput.value = '';
    });
    dropzone.addEventListener('click', e => {
      if (e.target.tagName !== 'LABEL' && e.target.tagName !== 'INPUT') {
        fileInput.click();
      }
    });
  }

  function addFiles(files) {
    const maxSize = 25 * 1024 * 1024;
    const allowed = ['.pdf','.docx','.xlsx','.pptx','.doc','.xls','.ppt'];
    files.forEach(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowed.includes(ext)) {
        alert(`File type not allowed: ${file.name}`);
        return;
      }
      if (file.size > maxSize) {
        alert(`File too large (max 25MB): ${file.name}`);
        return;
      }
      if (!selectedFiles.find(f => f.name === file.name)) {
        selectedFiles.push(file);
        renderFileList();
      }
    });
  }

  function renderFileList() {
    if (!uploadList) return;
    uploadList.innerHTML = '';
    selectedFiles.forEach((file, idx) => {
      const item = document.createElement('div');
      item.className = 'upload-file-item';
      const size = file.size < 1024*1024
        ? (file.size/1024).toFixed(0) + ' KB'
        : (file.size/(1024*1024)).toFixed(1) + ' MB';
      item.innerHTML = `
        <span>${file.name} <small style="opacity:0.5">${size}</small></span>
        <button class="upload-file-item__remove" data-idx="${idx}" title="Remove">×</button>
      `;
      uploadList.appendChild(item);
    });
    uploadList.querySelectorAll('.upload-file-item__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedFiles.splice(parseInt(btn.dataset.idx), 1);
        renderFileList();
      });
    });
  }

  /* ─── Upload form submit ─── */
  const uploadForm = document.getElementById('uploadForm');
  const uploadSuccess = document.getElementById('uploadSuccess');

  if (uploadForm) {
    uploadForm.addEventListener('submit', e => {
      e.preventDefault();
      const name    = document.getElementById('uploaderName').value.trim();
      const email   = document.getElementById('uploaderEmail').value.trim();
      const consent = document.getElementById('uploaderConsent').checked;

      if (!name || !email || !consent) return;

      const submitBtn = document.getElementById('submitUpload');
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      // Build mailto with form details (fallback — real upload requires backend)
      const org     = document.getElementById('uploaderOrg').value.trim();
      const role    = document.getElementById('uploaderRole').value.trim();
      const context = document.getElementById('uploaderContext').value.trim();
      const fileNames = selectedFiles.map(f => f.name).join(', ') || 'No files attached';

      const subject = encodeURIComponent('TRUST + AIRS Document Submission — ' + name);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nOrganisation: ${org}\nRole: ${role}\n\nFiles: ${fileNames}\n\nContext:\n${context}`
      );

      // Open mailto for now — replace with API endpoint in production
      window.location.href = `mailto:deeparao@trustairs.uk?subject=${subject}&body=${body}`;

      setTimeout(() => {
        uploadForm.style.display = 'none';
        uploadSuccess.style.display = 'block';
      }, 800);
    });
  }

  /* ─── Contact form submit ─── */
  const contactForm = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('contactSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const name    = document.getElementById('contactName').value.trim();
      const email   = document.getElementById('contactEmail').value.trim();
      const org     = document.getElementById('contactOrg').value.trim();
      const subject = document.getElementById('contactSubject').value;
      const message = document.getElementById('contactMessage').value.trim();

      if (!name || !email || !message) return;

      const mailSubject = encodeURIComponent('[trustairs.uk] ' + (subject || 'Enquiry') + ' — ' + name);
      const mailBody = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nOrganisation: ${org}\nSubject: ${subject}\n\nMessage:\n${message}`
      );
      window.location.href = `mailto:deeparao@trustairs.uk?subject=${mailSubject}&body=${mailBody}`;

      setTimeout(() => {
        contactForm.reset();
        contactSuccess.style.display = 'block';
        setTimeout(() => { contactSuccess.style.display = 'none'; }, 6000);
      }, 600);
    });
  }

  /* ─── Active nav link on scroll ─── */
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'white'
            : 'rgba(255,255,255,0.7)';
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(sec => sectionObserver.observe(sec));

});
