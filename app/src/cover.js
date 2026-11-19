export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, w, h);

  // Background fallback
  ctx.fillStyle = '#0f0a1e';
  ctx.fillRect(0, 0, w, h);

  const layout = state.layout || 'tri';
  const panels = state.panels || [
    { photoIndex: 0, zoom: 1, offsetX: 0, offsetY: 0 },
    { photoIndex: 1, zoom: 1, offsetX: 0, offsetY: 0 },
    { photoIndex: 2, zoom: 1, offsetX: 0, offsetY: 0 }
  ];
  const photos = state.photos || [];

  // Helper to draw a panel image
  function drawPanel(x, y, pw, ph, panelData) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, pw, ph);
    ctx.clip();

    // Background for empty panel
    ctx.fillStyle = '#1a1429';
    ctx.fillRect(x, y, pw, ph);

    const photoIdx = panelData ? panelData.photoIndex : 0;
    const img = photos[photoIdx] || photos[0];

    if (img && img.complete && img.naturalWidth > 0) {
      const zoom = panelData ? panelData.zoom : 1;
      const ox = panelData ? panelData.offsetX : 0;
      const oy = panelData ? panelData.offsetY : 0;

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const panelAspect = pw / ph;

      let drawW, drawH, drawX, drawY;
      if (imgAspect > panelAspect) {
        drawH = ph * zoom;
        drawW = drawH * imgAspect;
      } else {
        drawW = pw * zoom;
        drawH = drawW / imgAspect;
      }

      drawX = x + (pw - drawW) / 2 + ox;
      drawY = y + (ph - drawH) / 2 + oy;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      // Procedural fallback pattern if no image
      ctx.fillStyle = '#281e42';
      ctx.fillRect(x, y, pw, ph);
      ctx.fillStyle = '#ff2a85';
      ctx.font = 'bold 24px "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VICE CITY', x + pw / 2, y + ph / 2);
    }

    // Panel border / frame
    ctx.lineWidth = Math.max(4, Math.round(w * 0.008));
    ctx.strokeStyle = '#0f0a1e';
    ctx.strokeRect(x, y, pw, ph);

    ctx.restore();
  }

  const borderWidth = Math.max(6, Math.round(w * 0.01));

  // Render layouts
  if (layout === 'full') {
    drawPanel(0, 0, w, h, panels[0]);
  } else if (layout === 'vertical') {
    const colW = (w - borderWidth * 4) / 3;
    const pw = colW;
    const ph = h - borderWidth * 2;
    const y = borderWidth;
    for (let i = 0; i < 3; i++) {
      const px = borderWidth + i * (colW + borderWidth);
      drawPanel(px, y, pw, ph, panels[i]);
    }
  } else {
    // Tri-panel: 1 big main panel on left or top, 2 small on right
    // Let's do main left (60% width), two stacked on right (40% width)
    const gap = borderWidth;
    const leftW = Math.round(w * 0.62) - gap;
    const rightW = w - leftW - gap * 3;
    const rightH = (h - gap * 3) / 2;

    drawPanel(gap, gap, leftW, h - gap * 2, panels[0]);
    drawPanel(leftW + gap * 2, gap, rightW, rightH, panels[1]);
    drawPanel(leftW + gap * 2, rightH + gap * 2, rightW, rightH, panels[2]);
  }

  // Color Grade Overlay
  const grade = state.grade || 'sunset';
  ctx.save();
  if (grade === 'sunset') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(255, 120, 50, 0.25)');
    grad.addColorStop(0.5, 'rgba(255, 42, 133, 0.2)');
    grad.addColorStop(1, 'rgba(15, 10, 30, 0.5)');
    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillRect(0, 0, w, h);
  } else if (grade === 'neon') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
    grad.addColorStop(1, 'rgba(255, 42, 133, 0.3)');
    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = 'color';
    ctx.fillRect(0, 0, w, h);
  } else if (grade === 'ocean') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(0, 180, 216, 0.3)');
    grad.addColorStop(1, 'rgba(255, 215, 0, 0.2)');
    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillRect(0, 0, w, h);
  } else if (grade === 'noir') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.globalCompositeOperation = 'color';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  // Vignette
  const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.8);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(5, 2, 10, 0.65)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Film Grain
  if (state.grain !== false) {
    ctx.save();
    ctx.globalAlpha = 0.06;
    const grainSize = Math.max(2, Math.round(w * 0.002));
    for (let i = 0; i < (w * h) / 400; i++) {
      const gx = Math.random() * w;
      const gy = Math.random() * h;
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(gx, gy, grainSize, grainSize);
    }
    ctx.restore();
  }

  // Caption Rendering
  const caption = (state.caption || '').trim().toUpperCase();
  if (caption) {
    ctx.save();
    const fontSize = Math.round(w * 0.055);
    ctx.font = `900 ${fontSize}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textX = w / 2;
    const textY = state.captionPos === 'top' ? h * 0.08 : h * 0.92;

    // Background banner for caption readability
    const textMetrics = ctx.measureText(caption);
    const boxW = textMetrics.width + w * 0.08;
    const boxH = fontSize * 1.6;
    ctx.fillStyle = 'rgba(10, 6, 20, 0.75)';
    ctx.fillRect(textX - boxW / 2, textY - boxH / 2, boxW, boxH);

    // Banner borders
    ctx.lineWidth = 3;
    ctx.strokeStyle = state.captionColor === 'cyan' ? '#00f0ff' :
                      state.captionColor === 'gold' ? '#ffd700' :
                      state.captionColor === 'pink' ? '#ff2a85' : '#ffffff';
    ctx.strokeRect(textX - boxW / 2, textY - boxH / 2, boxW, boxH);

    // Text color
    let fillColor = '#ffffff';
    if (state.captionColor === 'pink') fillColor = '#ff2a85';
    else if (state.captionColor === 'cyan') fillColor = '#00f0ff';
    else if (state.captionColor === 'gold') fillColor = '#ffd700';

    if (state.captionOutline !== false) {
      ctx.lineWidth = Math.max(4, Math.round(fontSize * 0.15));
      ctx.strokeStyle = '#000000';
      ctx.lineJoin = 'round';
      ctx.strokeText(caption, textX, textY);
    }

    ctx.fillStyle = fillColor;
    ctx.fillText(caption, textX, textY);
    ctx.restore();
  }
}
