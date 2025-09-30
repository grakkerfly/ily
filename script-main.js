// === CONFIGURAÇÃO DA GALERIA ===
const galleryConfig = {
  memes: {
    character: 55,    // meme1 até meme55
    people: 20,       // people1 até people20  
    projects: 36,     // project1 até project36
    random: 26        // random1 até random26
  },
  vids: 20           // Mude para quantos vídeos/GIFs você tem (video1 até video10)
};

// Formatos suportados - AGORA GIF É VÍDEO!
const supportedFormats = {
  images: ['jpg', 'jpeg', 'png', 'webp'],  // GIF FOI REMOVIDO DAQUI
  videos: ['mp4', 'webm', 'mov', 'gif']    // GIF AGORA É VÍDEO!
};

// === ELEMENTOS DO DOM ===
const galleryModal = document.getElementById('galleryModal');
const closeGallery = document.getElementById('closeGallery');
const galleryGrid = document.getElementById('galleryGrid');
const categoryFilters = document.getElementById('categoryFilters');
const tabButtons = document.querySelectorAll('.tab-btn');
const mediaViewer = document.getElementById('mediaViewer');
const closeViewer = document.getElementById('closeViewer');
const viewerImage = document.getElementById('viewerImage');
const viewerVideo = document.getElementById('viewerVideo');
const frameElement = document.getElementById('frame');
const blurOverlay = document.getElementById('blurOverlay');

// Estado da galeria
let currentTab = 'memes';
let currentCategory = 'character';
let isGalleryOpen = false;
let currentMediaIndex = 0;
let currentMediaList = [];

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
  initializeGallery();
  initializeMusic();
  initializeParallax();
  initializeHoverEffects();
});

// === GALERIA ===
function initializeGallery() {
  // Abrir galeria ao clicar no frame
  frameElement.addEventListener('click', openGallery);
  
  // Fechar galeria
  closeGallery.addEventListener('click', closeGalleryModal);
  
  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mediaViewer.classList.contains('active')) {
        closeMediaViewer();
      } else if (galleryModal.classList.contains('active')) {
        closeGalleryModal();
      }
    }
  });
  
  // Trocar abas
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
  
  // Fechar viewer
  closeViewer.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMediaViewer();
  });
  
  // Fechar viewer clicando em qualquer lugar
  mediaViewer.addEventListener('click', (e) => {
    if (e.target === mediaViewer) {
      closeMediaViewer();
    }
  });
  
  // Prevenir que o click propague para elementos dentro do viewer
  document.querySelector('.viewer-content').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Navegação por teclado no viewer
  document.addEventListener('keydown', handleViewerKeyboard);
}

function handleViewerKeyboard(e) {
  if (!mediaViewer.classList.contains('active')) return;
  
  if (e.key === 'ArrowLeft') {
    navigateMedia(-1);
  } else if (e.key === 'ArrowRight') {
    navigateMedia(1);
  }
}

function openGallery() {
  galleryModal.classList.add('active');
  blurOverlay.classList.add('active');
  isGalleryOpen = true;
  loadGalleryContent();
}

function closeGalleryModal() {
  galleryModal.classList.remove('active');
  blurOverlay.classList.remove('active');
  isGalleryOpen = false;
}

function switchTab(tab) {
  currentTab = tab;
  
  if (tab === 'memes') {
    currentCategory = Object.keys(galleryConfig.memes)[0];
  }
  
  tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  loadGalleryContent();
}

function loadGalleryContent() {
  galleryGrid.innerHTML = '';
  currentMediaList = [];
  
  loadCategories();
  
  if (currentTab === 'memes') {
    loadMemes();
  } else {
    loadVideos();
  }
}

function loadCategories() {
  categoryFilters.innerHTML = '';
  
  if (currentTab === 'memes') {
    const categories = Object.keys(galleryConfig.memes);
    
    categories.forEach(category => {
      if (galleryConfig.memes[category] > 0) {
        const btn = document.createElement('button');
        btn.className = `category-btn ${category === currentCategory ? 'active' : ''}`;
        btn.textContent = category.toUpperCase();
        btn.addEventListener('click', () => filterByCategory(category));
        categoryFilters.appendChild(btn);
      }
    });
  }
}

function filterByCategory(category) {
  currentCategory = category;
  
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === category);
  });
  
  if (currentTab === 'memes') {
    loadMemes();
  }
}

function loadMemes() {
  galleryGrid.innerHTML = '';
  currentMediaList = [];
  
  if (currentCategory && galleryConfig.memes[currentCategory] > 0) {
    loadMemeCategory(currentCategory);
  }
}

function loadMemeCategory(category) {
  const count = galleryConfig.memes[category];
  
  for (let i = 1; i <= count; i++) {
    const memeItem = createMemeItem(category, i);
    if (memeItem) {
      galleryGrid.appendChild(memeItem);
    }
  }
}

function createMemeItem(category, number) {
  const item = document.createElement('div');
  item.className = 'gallery-item';
  
  const img = document.createElement('img');
  img.alt = `${category} meme ${number}`;
  
  let finalSrc = '';
  
  const formats = supportedFormats.images;
  let currentFormatIndex = 0;
  
  function tryNextFormat() {
    if (currentFormatIndex < formats.length) {
      const format = formats[currentFormatIndex];
      const fileName = getMemeFileName(category, number, format);
      const testImage = new Image();
      
      testImage.onload = function() {
        finalSrc = `IMAGES/memes/${category}/${fileName}`;
        img.src = finalSrc;
        
        currentMediaList.push({
          src: finalSrc,
          type: 'image',
          category: category,
          index: currentMediaList.length
        });
        
        // Adicionar evento de clique DEPOIS que a imagem carregou
        item.addEventListener('click', () => {
          const mediaIndex = currentMediaList.findIndex(media => media.src === finalSrc);
          if (mediaIndex !== -1) {
            openMediaViewer(finalSrc, 'image', mediaIndex);
          }
        });
      };
      
      testImage.onerror = function() {
        currentFormatIndex++;
        tryNextFormat();
      };
      
      testImage.src = `IMAGES/memes/${category}/${fileName}`;
    }
  }
  
  tryNextFormat();
  
  item.appendChild(img);
  return item;
}

function getMemeFileName(category, number, format) {
  const prefixes = {
    character: 'meme',
    people: 'people', 
    projects: 'project',
    random: 'random'
  };
  
  const prefix = prefixes[category] || 'meme';
  return `${prefix}${number}.${format}`;
}

function loadVideos() {
  galleryGrid.innerHTML = '';
  currentMediaList = [];
  
  const videoCount = galleryConfig.vids;
  
  if (videoCount > 0) {
    for (let i = 1; i <= videoCount; i++) {
      const videoItem = createVideoItem(i);
      if (videoItem) {
        galleryGrid.appendChild(videoItem);
      }
    }
  } else {
    galleryGrid.innerHTML = '<div class="no-content" style="grid-column: 1/-1; text-align: center; color: #ff5bb8; font-family: PixelFont; font-size: 24px; padding: 40px;">No videos available yet!</div>';
  }
}

function createVideoItem(number) {
  const item = document.createElement('div');
  item.className = 'gallery-item video-item';
  
  let finalSrc = '';
  let isGif = false;
  
  const videoContainer = document.createElement('div');
  videoContainer.style.width = '100%';
  videoContainer.style.height = '100%';
  videoContainer.style.position = 'relative';
  videoContainer.style.overflow = 'hidden';
  
  const formats = supportedFormats.videos;
  let currentFormatIndex = 0;
  
  function tryNextFormat() {
    if (currentFormatIndex < formats.length) {
      const format = formats[currentFormatIndex];
      const fileName = `video${number}.${format}`;
      const testSrc = `IMAGES/vids/${fileName}`;
      
      if (format === 'gif') {
        isGif = true;
        const gifImg = document.createElement('img');
        gifImg.src = testSrc;
        gifImg.style.width = '100%';
        gifImg.style.height = '100%';
        gifImg.style.objectFit = 'cover';
        gifImg.style.display = 'none';
        
        gifImg.onload = function() {
          finalSrc = testSrc;
          gifImg.style.display = 'block';
          
          currentMediaList.push({
            src: finalSrc,
            type: 'image',
            category: 'videos',
            index: currentMediaList.length
          });
          
          // Adicionar evento de clique DEPOIS que o GIF carregou
          item.addEventListener('click', () => {
            const mediaIndex = currentMediaList.findIndex(media => media.src === finalSrc);
            if (mediaIndex !== -1) {
              openMediaViewer(finalSrc, 'image', mediaIndex);
            }
          });
        };
        
        gifImg.onerror = function() {
          currentFormatIndex++;
          tryNextFormat();
        };
        
        videoContainer.appendChild(gifImg);
        item.appendChild(videoContainer);
        
      } else {
        const video = document.createElement('video');
        video.src = testSrc;
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.playsinline = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.display = 'none';
        
        video.onloadeddata = function() {
          finalSrc = testSrc;
          video.style.display = 'block';
          video.play().catch(e => console.log('Auto-play blocked:', e));
          
          currentMediaList.push({
            src: finalSrc,
            type: 'video',
            category: 'videos',
            index: currentMediaList.length
          });
          
          // Adicionar evento de clique DEPOIS que o vídeo carregou
          item.addEventListener('click', () => {
            const mediaIndex = currentMediaList.findIndex(media => media.src === finalSrc);
            if (mediaIndex !== -1) {
              openMediaViewer(finalSrc, 'video', mediaIndex);
            }
          });
        };
        
        video.onerror = function() {
          currentFormatIndex++;
          tryNextFormat();
        };
        
        const playOverlay = document.createElement('div');
        playOverlay.style.position = 'absolute';
        playOverlay.style.top = '50%';
        playOverlay.style.left = '50%';
        playOverlay.style.transform = 'translate(-50%, -50%)';
        playOverlay.style.background = 'rgba(255, 91, 184, 0.7)';
        playOverlay.style.width = '40px';
        playOverlay.style.height = '40px';
        playOverlay.style.borderRadius = '50%';
        playOverlay.style.display = 'flex';
        playOverlay.style.alignItems = 'center';
        playOverlay.style.justifyContent = 'center';
        playOverlay.style.color = 'white';
        playOverlay.style.fontSize = '16px';
        playOverlay.style.opacity = '0.8';
        playOverlay.style.transition = 'all 0.3s ease';
        playOverlay.innerHTML = '▶';
        
        videoContainer.appendChild(video);
        videoContainer.appendChild(playOverlay);
        item.appendChild(videoContainer);
        
        item.addEventListener('mouseenter', () => {
          playOverlay.style.opacity = '1';
          playOverlay.style.transform = 'translate(-50%, -50%) scale(1.1)';
        });
        
        item.addEventListener('mouseleave', () => {
          playOverlay.style.opacity = '0.8';
          playOverlay.style.transform = 'translate(-50%, -50%) scale(1)';
        });
      }
    } else {
      const placeholder = document.createElement('div');
      placeholder.style.width = '100%';
      placeholder.style.height = '100%';
      placeholder.style.background = 'linear-gradient(45deg, #ff5bb8, #7b3cff)';
      placeholder.style.display = 'flex';
      placeholder.style.alignItems = 'center';
      placeholder.style.justifyContent = 'center';
      placeholder.style.color = 'white';
      placeholder.style.fontFamily = 'PixelFont';
      placeholder.style.fontSize = '12px';
      placeholder.innerHTML = `VIDEO ${number}<br>❌ ERRO`;
      item.appendChild(placeholder);
    }
  }
  
  tryNextFormat();
  return item;
}

function openMediaViewer(src, type, index) {
  currentMediaIndex = index;
  
  if (type === 'image') {
    viewerImage.src = src;
    viewerImage.style.display = 'block';
    viewerVideo.style.display = 'none';
    viewerVideo.pause();
    
    // Permitir menu de contexto para imagens
    viewerImage.oncontextmenu = null;
    
  } else {
    viewerVideo.src = src;
    viewerVideo.style.display = 'block';
    viewerImage.style.display = 'none';
    
    // Configurações para vídeos - CONTROLES HABILITADOS para menu de contexto
    viewerVideo.loop = true;
    viewerVideo.controls = true;
    viewerVideo.muted = false;
    
    // Permitir menu de contexto para vídeos
    viewerVideo.oncontextmenu = null;
    
    viewerVideo.play().catch(e => {
      viewerVideo.muted = true;
      viewerVideo.play();
    });
  }
  
  // Adicionar setas de navegação se não existirem
  if (!document.querySelector('.viewer-nav')) {
    const viewerNav = document.createElement('div');
    viewerNav.className = 'viewer-nav';
    viewerNav.innerHTML = `
      <button class="nav-arrow prev-arrow">‹</button>
      <button class="nav-arrow next-arrow">›</button>
    `;
    mediaViewer.appendChild(viewerNav);
    
    document.querySelector('.prev-arrow').addEventListener('click', (e) => {
      e.stopPropagation();
      navigateMedia(-1);
    });
    
    document.querySelector('.next-arrow').addEventListener('click', (e) => {
      e.stopPropagation();
      navigateMedia(1);
    });
  }
  
  updateNavigationArrows();
  mediaViewer.classList.add('active');
}

function navigateMedia(direction) {
  if (currentMediaList.length === 0) return;
  
  currentMediaIndex += direction;
  
  if (currentMediaIndex < 0) {
    currentMediaIndex = currentMediaList.length - 1;
  } else if (currentMediaIndex >= currentMediaList.length) {
    currentMediaIndex = 0;
  }
  
  const media = currentMediaList[currentMediaIndex];
  
  // Atualizar viewer sem fechar completamente
  if (media.type === 'image') {
    viewerImage.src = media.src;
    viewerImage.style.display = 'block';
    viewerVideo.style.display = 'none';
    viewerVideo.pause();
  } else {
    viewerVideo.src = media.src;
    viewerVideo.style.display = 'block';
    viewerImage.style.display = 'none';
    viewerVideo.loop = true;
    viewerVideo.controls = true;
    viewerVideo.play().catch(e => {
      viewerVideo.muted = true;
      viewerVideo.play();
    });
  }
  
  updateNavigationArrows();
}

function updateNavigationArrows() {
  const prevArrow = document.querySelector('.prev-arrow');
  const nextArrow = document.querySelector('.next-arrow');
  
  if (prevArrow && nextArrow) {
    prevArrow.disabled = false;
    nextArrow.disabled = false;
  }
}

function closeMediaViewer() {
  mediaViewer.classList.remove('active');
  viewerVideo.pause();
  viewerVideo.currentTime = 0;
  viewerVideo.controls = false; // Desabilitar controles quando fechar
}

// === MUSIC PLAYER ===
function initializeMusic() {
  const bgMusic = document.getElementById('bg-music');
  const playPauseBtn = document.querySelector('.play-pause-btn');

  window.addEventListener('load', () => {
    bgMusic.volume = 0.2;
    
    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        playPauseBtn.textContent = '⏸';
      }).catch(error => {
        document.addEventListener('click', function startMusic() {
          bgMusic.play();
          playPauseBtn.textContent = '⏸';
          document.removeEventListener('click', startMusic);
        }, { once: true });
      });
    }
  });

  playPauseBtn.addEventListener('click', function() {
    if (bgMusic.paused) {
      bgMusic.play();
      this.textContent = '⏸';
    } else {
      bgMusic.pause();
      this.textContent = '⏵';
    }
  });
}

// === PARALLAX EM TODO O CONTEÚDO ===
function initializeParallax() {
  document.addEventListener('mousemove', (e) => {
    if (isGalleryOpen) return;
    
    const x = (e.clientX / window.innerWidth - 0.5) * -18;
    const y = (e.clientY / window.innerHeight - 0.5) * -18;
    
    document.body.style.transform = `translate(${x}px, ${y}px)`;
  });
}

// === EFEITO HOVER AVANÇADO ===
function initializeHoverEffects() {
  const roomElements = document.querySelectorAll('.room-element');

  roomElements.forEach(element => {
    const hoverText = element.querySelector('.hover-text');
    
    element.addEventListener('mouseenter', () => {
      blurOverlay.classList.add('active');
      
      if (hoverText) {
        hoverText.classList.add('active');
      }
    });
    
    element.addEventListener('mouseleave', () => {
      if (!galleryModal.classList.contains('active')) {
        blurOverlay.classList.remove('active');
      }
      
      if (hoverText) {
        hoverText.classList.remove('active');
      }
    });
  });
}