
export default function invertColor(el: Element | undefined) {
    if (typeof el === 'undefined')
        throw new Error('bar is undefined');
    let canv = <HTMLCanvasElement>document.getElementById("invert")
    let cxt = <CanvasRenderingContext2D>canv.getContext('2d')
    const vid = <HTMLVideoElement>el.querySelector('video')

    const width = parseFloat(getComputedStyle(el).width.slice(0, -2));
    const height = parseFloat(getComputedStyle(el).height.slice(0, -2));
    canv.width = width;
    canv.height = height;

    let intervalID = setInterval(() => {
        effectInvert();
    }, 20);

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
    }
    vid.addEventListener('play', function () { let x = setInterval(function () { effectInvert() }, 20); }, false);
    vid.addEventListener('pause', function () { clearInterval(intervalID); }, false);
    vid.addEventListener('ended', function () { clearInterval(intervalID); }, false);
    canv.addEventListener('click', function () {
        if (vid.paused) {
            vid.play();
        }
        else {
            vid.pause();
        }
    });
}