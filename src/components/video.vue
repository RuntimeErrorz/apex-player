<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"
import type { Ref } from "vue"
import videojs, { type VideoJsPlayer } from "video.js"
import addQuality from "@/utils/quality/qualityPlugin.js"
import addSnapshot from "@/utils/snapshot/snapshot.js"
import { RecorderParams } from "@/utils/snapshot/snapshot.js"
import invertColor from "@/utils/invert/invert.js"


import "@/assets/css/quality.css"
import "@/assets/css/snapshot.css"
import "@/assets/css/skin.css"
import "@/assets/css/video.css"


let isInverted = ref(false)
let fullscreen = ref(false)


const props = defineProps<{
    srcs: Array<Object>,
    options: Object
}>()

const playerID = ref('video1')
const playerInstance: Ref<VideoJsPlayer | undefined> = ref()

function initPlayer() {
    {
        let invertButton = <videojs.Component>playerInstance.value?.controlBar.addChild("button");
        invertButton.el().innerHTML = "Invert"
        invertButton.el().onclick = invert
        invertButton.addClass("vjs-invert-bt")
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
        console.log(isInverted.value)
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
            <canvas v-show="isInverted" id="canv"></canvas>
        </Transition>
    </div>
</template>
 
 
<style>

</style>