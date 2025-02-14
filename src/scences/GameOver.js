import Phaser from 'phaser'
import * as GameScences from '../consts/SceneKeys'
import WebFontFile from './WebFontFile'

export default class GameBackground extends Phaser.Scene {
  preload() {
    // Load your font
    const fonts = new WebFontFile(this.load, 'Press Start 2P')
    this.load.addFile(fonts)
  }

  /**
   * @param {{ player1: number, player2: number}} data
   */
  create(data) {
    const { width, height } = this.sys.game.config
    let text = "Game Over"
    if (data.player1 > data.player2) {
        text = "Player Wins!"
    } 
    if (data.player1 < data.player2) {
        text = "Computer Wins!"
    }

    this.add.text(width / 2, height / 2, text, {
      fontSize: '40px',
      fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5, 0.5)
    
    this.add.text(width / 2, height / 2 + 50, 'Press SPACE to restart', {
        fontSize: '15px',
        fontFamily: '"Press Start 2P"'
        }).setOrigin(0.5, 0.5)
        
    this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start(GameScences.TitleScreen)
    })
  }
}
