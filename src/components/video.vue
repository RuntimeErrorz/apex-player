<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive } from "vue"
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


let pixelateDialogVisible = ref(false)
let isPixelated = ref(false)
let isInverted = ref(false)
let fullscreen = ref(false)



let pixelatePosition: Ref<pixelatePositions> = ref({
    leftX: 0,
    leftY: 0,
    rightX: 0,
    rightY: 0
})

let originalPosition: Ref<pixelatePositions>

const props = defineProps<{
    srcs: Array<Object>,
    options: Object
}>()

const playerID = ref('video1')
const playerInstance: Ref<VideoJsPlayer | undefined> = ref()

function initPlayer() {
    {
        let invertButton = <videojs.Component>playerInstance.value?.controlBar.addChild("button");
        invertButton.addClass("vjs-invert-bt")
        invertButton.el().innerHTML = "Invert"
        invertButton.el().addEventListener("click", invert)

        let pixelateButton = <videojs.Component>playerInstance.value?.controlBar.addChild("button");
        pixelateButton.addClass("vjs-pixelate-bt")
        pixelateButton.el().innerHTML = "Pixelate"
        pixelateButton.el().addEventListener("click", () => {
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
        })
    }
}


function invert() {
    if (!isInverted.value) {
        if (fullscreen.value) {
            playerInstance.value?.exitFullscreen();
        }
        invertColor(playerInstance.value?.el())
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
        <v-dialog v-model="pixelateDialogVisible" persistent width="60vw">
            <v-card>
                <v-card-title style="margin-left: 10px; margin-top: 1vh;">
                    <span class="text-h6">拖动以选择或输入马赛克区域（左下为原点）</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="6">
                                <v-slider label="区域左下X坐标百分比" v-model="pixelatePosition.leftX" class="align-center"
                                    max="100" :min="0" hide-details>
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
                <v-card-actions style="margin-bottom: 5px; margin-top: 3vh;">
                    <v-spacer></v-spacer>
                    <v-btn variant="tonal" @click="() => {
                        pixelateDialogVisible = false
                        pixelatePosition = originalPosition;
                    }">
                        取消
                    </v-btn>
                    <v-btn variant="tonal" color="blue-darken-1" @click="() => {
                        addPixelate(playerInstance?.el(), pixelatePosition)
                        pixelateDialogVisible = false
                        isPixelated = true
                    }">
                        保存
                    </v-btn>
                    <v-btn color="red darken-1" variant="tonal" @click="() => {
                        isPixelated = false
                        pixelateDialogVisible = false
                    }">
                        关闭马赛克
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <video id="video1" class="video-js videosize"></video>
        <Transition name="slide-fade">
            <canvas v-show="isInverted" id="invert" class="invert"></canvas>
        </Transition>
    </div>
    <canvas v-show="isPixelated" id="pixelate" class="pixelate"></canvas>
</template>
 
 
<style>

</style>