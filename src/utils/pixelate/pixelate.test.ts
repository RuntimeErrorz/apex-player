import { test, expect } from 'vitest'

//Node.js不存在此类，特此补充。
class ImgData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(data: Uint8ClampedArray, width: number, height: number) {
        this.data = data
        this.height = height
        this.width = width
    }
}

//详情参考原函数，此处为了测试方便作了些许简化。
function pixelate(
    srcImageData: ImgData,
    pixelationWidth: number,
    pixelationHeight: number
): ImgData {
    const srcData = srcImageData.data,
        imgWidth = srcImageData.width,
        imgHeight = srcImageData.height,
        imageData = new ImgData(new Uint8ClampedArray(4), 2, 2),
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


const srcData = new ImgData(new Uint8ClampedArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 8, 9, 10, 11, 12, 13, 14, 15, 16]), 4, 4)
const destData = new ImgData(new Uint8ClampedArray([9, 7, 8, 4]), 2, 2)//此为手动计算

console.log(pixelate(<ImageData>srcData, 2, 2).data)

test('Pixelate', () => {
    expect(pixelate(<ImageData>srcData, 2, 2).data).toStrictEqual(destData.data)
})