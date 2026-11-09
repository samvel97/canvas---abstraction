import "./style.css";

interface FieldOptions {
  lineLength: number;
  /** Initial rotation in degrees. */
  degree: number;
  cellSize: number;
  lineWidth: number;
}

const options: FieldOptions = {
  lineLength: 150,
  degree: 0,
  cellSize: 5,
  lineWidth: 0.09,
};

/**
 * Flow field: a grid of lines whose angles follow
 * (cos(x * 0.01) + sin(y * 0.01)) * radians, with `radians`
 * oscillating between 0 and 5 to animate the pattern.
 */
class FlowField {
  readonly #ctx: CanvasRenderingContext2D;
  readonly #width: number;
  readonly #height: number;
  readonly #options: FieldOptions;
  #radians: number;
  #reversing = false;
  readonly #step = 0.03;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number, opts: FieldOptions) {
    this.#ctx = ctx;
    this.#width = width;
    this.#height = height;
    this.#options = opts;
    this.#radians = (opts.degree * Math.PI) / 180;
    this.#ctx.lineWidth = opts.lineWidth;
    this.#ctx.strokeStyle = this.#createGradient();
  }

  #createGradient(): CanvasGradient {
    const gradient = this.#ctx.createLinearGradient(0, 0, this.#width, this.#height);
    gradient.addColorStop(0.1, "#ff5c33");
    gradient.addColorStop(0.2, "#ff66b3");
    gradient.addColorStop(0.4, "#ccccff");
    gradient.addColorStop(0.6, "#b3ffff");
    gradient.addColorStop(0.8, "#80ff80");
    gradient.addColorStop(0.9, "#ffff33");
    return gradient;
  }

  #drawLine(angle: number, x: number, y: number, length: number) {
    const offsetX = this.#width / 4;
    const offsetY = this.#height / 4;
    this.#ctx.beginPath();
    this.#ctx.moveTo(x + offsetX, y + offsetY);
    this.#ctx.lineTo(x + Math.cos(angle) * length + offsetX, y + Math.sin(angle) * length + offsetY);
    this.#ctx.stroke();
  }

  animate = () => {
    this.#ctx.clearRect(0, 0, this.#width, this.#height);
    this.#radians += this.#reversing ? -this.#step : this.#step;
    if (this.#radians > 5) {
      this.#reversing = true;
    } else if (this.#radians <= 0) {
      this.#reversing = false;
    }

    const { cellSize, lineLength } = this.#options;
    for (let y = 0; y < this.#height / 2; y += cellSize) {
      for (let x = 0; x < this.#width / 2; x += cellSize) {
        const angle = (Math.cos(x * 0.01) + Math.sin(y * 0.01)) * this.#radians;
        this.#drawLine(angle, x, y, lineLength);
      }
    }
    requestAnimationFrame(this.animate);
  };
}

const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
const ctx = canvas?.getContext("2d");
if (!canvas || !ctx) throw new Error("Canvas 2D context is not available");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
new FlowField(ctx, canvas.width, canvas.height, options).animate();
