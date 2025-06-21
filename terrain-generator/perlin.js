/**
 * perlin.js - Perlin Noise Implementation
 * Contains the core Perlin noise algorithm and related functions
 * for generating smooth, natural-looking noise patterns.
 */

/**
 * Generates a random 2D gradient vector for a given grid point
 * @param {number} ix - Integer X coordinate of grid point
 * @param {number} iy - Integer Y coordinate of grid point
 * @param {number} seed - Random seed for reproducible results
 * @returns {Object} Normalized gradient vector with x and y components
 */
function randomGradient(ix, iy, seed) {
  const angle = pseudoRandom(ix, iy, seed) * 2 * Math.PI;
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

/**
 * Computes the dot product between the gradient vector at a grid point
 * and the distance vector from the grid point to the input point
 * @param {number} ix - Integer X coordinate of grid point
 * @param {number} iy - Integer Y coordinate of grid point
 * @param {number} x - Input X coordinate
 * @param {number} y - Input Y coordinate
 * @param {number} seed - Random seed
 * @returns {number} Dot product result
 */
function dotGridGradient(ix, iy, x, y, seed) {
  const grad = randomGradient(ix, iy, seed);
  const dx = x - ix;
  const dy = y - iy;
  return dx * grad.x + dy * grad.y;
}

/**
 * Raw Perlin noise function - generates single octave noise
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} seed - Random seed for reproducible results
 * @returns {number} Noise value (approximately -1 to 1)
 */
function rawPerlin(x, y, seed = 0) {
  // Determine grid cell coordinates
  const x0 = Math.floor(x), x1 = x0 + 1;
  const y0 = Math.floor(y), y1 = y0 + 1;
  
  // Determine interpolation weights
  const sx = x - x0, sy = y - y0;
  const u = fade(sx), v = fade(sy);
  
  // Calculate noise contributions from each corner
  const n00 = dotGridGradient(x0, y0, x, y, seed);
  const n10 = dotGridGradient(x1, y0, x, y, seed);
  const n01 = dotGridGradient(x0, y1, x, y, seed);
  const n11 = dotGridGradient(x1, y1, x, y, seed);
  
  // Interpolate the results
  return lerp(lerp(n00, n10, u), lerp(n01, n11, u), v);
}

/**
 * Enhanced Perlin noise with multiple octaves (fractal noise)
 * Combines multiple frequencies to create more complex, natural patterns
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} seed - Random seed for reproducible results
 * @returns {number} Noise value (approximately -1 to 1)
 */
function perlin(x, y, seed = 0) {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;
  
  // Use multiple octaves only if enabled in config
  const octaves = config.octaves ? 4 : 1;
  
  for (let i = 0; i < octaves; i++) {
    total += rawPerlin(x * frequency, y * frequency, seed) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;    // Each octave has half the amplitude
    frequency *= 2;      // Each octave has double the frequency
  }
  
  // Normalize the result
  return total / maxValue;
}