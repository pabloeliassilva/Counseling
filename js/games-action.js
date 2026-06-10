
    // 1. BOMBARDEO CONTRARRELOJ
    let bombObj = { time: 60, score: 0, current: null };
    function startBombardeo() { playMidiTheme('hangman'); historialRespuestas = []; juegoActual = 'bombardeo'; puntajeJuego = 0; bombObj.time = 60; bombObj.score = 0; if(timerGlobal) clearInterval(timerGlobal); timerGlobal = setInterval(tickBombardeo, 1000); nextBombardeo(); }
    function tickBombardeo() { bombObj.time--; let barra = document.getElementById('bomb-bar'); if(barra) barra.style.width = (bombObj.time/60)*100 + '%'; if(bombObj.time <= 0) { clearInterval(timerGlobal); puntajeJuego = bombObj.score >= 10 ? 10 : bombObj.score; renderFinalResult(); } }
    function nextBombardeo() { let g = dbGlosario[Math.floor(Math.random()*dbGlosario.length)]; const listaTitulosGlobal = dbGlosario.map(x => x.titulo); bombObj.current = { q: g.resumen, c: g.titulo, ops: obtenerOpcionesCuatro(g.titulo, listaTitulosGlobal) }; renderBombardeo(); }
    function renderBombardeo() {
      let botones = bombObj.current.ops.map(o => `<button class="option-btn" onclick="evaluarBombardeo('${escapeString(o)}')" onmouseenter="playMarimbaHover()">${o}</button>`).join('');
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()">← Salir</button><div class="game-active-header"><span>⏱️ Bombardeo</span><span>Score: ${bombObj.score}</span></div><div class="timer-bar"><div class="timer-fill" id="bomb-bar" style="width:${(bombObj.time/60)*100}%"></div></div><div class="game-text-question">	extMuted${bombObj.current.q}</div><div class="options-stack">${botones}</div>` + obtenerManual();
      }
    }
    function evaluarBombardeo(sel) { if(sel === bombObj.current.c) { bombObj.score++; updatePuntajeGlobal(1); } else { updatePuntajeGlobal(-1); } historialRespuestas.push({pre: bombObj.current.q, res: sel, cor: bombObj.current.c, exp: "Clasificación veloz."}); nextBombardeo(); }

    // 2. INVASORES TERAPÉUTICOS (Puntaje Aislado de Alta Performance)
    let invState = {};
    const bloquesNormales = ["Juicio", "Prejuicio", "Crítica", "Censura"];
    const bloquesDuros = ["Trauma", "Resistencia", "Bloqueo", "Soberbia"];
    
    window.invKeyDown = function(e) { invState.keys[e.code] = true; if(e.code === 'Space') { e.preventDefault(); shootInv(); } };
    window.invKeyUp = function(e) { invState.keys[e.code] = false; };

    function startInvasores() {
      playMidiTheme('invasores'); historialRespuestas = []; juegoActual = 'invasores'; puntajeJuego = 0;
      invState = { playing: true, score: 0, playerX: 300, playerW: 60, playerH: 40, bullets: [], enemies: [], powerups: [], lastEnemy: 0, keys: {}, lives: 3, speedMod: 1, level: 1, weaponType: 0, weaponTimer: 0 };
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="stopInvasores()">← Salir</button><div class="game-active-header"><span>🚀 Invasores</span><span id="inv-score">Nivel: 1 | Pts: 0 | Vidas: 3</span></div><canvas id="space-canvas" class="canvas-game" width="700" height="400"></canvas><div class="space-controls"><button class="btn-space" onmousedown="invState.keys.ArrowLeft=true" onmouseup="invState.keys.ArrowLeft=false">⬅️ Izq</button><button class="btn-space btn-space-shoot" onmousedown="shootInv()">⚡ Disparar Empatía</button><button class="btn-space" onmousedown="invState.keys.ArrowRight=true" onmouseup="invState.keys.ArrowRight=false">Der ➡️</button></div>` + obtenerManual();
      }
      document.addEventListener('keydown', window.invKeyDown); document.addEventListener('keyup', window.invKeyUp);
      loopInvasores = requestAnimationFrame(updateInvasores);
    }
    function shootInv() {
        if(!invState.playing) return;
        invState.bullets.push({ x: invState.playerX + invState.playerW/2 - 2, y: 340, w: 5, h: 12, dmg: 1, color: '#f1c40f' });
    }
    function stopInvasores() { invState.playing = false; document.removeEventListener('keydown', window.invKeyDown); document.removeEventListener('keyup', window.invKeyUp); renderArcadeMenu(); }
    
    function updateInvasores() {
        if(!invState.playing) return; let canvas = document.getElementById('space-canvas'); if(!canvas) return; let ctx = canvas.getContext('2d');
        invState.level = 1 + Math.floor(invState.score / 15); invState.speedMod = 1 + ((invState.level - 1) * 0.15);
        if(invState.keys['ArrowLeft'] && invState.playerX > 0) invState.playerX -= 7;
        if(invState.keys['ArrowRight'] && invState.playerX < canvas.width - invState.playerW) invState.playerX += 7;
        invState.lastEnemy++;
        if(invState.lastEnemy > (90 / invState.speedMod)) {
            invState.enemies.push({ x: Math.random() * (canvas.width - 70), y: -25, w: 70, h: 25, text: bloquesNormales[Math.floor(Math.random() * bloquesNormales.length)], hp: 1, maxHp: 1, speedMult: 1, color: '#e74c3c' });
            invState.lastEnemy = 0;
        }
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#475569'; ctx.fillRect(invState.playerX, 360, invState.playerW, invState.playerH);
        for(let i = invState.bullets.length - 1; i >= 0; i--) { let b = invState.bullets[i]; b.y -= 8; ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.w, b.h); if(b.y < 0) invState.bullets.splice(i, 1); }
        for(let i = invState.enemies.length - 1; i >= 0; i--) {
            let e = invState.enemies[i]; e.y += 1.4 * invState.speedMod * e.speedMult;
            let hit = false;
            for(let j = invState.bullets.length - 1; j >= 0; j--) {
                let b = invState.bullets[j];
                if(b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
                    invState.score += e.maxHp; 
                    invState.enemies.splice(i, 1); invState.bullets.splice(j, 1); hit = true; break;
                }
            }
            if(hit) continue;
            if(e.y > canvas.height) { 
                invState.lives--; 
                invState.score = Math.max(0, invState.score - 2); 
                invState.enemies.splice(i, 1); 
                if(invState.lives <= 0) return endInvasores(); 
            } 
            else { ctx.fillStyle = e.color; ctx.fillRect(e.x, e.y, e.w, e.h); ctx.fillStyle = 'white'; ctx.fillText(e.text, e.x + e.w/2, e.y + 15); }
        }
        let elScore = document.getElementById('inv-score'); if(elScore) elScore.innerText = `Nivel: \${invState.level} | Pts: \${invState.score} | Vidas: \${invState.lives}`;
        loopInvasores = requestAnimationFrame(updateInvasores);
    }
    
    function endInvasores() { 
        invState.playing = false; 
        document.removeEventListener('keydown', window.invKeyDown); 
        document.removeEventListener('keyup', window.invKeyUp); 
        if(invState.score > 0) { updatePuntajeGlobal(invState.score); }
        puntajeJuego = invState.score >= 20 ? 20 : invState.score; 
        historialRespuestas.push({ pre: "Invasores", res: "Nivel " + invState.level, cor: invState.score + " pts", exp: "Derribaste barreras terapéuticas." }); 
        renderFinalResult(); 
    }

    // 3. SUPER COUNSELOR RUNNER (Puntaje Aislado de Alta Performance)
    let runState = {};
    const runEnemies = ["Consejo no pedido", "Juicio de valor", "Interrupción", "Proyección"];
    const runCoins = ["Escucha Activa", "Silencio", "Rapport"];
    
    window.runKeyDown = function(e) { if(e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jumpRunner(); } };

    function startRunner() {
      playMidiTheme('runner'); historialRespuestas = []; juegoActual = 'runner'; puntajeJuego = 0;
      runState = { playing: true, score: 0, distance: 0, p: { x: 50, y: 300, w: 40, h: 40, vy: 0, jumps: 0, invincibility: 0 }, floorY: 340, gravity: 0.7, jumpForce: -12, speed: 6.5, obstacles: [], coins: [], powerups: [], frames: 0, lives: 3 };
      const view = document.getElementById('arcade-main-view');
      if(view) {
        view.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="stopRunner()">← Salir</button><div class="game-active-header"><span>🍄 Super Runner</span><span id="run-score">Distancia: 0m | Puntos: 0 | Vidas: 3</span></div><canvas id="runner-canvas" class="canvas-game" width="700" height="400"></canvas><div class="space-controls"><button class="btn-space btn-space-shoot" style="background:#27ae60;" onmousedown="jumpRunner()">⬆️ SALTAR</button></div>` + obtenerManual();
      }
      document.addEventListener('keydown', window.runKeyDown); loopRunner = requestAnimationFrame(updateRunner);
    }
    function jumpRunner() { if(runState.p.jumps < 2) { runState.p.vy = runState.jumpForce; runState.p.jumps++; } }
    function stopRunner() { runState.playing = false; document.removeEventListener('keydown', window.runKeyDown); renderArcadeMenu(); }
    
    function updateRunner() {
      if(!runState.playing) return; let canvas = document.getElementById('runner-canvas'); if(!canvas) return; let ctx = canvas.getContext('2d');
      runState.frames++; runState.distance += runState.speed * 0.01;
      runState.p.vy += runState.gravity; runState.p.y += runState.p.vy;
      if(runState.p.y + runState.p.h >= runState.floorY) { runState.p.y = runState.floorY - runState.p.h; runState.p.vy = 0; runState.p.jumps = 0; }
      if(runState.frames % 100 === 0) { runState.obstacles.push({ x: canvas.width, y: runState.floorY - 40, w: 40, h: 40, text: runEnemies[Math.floor(Math.random() * runEnemies.length)] }); }
      ctx.fillStyle = '#e0f7fa'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#795548'; ctx.fillRect(0, runState.floorY, canvas.width, canvas.height - runState.floorY);
      ctx.fillStyle = '#2c3e50'; ctx.fillRect(runState.p.x, runState.p.y, runState.p.w, runState.p.h);
      for(let i = runState.obstacles.length - 1; i >= 0; i--) {
        let o = runState.obstacles[i]; o.x -= runState.speed; ctx.fillStyle = '#c0392b'; ctx.fillRect(o.x, o.y, o.w, o.h);
        if(runState.p.x < o.x + o.w && runState.p.x + runState.p.w > o.x && runState.p.y < o.y + o.h && runState.p.y + runState.p.h > o.y) {
          runState.lives--; 
          runState.score = Math.max(0, runState.score - 3); 
          runState.obstacles.splice(i, 1); if(runState.lives <= 0) return endRunner();
        } else if(o.x + o.w < 0) { 
          runState.score++; 
          runState.obstacles.splice(i, 1); 
        }
      }
      let elScore = document.getElementById('run-score'); if(elScore) elScore.innerText = `Distancia: \${Math.floor(runState.distance)}m | Puntos: \${runState.score} | Vidas: \${runState.lives}`;
      loopRunner = requestAnimationFrame(updateRunner);
    }
    
    function endRunner() { 
        runState.playing = false; 
        document.removeEventListener('keydown', window.runKeyDown); 
        if(runState.score > 0) { updatePuntajeGlobal(runState.score); }
        puntajeJuego = runState.score >= 20 ? 20 : runState.score; 
        historialRespuestas.push({ pre: "Runner", res: Math.floor(runState.distance) + " m", cor: runState.score + " pts", exp: "Esquivaste respuestas inadecuadas." }); 
        renderFinalResult(); 
    }
  