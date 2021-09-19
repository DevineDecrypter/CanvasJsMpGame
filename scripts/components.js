import { store } from "./globals.js";
import * as core from "./core.js";

export const player = class {
    constructor(name) {
        this.type = "Player";
        this.name = name;
        this.hp = 100;
        this.damage = 5;
        this.shield = 0;
        this.bulletBuff = false;
        this.movementSpeed = 5;
        this.color = core.generateRandomColorHex();
        this.controlsHandler();
        this.position = core.generateRandomPosition(store.gameArea.canvas.width, store.gameArea.canvas.height);
        this.component = new core.playerComponent(15, this.color, this.position.x, this.position.y, this.name, this.position.x, this.position.y, this.shield, this.bulletBuff);
        this.dead = false;

        this.spawn();
    }

    tick() {
        if (store.gameArea.components.players.filter((player) => player.name == this.name).length > 0) {
            this.dead = false;
        }
        if (!this.dead) {
            this.component.x += this.movement.xAxis() * this.movementSpeed;
            this.component.y += this.movement.yAxis() * this.movementSpeed;

            if(this.movement.xAxis() != 0 ||this.movement.yAxis() != 0) {
                // emit current pos
            }

            this.component.hp = this.hp;
            this.component.update();
        }

        this.checkCollisions()
    }

    spawn() {
        if (!store.gameArea.components.players) store.gameArea.components.players = [];
        store.gameArea.components.players.push(this);
    }

    destroy() {
        this.componentIndex = store.gameArea.components.players.findIndex((e) => e == this);
        setTimeout(() => {
            store.gameArea.components.players.splice(this.componentIndex, 1);
        }, 0);
    }

    checkCollisions() {
        // Bullets
        if (store.gameArea.components.bullets) {
            for (const bullet of store.gameArea.components.bullets) if (core.checkCollision(this, bullet)) this.processShot(bullet);
        }

        // Shields
        if (store.gameArea.components.shields) {
            for (const shield of store.gameArea.components.shields) if (core.checkCollision(this, shield)) this.applyBuff(shield);
        }

        // bullet Buffs
        if (store.gameArea.components.bulletBuffs) {
            for (const bulletBuff of store.gameArea.components.bulletBuffs) if (core.checkCollision(this, bulletBuff)) this.applyBuff(bulletBuff);
        }
    }

    processShot(bullet) {
        if (bullet.shooter == this.name) return;
        bullet.destroy();
        if (this.component.shield) {
            this.component.shield <= 0 ? (this.component.shield = 0) : (this.component.shield -= bullet.radius);
        } else {
            this.hp -= bullet.radius;
            if (this.hp <= 0) this.destroy();
        }
    }

    bulletBuffTimeout = {};
    applyBuff(buff) {
        buff.destroy();
        if (buff.type == "shield") {
            this.component.shield = 100;
            return;
        }
        if (buff.type == "bullet") {
            clearTimeout(this.bulletBuffTimeout);
            this.bulletBuffTimeout = setTimeout(() => this.bulletBuff = false, 10 * 1000);
            this.bulletBuff = true;
            return;
        }
    }

    movement = {
        dis: this,
        xAxis() {
            const corners = this.dis.corners;
            // check left limit
            if (!this.dis.keyStates.right && this.dis.component.x - (this.dis.component.radius + 3) <= 0) return 0;

            // check right limit
            if (!this.dis.keyStates.left && this.dis.component.x + (this.dis.component.radius + 3) >= store.gameArea.canvas.width) return 0;
            return this.dis.keyStates.left ? -1 : this.dis.keyStates.right ? 1 : 0;
        },
        yAxis() {
            const corners = this.dis.corners;
            // check top limit
            if (!this.dis.keyStates.down && this.dis.component.y - (this.dis.component.radius + 3) <= 0) return 0;

            // check bottom limit
            if (!this.dis.keyStates.up && this.dis.component.y + (this.dis.component.radius + 3) >= store.gameArea.canvas.height) return 0;
            return this.dis.keyStates.up ? -1 : this.dis.keyStates.down ? 1 : 0;
        },
    };

    keyStates = {
        up: false,
        down: false,
        left: false,
        right: false,
    };
    controlsHandler() {
        document.addEventListener("keydown", (e) => {
            if (e.code == "KeyW") {
                this.keyStates.up = true;
                this.keyStates.down = false;
            }
            if (e.code == "KeyS") {
                this.keyStates.down = true;
                this.keyStates.up = false;
            }
            if (e.code == "KeyA") {
                this.keyStates.left = true;
                this.keyStates.right = false;
            }
            if (e.code == "KeyD") {
                this.keyStates.right = true;
                this.keyStates.left = false;
            }
        });
        document.addEventListener("keyup", (e) => {
            e.code == "KeyW" && (this.keyStates.up = false);
            e.code == "KeyS" && (this.keyStates.down = false);
            e.code == "KeyA" && (this.keyStates.left = false);
            e.code == "KeyD" && (this.keyStates.right = false);
        });
        document.addEventListener("click", (e) => {
            this.shoot(this.component.x, this.component.y, e);
        });
    }

    shoot(x, y, e) {
        const angle = Math.atan2(e.y - this.component.y, e.x - this.component.x);
        const velocity = {
            x: Math.cos(angle) * 10,
            y: Math.sin(angle) * 10,
        };
        if (this.bulletBuff) {
            new bullet(10, x, y, this.name, velocity, this.color);
        } else {
            new bullet(5, x, y, this.name, velocity, this.color);
        }
    }
};

export const bullet = class {
    constructor(radius, x, y, shooter, velocity, color) {
        this.radius = radius;
        this.type = "Bullet";
        this.shooter = shooter;
        this.position = { x, y };
        this.velocity = velocity;
        this.component = new core.bulletComponent(radius, x, y, shooter, color);
        this.spawn();
    }
    tick() {
        this.component.x = this.component.x + this.velocity.x;
        this.component.y = this.component.y + this.velocity.y;

        // destroy if out of canvas
        if (this.component.x <= 0 || this.component.x >= store.gameArea.canvas.width || this.component.y <= 0 || this.component.y >= store.gameArea.canvas.height) this.destroy();
        this.component.update();
    }
    destroy() {
        this.componentIndex = store.gameArea.components.bullets.findIndex((e) => e == this);
        setTimeout(() => store.gameArea.components.bullets.splice(this.componentIndex, 1), 0);
    }
    spawn() {
        if (!store.gameArea.components.players.filter((player) => player.name == this.shooter).length > 0) return;
        if (!store.gameArea.components.bullets) store.gameArea.components.bullets = [];
        store.gameArea.components.bullets.push(this);
        // socket.emit('spawnBullet',this)
    }
};

export const shield = class {
    constructor() {
        this.type = "shield";
        this.color = "#0317fc";
        this.position = core.generateRandomPosition(store.gameArea.canvas.width, store.gameArea.canvas.height);
        this.component = new core.buffComponent(5, this.color, this.position.x, this.position.y);
        this.spawn();
    }
    tick() {
        this.component.update();
    }
    spawn() {
        if (!store.gameArea.components.shields) store.gameArea.components.shields = [];
        store.gameArea.components.shields.push(this);
    }
    destroy() {
        this.componentIndex = store.gameArea.components.shields.findIndex((e) => e == this);
        setTimeout(() => store.gameArea.components.shields.splice(this.componentIndex, 1), 0);
    }
};

export const bulletBuff = class {
    constructor() {
        this.type = "bullet";
        this.color = "black";
        this.position = core.generateRandomPosition(store.gameArea.canvas.width, store.gameArea.canvas.height);
        this.component = new core.buffComponent(5, this.color, this.position.x, this.position.y);
        this.spawn();
    }
    tick() {
        this.component.update();
    }
    spawn() {
        if (!store.gameArea.components.bulletBuffs) store.gameArea.components.bulletBuffs = [];
        store.gameArea.components.bulletBuffs.push(this);
    }
    destroy() {
        this.componentIndex = store.gameArea.components.bulletBuffs.findIndex((e) => e == this);
        setTimeout(() => store.gameArea.components.bulletBuffs.splice(this.componentIndex, 1), 0);
    }
};

export const enemy = class {
    constructor(playerData) {
        this.type = "enemy";
        this.name = playerData.name;
        this.hp = 100;
        this.damage = 5;
        this.shield = 0;
        this.bulletBuff = false;
        this.movementSpeed = 5;
        this.color = playerData.color
        this.position = playerData.position
        this.component = new core.playerComponent(15, this.color, this.position.x, this.position.y, this.name, this.position.x, this.position.y, this.shield, this.bulletBuff);
        this.dead = false;

        this.spawn();
    }

    updateEnemy(data) {
        // this.hp = data.hp;
        // this.damage = data.damage;
        // this.shield = data.shield;
        // this.bulletBuff = data.bulletBuff;
        // this.movementSpeed = data.movementSpeed;
        // this.dead = data.dead;
    }

    updatePosition(pos) {
        this.component.x += this.movement.xAxis() * this.movementSpeed;
        this.component.y += this.movement.yAxis() * this.movementSpeed;
        this.component.update();

        this.checkCollisions()
    }

    spawn() {
        if (!store.gameArea.components.enemies) store.gameArea.components.enemies = [];
        store.gameArea.components.enemies.push(this);
    }

    destroy() {
        this.componentIndex = store.gameArea.components.enemies.findIndex((e) => e == this);
        setTimeout(() => {
            store.gameArea.components.enemies.splice(this.componentIndex, 1);
        }, 0);
    }

    checkCollisions() {
        // Bullets
        if (store.gameArea.components.bullets) {
            for (const bullet of store.gameArea.components.bullets) if (core.checkCollision(this, bullet)) this.processShot(bullet);
        }

        // Shields
        if (store.gameArea.components.shields) {
            for (const shield of store.gameArea.components.shields) if (core.checkCollision(this, shield)) this.applyBuff(shield);
        }

        // bullet Buffs
        if (store.gameArea.components.bulletBuffs) {
            for (const bulletBuff of store.gameArea.components.bulletBuffs) if (core.checkCollision(this, bulletBuff)) this.applyBuff(bulletBuff);
        }
    }

    processShot(bullet) {
        if (bullet.shooter == this.name) return;
        bullet.destroy();
        if (this.component.shield) {
            this.component.shield <= 0 ? (this.component.shield = 0) : (this.component.shield -= bullet.radius);
        } else {
            this.hp -= bullet.radius;
            if (this.hp <= 0) this.destroy();
        }
    }

    bulletBuffTimeout = {};
    applyBuff(buff) {
        buff.destroy();
        if (buff.type == "shield") {
            this.component.shield = 100;
            return;
        }
        if (buff.type == "bullet") {
            clearTimeout(this.bulletBuffTimeout);
            this.bulletBuffTimeout = setTimeout(() => this.bulletBuff = false, 10 * 1000);
            this.bulletBuff = true;
            return;
        }
    }

    shoot(x, y, event) {
        const angle = Math.atan2(event.y - this.component.y, event.x - this.component.x);
        const velocity = {
            x: Math.cos(angle) * 10,
            y: Math.sin(angle) * 10,
        };
        if (this.bulletBuff) {
            new bullet(10, x, y, this.name, velocity, this.color);
        } else {
            new bullet(5, x, y, this.name, velocity, this.color);
        }
    }
}