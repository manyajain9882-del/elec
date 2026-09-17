/**
 * ELECTO – Interactive EVM & VVPAT Simulator Engine
 * Realistic educational demonstration:
 * - Balloting Unit (BU) with tactile buttons, candidate LEDs, braille dots
 * - VVPAT window with 7-second paper slip view & cut-drop sequence
 * - Control Unit (CU) status lights & vote counter
 * - Web Audio authentic beep integration
 * - Indelible ink application animation
 * - Animated Counting Hall tally & winner declaration
 * - Confetti celebration & Canvas certificate export
 */

class ElectionSimulator {
  constructor() {
    this.candidates = ELECTO_DATA.fictionalCandidates;
    this.isBusy = false;
    this.totalVotes = 0;
    this.voteCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.userHasVoted = false;
    this.selectedCandidate = null;
    this.countingSimulated = false;
  }

  init() {
    this.renderBallotingUnit();
    this.setupEventListeners();
    this.initConfetti();
  }

  renderBallotingUnit() {
    const listContainer = document.getElementById('bu-candidates-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    this.candidates.forEach(cand => {
      const row = document.createElement('div');
      row.className = 'bu-candidate-row';
      row.id = `candidate-row-${cand.id}`;

      row.innerHTML = `
        <div class="bu-candidate-serial">${cand.serialNo}</div>
        <div class="bu-candidate-info">
          <div class="bu-candidate-name">${cand.name}</div>
          <div class="bu-candidate-party">${cand.party}</div>
        </div>
        <div class="bu-candidate-symbol" title="${cand.symbolName}">${cand.symbol}</div>
        <div class="bu-candidate-led" id="cand-led-${cand.id}" title="Voting LED"></div>
        <button type="button" class="bu-vote-btn" data-candidate-id="${cand.id}" aria-label="Vote for ${cand.name}">
          <div class="bu-vote-arrow"></div>
        </button>
      `;

      listContainer.appendChild(row);
    });
  }

  setupEventListeners() {
    const listContainer = document.getElementById('bu-candidates-list');
    if (listContainer) {
      listContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.bu-vote-btn');
        if (btn) {
          const candId = parseInt(btn.getAttribute('data-candidate-id'), 10);
          this.castVote(candId);
        }
      });
    }

    const countBtn = document.getElementById('sim-start-counting-btn');
    if (countBtn) {
      countBtn.addEventListener('click', () => this.simulateCounting());
    }

    const resetBtn = document.getElementById('sim-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetSimulation());
    }

    const downloadCertBtn = document.getElementById('download-cert-btn');
    if (downloadCertBtn) {
      downloadCertBtn.addEventListener('click', () => this.generateAndDownloadCertificate());
    }

    const certNameInput = document.getElementById('cert-name-input');
    if (certNameInput) {
      certNameInput.addEventListener('input', (e) => {
        const namePreview = document.getElementById('cert-name-display');
        if (namePreview) {
          namePreview.textContent = e.target.value.trim() || 'Informed Indian Citizen';
        }
      });
    }
  }

  castVote(candidateId) {
    if (this.isBusy) {
      this.showToast("⚠️ EVM is currently recording. Please wait for the long confirmation beep to finish.");
      return;
    }

    const candidate = this.candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    this.isBusy = true;
    this.selectedCandidate = candidate;

    // 1. Tactile Key Click & Button Pressed state
    window.soundEngine.playClick();
    const voteBtn = document.querySelector(`.bu-vote-btn[data-candidate-id="${candidateId}"]`);
    if (voteBtn) voteBtn.classList.add('pressed');

    // 2. Control Unit & Candidate LED Indicators
    const cuLed = document.getElementById('cu-status-led');
    const cuStatusText = document.getElementById('cu-status-text');
    if (cuLed) cuLed.className = 'sim-led-dot busy';
    if (cuStatusText) cuStatusText.textContent = 'EVM CU: BUSY (RECORDING VOTE...)';

    const candLed = document.getElementById(`cand-led-${candidateId}`);
    if (candLed) candLed.classList.add('active');

    // 3. VVPAT Window Backlight Turn ON
    const vvpatFrame = document.getElementById('vvpat-frame');
    if (vvpatFrame) vvpatFrame.classList.add('illuminated');

    // 4. Generate VVPAT Paper Slip Details
    const slip = document.getElementById('vvpat-slip');
    if (slip) {
      slip.className = 'vvpat-paper-slip';
      document.getElementById('slip-serial').textContent = candidate.serialNo;
      document.getElementById('slip-name').textContent = candidate.name;
      document.getElementById('slip-symbol').textContent = candidate.symbol;

      setTimeout(() => {
        slip.classList.add('visible');
      }, 100);
    }

    // 5. Play the Authentic EVM Beep (2.5s)
    setTimeout(() => {
      window.soundEngine.playEvmBeep(2.5);
    }, 400);

    // 6. Indelible Ink Mark on Voter Finger
    setTimeout(() => {
      const inkSpot = document.getElementById('digital-ink-spot');
      if (inkSpot) inkSpot.classList.add('marked');
      const inkStatus = document.getElementById('ink-status-text');
      if (inkStatus) inkStatus.textContent = "Indelible Ink Applied (Silver Nitrate stain verified)";
    }, 1200);

    // 7. VVPAT 7-Second Rule Display Countdown
    let secondsLeft = 7;
    const timerNotice = document.getElementById('vvpat-timer-display');
    if (timerNotice) timerNotice.textContent = `${secondsLeft}s`;

    const countdownInterval = setInterval(() => {
      secondsLeft -= 1;
      if (timerNotice && secondsLeft >= 0) {
        timerNotice.textContent = `${secondsLeft}s`;
      }
      if (secondsLeft <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    // 8. At exactly 7 seconds: Cut and drop paper slip into sealed box
    setTimeout(() => {
      if (slip) slip.classList.add('dropped');

      this.totalVotes += 1;
      this.voteCounts[candidateId] += 1;
      this.userHasVoted = true;

      const totalDisplay = document.getElementById('cu-total-votes-display');
      if (totalDisplay) totalDisplay.textContent = this.totalVotes;

      if (vvpatFrame) vvpatFrame.classList.remove('illuminated');
      if (candLed) candLed.classList.remove('active');
      if (voteBtn) voteBtn.classList.remove('pressed');

      if (cuLed) cuLed.className = 'sim-led-dot';
      if (cuStatusText) cuStatusText.textContent = 'EVM CU: READY FOR NEXT VOTER';
      if (timerNotice) timerNotice.textContent = '7s';

      this.isBusy = false;

      if (window.appCoordinator) {
        window.appCoordinator.unlockBadge('master-voter');
        window.appCoordinator.addProgress(25);
      }

      this.showToast(`✅ Vote successfully verified by VVPAT audit trail for ${candidate.name}!`);

      const countSection = document.getElementById('sim-counting-station');
      if (countSection) {
        countSection.style.display = 'block';
        countSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 7000);
  }

  simulateCounting() {
    if (this.countingSimulated) {
      this.showToast("ℹ️ Counting already simulated. Click 'Reset EVM' to run again.");
      return;
    }
    this.countingSimulated = true;

    const simulatedAdditions = {
      1: Math.floor(Math.random() * 300) + 1200,
      2: Math.floor(Math.random() * 250) + 1350,
      3: Math.floor(Math.random() * 200) + 900,
      4: Math.floor(Math.random() * 200) + 1050,
      5: Math.floor(Math.random() * 50) + 80
    };

    const finalCounts = {};
    let grandTotal = 0;
    this.candidates.forEach(c => {
      finalCounts[c.id] = (this.voteCounts[c.id] || 0) + simulatedAdditions[c.id];
      grandTotal += finalCounts[c.id];
    });

    const countingContainer = document.getElementById('counting-bars-container');
    if (!countingContainer) return;
    countingContainer.innerHTML = '';

    let maxVotes = -1;
    let winnerCand = null;
    this.candidates.forEach(c => {
      if (c.id !== 5 && finalCounts[c.id] > maxVotes) {
        maxVotes = finalCounts[c.id];
        winnerCand = c;
      }
    });

    this.candidates.forEach(cand => {
      const isWinner = winnerCand && cand.id === winnerCand.id;
      const row = document.createElement('div');
      row.className = `tally-candidate-row ${isWinner ? 'winner' : ''}`;
      row.innerHTML = `
        <div class="tally-meta">
          <span>${cand.serialNo}. ${cand.name} (${cand.symbol} ${cand.party}) ${isWinner ? '🏆 LEADING / ELECTED' : ''}</span>
          <span id="tally-count-${cand.id}">0 votes (0%)</span>
        </div>
        <div class="tally-bar-track">
          <div class="tally-bar-fill" id="tally-bar-${cand.id}"></div>
        </div>
      `;
      countingContainer.appendChild(row);
    });

    this.showToast("📊 Decrypting Control Units... Counting Round 1 & Round 2");
    setTimeout(() => {
      this.candidates.forEach(cand => {
        const votes = finalCounts[cand.id];
        const pct = ((votes / grandTotal) * 100).toFixed(1);
        const bar = document.getElementById(`tally-bar-${cand.id}`);
        const countTxt = document.getElementById(`tally-count-${cand.id}`);
        if (bar) bar.style.width = `${pct}%`;
        if (countTxt) countTxt.textContent = `${votes.toLocaleString()} votes (${pct}%)`;
      });

      window.soundEngine.playVictoryChime();
      this.triggerConfetti();

      const winnerNotice = document.getElementById('winner-declaration-box');
      if (winnerNotice && winnerCand) {
        winnerNotice.style.display = 'block';
        winnerNotice.innerHTML = `
          <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">🎉 <strong>FORM 21C DECLARATION OF RESULT</strong></div>
          <div style="font-size: 1.1rem; color: #f8fafc;">
            Candidate <strong>${winnerCand.name}</strong> (${winnerCand.party} ${winnerCand.symbol}) is duly declared elected by a plurality of <strong>${maxVotes.toLocaleString()} votes</strong>!
          </div>
          <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.5rem;">
            Mandatory 5 VVPAT paper audit trail recount conducted: 100% electronic match confirmed.
          </div>
        `;
      }

      const certSection = document.getElementById('sim-certificate-section');
      if (certSection) {
        certSection.style.display = 'block';
        certSection.scrollIntoView({ behavior: 'smooth' });
      }

      if (window.appCoordinator) {
        window.appCoordinator.unlockBadge('democracy-champion');
        window.appCoordinator.addProgress(25);
      }
    }, 1200);
  }

  generateAndDownloadCertificate() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    const nameInput = document.getElementById('cert-name-input');
    const recipientName = (nameInput ? nameInput.value.trim() : '') || 'Informed Indian Citizen';

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 800);
    bgGrad.addColorStop(0, '#0a1226');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 800);

    // Decorative Tricolor Borders
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#f97316';
    ctx.strokeRect(30, 30, 1140, 740);

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(48, 48, 1104, 704);

    ctx.lineWidth = 8;
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(60, 60, 1080, 680);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
    ctx.strokeRect(80, 80, 1040, 640);

    // Header & Titles
    ctx.textAlign = 'center';
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 22px "Space Grotesk", sans-serif';
    ctx.fillText('ELECTO – ELECTION AWARENESS & CIVIC EMPOWERMENT', 600, 140);

    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 44px "Space Grotesk", sans-serif';
    ctx.fillText('CERTIFICATE OF CIVIC LITERACY', 600, 200);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('This is to certify that', 600, 255);

    // Recipient Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px "Space Grotesk", sans-serif';
    ctx.fillText(recipientName, 600, 320);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(350, 340);
    ctx.lineTo(850, 340);
    ctx.stroke();

    // Body Citation
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('has demonstrated exemplary knowledge of the democratic electoral process, successfully', 600, 390);
    ctx.fillText('completed the EVM & VVPAT paper audit simulation, verified election legal frameworks under', 600, 425);
    ctx.fillText('the Conduct of Elections Rules 1961, and pledged to be an informed, vigilant voter.', 600, 460);

    // Gold Seal
    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 560, 52, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('VERIFIED CITIZEN', 600, 555);
    ctx.fillText('DEMOCRACY FIRST', 600, 575);
    ctx.restore();

    // Signatures & Date
    const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px sans-serif';
    ctx.fillText(`Date: ${today}`, 120, 670);
    ctx.fillText('Platform: electo.civic.in', 120, 695);

    ctx.textAlign = 'right';
    ctx.fillText('ELECTO Civic Advisory Board', 1080, 670);
    ctx.fillStyle = '#10b981';
    ctx.fillText('Status: Certified Informed First-Time Voter', 1080, 695);

    // Trigger PNG Download
    const link = document.createElement('a');
    link.download = `ELECTO_Civic_Certificate_${recipientName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    this.showToast('📥 Certificate downloaded successfully!');
  }

  resetSimulation() {
    this.isBusy = false;
    this.totalVotes = 0;
    this.voteCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.userHasVoted = false;
    this.selectedCandidate = null;
    this.countingSimulated = false;

    const cuLed = document.getElementById('cu-status-led');
    const cuStatusText = document.getElementById('cu-status-text');
    const totalDisplay = document.getElementById('cu-total-votes-display');
    const inkSpot = document.getElementById('digital-ink-spot');
    const inkStatus = document.getElementById('ink-status-text');
    const slip = document.getElementById('vvpat-slip');
    const countSection = document.getElementById('sim-counting-station');
    const certSection = document.getElementById('sim-certificate-section');
    const winnerNotice = document.getElementById('winner-declaration-box');

    if (cuLed) cuLed.className = 'sim-led-dot';
    if (cuStatusText) cuStatusText.textContent = 'EVM CU: READY';
    if (totalDisplay) totalDisplay.textContent = '0';
    if (inkSpot) inkSpot.className = 'ink-spot';
    if (inkStatus) inkStatus.textContent = 'Voter finger uninked (Ready for Polling Officer verification)';
    if (slip) slip.className = 'vvpat-paper-slip';
    if (countSection) countSection.style.display = 'none';
    if (certSection) certSection.style.display = 'none';
    if (winnerNotice) winnerNotice.style.display = 'none';

    document.querySelectorAll('.bu-candidate-led').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.bu-vote-btn').forEach(b => b.classList.remove('pressed'));

    this.showToast('🔄 Simulator reset to initial state.');
  }

  showToast(message) {
    if (window.appCoordinator && window.appCoordinator.showToast) {
      window.appCoordinator.showToast(message);
    }
  }

  initConfetti() {
    this.confettiCanvas = document.getElementById('confetti-canvas');
    if (!this.confettiCanvas) return;
    this.confettiCtx = this.confettiCanvas.getContext('2d');
    this.resizeConfetti();
    window.addEventListener('resize', () => this.resizeConfetti());
  }

  resizeConfetti() {
    if (this.confettiCanvas) {
      this.confettiCanvas.width = window.innerWidth;
      this.confettiCanvas.height = window.innerHeight;
    }
  }

  triggerConfetti() {
    if (!this.confettiCanvas || !this.confettiCtx) return;
    const ctx = this.confettiCtx;
    const count = 150;
    const particles = [];
    const colors = ['#f97316', '#ffffff', '#10b981', '#3b82f6', '#06b6d4', '#eab308'];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 400,
        y: window.innerHeight * 0.4,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 1.2) * 14,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let frames = 0;
    const render = () => {
      ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
      let alive = 0;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.rotation += p.vRot;
        if (frames > 40) p.opacity -= 0.015;

        if (p.opacity > 0) {
          alive++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      frames++;
      if (alive > 0 && frames < 180) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
      }
    };
    render();
  }
}

window.ElectionSimulator = ElectionSimulator;