let canvas;
let ctx;
const strokeColor = 'white';
let canvasAnimation;
const mouseCoords = {
    x:0,
    y:0,
}
const lineLength = 150
const degree = 0
const cellSize = 5
const lineWidth = 0.09
window.onload = function() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const canvasObject = new CanvasClass(ctx, canvas.width, canvas.height, strokeColor, lineLength, degree, cellSize, lineWidth)
    canvasObject.animate()
}

document.addEventListener('mousemove', function(e) {
    mouseCoords.x = e.clientX;
    mouseCoords.y = e.clientY;
})

class CanvasClass {
    #ctx;
    #width;
    #height;
    length;
    radians;
    gradient;
    cellSize;

    constructor(ctx, width, height, strokeColor, length, radius, cellSize, lineWidth){
        this.#ctx = ctx;
        this.#width = width;
        this.#height = height;
        this.#ctx.lineWidth = lineWidth; 
        this.length = length;
        this.#createGradient();
        this.#degreeToRadians(radius);
        this.#ctx.strokeStyle = this.gradient;
        this.cellSize = cellSize
        this.trigger = false
        this.vr = 0.03
    }
    #createGradient(){
        this.gradient = this.#ctx.createLinearGradient(0,0,this.#width,this.#height)
        this.gradient.addColorStop('0.1','#ff5c33');
        this.gradient.addColorStop('0.2','#ff66b3');
        this.gradient.addColorStop('0.4','#ccccff');
        this.gradient.addColorStop('0.6','#b3ffff');
        this.gradient.addColorStop('0.8','#80ff80');
        this.gradient.addColorStop('0.9','#ffff33');
    }
    #draw(angle,x,y, length){
        this.#ctx.beginPath();
        this.#ctx.moveTo(x + this.#width/4, y+this.#height/4);
        this.#ctx.lineTo(x + Math.cos(angle) * length + this.#width/4, y + Math.sin(angle) * length + this.#height/4);
        this.#ctx.stroke();
    }
    #degreeToRadians(degree){
        this.radians =  degree * Math.PI / 180
    }
    animate(){
        this.#ctx.clearRect(0, 0, this.#width, this.#height);
        this.radians = this.radians +(this.trigger? - this.vr :+ this.vr)
        if(this.radians > 5){
            this.trigger = true
        }else if(this.radians  <= 0){
            this.trigger = false
        }
       
        for(let y = 0; y < this.#height / 2; y += this.cellSize){ 
            for(let x = 0; x < this.#width / 2; x += this.cellSize){ 
                const angle = (Math.cos(x * 0.01) + Math.sin(y * 0.01)) * this.radians
                this.#draw(angle, x, y, this.length)
            }
        };  
        canvasAnimation = requestAnimationFrame(this.animate.bind(this))
        
    }
}