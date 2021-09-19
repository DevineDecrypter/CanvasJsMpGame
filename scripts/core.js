import { store } from "./globals.js";

function randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function generateRandomColorRGBA() {
    const rgb = {
        r: randomIntFromInterval(0, 200),
        g: randomIntFromInterval(0, 200),
        b: randomIntFromInterval(0, 200),
    };
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 255)`;
}

export function generateRandomColorHex() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export function playerComponent(
    radius,
    color,
    x,
    y,
    name,
    mouseX,
    mouseY,
    shield,
    hp, 
    bulletBuff
) {
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.name = name;
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    this.shield = shield;
    this.bulletBuff = bulletBuff
    this.hp = hp;
    this.update = function () {
        this.context = store.gameArea.context;
        this.context.fillStyle = color;
        this.context.beginPath();
        //draw player circle
        this.context.arc(
            this.x,
            this.y,
            this.radius,
            getRadiansFromDegrees(0),
            getRadiansFromDegrees(360)
        );
        this.context.fill();

        this.context.font = "12px consolas";

        this.context.fillText(
            this.name,
            this.x - this.name.length * 3,
            this.y - 35
        );
        this.context.fillText(
            `${parseInt(this.hp)}/100`,
            this.x - (this.hp.toString().length + 5) * 3,
            this.y - 20
        );
        if (this.shield) {
            this.context.fillText(
                `${parseInt(this.shield)}/100`,
                this.x - (this.shield.toString().length + 5) * 3,
                this.y + 30
            );
        }

        //checks if the player has shield and gives it a circle representing the shield
        this.context.moveTo(this.x + 50, this.y);
        this.shield &&
            this.context.arc(
                this.x,
                this.y,
                50,
                getRadiansFromDegrees(0),
                getRadiansFromDegrees(360)
            );

        //draws the line from center of the player to the position of cursor
        // this.context.moveTo(this.x, this.y);
        // this.context.lineTo(this.mouseX, this.mouseY);
        
        this.context.stroke();
    };
}

export function buffComponent(radius, color, x, y) {
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.update = function () {
        this.context = store.gameArea.context;
        this.context.fillStyle = color;
        this.context.beginPath();
        this.context.arc(
            this.x,
            this.y,
            this.radius,
            getRadiansFromDegrees(0),
            getRadiansFromDegrees(360)
        );
        this.context.closePath();
        this.context.fill();
    };
}


export function bulletComponent(radius,x, y, shooter,color) {
    this.radius = radius
    this.x = x;
    this.y = y;
    this.shooter = shooter;
    this.color = color
    this.update = function () {
        this.context = store.gameArea.context;
        this.context.fillStyle = this.color;
        this.context.beginPath();
        this.context.arc(
            this.x,
            this.y,
            this.radius,
            getRadiansFromDegrees(0),
            getRadiansFromDegrees(360)
        );
        this.context.closePath()
        this.context.fill();
    };
}

export function generateRandomPosition(width, height) {
    const x = Math.floor(Math.random() * (width - 2 * 14));
    const y = Math.floor(Math.random() * (height - 2 * 14));
    return { x, y };
}

export function getRadiansFromDegrees(degrees) {
    return (Math.PI / 180) * degrees;
}

export function checkCollision(obj1, obj2) {
    const dist = Math.hypot(obj1.component.x - obj2.component.x, obj1.component.y - obj2.component.y)
    if (dist - obj1.component.radius - obj2.component.radius < 1) {
        return true
    }
    return false
}