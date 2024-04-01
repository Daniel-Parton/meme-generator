import { GAME_EVENTS } from 'GameEvents';
import { nanoid } from 'nanoid';
import { SelectBox } from './_SelectBox';
import {
  ILiveItem,
  LiveItemImageConfig,
  LiveItemConfig,
  LiveItemTextConfig,
  LiveItemTypes
} from './LiveItem.types';
import { EditableText } from '@/entities/EditableText/EditableText';
import { isNil } from '@/utils/IsNil';

export class LiveItem {
  private readonly _item: ILiveItem;
  type: LiveItemTypes;
  static Events = {
    boundsChanged: 'BOUNDS_CHANGED',
    rotateStarted: 'ROTATE_STARTED',
    rotateEnded: 'ROTATE_ENDED',
    resizeStarted: 'RESIZE_STARTED',
    resizeEnded: 'RESIZE_ENDED'
  };
  selectBox: SelectBox;
  minDisplaySize: number = 5;
  isDragging: boolean = false;
  isSelected: boolean = false;
  canDrag: boolean = false;
  canResize: boolean = false;
  canRotate: boolean = false;
  defaultScale: number;
  dragOffset: Phaser.Types.Math.Vector2Like = { x: 0, y: 0 };

  get name() {
    return this._item.name;
  }

  get x() {
    return this._item.x;
  }

  get y() {
    return this._item.y;
  }

  get width() {
    return this._item.width;
  }

  get height() {
    return this._item.height;
  }

  get displayWidth() {
    return this._item.displayWidth;
  }

  get displayHeight() {
    return this._item.displayHeight;
  }

  get angle() {
    return this._item.angle;
  }

  get scale() {
    return this._item.scale;
  }

  get scene() {
    return this._item.scene;
  }

  constructor({
    id,
    item,
    type,
    defaultScale = 1,
    canDrag = true,
    canResize = true,
    canRotate = true
  }: LiveItemConfig) {
    this._item = item;
    this._item.setName(id ?? nanoid());
    this.type = type;
    this.canDrag = canDrag;
    this.canResize = canResize;
    this.canRotate = canRotate;
    this.defaultScale = defaultScale;
    this.init();
  }

  init() {
    this._item.setOrigin(0.5, 0.5);
    this.setScale(this.defaultScale);
    this._item.setInteractive({
      cursor: this.canDrag ? 'grab' : 'pointer',
      draggable: this.canDrag
    } as Phaser.Types.Input.InputConfiguration);
    this.selectBox = new SelectBox(this.scene, this);

    this.on('pointerdown', this.handleClick, this);
    if (this.canDrag) {
      this.on('dragstart', this.handleDragStart, this);
    }
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
  }

  //#region Decorated Functions
  //Override setPosition method to emit custom event
  setPosition(x?: number, y?: number, z?: number, w?: number): this {
    this._item.setPosition(x, y, z, w);
    this.raiseBoundsChanged();
    return this;
  }

  //Override setDisplaySize method to emit custom event
  setDisplaySize(width: number, height: number): this {
    this._item.setDisplaySize(width, height);
    this.raiseBoundsChanged();
    return this;
  }

  setSize(width: number, height: number): this {
    this._item.setSize(width, height);
    this.raiseBoundsChanged();
    return this;
  }

  //Override setDisplaySize method to emit custom event
  setScale(x: number, y?: number): this {
    if (isNil(y)) {
      y = x;
    }

    // Calculate the new display size
    const newDisplayWidth = Phaser.Math.Snap.To(this._item.width * x, 1);
    const newDisplayHeight = Phaser.Math.Snap.To(this._item.height * y, 1);

    // Check if the new display size is below the minimum
    if (
      newDisplayWidth < this.minDisplaySize ||
      newDisplayHeight < this.minDisplaySize
    ) {
      return this;
    }

    const snappedScaleX = newDisplayWidth / this._item.width;
    const snappedScaleY = newDisplayHeight / this._item.height;

    this._item.setScale(snappedScaleX, snappedScaleY);
    this.raiseBoundsChanged();
    return this;
  }

  resize(width: number, height: number): this {
    // Calculate the new display size
    const snappedWidth = Phaser.Math.Snap.To(width, 1);
    const snappedHeight = Phaser.Math.Snap.To(height, 1);

    // Check if the new display size is below the minimum
    if (
      snappedWidth < this.minDisplaySize ||
      snappedHeight < this.minDisplaySize
    ) {
      return this;
    }

    switch (this.type) {
      case 'text':
        return this.setSize(snappedWidth, snappedHeight);
      case 'image':
      default:
        return this.setDisplaySize(snappedWidth, snappedHeight);
    }
  }

  setAngle(degrees?: number): this {
    this._item.setAngle(degrees);
    this.raiseBoundsChanged();
    return this;
  }

  on(event: string | symbol, fn: Function, context?: any): this {
    this._item.on(event, fn, context);
    return this;
  }

  off(event: string | symbol, fn: Function, context?: any): this {
    this._item.on(event, fn, context);
    return this;
  }

  getBounds() {
    return this._item.getBounds();
  }

  getTopLeft() {
    return this._item.getTopLeft();
  }

  getTopRight() {
    return this._item.getTopRight();
  }

  getTopCenter() {
    return this._item.getTopCenter();
  }

  getLeftCenter() {
    return this._item.getLeftCenter();
  }

  getRightCenter() {
    return this._item.getRightCenter();
  }

  getBottomLeft() {
    return this._item.getBottomLeft();
  }

  getBottomCenter() {
    return this._item.getBottomCenter();
  }

  getBottomRight() {
    return this._item.getBottomRight();
  }

  getCenter() {
    return this._item.getCenter();
  }

  emit(event: string | symbol, ...args: any[]): boolean {
    return this._item.emit(event, ...args);
  }

  //#endregion

  //#region Event Handlers

  private handleDragStart(pointer: Phaser.Input.Pointer) {
    this.isDragging = true;
    this.scene.game.canvas.style.cursor = 'grabbing';
    this.off('dragstart', this.handleDragStart, this);
    this.animateScale(this.scale * 1.01);
    this.dragOffset = {
      x: this.x - pointer.x,
      y: this.y - pointer.y
    };
    this.on('drag', this.handleDrag, this);
    this.on('dragend', this.handleDragEnd, this);
  }

  private handleDrag(pointer: Phaser.Input.Pointer) {
    const newPosition: Phaser.Types.Math.Vector2Like = {
      x: pointer.x + this.dragOffset.x,
      y: pointer.y + this.dragOffset.y
    };

    this.setPosition(newPosition.x, newPosition.y);
    this.scene.events.emit(GAME_EVENTS.ItemDragging, { x: this.x, y: this.y });
  }

  private handleDragEnd() {
    this.scene.events.emit(GAME_EVENTS.ItemDropped, this);
    this.dragOffset = { x: 0, y: 0 };
    this.animateScale(this.scale * 0.99);
    this.on('dragstart', this.handleDragStart, this);
    this.off('drag', this.handleDrag, this);
    this.off('dragend', this.handleDragEnd, this);
    this.scene.game.canvas.style.cursor = 'grab';
  }

  private handleClick() {
    if (!this.isSelected) {
      this.isSelected = true;
      this.scene.children.bringToTop(this._item);
      this.scene.events.emit(GAME_EVENTS.ItemSelected, this);
    }
  }

  private handleItemSelected(item: Phaser.GameObjects.GameObject) {
    if (this.name !== item.name) {
      this.isSelected = false;
    }
  }

  private handleItemUnSelected() {
    this.isSelected = false;
  }

  //#endregion

  onResizeStarted(fn: Function, context?: any): this {
    this._item.on(LiveItem.Events.resizeStarted, fn, context);
    return this;
  }

  offResizeStarted(fn: Function): this {
    this._item.off(LiveItem.Events.resizeStarted, fn);
    return this;
  }

  onResizeEnded(fn: Function, context?: any): this {
    this._item.on(LiveItem.Events.resizeEnded, fn, context);
    return this;
  }

  offResizeEnded(fn: Function): this {
    this._item.off(LiveItem.Events.resizeEnded, fn);
    return this;
  }

  onRotateStarted(fn: Function, context?: any): this {
    this._item.on(LiveItem.Events.rotateStarted, fn, context);
    return this;
  }

  offRotateStarted(fn: Function): this {
    this._item.off(LiveItem.Events.rotateStarted, fn);
    return this;
  }

  onRotateEnded(fn: Function, context?: any): this {
    this._item.on(LiveItem.Events.rotateEnded, fn, context);
    return this;
  }

  offRotateEnded(fn: Function): this {
    this._item.off(LiveItem.Events.rotateEnded, fn);
    return this;
  }

  onBoundsChanged(fn: Function, context?: any): this {
    this._item.on(LiveItem.Events.boundsChanged, fn, context);
    return this;
  }

  offBoundsChange(fn: Function) {
    this._item.off(LiveItem.Events.boundsChanged, fn);
    return this;
  }

  onHover(fn: Function, context?: any): this {
    this._item.on('pointerover', fn, context);
    return this;
  }

  offHover(fn: Function): this {
    this._item.off('pointerover', fn);
    return this;
  }

  onHoverLeave(fn: Function, context?: any): this {
    this._item.on('pointerout', fn, context);
    return this;
  }

  offHoverLeave(fn: Function): this {
    this._item.off('pointerout', fn);
    return this;
  }

  bringToTop() {
    this._item.scene.children.bringToTop(this._item);
  }

  //This will update the x and y so the item doesn't jerk around
  setOrigin(newOriginX: number, newOriginY: number) {
    const oldOriginX = this._item.originX;
    const oldOriginY = this._item.originY;

    const deltaX = (newOriginX - oldOriginX) * this.displayWidth;
    const deltaY = (newOriginY - oldOriginY) * this.displayHeight;

    console.log({
      size: { width: this.displayWidth, height: this.displayHeight },
      newO: { x: newOriginX, y: newOriginY },
      oldO: { x: oldOriginX, y: oldOriginY },
      dX: deltaX,
      dY: deltaY
    });
    this._item.setOrigin(newOriginX, newOriginY);
    this._item.setPosition(this.x + deltaX, this.y + deltaY);
  }

  private animateScale(value: number, duration: number = 100) {
    this.scene.tweens.add({
      scale: value,
      targets: this,
      duration,
      ease: Phaser.Math.Easing.Sine.InOut,
      onComplete: () => {
        this.raiseBoundsChanged();
      }
    });
  }

  private raiseBoundsChanged() {
    this._item.emit(LiveItem.Events.boundsChanged, this.getBounds());
  }

  static Image({
    scene,
    key,
    id: idProp,
    x: xProp,
    y: yProp,
    ...rest
  }: LiveItemImageConfig) {
    const x = isNil(xProp) ? scene.game.canvas.width / 2 : xProp;
    const y = isNil(yProp) ? scene.game.canvas.height / 2 : yProp;
    const id = isNil(idProp) ? `${key}-${nanoid()}` : idProp;

    return new LiveItem({
      item: scene.add.image(x, y, key),
      type: 'image',
      id,
      ...rest
    });
  }

  static Text({
    scene,
    style,
    text,
    id: idProp,
    x: xProp,
    y: yProp,
    isEditable,
    ...rest
  }: LiveItemTextConfig) {
    if (isNil(style)) {
    }
    const x = isNil(xProp) ? scene.game.canvas.width / 2 : xProp;
    const y = isNil(yProp) ? scene.game.canvas.height / 2 : yProp;
    const id = isNil(idProp) ? `text-${nanoid()}` : idProp;

    return new LiveItem({
      item: new EditableText({
        scene,
        x,
        y,
        text,
        style,
        isEditable
      }),
      type: 'text',
      id,
      ...rest
    });
  }
}
