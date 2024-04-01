export class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this.load.setPath('./assets');
    this.load.image('rotate-btn', 'rotate-btn.png');
    this.load.image('bg-woman-yelling-at-cat', 'bg-woman-yelling-at-cat.jpg');
    this.load.image('sunglasses', 'item-deal-with-it-sunglasses.svg');
  }

  create() {
    this.scene.start('Play');
  }

  loadAudio(path: string) {
    this.load.audio(
      path,
      ['.mp3', '.ogg', '.m4a'].map((ext) => `${path}${ext}`)
    );
  }
}
