import { test, expect, expectTypeOf } from 'vitest';
import invertColor from './invert.js';
import type { VideoJsPlayer } from 'video.js';
import { vidDataInvert } from './invert.js';

class ImgData {
    data: Uint8ClampedArray;
    constructor(data: Uint8ClampedArray) {
        this.data = data;
    }
}

test('invert color works perfectly', () => {
    expectTypeOf(invertColor).toBeFunction();
    expectTypeOf(invertColor).parameter(0).toMatchTypeOf<VideoJsPlayer>(); //之前使用

    const arr = new Uint8ClampedArray(4000);
    for (let i = 0; i < arr.length; i += 4) {
        arr[i + 0] = 0; // R value
        arr[i + 1] = 190; // G value
        arr[i + 2] = 0; // B value
        arr[i + 3] = 255; // A value
    }

    const invertedArray = new Uint8ClampedArray(4000);
    for (let i = 0; i < invertedArray.length; i += 4) {
        invertedArray[i + 0] = 255 - 0; // R value
        invertedArray[i + 1] = 255 - 190; // G value
        invertedArray[i + 2] = 255 - 0; // B value
        invertedArray[i + 3] = 255; // A value
    }

    expect(vidDataInvert(<ImageData>new ImgData(arr))).toStrictEqual(
        new ImgData(invertedArray)
    );
});
