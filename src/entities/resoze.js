/* global colors, Phaser */

const { TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT } = Phaser.Display.Align;
const { red, yellow, blue } = colors.hexColors;

// For recycling
const _bounds = new Phaser.Geom.Rectangle();
const _rect = new Phaser.Geom.Rectangle();

function preload() {
  this.load.image("eye", "assets/pics/lance-overdose-loader-eye.png");
  this.load.atlas(
    "bird",
    "assets/animations/bird.png",
    "assets/animations/bird.json"
  );
  
  this.load.once(
    "filecomplete-json-bird",
    function (key, type, data) {
      this.anims.create({
        key: "walk",
        frames: this.anims.generateFrameNames(key, {
          prefix: "frame",
          end: 9
        }),
        frameRate: 24,
        repeat: -1
      });
    },
    this
  );
}

function create() {
  const image = this.add
    .image(128, 128, "eye")
    .setInteractive({ draggable: true, cursor: "grab" })
    .on("drag", onDragTarget);

  const sprite = this.add
    .sprite(256, 256, "bird")
    .setInteractive({ draggable: true, cursor: "grab" })
    .on("drag", onDragTarget)
    .setScale(1)
    .play("walk");

  createHandles.call(this, image);
  createHandles.call(this, sprite);
}

function createHandles(target) {
  const handles = {};

  handles[TOP_LEFT] = createHandle.call(this, target, TOP_LEFT);
  handles[TOP_RIGHT] = createHandle.call(this, target, TOP_RIGHT);
  handles[BOTTOM_LEFT] = createHandle.call(this, target, BOTTOM_LEFT);
  handles[BOTTOM_RIGHT] = createHandle.call(this, target, BOTTOM_RIGHT);

  target.setData("handles", handles);

  placeHandlesOnTarget(handles, target);
}

function createHandle(target, position) {
  return this.add
    .circle(0, 0, 8, blue, 0.8)
    .setData("target", target)
    .setData("position", position)
    .setInteractive({ draggable: true, cursor: "move" })
    .on("drag", onDragHandle);
}

function onDragHandle(pointer, dragX, dragY) {
  const target = this.getData("target");
  const center = target.getCenter();
  const rect = Phaser.Geom.Rectangle.FromXY(
    dragX,
    dragY,
    center.x,
    center.y,
    _rect
  );

  Phaser.Geom.Rectangle.Scale(rect, 2, 2);
  Phaser.Geom.Rectangle.CenterOn(rect, center.x, center.y);

  target.setDisplaySize(rect.width, rect.height);

  placeHandlesOnRect(target.getData("handles"), rect);
}

function onDragTarget(pointer, dragX, dragY) {
  this.setPosition(dragX, dragY);

  placeHandlesOnTarget(this.getData("handles"), this);
}

function placeHandlesOnRect(handles, rect) {
  const { left, right, top, bottom } = rect;

  handles[TOP_LEFT].setPosition(left, top);
  handles[TOP_RIGHT].setPosition(right, top);
  handles[BOTTOM_LEFT].setPosition(left, bottom);
  handles[BOTTOM_RIGHT].setPosition(right, bottom);
}

function placeHandlesOnTarget(handles, target) {
  placeHandlesOnRect(handles, target.getBounds(_bounds));
}

function update() {}

document.getElementById("version").textContent = `Phaser v${Phaser.VERSION}`;

new Phaser.Game({
  width: 512,
  height: 384,
  pixelArt: true,
  scene: {
    preload,
    create,
    update
  },
  loader: {
    baseURL: "https://labs.phaser.io",
    crossOrigin: "anonymous"
  }
});
