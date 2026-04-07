(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var overlay = document.getElementById('peopleOverlay');
    var titleEl = document.getElementById('peopleOverlayTitle');
    var bodyEl = document.getElementById('peopleOverlayBody');
    var grid = document.querySelector('[data-people-grid]');

    if (!overlay || !titleEl || !bodyEl || !grid) return;

    var closeEls = overlay.querySelectorAll('.js-people-overlay-close');

    function openPeople(index, title) {
      var tpl = document.getElementById('people-item-' + index);
      bodyEl.innerHTML = tpl ? tpl.innerHTML : '';
      titleEl.textContent = title || '';

      overlay.hidden = false;
      document.body.classList.add('video-overlay-open');
      overlay.focus();
    }

    function closePeople() {
      overlay.hidden = true;
      document.body.classList.remove('video-overlay-open');
      titleEl.textContent = '';
      bodyEl.innerHTML = '';
    }

    grid.addEventListener('click', function(e) {
      var card = e.target.closest('.video-grid__card');
      if (!card || !grid.contains(card)) return;
      var idx = card.getAttribute('data-people-index');
      if (idx === null || idx === '') return;
      var title = card.getAttribute('data-people-title') || '';
      openPeople(idx, title);
    });

    for (var i = 0; i < closeEls.length; i++) {
      closeEls[i].addEventListener('click', function(e) {
        e.stopPropagation();
        closePeople();
      });
    }

    document.addEventListener('keydown', function(e) {
      if (!overlay.hidden && e.key === 'Escape') {
        closePeople();
      }
    });
  });
})();
