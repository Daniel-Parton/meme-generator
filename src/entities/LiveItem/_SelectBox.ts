import { GAME_COLORS } from 'GameColors';
import { isSizeEqual } from '@/utils/SizeHelper';
import { GAME_EVENTS } from 'GameEvents';
import { TargetTrackingData } from '../LiveItemTransformer/LiveItemTransformer.types';
import { LiveItem } from './LiveItem';

export class SelectBox extends Phaser.GameObjects.Rectangle {
  target: LiveItem;
  offset: number;
  targetData: TargetTrackingData;
  constructor(scene: Phaser.Scene, target: LiveItem, offset: number = 0) {
    super(scene, 0, 0);
    this.setAlpha(0);
    this.offset = offset;
    this.target = target;
    scene.add.existing(this);
    this.init();
  }

  init() {
    this.setOrigin(0, 0);
    this.setStrokeStyle(1.5, GAME_COLORS.select.color, 1);
    this.scene.events.on(
      GAME_EVENTS.ItemSelected,
      this.handleItemSelected,
      this
    );

    this.scene.events.on(
      GAME_EVENTS.ItemUnSelected,
      this.handleItemUnSelected,
      this
    );

    this.target.onHover(this.handleTargetHover, this);
    this.target.onHoverLeave(this.handleTargetHoverLeave, this);
  }

  show() {
    this.setLastTargetData();
    this.updateSizeAndAngle();
    this.updatePosition();
    this.target.onBoundsChanged(this.updatePosition, this);
    this.animate({ alpha: 1 });
  }

  hide() {
    this.target.offBoundsChange(this.updatePosition);
    this.animate({ alpha: 0 });
  }

  private handleItemSelected(item: Phaser.GameObjects.GameObject) {
    if (item.name === this.target.name) {
      this.scene.children.bringToTop(this);
    } else {
      this.handleItemUnSelected();
    }
  }

  private handleItemUnSelected() {
    const pointer = this.scene.input.activePointer;
    if (
      this.alpha > 0 &&
      !this.target.getBounds().contains(pointer.x, pointer.y)
    ) {
      this.hide();
    }
  }

  private handleTargetHover() {
    if (!this.alpha) {
      this.show();
    }
  }

  private handleTargetHoverLeave() {
    if (this.alpha && !this.target.isSelected) {
      this.hide();
    }
  }

  private updatePosition() {
    //The size is different and offset may also be different so let's recalculate it
    if (
      !isSizeEqual(this.targetData, {
        width: this.target.displayWidth,
        height: this.target.displayHeight
      }) ||
      this.target.angle !== this.targetData.angle
    ) {
      this.setLastTargetData();
      this.updateSizeAndAngle();
    }

    const topLeft = this.target.getTopLeft();
    this.setPosition(
      topLeft.x + this.targetData.xOffset,
      topLeft.y + this.targetData.yOffset
    );
  }

  private updateSizeAndAngle() {
    const w = this.targetData.width + this.offset * 2;
    const h = this.targetData.height + this.offset * 2;
    this.setSize(w, h);
    this.setAngle(this.targetData.angle);
  }

  private setLastTargetData() {
    this.targetData = {
      xOffset: -this.offset,
      yOffset: -this.offset,
      width: this.target.displayWidth,
      height: this.target.displayHeight,
      angle: this.target.angle
    };
  }

  private animate(value: { alpha?: number }, duration: number = 100) {
    this.scene.tweens.add({
      ...value,
      targets: this,
      duration,
      ease: Phaser.Math.Easing.Sine.InOut
    });
  }
}
