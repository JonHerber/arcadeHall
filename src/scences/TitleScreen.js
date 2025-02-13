import Phaser from "phaser"

export default class TitleScreen extends Phaser.Scene {

    preload() {
    }

    create() {
        const text = this.add.text(100, 100, 'Hello Phaser!', { fill: '#0f0' })
        text.setOrigin(0.5, 0.5)
    }


}