import { GAME_EVENTS } from 'GameEvents';
import { LiveItem, LiveItemTypes } from '@/entities/LiveItem';
import { ResizeHandle } from './_ResizeHandle';
import { ResizePositions } from './LiveItemTransformer.types';
import { RotateButton } from './_RotateButton';

export class LiveItemTransformer extends Phaser.GameObjects.Group {
  target?: LiveItem;
  rotateBtn: RotateButton;
  resizeHandles: Record<ResizePositions, ResizeHandle> = {
    'top-left': null,
    'top-middle': null,
    'top-right': null,
    'middle-left': null,
    'middle-right': null,
    'bottom-left': null,
    'bottom-middle': null,
    'bottom-right': null
  };
  offset: number = 0;
  constructor(scene: Phaser.Scene) {
    super(scene);
    scene.add.existing(this);
    this.init();
  }

  init() {
    this.rotateBtn = new RotateButton(this.scene);
    this.add(this.rotateBtn);

    for (let p in this.resizeHandles) {
      const pos = p as ResizePositions;
      if (pos.includes('middle')) {
        this.resizeHandles[pos] = ResizeHandle.Ellipse(
          this.scene,
          pos.startsWith('middle') ? 'vertical' : 'horizontal',
          pos,
          this.offset
        );
      } else {
        this.resizeHandles[pos] = ResizeHandle.Circle(
          this.scene,
          pos,
          this.offset
        );
      }
      this.add(this.resizeHandles[pos].handle);
    }

    this.scene.events.on(GAME_EVENTS.ItemSelected, this.handleSelected, this);
    this.scene.events.on(
      GAME_EVENTS.ItemUnSelected,
      this.handleUnSelected,
      this
    );
  }

  private handleSelected(item: LiveItem) {
    this.target = item;
    if (item.canResize) {
      const keys = this.resolveResizePositions(this.target.type);

      for (const k in this.resizeHandles) {
        const handle = this.resizeHandles[k as ResizePositions];
        if (keys.includes(handle.position)) {
          handle.setTarget(item);
        } else {
          handle.clearTarget();
        }
      }
    }

    if (item.canRotate) {
      this.rotateBtn.setTarget(item);
    }
  }

  private handleUnSelected() {
    if (!this.target) return;
    if (this.target.canResize) {
      for (const key in this.resizeHandles) {
        this.resizeHandles[key as ResizePositions].clearTarget();
      }
    }

    if (this.target.canRotate) {
      this.rotateBtn.clearTarget();
    }

    this.target = null;
  }

  private resolveResizePositions(type: LiveItemTypes): ResizePositions[] {
    switch (type) {
      case 'image':
        return ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
      case 'text':
        return ['middle-left', 'middle-right'];
      default:
        return [];
    }
  }
}
