<template>
  <v-dialog v-model="dialog" persistent style="width: 60vw;">
    <v-card>
      <v-card-title>
        <span class="text-h5">选择视频源</span>
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
              <v-col cols="4"><v-text-field v-model="item.label" label="清晰度" placeholder="1080P" file></v-text-field>
              </v-col>
              <v-col cols="1">
                <v-btn icon size="large" @click="() => {
                  fileSrcs.push({
                    files: [], type: '', label: ''
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
            <v-row v-for="(item, i) in urlSrcs" :key="i">
              <v-col cols="7">
                <v-text-field label="URL" v-model="item.src"
                  placeholder="https://vjs.zencdn.net/v/oceans.mp4"></v-text-field>
              </v-col>
              <v-col cols="4"><v-text-field v-model="item.label" label="清晰度" placeholder="1080P"></v-text-field>
              </v-col>
              <v-col cols="1">
                <v-btn icon size="large" @click="() => {
                  srcs.push({
                    src: '', type: '', label: ''
                  })
                }">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-card-title style="margin-top: 1em;">
              <span>供参考的视频源</span>
            </v-card-title> <v-divider>
            </v-divider>
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">
                    格式
                  </th>
                  <th class="text-left">
                    URL
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in urls" :key="item.format">
                  <td>{{ item.format }}</td>
                  <td>{{ item.url }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-container>
        </v-window-item>
      </v-window>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="tonal" @click="() => { dialog = false, srcs = reactive([...defaultSrcs]) }">
          使用默认值
        </v-btn>
        <v-btn variant="tonal" color="green-darken-1" @click="() => { dialog = false, srcs = handleFile(fileSrcs) }">
          上传文件
        </v-btn>
        <v-btn variant="tonal" color="blue-darken-1"
          @click="() => { dialog = false, srcs = addType(urlSrcs) }">
          使用URL
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <div>
    <MyVideo :srcs="srcs" :options="options" @resetSource="resetSource" />
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

const filenameToMimeType = {
  'flv': "video/x-flv",
  'mp4': "video/mp4",
  'mov': "video/mp4",
  'm3u8': "application/x-mpegurl"
}


interface srcInterface {
  src: string;
  type: string;
  label: string;
}

let srcs: Array<srcInterface>

let urlSrcs = reactive([{
  src: "",
  type: '',
  label: '',
},])

let fileSrcs = reactive([
  {
    files: [],
    type: '',
    label: ''
  }
])

const urls = [
  {
    format: "H.264/MPEG-4 AVC",
    url: "https://vjs.zencdn.net/v/oceans.mp4"
  },
  {
    format: "HEVC/H.265",
    url: "https://vjs.zencdn.net/v/oceans.mp4"
  },
  {
    format: "MOV/QuickTime",
    url: "https://vjs.zencdn.net/v/oceans.mp4"
  },
  {
    format: "HLS",
    url: "http://220.161.87.62:8800/hls/1/index.m3u8"
  },
  {
    format: "FLV",
    url: "https://mister-ben.github.io/videojs-flvjs/bbb.flv"
  },
]

const addType = (srcs: Array<srcInterface>) => {
  for (const src of srcs) {
    const format = src.src.split(".").pop()
    if (format === 'm3u8')
      src.type = "application/x-mpegurl"
    else if (format === 'flv')
      src.type = "video/x-flv"
    else
      src.type = "video/mp4"
  }
  return srcs
}

const resetSource = () => {
  urlSrcs = reactive([{
    src: "",
    type: '',
    label: '',
  }])

  fileSrcs = reactive([
    {
      files: [],
      type: '',
      label: ''
    }
  ])

  dialog.value = true
}

function handleFile(fileList: Array<{ files: Array<File>, type: string, label: string }>) {
  let newArray = []
  for (const file of fileList) {
    newArray.push({
      src: URL.createObjectURL(file.files[0]),
      type: filenameToMimeType[<string>file.files[0].name.split('.').pop()],
      label: file.label
    })
  }
  return reactive(newArray)
}

let defaultSrcs = [{
  src: sd,
  type: 'video/mp4',
  label: 'SD',
},
{
  src: hd,
  type: 'video/mp4',
  label: 'HD',
}]

const options = {
  flvjs: {
    mediaDataSource: {
      isLive: false,
      cors: true,
      withCredentials: false,
    },
  },
  autoplay: true,
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
