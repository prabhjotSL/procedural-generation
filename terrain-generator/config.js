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
    maskContrast: 1.8, // Higher contrast for more distinct islands
    thresholds: [
      { threshold: 0.3, color: '#3f91de' },    // Deep ocean blue
      { threshold: 0.35, color: '#f4e4bc' },   // Beach sand
      { threshold: 0.44, color: '#c6a06c' },    // Light green vegetation
      { threshold: 0.55, color: '#228b22' },   // Medium green
      { threshold: 0.7, color: '#006400' },    // Dark green forest
      { threshold: 0.85, color: '#814f12' },   // Mountain brown
      { threshold: 1.0, color: '#ffffff' }     // Snow peaks
    ]
  },
  Archipelago: {
    scale: 30, 
    seed: 21, 
    mask: true, 
    maskShape: 'hexagon', // Hexagonal mask for distinct islands
    maskContrast: 1.8, // Higher contrast for distinct islands
    thresholds: [
      { threshold: 0.6, color: '#4169E1' },    // Deep blue water
      { threshold: 0.62, color: '#EED6AF' },   // Beach sand
      { threshold: 0.65, color: '#D2B48C' },   // Sandy areas
      { threshold: 0.72, color: '#228B22' },   // Green vegetation
      { threshold: 1, color: '#006400' },   // Dark green forest
    ]
  },
  Desert: {
    scale: 80, 
    seed: 3, 
    mask: false,
    octaves: true,
    shading: true,
    smoothing: true, // Smooth transitions for sand dunes
    thresholds: [
      { threshold: 0.3, color: '#f9dea6' },    // Deep shadows
      { threshold: 0.5, color: '#e0c080' },    // Light sand
      { threshold: 0.66, color: '#d9b26f' },    // Medium sand
      { threshold: 1, color: '#477cc2' },   // Dark sand
    ]
  },
  Rainforest: {
    scale: 50, 
    seed: 31, 
    mask: true,
    maskShape: 'hexagon', // Hexagonal mask for dense forest
    maskContrast: 2.0, // Higher contrast for dense forest
    thresholds: [
      { threshold: 0.2, color: '#f0da9e' },    // Dark green
      { threshold: 0.3, color: '#65b84f' },    // Medium green
      { threshold: 0.44, color: '#3e9f3e' },    // Light green
      { threshold: 1, color: '#0f4d0f' },    // Lighter green
    ]
  }
};

/**
 * Main configuration object containing all adjustable parameters
 * and methods for managing presets and regeneration
 */
const config = {
  // Canvas dimensions
  width: 512,
  height: 512,
  
  // Noise parameters
  scale: 50,           // Zoom level of the noise
  seed: 0.01,             // Random seed for reproducible results
  speed: 0,         // Animation speed for time-based noise
  time: 0,             // Current time offset for animation
  
  // Visual options
  grayscale: false,    // Render in grayscale instead of colors
  octaves: true,       // Use multiple octaves for fractal noise
  smoothing: false,     // Enable smooth color transitions
  shading: true,       // Apply pseudo-3D shading effect
  
  // Masking options for island generation
  mask: true,          // Apply circular/shaped mask
  maskShape: 'circle', // Shape of the mask (circle, square, hexagon)
  maskContrast: 1.8,   // Contrast enhancement for masked areas
  
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