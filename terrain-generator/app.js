/**
 * app.js - Main Application Entry Point
 * Initializes the application, starts the animation loop,
 * and coordinates all the modular components.
 */

/**
 * Animation loop management
 * Handles the continuous rendering and time-based animation
 */
let animationId;

/**
 * Main animation loop function
 * Updates the time parameter and redraws the canvas if animation is active
 */
function loop() {
  // Update time for animated noise
  config.time += config.speed;
  
  // Only redraw if animation is active (speed > 0)
  if (config.speed > 0) {
    draw();
  }
  
  // Schedule next frame
  animationId = requestAnimationFrame(loop);
}

/**
 * Stops the animation loop
 * Useful for performance optimization when animation is not needed
 */
function stopAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

/**
 * Starts or restarts the animation loop
 */
function startAnimation() {
  if (!animationId) {
    loop();
  }
}

/**
 * Application initialization function
 * Sets up the initial state and starts the application
 */
function initializeApp() {
  // Perform initial draw to show the default noise pattern
  draw();
  
  // Start the animation loop
  startAnimation();
  
  console.log('🎛️ Perlin Noise Visualizer initialized successfully!');
  console.log('📊 Available presets:', Object.keys(presets).join(', '));
  console.log('⚡ Animation loop started');
}

/**
 * Initialize the application when all dependencies are loaded
 * This ensures all modules are available before starting
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // Document already loaded
  initializeApp();
}