export const hexColor = (hex: string) =>
  Phaser.Display.Color.HexStringToColor(hex);

export const GAME_COLORS = {
  select: hexColor('#0058E4'),
  white: hexColor('#FFFFFF'),
  black: hexColor('#000000'),
  gray: hexColor('#696969')
};
