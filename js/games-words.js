
    // 1. EL AHORCADO
    let hangWordObj = {};
    function startHangman() { playMidiTheme('hangman'); historialRespuestas = []; juegoActual = 'hangman'; ronda = 0; puntajeJuego = 0; subContadorCorrectas = 0; bancoJuego = mezclarArray(dbGlosario.filter(g => g.titulo.length > 3 && g.titulo.length < 25)).slice(0, 3); startHangmanWord(); }
    function startHangmanWord() {
      if(ronda >= 3) {
        puntajeJuego = Math.round((subContadorCorrectas / 3) * 10);
        return renderFinalResult();
      }
      let c = bancoJuego[ronda]; let real = c.titulo.toUpperCase(); let oculta = '';
      for(let i=0; i<real.length; i++) oculta += /[A-ZÁÉÍÓÚÜÑ]/.test(real[i]) ? '_' : real[i];
      hangWordObj = { real, oculta, vidas: 6, usadas: [], pista: c.resumen }; renderHangmanBoard();
    }
    function renderHangmanBoard() {
      let tHtml = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split('').map(l => `<button class="hang-letter ${hangWordObj.usadas.includes(l)?'used':''}" ${hangWordObj.usadas.includes(l)?'disabled':`onclick="guessHangmanLetter('${l}')"`} style="padding:12px 18px; margin:4px; font-weight:bold; cursor:pointer;" onmouseenter="playMarimbaHover()">${l}</button>`).join('');
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()">← Volver</button><div class="game-active-header"><span>🔤 Ahorcado</span><span>Palabra ${ronda+1}/3 | Vidas: ${hangWordObj.vidas} ❤️</span></div><div class="game-text-question"><b>Pista:</b> "${hangWordObj.pista}"</div><div style="font-family:monospace; font-size:3rem; letter-spacing:10px; margin:35px 0; color:#9b59b6; font-weight:bold;">${hangWordObj.oculta}</div><div style="display:flex; flex-wrap:wrap; gap:5px; justify-content:center; max-width:600px; margin:0 auto;">${tHtml}</div>` + obtenerManual();
      }
    }
    function guessHangmanLetter(l) {
      hangWordObj.usadas.push(l); let lN = normalizarP(l);
      if(normalizarP(hangWordObj.real).includes(lN)) {
        let nO = '';
        for(let i=0; i<hangWordObj.real.length; i++) nO += normalizarP(hangWordObj.real[i]) === lN ? hangWordObj.real[i] : hangWordObj.oculta[i];
        hangWordObj.oculta = nO; updatePuntajeGlobal(1);
        if(!nO.includes('_')) { 
          historialRespuestas.push({pre: "Palabra Oculta", res: "Descubierta", cor: hangWordObj.real, exp: hangWordObj.pista}); 
          subContadorCorrectas++;
          updatePuntajeGlobal(2); ronda++; setTimeout(startHangmanWord, 1000); 
        }
      } else {
        hangWordObj.vidas--; updatePuntajeGlobal(-1);
        if(hangWordObj.vidas<=0) { historialRespuestas.push({pre: "Palabra Oculta", res: "Fallida", cor: hangWordObj.real, exp: hangWordObj.pista}); ronda++; setTimeout(startHangmanWord, 1500); }
      }
      renderHangmanBoard();
    }

    // 2. CRUCIGRAMA LINEAL
    let cruciObj = [];
    function startCrucigrama() { playMidiTheme('arcade_intro'); historialRespuestas = []; juegoActual = 'crucigrama'; puntajeJuego = 0; let validos = mezclarArray(dbGlosario.filter(g => g.titulo.length > 3 && g.titulo.length < 12 && !g.titulo.includes(' '))).slice(0, 5); cruciObj = validos.map(g => ({ t: g.titulo, res: g.resumen.substring(0,80)+"...", val: '' })); renderCrucigrama(); }
    function renderCrucigrama() {
      let inputs = cruciObj.map((c, i) => `<div class="cross-row"><div class="cross-clue"> center${i+1}. center${c.res}</div><input type="text" class="cross-input" id="cruci_center${i}" maxlength="center${c.t.length}" placeholder="center${c.t.length} letras" value="center${c.val}"></div>`).join('');
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()">← Volver</button><div class="game-active-header"><span>📝 Crucigrama</span><span>5 Palabras</span></div>${inputs}<button class="game-play-btn" style="margin-top:25px;" onclick="checkCrucigrama()">Comprobar Respuestas</button>` + obtenerManual();
      }
    }
    function checkCrucigrama() {
      puntajeJuego = 0; historialRespuestas = [];
      cruciObj.forEach((c, i) => {
        let el = document.getElementById('cruci_'+i);
        if(el) {
          c.val = el.value.toUpperCase();
          if(normalizarP(c.val) === normalizarP(c.t).toUpperCase()) { puntajeJuego += 2; updatePuntajeGlobal(2); el.style.borderColor = '#2ecc71'; el.style.backgroundColor = '#e8f5e9'; el.disabled = true; }
          else { el.style.borderColor = '#e74c3c'; updatePuntajeGlobal(-1); }
          historialRespuestas.push({pre: c.res, res: c.val || "Vacío", cor: c.t, exp: "Definición de " + c.t});
        }
      });
      setTimeout(renderFinalResult, 1500); 
    }

    // 3. CONCEPTO FRAGMENTADO
    let fragObj = { real: "", arr: [], sel: [] };
    function startFragmentado() { playMidiTheme('arcade_intro'); historialRespuestas = []; juegoActual = 'fragmentado'; ronda = 0; puntajeJuego = 0; bancoJuego = mezclarArray(dbGlosario.filter(g => g.resumen.length > 20 && g.resumen.length < 100)).slice(0, 3); nextFragmentado(); }
    function nextFragmentado() {
      if(ronda >= bancoJuego.length) { puntajeJuego = Math.round((puntajeJuego/3)*10); return renderFinalResult(); }
      let c = bancoJuego[ronda]; fragObj.real = c.resumen; fragObj.arr = mezclarArray(c.resumen.split(' ')); fragObj.sel = []; renderFragmentado();
    }
    function renderFragmentado() {
      let fHtml = fragObj.arr.map((w, i) => { let isUsed = fragObj.sel.includes(i); return `<div class="frag-word center${isUsed?'used':''}" center${isUsed?'':`onclick="clickFrag(center${i})"`} onmouseenter="playMarimbaHover()">center${w}</div>`; }).join('');
      let currentSentence = fragObj.sel.map(idx => fragObj.arr[idx]).join(' ');
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()">← Volver</button><div class="game-active-header"><span>🧩 Fragmentado</span><span>Frase ${ronda + 1} / 3</span></div><h3>${bancoJuego[ronda].titulo}</h3><div style="min-height:70px; font-size:1.2rem; font-style:italic; margin:20px 0; padding:20px; background:white; border-radius:12px; border:2px solid #e2e8f0;">${currentSentence}</div><div class="frag-container">${fHtml}</div><button class="game-back-menu" onclick="fragObj.sel=[]; renderFragmentado()">↻ Limpiar Selección</button>` + obtenerManual();
      }
      if(fragObj.sel.length === fragObj.arr.length && fragObj.arr.length > 0) {
        if(currentSentence === fragObj.real) { puntajeJuego++; updatePuntajeGlobal(3); historialRespuestas.push({pre: bancoJuego[ronda].titulo, res: "Correcto", cor: fragObj.real, exp: "Frase ensamblada perfectamente."}); ronda++; nextFragmentado(); }         else { updatePuntajeGlobal(-1); historialRespuestas.push({pre: bancoJuego[ronda].titulo, res: "Incorrecto", cor: fragObj.real, exp: "El orden preciso importa."}); ronda++; nextFragmentado(); }
      }
    }
    function clickFrag(idx) { fragObj.sel.push(idx); renderFragmentado(); }

    // 4. WORDLE CLÍNICO
    let wObj = { palabra: '', intentos: 0, max: 6, historial: [] };
    function startWordle() { playMidiTheme('arcade_intro'); historialRespuestas = []; juegoActual = 'wordle'; puntajeJuego = 0; let cand = dbGlosario.filter(g => g.titulo.length >= 4 && g.titulo.length <= 7 && !g.titulo.includes(' ')); if(!cand.length) cand = [{titulo: "TERAPIA"}]; wObj.palabra = normalizarP(cand[Math.floor(Math.random() * cand.length)].titulo).toUpperCase(); wObj.intentos = 0; wObj.historial = []; renderWordleBoard(); }
    function renderWordleBoard() {
      let histHtml = wObj.historial.map(h => `<div style="display:flex;gap:10px;justify-content:center;margin-bottom:10px;">center${h.split('').map((letra, i) => { let color = '#cbd5e1'; if(wObj.palabra[i] === letra) color = '#2ecc71'; else if(wObj.palabra.includes(letra)) color = '#f1c40f'; return `<span style="width:50px;height:50px;display:flex;align-items:center;justify-content:center;background:center${color};color:white;font-weight:900;font-size:1.6rem;border-radius:8px;">center${letra}</span>`}).join('')}</div>`).join('');
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()">← Volver</button><div class="game-active-header"><span>🟩 Wordle Clínico</span><span>Intentos: ${wObj.intentos}/6</span></div><p>Palabra de <b>${wObj.palabra.length} letras</b>.</p><div style="margin:30px 0;">center${histHtml}</div><input type="text" id="w-input" maxlength="center${wObj.palabra.length}" style="text-transform:uppercase;padding:15px;font-size:1.6rem;width:280px;text-align:center;font-weight:bold;"><br /><button class="game-play-btn" onclick="checkWordle()" style="margin-top:25px;">Comprobar Palabra</button>` + obtenerManual();
      }
    }
    function checkWordle() {
      let el = document.getElementById('w-input'); if(!el) return;
      let intento = normalizarP(el.value).toUpperCase();
      if(intento.length !== wObj.palabra.length) return;
      wObj.historial.push(intento); wObj.intentos++;
      if(intento === wObj.palabra) { puntajeJuego = 10; updatePuntajeGlobal(10); historialRespuestas.push({pre: "Wordle", res: intento, cor: wObj.palabra, exp: "¡Adivinaste!"}); return renderFinalResult(); }
      updatePuntajeGlobal(-1);
      if(wObj.intentos >= wObj.max) { historialRespuestas.push({pre: "Wordle", res: intento, cor: wObj.palabra, exp: "Sin intentos."}); return renderFinalResult(); }
      renderWordleBoard();
    }

    // 5. SOPA DE LETRAS
    let slObj = { grid: [], word: '', coords: [], seleccionadas: [], round: 0, max: 10, time: 0 };
    function startSopa() { playMidiTheme('matching'); historialRespuestas = []; juegoActual = 'sopa'; puntajeJuego = 0; slObj = { grid: [], word: '', coords: [], seleccionadas: [], round: 0, max: 10, time: 0 }; if(timerGlobal) clearInterval(timerGlobal); timerGlobal = setInterval(() => { if(juegoActual === 'sopa') { slObj.time++; let elTime = document.getElementById('sopa-time'); if(elTime) elTime.innerText = slObj.time + "s"; } }, 1000); nextSopa(); }
    function nextSopa() {
      if(slObj.round >= slObj.max) {
        if(timerGlobal) clearInterval(timerGlobal);
        if(slObj.time <= 60) puntajeJuego = 10; else if(slObj.time <= 110) puntajeJuego = 6; else puntajeJuego = 2;
        updatePuntajeGlobal(puntajeJuego); historialRespuestas.push({pre: "Sopa de Letras", res: slObj.time + " s", cor: "Rápido (< 60s)", exp: "Completaste las 10 rondas estructurales."});
        return renderFinalResult();
      }
      let cands = dbGlosario.filter(g => g.titulo.length >= 4 && g.titulo.length <= 8 && !g.titulo.includes(' '));
      if(!cands.length) cands = [{titulo: "AYUDA"}]; let cand = cands[Math.floor(Math.random() * cands.length)];
      slObj.word = normalizarP(cand.titulo).toUpperCase(); slObj.seleccionadas = []; slObj.coords = [];
      let gridSize = 8; slObj.grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
      let placed = false; let safety = 0;
      while(!placed && safety < 100) {
        safety++; let dir = Math.floor(Math.random() * 3); let r = Math.floor(Math.random() * gridSize); let c = Math.floor(Math.random() * gridSize); let can = true; let tempCoords = [];
        for(let i = 0; i < slObj.word.length; i++) {
          let nr = r + (dir === 1 || dir === 2 ? i : 0); let nc = c + (dir === 0 || dir === 2 ? i : 0);
          if(nr >= gridSize || nc >= gridSize) { can = false; break; }
          tempCoords.push({r: nr, c: nc});
        }
        if(can) { tempCoords.forEach((pos, i) => { slObj.grid[pos.r][pos.c] = slObj.word[i]; }); slObj.coords = tempCoords; placed = true; }
      }
      let letT = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for(let r=0; r<gridSize; r++) { for(let c=0; c<gridSize; c++) { if(slObj.grid[r][c] === '') slObj.grid[r][c] = letT.charAt(Math.floor(Math.random() * letT.length)); } }
      renderSopa();
    }
    function renderSopa() {
      let hG = '<div style="display:grid;grid-template-columns:repeat(8,45px);gap:5px;justify-content:center;margin:30px auto;">';
      for(let r=0; r<8; r++) { for(let c=0; c<8; c++) { let isS = slObj.seleccionadas.some(s => s.r === r && s.c === c); hG += `<div onclick="clickSopa(center${r},center${c})" style="width:45px;height:45px;display:flex;align-items:center;justify-content:center;background:center${isS?'#9b59b6':'#fff'};color:center${isS?'white':'#333'};border:2px solid #cbd5e1;cursor:pointer;font-weight:900;" onmouseenter="playMarimbaHover()">center${slObj.grid[r][c]}</div>`; } }
      hG += '</div>';
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()">← Volver</button><div class="game-active-header"><span>🔍 Sopa</span><span>Ronda center${slObj.round + 1} / center${slObj.max} | ⏱️ <span id="sopa-time">center${slObj.time}s</span></span></div><p>Encuentra: <b style="color:#9b59b6; letter-spacing:3px;">center${slObj.word}</b></p>center${hG}<button class="game-play-btn" onclick="checkSopa()">Verificar</button>` + obtenerManual();
      }
    }
    function clickSopa(r, c) { let idx = slObj.seleccionadas.findIndex(s => s.r === r && s.c === c); if(idx >= 0) slObj.seleccionadas.splice(idx, 1); else slObj.seleccionadas.push({r, c}); renderSopa(); }
    function checkSopa() {
      if(slObj.seleccionadas.length === slObj.coords.length) {
         let matchCount = 0; slObj.seleccionadas.forEach(sel => { if(slObj.coords.some(coord => coord.r === sel.r && coord.c === sel.c)) matchCount++; });
         if(matchCount === slObj.coords.length) { slObj.round++; updatePuntajeGlobal(1); nextSopa(); return; }
      }
      updatePuntajeGlobal(-1); slObj.seleccionadas = []; renderSopa();
    }
  