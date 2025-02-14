import Phaser, { Physics } from 'phaser'

import TitleScreen from './scences/TitleScreen'
import Game from './scences/Game'
import GameBackground from './scences/GameBackground'
import GameOver from './scences/GameOver'

import * as SceneKeys from './consts/SceneKeys'

const config = {
    width: 800,
    height: 600,
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
        }
    }
} 

const game = new Phaser.Game(config)

game.scene.add(SceneKeys.TitleScreen, TitleScreen)
game.scene.add(SceneKeys.Game, Game)
game.scene.add(SceneKeys.GameBackground, GameBackground)
game.scene.add(SceneKeys.GameOver, GameOver)

game.scene.start('titlescreen')
//game.scene.start(SceneKeys.Game)
