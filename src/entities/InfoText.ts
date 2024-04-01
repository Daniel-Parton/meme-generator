import { GAME_COLORS } from 'GameColors';

export class InfoText extends Phaser.GameObjects.Container {
  text: Phaser.GameObjects.Text;
  background: Phaser.GameObjects.Rectangle;
  offsetValue: number = 50;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.setAlpha(0);
    scene.add.existing(this);
    this.init();
  }

  init() {
    this.text = this.scene.add
      .text(0, 0, ' ', {
        fontSize: '14px',
        color: GAME_COLORS.white.rgba,
        align: 'center',
        padding: { x: 3, y: 2.5 }
      })
      .setOrigin(0.5, 0.5);

    this.background = this.scene.add
      .rectangle(
        0,
        0,
        this.text.width,
        this.text.height,
        GAME_COLORS.select.color
      )
      .setOrigin(0.5, 0.5);

    this.add([this.background, this.text]);
  }

  show() {
    this.animate({ alpha: 1 });
  }

  followPointer() {
    this.scene.children.bringToTop(this);
    this.scene.input.on('pointermove', this.setIdealPosition, this);
  }

  stopFollowingPointer() {
    this.scene.input.off('pointermove', this.setIdealPosition);
  }

  hide() {
    this.animate({ alpha: 0 });
  }

  setText(text: string) {
    this.text.setText(text);
    this.background.setSize(this.text.width, this.text.height);
  }

  private animate(
    value: { alpha?: number; scale?: number },
    duration: number = 200
  ) {
    this.scene.tweens.add({
      ...value,
      targets: this,
      duration,
      ease: Phaser.Math.Easing.Sine.InOut
    });
  }

  setIdealPosition(pointer: Phaser.Input.Pointer) {
    const position: Phaser.Types.Math.Vector2Like = {
      x: pointer.x + this.offsetValue,
      y: pointer.y + this.offsetValue
    };

    const { width, height } = this.scene.scale;

    if (position.x >= width - this.offsetValue) {
      position.x -= this.offsetValue * 2;
    }

    if (position.y >= height - this.offsetValue) {
      position.y -= this.offsetValue * 2;
    }

    this.setPosition(position.x, position.y);
  }
}
