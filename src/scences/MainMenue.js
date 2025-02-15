import Phaser from 'phaser'

import { defaultFont } from '../consts/Fonts'
import WebFontFile from './WebFontFile'
import { Pong, Pacman } from '../consts/SceneKeys'
import PacmanScene from './Pacman';

export default class MainMenue extends Phaser.Scene {
    constructor() {
      super({ key: 'MainMenue' });
    }
  
    preload() {
        // Load your font
        const fonts = new WebFontFile(this.load, "Press Start 2P")
        this.load.addFile(fonts)
      }
  
    create() {
      // Add a title text for the arcade hall
      this.add.text(400, 80, 'Arcade Hall', {
        fontSize: '48px',
        fill: '#fff',
        fontFamily: defaultFont,
      }).setOrigin(0.5);
  
      // Create the "Pong" button
      const pongButton = this.add.text(400, 200, 'Pong', {
        fontSize: '32px',
        fontFamily: defaultFont,
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      
      pongButton.on('pointerover', () => {
        pongButton.setStyle({ fill: '#ff0' });
      });
      pongButton.on('pointerout', () => {
        pongButton.setStyle({ fill: '#fff' });
      });
      pongButton.on('pointerdown', () => {
        // Start the Pong game scene
        this.scene.start(Pong);
      });
  
      // Create the "Pacman" button
      const pacmanButton = this.add.text(400, 300, 'Pacman', {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: defaultFont
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      
      pacmanButton.on('pointerover', () => {
        pacmanButton.setStyle({ fill: '#ff0' });
      });
      pacmanButton.on('pointerout', () => {
        pacmanButton.setStyle({ fill: '#fff' });
      });
      pacmanButton.on('pointerdown', () => {
        // Start the Pacman game scene
        this.scene.start(Pacman);
      });
  
      // Create the "More Soon" button
      const moreSoonButton = this.add.text(400, 400, 'More Soon', {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: defaultFont,
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      
      moreSoonButton.on('pointerover', () => {
        moreSoonButton.setStyle({ fill: '#ff0' });
      });
      moreSoonButton.on('pointerout', () => {
        moreSoonButton.setStyle({ fill: '#fff' });
      });
      moreSoonButton.on('pointerdown', () => {
        console.log("More games coming soon!");
        // Optionally, you could display a message on screen or perform another action here.
      });
    }
  }
  