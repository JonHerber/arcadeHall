import Phaser, { Physics } from 'phaser'

import TitleScreen from './scences/TitleScreen'
import Game from './scences/Game'
import GameBackground from './scences/GameBackground'

import * as SceneKeys from './consts/SceneKeys'

const config = {
    width: 800,
    height: 600,
    type: Phaser.AUTO,
    // backgroundColor: '#616161',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    }
} 

const game = new Phaser.Game(config)

game.scene.add(SceneKeys.TitleScreen, TitleScreen)
game.scene.add(SceneKeys.Game, Game)
game.scene.add(SceneKeys.GameBackground, GameBackground)

// game.scene.start('titlescreen')
game.scene.start(SceneKeys.Game)
