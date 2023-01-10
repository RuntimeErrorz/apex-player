<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from "vue"
import type { Ref } from "vue"
import videojs, { type VideoJsPlayer } from "video.js"
import addQuality from "@/utils/quality/qualityPlugin.js"
import addSnapshot from "@/utils/snapshot/snapshot.js"
import { RecorderParams, screenshotHandle, recordHandle } from "@/utils/snapshot/snapshot.js"
import invertColor from "@/utils/invert/invert.js"
import addPixelate from "@/utils/pixelate/pixelate.js"
import type { pixelatePositions } from "@/utils/pixelate/pixelate.js"

import "@/assets/css/quality.css"
import "@/assets/css/snapshot.css"
import "@/assets/css/skin.css"
import "@/assets/css/video.css"

let isPixelated = ref(false)
let isInverted = ref(false)
let fullscreen = ref(false)
let pixelateDialogVisible = ref(false)
let snackbar = ref(false)

watch(isInverted, () => {
    if (isPixelated.value) {
        nextTick(() => {
            addPixelate(playerInstance.value, pixelatePosition.value) //nextTick无用？
        })
    }
})

watch(isPixelated, (newValue) => {
    const controlBar = document.getElementsByClassName("vjs-control-bar")[0]
    if (!playerInstance.value)
        throw new Error()
    if (newValue) {
        snackbar.value = true
        controlBar.setAttribute('style', `position: relative;top: ${playerInstance.value.currentHeight() + 7}px; background-color:black!important`)
    }
    else {
        controlBar.setAttribute('style', '')
    }
})

let pixelatePosition: Ref<pixelatePositions> = ref({
    leftX: 0,
    leftY: 0,
    rightX: 50,
    rightY: 50
})

let originalPosition: Ref<pixelatePositions>

const props = defineProps<{
    srcs: Array<Object>,
    options: Object
}>()

const playerID = ref('video1')
const playerInstance: Ref<VideoJsPlayer | undefined> = ref()

function initPlayer() {
    let invertButton = <videojs.Component>playerInstance.value?.controlBar.addChild("button");
    invertButton.addClass("vjs-invert-bt")
    invertButton.el().innerHTML = "反色"
    invertButton.el().addEventListener("click", invert)

    let pixelateButton = <videojs.Component>playerInstance.value?.controlBar.addChild("button");
    pixelateButton.addClass("vjs-pixelate-bt")
    pixelateButton.el().innerHTML = "打码"
    pixelateButton.el().addEventListener("click", () => {
        if (fullscreen.value)
            playerInstance.value?.exitFullscreen();
        originalPosition = JSON.parse(JSON.stringify(pixelatePosition.value))
        pixelateDialogVisible.value = true
    }
    )

    playerInstance.value?.updateSrc(props.srcs)
    playerInstance.value?.on('resolutionchange', function () {
        console.info('Source changed to %s', playerInstance.value?.src())
    })
    playerInstance.value?.on('fullscreenchange', () => {
        fullscreen.value = !fullscreen.value
        if (isPixelated.value)
            isPixelated.value = !isPixelated.value
    })
}

function invert() {
    if (!isInverted.value) {
        if (fullscreen.value) {
            playerInstance.value?.exitFullscreen();
        }
        invertColor(<VideoJsPlayer>playerInstance.value)
        isInverted.value = !isInverted.value;
    }
    else {
        isInverted.value = !isInverted.value;
    }
}

onMounted(() => {
    addQuality();
    addSnapshot();
    playerInstance.value = videojs(playerID.value, props.options, initPlayer)
    const [screenshotDom, recordDom] = document.getElementsByClassName("vjs-custom-bar")[0].querySelectorAll('div')
    screenshotDom.onclick = () => screenshotHandle(playerInstance, isPixelated.value, isInverted.value);
    let recorderParam = new RecorderParams(<Ref<VideoJsPlayer>>playerInstance, null, null, null, false)
    recordDom.onclick = () => recordHandle(recordDom, recorderParam, isPixelated.value, isInverted.value)

    window.onresize = () => {
        if (isPixelated.value) {
            addPixelate(playerInstance.value, pixelatePosition.value)
            const controlBar = document.getElementsByClassName("vjs-control-bar")[0]
            controlBar.setAttribute('style', `position: relative;top: ${playerInstance.value.currentHeight() + 7}px; background-color:black!important`) //加防抖
        }
    }
})

onUnmounted(() => {
    if (playerInstance.value) {
        playerInstance.value.dispose()
    }
})
</script>
 
<template>
    <canvas v-show="isPixelated" id="pixelate" class="pixelate"></canvas>
    <v-snackbar v-model="snackbar" :timeout="3000">
        您可以通过鼠标来涂抹马赛克。
        <template v-slot:actions>
            <v-btn color="blue" variant="text" @click="snackbar = false">
                Close
            </v-btn>
        </template>
    </v-snackbar>
    <div class="container" id="container">
        <video id="video1" class="video-js videosize vjs-static-controls" width="640" height="264" controls
            preload="auto" data-setup='{ "inactivityTimeout": 0 }'>
        </video>
        <canvas v-show="isInverted" id="invert" class="invert"></canvas>
        <Transition name="slide-fade">
        </Transition>
    </div>
    <v-dialog z-index="1003" v-model="pixelateDialogVisible" persistent width="60vw">
        <v-card>
            <v-card-title style="margin-left: 10px; margin-top: 1vh;">
                <span class="text-h6">选择马赛克区域（左下为原点），<strong style="color: #ef5350;">马赛克区域可以直接涂抹以选择</strong></span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="6">
                            <v-slider label="区域左下X坐标百分比" v-model="pixelatePosition.leftX" class="align-center" max="100"
                                :min="0" hide-details>
                                <template v-slot:append>
                                    <v-text-field v-model="pixelatePosition.leftX" hide-details single-line
                                        density="compact" type="number" style="width: 100px"></v-text-field>
                                </template>
                            </v-slider>
                        </v-col>
                        <v-col cols="6">
                            <v-slider label="区域右上X坐标百分比" v-model="pixelatePosition.rightX" class="align-center"
                                max="100" :min="0" hide-details>
                                <template v-slot:append>
                                    <v-text-field v-model="pixelatePosition.rightX" hide-details single-line
                                        density="compact" type="number" style="width: 100px"></v-text-field>
                                </template>
                            </v-slider>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6">
                            <v-slider label="区域左下Y坐标百分比" v-model="pixelatePosition.leftY" class="align-center" max="100"
                                :min="0" hide-details>
                                <template v-slot:append>
                                    <v-text-field v-model="pixelatePosition.leftY" hide-details single-line
                                        density="compact" type="number" style="width: 100px"></v-text-field>
                                </template>
                            </v-slider>
                        </v-col>
                        <v-col cols="6">
                            <v-slider label="区域右上Y坐标百分比" v-model="pixelatePosition.rightY" class="align-center"
                                max="100" :min="0" hide-details>
                                <template v-slot:append>
                                    <v-text-field v-model="pixelatePosition.rightY" hide-details single-line
                                        density="compact" type="number" style="width: 100px"></v-text-field>
                                </template>
                            </v-slider>
                        </v-col>
                    </v-row>

                </v-container>
            </v-card-text>
            <v-divider></v-divider>
            <span class="font-weight-thin" style="margin-left: 26px; margin-top: 20px; font-size: 1.1rem;">
                初始默认值为左下X、Y坐标百分比为0；右上X、Y坐标百分比为50，即对左下四分之一部分打码。
            </span>
            <v-card-actions style="margin-bottom: 5px; margin-top: 3vh;">
                <v-spacer></v-spacer>
                <v-btn variant="tonal" @click="() => {
                    pixelateDialogVisible = false
                    pixelatePosition = originalPosition;
                }">
                    取消
                </v-btn>
                <v-btn variant="tonal" color="blue-darken-1" @click="() => {
                    addPixelate(playerInstance, pixelatePosition)
                    pixelateDialogVisible = false
                    isPixelated = true
                }">
                    保存
                </v-btn>
                <v-btn v-show="isPixelated" color="red darken-1" variant="tonal" @click="() => {
                    isPixelated = false
                    pixelateDialogVisible = false
                }">
                    关闭马赛克
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>