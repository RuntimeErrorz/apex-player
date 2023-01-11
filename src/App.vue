<template>
  <v-dialog v-model="dialog" persistent style="width: 60vw;">
    <v-card>
      <v-card-title>
        <span class="text-h6">选择视频源</span>
      </v-card-title>
      <v-tabs v-model="tab" background-color="transparent" color="basil" grow>
        <v-tab v-for="item in items" :value="item">
          {{ item }}
        </v-tab>
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item value="上传文件">
          <v-container style="margin-top: 1em;">
            <v-row v-for="(item, i) in fileSrcs" :key="i">
              <v-col cols="7"> <v-file-input label="上传文件" v-model="item.files"></v-file-input>
              </v-col>
              <v-col cols="4"><v-text-field v-model="item.label" label="该视频的标签" placeholder="1080P" file></v-text-field>
              </v-col>
              <v-col cols="1">
                <v-btn icon size="large" @click="() => {
                  fileSrcs.push({
                    files: [], type: 'video/mp4', label: ''
                  })
                }">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-window-item>
        <v-window-item value="使用URL">
          <v-container style="margin-top: 1em;">
            <v-row v-for="(item, i) in srcs" :key="i">
              <v-col cols="7">
                <v-text-field label="URL" v-model="item.src"
                  placeholder="https://vjs.zencdn.net/v/oceans.mp4"></v-text-field>
              </v-col>
              <v-col cols="4"><v-text-field v-model="item.label" label="该视频的标签" placeholder="1080P"></v-text-field>
              </v-col>
              <v-col cols="1">
                <v-btn icon size="large" @click="() => {
                  srcs.push({
                    src: '', type: 'video/mp4', label: ''
                  })
                }">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-window-item>
      </v-window>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="tonal" @click="() => { dialog = false, srcs = [...defaultSrcs] }">
          使用默认值
        </v-btn>
        <v-btn variant="tonal" color="green-darken-1" @click="() => { dialog = false, srcs = handleFile(fileSrcs) }">
          上传文件
        </v-btn>
        <v-btn variant="tonal" color="blue-darken-1" @click="() => { dialog = false }">
          使用URL
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <div>
    <MyVideo :srcs="srcs" :options="options" @changeDialog="changeDialog" />
  </div>
</template>
<script setup lang='ts'>
import { ref, reactive } from "vue"
import sd from "@/assets/videos/sd.mp4"
import hd from "@/assets/videos/hd.mp4"
import MyVideo from "./components/video.vue"
const dialog = ref(true)
const tab = ref(null)
const items = reactive(['上传文件', '使用URL'])

const changeDialog = () => {
  dialog.value = true
  srcs = [
    {
      src: "",
      type: 'video/mp4',
      label: '',
    },
  ]
}

function handleFile(fileList: Array<{ files: Array<File>, type: string, label: string }>) {
  let newArray = []
  for (const file of fileList) {
    newArray.push({
      src: URL.createObjectURL(file.files[0]),
      type: file.type,
      label: file.label
    })
  }
  return newArray
}

const defaultSrcs = [{
  src: sd,
  type: 'video/mp4',
  label: 'SD',
},
{
  src: hd,
  type: 'video/mp4',
  label: 'HD',
}]

let srcs = reactive([
  {
    src: "",
    type: 'video/mp4',
    label: '',
  },
])

let fileSrcs = reactive([
  {
    files: [],
    type: 'video/mp4',
    label: ''
  }
])

const options = {
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
