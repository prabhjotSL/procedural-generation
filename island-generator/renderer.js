/**
 * renderer.js - Canvas Rendering and Visual Effects
 * Handles all canvas drawing operations, color mapping, masking,
 * and visual effects for the Perlin noise visualizer.
 */

// Canvas and context references
const canvas = document.getElementById('perlinCanvas');
const ctx = canvas.getContext('2d');

/**
 * Maps a noise value to a color based on configured thresholds
 * Supports both stepped and smoothly interpolated color transitions
 * @param {number} value - Noise value (0 to 1)
 * @returns {Object} RGB color object with r, g, b properties
 */
function getColorForValue(value) {
  for (let i = 0; i < config.thresholds.length; i++) {
    const t = config.thresholds[i];
    if (value <= t.threshold) {
      // Apply smooth color interpolation if enabled and not the first threshold
      if (config.smoothing && i > 0) {
        const prev = config.thresholds[i - 1];
        const ratio = (value - prev.threshold) / (t.threshold - prev.threshold);
        return interpolateColors(prev.color, t.color, ratio);
      }
      return hexToRgb(t.color);
    }
  }
  // Fallback to white if value exceeds all thresholds
  return hexToRgb('#ffffff');
}

/**
 * Applies various mask shapes to create island-like formations
 * Implements circle, square, and hexagon masks with distance-based falloff
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate  
 * @param {number} value - Original noise value
 * @returns {number} Masked noise value
 */
function applyMask(x, y, value) {
  if (!config.mask) return value;
  
  const cx = config.width / 2;
  const cy = config.height / 2;
  
  if (config.maskShape === 'circle') {
    // Calculate distance from center using Pythagorean theorem
    const distx = Math.abs(x - cx);
    const disty = Math.abs(y - cy);
    const dist = Math.sqrt(distx * distx + disty * disty);
    
    // Get maximum possible distance (diagonal to corner)
    const maxGrad = Math.sqrt(cx * cx + cy * cy);
    
    // Normalize distance and apply transformations
    let circleGrad = dist / maxGrad;
    circleGrad = circleGrad - 0.5;  // Center around 0 (-0.5 to 0.5)
    circleGrad = circleGrad * 2.0;  // Scale to -1 to 1
    circleGrad = -circleGrad;       // Invert (center positive, edges negative)
    
    // Apply noise only where gradient is positive (inside island)
    if (circleGrad > 0) {
      let maskedValue = value * circleGrad;
      
      // Apply contrast enhancement
      if (maskedValue > 0) {
        maskedValue = maskedValue * config.maskContrast;
      }
      
      // Clamp to valid range
      return Math.max(0, Math.min(1, maskedValue));
    } else {
      return 0; // Water/ocean areas
    }
  } 
  else if (config.maskShape === 'square') {
    // Square mask using Chebyshev distance (max of x,y distances)
    const dx = Math.abs(x - cx) / cx;
    const dy = Math.abs(y - cy) / cy;
    const squareDist = Math.max(dx, dy);
    let squareGrad = 1 - squareDist;
    squareGrad = Math.max(0, squareGrad);
    
    if (squareGrad > 0) {
      let maskedValue = value * squareGrad;
      if (maskedValue > 0) {
        maskedValue = maskedValue * (config.maskContrast * 0.75);
      }
      return Math.max(0, Math.min(1, maskedValue));
    }
    return 0;
  } 
  else if (config.maskShape === 'hexagon') {
    // Hexagonal mask using hexagonal distance function
    const dx = Math.abs(x - cx) / cx;
    const dy = Math.abs(y - cy) / cy;
    const qx = Math.abs(dx);
    const qy = Math.abs(dy);
    const hexDist = Math.max(qx, qy * 0.866 + qx * 0.5);
    let hexGrad = 1 - hexDist;
    hexGrad = Math.max(0, hexGrad);
    
    if (hexGrad > 0) {
      let maskedValue = value * hexGrad;
      if (maskedValue > 0) {
        maskedValue = maskedValue * (config.maskContrast * 0.75);
      }
      return Math.max(0, Math.min(1, maskedValue));
    }
    return 0;
  }
  
  return value;
}

/**
 * Main drawing function that renders the noise pattern to the canvas
 * Processes each pixel through noise generation, masking, coloring, and shading
 */
function draw() {
  // Update canvas dimensions
  canvas.width = config.width;
  canvas.height = config.height;
  
  // Create image data for pixel manipulation
  const img = ctx.createImageData(canvas.width, canvas.height);
  const data = img.data;
  
  // Process each pixel
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      // Convert pixel coordinates to noise coordinates
      const nx = x / config.scale;
      const ny = y / config.scale;
      
      // Generate noise value and normalize to 0-1 range
      let value = (perlin(nx, ny + config.time, config.seed) + 1) / 2;
      
      // Apply mask if enabled
      value = applyMask(x, y, value);
      
      // Determine color based on grayscale setting
      let rgb = config.grayscale 
        ? { r: value * 255, g: value * 255, b: value * 255 }
        : getColorForValue(value);
      
      // Apply pseudo-3D shading effect
      if (config.shading) {
        // Sample nearby point to calculate gradient
        const next = (perlin(nx + 0.01, ny + 0.01, config.seed) + 1) / 2;
        const shade = value - next;
        
        // Apply shading to each color channel
        rgb.r = Math.min(255, Math.max(0, rgb.r + shade * 100));
        rgb.g = Math.min(255, Math.max(0, rgb.g + shade * 100));
        rgb.b = Math.min(255, Math.max(0, rgb.b + shade * 100));
      }
      
      // Set pixel data (RGBA format)
      const idx = (y * canvas.width + x) * 4;
      data[idx] = rgb.r;       // Red
      data[idx + 1] = rgb.g;   // Green
      data[idx + 2] = rgb.b;   // Blue
      data[idx + 3] = 255;     // Alpha (fully opaque)
    }
  }
  
  // Draw the processed image data to the canvas
  ctx.putImageData(img, 0, 0);
}