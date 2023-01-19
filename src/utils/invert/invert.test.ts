/**
 * 反转颜色测试模块。
 * @module utils/invert.test
 * @date   2023-01-12
 * @author RuntimeErroz <dariuszeng@qq.com>
 */
import {test, expect, expectTypeOf} from 'vitest';
import type {VideoJsPlayer} from 'video.js';
import invertColor, {vidDataInvert} from './invert.js';
/** 在Node环境中代替ImageData的自定义类。*/
class ImgData {
  data: Uint8ClampedArray;
  /**
   * 根据data创建一个ImgData类。
   * @param {Uint8ClampedArray} data - 颜色与透明度数据。
   */
  constructor(data: Uint8ClampedArray) {
    this.data = data;
  }
}

/** 测试反色功能是否按预期工作。*/
test('invert color works perfectly', () => {
  expectTypeOf(invertColor).toBeFunction();
  expectTypeOf(invertColor).parameter(0).toMatchTypeOf<VideoJsPlayer>(); // 之前使用

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

  expect(vidDataInvert(<ImageData>new ImgData(arr))).toStrictEqual(new ImgData(invertedArray));
});
