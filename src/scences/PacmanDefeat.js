import Phaser from 'phaser'
import * as GameScences from '../consts/SceneKeys'
import WebFontFile from './WebFontFile'
import { defaultFont } from '../consts/Fonts'

export default class PacmanDefeat extends Phaser.Scene {
  preload() {
    // Load your font
    const fonts = new WebFontFile(this.load, 'Press Start 2P')
    this.load.addFile(fonts)
  }

  create() {
    const { width, height } = this.sys.game.config
    let text = "Game Over"

    this.add.text(width / 2, height / 2, text, {
      fontSize: '40px',
      fontFamily: defaultFont
    }).setOrigin(0.5, 0.5)
    
    this.add.text(width / 2, height / 2 + 50, 'Press SPACE to return to main menu', {
        fontSize: '15px',
        fontFamily: defaultFont
        }).setOrigin(0.5, 0.5)
        
    this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start(GameScences.MainMenue)
    })
  }
}
