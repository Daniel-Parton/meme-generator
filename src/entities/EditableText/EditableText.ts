import {
  EditableTextConfig,
  EditableTextStyle,
  styleFromConfig
} from './EditableText.types';

export class EditableText extends Phaser.GameObjects.Text {
  isEditable: boolean;
  configStyle?: EditableTextStyle;

  constructor({
    scene,
    x,
    y,
    text,
    style,
    isEditable = true
  }: EditableTextConfig) {
    super(scene, x, y, text, styleFromConfig(style));
    this.configStyle = style;
    this.isEditable = isEditable;
    scene.add.existing(this);
    this.init();
  }

  init() {
    this.setOrigin(0.5, 0.5);
  }

  setSize(width: number, height: number): this {
    super.setSize(width, height);
    this.setFixedSize(width, height);
    return this;
  }
}
