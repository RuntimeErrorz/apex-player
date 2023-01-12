/**
 * ------------------------------------------------------------------
 * 此ES Module导出了函数名为invertColor的函数。
 * ------------------------------------------------------------------
 */

import type {VideoJsPlayer} from 'video.js';

/**
 * 接受一个播放器实例，将其中的画面反色显示到ID为invert的canvas元素上。
 *@param    {VideoJsPlayer}  player   播放器实例
 *@returns  void
 *@date     2023-01-12
 *@author   RuntimeErroz<dariuszeng@qq.com>
 **/
export default function invertColor(player: VideoJsPlayer) {
  const canv = <HTMLCanvasElement>document.getElementById('invert');
  const cxt = <CanvasRenderingContext2D>(
    canv.getContext('2d', {willReadFrequently: true})
  );
  const video = <HTMLVideoElement>player.el().querySelector('video');

  canv.width = video.videoWidth;
  canv.height = video.videoHeight;

  function effectInvert() {
    cxt.drawImage(video, 0, 0, canv.width, canv.height);
    const vidData = cxt.getImageData(0, 0, canv.width, canv.height);

    for (let z = 0; z < vidData.data.length; z += 4) {
      vidData.data[z] = 255 - vidData.data[z];
      vidData.data[z + 1] = 255 - vidData.data[z + 1];
      vidData.data[z + 2] = 255 - vidData.data[z + 2];
      vidData.data[z + 3] = 255;
    }
    cxt.putImageData(vidData, 0, 0);
    requestAnimationFrame(effectInvert);
  }
  requestAnimationFrame(effectInvert);

  canv.addEventListener('click', function () {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });
}
