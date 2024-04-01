import './style.css';
import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preload } from './scenes/Preload';
import { Play } from './scenes/Play';
import { HeightWidth, getClampedSize } from '@/utils/SizeHelper';
import RoundRectanglePlugin from 'phaser3-rex-plugins/plugins/roundrectangle-plugin.js';

const baseSize: HeightWidth = { width: 640 * 4, height: 438 * 4 };
const max = getClampedSize({
  size: baseSize,
  maxWidth: 800
});
const min = getClampedSize({
  size: baseSize,
  maxWidth: 350
});

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: max.width,
  height: max.height,
  max: max,
  min,
  parent: 'game-container',
  pixelArt: false,
  autoFocus: true,
  plugins: {
    global: [
      {
        key: 'rexRoundRectanglePlugin',
        plugin: RoundRectanglePlugin,
        start: true
      }
    ]
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: 'game-container',
    parent: 'game-container'
  },
  scene: [Boot, Preload, Play]
};

new Phaser.Game(config);
