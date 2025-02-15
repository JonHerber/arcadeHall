import Phaser from 'phaser'
import WebFontFile from './WebFontFile'
import { Pong, PongBackground, PongGameOver } from '../consts/SceneKeys'
import * as Colors from '../consts/Colors'

export default class Game extends Phaser.Scene {
  /**
   * Preload assets for this scene (e.g., fonts).
   * @returns {void}
   */
  preload() {
    // Load your font
    const fonts = new WebFontFile(this.load, 'Press Start 2P')
    this.load.addFile(fonts)
  }

  /**
   * Create all the main elements (objects, text, etc.) for the scene,
   * set up physics, and run the background scene.
   * @returns {void}
   */
  create() {
    // Run the background scene behind this scene
    this.scene.run(PongBackground)
    this.scene.sendToBack(PongBackground)

    // Initialize scores
    this.scorePlayer1 = 0
    this.scorePlayer2 = 0
    this.paused = false

    // Adjust the physics world bounds (extra space to left/right if needed)
    this.physics.world.setBounds(-100, 0, 1000, 600)

    // Create the ball and paddles
    this.createBall()
    this.createPaddles()

    // Set up collisions
    this.physics.add.collider(this.ball, this.paddleLeft)
    this.physics.add.collider(this.ball, this.paddleRight)

    // Create all text (score, labels, etc.)
    this.createText()

    // Capture keyboard input
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  /**
   * Update loop. Called on every frame to update logic such as
   * paddle movement and ball out-of-bounds checks.
   * @returns {void}
   */
  update() {
    if (this.paused) {
      return
    }

    // Handle player (left) paddle movement
    this.handlePaddleLeftMovement()

    // Simple AI for right paddle
    this.handlePaddleRightMovement()

    // Check if ball went out of bounds (goal) and update scores
    this.checkGoal()
    this.calculateScore()
  }

  /**
   * Create a ball object in the scene, enabling physics properties
   * such as bounce and world collision. Also calls `resetBall()` to
   * initialize its position and movement.
   * @private
   * @returns {void}
   */
  createBall() {
    this.ball = this.add.circle(400, 250, 10, Colors.White, 1)
    this.physics.add.existing(this.ball)

    this.ball.body.setBounce(1, 1)
    this.ball.body.setCollideWorldBounds(true, 1, 1)

    // Start ball movement
    this.time.delayedCall(500, () => {
        this.resetBall()
    })
  }

  /**
   * Create both the left and right paddles using a helper method.
   * @private
   * @returns {void}
   */
  createPaddles() {
    this.paddleLeft = this.createPaddle(50, 250)
    this.paddleRight = this.createPaddle(750, 250)
  }

  /**
   * Helper to create a single paddle at a given (x, y) position.
   * @private
   * @param {number} x - The x-coordinate for the paddle.
   * @param {number} y - The y-coordinate for the paddle.
   * @returns {Phaser.GameObjects.Rectangle} The newly created paddle.
   */
  createPaddle(x, y) {
    const paddle = this.add.rectangle(x, y, 10, 100, Colors.White, 1)
    this.physics.add.existing(paddle)
    paddle.body.setCollideWorldBounds(true, 1, 1)
    paddle.body.setImmovable(true)
    return paddle
  }

  /**
   * Creates and positions all text elements including player/computer
   * labels and score displays.
   * @private
   * @returns {void}
   */
  createText() {
    // Heading text
    this.add.text(10, 10, 'Player', {
      fontSize: '32px',
      fontFamily: '"Press Start 2P"'
    })
    this.add.text(540, 10, 'Computer', {
      fontSize: '32px',
      fontFamily: '"Press Start 2P"'
    })

    // Score text (big numbers)
    const fontStyle = {
      fontSize: '48px',
      fontFamily: '"Press Start 2P"'
    }

    this.scorePlayer1Text = this.add.text(
      50,
      50,
      this.scorePlayer1,
      fontStyle
    )
    this.scorePlayer2Text = this.add.text(
      600,
      50,
      this.scorePlayer2,
      fontStyle
    )
  }

  /**
   * Handles the player's (left paddle) movement using cursor keys.
   * Moves up/down with a velocity of +/-200, or stops if no key is pressed.
   * @private
   * @returns {void}
   */
  handlePaddleLeftMovement() {
    if (this.cursors.up.isDown) {
      this.paddleLeft.body.setVelocityY(-300)
    } else if (this.cursors.down.isDown) {
      this.paddleLeft.body.setVelocityY(300)
    } else {
      this.paddleLeft.body.setVelocityY(0)
    }
  }

  /**
   * Simple AI movement for the right paddle:
   * Moves up/down following the ball's y position.
   * @private
   * @returns {void}
   */
  handlePaddleRightMovement() {
    if (this.ball.y < this.paddleRight.y) {
      this.paddleRight.body.setVelocityY(-200)
    } else if (this.ball.y > this.paddleRight.y) {
      this.paddleRight.body.setVelocityY(200)
    } else {
      this.paddleRight.body.setVelocityY(0)
    }
  }

  /**
   * Resets the ball's position to the center (400, 250) and gives it
   * a random angle with a velocity of 200.
   * @private
   * @returns {void}
   */
  resetBall() {
    this.ball.setPosition(400, 250)
    const angle = Phaser.Math.Between(0, 360)
    this.physics.velocityFromAngle(angle, 300, this.ball.body.velocity)
  }

  /**
   * Checks if the ball has passed the left or right boundary
   * (x < 0 or x > 800), awarding a point to the appropriate player
   * and resetting the ball.
   * @private
   * @returns {void}
   */
  checkGoal() {
    // Score for player 2
    if (this.ball.x < 0) {
      this.resetBall()
      this.scorePlayer2++
    }

    // Score for player 1
    if (this.ball.x > 800) {
      this.resetBall()
      this.scorePlayer1++
    }
  }

  /**
   * Updates the displayed score for Player 1 and Player 2 based on
   * the current score values.
   * @private
   * @returns {void}
   */
  calculateScore() {
    this.scorePlayer1Text.setText(this.scorePlayer1)
    this.scorePlayer2Text.setText(this.scorePlayer2)

    const maxScore = 1
    if (this.scorePlayer1 >= maxScore || this.scorePlayer2 >= maxScore) {
      this.paused = true
      this.scene.stop(PongBackground)
      this.scene.start(PongGameOver, {
        player1: this.scorePlayer1,
        player2: this.scorePlayer2
      })
    }
  }
}
