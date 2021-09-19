import { store } from "./globals.js";
import { player, enemy, shield, bulletBuff } from "./components.js";
import * as core from "./core.js";

store.gameArea = {
    canvas: document.createElement("canvas"),
    components: [],
    start() {
        this.canvas.style.border = "1px solid black";
        this.canvas.width = 1880;
        this.canvas.height = 900;
        this.context = this.canvas.getContext("2d");
        this.context.fillStyle = "rgba(0,0,0,0.5)";
        this.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(this.updategameArea, 20);
        this.createBuffs = setInterval(this.generateBuffs, 0.5 * 60 * 1000);
    },
    updategameArea() {
        // re-render area
        store.gameArea.clear();

        // tick components
        if (store.gameArea.components.bullets) store.gameArea.components.bullets.forEach((bullet) => bullet.tick());
        if (store.gameArea.components.shields) store.gameArea.components.shields.forEach((shield) => shield.tick());
        if (store.gameArea.components.bulletBuffs) store.gameArea.components.bulletBuffs.forEach((bulletBuff) => bulletBuff.tick());
        if (store.gameArea.components.players) store.gameArea.components.players.forEach((player) => player.tick());
    },
    generateBuffs() {
        new shield();
        new bulletBuff();
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
};


// -----------------------------------------------------------
const player = {
    nickname: 'mamad',
    name: '',
    color: '',
    position: ''
}

store.mp.players = []
socket.on("syncPlayers", (players) => {
    for (const playerData of players) {
        const enemyPlayer = new enemy(playerData)
        store.mp.players.push(enemyPlayer)
    }
});

socket.emit('joinGame', player);

console.log("Starting game...");
store.gameArea.start();
// const amir = new player("Amir")
new shield();
new bulletBuff();
// const trap = new tap()
