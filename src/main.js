import Phaser, { Physics } from 'phaser'

import TitleScreen from './scences/TitleScreen'
import Game from './scences/Game'

const config = {
    width: 800,
    height: 600,
    type: Phaser.AUTO,
    backgroundColor: '#616161',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    }
} 

const game = new Phaser.Game(config)

game.scene.add('titlescreen', TitleScreen)
game.scene.add('game', Game)

// game.scene.start('titlescreen')
game.scene.start('game')
