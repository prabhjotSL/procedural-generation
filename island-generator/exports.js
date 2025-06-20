/**
 * exports.js - Export Functionality
 * Handles exporting the generated noise patterns as PNG images
 * and raw data in .map format for external use.
 */

/**
 * Exports the current canvas content as a PNG image file
 * Creates a download link and automatically triggers the download
 */
function exportImage() {
  const link = document.createElement('a');
  link.download = 'perlin_noise.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  
  // Clean up the temporary link
  setTimeout(() => link.remove(), 100);
}

/**
 * Exports the raw noise data as a .map file
 * Creates a comma-separated text file with normalized noise values
 * Useful for importing into other applications or game engines
 */
function exportMap() {
  let map = '';
  
  // Generate the same noise data as displayed on canvas
  for (let y = 0; y < config.height; y++) {
    for (let x = 0; x < config.width; x++) {
      // Calculate noise value for this pixel
      const nx = x / config.scale;
      const ny = y / config.scale;
      let value = (perlin(nx, ny + config.time, config.seed) + 1) / 2;
      value = applyMask(x, y, value);
      
      // Add to map string with appropriate formatting
      map += value.toFixed(3) + (x === config.width - 1 ? '\n' : ',');
    }
  }
  
  // Create and trigger download
  const blob = new Blob([map], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = 'perlin_noise.map';
  link.href = URL.createObjectURL(blob);
  link.click();
  
  // Clean up resources
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.remove();
  }, 100);
}

/**
 * Initialize export functionality by binding event handlers
 * Connects the HTML buttons to the export functions
 */
function initializeExports() {
  const downloadImageBtn = document.getElementById('downloadImage');
  const downloadMapBtn = document.getElementById('downloadMap');
  
  if (downloadImageBtn) {
    downloadImageBtn.addEventListener('click', exportImage);
  }
  
  if (downloadMapBtn) {
    downloadMapBtn.addEventListener('click', exportMap);
  }
}

// Initialize exports when this file loads
initializeExports();