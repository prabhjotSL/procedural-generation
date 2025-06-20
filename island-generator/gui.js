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
  if (guiControllers.mask) guiControllers.mask.setValue(config.mask);
  if (guiControllers.maskShape) guiControllers.maskShape.setValue(config.maskShape);
  if (guiControllers.maskContrast) guiControllers.maskContrast.setValue(config.maskContrast);
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
  thresholdFolder = gui.addFolder('Thresholds');
  
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
 * Creates all parameter controls and sets up event handlers
 */
function initializeGUI() {
  // Canvas dimension controls
  guiControllers.width = gui.add(config, 'width', 100, 1000, 10)
    .name('Canvas Width')
    .onChange(debouncedDraw);
  
  guiControllers.height = gui.add(config, 'height', 100, 1000, 10)
    .name('Canvas Height')
    .onChange(debouncedDraw);
  
  // Noise parameter controls
  guiControllers.scale = gui.add(config, 'scale', 10, 200, 1)
    .name('Noise Scale')
    .onChange(debouncedDraw);
  
  guiControllers.seed = gui.add(config, 'seed', 0, 100, 1)
    .name('Random Seed')
    .onChange(debouncedDraw);
  
  guiControllers.speed = gui.add(config, 'speed', 0, 0.1, 0.001)
    .name('Animation Speed');
  
  // Visual effect toggles
  guiControllers.grayscale = gui.add(config, 'grayscale')
    .name('Grayscale Mode')
    .onChange(debouncedDraw);
  
  guiControllers.octaves = gui.add(config, 'octaves')
    .name('Multi-Octave')
    .onChange(debouncedDraw);
  
  guiControllers.smoothing = gui.add(config, 'smoothing')
    .name('Smooth Colors')
    .onChange(debouncedDraw);
  
  guiControllers.shading = gui.add(config, 'shading')
    .name('3D Shading')
    .onChange(debouncedDraw);
  
  // Mask controls
  guiControllers.mask = gui.add(config, 'mask')
    .name('Enable Mask')
    .onChange(debouncedDraw);
  
  guiControllers.maskShape = gui.add(config, 'maskShape', ['circle', 'square', 'hexagon'])
    .name('Mask Shape')
    .onChange(debouncedDraw);
  
  guiControllers.maskContrast = gui.add(config, 'maskContrast', 1.0, 10.0, 0.1)
    .name('Mask Contrast')
    .onChange(debouncedDraw);
  
  // Regenerate button
  gui.add(config, 'regenerate')
    .name('🎲 Regenerate');
  
  // Preset selector with Custom option
  const presetOptions = [...Object.keys(presets), 'Custom'];
  presetController = gui.add(config, 'currentPreset', presetOptions)
    .name('Terrain Preset')
    .onChange(name => {
      if (name !== 'Custom') {
        config.applyPreset(name);
      }
    });
  
  // Initialize threshold controls
  rebuildThresholdGUI();
}

// Initialize the GUI when this file loads
initializeGUI();