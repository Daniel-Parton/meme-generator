import { HeightWidth } from '@/utils/SizeHelper';

export type ResizePositions =
  | 'top-left'
  | 'top-middle'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-middle'
  | 'bottom-left'
  | 'bottom-right';

export type ResizeHandleObject = Phaser.GameObjects.GameObject &
  Phaser.GameObjects.Components.AlphaSingle &
  Phaser.GameObjects.Components.Transform &
  Phaser.GameObjects.Components.Origin & {
    fillColor: number;
    setSize?: (width: number, height: number) => unknown;
    setFillStyle: (color?: number, alpha?: number) => unknown;
    setInteractive: (config: Phaser.Types.Input.InputConfiguration) => unknown;
    on: (event: string | symbol, fn: Function, context?: any) => unknown;
    off: (event: string | symbol, fn: Function, context?: any) => unknown;
  };
// Phaser.GameObjects.Components.Depth &
// Phaser.GameObjects.Components.GetBounds &
// Phaser.GameObjects.Components.ComputedSize &
// Phaser.GameObjects.Components.Transform;

export interface ResizeStartData
  extends Phaser.Types.Math.Vector2Like,
    HeightWidth {
  scale: number;
}

export interface TargetTrackingData extends HeightWidth {
  xOffset: number;
  yOffset: number;
  angle: number;
}
