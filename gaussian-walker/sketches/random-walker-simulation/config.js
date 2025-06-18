const config = {
  speedMin: 1, speedMax: 15,
  jitterMin: 0, jitterMax: 5,
  driftMin: -1, driftMax: 1,
  sizeMin: 1, sizeMax: 10,
  walkerCountMin: 1, walkerCountMax: 1000,
  hueRangeMin: 0, hueRangeMax: 360
};

const settings = {
  walkers: 75,
  speedMin: 2,
  speedMax: 6,
  jitterMin: 0.2,
  jitterMax: 1.5,
  driftMin: -0.15,
  driftMax: 0.15,
  sizeMin: 1,
  sizeMax: 2.5,
  showTrails: false,
  colorMode: 'Hue Range',
  hueMin: 0,
  hueMax: 360,
  shape: 'square',
  customSprite: null,
  gifRecording: false,
  blackAndWhite: false,
  trailOpacity: 0.5,
  backgroundColor: '#111111',
  // GIF settings
  gifDuration: 5,
  gifWidth: 1024,
  gifHeight: 1024,
  gifQuality: 10,
  gifFrameRate: 60
};

const gifConfig = {
  durationMin: 1, durationMax: 60,
  widthMin: 200, widthMax: 1080,
  heightMin: 200, heightMax: 1080,
  qualityMin: 1, qualityMax: 20,
  frameRateMin: 5, frameRateMax: 60
};
