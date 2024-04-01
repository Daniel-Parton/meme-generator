type Options = {
  x: number;
  y: number;
  key: string;
  onClick: () => void;
};

export class ImageButton extends Phaser.GameObjects.Image {
  onClick: () => void;
  onClickThis?: any;

  constructor(scene: Phaser.Scene, { key, x, y, onClick }: Options) {
    super(scene, x, y, key, 0);
    scene.add.existing(this);
    this.init({ onClick });
  }

  init({ onClick }: Pick<Options, 'onClick'>) {
    this.setInteractive({ cursor: 'pointer' })
      .on('pointerover', this.handleHover, this)
      .on('pointerout', this.handleHoverLeave, this)
      .on('pointerdown', onClick);
  }

  private handleHover() {
    this.animateScale(1.25);
  }

  private handleHoverLeave() {
    this.animateScale(1);
  }

  animateScale(value: number, duration: number = 100) {
    this.scene.tweens.add({
      scale: value,
      targets: this,
      duration,
      ease: Phaser.Math.Easing.Sine.InOut
    });
  }
}
