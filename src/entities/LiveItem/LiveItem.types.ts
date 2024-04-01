import { EditableTextStyle } from '@/entities/EditableText/EditableText.types';

export type LiveItemConfig = {
  id: string;
  item: ILiveItem;
  type: LiveItemTypes;
  canDrag?: boolean;
  canResize?: boolean;
  defaultScale?: number;
  canRotate?: boolean;
};

export interface LiveItemImageConfig
  extends Omit<LiveItemConfig, 'item' | 'id' | 'type'> {
  scene: Phaser.Scene;
  x?: number;
  y?: number;
  id?: string;
  key: string;
}

export interface LiveItemTextConfig
  extends Omit<LiveItemConfig, 'item' | 'id' | 'type'> {
  scene: Phaser.Scene;
  x?: number;
  y?: number;
  text?: string;
  id?: string;
  style?: EditableTextStyle;
  isEditable?: boolean;
}

export type LiveItemTypes = 'image' | 'text';
export type ILiveItem = Phaser.GameObjects.GameObject &
  Phaser.GameObjects.Components.Depth &
  Phaser.GameObjects.Components.GetBounds &
  Phaser.GameObjects.Components.Origin &
  Phaser.GameObjects.Components.ComputedSize &
  Phaser.GameObjects.Components.Transform;
