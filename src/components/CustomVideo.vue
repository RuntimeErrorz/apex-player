<script setup lang="ts">
/**
 * 此SFC实现了播放器的所有要求功能。
 * @module /components/CustomVideo
 * @date   2023-01-12
 * @author RuntimeErroz <dariuszeng@qq.com>
 */
import videojs, {type VideoJsPlayer} from 'video.js';
import 'videojs-flvjs-es6';
import {onMounted, onUnmounted, ref, watch, nextTick} from 'vue';
import type {Ref} from 'vue';
import {storeToRefs} from 'pinia';

import addQuality from '@/utils/quality/qualitySwitching.js';
import customiseSidebar, {
  RecorderParams,
  screenshotHandle,
  recordHandle
} from '@/utils/snapshot/snapshot.js';
import invertColor from '@/utils/invert/invert.js';
import pixelation from '@/utils/pixelate/pixelate.js';
import type {PixelatePosition} from '@/utils/pixelate/pixelate.js';
import {useVideoStore} from '@/store/videoState.js';

export interface Src {
  src: string;
  type: string;
  label: string;
}

const {isPixelated, animationID} = storeToRefs(useVideoStore());
const isInverted = ref(false);
const fullscreen = ref(false);
const dialog = ref(false);
const snackbar = ref(false);
const pixelatePosition: Ref<PixelatePosition> = ref({
  // 打码的位置
  leftX: 0,
  leftY: 0,
  rightX: 50,
  rightY: 50
});
const props = defineProps<{
  // 父组件传来的用于初始化video的值
  srcs: Array<Src>;
  options: object;
}>();
const playerID = ref('video1');
const playerInstance: Ref<VideoJsPlayer | undefined> = ref(); // 播放器实例
const emit = defineEmits(['resetSource']); // 子组件emit重设源
let originalPosition: Ref<PixelatePosition>; // 临时变量用于储存原打码位置

watch(fullscreen, (newValue) => {
  if (isPixelated.value && newValue) isPixelated.value = false;
});

watch(isInverted, (newValue) => {
  if (newValue) {
    if (fullscreen.value) {
      playerInstance.value?.exitFullscreen();
    }
    nextTick(() => invertColor(<VideoJsPlayer>playerInstance.value));
  }
});
watch(isPixelated, (newValue) => {
  // 监视打码移动control bar到下方
  const controlBar = document.getElementsByClassName('vjs-control-bar')[0];
  if (!playerInstance.value) throw new Error();
  if (newValue) {
    nextTick(() => pixelation(<VideoJsPlayer>playerInstance.value, pixelatePosition.value));
    snackbar.value = true;
    controlBar.setAttribute(
      'style',
      `position: relative;top: ${
        playerInstance.value.currentHeight() + 7
      }px; background-color:black!important`
    );
  } else {
    controlBar.setAttribute('style', '');
  }
});
watch(props, () => {
  // 当源变化时，更新源
  if (isPixelated.value) {
    isPixelated.value = false;
  }
  nextTick(() => (playerInstance.value as any)?.updateSrc(props.srcs)); // 主要是插件问题，没时间重写类型声明
});

/**
 * 初始化播放器实例的回调函数。添加反色、打码、按钮。并监听全屏事件
 * @returns  {void}
 */
const initPlayer = (): void => {
  const invertButton = <videojs.Component>playerInstance.value?.controlBar.addChild('button');
  invertButton.addClass('vjs-custom-bt');
  invertButton.el().innerHTML = '反色';
  invertButton.el().addEventListener('click', () => {
    isInverted.value = !isInverted.value;
  });

  const pixelateButton = <videojs.Component>playerInstance.value?.controlBar.addChild('button');
  pixelateButton.addClass('vjs-custom-bt');
  pixelateButton.el().innerHTML = '打码';
  pixelateButton.el().addEventListener('click', () => {
    if (fullscreen.value) playerInstance.value?.exitFullscreen();
    originalPosition = JSON.parse(JSON.stringify(pixelatePosition.value));
    dialog.value = true;
  });

  const resetSourceButton = document.getElementsByClassName('vjs-custom-bar')[0].lastElementChild;
  resetSourceButton?.addEventListener('click', () => {
    emit('resetSource');
  });

  playerInstance.value?.on('fullscreenchange', () => {
    fullscreen.value = !fullscreen.value;
  });
};
/**
 * 重绘马赛克
 * @returns  {void}
 */
const redraw = (): void => {
  if (isPixelated.value) pixelation(<VideoJsPlayer>playerInstance.value, pixelatePosition.value);
};

onMounted(() => {
  // 添加质量插件，添加截图与录像，监听resize
  addQuality();
  customiseSidebar();
  playerInstance.value = videojs(playerID.value, props.options, initPlayer);
  const [screenshotDom, recordDom] = document
    .getElementsByClassName('vjs-custom-bar')[0]
    .querySelectorAll('div');
  screenshotDom.onclick = () =>
    screenshotHandle(<Ref<VideoJsPlayer>>playerInstance, isPixelated.value, isInverted.value);
  const recorderParam = new RecorderParams(
    <Ref<VideoJsPlayer>>playerInstance,
    null,
    null,
    null,
    false
  );
  recordDom.onclick = () =>
    recordHandle(recordDom, recorderParam, isPixelated.value, isInverted.value);

  window.onresize = () => {
    if (isPixelated.value) {
      pixelation(<VideoJsPlayer>playerInstance.value, pixelatePosition.value);
      const controlBar = document.getElementsByClassName('vjs-control-bar')[0];
      if (playerInstance.value) {
        {
          controlBar.setAttribute(
            'style',
            `position: relative;top: ${
              playerInstance.value.currentHeight() + 7
            }px; background-color:black!important`
          );
        } // 加防抖
      }
    }
  };
});
onUnmounted(() => {
  if (playerInstance.value) {
    playerInstance.value.dispose();
  }
});
</script>
<template>
  <canvas v-if="isPixelated" id="pixelate" style="position: absolute"></canvas>
  <v-snackbar v-model="snackbar" timeout="3000">
    您可以通过鼠标来涂抹马赛克。
    <template v-slot:actions>
      <v-btn color="blue" variant="text" @click="snackbar = false"> Close </v-btn>
    </template>
  </v-snackbar>
  <div class="container" id="container">
    <video id="video1" class="video-js custom-video"></video>
    <Transition @enter="redraw" @after-leave="redraw" name="slide-fade">
      <canvas v-if="isInverted" id="invert" class="invert"></canvas>
    </Transition>
  </div>
  <v-dialog z-index="3" v-model="dialog" persistent width="60vw">
    <v-card>
      <v-card-title style="margin-left: 10px; margin-top: 1vh">
        <span class="text-h6"
          >选择马赛克区域（左下为原点），<strong style="color: #ef5350"
            >马赛克区域可以直接涂抹选择</strong
          ></span
        >
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="6">
              <v-slider
                label="区域左下X坐标百分比"
                v-model="pixelatePosition.leftX"
                class="align-center"
                max="100"
                :min="0"
                hide-details
              >
                <template v-slot:append>
                  <v-text-field
                    v-model="pixelatePosition.leftX"
                    hide-details
                    single-line
                    density="compact"
                    type="number"
                    style="width: 100px"
                  ></v-text-field>
                </template>
              </v-slider>
            </v-col>
            <v-col cols="6">
              <v-slider
                label="区域右上X坐标百分比"
                v-model="pixelatePosition.rightX"
                class="align-center"
                max="100"
                :min="0"
                hide-details
              >
                <template v-slot:append>
                  <v-text-field
                    v-model="pixelatePosition.rightX"
                    hide-details
                    single-line
                    density="compact"
                    type="number"
                    style="width: 100px"
                  ></v-text-field>
                </template>
              </v-slider>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-slider
                label="区域左下Y坐标百分比"
                v-model="pixelatePosition.leftY"
                class="align-center"
                max="100"
                :min="0"
                hide-details
              >
                <template v-slot:append>
                  <v-text-field
                    v-model="pixelatePosition.leftY"
                    hide-details
                    single-line
                    density="compact"
                    type="number"
                    style="width: 100px"
                  ></v-text-field>
                </template>
              </v-slider>
            </v-col>
            <v-col cols="6">
              <v-slider
                label="区域右上Y坐标百分比"
                v-model="pixelatePosition.rightY"
                class="align-center"
                max="100"
                :min="0"
                hide-details
              >
                <template v-slot:append>
                  <v-text-field
                    v-model="pixelatePosition.rightY"
                    hide-details
                    single-line
                    density="compact"
                    type="number"
                    style="width: 100px"
                  ></v-text-field>
                </template>
              </v-slider>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-divider></v-divider>
      <span class="font-weight-thin" style="margin-left: 26px; margin-top: 20px; font-size: 1.1rem">
        初始默认值为左下X、Y坐标百分比为0；右上X、Y坐标百分比为50，即对左下四分之一部分打码。
      </span>
      <v-card-actions style="margin-bottom: 5px; margin-top: 3vh">
        <v-spacer></v-spacer>
        <v-btn
          variant="tonal"
          @click="
            () => {
              dialog = false;
              pixelatePosition = originalPosition;
            }
          "
        >
          取消
        </v-btn>
        <v-btn
          variant="tonal"
          color="blue-darken-1"
          @click="
            () => {
              dialog = false;
              isPixelated = false;
              nextTick(() => (isPixelated = true));
            }
          "
        >
          保存
        </v-btn>
        <v-btn
          v-show="isPixelated"
          color="red darken-1"
          variant="tonal"
          @click="
            () => {
              isPixelated = false;
              dialog = false;
            }
          "
        >
          关闭马赛克
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<style lang="less">
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;

  .custom-video {
    margin: 0 2vw;
    flex: 1;
    height: 80vh;
  }

  .invert {
    width: 46vw;
    margin: 0 2vw;
  }
}

.slide-fade-enter-from {
  transform: translateX(5vw);
  opacity: 1;
}

.slide-fade-enter-active {
  transition: all 0.1s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.1s ease-out;
}

.slide-fade-leave-to {
  transform: translateX(5vw);
  opacity: 0;
}
</style>
