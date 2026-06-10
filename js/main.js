
    let dbCategorias = [];
    let dbGlosario = [];
    let dateUpdateStr = "";

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
      fetch('data.json')
        .then(res => {
          if(!res.ok) throw new Error("Error HTTP al recuperar data.json");
          return res.json();
        })
        .then(data => {
          dbCategorias = data.categories || [];
          dbGlosario = data.glosario || [];
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
          const grid = document.getElementById('grid-conceptos');
          if(grid) grid.innerHTML = '<div class="empty-state">Error al cargar la base de datos del glosario.</div>';
        });
    });

    function toggleMenu() {
        isMenuCollapsed = !isMenuCollapsed;
        const menu = document.getElementById('sidebar-menu');
        if(menu) menu.classList.toggle('collapsed', isMenuCollapsed);
    }

    function autoCollapseMenu() {
        if (!isMenuCollapsed && window.innerWidth > 768) {
            isMenuCollapsed = true;
            const menu = document.getElementById('sidebar-menu');
            if(menu) menu.classList.add('collapsed');
        }
    }

    function renderMenu() {
      const secciones = [
        { id: 'cv', icon: '🌸', title: 'Lilian Romano', desc: 'COUNSELOR' },
        { id: 'enciclopedia', icon: '📚', title: 'ENCICLOPEDIA', desc: 'Conceptos Clave' },
        { id: 'game', icon: '🎮', title: 'COUNSELOR PLAY', desc: 'Sección de Juegos' },
        { id: 'blog', icon: '✍️', title: 'NUESTRO BLOG', desc: 'Artículos y Notas' }
      ];

      const listContainer = document.getElementById('list-categorias');
      if(listContainer) {
        listContainer.innerHTML = secciones.map(sec => {
          const activeClass = (activeCategoryId === sec.id) ? 'active' : '';
          return '<div class="cat-card ' + activeClass + '" style="--cat-color: #00B894" onclick="openSection('' + sec.id + '')">' +
                   '<div class="cat-icon" style="background:#00B894">' + sec.icon + '</div>' +
                   '<div class="cat-text-content">' +
                     '<div class="cat-title">' + sec.title + '</div>' +
                     '<div class="cat-desc">' + sec.desc + '</div>' +
                   '</div>' +
                 '</div>';
        }).join('');
      }
    }

    function openSection(type) {
      autoCollapseMenu();
      if(typeof cancelarTimersGlobales === 'function') cancelarTimersGlobales();
      activeCategoryId = type;
      if (type !== 'enciclopedia') activeConceptId = null;

      const appContainer = document.getElementById('main-app-container');
      if(appContainer) {
         appContainer.classList.remove('show-form', 'show-game', 'show-cv', 'show-blog');
         if (type !== 'enciclopedia') appContainer.classList.add('show-' + type);
      }

      renderMenu();

      if (type === 'enciclopedia') { 
         renderConceptos(); 
         renderTarjeta(); 
         const grid = document.getElementById('grid-conceptos');
         if(grid) grid.scrollTop = 0;
      }
      if (type === 'game' && typeof renderArcadeMenu === 'function') { 
         renderArcadeMenu(); 
      }
      
      window.scrollTo(0,0);
    }

    function renderMosaicos() {
      const container = document.getElementById('cv-mosaic-container');
      if(container) {
        container.innerHTML = dbMosaicos.map(m => {
          return '<img src="' + m.src + '" class="' + m.cls + '" loading="lazy" onclick="if(typeof playPhotoMidi===\'function\') playPhotoMidi(this)">';
        }).join('');
      }
    }

    function renderConceptos() {
      if (activeCategoryId !== 'enciclopedia') return;
      let filtrados = [...dbGlosario].sort((a, b) => String(a.titulo || '').localeCompare(String(b.titulo || ''), 'es'));
      const grid = document.getElementById('grid-conceptos');
      if (!grid) return;

      if (filtrados.length === 0) {
        grid.innerHTML = '<div class="empty-state">No hay conceptos para mostrar.</div>'; 
        return;
      }

      let linksCount = 0; let conceptosCount = 0;
      let htmlCartas = ''; let letraActual = '';
      
      filtrados.forEach(g => {
        const catOriginal = dbCategorias.find(c => c.id == g.categoriaId);
        let colorCard = catOriginal ? catOriginal.color : '#00B894';
        
        let isLink = (g.tipo && g.tipo.toLowerCase().includes('link')) || (catOriginal && catOriginal.nombre.toUpperCase() === 'LINKS');
        if(isLink) linksCount++; else conceptosCount++;

        let tituloLimpio = String(g.titulo || '').trim();
        let primeraLetra = tituloLimpio.charAt(0).toUpperCase() || '#';
        if (primeraLetra !== letraActual) {
          letraActual = primeraLetra; 
          htmlCartas += '<div class="letter-divider">' + letraActual + '</div>';
        }

        const activeClass = (activeConceptId == g.id) ? 'active' : '';
        htmlCartas += '<div class="concept-card ' + activeClass + '" style="--cat-color: ' + colorCard + '" onclick="selectConcept('' + g.id + '')">' +
                        '<div class="color-dot"></div>' +
                        '<div class="concept-title">' + g.titulo + '</div>' +
                        '<div class="concept-summary">' + g.resumen + '</div>' +
                      '</div>';
      });

      const stats = document.getElementById('glossary-stats');
      if(stats) {
        stats.innerHTML = '<span class="stat-badge">🗂️ Total: ' + filtrados.length + '</span>' +
                          '<span class="stat-badge">🌞 Conceptos: ' + conceptosCount + '</span>' +
                          '<span class="stat-badge">🔗 Links: ' + linksCount + '</span>';
      }
      grid.innerHTML = htmlCartas;
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
      const el = document.getElementById('detail-tarjeta');
      if(!el) return;
      const concepto = dbGlosario.find(g => g.id == activeConceptId);
      
      if (!concepto) {
        el.innerHTML = '<div class="empty-state-container" style="text-align: center; padding: 40px 20px;">' +
                         '<h2 style="font-family: \'Merriweather\', serif; font-size: 2.2rem; color: var(--brand-color); margin-bottom: 15px;">Bienvenido a la Enciclopedia</h2>' +
                         '<p style="font-size: 1.1rem; color: #475569; line-height: 1.7; margin-bottom: 25px;">Un espacio dinámico para explorar y profundizar en el fascinante mundo del Counseling y la Psicología Humanista.</p>' +
                         '<p style="margin-top: 30px; color: #94a3b8; font-style: italic; font-size:1.1rem;">👈 Selecciona una tarjeta en la lista para comenzar a explorar.</p>' +
                       '</div>';
        return;
      }
      
      const catOriginal = dbCategorias.find(c => c.id == concepto.categoriaId);
      let nombreCategoria = catOriginal ? catOriginal.nombre : 'General';
      let colorCard = catOriginal ? catOriginal.color : '#00B894';
      
      const container = document.getElementById('col-tarjeta-container');
      if(container) container.style.setProperty('--cat-color', colorCard);
      
      let isLink = (concepto.tipo && concepto.tipo.toLowerCase().includes('link')) || (catOriginal && catOriginal.nombre.toUpperCase() === 'LINKS');
      let badgeHtml = isLink ? '<span class="concept-type-badge link">🔗 Link</span>' : '<span class="concept-type-badge">🌞 Concepto</span>';
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
      el.innerHTML = html;
    }

    function renderBlogSidebar() {
      const container = document.getElementById('ui-blog-list');
      if(container) {
        container.innerHTML = dbBlogEntries.map(post => {
          const activeClass = (activePostId === post.id) ? 'active' : '';
          return '<div class="blog-item-nav ' + activeClass + '" onclick="selectBlogPost(' + post.id + ')">' +
                   '<div class="blog-item-title-nav">' + post.titulo + '</div>' +
                   '<div class="blog-item-date-nav">' + post.fecha + '</div>' +
                 '</div>';
        }).join('');
      }
    }

    function renderBlogPost() {
      const container = document.getElementById('ui-blog-body');
      if(!container) return;
      const post = dbBlogEntries.find(p => p.id === activePostId);

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
  