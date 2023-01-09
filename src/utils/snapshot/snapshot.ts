import cameraImg from "@/assets/images/camera.png"
import monitorImg from "@/assets/images/monitor.png"
import RecordRTC from 'recordrtc';

import videojs from "video.js";
import type { VideoJsPlayer } from "video.js";
import type { Ref } from "vue"

export class RecorderParams {
  player; canvas; recorder; animationFrame; isRecording;
  constructor(player: Ref<VideoJsPlayer>, canvas: HTMLCanvasElement | null, recorder: RecordRTC | null, animationFrame: number | null, isRecording: boolean) {
    this.player = player;
    this.canvas = canvas;
    this.recorder = recorder;
    this.animationFrame = animationFrame;
    this.isRecording = isRecording;
  }
}

function downloadFile(blob: string, fileType: string) {
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = blob;
  const time = new Date().getTime();
  a.download = `${time}.${fileType}`;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blob);
  }, 1000);
}

function downloadViaCanvas(canvas: HTMLCanvasElement, src: HTMLCanvasElement | HTMLVideoElement) {
  const fileType = "png";
  canvas
    .getContext("2d")?.drawImage(src, 0, 0, canvas.width, canvas.height); // 图片大小和视频分辨率一致
  const strDataURL = canvas.toDataURL("image/" + fileType); // canvas中video中取一帧图片并转成dataURL
  let arr = strDataURL.split(",")
  let mimeArrar = arr[0].match(/:(.*?);/)
  if (!mimeArrar)
    throw new Error('undefined');
  let mime = mimeArrar[1]
  let bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const blob = new Blob([u8arr], {
    type: mime,
  });
  const url = window.URL.createObjectURL(blob);
  downloadFile(url, "png");
}

export function screenshotHandle(playerInstance: Ref<VideoJsPlayer | undefined>, isPixelated: boolean, isInverted: boolean) {
  const canvas = document.createElement("canvas");
  let video
  if (isInverted && isPixelated) {
    video = <HTMLCanvasElement>document.getElementById("invert")
    if (!video)
      throw new Error('undefined');
    canvas.width = video.width;
    canvas.height = video.height;
    downloadViaCanvas(canvas, video)
    video = <HTMLCanvasElement>document.getElementById("pixelate")
    canvas.width = video.width;
    canvas.height = video.height;
    downloadViaCanvas(canvas, video)
    return;
  }
  if (isInverted) {
    video = <HTMLCanvasElement>document.getElementById("invert")
    if (!video)
      throw new Error('undefined');
    canvas.width = video.width;
    canvas.height = video.height;
  }
  else if (isPixelated) {
    video = <HTMLCanvasElement>document.getElementById("pixelate")
    if (!video)
      throw new Error('undefined');
    canvas.width = video.width;
    canvas.height = video.height;
  }
  else {
    video = playerInstance.value?.el().querySelector('video')
    if (!video)
      throw new Error('undefined');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
  downloadViaCanvas(canvas, video)
}

function drawMedia(params: RecorderParams) {
  const ctx = params.canvas?.getContext("2d")
  const video = params.player.value?.el().querySelector('video')
  if (!video || !ctx)
    throw Error("video Error")
  params.canvas?.setAttribute("width", video.videoWidth.toString());
  params.canvas?.setAttribute("height", video.videoHeight.toString());
  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  params.animationFrame = requestAnimationFrame(() => drawMedia(params));
}

export function recordHandle(recordDom: HTMLDivElement, params: RecorderParams, isPixelated: boolean, isInverted: boolean) {
  if (!params.isRecording) {
    recordDom.innerHTML = `<i class="record-process"></i><span class="ml10">结束</span>`
    if (!params.canvas) {
      params.canvas = document.createElement("canvas");
    }
    params.recorder = new RecordRTC(params.canvas, {
      type: "canvas",
      mimeType: "video/mp4",
    });
    params.recorder.startRecording();
    drawMedia(params);
  }
  else {
    recordDom.innerHTML = `<img src="${monitorImg}" class="snapshot-img" /><span class="ml10">录像</span>`
    params.recorder?.stopRecording(() => {
      const url = window.URL.createObjectURL(<Blob>params.recorder?.getBlob());
      downloadFile(url, "mp4");
      if (!params.animationFrame)
        throw Error("erro")
      cancelAnimationFrame(params.animationFrame);
      params.canvas = null;
      params.animationFrame = null;
    });
  }
  params.isRecording = !params.isRecording
}

export default function addSnapshot() {
  let Component = videojs.getComponent("Component");
  // The videojs.extend function can be used instead of ES6 classes.
  let CustomBar = videojs.extend(Component, {
    createEl: function () {
      // <img src="${cameraImg}" style="width:13px" />
      // <i class="el-icon-camera-solid"></i>
      // <i class="el-icon-video-camera-solid"></i>
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
      })
      divDom.setAttribute('style', 'z-index:1001')
      return divDom
    },
  })
  videojs.registerComponent('CustomBar', CustomBar);
}

