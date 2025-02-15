import Phaser from 'phaser';
import { Pacman } from '../consts/SceneKeys';
import { defaultFont } from '../consts/Fonts';
import WebFontFile from './WebFontFile';
import { PacmanDefeat } from '../consts/SceneKeys';

export default class PacmanScene extends Phaser.Scene {
  constructor() {
    super({ key: Pacman });
    /** @type {{x: number, y: number, angle: number}|null} */
    this.currentDirection = null;
    /** @type {{x: number, y: number, angle: number}|null} */
    this.nextDirection = null;
    // We'll store all ghosts in an array.
    this.ghosts = [];
    // Initialize the score.
    this.score = 0;
    // Invincibility state for Pacman.
    this.isInvincible = false;
    this.invincibleEndTime = 0;
    // Player lives.
    this.lives = 3;
  }

  preload() {
    this.createPacmanTextures();
    this.createGhostTextures();
    this.createPelletTexture();
    this.createPowerupTexture();
    // Load your font.
    const fonts = new WebFontFile(this.load, 'Press Start 2P');
    this.load.addFile(fonts);
  }

  create() {
    this.createAnimations();
    this.cameras.main.setBackgroundColor('#000');
    this.physics.world.setBounds(0, 0, 800, 600);

    this.createMaze();
    this.createSprites();

    // Create the score text in the top-left corner.
    this.score = 0;
    this.scoreText = this.add.text(10, 10, 'Score: 0', {
      fontSize: '16px',
      fill: '#fff',
      fontFamily: defaultFont,
    });

    // Create the heart texture (if not already created)
    this.createHeartTexture();
    // Create heart sprites for lives in the top-right corner.
    this.hearts = [];
    const margin = 10;
    const heartSpacing = 5;
    const heartWidth = 20; // Texture is 20x20
    for (let i = 0; i < this.lives; i++) {
      const x =
        this.cameras.main.width -
        margin -
        heartWidth / 2 -
        i * (heartWidth + heartSpacing);
      const y = margin + heartWidth / 2;
      const heart = this.add.image(x, y, 'heart');
      // Ensure the hearts stay fixed on the screen.
      heart.setScrollFactor(0);
      this.hearts.push(heart);
    }

    this.createInput();
  }

  update(time, delta) {
    this.handlePacmanMovement();
    this.ghosts.forEach((ghost) => {
      if (ghost.active) {
        this.handleGhostMovement(ghost);
      }
    });

    // Handle invincibility timer and ghost tint.
    if (this.isInvincible) {
      if (time >= this.invincibleEndTime) {
        this.isInvincible = false;
        this.ghosts.forEach((ghost) => {
          if (ghost.active) ghost.clearTint();
        });
      } else {
        // While invincible, tint all active ghosts blue.
        this.ghosts.forEach((ghost) => {
          if (ghost.active) ghost.setTint(0x0000ff);
        });
      }
    } else {
      this.ghosts.forEach((ghost) => {
        if (ghost.active) ghost.clearTint();
      });
    }
  }

  /**
   * Callback when Pacman overlaps a pellet.
   */
  eatPellet(pacman, pellet) {
    pellet.disableBody(true, true);
    // Increase the score by 10.
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
    if (this.pellets.countActive(true) === 0) {
      this.add
        .text(400, 300, 'You Win!', { fontSize: '48px', fill: '#fff' })
        .setOrigin(0.5);
      this.time.delayedCall(3000, () => {
        this.scene.restart();
      });
    }
  }

  /**
   * Callback when Pacman collides with a ghost.
   * If Pacman is invincible, the ghost is "killed" and the invincibility
   * duration is extended by 7 seconds.
   * Otherwise, Pacman loses a life. When a life is lost, one heart sprite is removed.
   * If lives remain, Pacman is temporarily removed and respawns at the top-left after 1 second.
   * If no lives remain, the game restarts.
   */
  hitGhost(pacman, ghost) {
    if (this.isInvincible) {
      ghost.disableBody(true, true);
      // Extend invincibility by 7 seconds (7000 ms).
      this.invincibleEndTime += 7000;
      this.score += 100;
      this.scoreText.setText('Score: ' + this.score);
    } else {
      // Decrement a life.
      this.lives -= 1;
      // Remove one heart sprite.
      const lostHeart = this.hearts.pop();
      if (lostHeart) {
        lostHeart.destroy();
      }

      if (this.lives <= 0) {
        // Game over.
        this.scene.start(PacmanDefeat);
      } else {
        // Disable Pacman immediately.
        this.pacman.disableBody(true, true);
        // After 1 second, respawn Pacman at the top-left open cell.
        this.time.delayedCall(1000, () => {
          // In this maze, (60, 60) is an open cell.
          this.pacman.enableBody(true, 60, 60, true, true);
          this.pacman.setVelocity(0, 0);
          this.currentDirection = null;
          this.nextDirection = null;
        });
      }
    }
  }

  /**
   * Callback when Pacman overlaps a powerup.
   */
  eatPowerup(pacman, powerup) {
    powerup.disableBody(true, true);
    const extraTime = 7000; // milliseconds
    const currentTime = this.time.now;
    if (this.isInvincible && this.invincibleEndTime > currentTime) {
      // Already invincible; extend the duration.
      this.invincibleEndTime += extraTime;
    } else {
      this.isInvincible = true;
      this.invincibleEndTime = currentTime + extraTime;
    }
  }

  /**
   * Create textures for Pacman (closed and open mouth frames).
   */
  createPacmanTextures() {
    const pacmanGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    // Frame 0: Pacman closed (full circle)
    pacmanGraphics.fillStyle(0xffff00, 1);
    pacmanGraphics.fillCircle(16, 16, 16);
    pacmanGraphics.generateTexture('pacmanClosed', 32, 32);
    pacmanGraphics.clear();
    // Frame 1: Pacman open (with mouth open)
    pacmanGraphics.fillStyle(0xffff00, 1);
    pacmanGraphics.slice(
      16,
      16,
      16,
      Phaser.Math.DegToRad(30),
      Phaser.Math.DegToRad(330),
      false
    );
    pacmanGraphics.lineTo(16, 16);
    pacmanGraphics.closePath();
    pacmanGraphics.fillPath();
    pacmanGraphics.generateTexture('pacmanOpen', 32, 32);
    pacmanGraphics.destroy();
  }

  /**
   * Create textures for the ghosts.
   */
  createGhostTextures() {
    // Red ghost textures.
    let ghostGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    // Frame 1: Red ghost with raised eyes.
    ghostGraphics.fillStyle(0xff0000, 1);
    ghostGraphics.beginPath();
    ghostGraphics.moveTo(0, 16);
    ghostGraphics.arc(16, 16, 16, Math.PI, 0, false);
    ghostGraphics.lineTo(32, 32);
    ghostGraphics.lineTo(24, 28);
    ghostGraphics.lineTo(16, 32);
    ghostGraphics.lineTo(8, 28);
    ghostGraphics.lineTo(0, 32);
    ghostGraphics.closePath();
    ghostGraphics.fillPath();
    // Eyes for frame 1.
    ghostGraphics.fillStyle(0xffffff, 1);
    ghostGraphics.fillCircle(10, 18, 4);
    ghostGraphics.fillCircle(22, 18, 4);
    ghostGraphics.fillStyle(0x0000ff, 1);
    ghostGraphics.fillCircle(10, 18, 2);
    ghostGraphics.fillCircle(22, 18, 2);
    ghostGraphics.generateTexture('ghost1', 32, 32);
    ghostGraphics.clear();
    // Frame 2: Red ghost with eyes shifted.
    ghostGraphics.fillStyle(0xff0000, 1);
    ghostGraphics.beginPath();
    ghostGraphics.moveTo(0, 16);
    ghostGraphics.arc(16, 16, 16, Math.PI, 0, false);
    ghostGraphics.lineTo(32, 32);
    ghostGraphics.lineTo(24, 28);
    ghostGraphics.lineTo(16, 32);
    ghostGraphics.lineTo(8, 28);
    ghostGraphics.lineTo(0, 32);
    ghostGraphics.closePath();
    ghostGraphics.fillPath();
    // Eyes for frame 2.
    ghostGraphics.fillStyle(0xffffff, 1);
    ghostGraphics.fillCircle(10, 20, 4);
    ghostGraphics.fillCircle(22, 20, 4);
    ghostGraphics.fillStyle(0x0000ff, 1);
    ghostGraphics.fillCircle(10, 20, 2);
    ghostGraphics.fillCircle(22, 20, 2);
    ghostGraphics.generateTexture('ghost2', 32, 32);
    ghostGraphics.destroy();

    // Pink ghost textures.
    let ghostPinkGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    // Frame 1: Pink ghost.
    ghostPinkGraphics.fillStyle(0xff69b4, 1);
    ghostPinkGraphics.beginPath();
    ghostPinkGraphics.moveTo(0, 16);
    ghostPinkGraphics.arc(16, 16, 16, Math.PI, 0, false);
    ghostPinkGraphics.lineTo(32, 32);
    ghostPinkGraphics.lineTo(24, 28);
    ghostPinkGraphics.lineTo(16, 32);
    ghostPinkGraphics.lineTo(8, 28);
    ghostPinkGraphics.lineTo(0, 32);
    ghostPinkGraphics.closePath();
    ghostPinkGraphics.fillPath();
    // Eyes for frame 1.
    ghostPinkGraphics.fillStyle(0xffffff, 1);
    ghostPinkGraphics.fillCircle(10, 18, 4);
    ghostPinkGraphics.fillCircle(22, 18, 4);
    ghostPinkGraphics.fillStyle(0x0000ff, 1);
    ghostPinkGraphics.fillCircle(10, 18, 2);
    ghostPinkGraphics.fillCircle(22, 18, 2);
    ghostPinkGraphics.generateTexture('ghostPink1', 32, 32);
    ghostPinkGraphics.clear();
    // Frame 2: Pink ghost.
    ghostPinkGraphics.fillStyle(0xff69b4, 1);
    ghostPinkGraphics.beginPath();
    ghostPinkGraphics.moveTo(0, 16);
    ghostPinkGraphics.arc(16, 16, 16, Math.PI, 0, false);
    ghostPinkGraphics.lineTo(32, 32);
    ghostPinkGraphics.lineTo(24, 28);
    ghostPinkGraphics.lineTo(16, 32);
    ghostPinkGraphics.lineTo(8, 28);
    ghostPinkGraphics.lineTo(0, 32);
    ghostPinkGraphics.closePath();
    ghostPinkGraphics.fillPath();
    // Eyes for frame 2.
    ghostPinkGraphics.fillStyle(0xffffff, 1);
    ghostPinkGraphics.fillCircle(10, 20, 4);
    ghostPinkGraphics.fillCircle(22, 20, 4);
    ghostPinkGraphics.fillStyle(0x0000ff, 1);
    ghostPinkGraphics.fillCircle(10, 20, 2);
    ghostPinkGraphics.fillCircle(22, 20, 2);
    ghostPinkGraphics.generateTexture('ghostPink2', 32, 32);
    ghostPinkGraphics.destroy();

    // Orange ghost textures.
    let ghostOrangeGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    // Frame 1: Orange ghost.
    ghostOrangeGraphics.fillStyle(0xffa500, 1);
    ghostOrangeGraphics.beginPath();
    ghostOrangeGraphics.moveTo(0, 16);
    ghostOrangeGraphics.arc(16, 16, 16, Math.PI, 0, false);
    ghostOrangeGraphics.lineTo(32, 32);
    ghostOrangeGraphics.lineTo(24, 28);
    ghostOrangeGraphics.lineTo(16, 32);
    ghostOrangeGraphics.lineTo(8, 28);
    ghostOrangeGraphics.lineTo(0, 32);
    ghostOrangeGraphics.closePath();
    ghostOrangeGraphics.fillPath();
    // Eyes for frame 1.
    ghostOrangeGraphics.fillStyle(0xffffff, 1);
    ghostOrangeGraphics.fillCircle(10, 18, 4);
    ghostOrangeGraphics.fillCircle(22, 18, 4);
    ghostOrangeGraphics.fillStyle(0x0000ff, 1);
    ghostOrangeGraphics.fillCircle(10, 18, 2);
    ghostOrangeGraphics.fillCircle(22, 18, 2);
    ghostOrangeGraphics.generateTexture('ghostOrange1', 32, 32);
    ghostOrangeGraphics.clear();
    // Frame 2: Orange ghost.
    ghostOrangeGraphics.fillStyle(0xffa500, 1);
    ghostOrangeGraphics.beginPath();
    ghostOrangeGraphics.moveTo(0, 16);
    ghostOrangeGraphics.arc(16, 16, 16, Math.PI, 0, false);
    ghostOrangeGraphics.lineTo(32, 32);
    ghostOrangeGraphics.lineTo(24, 28);
    ghostOrangeGraphics.lineTo(16, 32);
    ghostOrangeGraphics.lineTo(8, 28);
    ghostOrangeGraphics.lineTo(0, 32);
    ghostOrangeGraphics.closePath();
    ghostOrangeGraphics.fillPath();
    // Eyes for frame 2.
    ghostOrangeGraphics.fillStyle(0xffffff, 1);
    ghostOrangeGraphics.fillCircle(10, 20, 4);
    ghostOrangeGraphics.fillCircle(22, 20, 4);
    ghostOrangeGraphics.fillStyle(0x0000ff, 1);
    ghostOrangeGraphics.fillCircle(10, 20, 2);
    ghostOrangeGraphics.fillCircle(22, 20, 2);
    ghostOrangeGraphics.generateTexture('ghostOrange2', 32, 32);
    ghostOrangeGraphics.destroy();
  }

  /**
   * Create animations for Pacman and the ghosts.
   */
  createAnimations() {
    this.anims.create({
      key: 'pacmanAnim',
      frames: [{ key: 'pacmanClosed' }, { key: 'pacmanOpen' }],
      frameRate: 10,
      repeat: -1,
    });
    // Red ghost animation.
    this.anims.create({
      key: 'ghostAnim',
      frames: [{ key: 'ghost1' }, { key: 'ghost2' }],
      frameRate: 5,
      repeat: -1,
    });
    // Pink ghost animation.
    this.anims.create({
      key: 'ghostPinkAnim',
      frames: [{ key: 'ghostPink1' }, { key: 'ghostPink2' }],
      frameRate: 5,
      repeat: -1,
    });
    // Orange ghost animation.
    this.anims.create({
      key: 'ghostOrangeAnim',
      frames: [{ key: 'ghostOrange1' }, { key: 'ghostOrange2' }],
      frameRate: 5,
      repeat: -1,
    });
  }

  /**
   * Create texture for the pellet.
   */
  createPelletTexture() {
    const pelletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    pelletGraphics.fillStyle(0xffffff, 1);
    pelletGraphics.fillCircle(4, 4, 4);
    pelletGraphics.generateTexture('pellet', 8, 8);
    pelletGraphics.destroy();
  }

  /**
   * Create texture for the powerup.
   */
  createPowerupTexture() {
    const powerupGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    // Magenta color for the powerup.
    powerupGraphics.fillStyle(0xff00ff, 1);
    powerupGraphics.fillCircle(8, 8, 8);
    powerupGraphics.generateTexture('powerup', 16, 16);
    powerupGraphics.destroy();
  }

  /**
   * Create texture for the heart (lives).
   */
  createHeartTexture() {
    if (!this.textures.exists('heart')) {
      const heartGraphics = this.make.graphics({ x: 0, y: 0, add: false });
      heartGraphics.fillStyle(0xff0000, 1);
      // Draw a heart shape using two circles and a triangle.
      heartGraphics.fillCircle(6, 6, 6);
      heartGraphics.fillCircle(14, 6, 6);
      heartGraphics.beginPath();
      heartGraphics.moveTo(2, 7);
      heartGraphics.lineTo(18, 7);
      heartGraphics.lineTo(10, 18);
      heartGraphics.closePath();
      heartGraphics.fillPath();
      heartGraphics.generateTexture('heart', 20, 20);
      heartGraphics.destroy();
    }
  }

  /**
   * Create and position Pacman, ghosts, and pellets (via createMaze).
   */
  createSprites() {
    // Create Pacman sprite at an open cell.
    this.pacman = this.physics.add.sprite(60, 60, 'pacmanOpen');
    this.pacman.play('pacmanAnim');
    this.pacman.setCollideWorldBounds(true);
    this.pacman.setBounce(0);

    // Create ghosts array.
    this.ghosts = [];
    const tileSize = 800 / 20; // 40 px per tile

    // Spawn red ghost in the bottom right (cell: 18, 13).
    const redX = 18 * tileSize + tileSize / 2;
    const redY = 13 * tileSize + tileSize / 2;
    const redGhost = this.physics.add.sprite(redX, redY, 'ghost1');
    redGhost.play('ghostAnim');
    redGhost.setCollideWorldBounds(true);
    redGhost.setBounce(1);
    redGhost.direction = { x: 1, y: 0, angle: 0 };
    redGhost.setVelocity(redGhost.direction.x * 100, redGhost.direction.y * 100);
    this.ghosts.push(redGhost);

    // Spawn pink ghost in the top right (cell: 18, 1).
    const pinkX = 18 * tileSize + tileSize / 2;
    const pinkY = 1 * tileSize + tileSize / 2;
    const pinkGhost = this.physics.add.sprite(pinkX, pinkY, 'ghostPink1');
    pinkGhost.play('ghostPinkAnim');
    pinkGhost.setCollideWorldBounds(true);
    pinkGhost.setBounce(1);
    pinkGhost.direction = { x: 1, y: 0, angle: 0 };
    pinkGhost.setVelocity(pinkGhost.direction.x * 100, pinkGhost.direction.y * 100);
    this.ghosts.push(pinkGhost);

    // Spawn orange ghost in the bottom left (cell: 1, 13).
    const orangeX = 1 * tileSize + tileSize / 2;
    const orangeY = 13 * tileSize + tileSize / 2;
    const orangeGhost = this.physics.add.sprite(orangeX, orangeY, 'ghostOrange1');
    orangeGhost.play('ghostOrangeAnim');
    orangeGhost.setCollideWorldBounds(true);
    orangeGhost.setBounce(1);
    orangeGhost.direction = { x: 1, y: 0, angle: 0 };
    orangeGhost.setVelocity(orangeGhost.direction.x * 100, orangeGhost.direction.y * 100);
    this.ghosts.push(orangeGhost);
  }

  /**
   * Setup keyboard input and add colliders/overlap checks.
   */
  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(this.pacman, this.wallGroup);
    // Add colliders and overlaps for each ghost.
    this.ghosts.forEach((ghost) => {
      this.physics.add.collider(ghost, this.wallGroup);
      this.physics.add.overlap(this.pacman, ghost, this.hitGhost, null, this);
    });
    this.physics.add.overlap(this.pacman, this.pellets, this.eatPellet, null, this);
    // Overlap for powerups.
    this.physics.add.overlap(this.pacman, this.powerups, this.eatPowerup, null, this);
  }

  /**
   * Handle Pacman's movement with smooth turning and grid alignment.
   */
  handlePacmanMovement() {
    const speed = 150;
    const tileSize = 40; // Each cell is 40×40
    const threshold = 4; // Allowable misalignment in pixels

    // Determine Pacman's current grid cell and its center.
    const gridX = Math.floor(this.pacman.x / tileSize);
    const gridY = Math.floor(this.pacman.y / tileSize);
    const centerX = gridX * tileSize + tileSize / 2;
    const centerY = gridY * tileSize + tileSize / 2;

    // Buffer player input.
    if (this.cursors.left.isDown) {
      this.nextDirection = { x: -1, y: 0, angle: 180 };
    } else if (this.cursors.right.isDown) {
      this.nextDirection = { x: 1, y: 0, angle: 0 };
    } else if (this.cursors.up.isDown) {
      this.nextDirection = { x: 0, y: -1, angle: -90 };
    } else if (this.cursors.down.isDown) {
      this.nextDirection = { x: 0, y: 1, angle: 90 };
    }

    // If a new direction is requested, try to turn if Pacman is nearly aligned.
    if (this.nextDirection) {
      // For horizontal movement, check vertical alignment.
      if (
        this.nextDirection.x !== 0 &&
        Math.abs(this.pacman.y - centerY) < threshold
      ) {
        const targetX = gridX + this.nextDirection.x;
        if (this.canMoveTo(targetX, gridY)) {
          // Snap to the center vertically and update current direction.
          this.pacman.y = centerY;
          this.currentDirection = this.nextDirection;
          this.nextDirection = null;
        }
      }
      // For vertical movement, check horizontal alignment.
      if (
        this.nextDirection &&
        this.nextDirection.y !== 0 &&
        Math.abs(this.pacman.x - centerX) < threshold
      ) {
        const targetY = gridY + this.nextDirection.y;
        if (this.canMoveTo(gridX, targetY)) {
          // Snap to the center horizontally and update current direction.
          this.pacman.x = centerX;
          this.currentDirection = this.nextDirection;
          this.nextDirection = null;
        }
      }
    }

    // If Pacman is nearly centered and moving, check if his current direction is still valid.
    if (
      this.currentDirection &&
      Math.abs(this.pacman.x - centerX) < threshold &&
      Math.abs(this.pacman.y - centerY) < threshold
    ) {
      const nextCellX = gridX + this.currentDirection.x;
      const nextCellY = gridY + this.currentDirection.y;
      if (!this.canMoveTo(nextCellX, nextCellY)) {
        // Stop movement if the next cell is blocked.
        this.currentDirection = null;
        this.pacman.setVelocity(0, 0);
        return;
      }
    }

    // Set velocity based on the current direction.
    if (this.currentDirection) {
      this.pacman.setVelocity(
        this.currentDirection.x * speed,
        this.currentDirection.y * speed
      );
      this.pacman.angle = this.currentDirection.angle;
    }
  }

  /**
   * Handle a ghost's movement using smooth steering while following basic pursuit logic.
   */
  handleGhostMovement(ghost) {
    const ghostSpeed = 100;
    const tileSize = 40;
    const ghostThreshold = 4; // Increased threshold for smoother decisions

    // Compute ghost's current grid cell and its cell center.
    const gridX = Math.floor(ghost.x / tileSize);
    const gridY = Math.floor(ghost.y / tileSize);
    const centerX = gridX * tileSize + tileSize / 2;
    const centerY = gridY * tileSize + tileSize / 2;

    // When near the center, gently nudge toward center and possibly update direction.
    if (
      Math.abs(ghost.x - centerX) < ghostThreshold &&
      Math.abs(ghost.y - centerY) < ghostThreshold
    ) {
      ghost.x = Phaser.Math.Linear(ghost.x, centerX, 0.1);
      ghost.y = Phaser.Math.Linear(ghost.y, centerY, 0.1);

      const pacGridX = Math.floor(this.pacman.x / tileSize);
      const pacGridY = Math.floor(this.pacman.y / tileSize);

      const candidates = [
        { x: -1, y: 0, angle: 180 }, // left
        { x: 1, y: 0, angle: 0 },    // right
        { x: 0, y: -1, angle: -90 }, // up
        { x: 0, y: 1, angle: 90 },   // down
      ];

      let reverse = null;
      if (ghost.direction) {
        reverse = {
          x: -ghost.direction.x,
          y: -ghost.direction.y,
          angle: (ghost.direction.angle + 180) % 360,
        };
      }

      const validDirections = [];
      for (let candidate of candidates) {
        if (!this.canMoveTo(gridX + candidate.x, gridY + candidate.y)) {
          continue;
        }
        if (
          reverse &&
          candidate.x === reverse.x &&
          candidate.y === reverse.y
        ) {
          continue;
        }
        validDirections.push(candidate);
      }

      if (
        validDirections.length === 0 &&
        reverse &&
        this.canMoveTo(gridX + reverse.x, gridY + reverse.y)
      ) {
        validDirections.push(reverse);
      }

      if (validDirections.length > 0) {
        let bestCandidate = validDirections[0];
        let bestDistance = Infinity;
        for (let candidate of validDirections) {
          const nextX = gridX + candidate.x;
          const nextY = gridY + candidate.y;
          const distance =
            Math.abs(pacGridX - nextX) + Math.abs(pacGridY - nextY);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestCandidate = candidate;
          }
        }
        ghost.direction = bestCandidate;
      }
    }

    if (ghost.direction) {
      const currentVelX = ghost.body.velocity.x;
      const currentVelY = ghost.body.velocity.y;
      const targetVelX = ghost.direction.x * ghostSpeed;
      const targetVelY = ghost.direction.y * ghostSpeed;
      const lerpFactor = 0.1;
      const newVelX = Phaser.Math.Linear(currentVelX, targetVelX, lerpFactor);
      const newVelY = Phaser.Math.Linear(currentVelY, targetVelY, lerpFactor);
      ghost.setVelocity(newVelX, newVelY);
      ghost.angle = ghost.direction.angle;
    }
  }

  /**
   * Check if a cell in the maze is open (0) and can be moved into.
   */
  canMoveTo(gridX, gridY) {
    if (
      gridY < 0 ||
      gridY >= this.mazeData.length ||
      gridX < 0 ||
      gridX >= this.mazeData[0].length
    ) {
      return false;
    }
    return this.mazeData[gridY][gridX] === 0;
  }

  /**
   * Create the maze.
   */
  createMaze() {
    // Define the maze grid: 1 = Wall, 0 = Open space (pellet)
    this.mazeData = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    const rows = this.mazeData.length;
    const cols = this.mazeData[0].length;
    const tileSize = 800 / cols; // 40 px per tile

    if (!this.textures.exists('wall')) {
      const wallGraphics = this.make.graphics({ x: 0, y: 0, add: false });
      wallGraphics.lineStyle(2, 0x0000ff, 1);
      wallGraphics.strokeRect(0, 0, tileSize, tileSize);
      wallGraphics.generateTexture('wall', tileSize, tileSize);
      wallGraphics.destroy();
    }

    this.wallGroup = this.physics.add.staticGroup();
    this.pellets = this.physics.add.staticGroup();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * tileSize;
        const y = row * tileSize;
        if (this.mazeData[row][col] === 1) {
          const wall = this.add.image(x + tileSize / 2, y + tileSize / 2, 'wall');
          this.physics.add.existing(wall, true);
          this.wallGroup.add(wall);
        } else {
          this.pellets.create(x + tileSize / 2, y + tileSize / 2, 'pellet');
        }
      }
    }

    // Create powerups at fixed positions.
    const powerupPositions = [
      { row: 2, col: 1 },
      { row: 1, col: 18 },
      { row: 13, col: 1 },
      { row: 13, col: 18 },
      { row: 7, col: 10 },
    ];
    this.powerups = this.physics.add.staticGroup();
    powerupPositions.forEach((pos) => {
      const x = pos.col * tileSize + tileSize / 2;
      const y = pos.row * tileSize + tileSize / 2;
      this.powerups.create(x, y, 'powerup');
    });
  }
}
