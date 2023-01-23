/**
 * 此模块定义与导出了包含是否打码中以及动画ID的全局状态的Store。
 * @module /store/videoState
 * @date   2023-01-23
 * @author RuntimeErroz <dariuszeng@qq.com>
 */

import {ref} from 'vue';
import {defineStore} from 'pinia';

export const useVideoStore = defineStore('video', () => {
  const isPixelated = ref(false);
  const animationID = ref(0);
  return {isPixelated, animationID};
});
