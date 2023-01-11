import type { VideoJsPlayer } from "video.js";

export interface pixelatePositions {
    leftX: number;
    leftY: number;
    rightX: number;
    rightY: number;
}

export default function addPixelate(player: VideoJsPlayer | undefined, positions: pixelatePositions) {
    if (!player)
        throw new Error("Pixelate is null")

    const canvas = <HTMLCanvasElement>document.getElementById("pixelate")
    const vid = <HTMLVideoElement>player.el().querySelector('video')

    let height: number
    let width: number
    let ratio: number
    const originRatio = vid.videoWidth / vid.videoHeight
    let currentRatio = player.currentWidth() / player.currentHeight()
    let top = vid.offsetTop + vid.offsetParent?.offsetTop
    let left = vid.offsetLeft + vid.offsetParent?.offsetLeft


    if (currentRatio > originRatio) {
        height = player.currentHeight()
        width = height * vid.videoWidth / vid.videoHeight
        ratio = height / vid.videoHeight
        left += (player.currentWidth() - width) / 2
        canvas.setAttribute("style", `position: absolute; top:${top}px; left:${left}px;z-index: 1000;`)
    }
    else {
        width = player.currentWidth()
        height = width * vid.videoHeight / vid.videoWidth
        ratio = width / vid.videoWidth
        top += (player.currentHeight() - height) / 2
        canvas.setAttribute("style", `position: absolute; top:${top}px; left:${left}px;z-index: 1000;`)
    }
    console.log(width, height, currentRatio, originRatio)
    let ctx = canvas.getContext('2d')
    if (!ctx)
        throw new Error()
    let sourceLayer = document.createElement("canvas")
    let pixelateLayer = document.createElement("canvas")
    let pathLayer = document.createElement("canvas")
    let sourceContext = sourceLayer.getContext("2d", { willReadFrequently: true })
    let pixelateContext = pixelateLayer.getContext("2d")
    let pathContext = pathLayer.getContext("2d")

    canvas.width = sourceLayer.width = pixelateLayer.width = pathLayer.width = width;
    canvas.height = sourceLayer.height = pixelateLayer.height = pathLayer.height = height;

    if (!pathContext)
        throw new Error("")
    pathContext.lineCap = "round"
    pathContext.lineJoin = "round"
    pathContext.lineWidth = 20

    const x = width * positions.leftX / 100
    const y = height * (100 - positions.rightY) / 100
    const w = (positions.rightX - positions.leftX) / 100 * width
    const h = (positions.rightY - positions.leftY) / 100 * height
    pathContext.fillRect(x / ratio, y / ratio, w / ratio, h / ratio)

    canvas.addEventListener("mousedown", mouseHandle)
    function mouseHandle(e: MouseEvent) {
        if (e.type === "mousedown") {
            pathContext?.moveTo(e.offsetX / ratio, e.offsetY / ratio);
            canvas.addEventListener("mousemove", mouseHandle)
            canvas.addEventListener("mouseup", mouseHandle)
        } else if (e.type === "mousemove") {
            pathContext?.lineTo(e.offsetX / ratio, e.offsetY / ratio);
        } else if (e.type === "mouseup") {
            canvas.removeEventListener("mousemove", mouseHandle)
            canvas.removeEventListener("mouseup", mouseHandle)
        }
        pathContext?.stroke()
    }
    canvas.onclick = () => {
        if (vid.paused) {
            vid.play();
        }
        else {
            vid.pause();
        }
    }
    ctx.scale(ratio, ratio)
    function draw() {
        sourceContext?.drawImage(vid, 0, 0)
        let sourceImgData = sourceContext?.getImageData(0, 0, width, height)
        if (!ctx)
            throw new Error("")
        pixelateContext?.putImageData(<ImageData>pixelate(<ImageData>sourceImgData, 20, 20), 0, 0)

        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(pathLayer, 0, 0, width, height)
        ctx.globalCompositeOperation = "source-in"; //马赛克层
        ctx.drawImage(pixelateLayer, 0, 0, width, height)
        ctx.globalCompositeOperation = "destination-over";
        ctx.drawImage(sourceLayer, 0, 0, width, height)
        requestAnimationFrame(draw)
    }
    requestAnimationFrame(draw)
}

function createImageData(width: number, height: number) {
    let canvas = document.createElement('canvas')
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    let imageData = ctx?.createImageData(width, height);
    return imageData;
}


function pixelate(srcImageData: ImageData, mosaicWidth: number, mosaicHeight: number) {
    let srcData = srcImageData.data,
        imgWidth = srcImageData.width,
        imgHeight = srcImageData.height,
        imageData = createImageData(imgWidth, imgHeight),
        data = imageData?.data, w, h, r, g, b, pixelIndex, pixelCount;

    for (let x = 0; x < imgWidth; x += mosaicWidth) {
        if (mosaicWidth <= imgWidth - x) { w = mosaicWidth; }
        else { w = imgWidth - x; }

        for (let y = 0; y < imgHeight; y += mosaicHeight) {
            if (mosaicHeight <= imgHeight - y) { h = mosaicHeight; }
            else { h = imgHeight - y; }

            r = g = b = 0;
            for (let i = 0; i < w; i += 1) {
                for (let j = 0; j < h; j += 1) {
                    pixelIndex = ((y + j) * imgWidth + (x + i)) * 4;
                    r += srcData[pixelIndex];
                    g += srcData[pixelIndex + 1];
                    b += srcData[pixelIndex + 2];
                }
            }

            pixelCount = w * h; // モザイクのピクセル数            
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
