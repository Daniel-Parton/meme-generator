import { GAME_COLORS } from 'GameColors';
import { LiveItem } from '@/entities/LiveItem';
import { isSizeEqual } from '@/utils/SizeHelper';
import {
  ResizeHandleObject,
  ResizeStartData,
  ResizePositions,
  TargetTrackingData
} from './LiveItemTransformer.types';
import { InfoText } from '@/entities/InfoText';

export class ResizeHandle {
  handle: ResizeHandleObject;
  offset: number;
  target?: LiveItem;
  resizeInfo: InfoText;
  infoOffsetValue: number = 50;
  targetData: TargetTrackingData;
  resizeStartData: ResizeStartData;
  position: ResizePositions;
  get isTopBottom() {
    return this.position === 'top-middle' || this.position === 'bottom-middle';
  }

  get isLeftRight() {
    return this.position === 'middle-left' || this.position === 'middle-right';
  }

  constructor(
    handle: ResizeHandleObject,
    position: ResizePositions,
    offset: number = 0
  ) {
    this.handle = handle;
    this.position = position;
    this.offset = offset;
    this.handle.setAlpha(0);
    this.init();
  }

  private init() {
    this.resizeInfo = new InfoText(this.handle.scene);
    this.handle.setOrigin(0.5, 0.5);
    this.handle.setInteractive({
      draggable: true,
      cursor: this.resolveCursor()
    });
    this.handle.on('pointerover', this.handleHover, this);
    this.handle.on('pointerout', this.handleHoverLeave, this);
  }

  setTarget(target: LiveItem) {
    this.target = target;
    if (this.isTopBottom) {
      this.handle.setSize?.(this.target.displayWidth / 2, 8);
    } else if (this.isLeftRight) {
      this.handle.setSize?.(8, this.target.displayHeight / 2);
    }
    this.handle.setOrigin(0.5, 0.5);
    this.setLastTargetData(target);
    this.setPositionFromTarget();
    target.onBoundsChanged(this.setPositionFromTarget, this);
    target.onResizeStarted(this.handleResizeStartedEvent, this);
    target.onResizeEnded(this.show, this);
    target.onRotateStarted(this.hide, this);
    target.onRotateEnded(this.show, this);
    this.show();
    this.handle.on('dragstart', this.handleResizeStart, this);
    this.handle.scene.children.bringToTop(this.handle);
  }

  clearTarget() {
    if (this.target) {
      this.target.offBoundsChange(this.setPositionFromTarget);
      this.target.offResizeStarted(this.handleResizeStartedEvent);
      this.target.offResizeEnded(this.show);
      this.target.offRotateStarted(this.hide);
      this.target.offRotateEnded(this.show);
      this.target = null;
    }

    this.targetData = { xOffset: 0, yOffset: 0, height: 0, width: 0, angle: 0 };
    this.hide();
    this.handle.scene.time.delayedCall(
      100,
      () => {
        this.handle.setPosition(0, 0);
      },
      null,
      this
    );
  }

  private show() {
    this.animate({ alpha: 1 });
  }

  private hide() {
    this.animate({ alpha: 0 });
  }

  private handleHover() {
    this.animate({ scale: 1.05 });
    this.animateColor(GAME_COLORS.select);
  }

  private handleHoverLeave() {
    this.animate({ scale: 1 });
    this.animateColor(GAME_COLORS.white);
  }

  private handleResizeStart(pointer: Phaser.Input.Pointer) {
    this.target.emit(LiveItem.Events.resizeStarted, this.position);
    this.resizeInfo.followPointer();
    this.setInfoText();
    this.resizeInfo.setIdealPosition(pointer);
    this.resizeInfo.show();

    const resizeOrigin = this.resolveResizeOrigin();
    this.target.setOrigin(resizeOrigin.x, resizeOrigin.y);
    this.resizeStartData = {
      x: pointer.x,
      y: pointer.y,
      scale: this.target.scale,
      width: this.target.displayWidth,
      height: this.target.displayHeight
    };

    this.handle.off('dragstart', this.handleResizeStart, this);
    this.handle.on('drag', this.handleResize, this);
    this.handle.on('dragend', this.handleResizeEnd, this);
  }

  private handleResize(pointer: Phaser.Input.Pointer) {
    if (!this.target) {
      return;
    }

    const data = this.getResizeDistanceData(pointer);

    if (!data.canResize) {
      return;
    }

    switch (this.position) {
      case 'top-left':
      case 'top-right':
      case 'bottom-left':
      case 'bottom-right':
        this.target.resize(data.newScaledSize.width, data.newScaledSize.height);
        break;
      case 'top-middle':
        this.target.resize(this.target.displayWidth, data.newTopHeight);
        break;
      case 'bottom-middle':
        this.target.resize(this.target.displayWidth, data.newBottomHeight);
        break;
      case 'middle-left':
        this.target.resize(data.newLeftWidth, this.target.displayHeight);
        break;
      case 'middle-right':
        this.target.resize(data.newRightWidth, this.target.displayHeight);
        break;
    }

    this.setInfoText();
  }

  private handleResizeEnd() {
    this.target.emit(LiveItem.Events.resizeEnded, this.position);
    this.resizeStartData = { x: 0, y: 0, height: 0, width: 0, scale: 1 };
    this.resizeInfo.stopFollowingPointer();
    this.resizeInfo.hide();
    this.handle.on('dragstart', this.handleResizeStart, this);
    this.handle.off('drag', this.handleResize, this);
    this.handle.off('dragend', this.handleResizeEnd, this);
    this.target.setOrigin(0.5, 0.5);
  }

  private handleResizeStartedEvent(position: ResizePositions) {
    if (this.position !== position) {
      this.hide();
    }
  }

  private setPositionFromTarget() {
    if (!this.target) {
      return;
    }

    const center = this.target.getCenter();
    //The offset may have changed so let's recalculate it
    if (
      !isSizeEqual(this.targetData, {
        width: this.target.displayWidth,
        height: this.target.displayHeight
      }) ||
      this.target.angle !== this.targetData.angle
    ) {
      this.setLastTargetData(this.target);
    }
    this.handle.setPosition(
      center.x + this.targetData.xOffset,
      center.y + this.targetData.yOffset
    );
  }

  private setLastTargetData(target: LiveItem) {
    let newPosition: Phaser.Types.Math.Vector2Like;

    const center = target.getCenter();
    switch (this.position) {
      case 'top-left':
        newPosition = target.getTopLeft();
        newPosition.x -= this.offset;
        newPosition.y -= this.offset;
        break;
      case 'top-middle':
        newPosition = target.getTopCenter();
        newPosition.y -= this.offset;
        break;
      case 'top-right':
        newPosition = target.getTopRight();
        newPosition.x += this.offset;
        newPosition.y -= this.offset;
        break;
      case 'middle-left':
        newPosition = target.getLeftCenter();
        newPosition.x -= this.offset;
        break;
      case 'middle-right':
        newPosition = target.getRightCenter();
        newPosition.x += this.offset;
        break;
      case 'bottom-left':
        newPosition = target.getBottomLeft();
        newPosition.x -= this.offset;
        newPosition.y += this.offset;
        break;
      case 'bottom-middle':
        newPosition = target.getBottomCenter();
        newPosition.y += this.offset;
        break;
      case 'bottom-right':
        newPosition = target.getBottomRight();
        newPosition.x += this.offset;
        newPosition.y += this.offset;
        break;
    }

    this.targetData = {
      width: target.displayWidth,
      height: target.displayHeight,
      xOffset: newPosition.x - center.x,
      yOffset: newPosition.y - center.y,
      angle: target.angle
    };
  }

  private resolveCursor() {
    switch (this.position) {
      case 'top-left':
      case 'bottom-right':
        return 'nw-resize';
      case 'top-right':
      case 'bottom-left':
        return 'ne-resize';
      case 'top-middle':
      case 'bottom-middle':
        return 'n-resize';
      case 'middle-left':
      case 'middle-right':
        return 'e-resize';
      default:
        'resize';
    }
    return 'resize';
  }

  private resolveResizeOrigin(): Phaser.Types.Math.Vector2Like {
    switch (this.position) {
      case 'top-middle':
        return { x: 0, y: 0 };
      case 'middle-left':
        return { x: 1, y: 0 };
      case 'middle-right':
        return { x: 0, y: 1 };
      case 'bottom-middle':
        return { x: 0, y: 1 };
      case 'top-left':
      case 'top-right':
      case 'bottom-right':
      case 'bottom-left':
      default:
        return { x: 0.5, y: 0.5 };
    }
  }

  private animate(
    value: { scale?: number; alpha?: number },
    duration: number = 100
  ) {
    this.handle.scene.tweens.add({
      ...value,
      targets: this.handle,
      duration,
      ease: Phaser.Math.Easing.Sine.InOut
    });
  }

  private animateColor(color: Phaser.Display.Color, duration: number = 100) {
    const currentColor = Phaser.Display.Color.ValueToColor(
      this.handle.fillColor
    );
    this.handle.scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration,
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        const value = tween.getValue();
        const { r, g, b } = Phaser.Display.Color.Interpolate.ColorWithColor(
          currentColor,
          color,
          100,
          value
        );
        this.handle.setFillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      },
      ease: Phaser.Math.Easing.Sine.InOut
    });
  }

  private getResizeDistanceData(pointer: Phaser.Input.Pointer) {
    const start = this.resizeStartData;

    // Calculate the initial distance
    const initialDistance = Phaser.Math.Distance.Between(
      this.resizeStartData.x,
      this.resizeStartData.y,
      this.target.x,
      this.target.y
    );

    // Calculate the current distance
    const currentDistance = Phaser.Math.Distance.Between(
      pointer.x,
      pointer.y,
      this.target.x,
      this.target.y
    );

    const vertical = pointer.y - start.y;
    const horizontal = pointer.x - start.x;
    const aspectRatioScale =
      this.resizeStartData.scale * (currentDistance / initialDistance);

    const data = {
      canResize: true,
      vertical,
      verticalAbsolute: Math.abs(vertical),
      horizontal,
      horizontalAbsolute: Math.abs(horizontal),
      default: initialDistance,
      current: currentDistance,
      newScaledSize: {
        width: this.resizeStartData.width * aspectRatioScale,
        height: this.resizeStartData.height * aspectRatioScale
      },
      newLeftWidth: this.resizeStartData.width - horizontal,
      newRightWidth: this.resizeStartData.width + horizontal,
      newTopHeight: this.resizeStartData.height + vertical,
      newBottomHeight: this.resizeStartData.height - vertical
    };

    return data;
  }

  private setInfoText() {
    const w = Math.round(this.target.displayWidth).toLocaleString();
    const h = Math.round(this.target.displayHeight).toLocaleString();
    this.resizeInfo.setText(`w:${w} h:${h}`);
  }

  static Circle(
    scene: Phaser.Scene,
    position: ResizePositions,
    offset?: number
  ) {
    const circle = scene.add.arc(
      0,
      0,
      6,
      0,
      360,
      false,
      GAME_COLORS.white.color,
      1
    );
    circle.setStrokeStyle(1, GAME_COLORS.gray.color);
    circle.setOrigin(0.5, 0.5);

    return new ResizeHandle(circle, position, offset);
  }

  static Ellipse(
    scene: Phaser.Scene,
    variant: 'horizontal' | 'vertical',
    position: ResizePositions,
    offset?: number
  ) {
    const ellipse = scene.add.ellipse(
      0,
      0,
      variant === 'horizontal' ? 16 : 8,
      variant === 'vertical' ? 16 : 8,
      GAME_COLORS.white.color,
      1
    );
    ellipse.setOrigin(0.5, 0.5);
    ellipse.setStrokeStyle(1, GAME_COLORS.gray.color);
    return new ResizeHandle(ellipse, position, offset);
  }
}
