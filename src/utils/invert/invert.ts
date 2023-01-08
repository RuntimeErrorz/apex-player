import type { VideoJsPlayer } from "video.js"
export default function invertColor(player: VideoJsPlayer) {
    let canv = <HTMLCanvasElement>document.getElementById("invert")
    let cxt = <CanvasRenderingContext2D>canv.getContext('2d', { willReadFrequently: true })

    const vid = <HTMLVideoElement>player.el().querySelector('video')
    canv.width = vid.videoWidth;
    canv.height = vid.videoHeight;
    function effectInvert() {
        cxt.drawImage(vid, 0, 0, canv.width, canv.height);
        let vidData = cxt.getImageData(0, 0, canv.width, canv.height);

        for (let z = 0; z < vidData.data.length; z += 4) {
            vidData.data[z] = 255 - vidData.data[z];
            vidData.data[z + 1] = 255 - vidData.data[z + 1];
            vidData.data[z + 2] = 255 - vidData.data[z + 2];
            vidData.data[z + 3] = 255;
        }
        cxt.putImageData(vidData, 0, 0);
        requestAnimationFrame(effectInvert)
    }
    requestAnimationFrame(effectInvert)

    canv.addEventListener('click', function () {
        if (vid.paused) {
            vid.play();
        }
        else {
            vid.pause();
        }
    });
}