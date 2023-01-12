/**
 * ------------------------------------------------------------------
 * 此ES Module导出了Pixelate接口、以及addPiexelation函数；
 * 另外定义了pixelate函数、createImgData函数
 * ------------------------------------------------------------------
 */

import type {VideoJsPlayer} from 'video.js';

export interface PixelatePosition {
  //请注意这里的数字均为百分比
  leftX: number;
  leftY: number;
  rightX: number;
  rightY: number;
}

/**
 * 接受播放器实例和马赛克位置，将一个马赛克Canvas元素覆盖于播放器上，并提供涂抹选择买塞克位置的功能。
 *@param    {VideoJsPlayer}     player      播放器实例
 *@param    {PixelatePosition}  positions   马赛克位置
 *@returns  void
 *@date     2023-01-12
 *@author   RuntimeErroz<dariuszeng@qq.com>
 **/
export default function addPixelation(
  player: VideoJsPlayer,
  positions: PixelatePosition
) {
  const canvas = <HTMLCanvasElement>document.getElementById('pixelate');
  const video = <HTMLVideoElement>player.el().querySelector('video');

  let height: number;
  let width: number;
  let ratio: number;
  const originRatio = video.videoWidth / video.videoHeight;
  const currentRatio = player.currentWidth() / player.currentHeight();

  const videoParent = <HTMLElement>video.offsetParent;
  let top = video.offsetTop + videoParent.offsetTop;
  let left = video.offsetLeft + videoParent.offsetLeft;

  if (currentRatio > originRatio) {
    height = player.currentHeight();
    width = (height * video.videoWidth) / video.videoHeight;
    ratio = height / video.videoHeight;
    left += (player.currentWidth() - width) / 2;
    canvas.setAttribute(
      'style',
      `position: absolute; top:${top}px; left:${left}px;z-index: 1000;`
    );
  } else {
    width = player.currentWidth();
    height = (width * video.videoHeight) / video.videoWidth;
    ratio = width / video.videoWidth;
    top += (player.currentHeight() - height) / 2;
    canvas.setAttribute(
      'style',
      `position: absolute; top:${top}px; left:${left}px;z-index: 1000;`
    );
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error();
  const sourceLayer = document.createElement('canvas');
  const pixelateLayer = document.createElement('canvas');
  const pathLayer = document.createElement('canvas');
  const sourceContext = sourceLayer.getContext('2d', {
    willReadFrequently: true
  });
  const pixelateContext = pixelateLayer.getContext('2d');
  const pathContext = pathLayer.getContext('2d');

  canvas.width =
    sourceLayer.width =
    pixelateLayer.width =
    pathLayer.width =
      width;
  canvas.height =
    sourceLayer.height =
    pixelateLayer.height =
    pathLayer.height =
      height;

  if (!pathContext) throw new Error('');
  pathContext.lineCap = 'round';
  pathContext.lineJoin = 'round';
  pathContext.lineWidth = 20;

  const x = (width * positions.leftX) / 100;
  const y = (height * (100 - positions.rightY)) / 100;
  const w = ((positions.rightX - positions.leftX) / 100) * width;
  const h = ((positions.rightY - positions.leftY) / 100) * height;
  pathContext.fillRect(x / ratio, y / ratio, w / ratio, h / ratio);

  canvas.addEventListener('mousedown', mouseHandle);
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
    pixelateContext?.putImageData(
      <ImageData>pixelate(<ImageData>sourceImgData, 20, 20),
      0,
      0
    );

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(pathLayer, 0, 0, width, height);
    ctx.globalCompositeOperation = 'source-in'; //马赛克层
    ctx.drawImage(pixelateLayer, 0, 0, width, height);
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(sourceLayer, 0, 0, width, height);
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

/**
 * 接受ImageData的长和宽，返回一个空的ImgData。
 *@param    {number}      width      所需ImgData的宽度
 *@param    {number}      height     所需ImgData的高度
 *@returns  {ImgData}     马赛克数据
 *@date     2023-01-12
 *@author   RuntimeErroz<dariuszeng@qq.com>
 **/
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
 *@param    {ImageData}   srcImageData         源数据
 *@param    {number}      pixelationWidth      马赛克宽度
 *@param    {number}      pixelationHeight     马赛克高度
 *@returns  {ImgData}     马赛克数据
 *@date     2023-01-12
 *@author   RuntimeErroz<dariuszeng@qq.com>
 **/
function pixelate(
  srcImageData: ImageData,
  pixelationWidth: number,
  pixelationHeight: number
) {
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
      b = Math.round(b / pixelCount);

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
  return imageData;
}
