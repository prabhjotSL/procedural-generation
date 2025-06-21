/**
 * utils.js - Utility functions for the Perlin Noise Visualizer
 * Contains helper functions for mathematical calculations, color conversions,
 * and other utility operations used throughout the application.
 */

/**
 * Returns the fractional part of a number
 * @param {number} x - Input number
 * @returns {number} Fractional part (0 to 1)
 */
function fract(x) { 
  return x - Math.floor(x); 
}

/**
 * Generates a pseudo-random number based on x, y coordinates and seed
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate  
 * @param {number} seed - Random seed value
 * @returns {number} Pseudo-random number between 0 and 1
 */
function pseudoRandom(x, y, seed = 0) {
  const dot = x * 127.1 + y * 311.7 + seed * 9999;
  return fract(Math.sin(dot) * 43758.5453123);
}

/**
 * Fade function for smooth interpolation (Ken Perlin's improved version)
 * @param {number} t - Input value (0 to 1)
 * @returns {number} Smoothed value
 */
function fade(t) { 
  return t * t * t * (t * (t * 6 - 15) + 10); 
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0 to 1)
 * @returns {number} Interpolated value
 */
function lerp(a, b, t) { 
  return a + t * (b - a); 
}

/**
 * Converts hex color string to RGB object
 * @param {string} hex - Hex color string (e.g., "#FF0000")
 * @returns {Object} RGB object with r, g, b properties (0-255)
 */
function hexToRgb(hex) {
  const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return parsed ? {
    r: parseInt(parsed[1], 16),
    g: parseInt(parsed[2], 16),
    b: parseInt(parsed[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Interpolates between two colors
 * @param {string} c1 - First color (hex string)
 * @param {string} c2 - Second color (hex string)
 * @param {number} t - Interpolation factor (0 to 1)
 * @returns {Object} Interpolated RGB color object
 */
function interpolateColors(c1, c2, t) {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  return {
    r: Math.round(lerp(a.r, b.r, t)),
    g: Math.round(lerp(a.g, b.g, t)),
    b: Math.round(lerp(a.b, b.b, t))
  };
}

/**
 * Performance optimization - debounced function execution
 * Prevents excessive function calls during rapid parameter changes
 */
let drawTimeout;
function debouncedDraw() {
  clearTimeout(drawTimeout);
  drawTimeout = setTimeout(draw, 50); // 50ms debounce
}