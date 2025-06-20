/**
 * config.js - Configuration and Preset Management
 * Contains all configuration parameters, preset definitions,
 * and preset management functionality for the noise visualizer.
 */

/**
 * Predefined terrain presets with optimized parameters
 * Each preset includes noise settings and color thresholds
 */
const presets = {
  Island: {
    scale: 50, 
    seed: 0, 
    mask: true, 
    maskShape: 'circle',
    thresholds: [
      { threshold: 0.0, color: '#4169E1' },    // Deep blue water
      { threshold: 0.02, color: '#EED6AF' },   // Beach sand
      { threshold: 0.04, color: '#D2B48C' },   // Sandy areas
      { threshold: 0.15, color: '#228B22' },   // Green vegetation
      { threshold: 0.30, color: '#006400' },   // Dark green forest
      { threshold: 0.45, color: '#8B8989' },   // Mountain rock
      { threshold: 1.0, color: '#FFFAFA' }     // Snow peaks
    ]
  },
  Archipelago: {
    scale: 120, 
    seed: 8, 
    mask: true, 
    maskShape: 'circle',
    thresholds: [
      { threshold: 0.0, color: '#4169E1' },    // Deep blue water
      { threshold: 0.01, color: '#EED6AF' },   // Beach sand
      { threshold: 0.03, color: '#D2B48C' },   // Sandy areas
      { threshold: 0.12, color: '#228B22' },   // Green vegetation
      { threshold: 0.25, color: '#006400' },   // Dark green forest
      { threshold: 0.35, color: '#8B8989' },   // Mountain rock
      { threshold: 1.0, color: '#FFFAFA' }     // Snow peaks
    ]
  },
  Desert: {
    scale: 80, 
    seed: 3, 
    mask: false,
    thresholds: [
      { threshold: 0.3, color: '#000000' },    // Deep shadows
      { threshold: 0.5, color: '#e0c080' },    // Light sand
      { threshold: 0.7, color: '#d9b26f' },    // Medium sand
      { threshold: 0.85, color: '#aa9966' },   // Dark sand
      { threshold: 1.0, color: '#888888' }     // Rocky outcrops
    ]
  },
  Rainforest: {
    scale: 45, 
    seed: 10, 
    mask: false,
    thresholds: [
      { threshold: 0.25, color: '#000000' },   // Deep shadows
      { threshold: 0.35, color: '#ffe39f' },   // Clearings
      { threshold: 0.45, color: '#65b84f' },   // Light green
      { threshold: 0.6, color: '#3e9f3e' },    // Medium green
      { threshold: 0.75, color: '#2c662c' },   // Dark green
      { threshold: 1.0, color: '#1f4d1f' }     // Dense canopy
    ]
  },
  Mountains: {
    scale: 40, 
    seed: 1, 
    mask: false,
    thresholds: [
      { threshold: 0.4, color: '#333333' },    // Deep valleys
      { threshold: 0.5, color: '#777777' },    // Lower slopes
      { threshold: 0.7, color: '#aaaaaa' },    // Mid slopes
      { threshold: 0.85, color: '#dddddd' },   // High slopes
      { threshold: 1.0, color: '#ffffff' }     // Snow peaks
    ]
  }
};

/**
 * Main configuration object containing all adjustable parameters
 * and methods for managing presets and regeneration
 */
const config = {
  // Canvas dimensions
  width: 400,
  height: 400,
  
  // Noise parameters
  scale: 50,           // Zoom level of the noise
  seed: 0,             // Random seed for reproducible results
  speed: 0.01,         // Animation speed for time-based noise
  time: 0,             // Current time offset for animation
  
  // Visual options
  grayscale: false,    // Render in grayscale instead of colors
  octaves: true,       // Use multiple octaves for fractal noise
  smoothing: true,     // Enable smooth color transitions
  shading: true,       // Apply pseudo-3D shading effect
  
  // Masking options for island generation
  mask: true,          // Apply circular/shaped mask
  maskShape: 'circle', // Shape of the mask (circle, square, hexagon)
  maskContrast: 4.0,   // Contrast enhancement for masked areas
  
  // Color thresholds for terrain generation
  thresholds: JSON.parse(JSON.stringify(presets.Island.thresholds)),
  currentPreset: 'Island',
  
  /**
   * Applies a named preset to the current configuration
   * Updates all relevant parameters and refreshes the GUI
   * @param {string} name - Name of the preset to apply
   */
  applyPreset(name) {
    const preset = presets[name];
    if (!preset) return;
    
    // Apply preset parameters
    this.scale = preset.scale;
    this.seed = preset.seed;
    this.mask = preset.mask ?? true;
    this.maskShape = preset.maskShape ?? 'circle';
    this.maskContrast = preset.maskContrast ?? 4.0;
    this.thresholds = JSON.parse(JSON.stringify(preset.thresholds));
    this.currentPreset = name;

    // Update GUI controllers to reflect new values
    updateGUIFromConfig();
    
    // Rebuild threshold controls and redraw
    rebuildThresholdGUI();
    draw();
  },
  
  /**
   * Triggers a regeneration of the noise pattern
   * Convenience method for GUI button
   */
  regenerate: () => draw()
};