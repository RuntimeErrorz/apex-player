/**
 * 此ES Module导出了Pixelate接口、以及addPiexelation函数；
 * 另外定义了pixelate函数、createImgData函数
 * @module utils/pixelate
 */
import type {VideoJsPlayer} from 'video.js';
import type {Ref} from 'vue';

export interface PixelatePosition {
  //请注意这里的数字均为百分比
  leftX: number;
  leftY: number;
  rightX: number;
  rightY: number;
}

/**
 * 接受播放器实例和马赛克相对位置和动画ID，取消该动画ID的动画，并将将一个指定位置的马赛克Canvas元素覆盖于播放器上，并提供涂抹选择马塞克位置的功能。
 * @param    {VideoJsPlayer}     player      -播放器实例
 * @param    {PixelatePosition}  positions   -马赛克位置
 * @param    {Ref<number>}
 * @returns  void
 * @date     2023-01-12
 * @author   RuntimeErroz<dariuszeng@qq.com>
 */
export default function pixelation(
  player: VideoJsPlayer,
  positions: PixelatePosition,
  animationID: Ref<number>
) {
  cancelAnimationFrame(animationID.value);
  const [width, height, ratio, top, left] = getPlayerInfo(player);
  addPixelation(player, positions, width, height, ratio, top, left, animationID);
}

/**
 * 接受播放器实例，返回视频的长宽以及马赛克Canvas缩放比例，以及相对视图窗口左上角的top与left。
 * @param    {VideoJsPlayer}   player - 播放器实例
 * @returns  {Array<number>}
 * @date     2023-01-12
 * @author   RuntimeErroz<dariuszeng@qq.com>
 */
export function getPlayerInfo(player: VideoJsPlayer) {
  const video = <HTMLVideoElement>player.el().querySelector('video');
  let top = video.getBoundingClientRect().top;
  let left = video.getBoundingClientRect().left;
  let height: number;
  let width: number;
  let ratio: number;
  const originRatio = video.videoWidth / video.videoHeight;
  const currentRatio = player.currentWidth() / player.currentHeight();

  if (currentRatio > originRatio) {
    height = player.currentHeight();
    width = (height * video.videoWidth) / video.videoHeight;
    ratio = height / video.videoHeight;
    left += (player.currentWidth() - width) / 2;
  } else {
    width = player.currentWidth();
    height = (width * video.videoHeight) / video.videoWidth;
    ratio = width / video.videoWidth;
    top += (player.currentHeight() - height) / 2;
  }
  if (ratio < 1) ratio = 1;
  return [width, height, ratio, top, left];
}

/**
 * 接受播放器实例和马赛克具体参数，将一个马赛克Canvas元素覆盖于播放器上，并提供涂抹选择马塞克位置的功能。
 * @param    {VideoJsPlayer}     player      - 播放器实例
 * @param    {PixelatePosition}  positions   - 马赛克相对位置
 * @param    {number}  width   - 马赛克宽度
 * @param    {number}  height   - 马赛克高度
 * @param    {number}  ratio   - 马赛克缩放比例
 * @param    {number}  top   - 马赛克距离Viewport顶部的距离
 * @param    {number}  left   - 马赛克距离Viewport左部的距离
 * @param    {Ref<number>}  animationID   - 动画ID
 * @returns  void
 * @date     2023-01-12
 * @author   RuntimeErroz<dariuszeng@qq.com>
 */
export function addPixelation(
  player: VideoJsPlayer,
  positions: PixelatePosition,
  width: number,
  height: number,
  ratio: number,
  top: number,
  left: number,
  animationID: Ref<number>
) {
  const canvas = <HTMLCanvasElement>document.getElementById('pixelate');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error();
  canvas.setAttribute('style', `position: absolute; top:${top}px; left:${left}px;z-index: 1000;`);
  const video = <HTMLVideoElement>player.el().querySelector('video');
  const sourceLayer = document.createElement('canvas'); //整体三层canvas，一层源一层马赛克一层路径
  const pixelateLayer = document.createElement('canvas');
  const pathLayer = document.createElement('canvas');
  const sourceContext = sourceLayer.getContext('2d', {
    willReadFrequently: true
  });
  const pixelateContext = pixelateLayer.getContext('2d');
  const pathContext = pathLayer.getContext('2d');

  ctx.clearRect(0, 0, width, height);

  canvas.width = sourceLayer.width = pixelateLayer.width = pathLayer.width = width;
  canvas.height = sourceLayer.height = pixelateLayer.height = pathLayer.height = height;

  if (!pathContext) throw new Error('');
  pathContext.lineCap = 'round';
  pathContext.lineJoin = 'round';
  pathContext.lineWidth = 20;

  const x = (width * positions.leftX) / 100;
  const y = (height * (100 - positions.rightY)) / 100;
  const w = ((positions.rightX - positions.leftX) / 100) * width;
  const h = ((positions.rightY - positions.leftY) / 100) * height;
  pathContext.fillRect(x / ratio, y / ratio, w / ratio, h / ratio);

  canvas.addEventListener('mousedown', mouseHandle); //处理涂抹打码
  function mouseHandle(e: MouseEvent) {
    if (e.type === 'mousedown') {
      pathContext?.moveTo(e.offsetX / ratio, e.offsetY / ratio);
      canvas.addEventListener('mousemove', mouseHandle);
      canvas.addEventListener('mouseup', mouseHandle);
    } else if (e.type === 'mousemove') {
      pathContext?.lineTo(e.offsetX / ratio, e.offsetY / ratio);
    } else if (e.type === 'mouseup') {
      canvas.removeEventListener('mousemove', mouseHandle);
      canvas.removeEventListener('mouseup', mouseHandle);
    }
    pathContext?.stroke();
  }
  canvas.onclick = () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };
  ctx.scale(ratio, ratio);
  function draw() {
    sourceContext?.drawImage(video, 0, 0);
    const sourceImgData = sourceContext?.getImageData(0, 0, width, height);
    if (!ctx) throw new Error('');
    pixelateContext?.putImageData(<ImageData>pixelate(<ImageData>sourceImgData, 20, 20), 0, 0);

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(pathLayer, 0, 0, width, height);
    ctx.globalCompositeOperation = 'source-in'; //马赛克图形只在涂抹路径和马赛克图层重合时绘制
    ctx.drawImage(pixelateLayer, 0, 0, width, height);
    ctx.globalCompositeOperation = 'destination-over'; //在现有的画布内容后面绘制新的图形。
    ctx.drawImage(sourceLayer, 0, 0, width, height);
    animationID.value = requestAnimationFrame(draw);
  }
  animationID.value = requestAnimationFrame(draw);
}

/**
 * 接受ImageData的长和宽，返回一个空的ImgData。
 * @param    {number}      width      所需ImgData的宽度
 * @param    {number}      height     所需ImgData的高度
 * @returns  {ImgData}     马赛克数据
 * @date     2023-01-12
 * @author   RuntimeErroz<dariuszeng@qq.com>
 */
function createImageData(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx?.createImageData(width, height);
  return imageData;
}

/**
 * 接受ImageData类型的源数据和马赛克的长与宽，返回打码后的ImgData。
 * @param    {ImageData}   srcImageData         源数据
 * @param    {number}      pixelationWidth      马赛克宽度
 * @param    {number}      pixelationHeight     马赛克高度
 * @returns  {ImageData}     马赛克数据
 * @date     2023-01-12
 * @author   RuntimeErroz<dariuszeng@qq.com>
 */
function pixelate(
  srcImageData: ImageData,
  pixelationWidth: number,
  pixelationHeight: number
): ImageData {
  const srcData = srcImageData.data,
    imgWidth = srcImageData.width,
    imgHeight = srcImageData.height,
    imageData = createImageData(imgWidth, imgHeight),
    data = imageData?.data;
  let w, h, r, g, b, pixelIndex, pixelCount;

  for (let x = 0; x < imgWidth; x += pixelationWidth) {
    if (pixelationWidth <= imgWidth - x) {
      w = pixelationWidth;
    } else {
      w = imgWidth - x;
    }

    for (let y = 0; y < imgHeight; y += pixelationHeight) {
      if (pixelationHeight <= imgHeight - y) {
        h = pixelationHeight;
      } else {
        h = imgHeight - y;
      }

      r = g = b = 0;
      for (let i = 0; i < w; i += 1) {
        for (let j = 0; j < h; j += 1) {
          pixelIndex = ((y + j) * imgWidth + (x + i)) * 4;
          r += srcData[pixelIndex];
          g += srcData[pixelIndex + 1];
          b += srcData[pixelIndex + 2];
        }
      }

      pixelCount = w * h;
      r = Math.round(r / pixelCount);
      g = Math.round(g / pixelCount);
      b = Math.round(b / pixelCount); //具体实现通过平均所给马赛克长宽内的像素颜色而达到马赛克的效果

      if (data)
        for (let i = 0; i < w; i += 1) {
          for (let j = 0; j < h; j += 1) {
            pixelIndex = ((y + j) * imgWidth + (x + i)) * 4;
            data[pixelIndex] = r;
            data[pixelIndex + 1] = g;
            data[pixelIndex + 2] = b;
            data[pixelIndex + 3] = srcData[pixelIndex + 3];
          }
        }
    }
  }
  return <ImageData>imageData;
}
