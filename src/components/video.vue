<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"
import type { Ref } from "vue"
import videojs, { type VideoJsPlayer } from "video.js"
import addQuality from "@/utils/quality/qualityPlugin.js"
import addSnapshot from "@/utils/snapshot/snapshot.js"
import { RecorderParams } from "@/utils/snapshot/snapshot.js"
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
let volume = ref(0)

let pixelatePosition: Ref<pixelatePositions> = ref({
    leftX: 0,
    leftY: 0,
    rightX: 100,
    rightY: 100
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
    invertButton.el().innerHTML = "Invert"
    invertButton.el().addEventListener("click", invert)

    let pixelateButton = <videojs.Component>playerInstance.value?.controlBar.addChild("button");
    pixelateButton.addClass("vjs-pixelate-bt")
    pixelateButton.el().innerHTML = "Pixelate"
    pixelateButton.el().addEventListener("click", () => {
        if (fullscreen)
            playerInstance.value?.exitFullscreen();
    }
    )

    playerInstance.value?.updateSrc(props.srcs)
    playerInstance.value?.on('resolutionchange', function () {
        console.info('Source changed to %s', playerInstance.value?.src())
    })
    playerInstance.value?.on('fullscreenchange', () => {
        fullscreen.value = !fullscreen.value
    })

    document.getElementById('#vmr_video')?.addEventListener('mousemove', (event) => {
        let inactivityTimeout: number | null = null;
        playerInstance.value?.controls(true)
        if (inactivityTimeout != null) {
            clearTimeout(inactivityTimeout);
        }
        inactivityTimeout = setTimeout(function () {
            playerInstance.value?.controls(false)
        }, 0);
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
    addSnapshot(new RecorderParams(<Ref<VideoJsPlayer>>playerInstance, null, null, null, false));
    playerInstance.value = videojs(playerID.value, props.options, initPlayer)
})
onUnmounted(() => {
    if (playerInstance.value) {
        playerInstance.value.dispose()
    }
})
</script>
 
<template>
    <div class="container" id="container">
        <video id="video1" class="video-js videosize"></video>
        <Transition name="slide-fade">
            <canvas v-show="isInverted" id="invert" class="invert"></canvas>
        </Transition>
    </div>
    <div>
        <v-container>
            <v-card>
                <v-card-title style="margin-left: 10px; margin-top: 1vh;">
                    <span class="text-h6">在画面上图画或拖动以选择或输入马赛克区域（左下为原点）</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-slider></v-slider>
                            <v-col cols="6">
                                <v-slider label="区域左下X坐标百分比" v-model="pixelatePosition.leftX" max="100" min="0">
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
                                <v-slider label="区域左下Y坐标百分比" v-model="pixelatePosition.leftY" class="align-center"
                                    max="100" :min="0" hide-details>
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
                <span class="font-weight-thin" style="margin-left: 26px; margin-top: 20px; font-size: 1rem;">
                    初始默认值为左下X、Y坐标百分比为0；右上X、Y坐标百分比为100，即对全屏打码。
                </span>
                <v-card-actions style="margin-bottom: 5px; margin-top: 3vh;">
                    <v-spacer></v-spacer>
                    <v-btn variant="tonal" color="blue-darken-1" @click="() => {
                        addPixelate(playerInstance, pixelatePosition)
                        isPixelated = true
                    }">
                        保存
                    </v-btn>
                    <v-btn color="red darken-1" variant="tonal" @click="() => {
                        isPixelated = false
                    }">
                        关闭马赛克
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-container>
        <canvas v-show="isPixelated" id="pixelate" class="pixelate"></canvas>
    </div>

</template>