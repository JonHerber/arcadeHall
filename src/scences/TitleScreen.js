import Phaser from 'phaser'
import WebFontFile from './WebFontFile'

export default class TitleScreen extends Phaser.Scene {
  preload() {
    // Load your font
        const fonts = new WebFontFile(this.load, 'Press Start 2P')
        this.load.addFile(fonts)
  }

  create() {
    // Get the game’s width and height
    const { width, height } = this.scale

    // Create the text at the center
    const text = this.add.text(width * 0.5, height * 0.5, 'Pong Time!', {
      fill: '#0f0',
      fontSize: '40px',
      fontFamily: '"Press Start 2P"'
    })

    // Set origin to the center (0.5, 0.5) so the text is centered on its position
    text.setOrigin(0.5, 0.5)

    this.add.text(width * 0.5, height * 0.6, 'Press SPACE to start', {
        fill: '#0f0',
        fontSize: '15px',
        fontFamily: '"Press Start 2P"'
        }).setOrigin(0.5, 0.5)

    this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('game')
    }

    )
  }
}
