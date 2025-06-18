const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let walkers = [], isPaused = false, gif = null, isRecording = false, frameCount = 0, recordingStartTime = 0, generateGifButton = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function getColor() {
  if (settings.blackAndWhite) {
    const gray = Math.floor(Math.random() * 256);
    return `rgba(${gray}, ${gray}, ${gray}, 0.5)`;
  }
  const h = settings.hueMin + Math.random() * (settings.hueMax - settings.hueMin);
  return `hsla(${h}, 100%, 70%, 0.5)`;
}

function drawShape(x, y, size, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  if (settings.customSprite) {
    ctx.drawImage(settings.customSprite, x - size, y - size, size * 2, size * 2);
  } else {
    switch (settings.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x + size, y + size);
        ctx.closePath();
        ctx.fill();
        break;
      default:
        ctx.fillRect(x, y, size, size);
    }
  }
}

function createWalkers() {
  walkers = Array.from({ length: settings.walkers }, () => new Walker());
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 17, g: 17, b: 17 }; // fallback to default dark gray
}

function animate() {
  if (!isPaused && !settings.showTrails) {
    const alpha = 1 - settings.trailOpacity; // Map 0-1 to 1-0
    const bgColor = hexToRgb(settings.backgroundColor);
    ctx.fillStyle = `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, ${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  if (!isPaused) {
    walkers.forEach(w => w.update());
    
    // GIF recording logic
    if (gif && isRecording) {
      const elapsed = (Date.now() - recordingStartTime) / 1000;
      const shouldAddFrame = frameCount % Math.floor(60 / settings.gifFrameRate) === 0;
      
      if (shouldAddFrame) {
        // Create a temporary canvas to capture the center portion
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = settings.gifWidth;
        tempCanvas.height = settings.gifHeight;
        
        // Calculate center crop area
        const cropSize = Math.min(settings.gifWidth, settings.gifHeight);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const cropX = centerX - cropSize / 2;
        const cropY = centerY - cropSize / 2;
        
        // Draw the center portion of the main canvas to temp canvas, scaled to fit
        tempCtx.drawImage(
          canvas,
          cropX, cropY, cropSize, cropSize,  // source rectangle (center crop)
          0, 0, settings.gifWidth, settings.gifHeight  // destination rectangle
        );
        
        gif.addFrame(tempCanvas, { copy: true, delay: 1000 / settings.gifFrameRate });
      }
      
      // Update progress
      const progress = Math.min((elapsed / settings.gifDuration) * 100, 100);
      updateProgress(progress, 'Recording...');
      
      // Stop recording when duration is reached
      if (elapsed >= settings.gifDuration) {
        finishGifRecording();
      }
    }
    frameCount++;
  }
  requestAnimationFrame(animate);
}

function updateProgress(percent, text) {
  document.getElementById('progress-fill').style.width = percent + '%';
  document.getElementById('progress-text').textContent = Math.round(percent) + '% - ' + text;
}

function showProgress() {
  document.getElementById('gif-progress').style.display = 'block';
}

function hideProgress() {
  document.getElementById('gif-progress').style.display = 'none';
}

function startGifGeneration() {
  // Reset animation
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  createWalkers();
  frameCount = 0;
  
  // Disable button
  if (generateGifButton) {
    generateGifButton.domElement.style.pointerEvents = 'none';
    generateGifButton.domElement.style.opacity = '0.5';
  }
  
  showProgress();
  updateProgress(0, 'Initializing...');
  
  // Create GIF instance
  gif = new GIF({
    workers: 2,
    quality: settings.gifQuality,
    width: settings.gifWidth,
    height: settings.gifHeight,
    workerScript: 'libraries/gif.worker.js'
  });
  
  gif.on('progress', function(p) {
    updateProgress(50 + (p * 50), 'Encoding...');
  });
  
  gif.on('finished', function(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `walker_${Date.now()}.gif`;
    a.click();
    
    // Clean up
    gif = null;
    isRecording = false;
    hideProgress();
    
    // Re-enable button
    if (generateGifButton) {
      generateGifButton.domElement.style.pointerEvents = 'auto';
      generateGifButton.domElement.style.opacity = '1';
    }
  });
  
  // Start recording
  isRecording = true;
  recordingStartTime = Date.now();
  updateProgress(5, 'Recording...');
}

function finishGifRecording() {
  if (gif && isRecording) {
    isRecording = false;
    updateProgress(50, 'Processing...');
    gif.render();
  }
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const w = new Walker();
  w.x = x;
  w.y = y;
  walkers.push(w);
});

// Ensure canvas is properly sized before creating walkers
resizeCanvas();
createWalkers();
animate();

const gui = new lil.GUI();

const generalFolder = gui.addFolder('Walker Settings');
generalFolder.add(settings, 'walkers', config.walkerCountMin, config.walkerCountMax, 1).name('Walker Count').onFinishChange(createWalkers);

const motionFolder = gui.addFolder('Walker Properties');
motionFolder.add(settings, 'speedMin', config.speedMin, config.speedMax).name('Speed Min');
motionFolder.add(settings, 'speedMax', config.speedMin, config.speedMax).name('Speed Max');
motionFolder.add(settings, 'jitterMin', config.jitterMin, config.jitterMax).name('Wiggle Min');
motionFolder.add(settings, 'jitterMax', config.jitterMin, config.jitterMax).name('Wiggle Max');
motionFolder.add(settings, 'driftMin', config.driftMin, config.driftMax).name('Drift Min');
motionFolder.add(settings, 'driftMax', config.driftMin, config.driftMax).name('Drift Max');
motionFolder.add(settings, 'sizeMin', config.sizeMin, config.sizeMax).name('Dot Size Min');
motionFolder.add(settings, 'sizeMax', config.sizeMin, config.sizeMax).name('Dot Size Max');
motionFolder.add(settings, 'shape', ['square', 'circle', 'triangle']).name('Dot Shape');

const colorFolder = gui.addFolder('Color Settings');
colorFolder.addColor(settings, 'backgroundColor').name('Background Color').onChange(() => {
  // Apply background immediately if trails are off
  if (!settings.showTrails) {
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
});
colorFolder.add(settings, 'showTrails').name('Persistent Trails');
colorFolder.add(settings, 'trailOpacity', 0, 1, 0.01).name('Trail Opacity');
colorFolder.add(settings, 'blackAndWhite').name('Black & White');
colorFolder.add(settings, 'hueMin', config.hueRangeMin, config.hueRangeMax).name('Min Hue');
colorFolder.add(settings, 'hueMax', config.hueRangeMin, config.hueRangeMax).name('Max Hue');
colorFolder.add({
  upload: () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = function (ev) {
        const img = new Image();
        img.onload = () => {
          settings.customSprite = img;
          document.getElementById('sprite-preview').innerHTML = '<img src="' + img.src + '" />';
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }
}, 'upload').name('Upload Sprite');

const gifFolder = gui.addFolder('GIF Settings');
gifFolder.add(settings, 'gifDuration', gifConfig.durationMin, gifConfig.durationMax, 0.5).name('Duration (seconds)');
gifFolder.add(settings, 'gifWidth', gifConfig.widthMin, gifConfig.widthMax, 50).name('Width');
gifFolder.add(settings, 'gifHeight', gifConfig.heightMin, gifConfig.heightMax, 50).name('Height');
gifFolder.add(settings, 'gifQuality', gifConfig.qualityMin, gifConfig.qualityMax, 1).name('Quality (lower = better)');
gifFolder.add(settings, 'gifFrameRate', gifConfig.frameRateMin, gifConfig.frameRateMax, 1).name('Frame Rate');

const actions = gui.addFolder('Actions');
actions.add({ pause: () => isPaused = !isPaused }, 'pause').name('Pause/Resume');
actions.add({
  reset: () => {
    // Apply background color first
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    createWalkers();
    isPaused = false;
    // Stop any ongoing GIF recording
    if (gif && isRecording) {
      gif = null;
      isRecording = false;
      hideProgress();
      if (generateGifButton) {
        generateGifButton.domElement.style.pointerEvents = 'auto';
        generateGifButton.domElement.style.opacity = '1';
      }
    }
  }
}, 'reset').name('Reset');
actions.add({
  saveImage: () => {
    const link = document.createElement('a');
    link.download = 'walker.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}, 'saveImage').name('Save as Image');

generateGifButton = actions.add({ generateGif: startGifGeneration }, 'generateGif').name('Generate GIF');
