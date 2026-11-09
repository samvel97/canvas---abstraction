import "./style.css";

interface FieldOptions {
  lineLength: number;
  /** Initial rotation in degrees. */
  degree: number;
  cellSize: number;
  lineWidth: number;
  /** Oscillation speed of the field rotation, radians per second. */
  speed: number;
  /** Rotation oscillates between 0 and this value. */
  maxRadians: number;
}

const options: FieldOptions = {
  lineLength: 150,
  degree: 0,
  cellSize: 5,
  lineWidth: 0.09,
  speed: 1.8, // was 0.03 per frame at ~60 fps
  maxRadians: 5,
};

/** Cap frame delta so a backgrounded tab does not jump on return. */
const MAX_FRAME_DELTA = 0.1;

/**
 * Flow field: a grid of lines whose angles follow
 * (cos(x * 0.01) + sin(y * 0.01)) * radians, with `radians`
 * oscillating between 0 and maxRadians to animate the pattern.
 */
class FlowField {
  readonly #canvas: HTMLCanvasElement;
  readonly #ctx: CanvasRenderingContext2D;
  readonly #options: FieldOptions;
  #width = 0;
  #height = 0;
  #radians: number;
  #direction: 1 | -1 = 1;
  #lastTime: number | null = null;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, opts: FieldOptions) {
    this.#canvas = canvas;
    this.#ctx = ctx;
    this.#options = opts;
    this.#radians = (opts.degree * Math.PI) / 180;
    this.resize();
  }

  /** Match the viewport and render at device pixel ratio. */
  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.#width = window.innerWidth;
    this.#height = window.innerHeight;
    this.#canvas.width = Math.round(this.#width * dpr);
    this.#canvas.height = Math.round(this.#height * dpr);
    this.#canvas.style.width = `${this.#width}px`;
    this.#canvas.style.height = `${this.#height}px`;
    // Resizing resets context state, so restore transform and styles.
    this.#ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.#ctx.lineWidth = this.#options.lineWidth;
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

  #update(deltaSeconds: number) {
    const { speed, maxRadians } = this.#options;
    this.#radians += this.#direction * speed * deltaSeconds;
    if (this.#radians >= maxRadians) {
      this.#radians = maxRadians;
      this.#direction = -1;
    } else if (this.#radians <= 0) {
      this.#radians = 0;
      this.#direction = 1;
    }
  }

  #render() {
    const { cellSize, lineLength } = this.#options;
    const offsetX = this.#width / 4;
    const offsetY = this.#height / 4;
    const ctx = this.#ctx;

    ctx.clearRect(0, 0, this.#width, this.#height);
    // One path and one stroke() for all ~10k lines. Stroking each line
    // separately was ~3.4x slower (35 vs 118+ fps at 1440x681) with
    // practically identical pixels.
    ctx.beginPath();
    for (let y = 0; y < this.#height / 2; y += cellSize) {
      for (let x = 0; x < this.#width / 2; x += cellSize) {
        const angle = (Math.cos(x * 0.01) + Math.sin(y * 0.01)) * this.#radians;
        ctx.moveTo(x + offsetX, y + offsetY);
        ctx.lineTo(x + Math.cos(angle) * lineLength + offsetX, y + Math.sin(angle) * lineLength + offsetY);
      }
    }
    ctx.stroke();
  }

  frame = (time: number) => {
    const delta = this.#lastTime === null ? 0 : (time - this.#lastTime) / 1000;
    this.#lastTime = time;
    this.#update(Math.min(delta, MAX_FRAME_DELTA));
    this.#render();
    requestAnimationFrame(this.frame);
  };
}

const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
const ctx = canvas?.getContext("2d");
if (!canvas || !ctx) throw new Error("Canvas 2D context is not available");

const field = new FlowField(canvas, ctx, options);
window.addEventListener("resize", () => field.resize());
requestAnimationFrame(field.frame);
