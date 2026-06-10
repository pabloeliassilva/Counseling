
    let puntajeGlobalTotal = 0;
    let historialRespuestas = [];
    let juegoActual = '';
    let ronda = 0;
    let puntajeJuego = 0;
    let bancoJuego = [];
    let timerGlobal = null;
    
    let modoMaraton = false;
    let indiceMaraton = 0;
    let puntajeMaraton = 0;
    let maxPuntajeMaraton = 0;
    
    let modoFlash = false;
    let flashTimerInterval = null;
    let flashTimeRestante = 60;

    const neonColors = ['#ff00ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000', '#ff9900'];
    let audioCtx = null;
    let activeOscillators = [];

    const frasesCounselor = [
      "La escucha activa es tu mejor herramienta.",
      "Confía en la tendencia actualizante.",
      "Validar las emociones abre puertas.",
      "No juzgues, comprende profundamente.",
      "La aceptación incondicional sana.",
      "Acompaña sin dirigir el camino.",
      "El silencio también es una intervención.",
      "Muestra congruencia en cada respuesta.",
      "La empatía construye puentes duraderos.",
      "El cambio ocurre en el aquí y el ahora.",
      "Cada consultante tiene su propio ritmo.",
      "El respeto profundo transforma realidades.",
      "Conectar es más importante que intervenir.",
      "La vulnerabilidad es un acto de valentía.",
      "Aceptar no es estar de acuerdo, es acoger.",
      "El autodescubrimiento sana heridas.",
      "Somos facilitadores, no salvadores.",
      "Toda emoción tiene una función legítima.",
      "La congruencia genera confianza genuina.",
      "Reflejar sentimientos es un arte clínico.",
      "El silencio terapéutico habla volumenes.",
      "No hay emociones buenas o malas.",
      "Permite que la experiencia fluya.",
      "El individuo es su mejor experto.",
      "Sostener la mirada es sostener el alma.",
      "Caminar al lado, nunca por delante.",
      "Validar es reconocer la verdad del otro.",
      "La autenticidad es la base del encuentro."
    ];

    const MARATON_JUEGOS = [
      () => startFlashcards(), () => startTrivia(1), () => startTrivia(2),
      () => startMatching(), () => startHangman(), () => startSimulador(),
      () => startEmpatia(), () => startCorrientes(), () => startAutores(),
      () => startCrucigrama(), () => startFragmentado(), () => startBombardeo(),
      () => startWordle(), () => startSopa(), () => startInvasores(), () => startRunner()
    ];

    function initAudio() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function stopMidiMusic() {
      activeOscillators.forEach(osc => { try { osc.stop(); } catch(e) {} });
      activeOscillators = [];
    }

    function playMarimbaHover() {
        initAudio(); if(!audioCtx) return;
        const t = audioCtx.currentTime;
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        let notes = [392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[Math.floor(Math.random()*notes.length)], t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3); 
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.3);
    }

    function playMidiTheme(gameString) {
      initAudio(); stopMidiMusic(); if (!audioCtx) return;
      const t = audioCtx.currentTime;
      let melody = []; let tempo = 0.25; let type = 'sine';

      switch(gameString) {
        case 'arcade_intro': melody = [523.25, 659.25, 783.99, 1046.50]; tempo = 0.12; type = 'square'; break;
        case 'flashcards': melody = [523.25, 659.25, 783.99, 1046.50]; tempo=0.18; type='triangle'; break;
        case 'trivia_1': case 'trivia_2': melody = [440, 554.37, 659.25, 440]; tempo=0.2; type='square'; break;
        case 'matching': melody = [392, 493.88, 587.33, 783.99]; tempo=0.15; break;
        case 'hangman': melody = [220, 207.65, 196, 220]; tempo=0.3; type='sawtooth'; break;
        case 'simulador': melody = [261.63, 329.63, 392.00, 523.25]; tempo=0.25; type='triangle'; break;
        case 'empatia': melody = [523.25, 659.25, 783.99, 1046.50]; tempo=0.18; break;
        case 'invasores': melody = [196, 174.61, 196, 220]; tempo=0.25; type='sawtooth'; break;
        case 'runner': melody = [261.63, 392.00, 523.25, 659.25]; tempo=0.15; type='square'; break;
        default: melody = [440, 880, 659.25]; tempo=0.2; break;
      }

      melody.forEach((freq, i) => {
        let osc1 = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc1.type = type;
        osc1.frequency.setValueAtTime(freq, t + i*tempo);
        gain.gain.setValueAtTime(0.06, t + i*tempo);
        gain.gain.setTargetAtTime(0, t + i*tempo + tempo*0.8, 0.05);
        osc1.connect(gain); gain.connect(audioCtx.destination);
        osc1.start(t + i*tempo); osc1.stop(t + i*tempo + tempo);
        activeOscillators.push(osc1);
      });
    }

    function playPhotoMidi(el) {
        initAudio(); if(!audioCtx) return;
        const t = audioCtx.currentTime;
        let osc1 = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        let bases = [261.63, 329.63, 392.00, 523.25];
        let f = bases[Math.floor(Math.random() * bases.length)];
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(f, t);
        osc1.frequency.exponentialRampToValueAtTime(f * 2, t + 0.6);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc1.connect(gain); gain.connect(audioCtx.destination);
        osc1.start(t); osc1.stop(t + 0.6);
        el.style.transform = "scale(0.95)";
        setTimeout(() => el.style.transform = "", 200);
    }

    function normalizarP(str) { return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : ''; }
    function mezclarArray(arr) { return [...arr].sort(() => Math.random() - 0.5); }
    function escapeString(str) { return str ? str.replace(/'/g, "\\'").replace(/"/g, '&quot;') : ''; }
    
    function obtenerOpcionesCuatro(correcta, pool) {
      let s = new Set([correcta]);
      while(s.size < 4 && pool.length >= 4) { s.add(pool[Math.floor(Math.random() * pool.length)]); }
      return Array.from(s).sort(() => Math.random() - 0.5);
    }

    function obtenerMensajeCounselor() { return frasesCounselor[Math.floor(Math.random() * frasesCounselor.length)]; }

    function renderDashboardHTML() {
      return `
        <div class="global-dashboard">
          <div class="dashboard-counselor">
            <span class="counselor-avatar">🧠</span>
            <span class="counselor-msg">"${obtenerMensajeCounselor()}"</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
            <div class="dashboard-score" id="ui-global-score">🏆 Global: ${puntajeGlobalTotal} pts</div>
          </div>
        </div>`;
    }

    function updatePuntajeGlobal(puntos) {
      puntajeGlobalTotal += puntos;
      const el = document.getElementById('ui-global-score');
      if(el) {
        el.innerHTML = `🏆 Global: ${puntajeGlobalTotal} pts`;
        el.style.transform = "scale(1.1)";
        setTimeout(() => { el.style.transform = "scale(1)"; }, 300);
      }
    }

    function obtenerManual() {
        const manuals = {
            flashcards: "Gira la tarjeta haciendo clic sobre ella. Evalúa tu conocimiento usando los botones inferiores.",
            trivia_1: "Lee la definición detenidamente y haz clic en el concepto que le corresponda.",
            trivia_2: "Indica si la afirmación es Verdadera o Falsa según el glosario.",
            matching: "Haz clic en un concepto y luego en su definición para emparejarlos.",
            hangman: "Adivina el concepto letra por letra. Tienes 6 vidas.",
            simulador: "Lee lo que dice el consultante y elige la intervención del Counselor más empática.",
            empatia: "Clasifica si la frase es una respuesta empática (verde) o una barrera (rojo).",
            corrientes: "Haz clic en la corriente teórica a la que pertenece el concepto.",
            autores: "Descubre qué autor célebre formuló la cita en pantalla.",
            crucigrama: "Escribe las palabras exactas para cada definición y comprueba.",
            fragmentado: "Haz clic en los fragmentos en el orden correcto para reconstruir la oración.",
            bombardeo: "Selecciona las respuestas correctas lo más rápido posible antes de que acabe el tiempo.",
            wordle: "Adivina el concepto. Verde: posición correcta. Amarillo: existe pero en otro lugar.",
            sopa: "Selecciona las letras del tablero para formar el concepto indicado en las 10 rondas.",
            invasores: "Usa Flechas o Botones Izq/Der para moverte. Dispara Empatía (Espacio) para eliminar los bloqueos.",
            runner: "Presiona Espacio o Arriba para saltar barreras y atrapar la escucha activa."
        };
        if(!manuals[juegoActual]) return "";
        return `<div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-top: 3px dashed #cbd5e1; color: #64748b; font-size: 1.1rem; text-align: left; border-radius: 12px;"><strong>📖 Instrucciones:</strong> ${manuals[juegoActual]}</div>`;
    }

    function renderArcadeMenu() {
      cancelarTimersGlobales(); modoMaraton = false; juegoActual = '';
      const arcadeGames = [
        { action: 'startBombardeo()', icon: '⏱️', name: 'Bombardeo', desc: 'Contrarreloj.' },
        { action: 'startCorrientes()', icon: '🗂️', name: 'Cajas', desc: 'Clasifica enfoques.' },
        { action: 'startAutores()', icon: '👤', name: 'Citas', desc: '¿Quién lo dijo?' },
        { action: 'startCrucigrama()', icon: '📝', name: 'Crucigrama', desc: 'Escribe la palabra.' },
        { action: 'startHangman()', icon: '🔤', name: 'El Ahorcado', desc: 'Adivina la palabra.' },
        { action: 'startMatching()', icon: '🔗', name: 'Emparejamiento', desc: 'Conecta conceptos.' },
        { action: 'startEmpatia()', icon: '⚖️', name: 'Empatía o no', desc: 'Clasifica rápido.' },
        { action: 'startFragmentado()', icon: '🧩', name: 'Fragmentado', desc: 'Reconstruye la frase.' },
        { action: 'startInvasores()', icon: '🚀', name: 'Invasores', desc: 'Destruye bloqueos.' },
        { action: 'startSimulador()', icon: '💬', name: 'Simulador', desc: 'Elige qué decir.' },
        { action: 'startSopa()', icon: '🔍', name: 'Sopa de Letras', desc: 'Encuentra conceptos.' },
        { action: 'startRunner()', icon: '🍄', name: 'Super Runner', desc: 'Salta barreras.' },
        { action: 'startFlashcards()', icon: '🃏', name: 'Tarjetas', desc: 'Tarjetas de memoria.' },
        { action: 'startTrivia(1)', icon: '❓', name: 'Trivia Clásica', desc: 'Adivina la definición.' },
        { action: 'startTrivia(2)', icon: '⏳', name: 'V o F', desc: 'Verdadero o falso.' },
        { action: 'startWordle()', icon: '🟩', name: 'Wordle', desc: 'Adivina el término.' }
      ].sort((a, b) => a.name.localeCompare(b.name, 'es'));

      let gamesHtml = arcadeGames.map(g => {
        let neonColor = neonColors[Math.floor(Math.random() * neonColors.length)];
        return `<div class="arcade-card neon-hover" style="--neon: ${neonColor}" onclick="${g.action}" onmouseenter="playMarimbaHover()"><div class="arcade-icon">${g.icon}</div><div class="arcade-name">${g.name}</div><div class="arcade-desc">${g.desc}</div></div>`;
      }).join('');
      
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `
          <h2 class="arcade-title">🕹️ COUNSELOR PLAY</h2>
          <p class="arcade-subtitle">Elige una modalidad para repasar interactivamente</p>
          <div class="arcade-top-actions">
            <div class="arcade-card neon-hover" style="border-color: #f39c12; background: #fef9e7; --neon: #f39c12;" onclick="startMaraton()">
              <div class="arcade-icon">🏃‍♂️</div><div class="arcade-name">MARATÓN DE COUNSELING</div><div class="arcade-desc">Juega las 16 modalidades de corrido.</div>
            </div>
            <div class="arcade-card neon-hover" style="border-color: #ff4757; background: #fff0f1; --neon: #ff4757;" onclick="startFlashChallenge()">
              <div class="arcade-icon">⚡</div><div class="arcade-name">DESAFÍO RANDOM FLASH</div><div class="arcade-desc">60 Segundos. Juego Aleatorio.</div>
            </div>
          </div>
          <div class="arcade-grid-4x4">${gamesHtml}</div>`;
      }
    }

    function startMaraton() { modoMaraton = true; indiceMaraton = 0; puntajeMaraton = 0; maxPuntajeMaraton = 0; MARATON_JUEGOS[0](); }

    function startFlashChallenge() {
      modoFlash = true; flashTimeRestante = 60;
      let randIndex = Math.floor(Math.random() * MARATON_JUEGOS.length);
      let flashUI = document.createElement('div');
      flashUI.id = 'flash-timer-ui'; flashUI.className = 'flash-timer-overlay'; flashUI.innerText = "⏱️ 60s";
      document.body.appendChild(flashUI);
      MARATON_JUEGOS[randIndex]();

      flashTimerInterval = setInterval(() => {
        flashTimeRestante--;
        let ui = document.getElementById('flash-timer-ui');
        if(ui) ui.innerText = `⏱️ ${flashTimeRestante}s`;
        if(flashTimeRestante <= 0) {
            clearInterval(flashTimerInterval); modoFlash = false;
            if(ui) ui.remove(); renderFinalResult();
        }
      }, 1000);
    }

    function renderFinalResult() {
      let mensaje = ""; let consejo = ""; let scoreMaximo = 10;
      if(juegoActual === 'invasores' || juegoActual === 'runner') scoreMaximo = 20;

      if (puntajeJuego >= (scoreMaximo * 0.9)) { mensaje = "¡Perfección Absoluta! 🏆"; consejo = "Dominio impecable del glosario."; } 
      else if (puntajeJuego >= (scoreMaximo * 0.6)) { mensaje = "¡Excelente Trabajo! 🌟"; consejo = "Demuestras gran fluidez conceptual."; } 
      else { mensaje = "¡A Seguir Estudiando! 📚"; consejo = "Utiliza el panel para profundizar cada concepto."; }

      let htmlRespuestas = `<div style="text-align:left; margin-top: 25px; max-height: 250px; overflow-y: auto; padding: 20px; background: white; border-radius: 12px; border: 2px solid #e2e8f0;">
        <h3 style="color:#9b59b6; margin-bottom:15px; font-size:1.2rem;">📝 Resumen de Respuestas:</h3>
        ${historialRespuestas.map(r => `
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #cbd5e1; font-size: 0.95rem;">
                <strong>Contexto:</strong> <span>${r.pre}</span> <br>
                <strong>Tú:</strong> <span style="color:${r.res === r.cor || ['Sí','Correcto','Emparejado','Empatía'].includes(r.res) ? '#2ecc71':'#e74c3c'}">${r.res}</span> <br>
                <strong>Esperado:</strong> <span style="color:#2ecc71">${r.cor}</span> <br>
                <em style="font-size: 0.85rem; color: #64748b; display:block; margin-top:6px;">💡 ${r.exp}</em>
            </div>`).join('')}</div>`;

      let btnAction = `<button class="game-play-btn" onclick="renderArcadeMenu()"> Volver al Menú </button>`;
      if(modoMaraton && !modoFlash) {
          puntajeMaraton += puntajeJuego; maxPuntajeMaraton += scoreMaximo; indiceMaraton++;
          if(indiceMaraton < MARATON_JUEGOS.length) {
              btnAction = `<button class="game-play-btn" style="background:#2ecc71;" onclick="MARATON_JUEGOS[${indiceMaraton}]()">Siguiente Juego ➔</button>
                           <div style="margin-top:20px; font-weight:700;">Progreso: ${indiceMaraton} de 16 | Acumulado: ${puntajeMaraton}</div>`;
          } else {
              btnAction = `<button class="game-play-btn" style="background:#f1c40f; color:#333;" onclick="finalizarMaraton()">🏆 Ver Final de Maratón</button>`;
          }
      }

      const view = document.getElementById('arcade-main-view');
      if(view) view.innerHTML = renderDashboardHTML() + `<div class="result-box"><h2>${mensaje}</h2><div class="result-score">${puntajeJuego} / ${scoreMaximo}</div><p>${consejo}</p>${htmlRespuestas}<br>${btnAction}</div>` + obtenerManual();
    }

    function finalizarMaraton() {
        modoMaraton = false;
        const view = document.getElementById('arcade-main-view');
        if(view) view.innerHTML = renderDashboardHTML() + `<div class="result-box"><h2>🏆 ¡Maratón Completada! 🏆</h2><div class="result-score">${puntajeMaraton} / ${maxPuntajeMaraton}</div><p>¡Increíble esfuerzo! Has recorrido las 16 modalidades del Arcade.</p><button class="game-play-btn" onclick="renderArcadeMenu()">Volver</button></div>`;
    }

    function cancelarTimersGlobales() {
      if(timerGlobal) clearInterval(timerGlobal);
      if(typeof loopInvasores !== 'undefined' && loopInvasores) cancelAnimationFrame(loopInvasores);
      if(typeof loopRunner !== 'undefined' && loopRunner) cancelAnimationFrame(loopRunner);
      if(flashTimerInterval) clearInterval(flashTimerInterval);
      stopMidiMusic(); modoFlash = false;
      let ui = document.getElementById('flash-timer-ui'); if(ui) ui.remove();
    }

    setInterval(() => {
      const msgs = document.querySelectorAll('.counselor-msg');
      msgs.forEach(msg => {
        msg.style.opacity = 0;
        setTimeout(() => { msg.innerText = '"' + obtenerMensajeCounselor() + '"'; msg.style.opacity = 1; }, 400);
      });
    }, 15000);
  