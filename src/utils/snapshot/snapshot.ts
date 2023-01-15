/**
 * ------------------------------------------------------------------
 * 此ES Module处理了侧边栏的添加与截图与录屏功能的实现。
 * 导出了RecordParams类、screenshotHandle、recordHandle、customizeSidebar函数；
 * 实现了downloadFile、downloadVia、drawMedia函数。
 * ------------------------------------------------------------------
 */
import RecordRTC from 'recordrtc';
import videojs from 'video.js';
import type {VideoJsPlayer} from 'video.js';
import type {Ref} from 'vue';

import cameraImg from '@/assets/images/camera-outline.png';
import monitorImg from '@/assets/images/monitor-screenshot.png';

/**
 * 自定义video.js的侧边栏，添加截图与录屏按钮
 *@returns  void
 *@date     2023-01-12
 *@author   RuntimeErroz<dariuszeng@qq.com>
 * */
export default function customiseSidebar() {
  const Component = videojs.getComponent('Component');
  const CustomBar = videojs.extend(Component, {
    createEl() {
      const divDom = videojs.dom.createEl('div', {
        className: 'vjs-custom-bar',
        innerHTML: `
          <div  class="vjs-custom-control-bar vjs-button ac">
            <img src="${cameraImg}"  class="snapshot-img"/>
            <span class="ml10">截图</span>
          </div>
          <div class="mt10 vjs-custom-control-bar ac" >
            <img src="${monitorImg}" class="snapshot-img" />
            <span class="ml10">录像</span>
          </div>
        `
      });
      divDom.setAttribute('style', 'z-index:1001');
      return divDom;
    }
  });
  videojs.registerComponent('CustomBar', CustomBar);
}

/**
 * 录制器所需的参数
 * @since  x.x.x
 * @member   {Ref<VideoJsPlayer>}        player
 * @member   {HTMLCanvasElement | null}  canvas
 * @member   {RecordRTC | null}          recorder
 * @member   {number | null}             animationFrame
 * @member   {boolean}                   isRecording
 * @memberof RecorderParams
 */
export class RecorderParams {
  player;

  canvas;

  recorder;

  animationFrame;

  isRecording;

  constructor(
    player: Ref<VideoJsPlayer>,
    canvas: HTMLCanvasElement | null,
    recorder: RecordRTC | null,
    animationFrame: number | null,
    isRecording: boolean
  ) {
    this.player = player;
    this.canvas = canvas;
    this.recorder = recorder;
    this.animationFrame = animationFrame;
    this.isRecording = isRecording;
  }
}

/**
 * 录像控制函数，接受录像DOM和录像参数。负责按需修改recordDom的内容与开始和结束录屏。
 *@param    {HTMLDivElement} recordDom 录像DOM
 *@param    {RecorderParams} recorderParams
 *@returns  void
 *@date     2023-01-12
 *@author   RuntimeErroz<dariuszeng@qq.com>
 * */
export function recordHandle(
  recordDom: HTMLDivElement,
  recorderParams: RecorderParams,
  isPixelated: boolean,
  isInverted: boolean
) {
  if (!recorderParams.isRecording) {
    // 开始录屏后修改DOM，创建Canvas
    recordDom.innerHTML = '<i class="record-process"></i><span class="ml10">结束</span>';
    if (!recorderParams.canvas) {
      recorderParams.canvas = document.createElement('canvas');
    }
    recorderParams.recorder = new RecordRTC(recorderParams.canvas, {
      type: 'canvas',
      mimeType: 'video/mp4'
    });
    recorderParams.recorder.startRecording();
    drawMedia(recorderParams, isInverted, isPixelated);
  } else {
    // 结束录屏后修改DOM并复原参数
    recordDom.innerHTML = `<img src="${monitorImg}" class="snapshot-img" /><span class="ml10">录像</span>`;
    recorderParams.recorder?.stopRecording(() => {
      const url = window.URL.createObjectURL(<Blob>recorderParams.recorder?.getBlob());
      downloadFile(url, 'mp4');
      cancelAnimationFrame(<number>recorderParams.animationFrame);
      recorderParams.canvas = null;
      recorderParams.animationFrame = null;
    });
  }
  recorderParams.isRecording = !recorderParams.isRecording;
}

/**
 * 截屏控制函数，接受VideoJSPlayer实例与分别表征是否马赛克与是否反转的两个布尔变量。实现了多场景截图的功能。
 *@param    {Ref<VideoJsPlayer>} playerInstance 录像DOM
 *@param    {boolean}            isPixelated    是否马赛克
 *@param    {boolean}            isInverted     是否反转
 *@returns  void
 *@date     2023-01-12
 *@author   RuntimeErroz<dariuszeng@qq.com>
 * */
export function screenshotHandle(
  playerInstance: Ref<VideoJsPlayer>,
  isPixelated: boolean,
  isInverted: boolean
) {
  let video;
  if (isInverted && !isPixelated) video = <HTMLCanvasElement>document.getElementById('invert');
  else if (isPixelated && !isInverted)
    video = <HTMLCanvasElement>document.getElementById('pixelate');
  else video = <HTMLVideoElement>playerInstance.value?.el().querySelector('video');
  downloadFromCanvasorVideo(video);
}

/**
 * 下载文件函数，接受一个blobUrl和fileType，完成下载功能。
 *@param    {string}   blobUrl    blobURL
 *@param    {string}   fileType   文件类型
 *@returns  void
 *@date     2023-01-12
 *@author   RuntimeErroz<dariuszeng@qq.com>
 * */
function downloadFile(blobUrl: string, fileType: string) {
  const temp = document.createElement('a');
  temp.style.display = 'none';
  temp.href = blobUrl;
  temp.download = `${new Date().getTime()}.${fileType}`;
  temp.click();
}

/**
 * 下载图片函数，接受一个HTMLCanvasElement或HTMLVideoElement，创建Blob并调用下载功能
 *@param    {HTMLCanvasElement | HTMLVideoElement} src 录像DOM
 *@returns  void
 *@date     2023-01-12
 *@author   RuntimeErroz<dariuszeng@qq.com>
 * */
function downloadFromCanvasorVideo(src: HTMLCanvasElement | HTMLVideoElement) {
  const fileType = 'png';
  const canvas = document.createElement('canvas');
  canvas.width = src instanceof HTMLCanvasElement ? src.width : src.videoWidth;
  canvas.height = src instanceof HTMLCanvasElement ? src.height : src.videoHeight;
  canvas.getContext('2d')?.drawImage(src, 0, 0, canvas.width, canvas.height);
  canvas.toBlob((blob) => {
    downloadFile(URL.createObjectURL(<Blob>blob), fileType);
  }, `image/${fileType}`);
}

/**
 * 截屏控制函数，接受VideoJSPlayer实例与分别表征是否马赛克与是否反转的两个布尔变量。实现了多场景截图的功能。
 *@param    {Ref<VideoJsPlayer>} playerInstance 录像DOM
 *@param    {boolean}            isPixelated    是否马赛克
 *@param    {boolean}            isInverted     是否反转
 *@returns  void
 *@date     2023-01-12
 *@author   RuntimeErroz<dariuszeng@qq.com>
 * */
function drawMedia(recorderParams: RecorderParams, isInverted: boolean, isPixelated: boolean) {
  const ctx = recorderParams.canvas?.getContext('2d');
  let video!: HTMLCanvasElement | HTMLVideoElement;
  if (isInverted && !isPixelated) {
    video = <HTMLCanvasElement>document.getElementById('invert');
    recorderParams.canvas?.setAttribute('width', video.width.toString());
    recorderParams.canvas?.setAttribute('height', video.height.toString());
  } else if (isPixelated && !isInverted) {
    video = <HTMLCanvasElement>document.getElementById('pixelate');
    recorderParams.canvas?.setAttribute('width', video.width.toString());
    recorderParams.canvas?.setAttribute('height', video.height.toString());
  } else {
    video = <HTMLVideoElement>recorderParams.player.value?.el().querySelector('video');
    if (!video || !ctx) throw Error('video Error');
    recorderParams.canvas?.setAttribute('width', video.videoWidth.toString());
    recorderParams.canvas?.setAttribute('height', video.videoHeight.toString());
  }

  ctx?.drawImage(
    video,
    0,
    0,
    <number>recorderParams.canvas?.width,
    <number>recorderParams.canvas?.height
  );
  recorderParams.animationFrame = requestAnimationFrame(() =>
    drawMedia(recorderParams, isInverted, isPixelated)
  );
}
