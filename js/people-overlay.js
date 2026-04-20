(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var overlay = document.getElementById('peopleOverlay');
    var titleEl = document.getElementById('peopleOverlayTitle');
    var bodyEl = document.getElementById('peopleOverlayBody');
    var grid = document.querySelector('[data-people-grid]');
    var lightbox = document.getElementById('peoplePhotoLightbox');
    var lightboxImgEl = document.getElementById('peoplePhotoLightboxImg');
    var lightboxCounterEl = document.getElementById('peoplePhotoLightboxCounter');
    var lightboxCaptionEl = document.getElementById('peoplePhotoLightboxCaption');
    var lightboxPrevBtn = document.getElementById('peoplePhotoLightboxPrev');
    var lightboxNextBtn = document.getElementById('peoplePhotoLightboxNext');
    var lightboxCloseEls = lightbox ? lightbox.querySelectorAll('.js-people-photo-lightbox-close') : [];

    if (!overlay || !titleEl || !bodyEl || !grid || !lightbox || !lightboxImgEl || !lightboxCounterEl || !lightboxCaptionEl || !lightboxPrevBtn || !lightboxNextBtn) return;

    var closeEls = overlay.querySelectorAll('.js-people-overlay-close');
    var lightboxItems = [];
    var lightboxIndex = 0;

    function collectLightboxItems() {
      lightboxItems = [];
      var images = bodyEl.querySelectorAll('.md-content img');
      for (var i = 0; i < images.length; i++) {
        lightboxItems.push({
          src: images[i].src,
          alt: images[i].alt || '',
          caption: getCaptionForImage(images[i]),
        });
      }
      return images;
    }

    function getCaptionForImage(imgEl) {
      if (!imgEl) return '';
      var paragraph = imgEl.closest('p');
      if (!paragraph) return '';

      var onlyChild = paragraph.children.length === 1 ? paragraph.children[0] : null;
      if (onlyChild && onlyChild.tagName === 'IMG') {
        var next = paragraph.nextElementSibling;
        if (next && next.classList.contains('md-caption-after-image')) {
          return (next.textContent || '').trim();
        }
      }

      // Inline-case: подпись может быть в том же <p> после текущего <img>.
      // Берём текст только после этого изображения до следующего <img>.
      var parts = [];
      var node = imgEl.nextSibling;
      while (node) {
        if (node.nodeType === 1 && node.tagName === 'IMG') break;
        var chunk = (node.textContent || '').trim();
        if (chunk) parts.push(chunk);
        node = node.nextSibling;
      }
      var inlineCaption = parts.join(' ').replace(/\s+/g, ' ').trim();
      if (inlineCaption) return inlineCaption;

      return '';
    }

    function updateLightboxCounter() {
      var total = lightboxItems.length;
      var current = total ? lightboxIndex + 1 : 0;
      lightboxCounterEl.textContent = total ? 'Фото ' + current + ' из ' + total : '';
    }

    function showLightboxAt(index) {
      if (!lightboxItems.length) return;
      lightboxIndex = ((index % lightboxItems.length) + lightboxItems.length) % lightboxItems.length;
      var item = lightboxItems[lightboxIndex];
      lightboxImgEl.src = item.src;
      lightboxImgEl.alt = item.alt;
      lightboxCaptionEl.textContent = item.caption || '';
      updateLightboxCounter();
    }

    function openLightbox(index) {
      collectLightboxItems();
      if (!lightboxItems.length) return;
      lightbox.hidden = false;
      document.body.classList.add('photo-lightbox-open');
      showLightboxAt(index);
      lightbox.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.classList.remove('photo-lightbox-open');
      lightboxImgEl.removeAttribute('src');
      lightboxImgEl.alt = '';
      lightboxCounterEl.textContent = '';
      lightboxCaptionEl.textContent = '';
    }

    function markCaptionParagraphs() {
      var paragraphs = bodyEl.querySelectorAll('.md-content p');
      for (var i = 0; i < paragraphs.length; i++) {
        paragraphs[i].classList.remove('md-caption-after-image');
        paragraphs[i].classList.remove('md-caption-inline-image');
      }

      for (var j = 0; j < paragraphs.length; j++) {
        var current = paragraphs[j];
        var hasImage = current.querySelector('img') !== null;
        if (!hasImage) continue;

        var next = paragraphs[j + 1];
        var onlyChild = current.children.length === 1 ? current.children[0] : null;

        if (onlyChild && onlyChild.tagName === 'IMG' && next) {
          next.classList.add('md-caption-after-image');
          continue;
        }

        current.classList.add('md-caption-inline-image');
      }
    }

    function openPeople(index, title) {
      var tpl = document.getElementById('people-item-' + index);
      bodyEl.innerHTML = tpl ? tpl.innerHTML : '';
      titleEl.textContent = title || '';
      bodyEl.setAttribute('data-people-title', title || '');
      markCaptionParagraphs();

      overlay.hidden = false;
      document.body.classList.add('video-overlay-open');
      overlay.focus();
    }

    function closePeople() {
      closeLightbox();
      overlay.hidden = true;
      document.body.classList.remove('video-overlay-open');
      titleEl.textContent = '';
      bodyEl.innerHTML = '';
      bodyEl.removeAttribute('data-people-title');
    }

    grid.addEventListener('click', function(e) {
      var card = e.target.closest('.video-grid__card');
      if (!card || !grid.contains(card)) return;
      var idx = card.getAttribute('data-people-index');
      if (idx === null || idx === '') return;
      var title = card.getAttribute('data-people-title') || '';
      openPeople(idx, title);
    });

    bodyEl.addEventListener('click', function(e) {
      var clickedImg = e.target.closest('img');
      if (!clickedImg || !bodyEl.contains(clickedImg)) return;
      var images = collectLightboxItems();
      var imgIndex = Array.prototype.indexOf.call(images, clickedImg);
      if (imgIndex < 0) return;
      e.preventDefault();
      openLightbox(imgIndex);
    });

    lightboxPrevBtn.addEventListener('click', function() {
      showLightboxAt(lightboxIndex - 1);
    });

    lightboxNextBtn.addEventListener('click', function() {
      showLightboxAt(lightboxIndex + 1);
    });

    for (var j = 0; j < lightboxCloseEls.length; j++) {
      lightboxCloseEls[j].addEventListener('click', function(e) {
        e.stopPropagation();
        closeLightbox();
      });
    }

    for (var i = 0; i < closeEls.length; i++) {
      closeEls[i].addEventListener('click', function(e) {
        e.stopPropagation();
        closePeople();
      });
    }

    document.addEventListener('keydown', function(e) {
      if (!lightbox.hidden && e.key === 'Escape') {
        closeLightbox();
        return;
      }
      if (!lightbox.hidden && e.key === 'ArrowLeft') {
        e.preventDefault();
        showLightboxAt(lightboxIndex - 1);
        return;
      }
      if (!lightbox.hidden && e.key === 'ArrowRight') {
        e.preventDefault();
        showLightboxAt(lightboxIndex + 1);
        return;
      }
      if (!overlay.hidden && e.key === 'Escape') {
        closePeople();
      }
    });
  });
})();
