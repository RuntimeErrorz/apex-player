<div align="center">
<h3 align="center">基于 Video.js 深度定制的播放器</h3>

<p align="center">
    <a href="http://101.42.51.16/player/">在线演示</a>
  </p>
</div>

<details open>
  <summary>目录</summary>
  <ol>
    <li>
      <a href="#项目简介">项目简介</a>
      <ul>
        <li><a href="#技术选型">技术选型</a></li>
        <li><a href="#文件结构">文件结构</a></li>
      </ul>
    </li>
    <li><a href="#使用">使用</a></li>
    <li>
      <a href="#项目完成度与未来计划">项目完成度与未来计划</a>
      <ul>
          <li><a href="#已实现">已实现</a></li>
          <li><a href="#未来计划">未来计划</a></li>
      </ul>
    </li>
    <li>
      <a href="#设计文档">设计文档</a>
      <ul>
        <li><a href="#组件设计">组件设计</a></li>
        <li><a href="#功能模块设计">功能模块设计</a></li>
        <li><a href="#测试模块设计">测试模块设计</a></li>
      </ul>
    </li>
    <li><a href="#开源许可证">开源许可证</a></li>
    <li><a href="#联系我">联系我</a></li>
    <li><a href="#致谢">致谢</a></li>
  </ol>
</details>

## 项目简介

本项目是一个基于 Video.js 深度定制的现代播放器。支持多种格式，多种来源的视频播放。一并支持了以下功能：自适应动态标签切换清晰度并记忆进度；多场景录屏、截屏；自适应反色播放；自适应多路径打码。（涂抹打码、输入位置打码、自适应重绘）


### 技术选型

[![Vue][Vue]][Vue-url]  
[![Vite][Vite]][Vite-url]  
[![Vuetify][Vuetify]][Vuetify-url]  
[![Vitest][Vitest]][Vitest-url]  
[![ESlint][ESlint]][ESlint-url]  
[![Prettier][Prettier]][Prettier-url]  
[![Husky][Husky]][Husky-url]   
[![Pinia][Pinia]][Pinia-url]  
[![Video.js][Video.js]][Video.js-url]

### 文件结构

```bash
│  App.vue
│  main.ts
│
├─assets
│  ├─css
│  │       controlbar.less  //底部控制栏样式
│  │       sidebar.less     //侧边栏样式
│  │
│  └─images
│          camera-outline.png      //截图图标
│          monitor-screenshot.png  //录屏图标
│          source-branch.png       //换源图标
│
├─components
│      CustomVideo.vue  //实现所有视频功能的SFC
│ 
├─store
│      videoState.ts    //定义了视频全局状态的Store
│
└─utils
    ├─invert
    │      invert.ts       //反色模块
    │      invert.test.ts  //反色模块测试
    │
    ├─pixelate
    │      pixelate.ts       //打码模块
    │      pixelate.test.ts  //打码测试模块
    │
    ├─quality
    │      qualitySwitching.ts   //切换清晰度插件模块
    │
    └─snapshot
           snapshot.ts   //多场景截图与录屏模块
```

## 使用

### 1. 选择视频源
可以在播放前和播放中切换 URL、文件、默认值等播放源。请注意，添加不同清晰度时需要点击右方加号。
![1674547153639](image/README/1674547153639.png)
### 2. 切换清晰度
如果您之前使用了多清晰度的源，在播放途中可以点击设置键进行切换。
![1674547190851](image/README/1674547190851.png)
### 3. 反色
![1674547260254](image/README/1674547260254.png)
播放中点击反色键即可反色，再点一次可以关闭反色。
### 4. 截图
点击截图键即可保存当前视频中的最新帧到本地。（如果处于马赛克或反转颜色状态则截取当前状态下的图片，如果同时处于马赛克和反转颜色状态则截取原视频。）

### 5. 录屏
![1674547316135](image/README/1674547316135.png)
点击录屏键开始录屏，点击结束键结束录屏并保存到本地。（录屏逻辑同截图。）
### 6. 打码
点击打码键可以选择打码区域，并且可以在打码区域涂抹。
![1674547496087](image/README/1674547496087.png)
![1674547867423](image/README/1674547867423.png)
![1674547934814](image/README/1674547934814.png)
## 项目完成度与未来计划

### 已实现

#### 核心功能

- [X] 自定义多来源播放（上传文件、URL、默认源）
- [X] 自适应动态标签切换清晰度并记忆进度
- [X] 多场景截屏（反转颜色与马赛克后多源截屏）
- [X] 多场景录屏（反转颜色与马赛克后多源录屏）
- [X] 自适应反色播放
- [X] 自适应多路径打码
  - [X] 涂抹打码
  - [X] 输入位置打码
  - [X] 自适应重绘
- [X] 支持 flv 播放
- [X] 支持 mov 播放
- [X] 支持编码格式为 H.265 格式的视频播放
- [X] 支持直播
  - [X] HLS

#### 前端工程化

- [X] 核心功能单元测试
- [X] 通过 Github Actions 实现持续集成与持续部署到云服务器
- [x] 使用 EsLint、Prettier、Husky 全过程统一规范代码
- [x] 引入 Less 预处理器全方位提升 CSS 开发效率
- [X] 搭建静态文件服务
- [X] 搭建页面展示服务

### 未来计划

- [ ] 明确反色与马赛克同时出现时的截屏与录屏逻辑；（项目内容要求中并未细化。具体实现时，反色与马赛克的源均直接来源于源视频，截图时如果同时反色与马赛克则截两张图。）
- [ ] 持续完善单元测试；
- [ ] 使用 Video.js 8 重构。（已尝试，由于 Video.js 8 对 TypeScript 的支持目前不佳作罢。）
- [ ] 迁移 CI/CD 流程到 Gitee Go；
- [ ] 引入 h265web.js-wasm-decoder 来提高播放 HEVC 视频的兼容性。

## 设计文档

### 组件设计
由于本项目中具体功能大都于易于扩展的功能模块中实现，因此组件数量并不复杂。

- CustomVideo 组件
  - 功能：实现了全部视频功能；向外提供数据源和自定义播放选项的接口（Props）

在根组件中引用此组件，并在 App.vue 实现了多来源视频的统一选择，日后项目复杂后易于扩展。

### 功能模块设计

封装了一些较复杂的功能模块（详情请参见注释）：

- pixelate.ts
- snapshot.ts
- invert.ts

### 测试模块设计

由于本项目主要基于成熟的组件库和 HTML 播放器进行开发，因此主要对核心算法进行单元测试。

- pixelate.test.ts
  - 功能：对打码算法的核心函数进行测试。
  - 具体实现：由于 Node.js 不支持 ImageData 的数据类型，因此自定义 ImgData 类，并对 2\*2 的图片数据进行了测试。
- invert.test.ts
  - 功能：对反转颜色的核心函数进行测试。
  - 具体实现：同样自定义 ImgData 类，对数据进行测试。

## 开源许可证

在 GPLv3 协议下分发，更多信息请参考 `LICENSE`。


## 致谢

- [GitHub Actionsc](https://github.com/features/actions)
- [Materialize CSS](https://github.com/dogfalo/materialize)
- [Stack Overflow](https://stackoverflow.com/)
- [MDN Web Docs Canvas](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)
- [Choose an Open Source License](https://choosealicense.com)
- [Material Design Icons](https://materialdesignicons.com/)
- [File Examples](https://file-examples.com/)
- [FFmpeg](https://ffmpeg.org/)
- [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html)

[Vue]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Vite]: https://img.shields.io/badge/Vite-20232A?style=for-the-badge&logo=vite
[Vite-url]: https://vitejs.cn/
[Vuetify]: https://img.shields.io/badge/Vuetify-aeddff?style=for-the-badge&logo=vuetify&logoColor=1697F6
[Vuetify-url]: https://next.vuetifyjs.com/
[Vitest]: https://img.shields.io/badge/Vitest-729b1b?style=for-the-badge&logo=vitest&logoColor=fcc72b
[Vitest-url]: https://cn.vitest.dev/
[ESlint-url]: https://eslint.org/
[ESlint]: https://img.shields.io/badge/eslint-101828?style=for-the-badge&logo=eslint
[Prettier-url]: https://prettier.io/
[Prettier]: https://img.shields.io/badge/prettier-1a2b34?style=for-the-badge&logo=prettier
[product-screenshot]: README_PIC/screenshot.png
[Husky]: https://img.shields.io/badge/husky-101828?style=for-the-badge&logoColor=1697F6
[Husky-url]: https://typicode.github.io/husky/
[Video.js]: https://img.shields.io/badge/video%20js-b33747?style=for-the-badge
[Video.js-url]: https://videojs.com

[Pinia]: https://img.shields.io/badge/pinia-ffd859?style=for-the-badge
[Pinia-url]: https://pinia.vuejs.org/zh/
