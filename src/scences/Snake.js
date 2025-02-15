import Phaser from "phaser";
import WebFontFile from "./WebFontFile";
import { defaultFont } from "../consts/Fonts";
import { Snake as SnakeSceneKey } from "../consts/SceneKeys";

export default class Snake extends Phaser.Scene {
  constructor() {
    super({ key: SnakeSceneKey });
  }

  preload() {
    // Load the custom font
    const fonts = new WebFontFile(this.load, "Press Start 2P");
    this.load.addFile(fonts);
  }

  create() {
    // Set up the game board (grid size, snake, food, input, etc.)
    this.createGameboard();

    // Create score text using the loaded font
    this.scoreText = this.add.text(10, 10, "Score: 0", {
      fontFamily: '"Press Start 2P"',
      fontSize: "16px",
      fill: "#fff",
    });

    // Create a graphics object for drawing the game elements
    this.graphics = this.add.graphics();
  }

  createGameboard() {
    // Grid settings (in cells)
    this.cellSize = 20;
    this.boardWidth = 40;
    this.boardHeight = 30;

    // Reset score
    this.score = 0;

    // Initialize the snake at the center of the board
    this.snake = [];
    const startX = Math.floor(this.boardWidth / 2);
    const startY = Math.floor(this.boardHeight / 2);
    this.snake.push({ x: startX, y: startY });

    // The snake starts moving to the right.
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };

    // Place the first food item at a random valid position
    this.food = this.getRandomFoodPosition();

    // Set up the arrow key input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Set a timer for snake movement (in milliseconds)
    this.moveInterval = 100;
    this.lastMoveTime = 0;
  }

  update(time) {
    // Handle input: update the next direction (but avoid reversing if snake is longer than one)
    if (this.cursors.left.isDown && this.direction.x !== 1) {
      this.nextDirection = { x: -1, y: 0 };
    } else if (this.cursors.right.isDown && this.direction.x !== -1) {
      this.nextDirection = { x: 1, y: 0 };
    } else if (this.cursors.up.isDown && this.direction.y !== 1) {
      this.nextDirection = { x: 0, y: -1 };
    } else if (this.cursors.down.isDown && this.direction.y !== -1) {
      this.nextDirection = { x: 0, y: 1 };
    }

    // Move the snake if the move interval has passed
    if (time >= this.lastMoveTime + this.moveInterval) {
      this.lastMoveTime = time;
      this.moveSnake();
      this.drawGame();
    }
  }

  moveSnake() {
    // Update the current direction with the latest input
    this.direction = this.nextDirection;

    // Determine the new head position
    const head = this.snake[0];
    let newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    };

    // Wrap the snake position when leaving the board
    if (newHead.x < 0) {
      newHead.x = this.boardWidth - 1;
    } else if (newHead.x >= this.boardWidth) {
      newHead.x = 0;
    }
    if (newHead.y < 0) {
      newHead.y = this.boardHeight - 1;
    } else if (newHead.y >= this.boardHeight) {
      newHead.y = 0;
    }

    // Check for collision with the snake itself
    for (const segment of this.snake) {
      if (segment.x === newHead.x && segment.y === newHead.y) {
        this.restartGame();
        return;
      }
    }

    // Add the new head to the snake body
    this.snake.unshift(newHead);

    // Check if the snake has eaten the food
    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      // Increase score and update text
      this.score++;
      this.scoreText.setText(`Score: ${this.score}`);
      // Place new food at a random valid position
      this.food = this.getRandomFoodPosition();
    } else {
      // Remove the last segment so the snake moves forward
      this.snake.pop();
    }
  }

  getRandomFoodPosition() {
    let valid = false;
    let foodPosition;
    while (!valid) {
      const x = Phaser.Math.Between(0, this.boardWidth - 1);
      const y = Phaser.Math.Between(0, this.boardHeight - 1);
      foodPosition = { x, y };
      valid = true;
      // Ensure the food does not appear on the snake
      for (const segment of this.snake) {
        if (segment.x === x && segment.y === y) {
          valid = false;
          break;
        }
      }
    }
    return foodPosition;
  }

  drawGame() {
    // Clear previous drawings
    this.graphics.clear();

    // Draw the board background
    this.graphics.fillStyle(0x000000, 1);
    this.graphics.fillRect(
      0,
      0,
      this.boardWidth * this.cellSize,
      this.boardHeight * this.cellSize
    );

    // Draw the food (red square)
    this.graphics.fillStyle(0xff0000, 1);
    this.graphics.fillRect(
      this.food.x * this.cellSize,
      this.food.y * this.cellSize,
      this.cellSize,
      this.cellSize
    );

    // Draw the snake segments
    for (let i = 0; i < this.snake.length; i++) {
      const segment = this.snake[i];
      const x = segment.x * this.cellSize;
      const y = segment.y * this.cellSize;
      if (i === 0) {
        // Draw the snake head with a face
        this.graphics.fillStyle(0x00ff00, 1);
        this.graphics.fillRect(x, y, this.cellSize, this.cellSize);

        // Draw eyes based on current direction
        this.graphics.fillStyle(0x000000, 1);
        if (this.direction.x === 1) {
          // Facing right
          this.graphics.fillCircle(x + this.cellSize * 0.75, y + this.cellSize * 0.3, 2);
          this.graphics.fillCircle(x + this.cellSize * 0.75, y + this.cellSize * 0.7, 2);
        } else if (this.direction.x === -1) {
          // Facing left
          this.graphics.fillCircle(x + this.cellSize * 0.25, y + this.cellSize * 0.3, 2);
          this.graphics.fillCircle(x + this.cellSize * 0.25, y + this.cellSize * 0.7, 2);
        } else if (this.direction.y === 1) {
          // Facing down
          this.graphics.fillCircle(x + this.cellSize * 0.3, y + this.cellSize * 0.75, 2);
          this.graphics.fillCircle(x + this.cellSize * 0.7, y + this.cellSize * 0.75, 2);
        } else if (this.direction.y === -1) {
          // Facing up
          this.graphics.fillCircle(x + this.cellSize * 0.3, y + this.cellSize * 0.25, 2);
          this.graphics.fillCircle(x + this.cellSize * 0.7, y + this.cellSize * 0.25, 2);
        } else {
          // Default eyes (if no direction is set)
          this.graphics.fillCircle(x + this.cellSize * 0.3, y + this.cellSize * 0.3, 2);
          this.graphics.fillCircle(x + this.cellSize * 0.7, y + this.cellSize * 0.3, 2);
        }
      } else {
        // Draw snake body
        this.graphics.fillStyle(0x00ff00, 1);
        this.graphics.fillRect(x, y, this.cellSize, this.cellSize);
      }
    }
  }

  restartGame() {
    // Restart the game by reinitializing the board and resetting the score
    this.createGameboard();
    this.scoreText.setText("Score: 0");
  }
}
