import Phaser from "phaser"

export default class GameBackground extends Phaser.Scene {

    preload() {

    }

    create() {
        const { width, height } = this.sys.game.config;

        this.add.line(
            width / 2,          // center x of the line
            height / 2,         // center y of the line
            0,                  // starting x (relative to center)
            -height / 2,        // starting y (relative to center)
            0,                  // ending x (relative to center)
            height*2,         // ending y (relative to center)
            0xffffff,           // color
            1                   // alpha
        ).setLineWidth(5, 5);

        this.add.circle(width / 2, height / 2, 70)
        .setStrokeStyle(5, 0xffffff);
    }

}