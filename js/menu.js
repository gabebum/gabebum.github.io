document.addEventListener('DOMContentLoaded', function() {
  const burgerMenu = document.getElementById('burgerMenu');
  const navbarMenu = document.getElementById('navbarMenu');
  const navBackdrop = document.getElementById('navBackdrop');
  const navLinks = document.querySelectorAll('.sidebar-menu .nav-link');

  if (!burgerMenu || !navbarMenu) {
    return;
  }

  function setNavOpen(open) {
    document.body.classList.toggle('nav-open', open);
    burgerMenu.classList.toggle('active', open);
    burgerMenu.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (navBackdrop) {
      if (open) {
        navBackdrop.removeAttribute('hidden');
      } else {
        navBackdrop.setAttribute('hidden', '');
      }
    }
  }

  function closeNav() {
    setNavOpen(false);
  }

  burgerMenu.addEventListener('click', function(e) {
    e.stopPropagation();
    const willOpen = !document.body.classList.contains('nav-open');
    setNavOpen(willOpen);
  });

  navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      if (window.matchMedia('(max-width: 768px)').matches) {
        closeNav();
      }
    });
  });

  if (navBackdrop) {
    navBackdrop.addEventListener('click', closeNav);
  }

  document.addEventListener('click', function(event) {
    if (!document.body.classList.contains('nav-open')) {
      return;
    }
    const sidebar = document.getElementById('sidebar');
    const insideSidebar = sidebar && sidebar.contains(event.target);
    const onBurger = burgerMenu.contains(event.target);
    if (!insideSidebar && !onBurger) {
      closeNav();
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
      closeNav();
    }
  });
});
