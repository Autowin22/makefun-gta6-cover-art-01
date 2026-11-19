import { drawCover } from './cover.js';
import { handleShotMode } from './shots.js';

const state = {
  layout: 'tri',
  panels: [
    { photoIndex: 0, zoom: 1, offsetX: 0, offsetY: 0 },
    { photoIndex: 1, zoom: 1, offsetX: 0, offsetY: 0 },
    { photoIndex: 2, zoom: 1, offsetX: 0, offsetY: 0 }
  ],
  photos: [],
  caption: 'SUNSET HEIST',
  captionPos: 'bottom',
  captionColor: 'pink',
  captionOutline: true,
  grade: 'sunset',
  grain: true,
  canvasWidth: 1080,
  canvasHeight: 1080,
  activePanelIndex: 0
};

function updateCanvas() {
  const canvas = document.getElementById('coverCanvas');
  if (!canvas) return;
  canvas.width = state.canvasWidth;
  canvas.height = state.canvasHeight;
  drawCover(canvas, state);
}

function initApp() {
  const canvas = document.getElementById('coverCanvas');

  // Check shot mode first
  const isShot = handleShotMode(state, updateCanvas);
  if (!isShot) {
    // Load default sample photo
    const defaultImg = new Image();
    defaultImg.crossOrigin = 'anonymous';
    defaultImg.src = 'samples/pier.jpg';
    defaultImg.onload = () => {
      state.photos = [defaultImg, defaultImg, defaultImg];
      updateCanvas();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.__shotReady = true;
        });
      });
    };
    defaultImg.onerror = () => {
      updateCanvas();
      window.__shotReady = true;
    };
  }

  // Sample photo buttons
  document.getElementById('samplePierBtn').addEventListener('click', () => {
    loadSamplePhoto('samples/pier.jpg');
  });
  document.getElementById('sampleBoulevardBtn').addEventListener('click', () => {
    loadSamplePhoto('samples/boulevard.jpg');
  });

  // File upload
  document.getElementById('photoUpload').addEventListener('change', (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newPhotos = [];
    let loadedCount = 0;
    for (let i = 0; i < Math.min(files.length, 3); i++) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          newPhotos[i] = img;
          loadedCount++;
          if (loadedCount === Math.min(files.length, 3)) {
            // Fill missing slots with first photo if needed
            while (newPhotos.length < 3) {
              newPhotos.push(newPhotos[0]);
            }
            state.photos = newPhotos;
            renderThumbs();
            updateCanvas();
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(files[i]);
    }
  });

  // Layout picker
  document.querySelectorAll('.layout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.layout = e.target.dataset.layout;
      updateCanvas();
    });
  });

  // Panel tabs
  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      state.activePanelIndex = Number(e.target.dataset.panel);
      syncPanelControls();
    });
  });

  // Panel controls
  const panelPhotoSelect = document.getElementById('panelPhotoSelect');
  const panelZoom = document.getElementById('panelZoom');
  const panelOffsetX = document.getElementById('panelOffsetX');
  const panelOffsetY = document.getElementById('panelOffsetY');

  panelPhotoSelect.addEventListener('change', (e) => {
    state.panels[state.activePanelIndex].photoIndex = Number(e.target.value);
    updateCanvas();
  });

  panelZoom.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    state.panels[state.activePanelIndex].zoom = val;
    document.getElementById('zoomVal').textContent = val.toFixed(2);
    updateCanvas();
  });

  panelOffsetX.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    state.panels[state.activePanelIndex].offsetX = val;
    document.getElementById('offsetXVal').textContent = val;
    updateCanvas();
  });

  panelOffsetY.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    state.panels[state.activePanelIndex].offsetY = val;
    document.getElementById('offsetYVal').textContent = val;
    updateCanvas();
  });

  function syncPanelControls() {
    const panel = state.panels[state.activePanelIndex];
    panelPhotoSelect.value = panel.photoIndex;
    panelZoom.value = panel.zoom;
    document.getElementById('zoomVal').textContent = panel.zoom.toFixed(2);
    panelOffsetX.value = panel.offsetX;
    document.getElementById('offsetXVal').textContent = panel.offsetX;
    panelOffsetY.value = panel.offsetY;
    document.getElementById('offsetYVal').textContent = panel.offsetY;
  }

  // Caption inputs
  document.getElementById('captionInput').addEventListener('input', (e) => {
    state.caption = e.target.value;
    updateCanvas();
  });

  document.querySelectorAll('input[name="captionPos"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.captionPos = e.target.value;
      updateCanvas();
    });
  });

  document.getElementById('captionColor').addEventListener('change', (e) => {
    state.captionColor = e.target.value;
    updateCanvas();
  });

  document.getElementById('captionOutline').addEventListener('change', (e) => {
    state.captionOutline = e.target.checked;
    updateCanvas();
  });

  // Color Grade & Grain
  document.querySelectorAll('.grade-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.grade = e.target.dataset.grade;
      updateCanvas();
    });
  });

  document.getElementById('grainToggle').addEventListener('change', (e) => {
    state.grain = e.target.checked;
    updateCanvas();
  });

  // Size selector
  document.getElementById('canvasSizeSelect').addEventListener('change', (e) => {
    const [w, h] = e.target.value.split('x').map(Number);
    state.canvasWidth = w;
    state.canvasHeight = h;
    updateCanvas();
  });

  // Export button
  document.getElementById('exportBtn').addEventListener('click', () => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vice-city-nights-${state.canvasWidth}x${state.canvasHeight}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  });
}

function loadSamplePhoto(path) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = path;
  img.onload = () => {
    state.photos = [img, img, img];
    renderThumbs();
    updateCanvas();
  };
}

function renderThumbs() {
  const container = document.getElementById('uploadedThumbs');
  container.innerHTML = '';
  state.photos.forEach((img, idx) => {
    if (img && img.src) {
      const thumb = document.createElement('img');
      thumb.src = img.src;
      container.appendChild(thumb);
    }
  });
}

window.addEventListener('DOMContentLoaded', initApp);
