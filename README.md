<div align="center">
<h3 align="center">基于Video.js的深度定制播放器</h3>

<p align="center">
    <a href="https://runtimeerrorz.github.io/player/">在线演示</a>
  </p>
</div>

<details>
  <summary>目录</summary>
  <ol>
    <li>
      <a href="#项目简介">项目简介</a>
      <ul>
        <li><a href="#技术栈">技术栈</a></li>
      </ul>
    </li>
    <li><a href="#文件结构">文件结构</a></li>
    <li><a href="#使用">使用</a></li>
    <li>
      <a href="#项目完成度与未来计划">项目完成度与未来计划</a>
      <ul>
          <li><a href="#已实现">已实现</a></li>
      </ul>
       <ul>
          <li><a href="#未来计划">未来计划</a></li>
      </ul>
    </li>
    <li><a href="#开源许可证">开源许可证</a></li>
    <li><a href="#联系我">联系我</a></li>
    <li><a href="#致谢">致谢</a></li>
  </ol>
</details>

## 项目简介

![1673792015238](image/README/1673792015238.png)
本项目是一个基于 Video.js 深度自定义的现代播放器。

### 技术选型

[![Vue][Vue]][Vue-url]  
[![Vite][Vite]][Vite-url]  
[![Vuetify][Vuetify]][Vuetify-url]  
[![Vitest][Vitest]][Vitest-url]  
[![ESlint][ESlint]][ESlint-url]  
[![Prettier][Prettier]][Prettier-url]  
[Video.js](https://videojs.com/)  
[Husky](https://typicode.github.io/husky/#/)

## 文件结构

```bash
│  App.vue
│  main.ts
│
├─assets
│  ├─css
│  │      min.css //videojs源样式
│  │      quality.css // 清晰度切换插件样式
│  │      skin.css //videojs皮肤
│  │      snapshot.css //静态截图按钮样式
│  │
│  ├─images
│  │      camera.png   //截图图标
│  │      monitor.png  //录屏图标
│  │
│  └─videos
│          hd.mp4 //默认高清源
│          sd.mp4 //默认标清源
│
├─components
│      video.vue //封装的Video组件，接受源数组与自定义选项
│
└─utils
    ├─invert
    │      invert.ts //反色模块
    │      invert.test.ts //反色模块测试
    │
    ├─pixelate
    │      pixelate.ts //打码模块
    │      pixelate.test.ts //打码测试模块
    │
    ├─quality
    │      qualityPlugin.ts //切换清晰度插件
    │
    └─snapshot
            snapshot.ts //多场景截图与录屏模块
            snapshot.test.ts //多场景截图与录屏模块

```

## 使用

### 1. 选择视频源

可以在播放前和播放中切换URL、文件、默认值等播放源。
请注意，添加不同清晰度时需要点击右方加号。
![1673689752359](image/README/1673689752359.png)

### 2. 切换清晰度

如果您之前使用了多清晰度的源，在播放途中可以点击设置键进行切换。
![1673688400995](image/README/1673688400995.png)

### 3. 反色

播放中点击反色键即可反色，再点一次可以关闭反色。
![1673688449180](image/README/1673688449180.png)

### 4. 截图

点击截图键即可保存当前视频中的最新帧到本地。（如果处于马赛克或反转颜色状态则截取当前状态下的图片，如果同时处于马赛克和反转颜色状态则截取原视频）
![1673688604754](image/README/1673688604754.png)

### 5. 录屏

点击录屏键开始录屏，点击结束键结束录屏并保存到本地。（录屏逻辑同截图）
![1673688896373](image/README/1673688896373.png)

### 6. 打码

点击打码键可以选择打码区域，并且可以在打码区域涂抹。
![1673689080140](image/README/1673689080140.png)
![1673689272594](image/README/1673689272594.png)
![1673689363627](image/README/1673689363627.png)

## 项目完成度与未来计划

### 已实现

#### 核心功能

- [X] 自定义源播放（上传文件、URL、默认源）
- [X] 切换清晰度并记忆进度
- [X] 多场景截屏（反转颜色与马赛克后多源截屏）
- [X] 多场景录屏（反转颜色与马赛克后多源录屏）
- [X] 反色播放
- [X] 自适应多路径打码
  - [X] 涂抹打码
  - [X] 输入位置打码
  - [X] 自适应重绘
- [X] 支持 flv 播放
- [X] 支持mov 播放
- [X] 支持编码格式为 H.265 格式视频播放
- [X] 支持直播
  - [X] HLS

#### 其他工作

- [X] 单元测试
- [X] 搭建静态文件服务器
- [X] 搭建页面展示服务器

### 未来计划

- [ ] 引入 h265web.js 来提高播放 HEVC 视频兼容性
- [ ] 优化反色与马赛克同时出现时的截屏与录屏逻辑。（项目内容要求中并未细化。具体实现时，反色与马赛克的源均直接来源于源视频，截图时如果同时反色与马赛克则截两张图）
- [ ] 持续完善单元测试。
- [ ] 使用Video.js 8重构（已尝试过，由于Video.js8对TypeScript的支持目前不佳作罢）

## 设计文档

### 组件设计

- custom-video 组件
  - 功能：实现了全部视频功能；向外提供数据源和自定义播放选项的接口（Props）

在根组件中引用此组件，并在 App.vue 实现了多来源视频的统一选择，日后项目复杂后易于扩展。

### 模块设计

封装了一些较复杂的功能模块：

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
  - 具体实现：同样自定义 ImgData 类，对不同大小的数据进行测试。

## 开源许可证

在 GPLv3 协议下分发，更多信息请参考 `LICENSE`。

## 联系我

曾德御 电子科技大学信息与软件工程学院

- Tel：15102801677
- Email：dariuszeng@qq.com
- Blog：https://runtimeerrorz.github.io/
- Résumé：https://github.com/RuntimeErrorz/apex-player/blob/master/曾德御简历.pdf

## 致谢

- [GitHub Pages](https://pages.github.com)
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
