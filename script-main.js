// === MUSIC PLAYER ===
const bgMusic = document.getElementById('bg-music');

// Tocar música automaticamente
window.addEventListener('load', () => {
  bgMusic.volume = 0.2;
  
  const playPromise = bgMusic.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      document.querySelector('.play-pause-btn').textContent = '⏸';
    }).catch(error => {
      document.addEventListener('click', function startMusic() {
        bgMusic.play();
        document.querySelector('.play-pause-btn').textContent = '⏸';
        document.removeEventListener('click', startMusic);
      }, { once: true });
    });
  }
});

// Controle play/pause
document.querySelector('.play-pause-btn').addEventListener('click', function() {
  if (bgMusic.paused) {
    bgMusic.play();
    this.textContent = '⏸';
  } else {
    bgMusic.pause();
    this.textContent = '⏵';
  }
});

// === PARALLAX EM TODO O CONTEÚDO ===
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * -18;
  const y = (e.clientY / window.innerHeight - 0.5) * -18;
  
  document.body.style.transform = `translate(${x}px, ${y}px)`;
});

// === EFEITO HOVER AVANÇADO ===
const roomElements = document.querySelectorAll('.room-element');
const blurOverlay = document.getElementById('blurOverlay');

roomElements.forEach(element => {
  const hoverText = element.querySelector('.hover-text');
  
  element.addEventListener('mouseenter', () => {
    // Ativa blur overlay (NÃO no body)
    blurOverlay.classList.add('active');
    
    // Ativa texto glitch
    hoverText.classList.add('active');
  });
  
  element.addEventListener('mouseleave', () => {
    // Remove blur overlay
    blurOverlay.classList.remove('active');
    
    // Remove texto glitch
    hoverText.classList.remove('active');
  });
});