export interface pixelatePositions {
    leftX: number;
    leftY: number;
    rightX: number;
    rightY: number;
}

export default function addPixelate(el: Element | undefined, positions: pixelatePositions) {
    if (!el)
        throw new Error("el is null")
    const canvas = <HTMLCanvasElement>document.getElementById("pixelate")

    const vid = <HTMLVideoElement>el.querySelector('video')
    const height = parseFloat(getComputedStyle(el).height.slice(0, -2));
    const width = height * vid.videoWidth / vid.videoHeight
    const pixelateWidth = (positions.rightX - positions.leftX) * width / 100
    const pixelateHeight = (positions.rightY - positions.leftY) * height / 100
    console.log(width, height, pixelateWidth, pixelateHeight)
    canvas.width = pixelateWidth
    canvas.height = pixelateHeight
    const ctx = canvas.getContext('2d')
    ctx?.scale(window.devicePixelRatio, window.devicePixelRatio)
    if (!ctx)
        throw new Error("ctx is null")
    setInterval(() => {
        const sx = width * positions.leftX / 100
        const sy = height * (1 - (positions.rightY) / 100)
        ctx.drawImage(vid, sx, sy, pixelateWidth, pixelateHeight, 0, 0, pixelateWidth, pixelateHeight)
        let srcData = <ImageData>ctx.getImageData(0, 0, width, height)
        const destData = <ImageData>pixelate(srcData, 10, 10)
        ctx.putImageData(srcData, 0, 0)
    }, 20)
}

function pixelate(srcImageData: ImageData, mosaicWidth: number, mosaicHeight: number) {
    let srcData = srcImageData.data,
        imgWidth = srcImageData.width,
        imgHeight = srcImageData.height,
        imageData = createImageData(imgWidth, imgHeight),
        data = imageData?.data,
        x, w, y, h, r, g, b, pixelIndex, i, j, pixelCount;

    // モザイクサイズが m×n の場合、m×n毎に処理する
    for (x = 0; x < imgWidth; x += mosaicWidth) {
        if (mosaicWidth <= imgWidth - x) { w = mosaicWidth; }
        else { w = imgWidth - x; }

        for (y = 0; y < imgHeight; y += mosaicHeight) {
            if (mosaicHeight <= imgHeight - y) { h = mosaicHeight; }
            else { h = imgHeight - y; }

            // モザイクの色を計算する
            r = g = b = 0;
            for (i = 0; i < w; i += 1) {
                for (j = 0; j < h; j += 1) {
                    pixelIndex = ((y + j) * imgWidth + (x + i)) * 4; // ピクセルのインデックスを取得
                    r += srcData[pixelIndex];
                    g += srcData[pixelIndex + 1];
                    b += srcData[pixelIndex + 2];
                }
            }

            // 平均を取る
            pixelCount = w * h; // モザイクのピクセル数            
            r = Math.round(r / pixelCount);
            g = Math.round(g / pixelCount);
            b = Math.round(b / pixelCount);

            // モザイクをかける        
            if (data)
                for (i = 0; i < w; i += 1) {
                    for (j = 0; j < h; j += 1) {
                        pixelIndex = ((y + j) * imgWidth + (x + i)) * 4; // ピクセルのインデックスを取得
                        data[pixelIndex] = r;
                        data[pixelIndex + 1] = g;
                        data[pixelIndex + 2] = b;
                        data[pixelIndex + 3] = srcData[pixelIndex + 3]; // アルファ値はそのままコピー
                    }
                }
        }
    }
    return imageData;
}
function createImageData(width: number, height: number) {
    let canvas = document.createElement('canvas')
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    let imageData = ctx?.createImageData(width, height);
    return imageData;
}