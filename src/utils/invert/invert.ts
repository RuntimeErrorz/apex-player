/**
 * ------------------------------------------------------------------
 * 此ES Module导出了函数名为invertColor的函数。
 * ------------------------------------------------------------------
 */

import type {VideoJsPlayer} from 'video.js';

/**
 * 接受一个播放器实例，将其中的画面反色显示到ID为invert的canvas元素上。并为其添加点击暂停时间。
 *@param    {VideoJsPlayer}  player   播放器实例
 *@returns  void
 *@date     2023-01-12
 *@author   RuntimeErroz<dariuszeng@qq.com>
 * */
export default function invertColor(player: VideoJsPlayer) {
  const video = <HTMLVideoElement>player.el().querySelector('video');
  const canv = <HTMLCanvasElement>document.getElementById('invert');
  const context = <CanvasRenderingContext2D>canv.getContext('2d', {willReadFrequently: true});

  canv.width = video.videoWidth;
  canv.height = video.videoHeight;

  canv.addEventListener('click', () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });

  requestAnimationFrame(() => effectInvert(video, context, canv.width, canv.height));
}

/**
 * invertColor的具体实现
 *@param    {HTMLVideoElement}  video             视频对象
 *@param    {CanvasRenderingContext2D}  context   渲染上下文
 *@param    {number}  width                       canvas宽度
 *@param    {number}  height                      canvas高度
 *@returns  void
 *@date     2023-01-12
 *@author   RuntimeErroz<dariuszeng@qq.com>
 * */
export function effectInvert(
  video: HTMLVideoElement,
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  context.drawImage(video, 0, 0, width, height);
  const vidData = vidDataInvert(context.getImageData(0, 0, width, height));
  context.putImageData(vidData, 0, 0);
  requestAnimationFrame(() => effectInvert(video, context, width, height));
}

/**
 * 接受一个ImgData，将其反色返回。
 *@param    {ImageData}  vidData   视频某一帧的画面数据
 *@returns  {ImageData}            反色后的画面数据
 *@date     2023-01-12
 *@author   RuntimeErroz<dariuszeng@qq.com>
 * */
export function vidDataInvert(vidData: ImageData): ImageData {
  for (let i = 0; i < vidData.data.length; i += 4) {
    vidData.data[i] = 255 - vidData.data[i];
    vidData.data[i + 1] = 255 - vidData.data[i + 1];
    vidData.data[i + 2] = 255 - vidData.data[i + 2];
    vidData.data[i + 3] = 255;
  }
  return vidData;
}
