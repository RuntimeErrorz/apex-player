<template>
  <div>
    <MyVideo :srcs="srcs" :options="options" />
  </div>
</template>
<script setup lang='ts'>
import sd from "@/assets/videos/sd.mp4"
import hd from "@/assets/videos/hd.mp4"
import MyVideo from "./components/video.vue"
const srcs = [
  {
    src: sd,
    type: 'video/mp4',
    label: 'SD',
    res: 360
  },
  {
    src: hd,
    type: 'video/mp4',
    label: 'HD',
    res: 720
  }
]
const options = {
  poster: "//vjs.zencdn.net/v/oceans.png",
  controls: true,
  customBar: {
    screenshot: true,
    recorder: true
  },
  plugins: {
    videoJsResolutionSwitcher: {
      default: 'high',
      dynamicLabel: true
    }
  },
  playbackRates: [0.5, 1, 1.5, 2]
}
</script>
<style>

</style>
