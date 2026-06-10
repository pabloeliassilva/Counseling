
    // 1. FLASHCARDS
    function startFlashcards() { playMidiTheme('flashcards'); historialRespuestas = []; juegoActual = 'flashcards'; ronda = 0; puntajeJuego = 0; bancoJuego = mezclarArray(dbGlosario).slice(0, 10); renderFlashcardRonda(); }
    function renderFlashcardRonda() {
      if(ronda >= 10 || ronda >= bancoJuego.length) return renderFinalResult();
      let item = bancoJuego[ronda];
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()">← Volver</button><div class="game-active-header"><span>🃏 Tarjetas</span><span>Tarjeta ${ronda + 1} / 10</span></div><div class="flashcard-box" onclick="this.classList.toggle('flipped')"><div class="flashcard-inner"><div class="flashcard-face flashcard-front"><h2>${item.titulo}</h2><span style="margin-top:20px; color:#8e44ad; font-weight:bold;">👆 Toca para girar</span></div><div class="flashcard-face flashcard-back"><p><b>Definición:</b><br><br>${item.resumen}</p></div></div></div><div class="flashcard-actions"><button class="btn-action-fc btn-fc-wrong" onclick="nextFlashcard(false)">🔴 No la sabía</button><button class="btn-action-fc btn-fc-correct" onclick="nextFlashcard(true)">🟢 ¡Me la sabía!</button></div>` + obtenerManual();
      }
    }
    function nextFlashcard(supo) { 
      let item = bancoJuego[ronda];
      historialRespuestas.push({pre: item.titulo, res: supo?"Sí":"No", cor: item.titulo, exp: item.resumen});
      if(supo) { puntajeJuego++; updatePuntajeGlobal(1); } else { updatePuntajeGlobal(-1); }
      ronda++; renderFlashcardRonda(); 
    }

    // 2. TRIVIAS
    function startTrivia(tipo) {
      playMidiTheme('trivia_' + tipo); historialRespuestas = []; juegoActual = 'trivia_' + tipo; ronda = 0; puntajeJuego = 0; bancoJuego = [];
      let poolValidos = dbGlosario.filter(g => g.resumen && g.resumen.length > 5);
      let mezclados = mezclarArray(poolValidos).slice(0, 10);
      const listaTitulosGlobal = dbGlosario.map(g => g.titulo);
      mezclados.forEach(g => {
        if(tipo === 1) bancoJuego.push({ pregunta: "¿Qué concepto se define así?<br><br><i>'" + g.resumen + "'</i>", correcta: g.titulo, opciones: obtenerOpcionesCuatro(g.titulo, listaTitulosGlobal) });
        else if(tipo === 2) {
          let esV = Math.random() > 0.5; let def = g.resumen;
          if(!esV) { let a = mezclarArray(dbGlosario.filter(x => x.id != g.id && x.resumen))[0]; if(a) def = a.resumen; }
          bancoJuego.push({ pregunta: "El concepto <b>" + g.titulo + "</b> se define como:<br><br><i>'" + def + "'</i>", correcta: esV ? "Verdadero" : "Falso", opciones: ["Verdadero", "Falso"] });
        }
      });
      renderTriviaRonda();
    }
    function renderTriviaRonda() {
      if(ronda >= 10 || ronda >= bancoJuego.length) return renderFinalResult();
      let p = bancoJuego[ronda];
      let botones = p.opciones.map(o => `<button class="option-btn" onclick="evaluarRespuestaTrivia(this, '${escapeString(o)}', '${escapeString(p.correcta)}')" onmouseenter="playMarimbaHover()">${o}</button>`).join('');
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()">← Volver</button><div class="game-active-header"><span>❓ Trivia</span><span>Ronda ${ronda + 1} / 10</span></div><div class="game-text-question">${p.pregunta}</div><div class="options-stack">${botones}</div>` + obtenerManual();
      }
    }
    function evaluarRespuestaTrivia(btn, sel, corr) {
      document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
      let pregClean = bancoJuego[ronda].pregunta.replace(/<[^>]*>?/gm, '');
      historialRespuestas.push({pre: pregClean, res: sel, cor: corr, exp: sel === corr ? "¡Acertaste la definición!" : "La respuesta correcta era " + corr});
      if(sel === corr) { btn.classList.add('correct'); puntajeJuego++; updatePuntajeGlobal(1); } 
      else { btn.classList.add('wrong'); document.querySelectorAll('.option-btn').forEach(b => { if(b.innerText === corr) b.classList.add('correct'); }); updatePuntajeGlobal(-1); }
      setTimeout(() => { ronda++; renderTriviaRonda(); }, 1200);
    }

    // 3. EMPAREJAMIENTO
    let itemsSeleccionadosMatching = { concepto: null, definicion: null };
    function startMatching() {
      playMidiTheme('matching'); historialRespuestas = []; juegoActual = 'matching'; ronda = 0; puntajeJuego = 0;
      let pool = mezclarArray(dbGlosario.filter(g => g.resumen)).slice(0, 5);
      bancoJuego = { conceptos: mezclarArray(pool.map(g => ({ id: String(g.id), texto: g.titulo }))), definiciones: mezclarArray(pool.map(g => ({ id: String(g.id), texto: g.resumen.substring(0, 95) + '...' }))), matchedIds: [] };
      itemsSeleccionadosMatching = { concepto: null, definicion: null }; renderMatchingBoard();
    }
    function renderMatchingBoard() {
      if(bancoJuego.matchedIds.length === 5) { 
        puntajeJuego = 10; bancoJuego.matchedIds.forEach(id => { let c = dbGlosario.find(g=>g.id == id); historialRespuestas.push({ pre: c.titulo, res: "Emparejado", cor: c.titulo, exp: c.resumen }); });
        return renderFinalResult(); 
      }
      let cHtml = bancoJuego.conceptos.map(c => `<div class="match-item ${bancoJuego.matchedIds.includes(c.id)?'matched':''} ${itemsSeleccionadosMatching.concepto==c.id?'selected':''}" ${!bancoJuego.matchedIds.includes(c.id)?`onclick="selectMatchItem('concepto', '${c.id}')"`:''} onmouseenter="playMarimbaHover()">${c.texto}</div>`).join('');
      let dHtml = bancoJuego.definiciones.map(d => `<div class="match-item ${bancoJuego.matchedIds.includes(d.id)?'matched':''} ${itemsSeleccionadosMatching.definicion==d.id?'selected':''}" ${!bancoJuego.matchedIds.includes(d.id)?`onclick="selectMatchItem('definicion', '${d.id}')"`:''} onmouseenter="playMarimbaHover()">${d.texto}</div>`).join('');
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()">← Volver</button><div class="game-active-header"><span>🔗 Emparejamiento</span><span>Completados: ${bancoJuego.matchedIds.length} / 5</span></div><div class="match-container"><div class="match-col"><h3>Conceptos</h3>${cHtml}</div><div class="match-col"><h3>Definiciones</h3>${dHtml}</div></div>` + obtenerManual();
      }
    }
    function selectMatchItem(col, id) {
      itemsSeleccionadosMatching[col] = id;
      if(itemsSeleccionadosMatching.concepto && itemsSeleccionadosMatching.definicion) {
        if(itemsSeleccionadosMatching.concepto === itemsSeleccionadosMatching.definicion) { bancoJuego.matchedIds.push(itemsSeleccionadosMatching.concepto); updatePuntajeGlobal(2); } 
        else { updatePuntajeGlobal(-1); }
        itemsSeleccionadosMatching = { concepto: null, definicion: null };
      }
      renderMatchingBoard();
    }

    // 4. SIMULADOR DE DIÁLOGO
    const dbExtraCasos = [
      { q: "Siento que nada de lo que hago tiene sentido últimamente.", correct: "Entiendo que te sientes desmotivado y vacío en este momento.", wrong: ["Deberías salir a caminar, eso ayuda.", "No digas eso, tienes muchas cosas buenas.", "¿Por qué no pruebas un nuevo hobby?"] },
      { q: "Mi pareja me dejó y siento que me muero.", correct: "Sientes un dolor muy profundo y abrumador por esta pérdida.", wrong: ["Ya vas a encontrar a alguien mejor.", "El tiempo lo cura todo, ten paciencia.", "Quizás no era la persona indicada para ti."] },
      { q: "Tengo mucho miedo de hablar en público, me paralizo.", correct: "La idea de exponerte frente a otros te genera una gran ansiedad.", wrong: ["Solo imagina que están todos desnudos.", "No te preocupes, a todos les pasa.", "Tienes que ser valiente y enfrentarlo."] }
    ];
    function startSimulador() { playMidiTheme('simulador'); historialRespuestas = []; juegoActual = 'simulador'; ronda = 0; puntajeJuego = 0; bancoJuego = mezclarArray(dbExtraCasos).slice(0, 3); renderSimulador(); }
    function renderSimulador() {
      if(ronda >= bancoJuego.length) { puntajeJuego = Math.round((puntajeJuego/3)*10); return renderFinalResult(); }
      let p = bancoJuego[ronda]; let opciones = mezclarArray([p.correct, ...p.wrong]);
      let botones = opciones.map(o => `<button class="option-btn" onclick="evaluarSimulador(this, '${escapeString(o)}', '${escapeString(p.correct)}')" onmouseenter="playMarimbaHover()">${o}</button>`).join('');
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()">← Volver</button><div class="game-active-header"><span>💬 Simulador</span><span>Caso ${ronda + 1} / 3</span></div><div class="game-text-question" style="background:#f0f9ff; border-color:#3498db;"><b>Consultante:</b><br><br>"${p.q}"</div><p style="margin-bottom:15px; font-weight:bold;">Como Counselor, ¿cuál sería tu mejor respuesta?</p><div class="options-stack">${botones}</div>` + obtenerManual();
      }
    }
    function evaluarSimulador(btn, sel, corr) {
      document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
      historialRespuestas.push({ pre: bancoJuego[ronda].q, res: sel, cor: corr, exp: "Se busca reflejar sentimientos y validar empáticamente." });
      if(sel === corr) { btn.classList.add('correct'); puntajeJuego++; updatePuntajeGlobal(3); } 
      else { btn.classList.add('wrong'); updatePuntajeGlobal(-1); document.querySelectorAll('.option-btn').forEach(b => { if(b.innerText === corr) b.classList.add('correct'); }); }
      setTimeout(() => { ronda++; renderSimulador(); }, 1800);
    }

    // 5. EMPATÍA O SIMPATÍA
    const dbExtraEmpatia = [
      { text: "Comprendo que esta situación te resulta muy frustrante.", isEmpatia: true },
      { text: "No te pongas así, no es para tanto.", isEmpatia: false },
      { text: "Veo que esto te ha dolido más de lo que esperabas.", isEmpatia: true },
      { text: "Yo en tu lugar habría hecho lo mismo.", isEmpatia: false },
      { text: "Debe ser muy difícil lidiar con tanta presión.", isEmpatia: true },
      { text: "Mira el lado positivo, al menos tienes salud.", isEmpatia: false }
    ];
    function startEmpatia() { playMidiTheme('empatia'); historialRespuestas = []; juegoActual = 'empatia'; ronda = 0; puntajeJuego = 0; bancoJuego = mezclarArray(dbExtraEmpatia).slice(0, 5); renderEmpatia(); }
    function renderEmpatia() {
      if(ronda >= bancoJuego.length) { puntajeJuego = puntajeJuego * 2; return renderFinalResult(); }
      let p = bancoJuego[ronda];
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()">← Volver</button><div class="game-active-header"><span>⚖️ ¿Empatía o Inadecuado?</span><span>Frase ${ronda + 1} / 5</span></div><div class="flashcard-box" style="cursor:default; border:none;"><div class="flashcard-face flashcard-front"><h2>"${p.text}"</h2></div></div><div class="swipe-container"><button class="btn-swipe bg-red" onclick="evaluarEmpatia(false, ${p.isEmpatia})">Simpatía / Inadecuado</button><button class="btn-swipe bg-green" onclick="evaluarEmpatia(true, ${p.isEmpatia})">Empatía / Adecuado</button></div>` + obtenerManual();
      }
    }
    function evaluarEmpatia(respuesta, correcta) {
      historialRespuestas.push({ pre: bancoJuego[ronda].text, res: respuesta?"Empatía":"Inadecuado", cor: correcta?"Empatía":"Inadecuado", exp: correcta ? "Validación y acompañamiento." : "Bloquea o minimiza la emoción." });
      if(respuesta === correcta) { puntajeJuego++; updatePuntajeGlobal(2); } else { updatePuntajeGlobal(-1); }
      ronda++; renderEmpatia();
    }

    // 6. CAJAS DE CORRIENTES
    function startCorrientes() {
      playMidiTheme('arcade_intro'); historialRespuestas = []; juegoActual = 'corrientes'; ronda = 0; puntajeJuego = 0;
      let catsUtiles = dbCategorias.filter(c => c.nombre.length > 3).slice(0, 3);
      let conceptos = mezclarArray(dbGlosario.filter(g => catsUtiles.some(c => c.id == g.categoriaId))).slice(0, 5);
      bancoJuego = { cats: catsUtiles, conceptos: conceptos }; renderCorrientes();
    }
    function renderCorrientes() {
      if(ronda >= bancoJuego.conceptos.length) { puntajeJuego = puntajeJuego * 2; return renderFinalResult(); }
      let c = bancoJuego.conceptos[ronda];
      let cajas = bancoJuego.cats.map(cat => `<div class="drop-box" onclick="evaluarCorriente(${cat.id}, ${c.categoriaId})" onmouseenter="playMarimbaHover()">${cat.nombre}</div>`).join('');
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()">← Volver</button><div class="game-active-header"><span>🗂️ Cajas</span><span>Concepto ${ronda + 1} / 5</span></div><h2 style="font-size:3.5rem; margin:45px 0; color:#34495e;">${c.titulo}</h2><p style="margin-bottom:20px; font-weight:bold;">¿A qué enfoque/categoría pertenece?</p><div class="box-container">${cajas}</div>` + obtenerManual();
      }
    }
    function evaluarCorriente(selId, corrId) {
      let catSel = bancoJuego.cats.find(c=>c.id==selId).nombre;
      let catCor = dbCategorias.find(c=>c.id==corrId).nombre;
      historialRespuestas.push({pre: bancoJuego.conceptos[ronda].titulo, res: catSel, cor: catCor, exp: "Este concepto pertenece a: " + catCor});
      if(selId == corrId) { puntajeJuego++; updatePuntajeGlobal(2); } else { updatePuntajeGlobal(-1); }
      ronda++; renderCorrientes();
    }

    // 7. AUTORES
    const dbExtraAutores = [
      { cita: "El organismo tiene una tendencia y un esfuerzo básicos: actualizarse, mantenerse y enriquecer las experiencias.", autor: "Carl Rogers" },
      { cita: "Al hombre se le puede arrebatar todo salvo una cosa: la última de las libertades humanas —la elección de la actitud personal.", autor: "Viktor Frankl" },
      { cita: "No estoy en este mundo para estar a la altura de tus expectativas, ni tú para estar a la altura de las mías.", autor: "Fritz Perls" },
      { cita: "La neurosis es siempre un sustituto de un sufrimiento legítimo.", autor: "Carl Jung" }
    ];
    function startAutores() { playMidiTheme('autores'); historialRespuestas = []; juegoActual = 'autores'; ronda = 0; puntajeJuego = 0; bancoJuego = mezclarArray(dbExtraAutores).slice(0, 4); renderAutores(); }
    function renderAutores() {
      if(ronda >= bancoJuego.length) { puntajeJuego = Math.round((puntajeJuego/4)*10); return renderFinalResult(); }
      let p = bancoJuego[ronda]; let autoresList = [...new Set(dbExtraAutores.map(a => a.autor))];
      let opciones = mezclarArray(autoresList).slice(0, 4);
      if(!opciones.includes(p.autor)) opciones[0] = p.autor; opciones = mezclarArray(opciones);
      let botones = opciones.map(o => `<button class="option-btn" onclick="evaluarAutores(this, '${escapeString(o)}', '${escapeString(p.autor)}')" onmouseenter="playMarimbaHover()">${o}</button>`).join('');
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()">← Volver</button><div class="game-active-header"><span>👤 Citas</span><span>Cita ${ronda + 1} / 4</span></div><div class="game-text-question" style="font-style:italic; text-align:center;">"${p.cita}"</div><div class="options-stack">${botones}</div>` + obtenerManual();
      }
    }
    function evaluarAutores(btn, sel, corr) {
      document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
      historialRespuestas.push({pre: bancoJuego[ronda].cita, res: sel, cor: corr, exp: "Cita perteneciente a " + corr});
      if(sel === corr) { btn.classList.add('correct'); puntajeJuego++; updatePuntajeGlobal(2); } 
      else { btn.classList.add('wrong'); updatePuntajeGlobal(-1); document.querySelectorAll('.option-btn').forEach(b => { if(b.innerText === corr) b.classList.add('correct'); }); }
      setTimeout(() => { ronda++; renderAutores(); }, 1200);
    }
  