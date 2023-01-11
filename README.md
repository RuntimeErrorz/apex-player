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

## 使用

## 项目完成度与未来计划

### 已实现

- [X] 上传文件
- [X] 根据URL播放
- [X] 视频播放
- [X] 切换清晰度并记忆进度
- [X] 截屏功能（包括反转与马赛克后截屏）
- [X] 录屏功能
- [X] 反色播放
- [X] 部分打码（包括涂抹选择与输入位置选择打码区域）
- [X] mov播放
- [X] 支持编码格式为H.265格式视频播放（Chrome在版本号107以上和Edge版本号12开始已经支持HEVC https://caniuse.com/?search=hevc）
- [X] 支持直播
  - [ ] HLS
  - [ ] RTMP（强依赖Flash，应该也没办法支持了）

### 未来计划

- [ ] flv格式的视频播放
- [ ] 引入h265web.js提高播放HEVC视频兼容性
- [ ] 优化反色与马赛克同时出现时的截屏与录屏逻辑（项目内容要求中并未细化。具体实现时，反色与马赛克的源均直接来源于源视频，截图时如果同时反色与马赛克则截两张图）

## 开源许可证

Distributed under the MIT License. See `LICENSE.txt` for more information.

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
* https://materialdesignicons.com/
* https://file-examples.com/wp-content/uploads/2018/04/file_example_MOV_480_700kB.mov
* ffmpeg

[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Vite.js]: https://img.shields.io/badge/Vite-20232A?style=for-the-badge&logo=vite
[Vite-url]: https://vitejs.cn/
[Vuetify.js]: https://img.shields.io/badge/Vuetify-aeddff?style=for-the-badge&logo=vuetify&logoColor=1697F6
[Vuetify-url]: https://next.vuetifyjs.com/
[product-screenshot]: README_PIC/screenshot.png
