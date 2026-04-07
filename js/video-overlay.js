(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var overlay = document.getElementById('videoOverlay');
    var iframe = document.getElementById('videoOverlayIframe');
    var titleEl = document.getElementById('videoOverlayTitle');
    var descEl = document.getElementById('videoOverlayDescription');
    var grid = document.querySelector('[data-video-grid]');

    if (!overlay || !iframe || !titleEl || !descEl || !grid) return;

    var closeEls = overlay.querySelectorAll('.js-video-overlay-close');

    function openVideo(embed, title, description) {
      iframe.src = embed;
      iframe.setAttribute('title', title || 'Видео');
      titleEl.textContent = title || 'Видео';
      descEl.textContent = description || '';
      if (description) {
        overlay.setAttribute('aria-describedby', 'videoOverlayDescription');
      } else {
        overlay.removeAttribute('aria-describedby');
      }
      overlay.hidden = false;
      document.body.classList.add('video-overlay-open');
      overlay.focus();
    }

    function closeVideo() {
      overlay.hidden = true;
      document.body.classList.remove('video-overlay-open');
      overlay.removeAttribute('aria-describedby');
      iframe.removeAttribute('src');
      iframe.setAttribute('title', '');
      titleEl.textContent = '';
      descEl.textContent = '';
    }

    grid.addEventListener('click', function(e) {
      var card = e.target.closest('.video-grid__card');
      if (!card || !grid.contains(card)) return;
      var embed = card.getAttribute('data-video-embed');
      if (!embed) return;
      var title = card.getAttribute('data-video-title') || '';
      var description = card.getAttribute('data-video-description') || '';
      openVideo(embed, title, description);
    });

    for (var i = 0; i < closeEls.length; i++) {
      closeEls[i].addEventListener('click', function(e) {
        e.stopPropagation();
        closeVideo();
      });
    }

    document.addEventListener('keydown', function(e) {
      if (!overlay.hidden && e.key === 'Escape') {
        closeVideo();
      }
    });
  });
})();
