const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.lineWidth = 1;
ctx.lineCap = "round";

let fps = 60;
function addAlpha(color, opacity) {
  // coerce values so ti is between 0 and 1.
  var _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
  return color + _opacity.toString(16).toUpperCase();
}
class Particle {
  constructor(effect) {
    this.effect = effect;
    this.x = Math.floor(Math.random() * this.effect.width);
    this.y = Math.floor(Math.random() * this.effect.height);
    this.speedX;
    this.speedY;
    this.speedMod = Math.random() * 8 + 1;
    this.history = [{ x: this.x, y: this.y }];
    this.maxLength = 50 - Math.random() * 40;
    this.angle = 0;
    this.lineWidth = Math.floor(Math.random() * 3 + 1);
    this.alpha = Math.random();
    this.colors = ["#FFB84C", "#F266AB", "#A459D1", "#2CD3E1"];
    this.color = addAlpha(
      this.colors[Math.floor(Math.random() * this.colors.length)],
      this.alpha
    );
    this.timer = this.maxLength * 2;
  }
  draw(context) {
    //context.fillRect(this.x, this.y, 20, 20);
    //console.log(this.color);
    context.beginPath();
    context.lineWidth = this.lineWidth;
    context.moveTo(this.history[0].x, this.history[0].y);
    for (let i = 0; i < this.history.length; i++) {
      context.lineTo(this.history[i].x, this.history[i].y);
    }
    context.strokeStyle = this.color;
    // context.shadowBlur = 12;
    // context.shadowColor = this.color;
    context.stroke();
  }
  update() {
    this.timer--;
    if (this.timer >= 1) {
      let x = Math.floor(this.x / this.effect.cellSize);
      let y = Math.floor(this.y / this.effect.cellSize);
      let index = y * this.effect.cols + x;
      this.angle = this.effect.flowField[index];

      this.speedX = Math.cos(this.angle);
      this.speedY = Math.sin(this.angle);

      this.x += this.speedX * this.speedMod;
      this.y += this.speedY * this.speedMod;

      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > this.maxLength) {
        this.history.shift();
      }
    } else if (this.history.length > 1) {
      this.history.shift();
    } else {
      this.reset();
    }
    //this.effect.flowFieldUpdate();
  }

  reset() {
    this.x = Math.floor(Math.random() * this.effect.width);
    this.y = Math.floor(Math.random() * this.effect.height);
    this.history = [{ x: this.x, y: this.y }];
    this.timer = this.maxLength * 2;
  }
}

class Effect {
  constructor(canvas) {
    this.canvas = canvas;
    this.height = this.canvas.height;
    this.width = this.canvas.width;
    this.particles = [];
    this.nOfParticles = 500;
    this.cellSize = 5;
    this.rows;
    this.cols;
    this.flowField = [];
    this.curve = 2.1;
    this.zoom = 0.01;
    this.debug = false;
    this.ffu = 1;

    this.init();

    window.addEventListener("keydown", (e) => {
      if (e.key === "d") this.debug = !this.debug;
    });

    window.addEventListener("resize", (e) => {
      this.resize(e.target.innerHeight, e.target.innerWidth);
    });
  }

  resize(height, width) {
    this.canvas.height = height;
    this.canvas.width = width;
    this.height = this.canvas.height;
    this.width = this.canvas.width;
    this.init();
  }

  init() {
    this.rows = Math.floor(this.canvas.height / this.cellSize);
    this.cols = Math.floor(this.canvas.width / this.cellSize);

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const angle =
          1.01 * Math.sin(this.ffu) * Math.cos(y * this.zoom) * this.curve -
          1.01 * Math.cos(this.ffu) * Math.sin(x * this.zoom);
        this.flowField.push(angle);
      }
    }
    this.particles = [];
    for (let i = 0; i < this.nOfParticles; i++) {
      this.particles.push(new Particle(this));
    }
  }

  flowFieldUpdate() {
    this.flowField = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const angle =
          1.01 * Math.cos(this.ffu) * Math.cos(y * this.zoom) * this.curve -
          1.01 * Math.cos(this.ffu) * Math.sin(x * this.zoom);
        this.flowField.push(angle);
      }
    }
    this.ffu += 0.005;
  }

  drawGrid(context) {
    if (this.debug) {
      context.save();
      context.lineWidth = 0.3;
      for (let c = 0; c < this.cols; c++) {
        context.beginPath();
        context.moveTo(this.cellSize * c, 0);
        context.lineTo(this.cellSize * c, this.height);
        context.stroke();
      }
      for (let r = 0; r < this.rows; r++) {
        context.beginPath();
        context.moveTo(0, this.cellSize * r);
        context.lineTo(this.width, this.cellSize * r);
        context.stroke();
      }
      context.restore();
    }
  }

  render(context) {
    this.drawGrid(context);
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
  }
}

const effect = new Effect(canvas);
effect.render(ctx);

function animate() {
  setTimeout(function () {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.render(ctx);
    effect.flowFieldUpdate();
  }, 1000 / fps);
}
animate();
