import Phaser, { Physics } from 'phaser'

import TitleScreen from './scences/TitleScreen'
import Pong from './scences/Pong'
import PongBackground from './scences/PongBackground'
import PongGameOver from './scences/PongGameOver'
import MainMenue from './scences/MainMenue'
import Pacman from './scences/Pacman'
import PacmanDefeat from './scences/PacmanDefeat'

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
game.scene.add(SceneKeys.Pong, Pong)
game.scene.add(SceneKeys.PongBackground, PongBackground)
game.scene.add(SceneKeys.PongGameOver, PongGameOver)
game.scene.add(SceneKeys.MainMenue, MainMenue)
game.scene.add(SceneKeys.Pacman, Pacman)
game.scene.add(SceneKeys.PacmanDefeat, PacmanDefeat)

game.scene.start('MainMenue')
//game.scene.start(SceneKeys.Game)
