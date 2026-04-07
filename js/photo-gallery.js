(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var root = document.getElementById('photoLightbox');
    if (!root) return;

    var grid = document.querySelector('.photo-grid[data-photo-lightbox]');
    var imgEl = document.getElementById('photoLightboxImg');
    var counterEl = document.getElementById('photoLightboxCounter');
    var btnPrev = document.getElementById('photoLightboxPrev');
    var btnNext = document.getElementById('photoLightboxNext');
    var closeEls = root.querySelectorAll('.js-photo-lightbox-close');

    if (!grid || !imgEl || !counterEl || !btnPrev || !btnNext) return;

    var items = [];
    var index = 0;

    function collectItems() {
      items = [];
      var imgs = grid.querySelectorAll('.photo-grid__cell img');
      for (var i = 0; i < imgs.length; i++) {
        items.push({ src: imgs[i].src, alt: imgs[i].alt || '' });
      }
    }

    function updateCounter() {
      var n = items.length;
      var cur = n ? index + 1 : 0;
      counterEl.textContent = n ? 'Фото ' + cur + ' из ' + n : '';
    }

    function showAt(i) {
      if (!items.length) return;
      index = ((i % items.length) + items.length) % items.length;
      var item = items[index];
      imgEl.src = item.src;
      imgEl.alt = item.alt;
      updateCounter();
    }

    function open(atIndex) {
      collectItems();
      if (!items.length) return;
      root.hidden = false;
      document.body.classList.add('photo-lightbox-open');
      showAt(atIndex);
      root.focus();
    }

    function close() {
      root.hidden = true;
      document.body.classList.remove('photo-lightbox-open');
      imgEl.removeAttribute('src');
      imgEl.alt = '';
    }

    function onGridClick(e) {
      var cell = e.target.closest('.photo-grid__cell');
      if (!cell || !grid.contains(cell)) return;
      var img = cell.querySelector('img');
      if (!img) return;
      collectItems();
      var imgs = grid.querySelectorAll('.photo-grid__cell img');
      var idx = Array.prototype.indexOf.call(imgs, img);
      if (idx >= 0) open(idx);
    }

    function onGridKeydown(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var cell = e.target.closest('.photo-grid__cell');
      if (!cell || !grid.contains(cell)) return;
      e.preventDefault();
      var img = cell.querySelector('img');
      if (!img) return;
      collectItems();
      var imgs = grid.querySelectorAll('.photo-grid__cell img');
      var idx = Array.prototype.indexOf.call(imgs, img);
      if (idx >= 0) open(idx);
    }

    grid.addEventListener('click', onGridClick);
    grid.addEventListener('keydown', onGridKeydown);

    btnPrev.addEventListener('click', function() {
      showAt(index - 1);
    });
    btnNext.addEventListener('click', function() {
      showAt(index + 1);
    });

    for (var c = 0; c < closeEls.length; c++) {
      closeEls[c].addEventListener('click', function(e) {
        e.stopPropagation();
        close();
      });
    }

    document.addEventListener('keydown', function(e) {
      if (root.hidden) return;
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showAt(index - 1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        showAt(index + 1);
      }
    });
  });
})();
