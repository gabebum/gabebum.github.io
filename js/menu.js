document.addEventListener('DOMContentLoaded', function() {
  const burgerMenu = document.getElementById('burgerMenu');
  const navbarMenu = document.getElementById('navbarMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Переключение бургер меню
  burgerMenu.addEventListener('click', function() {
    burgerMenu.classList.toggle('active');
    navbarMenu.classList.toggle('active');
  });

  // Закрытие меню при клике на ссылку
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      burgerMenu.classList.remove('active');
      navbarMenu.classList.remove('active');
    });
  });

  // Закрытие меню при клике вне его области
  document.addEventListener('click', function(event) {
    const isClickInsideMenu = navbarMenu.contains(event.target);
    const isClickOnBurger = burgerMenu.contains(event.target);
    
    if (!isClickInsideMenu && !isClickOnBurger && navbarMenu.classList.contains('active')) {
      burgerMenu.classList.remove('active');
      navbarMenu.classList.remove('active');
    }
  });

  // Галерея и модальное окно
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modalClose');
  const modalContent = document.getElementById('modalContent');
  const galleryItems = document.querySelectorAll('.gallery-item');

  // Функция для рендеринга элемента контента
  function renderContentElement(element) {
    const { type, data } = element;
    
    switch(type) {
      case 'title':
        const titleEl = document.createElement('h2');
        titleEl.className = 'modal-title';
        titleEl.textContent = data;
        return titleEl;
        
      case 'meta':
        const metaEl = document.createElement('div');
        metaEl.className = 'modal-meta';
        if (data.date) {
          const dateSpan = document.createElement('span');
          dateSpan.className = 'modal-date';
          dateSpan.textContent = data.date;
          metaEl.appendChild(dateSpan);
        }
        if (data.location) {
          const locationSpan = document.createElement('span');
          locationSpan.className = 'modal-location';
          locationSpan.textContent = data.location;
          metaEl.appendChild(locationSpan);
        }
        return metaEl;
        
      case 'image':
        const imgContainer = document.createElement('div');
        imgContainer.className = 'modal-image-block single-image';
        const img = document.createElement('img');
        img.src = typeof data === 'string' ? data : (data.src || data);
        img.alt = typeof data === 'string' ? '' : (data.alt || '');
        imgContainer.appendChild(img);
        return imgContainer;
        
      case 'images':
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'modal-images-grid';
        const images = Array.isArray(data) ? data : [data];
        images.forEach(imgSrc => {
          const imgContainer = document.createElement('div');
          imgContainer.className = 'modal-image-block';
          const img = document.createElement('img');
          img.src = typeof imgSrc === 'string' ? imgSrc : imgSrc.src;
          img.alt = typeof imgSrc === 'string' ? '' : (imgSrc.alt || '');
          imgContainer.appendChild(img);
          imagesContainer.appendChild(imgContainer);
        });
        return imagesContainer;
        
      case 'text':
        const textEl = document.createElement('div');
        textEl.className = 'modal-text';
        textEl.innerHTML = data;
        return textEl;
        
      case 'techniques':
        const techniquesEl = document.createElement('div');
        techniquesEl.className = 'modal-techniques';
        const techniquesTitle = document.createElement('h3');
        techniquesTitle.textContent = 'Использованные техники:';
        techniquesEl.appendChild(techniquesTitle);
        const techniquesList = document.createElement('ul');
        if (Array.isArray(data)) {
          data.forEach(technique => {
            const li = document.createElement('li');
            li.textContent = technique;
            techniquesList.appendChild(li);
          });
        }
        techniquesEl.appendChild(techniquesList);
        return techniquesEl;
        
      case 'html':
        const htmlEl = document.createElement('div');
        htmlEl.className = 'modal-html';
        htmlEl.innerHTML = data;
        return htmlEl;
        
      default:
        return document.createDocumentFragment();
    }
  }

  // Открытие модального окна
  galleryItems.forEach(item => {
    item.addEventListener('click', function() {
      const eventData = JSON.parse(this.getAttribute('data-event'));
      
      // Очищаем контент
      modalContent.innerHTML = '';
      
      // Если есть поле content (массив элементов), рендерим его
      if (eventData.content && Array.isArray(eventData.content)) {
        eventData.content.forEach(element => {
          const rendered = renderContentElement(element);
          modalContent.appendChild(rendered);
        });
      } else {
        // Обратная совместимость со старой структурой
        // Заголовок
        if (eventData.title) {
          const titleEl = document.createElement('h2');
          titleEl.className = 'modal-title';
          titleEl.textContent = eventData.title;
          modalContent.appendChild(titleEl);
        }
        
        // Мета информация
        if (eventData.date || eventData.location) {
          const metaEl = document.createElement('div');
          metaEl.className = 'modal-meta';
          if (eventData.date) {
            const dateSpan = document.createElement('span');
            dateSpan.className = 'modal-date';
            dateSpan.textContent = eventData.date;
            metaEl.appendChild(dateSpan);
          }
          if (eventData.location) {
            const locationSpan = document.createElement('span');
            locationSpan.className = 'modal-location';
            locationSpan.textContent = eventData.location;
            metaEl.appendChild(locationSpan);
          }
          modalContent.appendChild(metaEl);
        }
        
        // Изображения
        const images = eventData.images || (eventData.image ? [eventData.image] : []);
        if (images.length > 0) {
          if (images.length === 1) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'modal-image-block single-image';
            const img = document.createElement('img');
            img.src = images[0];
            img.alt = eventData.title || '';
            imgContainer.appendChild(img);
            modalContent.appendChild(imgContainer);
          } else {
            const imagesContainer = document.createElement('div');
            imagesContainer.className = 'modal-images-grid';
            images.forEach(imgSrc => {
              const imgContainer = document.createElement('div');
              imgContainer.className = 'modal-image-block';
              const img = document.createElement('img');
              img.src = imgSrc;
              img.alt = eventData.title || '';
              imgContainer.appendChild(img);
              imagesContainer.appendChild(imgContainer);
            });
            modalContent.appendChild(imagesContainer);
          }
        }
        
        // Описание
        if (eventData.description) {
          const descEl = document.createElement('div');
          descEl.className = 'modal-text';
          if (typeof eventData.description === 'string') {
            descEl.innerHTML = '<p>' + eventData.description + '</p>';
          } else {
            descEl.innerHTML = eventData.description;
          }
          modalContent.appendChild(descEl);
        }
        
        // Техники
        if (eventData.techniques && eventData.techniques.length > 0) {
          const techniquesEl = document.createElement('div');
          techniquesEl.className = 'modal-techniques';
          const techniquesTitle = document.createElement('h3');
          techniquesTitle.textContent = 'Использованные техники:';
          techniquesEl.appendChild(techniquesTitle);
          const techniquesList = document.createElement('ul');
          eventData.techniques.forEach(technique => {
            const li = document.createElement('li');
            li.textContent = technique;
            techniquesList.appendChild(li);
          });
          techniquesEl.appendChild(techniquesList);
          modalContent.appendChild(techniquesEl);
        }
        
        // Дополнительный контент
        if (eventData.additional) {
          const additionalEl = document.createElement('div');
          additionalEl.className = 'modal-html';
          additionalEl.innerHTML = eventData.additional;
          modalContent.appendChild(additionalEl);
        }
      }
      
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Блокируем скролл
    });
  });

  // Закрытие модального окна
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Восстанавливаем скролл
  }

  modalClose.addEventListener('click', closeModal);

  // Закрытие при клике вне модального окна
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Закрытие по Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
});

