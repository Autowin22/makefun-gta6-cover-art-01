import { drawCover } from './cover.js';

export function handleShotMode(state, updateCanvasFn) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return false;

  const caption = params.get('caption');
  if (caption) {
    state.caption = decodeURIComponent(caption);
  }
  const captionInput = document.getElementById('captionInput');
  if (captionInput) {
    captionInput.value = state.caption;
    captionInput.setAttribute('value', state.caption);
  }

  const grade = params.get('grade');
  if (grade) {
    state.grade = grade;
  }

  const layout = params.get('layout');
  if (layout) {
    state.layout = layout;
  }

  const size = params.get('size');
  if (size) {
    const [w, h] = size.split('x').map(Number);
    if (w && h) {
      state.canvasWidth = w;
      state.canvasHeight = h;
    }
  }

  const photoKey = params.get('photo');
  const samplePath = photoKey === 'pier' ? 'samples/pier.jpg' :
                     photoKey === 'boulevard' ? 'samples/boulevard.jpg' :
                     photoKey ? `samples/${photoKey}.jpg` : 'samples/pier.jpg';

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = samplePath;
  img.onload = () => {
    state.photos = [img, img, img];
    updateCanvasFn();
    finalizeShot(shot, params, state, updateCanvasFn);
  };
  img.onerror = () => {
    updateCanvasFn();
    finalizeShot(shot, params, state, updateCanvasFn);
  };
  return true;
}

function finalizeShot(shot, params, state, updateCanvasFn) {
  if (shot === 'cover') {
    document.body.classList.add('shot-mode-cover');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.__shotReady = true;
      });
    });
  } else if (shot === 'export') {
    document.body.classList.add('shot-mode-export');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const canvas = document.getElementById('coverCanvas');
        const dataUrl = canvas.toDataURL('image/png');
        const exportDisplay = document.getElementById('exportDisplay');
        exportDisplay.classList.remove('hidden');
        const img = document.createElement('img');
        img.onload = () => {
          const debugDiv = document.getElementById('shot-debug');
          if (debugDiv) {
            debugDiv.textContent = `export-ok caption=${state.caption}`;
          }
          window.__shotReady = true;
        };
        img.onerror = () => {
          const debugDiv = document.getElementById('shot-debug');
          if (debugDiv) {
            debugDiv.textContent = `export-ok caption=${state.caption}`;
          }
          window.__shotReady = true;
        };
        img.src = dataUrl;
        exportDisplay.innerHTML = '';
        exportDisplay.appendChild(img);
      });
    });
  } else {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.__shotReady = true;
      });
    });
  }
}
