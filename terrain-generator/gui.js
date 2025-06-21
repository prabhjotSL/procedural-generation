/**
 * gui.js - User Interface Management
 * Handles the creation and management of the lil-gui interface,
 * including parameter controls, preset selection, and threshold editing.
 */

// GUI instance and controller references
const gui = new lil.GUI();
const guiControllers = {};
let thresholdFolder;
let thresholdControllers = [];
let presetController;

/**
 * Updates GUI controller values to match current configuration
 * Used when applying presets to sync the interface
 */
function updateGUIFromConfig() {
  if (guiControllers.scale) guiControllers.scale.setValue(config.scale);
  if (guiControllers.seed) guiControllers.seed.setValue(config.seed);
  if (guiControllers.speed) guiControllers.speed.setValue(config.speed);
  if (guiControllers.grayscale) guiControllers.grayscale.setValue(config.grayscale);
  if (guiControllers.octaves) guiControllers.octaves.setValue(config.octaves);
  if (guiControllers.smoothing) guiControllers.smoothing.setValue(config.smoothing);
  if (guiControllers.shading) guiControllers.shading.setValue(config.shading);
  if (guiControllers.mask) guiControllers.mask.setValue(config.mask);
  if (guiControllers.maskShape) guiControllers.maskShape.setValue(config.maskShape);
  if (guiControllers.maskContrast) guiControllers.maskContrast.setValue(config.maskContrast);
  if (guiControllers.width) guiControllers.width.setValue(config.width);
  if (guiControllers.height) guiControllers.height.setValue(config.height);
  if (guiControllers.fullscreen) guiControllers.fullscreen.setValue(config.fullscreen);
  if (presetController) presetController.setValue(config.currentPreset);
}

/**
 * Marks the current configuration as custom when manually modified
 * Updates the preset selector to show "Custom" when user makes changes
 */
function markAsCustom() {
  if (config.currentPreset !== 'Custom') {
    config.currentPreset = 'Custom';
    if (presetController) presetController.setValue('Custom');
  }
}

/**
 * Generates a completely random terrain configuration
 * Randomizes all parameters and creates 3-6 random color layers
 */
function randomizeTerrain() {
  // Randomize basic parameters
  config.scale = Math.floor(Math.random() * 150) + 20; // 20-170
  config.seed = Math.floor(Math.random() * 100);
  config.speed = Math.random() * 0.02; // 0.005-0.055
  
  // Randomize visual effects
  config.grayscale = false;
  config.octaves = true;
  config.smoothing = Math.random() < 0.6;
  config.shading = true;
  
  // Randomize mask settings
  config.mask = Math.random() < 0.7;
  config.maskShape = ['circle', 'square', 'hexagon'][Math.floor(Math.random() * 3)];
  config.maskContrast = Math.random() * 2 + 1.5; // 1.5-9.5
  
  // Generate random color layers (3-6 layers)
  const layerCount = Math.floor(Math.random() * 3) + 4; // 3-6 layers
  config.thresholds = [];
  
  // Helper function to convert HSL to hex
  const hslToHex = (h, s, l) => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  
  for (let i = 0; i < layerCount; i++) {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 60) + 40; // 40-100%
    const lightness = Math.floor(Math.random() * 50) + 25; // 25-75%
    const color = hslToHex(hue, saturation, lightness);
    
    config.thresholds.push({
      threshold: (i + 1) / layerCount,
      color: color
    });
  }
  
  // Sort thresholds
  config.thresholds.sort((a, b) => a.threshold - b.threshold);
  
  // Update GUI and redraw
  markAsCustom();
  updateGUIFromConfig();
  rebuildThresholdGUI();
  debouncedDraw();
}

/**
 * Rebuilds the threshold controls when presets change or layers are added/removed
 * Dynamically creates controls for each color threshold layer
 */
function rebuildThresholdGUI() {
  // Clean up existing threshold controls
  if (thresholdFolder) {
    thresholdFolder.destroy();
    thresholdControllers = [];
  }
  
  // Create new threshold folder
  thresholdFolder = gui.addFolder('Thresholds & Colors');
  
  thresholdFolder.close();

  // Create controls for each threshold layer
  config.thresholds.forEach((layer, i) => {
    const f = thresholdFolder.addFolder(`Layer ${i + 1}`);
    
    // Threshold value control
    const thresholdCtrl = f.add(layer, 'threshold', 0, 1, 0.01).onChange(() => {
      markAsCustom();
      debouncedDraw();
    });
    
    // Color picker control
    const colorCtrl = f.addColor(layer, 'color').onChange(() => {
      markAsCustom();
      debouncedDraw();
    });
    
    thresholdControllers.push({ threshold: thresholdCtrl, color: colorCtrl });
  });
  
  // Add layer management buttons
  thresholdFolder.add({ 
    addLayer: () => {
      config.thresholds.push({ threshold: 1.0, color: '#ffffff' });
      markAsCustom();
      rebuildThresholdGUI();
      debouncedDraw();
    }
  }, 'addLayer');
  
  thresholdFolder.add({ 
    removeLayer: () => {
      if (config.thresholds.length > 1) {
        config.thresholds.pop();
        markAsCustom();
        rebuildThresholdGUI();
        debouncedDraw();
      }
    }
  }, 'removeLayer');
}

/**
 * Initializes the complete GUI interface
 * Creates all parameter controls organized into logical groups
 */
function initializeGUI() {
  // Remove any existing DOM export buttons
  const existingExportButtons = document.querySelectorAll('[id*="export"], [class*="export"]');
  existingExportButtons.forEach(button => button.remove());
  
  // Actions folder
  const actionsFolder = gui.addFolder('Actions');
  actionsFolder.open(); // Open by default
  
  // Randomize button (replaces regenerate)
  actionsFolder.add({ randomize: randomizeTerrain }, 'randomize')
    .name('🎲 Randomize Terrain');
  
  // Export buttons
  actionsFolder.add({ 
    exportPNG: () => {
      const link = document.createElement('a');
      link.download = 'terrain.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  }, 'exportPNG').name('📷 Export PNG');
  
  actionsFolder.add({ 
    exportJPG: () => {
      const link = document.createElement('a');
      link.download = 'terrain.jpg';
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    }
  }, 'exportJPG').name('📷 Export JPG');
  
  // Canvas settings folder
  const canvasFolder = gui.addFolder('Canvas Settings');
  canvasFolder.close(); // Start closed by default
  
  // Canvas dimension controls
  guiControllers.width = canvasFolder.add(config, 'width', 100, 2000, 10)
    .name('Canvas Width')
    .onChange((value) => {
      if (!config.fullscreen) {
        canvas.width = value;
        canvas.style.width = value + 'px';
        markAsCustom();
        debouncedDraw();
      }
    });
  
  guiControllers.height = canvasFolder.add(config, 'height', 100, 2000, 10)
    .name('Canvas Height')
    .onChange((value) => {
      if (!config.fullscreen) {
        canvas.height = value;
        canvas.style.height = value + 'px';
        markAsCustom();
        debouncedDraw();
      }
    });

  // Preset selector
  const presetOptions = [...Object.keys(presets), 'Custom'];
  presetController = gui.add(config, 'currentPreset', presetOptions)
    .name('Terrain Preset')
    .onChange(name => {
      if (name !== 'Custom') {
        config.applyPreset(name);
      }
    });

  // Noise parameters folder
  const noiseFolder = gui.addFolder('Noise Parameters');
  noiseFolder.close(); // Start closed by default
  guiControllers.scale = noiseFolder.add(config, 'scale', 10, 200, 1)
    .name('Noise Scale')
    .onChange(() => {
      markAsCustom();
      debouncedDraw();
    });
  
  guiControllers.seed = noiseFolder.add(config, 'seed', 0, 100, 1)
    .name('Random Seed')
    .onChange(() => {
      markAsCustom();
      debouncedDraw();
    });
  
  guiControllers.speed = noiseFolder.add(config, 'speed', 0, 0.1, 0.001)
    .name('Animation Speed');
  
  // Visual effects folder
  const effectsFolder = gui.addFolder('Visual Effects');
  effectsFolder.close(); // Start closed by default
  guiControllers.grayscale = effectsFolder.add(config, 'grayscale')
    .name('Grayscale Mode')
    .onChange(() => {
      markAsCustom();
      debouncedDraw();
    });
  
  guiControllers.octaves = effectsFolder.add(config, 'octaves')
    .name('Multi-Octave')
    .onChange(() => {
      markAsCustom();
      debouncedDraw();
    });
  
  guiControllers.smoothing = effectsFolder.add(config, 'smoothing')
    .name('Smooth Colors')
    .onChange(() => {
      markAsCustom();
      debouncedDraw();
    });
  
  guiControllers.shading = effectsFolder.add(config, 'shading')
    .name('3D Shading')
    .onChange(() => {
      markAsCustom();
      debouncedDraw();
    });
  
  // Mask settings folder
  const maskFolder = gui.addFolder('Mask Settings');

  maskFolder.close(); // Start closed by default
  
  guiControllers.mask = maskFolder.add(config, 'mask')
    .name('Enable Mask')
    .onChange(() => {
      markAsCustom();
      debouncedDraw();
    });
  
  guiControllers.maskShape = maskFolder.add(config, 'maskShape', ['circle', 'square', 'hexagon'])
    .name('Mask Shape')
    .onChange(() => {
      markAsCustom();
      debouncedDraw();
    });
  
  guiControllers.maskContrast = maskFolder.add(config, 'maskContrast', 1.0, 10.0, 0.1)
    .name('Mask Contrast')
    .onChange(() => {
      markAsCustom();
      debouncedDraw();
    });
  
  
  
  // Initialize threshold controls
  rebuildThresholdGUI();
  
  // Make GUI mobile responsive
  gui.domElement.style.position = 'fixed';
  if (window.innerWidth > 768) {
    gui.domElement.style.top = '10px';
  } else {
    gui.domElement.style.top = '500px';
  }

  gui.domElement.style.right = '10px';
  gui.domElement.style.zIndex = '1000';    // Add mobile styles
  const style = document.createElement('style');
  style.textContent = `
    /* Canvas positioning */
    #perlinCanvas {
      display: block;
      margin: 0 auto;
      padding: 0;
      max-width: calc(100vw - 2em);
      max-height: calc(100vh - 120px);
    }
    
    /* Fullscreen canvas styles */
    #perlinCanvas.fullscreen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 999 !important;
      max-width: none !important;
      max-height: none !important;
    }
    
    /* Mobile responsive GUI */
    @media (max-width: 768px) {
      #perlinCanvas {
        max-width: calc(100vw - 1em) !important;
        max-height: calc(100vh - 80px) !important;
      }
      
      .lil-gui {
        width: 280px !important;
        font-size: 12px !important;
        max-height: 90vh !important;
        overflow-y: auto !important;
      }
      .lil-gui .controller {
        height: 24px !important;
      }
      .lil-gui input {
        font-size: 11px !important;
      }
    }
    
    @media (max-width: 480px) {
      #perlinCanvas {
        max-width: calc(100vw - 0.5em) !important;
        max-height: calc(100vh - 60px) !important;
      }
      
      .lil-gui {
        width: 250px !important;
        max-height: 80vh !important;
        overflow-y: auto !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Initialize the GUI when this file loads
initializeGUI();