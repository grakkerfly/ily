// === GALLERY CONFIGURATION ===
const galleryConfig = {
  memes: {
    character: 55,    // meme1 to meme55
    people: 20,       // people1 to people20  
    projects: 36,     // project1 to project36
    random: 26        // random1 to random26
  },
  vids: 20           // Change to how many videos/GIFs you have (video1 to video10)
};

// Supported formats - NOW GIF IS A VIDEO!
const supportedFormats = {
  images: ['jpg', 'jpeg', 'png', 'webp'],  // GIF REMOVED FROM HERE
  videos: ['mp4', 'webm', 'mov', 'gif']    // GIF IS NOW A VIDEO!
};

// === DOM ELEMENTS ===
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
const aboutModal = document.getElementById('aboutModal');
const closeAbout = document.getElementById('closeAbout');
const heartElement = document.getElementById('heart');

// PFP Editor Elements
const pfpModal = document.getElementById('pfpModal');
const closePfp = document.getElementById('closePfp');
const heroElement = document.getElementById('hero');
const pfpCanvas = document.getElementById('pfpCanvas');
const pfpControls = document.getElementById('pfpControls');
const downloadPfpBtn = document.getElementById('downloadPfpBtn');

// Gallery state
let currentTab = 'memes';
let currentCategory = 'character';
let isGalleryOpen = false;
let isAboutOpen = false;
let isPfpOpen = false;
let currentMediaIndex = 0;
let currentMediaList = [];

// === PFP EDITOR CONFIGURATION ===
const pfpConfig = {
  overlay: 10,
  accessories: 6,
  glasses: 9,
  eyes: 8,
  earrings: 7,
  shirt: 12,
  hair: 9,
  brows: 1,
  muzzle: 2,
  body: 5,
  bg: 27
};

// PFP Editor state
let pfpState = {
  overlay: 0,
  accessories: 0,
  glasses: 0,
  eyes: 1,
  earrings: 1,
  shirt: 1,
  hair: 1,
  muzzle: 1,
  body: 1,
  bg: 1,
  brows: 1
};

const pfpOptionalTraits = ["overlay", "accessories", "glasses"];
const pfpRenderOrder = [
  "bg",
  "body",
  "muzzle",
  "brows",
  "hair",
  "shirt",
  "earrings",
  "eyes",
  "glasses",
  "accessories",
  "overlay"
];

let pfpImageCache = {};
const pfpExportSize = 1000;
const pfpTraitLabels = {};

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  initializeGallery();
  initializeMusic();
  initializeParallax();
  initializeHoverEffects();
  initializeAboutModal();
  initializePfpEditor();
});

// === PFP EDITOR ===
function initializePfpEditor() {
  // Open PFP Editor when clicking ILY LAB
  heroElement.addEventListener('click', openPfpEditor);
  
  // Close PFP Editor
  closePfp.addEventListener('click', closePfpEditor);
  
  // Close with ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isPfpOpen) {
      closePfpEditor();
    }
  });
  
  // Close when clicking outside
  pfpModal.addEventListener('click', (e) => {
    if (e.target === pfpModal) {
      closePfpEditor();
    }
  });
  
  // Prevent closing when clicking inside content
  document.querySelector('.pfp-content').addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Initialize PFP Editor controls
  initializePfpControls();
  loadPfpDefaultImages();
}

function initializePfpControls() {
  pfpControls.innerHTML = '';
  
  for (let trait in pfpConfig) {
    const row = document.createElement("div");
    row.classList.add("trait-row");
    
    const left = document.createElement("div");
    left.classList.add("arrow");
    left.innerText = "◀";
    
    const right = document.createElement("div");
    right.classList.add("arrow");
    right.innerText = "▶";
    
    const label = document.createElement("span");
    label.innerText = `${trait.toUpperCase()}: ${pfpState[trait] === 0 ? "NONE" : pfpState[trait]}`;
    pfpTraitLabels[trait] = label;
    
    row.appendChild(left);
    row.appendChild(label);
    row.appendChild(right);
    pfpControls.appendChild(row);
    
    // Arrow events
    left.addEventListener("click", () => {
      changePfpTrait(trait, -1);
    });
    
    right.addEventListener("click", () => {
      changePfpTrait(trait, +1);
    });
  }
  
  // Create buttons container
  const buttonsDiv = document.createElement("div");
  buttonsDiv.id = "pfp-buttons";
  pfpControls.appendChild(buttonsDiv);



  // Random button
  const randomBtn = document.createElement("button");
  randomBtn.id = "randomPfpBtn";
  randomBtn.classList.add("pfp-button");
  randomBtn.innerText = "RANDOM";
  buttonsDiv.appendChild(randomBtn);


  // Reset button
  const resetBtn = document.createElement("button");
  resetBtn.id = "resetPfpBtn";
  resetBtn.classList.add("pfp-button");
  resetBtn.innerText = "RESET";
  buttonsDiv.appendChild(resetBtn);

  
  // Download button
  const saveBtn = document.createElement("button");
  saveBtn.id = "savePfpBtn";
  saveBtn.classList.add("pfp-button");
  saveBtn.innerText = "SAVE PFP";
  buttonsDiv.appendChild(saveBtn);
  
  // ↓↓↓↓ EVENT LISTENER DO RESET  ↓↓↓↓
  resetBtn.addEventListener("click", resetPfpTraits);
  
  // Button events
  randomBtn.addEventListener("click", randomizePfpTraits);
  saveBtn.addEventListener("click", exportPfpImage);
  
  // Enable context menu on canvas
  pfpCanvas.addEventListener('contextmenu', (e) => {
    // Allow normal context menu
  });
}

function changePfpTrait(trait, step) {
  if (pfpOptionalTraits.includes(trait)) {
    pfpState[trait] = (pfpState[trait] + step + (pfpConfig[trait] + 1)) % (pfpConfig[trait] + 1);
  } else {
    pfpState[trait] = pfpState[trait] + step;
    if (pfpState[trait] < 1) pfpState[trait] = pfpConfig[trait];
    if (pfpState[trait] > pfpConfig[trait]) pfpState[trait] = 1;
  }
  pfpTraitLabels[trait].innerText = `${trait}: ${pfpState[trait] === 0 ? "none" : pfpState[trait]}`;
  renderPfp();
}

function loadPfpDefaultImages() {
  const defaultImages = [];
  
  pfpRenderOrder.forEach(trait => {
    const num = pfpState[trait];
    if (num > 0 || (pfpOptionalTraits.includes(trait) && num === 0)) {
      defaultImages.push(`${trait}_${num}`);
    }
  });

  let loaded = 0;
  
  defaultImages.forEach(key => {
    const [trait, num] = key.split('_');
    const img = new Image();
    // CAMINHO CORRIGIDO: IMAGES/pfp editor/
    img.src = `IMAGES/pfp editor/${trait}/${num}.png`;
    img.onload = () => {
      pfpImageCache[key] = img;
      loaded++;
      if (loaded === defaultImages.length) {
        renderPfp();
        loadPfpRemainingImages();
      }
    };
    img.onerror = () => {
      console.warn(`⚠️ PFP image not found: IMAGES/pfp editor/${trait}/${num}.png`);
      loaded++;
      if (loaded === defaultImages.length) {
        renderPfp();
        loadPfpRemainingImages();
      }
    };
  });
}

function loadPfpRemainingImages() {
  for (let trait in pfpConfig) {
    const max = pfpConfig[trait];
    const start = pfpOptionalTraits.includes(trait) ? 0 : 1;
    
    for (let i = start; i <= max; i++) {
      const key = `${trait}_${i}`;
      if (!pfpImageCache[key]) {
        const img = new Image();
        // CAMINHO CORRIGIDO: IMAGES/pfp editor/
        img.src = `IMAGES/pfp editor/${trait}/${i}.png`;
        img.onload = () => {
          pfpImageCache[key] = img;
        };
        img.onerror = () => {
          console.warn(`⚠️ PFP image not found: IMAGES/pfp editor/${trait}/${i}.png`);
        };
      }
    }
  }
}

function renderPfp() {
  const ctx = pfpCanvas.getContext("2d");
  ctx.clearRect(0, 0, pfpCanvas.width, pfpCanvas.height);

  pfpRenderOrder.forEach(trait => {
    const num = pfpState[trait];
    if (num > 0 || (pfpOptionalTraits.includes(trait) && num === 0)) {
      const key = `${trait}_${num}`;
      const img = pfpImageCache[key];
      if (img) {
        drawPfpTrait(img, trait, num, ctx, pfpCanvas.width, pfpCanvas.height);
      }
    }
  });
}

function drawPfpTrait(img, trait, num, context, w, h) {
  if (trait === "overlay" && num === 5) {
    context.globalCompositeOperation = "color-dodge";
  } else {
    context.globalCompositeOperation = "source-over";
  }
  context.drawImage(img, 0, 0, w, h);
}

function randomizePfpTraits() {
  for (let trait in pfpConfig) {
    if (trait === "shirt") {
      pfpState[trait] = Math.floor(Math.random() * (pfpConfig[trait] - 1)) + 2;
    } else if (pfpOptionalTraits.includes(trait)) {
      pfpState[trait] = Math.floor(Math.random() * (pfpConfig[trait] + 1));
    } else {
      pfpState[trait] = Math.floor(Math.random() * pfpConfig[trait]) + 1;
    }
    pfpTraitLabels[trait].innerText = `${trait}: ${pfpState[trait] === 0 ? "none" : pfpState[trait]}`;
  }
  renderPfp();
}

function exportPfpImage() {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = pfpExportSize;
  tempCanvas.height = pfpExportSize;
  const tempCtx = tempCanvas.getContext("2d");

  tempCtx.clearRect(0, 0, pfpExportSize, pfpExportSize);

  pfpRenderOrder.forEach(trait => {
    const num = pfpState[trait];
    if (num > 0) {
      const key = `${trait}_${num}`;
      const img = pfpImageCache[key];
      if (img) {
        if (trait === "overlay" && num === 5) {
          tempCtx.globalCompositeOperation = "color-dodge";
        } else {
          tempCtx.globalCompositeOperation = "source-over";
        }
        tempCtx.drawImage(img, 0, 0, pfpExportSize, pfpExportSize);
      }
    }
  });

  const dataURL = tempCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = "ily-pfp.png";
  link.href = dataURL;
  link.click();
}

function openPfpEditor() {
  pfpModal.classList.add('active');
  blurOverlay.classList.add('active');
  isPfpOpen = true;
}

function closePfpEditor() {
  pfpModal.classList.remove('active');
  blurOverlay.classList.remove('active');
  isPfpOpen = false;
}

// === GALLERY FUNCTIONS ===
function initializeGallery() {
  frameElement.addEventListener('click', openGallery);
  closeGallery.addEventListener('click', closeGalleryModal);
  
  galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) {
      closeGalleryModal();
    }
  });

  document.querySelector('.gallery-content').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mediaViewer.classList.contains('active')) {
        closeMediaViewer();
      } else if (galleryModal.classList.contains('active')) {
        closeGalleryModal();
      } else if (aboutModal.classList.contains('active')) {
        closeAboutModal();
      } else if (pfpModal.classList.contains('active')) {
        closePfpEditor();
      }
    }
  });
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
  
  closeViewer.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMediaViewer();
  });
  
  mediaViewer.addEventListener('click', (e) => {
    if (e.target === mediaViewer) {
      closeMediaViewer();
    }
  });
  
  document.querySelector('.viewer-content').addEventListener('click', (e) => {
    e.stopPropagation();
  });

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
        video.autoplay = window.innerWidth > 768;
        video.playsinline = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.display = 'none';
        
        video.onloadeddata = function() {
          finalSrc = testSrc;
          video.style.display = 'block';
          if (window.innerWidth > 768) {
            video.play().catch(e => console.log('Auto-play blocked:', e));
          }
          
          currentMediaList.push({
            src: finalSrc,
            type: 'video',
            category: 'videos',
            index: currentMediaList.length
          });
          
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
      placeholder.innerHTML = `VIDEO ${number}<br>❌ ERROR`;
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
    
    viewerImage.oncontextmenu = null;
    
  } else {
    viewerVideo.src = src;
    viewerVideo.style.display = 'block';
    viewerImage.style.display = 'none';
    
    viewerVideo.loop = true;
    viewerVideo.controls = true;
    viewerVideo.muted = false;
    
    viewerVideo.oncontextmenu = null;
    
    viewerVideo.play().catch(e => {
      viewerVideo.muted = true;
      viewerVideo.play();
    });
  }
  
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
  viewerVideo.controls = false;
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

// === PARALLAX ON ALL CONTENT ===
function initializeParallax() {
  document.addEventListener('mousemove', (e) => {
    // Check if any modal is open - ADICIONAR buyModal AQUI
    if (isGalleryOpen || isAboutOpen || isPfpOpen || mediaViewer.classList.contains('active') || buyModal.classList.contains('active')) {
      return; // Stop parallax if any modal is open
    }
    
    const x = (e.clientX / window.innerWidth - 0.5) * -6;
    const y = (e.clientY / window.innerHeight - 0.5) * -6;
    
    document.body.style.transform = `translate(${x}px, ${y}px)`;
  });
}

// === ADVANCED HOVER EFFECT ===
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
      if (!galleryModal.classList.contains('active') && !aboutModal.classList.contains('active') && !pfpModal.classList.contains('active')) {
        blurOverlay.classList.remove('active');
      }
      
      if (hoverText) {
        hoverText.classList.remove('active');
      }
    });
  });
}

// === ABOUT MODAL ===
function initializeAboutModal() {
  heartElement.addEventListener('click', openAboutModal);
  closeAbout.addEventListener('click', closeAboutModal);

  aboutModal.addEventListener('click', (e) => {
    if (e.target === aboutModal) {
      closeAboutModal();
    }
  });

  document.querySelector('.about-content').addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

function openAboutModal() {
  aboutModal.classList.add('active');
  blurOverlay.classList.add('active');
  isAboutOpen = true;
}

function closeAboutModal() {
  aboutModal.classList.remove('active');
  blurOverlay.classList.remove('active');
  isAboutOpen = false;
}

// === BUY MODAL (HOW TO BUY) ===
const buyModal = document.getElementById('buyModal');
const closeBuy = document.getElementById('closeBuy');
const computerElement = document.getElementById('computer');

computerElement.addEventListener('click', () => {
  if (window.innerWidth <= 768) {
    window.open("https://jup.ag/swap?sell=So11111111111111111111111111111111111111112&buy=Dhu2cTaaCFnws87gh1hBMPcsANKoThjHhCBxcjgAjups", "_blank");
  } else {
    buyModal.classList.add('active');
    blurOverlay.classList.add('active');
  }
});

closeBuy.addEventListener('click', () => {
  buyModal.classList.remove('active');
  blurOverlay.classList.remove('active');
});

buyModal.addEventListener('click', (e) => {
  if (e.target === buyModal) {
    buyModal.classList.remove('active');
    blurOverlay.classList.remove('active');
  }
});

document.querySelector('.buy-content').addEventListener('click', (e) => {
  e.stopPropagation();
});

window.Jupiter.init({
  displayMode: "integrated",
  integratedTargetId: "jupiter-terminal",
  formProps: {
    initialInputMint: "So11111111111111111111111111111111111111112", // SOL
    initialOutputMint: "Dhu2cTaaCFnws87gh1hBMPcsANKoThjHhCBxcjgAjups" // $ILY
  },
});

document.getElementById('iconCa').addEventListener('click', (e) => {
  e.preventDefault();
  navigator.clipboard.writeText("Dhu2cTaaCFnws87gh1hBMPcsANKoThjHhCBxcjgAjups");
  alert("Contract address copied.");
});



function resetPfpTraits() {
  pfpState = {
    overlay: 0,
    accessories: 0,
    glasses: 0,
    eyes: 1,
    earrings: 1,
    shirt: 1,
    hair: 1,
    muzzle: 1,
    body: 1,
    bg: 1,
    brows: 1
  };
  

  for (let trait in pfpState) {
    if (pfpTraitLabels[trait]) {
      pfpTraitLabels[trait].innerText = `${trait}: ${pfpState[trait] === 0 ? "none" : pfpState[trait]}`;
    }
  }
  
  renderPfp();
}