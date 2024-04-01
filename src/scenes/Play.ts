import { LiveItem } from '@/entities/LiveItem';
import { LiveItemTransformer } from '@/entities/LiveItemTransformer';
import { GAME_EVENTS } from 'GameEvents';

export class Play extends Phaser.Scene {
  background: Phaser.GameObjects.Image;
  sunglasses: LiveItem;
  text: LiveItem;
  itemTransformer: LiveItemTransformer;

  get height() {
    return this.scale.height;
  }
  get width() {
    return this.scale.width;
  }

  get center(): Phaser.Types.Math.Vector2Like {
    return { x: this.width / 2, y: this.height / 2 };
  }

  constructor() {
    super('Play');
  }

  create() {
    this.background = this.add
      .image(0, 0, 'bg-woman-yelling-at-cat')
      .setDisplaySize(this.width, this.height)
      .setOrigin(0, 0);

    this.sunglasses = LiveItem.Image({
      scene: this,
      key: 'sunglasses'
    });

    this.text = LiveItem.Text({
      scene: this,
      text: 'Hello World!'
    });
    this.itemTransformer = new LiveItemTransformer(this);
    this.input.on('pointerdown', this.tryUnSelect, this);
  }

  update() {}

  tryUnSelect(
    pointer: Phaser.Input.Pointer,
    targets: Phaser.GameObjects.GameObject[]
  ) {
    if (!targets.length) {
      this.events.emit(GAME_EVENTS.ItemUnSelected, pointer);
    }
  }
}
