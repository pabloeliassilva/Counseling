// ECOSISTEMA BLINDADO V3 - CONTROLADOR GENERAL SPA OPTIMIZADO
    let dbCategorias = [];
    let dbGlosario = [];
    let dateUpdateStr = "";

    // Cacheo de referencias globales de elementos DOM críticos para ahorrar ciclos de CPU
    let DOM = {};

    const dbBlogEntries = [
      { id: 1, titulo: "El Enfoque Centrado en la Persona", fecha: "10 de Junio, 2026", contenido: "<p>Carl Rogers postulaba que el individuo posee en sí mismo medios para la autocomprensión y para el cambio del concepto de sí mismo, de las actitudes y del comportamiento autodirigido.</p><p>En el espacio terapéutico del Counseling, no dirigimos ni aconsejamos; creamos las condiciones relacionales para que esa tendencia actualizante innata emerja con fuerza orgánica.</p>" },
      { id: 2, titulo: "La Importancia de la Aceptación Incondicional", fecha: "28 de Mayo, 2026", contenido: "<p>Acoger la experiencia del consultante sin emitir juicios clínicos ni morales es, quizás, uno de los desafíos más profundos de nuestra profesión.</p><p>Cuando una persona se siente verdaderamente aceptada tal y como es, adquiere la libertad necesaria para explorar sus zonas oscuras y transformarlas.</p>" },
      { id: 3, titulo: "Vínculo Terapéutico y Presencia Genuina", fecha: "14 de Mayo, 2026", contenido: "<p>El cambio conductual y el autodescubrimiento no ocurren por la aplicación de técnicas mecánicas, sino a través del encuentro auténtico entre dos seres humanos.</p><p>La congruencia del Counselor funciona como un catalizador de salud mental y autenticidad para el cliente.</p>" }
    ];

    const dbMosaicos = [
      { src: "https://upload.wikimedia.org/wikipedia/commons/4/42/Camino_a_las_Sierras_de_C%C3%B3rdoba_2009-11.jpg", cls: "mosaic-large" },
      { src: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Bosque_alegre_desde_rut.jpg", cls: "" },
      { src: "https://upload.wikimedia.org/wikipedia/commons/3/36/Achala_cascada.jpg", cls: "mosaic-tall" },
      { src: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Cerro_Poca.JPG", cls: "" },
      { src: "https://upload.wikimedia.org/wikipedia/commons/3/30/BialetMasseCentro01.jpg", cls: "mosaic-wide" }
    ];

    let activeCategoryId = 'cv'; 
    let activeConceptId = null;
    let activePostId = null;
    let isMenuCollapsed = true;

    document.addEventListener("DOMContentLoaded", () => {
      // Inicializar el mapa del DOM de forma centralizada
      DOM.appContainer = document.getElementById('main-app-container');
      DOM.listCategorias = document.getElementById('list-categorias');
      DOM.gridConceptos = document.getElementById('grid-conceptos');
      DOM.glossaryStats = document.getElementById('glossary-stats');
      DOM.detailTarjeta = document.getElementById('detail-tarjeta');
      DOM.sidebarMenu = document.getElementById('sidebar-menu');

      fetch('data.json')
        .then(res => {
          if(!res.ok) throw new Error("Error HTTP al recuperar data.json");
          return res.json();
        })
        .then(data => {
          dbCategorias = data.categories || [];
          
          // RENDIMIENTO CRÍTICO: Ordenamos el glosario una sola vez acá.
          // Así evitamos llamadas pesadas a .sort() cada vez que tocás el menú izquierdo.
          dbGlosario = (data.glosario || []).sort((a, b) => 
            String(a.titulo || '').localeCompare(String(b.titulo || ''), 'es')
          );
          
          dateUpdateStr = data.dateUpdate || "";

          const elDate = document.getElementById('footer-date');
          if(elDate) elDate.innerText = dateUpdateStr;
          
          renderMenu();
          renderMosaicos();
          renderBlogSidebar();
          renderBlogPost();
          openSection('cv');
        })
        .catch(err => {
          console.error("❌ Error crítico en inicialización de datos:", err);
          if(DOM.gridConceptos) DOM.gridConceptos.innerHTML = '<div class="empty-state">Error al cargar la base de datos del glosario.</div>';
        });
    });

    function toggleMenu() {
        isMenuCollapsed = !isMenuCollapsed;
        if(DOM.sidebarMenu) DOM.sidebarMenu.classList.toggle('collapsed', isMenuCollapsed);
    }

    function autoCollapseMenu() {
        if (!isMenuCollapsed && window.innerWidth > 768) {
            isMenuCollapsed = true;
            if(DOM.sidebarMenu) DOM.sidebarMenu.classList.add('collapsed');
        }
    }

    // Navegación Izquierda optimizada con concatenación limpia y segura de strings
    function renderMenu() {
      if(!DOM.listCategorias) return;

      const secciones = [
        { id: 'cv', icon: '🌸', title: 'Lilian Romano', desc: 'COUNSELOR' },
        { id: 'enciclopedia', icon: '📚', title: 'ENCICLOPEDIA', desc: 'Conceptos Clave' },
        { id: 'game', icon: '🎮', title: 'COUNSELOR PLAY', desc: 'Sección de Juegos' },
        { id: 'blog', icon: '✍️', title: 'NUESTRO BLOG', desc: 'Artículos y Notas' }
      ];

      let html = '';
      for (let i = 0; i < secciones.length; i++) {
        let sec = secciones[i];
        let activeClass = (activeCategoryId === sec.id) ? 'active' : '';
        html += '<div class="cat-card ' + activeClass + '" style="--cat-color: #00B894" onclick="openSection('' + sec.id + '')">' +
                  '<div class="cat-icon" style="background:#00B894">' + sec.icon + '</div>' +
                  '<div class="cat-text-content">' +
                    '<div class="cat-title">' + sec.title + '</div>' +
                    '<div class="cat-desc">' + sec.desc + '</div>' +
                  '</div>' +
                '</div>';
      }
      DOM.listCategorias.innerHTML = html;
    }

    // Controlador SPA de respuesta instantánea
    function openSection(type) {
      autoCollapseMenu();
      if(typeof cancelarTimersGlobales === 'function') cancelarTimersGlobales();
      
      activeCategoryId = type;
      if (type !== 'enciclopedia') activeConceptId = null;

      if(DOM.appContainer) {
         DOM.appContainer.classList.remove('show-form', 'show-game', 'show-cv', 'show-blog');
         if (type !== 'enciclopedia') DOM.appContainer.classList.add('show-' + type);
      }

      renderMenu();

      if (type === 'enciclopedia') { 
         renderConceptos(); 
         renderTarjeta(); 
         if(DOM.gridConceptos) DOM.gridConceptos.scrollTop = 0;
      }
      if (type === 'game' && typeof renderArcadeMenu === 'function') { 
         renderArcadeMenu(); 
      }
      
      window.scrollTo(0,0);
    }

    function renderMosaicos() {
      const container = document.getElementById('cv-mosaic-container');
      if(!container) return;
      
      let html = '';
      for (let i = 0; i < dbMosaicos.length; i++) {
        let m = dbMosaicos[i];
        html += '<img src="' + m.src + '" class="' + m.cls + '" loading="lazy" onclick="if(typeof playPhotoMidi==='function') playPhotoMidi(this)">';
      }
      container.innerHTML = html;
    }

    // Generador de conceptos optimizado y libre de bugs de escape
    function renderConceptos() {
      if (activeCategoryId !== 'enciclopedia' || !DOM.gridConceptos) return;

      if (dbGlosario.length === 0) {
        DOM.gridConceptos.innerHTML = '<div class="empty-state">No hay conceptos para mostrar.</div>'; 
        return;
      }

      let linksCount = 0; 
      let conceptosCount = 0;
      let letraActual = '';
      let html = '';
      
      for (let i = 0; i < dbGlosario.length; i++) {
        let g = dbGlosario[i];
        let catOriginal = dbCategorias.find(c => c.id == g.categoriaId);
        let colorCard = catOriginal ? catOriginal.color : '#00B894';
        
        let isLink = (g.tipo && g.tipo.toLowerCase().includes('link')) || (catOriginal && catOriginal.nombre.toUpperCase() === 'LINKS');
        if(isLink) linksCount++; else conceptosCount++;

        let tituloLimpio = String(g.titulo || '').trim();
        let primeraLetra = tituloLimpio.charAt(0).toUpperCase() || '#';
        
        if (primeraLetra !== letraActual) {
          letraActual = primeraLetra; 
          html += '<div class="letter-divider">' + letraActual + '</div>';
        }

        let activeClass = (activeConceptId == g.id) ? 'active' : '';
        html += '<div class="concept-card ' + activeClass + '" style="--cat-color: ' + colorCard + '" onclick="selectConcept('' + g.id + '')">' +
                  '<div class="color-dot"></div>' +
                  '<div class="concept-title">' + g.titulo + '</div>' +
                  '<div class="concept-summary">' + g.resumen + '</div>' +
                '</div>';
      }

      if(DOM.glossaryStats) {
        DOM.glossaryStats.innerHTML = '<span class="stat-badge">🗂️ Total: ' + dbGlosario.length + '</span>' +
                                      '<span class="stat-badge">🌞 Conceptos: ' + conceptosCount + '</span>' +
                                      '<span class="stat-badge">🔗 Links: ' + linksCount + '</span>';
      }
      DOM.gridConceptos.innerHTML = html;
    }

    function selectConcept(id) {
      autoCollapseMenu();
      activeConceptId = (activeConceptId == id) ? null : id;
      renderConceptos(); 
      renderTarjeta();
      const tarjeta = document.getElementById('col-tarjeta-container');
      if(tarjeta) tarjeta.classList.add('mobile-open');
    }

    function closeMobileDetail() { 
      const tarjeta = document.getElementById('col-tarjeta-container');
      if(tarjeta) tarjeta.classList.remove('mobile-open'); 
    }

    function renderTarjeta() {
      if(!DOM.detailTarjeta) return;
      const concepto = dbGlosario.find(g => g.id == activeConceptId);
      
      if (!concepto) {
        DOM.detailTarjeta.innerHTML = '<div class="empty-state-container" style="text-align: center; padding: 40px 20px;">' +
                                         '<h2 style="font-family: 'Merriweather', serif; font-size: 2.2rem; color: var(--brand-color); margin-bottom: 15px;">Bienvenido a la Enciclopedia</h2>' +
                                         '<p style="font-size: 1.1rem; color: #475569; line-height: 1.7; margin-bottom: 25px;">Un espacio dinámico para explorar y profundizar en el fascinante mundo del Counseling y la Psicología Humanista.</p>' +
                                         '<p style="margin-top: 30px; color: #94a3b8; font-style: italic; font-size:1.1rem;">👈 Selecciona una tarjeta en la lista para comenzar a explorar.</p>' +
                                       '</div>';
        return;
      }
      
      const catOriginal = dbCategorias.find(c => c.id == concepto.categoriaId);
      const nombreCategoria = catOriginal ? catOriginal.nombre : 'General';
      const colorCard = catOriginal ? catOriginal.color : '#00B894';
      
      const container = document.getElementById('col-tarjeta-container');
      if(container) container.style.setProperty('--cat-color', colorCard);
      
      const isLink = (concepto.tipo && concepto.tipo.toLowerCase().includes('link')) || (catOriginal && catOriginal.nombre.toUpperCase() === 'LINKS');
      const badgeHtml = isLink ? '<span class="concept-type-badge link">🔗 Link</span>' : '<span class="concept-type-badge">🌞 Concepto</span>';
      const googleSearchUrl = "https://www.google.com/search?q=" + encodeURIComponent("Counseling psicología " + concepto.titulo);
      
      let html = '<div class="detail-container">' +
                   '<a href="' + googleSearchUrl + '" target="_blank" rel="noopener noreferrer" class="btn-google-emoji" title="Buscar en Google">🔍</a>' +
                   badgeHtml +
                   '<h1 class="detail-title">' + concepto.titulo + '</h1>' +
                   '<p class="detail-summary">' + concepto.resumen + '</p>' +
                   '<div class="detail-category-label">📂 Categoría: <strong>' + nombreCategoria + '</strong></div>';
                   
      if (concepto.desarrolloHtml) {
        html += '<div class="section-title">✍️ Desarrollo</div><div class="detail-text">' + concepto.desarrolloHtml + '</div>';
      }
      if (concepto.aplicacionHtml) {
        html += '<div class="section-title">🛠️ Aplicación Clínica</div><div class="detail-text">' + concepto.aplicacionHtml + '</div>';
      }
      html += '</div>';
      DOM.detailTarjeta.innerHTML = html;
    }

    function renderBlogSidebar() {
      const container = document.getElementById('ui-blog-list');
      if(!container) return;
      
      let html = '';
      for (let i = 0; i < dbBlogEntries.length; i++) {
        let post = dbBlogEntries[i];
        let activeClass = (activePostId == post.id) ? 'active' : '';
        html += '<div class="blog-item-nav ' + activeClass + '" onclick="selectBlogPost(' + post.id + ')">' +
                  '<div class="blog-item-title-nav">' + post.titulo + '</div>' +
                  '<div class="blog-item-date-nav">' + post.fecha + '</div>' +
                '</div>';
      }
      container.innerHTML = html;
    }

    function selectBlogPost(id) {
      activePostId = id;
      renderBlogSidebar();
      renderBlogPost();
    }

    function renderBlogPost() {
      const container = document.getElementById('ui-blog-body');
      if(!container) return;
      const post = dbBlogEntries.find(p => p.id == activePostId);

      if (!post) {
        container.innerHTML = '<div class="blog-welcome">' +
                               '<h2>🌸 Cuaderno de Reflexiones</h2>' +
                               '<p>Selecciona una entrada en el menú izquierdo para leer los últimos artículos sobre Counseling y Enfoque Centrado en la Persona.</p>' +
                             '</div>';
        return;
      }

      container.innerHTML = '<article class="blog-post">' +
                              '<h2>' + post.titulo + '</h2>' +
                              '<div class="blog-post-meta">Publicado: ' + post.fecha + ' por Lilian Romano</div>' +
                              '<hr style="border:none; border-top:1px solid var(--border); margin-bottom:25px;">' +
                              '<div class="blog-post-content">' + post.contenido + '</div>' +
                            '</article>';
    }
  