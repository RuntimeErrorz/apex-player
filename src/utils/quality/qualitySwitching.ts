/** 画质切换插件。
 * Video.js7的extend需要用到function prototypes，Video.js8则对TypeScript支持不佳并且有BUG，两害相权取Video.js7。
 * 因此在本模块中会大量使用any类型，这也是无奈之举。
 * 重写动态标签，并增加了动态适应标签长度的功能。
 * 移除对Flash的支持等过时API，并修复大量非崩溃型错误。
 * 重构逻辑，添加类型标注与注释从而大大提高可读性、可维护性。
 * @module utils/quality/qualitySwitching
 * @date
 * @author RuntimeErroz <dariuszeng@qq.com>
 * @copyright  Kasper Moskwiak 2016
 */
import videojs, {type VideoJsPlayer} from 'video.js';
import {useVideoStore} from '@/store/videoState.js';
import {storeToRefs} from 'pinia';

/**
 * 一个定长和一个不定长div的中点对齐。
 */
const autoLocation = () => {
  const label = <HTMLDivElement>document.getElementsByClassName('vjs-resolution-button-label')[0];
  const menuItems = <HTMLUListElement>document.getElementsByClassName('vjs-menu-content')[5];
  menuItems?.style.setProperty('z-index', '1100');
  menuItems?.style.setProperty(
    'left',
    `${label.clientWidth * 0.5581395348837209 - 35.74418604651163}px` //直接暴力拟合
  );
};
interface Src {
  src: string;
  label: string;
  type: string;
  res: string;
}

interface GroupedSrc {
  label: any;
  res: any;
  type: any;
}

interface Chosen {
  res: string;
  label: string;
  sources: Array<Src>;
}

export default function addQuality() {
  /*
   * 分辨率切换菜单
   */
  const {isPixelated} = storeToRefs(useVideoStore());
  const MenuItem = <any | videojs.MenuItem>videojs.getComponent('MenuItem');
  const ResolutionMenuItem = videojs.extend(MenuItem, {
    constructor: function (this: any, player: VideoJsPlayer, options: any) {
      options.selectable = true;
      MenuItem.call(this, player, options);
      this.src = options.src;
      player.on('resolutionchange', videojs.bind(this, this.update));
    }
  });
  ResolutionMenuItem.prototype.handleClick = function (event: videojs.EventTarget.Event) {
    MenuItem.prototype.handleClick.call(this, event);
    this.player().currentResolution(this.options_.label);
  };
  ResolutionMenuItem.prototype.update = function () {};
  MenuItem.registerComponent('ResolutionMenuItem', ResolutionMenuItem);

  /*
   * 分辨率切换按钮
   */
  const MenuButton = <any | videojs.MenuButton>videojs.getComponent('MenuButton');
  const ResolutionMenuButton = videojs.extend(MenuButton, {
    constructor: function (this: any, player: VideoJsPlayer, options: any) {
      this.label = document.createElement('div');
      options.label = 'Quality';
      MenuButton.call(this, player, <videojs.MenuButtonOptions>options);
      this.el().setAttribute('aria-label', 'Quality');
      this.el().setAttribute('id', 'vjs-resolution-menu');
      videojs.dom.addClass(this.label, 'vjs-resolution-button-label');
      this.el().insertBefore(this.label, this.el().firstChild);
      player.on('updateSources', videojs.bind(this, this.update));
    }
  });
  ResolutionMenuButton.prototype.update = function () {
    //updateSources
    isPixelated.value = false;
    this.sources = this.player().getGroupedSrc();
    this.currentSelection = this.player().currentResolution();

    this.label.innerHTML = this.currentSelection?.label;
    setTimeout(autoLocation, 300); //FIXME: innerHTML应该是同步的，但是初始化时取得到div取不到clientWidth，后续切换正常。初步考虑Video.js的API问题。
    return MenuButton.prototype.update.call(this);
  };
  ResolutionMenuButton.prototype.buildCSSClass = function () {
    return MenuButton.prototype.buildCSSClass.call(this) + ' vjs-resolution-button';
  };
  ResolutionMenuButton.prototype.createItems = function () {
    const menuItems = [];
    const labels = (this.sources && this.sources.label) || {};
    for (const key in labels) {
      if (labels.hasOwnProperty(key)) {
        menuItems.push(
          new ResolutionMenuItem(this.player(), <videojs.MenuButtonOptions>{
            label: key,
            src: labels[key],
            selected: key === (this.currentSelection ? this.currentSelection.label : false)
          })
        );
      }
    }
    return menuItems;
  };

  MenuButton.registerComponent('ResolutionMenuButton', ResolutionMenuButton);

  /**
   * 初始化画质切换插件。
   * @param {object} options - 插件配置选项
   */
  const videoJsResolutionSwitcher = function (this: any, options: object) {
    const player = this; //The value of this in the plugin function is the player instance;
    /**
     * 根据options['default']初始选择源。
     * @param   {GroupedSrc} groupedSrc {res: { key: [] }}
     * @param   {Array<Src>} src
     * @returns {Object} {res: string, sources: []}
     */
    function chooseSrc(groupedSrc: GroupedSrc, src: Array<Src>): Chosen {
      let selectedRes = <string>options['default' as keyof typeof options]; //
      let selectedLabel = '';
      if (selectedRes === 'high') {
        selectedRes = src[0].res;
        selectedLabel = src[0].label;
      } else if (selectedRes === 'low' || selectedRes == null || !groupedSrc.res[selectedRes]) {
        selectedRes = src[src.length - 1].res;
        selectedLabel = src[src.length - 1].label;
      } else if (groupedSrc.res[selectedRes]) {
        selectedLabel = groupedSrc.res[selectedRes][0].label;
      }

      return {
        res: selectedRes, //480
        label: selectedLabel, //hd
        sources: groupedSrc.res[selectedRes] //"1.mp4", 2.mp4
      } as Chosen;
    }

    /**
     * 更新视频源
     * @param   {Array<Src>} src
     * @returns {VideoJsPlayer | Array<Src>} 用作初始值时返回VideoJSPlayer实例，如果
     */
    player.updateSrc = function (src: Array<Src>): VideoJsPlayer | Array<Src> {
      player.currentSources = src;
      player.groupedSrc = bucketSources(player.currentSources);
      const chosen: Chosen = chooseSrc(player.groupedSrc, player.currentSources);
      player.currentResolutionState = {
        label: chosen.label,
        sources: chosen.sources
      };
      player.setSourcesSanitized(chosen.sources, chosen.label, null);
      player.trigger('updateSources');
      return player;
    };

    /**
     * 返回当前分辨率状态，如果label不为空则设置一个
     * Returns current resolution or sets one when label is specified
     * @param {String}   label  - label name
     * @param {Function} customSourcePicker - custom function to choose source. Takes 2 arguments: sources, label. Must return player object.
     * @returns {Object} label给明时返回当前分辨率状态 {label: '', sources: []} ，反之返回VideojsPlayer
     */
    player.currentResolution = function (label: string, customSourcePicker: Function): object {
      if (label == null) {
        return player.currentResolutionState;
      }

      if (!player.groupedSrc || !player.groupedSrc.label || !player.groupedSrc.label[label]) {
        return {};
      }
      const sources = player.groupedSrc.label[label];
      const currentTime = player.currentTime();
      const isPaused = player.paused();

      if (!isPaused && player.player().options_.bigPlayButton) {
        player.player().bigPlayButton.hide();
      }

      player
        .setSourcesSanitized(sources, label, customSourcePicker || options[customSourcePicker])
        .one('loadeddata', () => {
          player.currentTime(currentTime);
          if (!isPaused && player.paused()) {
            player.play();
          }
        });
      player.trigger('updateSources');
      return player;
    };

    /**
     * 返回分组后的Src
     * @returns {GroupedSrc}  { label: { key: [] }, res: { key: [] }, type: { key: [] } }
     */
    player.getGroupedSrc = function (): GroupedSrc {
      return player.groupedSrc;
    };

    player.setSourcesSanitized = function (
      sources: Array<Src>,
      label: string,
      customSourcePicker: Function | null
    ) {
      player.currentResolutionState = {
        label: label,
        sources: sources
      };
      if (typeof customSourcePicker === 'function') {
        return customSourcePicker(player, sources, label);
      }
      player.src(
        sources.map((src) => {
          return {src: src.src, type: src.type, res: src.res};
        })
      );
      return player;
    };

    /**
     * 返回根据label, resolution and type分组的源
     * @param   {Array}  src Array of sources
     * @returns {Object} grouped sources: { label: { key: [] }, res: { key: [] }, type: { key: [] } }
     */
    function bucketSources(src: Array<Src>): GroupedSrc {
      const resolutions = {
        label: {},
        res: {},
        type: {}
      };
      src.map((source) => {
        initResolutionKey(resolutions, 'label', source);
        initResolutionKey(resolutions, 'res', source);
        initResolutionKey(resolutions, 'type', source);

        appendSourceToKey(resolutions, 'label', source);
        appendSourceToKey(resolutions, 'res', source);
        appendSourceToKey(resolutions, 'type', source);
      });
      return resolutions;
    }

    function initResolutionKey(resolutions: GroupedSrc, key: string, source: Src) {
      if (resolutions[key as keyof GroupedSrc][source[key as keyof Src]] == null)
        resolutions[key as keyof GroupedSrc][source[key as keyof Src]] = [];
    }

    function appendSourceToKey(resolutions: GroupedSrc, key: string, source: Src) {
      resolutions[key as keyof GroupedSrc][source[key as keyof Src]].push(source);
    }

    player.ready(function () {
      const menuButton = new ResolutionMenuButton(player, options);
      player.controlBar.resolutionSwitcher = player.controlBar
        .el()
        .insertBefore(menuButton.el(), player.controlBar.getChild('fullscreenToggle').el());
      player.controlBar.resolutionSwitcher.dispose = function () {
        player.parentNode.removeChild(player);
      };

      if (player.options().sources.length > 1) {
        player.updateSrc(player.options_.sources);
      }
    });
  };
  videojs.registerPlugin('videoJsResolutionSwitcher', videoJsResolutionSwitcher);
}
