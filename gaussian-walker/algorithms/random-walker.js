class Walker {
  constructor() {
    // Ensure canvas has valid dimensions before setting position
    const centerX = canvas.width > 0 ? canvas.width / 2 : window.innerWidth / 2;
    const centerY = canvas.height > 0 ? canvas.height / 2 : window.innerHeight / 2;

    this.x = centerX;
    this.y = centerY;
    this.vx = this.randomGaussian();
    this.vy = this.randomGaussian();
    this.lastX = this.x;
    this.lastY = this.y;
    this.color = getColor();
    this.speed = randomRange(settings.speedMin, settings.speedMax);
    this.jitter = randomRange(settings.jitterMin, settings.jitterMax);
    this.drift = randomRange(settings.driftMin, settings.driftMax);
    this.size = randomRange(settings.sizeMin, settings.sizeMax);
  }

  randomGaussian(mean = this.drift, std = this.jitter) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * std + mean;
  }

  step() {
    this.vx += this.randomGaussian() * 0.2;
    this.vy += this.randomGaussian() * 0.2;
    this.vx = Math.max(-this.speed, Math.min(this.speed, this.vx));
    this.vy = Math.max(-this.speed, Math.min(this.speed, this.vy));
    this.lastX = this.x;
    this.lastY = this.y;
    this.x += this.vx;
    this.y += this.vy;

    // Add bounds checking to prevent NaN values
    if (isNaN(this.x) || isNaN(this.y)) {
      this.x = canvas.width / 2;
      this.y = canvas.height / 2;
      this.vx = 0;
      this.vy = 0;
    }

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }

  draw() {
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.lineWidth = this.size;
    if (settings.showTrails && !settings.customSprite) {
      // Only draw lines for trails when no custom sprite is used
      ctx.beginPath();
      ctx.moveTo(this.lastX, this.lastY);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    } else {
      // Always draw shapes/sprites at current position
      drawShape(this.x, this.y, this.size, this.color);
    }
  }

  update() {
    this.step();
    this.draw();
  }
}
