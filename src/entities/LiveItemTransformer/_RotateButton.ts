import { isSizeEqual } from '@/utils/SizeHelper';
import { LiveItem } from '@/entities/LiveItem';
import { TargetTrackingData } from './LiveItemTransformer.types';
import { InfoText } from '@/entities/InfoText';

export class RotateButton extends Phaser.GameObjects.Image {
  target?: LiveItem;
  rotateInfo: InfoText;
  targetData: TargetTrackingData;
  baseScale: number = 0.5;
  offset: number = 20;
  infoOffsetValue: number = 50;
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'rotate-btn');
    this.setAlpha(0);
    scene.add.existing(this);
    this.init();
  }

  private init() {
    this.setOrigin(0.5, 0.5);
    this.rotateInfo = new InfoText(this.scene);
    this.setScale(this.baseScale);
    this.setInteractive({
      cursor: 'all-scroll',
      draggable: true
    } as Phaser.Types.Input.InputConfiguration)
      .on('pointerover', this.handleHover, this)
      .on('pointerout', this.handleHoverLeave, this);
  }

  setTarget(target: LiveItem) {
    this.target = target;
    this.setLastTargetData(target);
    this.updatePosition();
    target.onBoundsChanged(this.updatePosition, this);
    target.onResizeStarted(this.hide, this);
    target.onRotateStarted(this.hide, this);
    target.onRotateEnded(this.show, this);
    target.onResizeEnded(this.show, this);

    this.animate({ alpha: 1 });
    this.on('dragstart', this.handleRotateStart, this);
    this.scene.children.bringToTop(this);
  }

  clearTarget() {
    if (this.target) {
      this.target.offBoundsChange(this.updatePosition);
      this.target = null;
    }

    this.targetData = { xOffset: 0, yOffset: 0, height: 0, width: 0, angle: 0 };
    this.animate({ alpha: 0 });
    this.scene.time.delayedCall(
      100,
      () => {
        this.setPosition(0, 0);
      },
      null,
      this
    );
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
      this.setLastTargetData(this.target);
    }

    const center = this.target.getCenter();
    this.setPosition(
      center.x + this.targetData.xOffset,
      center.y + this.targetData.yOffset
    );
  }

  private setLastTargetData(target: LiveItem) {
    //We want the rotate button to always be placed at the bottom center
    //of the target so we need to calculate the offset but take into account
    //the angle of the target
    const bc = target.getBottomCenter();
    const c = target.getCenter();
    const directionX = bc.x - c.x;
    const directionY = bc.y - c.y;

    const magnitude = Math.sqrt(
      directionX * directionX + directionY * directionY
    );

    const normalizedDirectionX = directionX / magnitude;
    const normalizedDirectionY = directionY / magnitude;

    const lineEndX = bc.x + this.offset * normalizedDirectionX;
    const lineEndY = bc.y + this.offset * normalizedDirectionY;

    this.targetData = {
      xOffset: lineEndX - c.x,
      yOffset: lineEndY - c.y,
      width: target.displayWidth,
      height: target.displayHeight,
      angle: target.angle
    };
  }

  private handleRotateStart(pointer: Phaser.Input.Pointer) {
    this.target.emit(LiveItem.Events.rotateStarted);
    this.rotateInfo.setText(`${this.target.angle}°`);
    this.rotateInfo.setIdealPosition(pointer);
    this.rotateInfo.followPointer();
    this.rotateInfo.show();
    this.off('dragstart', this.handleRotateStart, this);
    this.on('drag', this.handleRotate, this);
    this.on('dragend', this.handleRotateEnd, this);
  }

  private handleRotate(pointer: Phaser.Input.Pointer) {
    if (!this.target) {
      return;
    }

    const targetAngle =
      (360 / (2 * Math.PI)) *
        Phaser.Math.Angle.Between(
          this.target.x,
          this.target.y,
          pointer.x,
          pointer.y
        ) -
      90;

    let snappedAngle = Phaser.Math.Snap.To(targetAngle, 2);
    if (snappedAngle < 0) snappedAngle += 360;
    if (snappedAngle === 360) {
      snappedAngle = 0;
    }
    this.target.setAngle(snappedAngle);
    this.rotateInfo.setText(`${snappedAngle}°`);
  }

  private handleRotateEnd() {
    this.target.emit(LiveItem.Events.rotateEnded);
    this.rotateInfo.stopFollowingPointer();
    this.rotateInfo.hide();
    this.on('dragstart', this.handleRotateStart, this);
    this.off('drag', this.handleRotate, this);
    this.off('dragend', this.handleRotateEnd, this);
  }

  private handleHover() {
    this.animate({ scale: this.baseScale * 1.1 });
  }

  private handleHoverLeave() {
    this.animate({ scale: this.baseScale });
  }

  private show() {
    this.animate({ alpha: 1 });
  }

  private hide() {
    this.animate({ alpha: 0 });
  }

  private animate(
    value: { alpha?: number; scale?: number },
    duration: number = 100
  ) {
    this.scene.tweens.add({
      ...value,
      targets: this,
      duration,
      ease: Phaser.Math.Easing.Sine.InOut
    });
  }
}
