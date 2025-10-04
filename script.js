const heart = document.getElementById('heart');
const heartLink = document.getElementById('heart-link');
const beatSound = document.getElementById('heartbeat');
const bgMusic = document.getElementById('bg-music');

let beatLoop;

// === Background music tries to play automatically ===
window.addEventListener('load', () => {
  bgMusic.volume = 0.2;
  
  // Try to play immediately
  const playPromise = bgMusic.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      // Success - music playing
      document.querySelector('.play-pause-btn').textContent = '⏸';
      console.log("Music started automatically");
    }).catch(error => {
      // Failure - wait for interaction
      console.log("Waiting for interaction to start music");
      
      // Play when there's any click on the page
      document.addEventListener('click', function startMusic() {
        bgMusic.play();
        document.querySelector('.play-pause-btn').textContent = '⏸';
        document.removeEventListener('click', startMusic);
      }, { once: true });
    });
  }
});

// === Music play/pause control ===
document.querySelector('.play-pause-btn').addEventListener('click', function() {
  if (bgMusic.paused) {
    bgMusic.play();
    this.textContent = '⏸';
  } else {
    bgMusic.pause();
    this.textContent = '⏵';
  }
});

// === Double heartbeat function ===
function playHeartbeat() {
  // First beat
  beatSound.currentTime = 0;
  beatSound.play();
  heart.style.transform = 'scale(1.15)';

  setTimeout(() => {
    heart.style.transform = 'scale(1)';
  }, 150);

  // Second beat after 400ms
  setTimeout(() => {
    beatSound.currentTime = 0;
    beatSound.play();
    heart.style.transform = 'scale(1.15)';

    setTimeout(() => {
      heart.style.transform = 'scale(1)';
    }, 150);
  }, 400);
}

// === Hover starts heartbeat ===
heart.addEventListener('mouseenter', () => {
  playHeartbeat();
  beatLoop = setInterval(playHeartbeat, 1800); // total cycle of 1.8s
});

// === When leaving hover, stops heartbeat ===
heart.addEventListener('mouseleave', () => {
  clearInterval(beatLoop);
  heart.style.transform = 'scale(1)';
});

// === Glitch effect on heart click ===
heartLink.addEventListener('click', function(e) {
  e.preventDefault();
  
  // Add effect class to heart
  heart.classList.add('clicked');
  
  // Add glitch class to body
  document.body.classList.add('glitch-effect');
  
  // Play accelerated heartbeat sound
  beatSound.currentTime = 0;
  beatSound.playbackRate = 2.0;
  beatSound.play();
  
  // Wait for animation to finish and then redirect
  setTimeout(() => {
    window.location.href = 'main.html';
  }, 800); // Time equal to animation duration
});

