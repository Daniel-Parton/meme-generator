import { isNil } from '@/utils/IsNil';

export type EditableTextStyle = {
  width?: number;
  height?: number;
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  strokeColor?: string;
  strokeThickness?: number;
  align?: 'left' | 'center' | 'right';
  padding?: { x: number; y: number };
};
export type EditableTextConfig = {
  scene: Phaser.Scene;
  x: number;
  y: number;
  style?: EditableTextStyle;
  text: string;
  isEditable?: boolean;
};

export const styleFromConfig = (
  config?: EditableTextStyle
): Phaser.Types.GameObjects.Text.TextStyle => {
  const style: Phaser.Types.GameObjects.Text.TextStyle = {
    align: config?.align || 'left',
    color: config?.color || '#000000',
    fontFamily: config?.fontFamily || 'Arial',
    fontSize: config?.fontSize || '16px',
    fixedWidth: isNil(config?.width) ? 100 : config.width,
    padding: isNil(config?.padding) ? { x: 2, y: 2 } : config.padding
  };

  if (!isNil(config?.height)) {
    style.fixedHeight = config.height;
  }

  if (config?.strokeColor) {
    style.stroke = config.strokeColor;
    style.strokeThickness = config.strokeThickness || 1;
  }

  return style;
};
