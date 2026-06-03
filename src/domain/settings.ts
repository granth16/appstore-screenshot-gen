// ---------------------------------------------------------------------------
// Fixed geometry + persistence keys. Numbers here were measured against the
// iOS bezel PNG and the CSS-drawn bezels in studio/canvas/bezels.tsx; keep the
// two in sync if you retouch a frame.
// ---------------------------------------------------------------------------

// Aspect ratios (width / height) of each device frame.
export const IOS_BEZEL_RATIO = 1022 / 2082; // matches /public/ios-bezel.png
export const IOS_TABLET_RATIO = 0.77;
export const PLAY_TABLET_PORTRAIT_RATIO = 2 / 3;
export const PLAY_TABLET_LANDSCAPE_RATIO = 3 / 2;
export const PLAY_PHONE_RATIO = 9 / 19.5;

// The transparent screen window inside the iOS bezel PNG, as percentages.
export const IOS_SCREEN_WINDOW = {
  left: (52 / 1022) * 100,
  top: (46 / 2082) * 100,
  width: (918 / 1022) * 100,
  height: (1990 / 2082) * 100,
  radiusX: (126 / 918) * 100,
  radiusY: (126 / 1990) * 100,
};

export const IOS_BEZEL_ASSET = "/ios-bezel.png";

// A device's on-canvas width is a fraction of the canvas width, derived from
// the canvas aspect and the frame aspect, then clamped so tall canvases don't
// produce comically large frames.
function frameWidthFraction(
  canvasW: number,
  canvasH: number,
  frameRatio: number,
  fill: number,
  clamp: number,
): number {
  return Math.min(clamp, fill * (canvasH / canvasW) * frameRatio);
}

export const phoneWidthFraction = (cw: number, ch: number, clamp = 0.84) =>
  frameWidthFraction(cw, ch, IOS_BEZEL_RATIO, 0.72, clamp);

export const phoneWidthFractionSmall = (cw: number, ch: number) =>
  phoneWidthFraction(cw, ch, 0.66);

export const iosTabletWidthFraction = (cw: number, ch: number, clamp = 0.75) =>
  frameWidthFraction(cw, ch, IOS_TABLET_RATIO, 0.72, clamp);

export const playTabletPortraitWidthFraction = (cw: number, ch: number, clamp = 0.8) =>
  frameWidthFraction(cw, ch, PLAY_TABLET_PORTRAIT_RATIO, 0.72, clamp);

export const playTabletLandscapeWidthFraction = (cw: number, ch: number, clamp = 0.62) =>
  frameWidthFraction(cw, ch, PLAY_TABLET_LANDSCAPE_RATIO, 0.75, clamp);

// Persistence
export const DOC_STORAGE_KEY = "vitrine:studio-doc:v1";
export const DOC_FILE_NAME = "vitrine.project.json";
