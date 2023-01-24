<script setup lang="ts">
/**
 * 此SFC实现了换源功能，并将其与CustomVideo组件进行整合。
 * @module /App
 * @date   2023-01-12
 * @author RuntimeErroz <dariuszeng@qq.com>
 */
import {ref, reactive} from 'vue';
import CustomVideo from './components/CustomVideo.vue';
import type {Src} from './components/CustomVideo.vue';
const dialog = ref(true); // 对象框显示控制
const tab = ref(null); // tab切换所需
const tabTitleItems = reactive(['使用URL', '上传文件']); // tab标题
const defaultSrcs = [
  // 默认值用于展示清晰度切换
  {
    src: 'http://101.42.51.16/videos/high.mp4',
    type: 'video/mp4',
    label: '400P'
  },
  {
    src: 'http://101.42.51.16/videos/low.mp4',
    type: 'video/mp4',
    label: '180P'
  }
];

const options = {
  // videojs选项
  flvjs: {
    mediaDataSource: {
      isLive: false,
      cors: true,
      withCredentials: false
    }
  },
  crossorigin: 'anonymous',
  inactivityTimeout: 0,
  preload: 'auto',
  autoplay: true,
  controls: true,
  customBar: {
    screenshot: true,
    recorder: true
  },
  plugins: {
    videoJsResolutionSwitcher: {
      default: 'high'
    }
  },
  playbackRates: [0.5, 1, 1.5, 2]
};
const mimeTypesMap = {
  // 根据文件类型转化MediaType
  flv: 'video/x-flv',
  mp4: 'video/mp4',
  mov: 'video/mp4',
  m3u8: 'application/x-mpegurl'
};

let srcs: Array<Src> = []; // 真正播放传参的源
let urlSrcs = reactive([
  //  输入的URL数组
  {
    src: '',
    type: '',
    label: ''
  }
]);
let fileSrcs = reactive([
  // 输入的文件数组
  {
    files: [],
    type: '',
    label: ''
  }
]);
const recommendURL = [
  // 供参考的视频源
  {
    format: 'H.264/MPEG-4 AVC',
    url: 'http://101.42.51.16/videos/low.mp4'
  },
  {
    format: 'Flash Video',
    url: 'http://101.42.51.16/videos/test.flv'
  },
  {
    format: 'MOV/QuickTime',
    url: 'http://101.42.51.16/videos/test.mov'
  },
  {
    format: 'HTTP Live Streaming',
    url: 'http://livefr.cgtn.com/1000f/prog_index.m3u8'
  },
  {
    format: 'HEVC/H.265',
    url: 'http://101.42.51.16/videos/hevc.mp4'
  }
];
/**
 * 通过后缀设定各自URL的MediaType
 * @param    {Array<Src>}  srcs  源数组
 * @returns  {Array<Src>}        设定后的数组
 */
const setType = (srcs: Array<Src>): Array<Src> => {
  for (const src of srcs)
    src.type = mimeTypesMap[(<string>src.src.split('.').pop()) as keyof typeof mimeTypesMap];
  return srcs;
};
const resetSource = () => {
  // 组件换源，需要清空源
  urlSrcs = reactive([
    {
      src: '',
      type: '',
      label: ''
    }
  ]);

  fileSrcs = reactive([
    {
      files: [],
      type: '',
      label: ''
    }
  ]);
  dialog.value = true;
};
/**
 * 返回一个由文件创建的Blob为源的视频播放源数组。
 * @param    {Array<Src>}  fileList  源数组
 * @returns  {Array<Src>} 处理后的数组
 */
const createBlob = (
  fileList: Array<{files: Array<File>; type: string; label: string}>
): Array<Src> => {
  const temp = [];
  for (const file of fileList) {
    temp.push({
      src: URL.createObjectURL(file.files[0]),
      type: mimeTypesMap[
        (<string>file.files[0].name.split('.').pop()) as keyof typeof mimeTypesMap
      ],
      label: file.label
    });
  }
  return temp;
};
</script>
<template>
  <v-dialog v-model="dialog" style="width: 60vw" scrollable>
    <v-card>
      <v-card-title>
        <span class="text-h5">选择视频源</span>
      </v-card-title>
      <v-tabs v-model="tab" background-color="transparent" color="basil" grow>
        <v-tab v-for="item in tabTitleItems" :value="item" :key="item">
          {{ item }}
        </v-tab>
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item value="使用URL">
          <v-container style="margin-top: 1em">
            <v-row v-for="(item, i) in urlSrcs" :key="i">
              <v-col cols="7">
                <v-text-field
                  label="URL"
                  v-model="item.src"
                  placeholder="http://101.42.51.16/videos/sd.mp4"
                ></v-text-field>
              </v-col>
              <v-col cols="4"
                ><v-text-field
                  v-model="item.label"
                  label="清晰度"
                  placeholder="1080P"
                ></v-text-field>
              </v-col>
              <v-col cols="auto">
                <v-btn
                  icon
                  size="large"
                  @click="
                    () => {
                      urlSrcs.push({
                        src: '',
                        type: '',
                        label: ''
                      });
                    }
                  "
                >
                  <v-icon style="min-width: 200px">mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-card-title style="margin-top: 1em">
              <span>供参考的视频源</span>
            </v-card-title>
            <v-divider> </v-divider>
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">格式</th>
                  <th class="text-left">URL</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in recommendURL" :key="item.format">
                  <td>{{ item.format }}</td>
                  <td>{{ item.url }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-container>
        </v-window-item>
        <v-window-item value="上传文件">
          <v-container style="margin-top: 1em">
            <v-row v-for="(item, i) in fileSrcs" :key="i">
              <v-col cols="7">
                <v-file-input label="上传文件" v-model="item.files"></v-file-input>
              </v-col>
              <v-col cols="4"
                ><v-text-field
                  v-model="item.label"
                  label="清晰度"
                  placeholder="1080P"
                  file
                ></v-text-field>
              </v-col>
              <v-col cols="1">
                <v-btn
                  icon
                  size="large"
                  @click="
                    () => {
                      fileSrcs.push({
                        files: [],
                        type: '',
                        label: ''
                      });
                    }
                  "
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-window-item>
      </v-window>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="tonal"
          @click="
            () => {
              (dialog = false), (srcs = reactive([...defaultSrcs]));
            }
          "
        >
          使用默认值
        </v-btn>
        <v-btn
          variant="tonal"
          color="green-darken-1"
          @click="
            () => {
              (dialog = false), (srcs = createBlob(fileSrcs));
            }
          "
        >
          上传文件
        </v-btn>
        <v-btn
          variant="tonal"
          color="blue-darken-1"
          @click="
            () => {
              (dialog = false), (srcs = setType(urlSrcs));
            }
          "
        >
          使用URL
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <CustomVideo :srcs="srcs" :options="options" @resetSource="resetSource" />
</template>
