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
    <li><a href="#项目配置">项目配置</a></li>
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

![Product Name Screen Shot][product-screenshot]

本项目是一个基于Video.js深度构建的多功能播放器。

### 技术栈

* [Vue][Vue-url]
* [Vite][Vite-url]
* [Vuetify][Vuetify-url]

## 项目配置

```sh
npm install
npm run dev
```

## 项目源文件结构

```bash
│  App.vue
│  main.ts
│
├─assets
│  ├─css
│  │      min.css //videojs源样式
│  │      quality.css // 清晰度切换插件样式
│  │      skin.css //videojs皮肤
│  │      snapshot.css //自定义截图按钮样式
│  │      video.css //自定义播放器样式
│  │
│  ├─images
│  │      camera.png
│  │      monitor.png
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
    │      invert.ts //反色工具类
    │
    ├─pixelate
    │      pixelate.ts //打码工具类
    │
    ├─quality
    │      qualityPlugin.ts //切换清晰度插件
    │
    └─snapshot
            snapshot.ts //截图与录屏工具
```

## 使用

## 项目完成度与未来计划

### 已实现

- [X] 上传文件播放
- [X] 根据URL播放
- [X] 使用默认源播放
- [X] 切换清晰度并记忆进度
- [X] 多场景截屏（包括反转与马赛克后截屏）
- [X] 实时录屏
- [X] 反色播放
- [X] 多用途部分打码（包括涂抹选择与输入位置选择打码区域）
- [X] flv播放
- [X] mov播放
- [X] 支持编码格式为H.265格式视频播放（Chrome在版本号107以上和Edge版本号12开始已经支持HEVC https://caniuse.com/?search=hevc）
- [X] 支持直播
  - [X] HLS

### 未来计划

- [ ] 引入h265web.js来提高播放HEVC视频兼容性
- [ ] 优化反色与马赛克同时出现时的截屏与录屏逻辑（项目内容要求中并未细化。具体实现时，反色与马赛克的源均直接来源于源视频，截图时如果同时反色与马赛克则截两张图）

## 开源许可证

在GPLv3协议下分发，更多信息请参考 `LICENSE`。

## 联系我

曾德御 电子科技大学信息与软件工程学院

* Tel：15102801677
* Email：dariuszeng@qq.com
* Blog：https://runtimeerrorz.github.io/
* Résumé：https://github.com/RuntimeErrorz/apex-player/blob/master/曾德御简历.pdf

## 致谢

* [GitHub Pages](https://pages.github.com)
* [Materialize CSS](https://github.com/dogfalo/materialize)
* [Stack Overflow](https://stackoverflow.com/)
* [MDN Web Docs Canvas](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)
* [Choose an Open Source License](https://choosealicense.com)
* [Material Design Icons](https://materialdesignicons.com/)
* [File Examples](https://file-examples.com/)
* [FFmpeg](https://ffmpeg.org/)
* [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html)

[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Vite.js]: https://img.shields.io/badge/Vite-20232A?style=for-the-badge&logo=vite
[Vite-url]: https://vitejs.cn/
[Vuetify.js]: https://img.shields.io/badge/Vuetify-aeddff?style=for-the-badge&logo=vuetify&logoColor=1697F6
[Vuetify-url]: https://next.vuetifyjs.com/
[product-screenshot]: README_PIC/screenshot.png
