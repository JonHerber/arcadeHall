import Phaser from "phaser"

import WebFontFile from "./WebFontFile"

import { GameBackground } from '../consts/SceneKeys'

export default class Game extends Phaser.Scene {

    preload() {
        const fonts = new WebFontFile(this.load, 'Press Start 2P')
        this.load.addFile(fonts)
    }

    create() {
        this.scene.run(GameBackground)
        this.scene.sendToBack(GameBackground)

        this.scorePlayer1 = 0
        this.scorePlayer2 = 0

        this.physics.world.setBounds(-100, 0, 1000, 600)

        this.ball = this.add.circle(400, 250, 10, 0xffffff, 1)
        this.physics.add.existing(this.ball)
        this.ball.body.setBounce(1, 1)

        this.ball.body.setCollideWorldBounds(true, 1, 1)

        this.resetBall()

        this.paddleLeft = this.add.rectangle(50, 250, 10, 100, 0xffffff, 1)
        this.physics.add.existing(this.paddleLeft)

        this.paddleLeft.body.setCollideWorldBounds(true, 1, 1)
        this.paddleLeft.body.setImmovable(true)

        this.paddleRight = this.add.rectangle(750, 250, 10, 100, 0xffffff, 1)
        this.physics.add.existing(this.paddleRight)

        this.paddleRight.body.setCollideWorldBounds(true, 1, 1)
        this.paddleRight.body.setImmovable(true)

        this.physics.add.collider(this.ball, this.paddleLeft)
        this.physics.add.collider(this.ball, this.paddleRight)

        const fontStyle = {
            fontSize: '48',
            fontFamily: '"Press Start 2P"'
        }

        this.add.text(10, 10, 'Player', {
            fontSize: '32px',
            fontFamily: '"Press Start 2P"'
          })

        this.add.text(540, 10, 'Computer', {
            fontSize: '32px',
            fontFamily: '"Press Start 2P"'
          })

        this.scorePlayer1Text = this.add.text(50, 50, this.scorePlayer1, {
            fontSize: '48px',
            fontFamily: '"Press Start 2P"'
          })
        this.scorePlayer2Text = this.add.text(600, 50, this.scorePlayer2, {
            fontSize: '48px',
            fontFamily: '"Press Start 2P"'
          })

        this.cursors = this.input.keyboard.createCursorKeys()


    }

    update() {
        if (this.cursors.up.isDown) {
            console.log('up')
            this.paddleLeft.body.setVelocityY(-200)
        }

        else if (this.cursors.down.isDown) {
            console.log('down')
            this.paddleLeft.body.setVelocityY(200)
        }

        else {
            this.paddleLeft.body.setVelocityY(0)
        }

        if (this.ball.y < this.paddleRight.y) {
            this.paddleRight.body.setVelocityY(-200)
        } else if (this.ball.y > this.paddleRight.y) {
            this.paddleRight.body.setVelocityY(200)
        } else {
            this.paddleRight.body.setVelocityY(0)
        }

        this.checkGoal()
        this.calculateScore()
    }

    resetBall() {
        this.ball.setPosition(400, 250)

        const angle = Phaser.Math.Between(0, 360)
        this.physics.velocityFromAngle(angle, 200, this.ball.body.velocity)
    }

    checkGoal() {
        // score for player 2
        if (this.ball.x < 0) {
            this.resetBall()
            this.scorePlayer2 += 1
        }

        // score for player 1
        if (this.ball.x > 800) {
            this.resetBall()
            this.scorePlayer1 += 1
        }
    }

    calculateScore() {
      
        this.scorePlayer1Text.setText(this.scorePlayer1)
        this.scorePlayer2Text.setText(this.scorePlayer2)
    }
}
