/** 画质切换插件。
 * @copyright  Kasper Moskwiak 2016
 * @author RuntimeErroz <dariuszeng@qq.com>
 * Video.js7的extend需要用到function prototypes，Video.js8则对ts支持不佳并且有BUG，两害相权取Video.js7。
 * 对原插件重构以修复动态标签失效的Bug，另外支持Videojs.7，并添加部分类型标注与注释从而大大提高可读性。
 */

interface Src {
  src: string;
  label: string;
  type: string;
  res: string;
}

interface Resolution {
  label: any;
  res: any;
  type: any;
}

interface Chosen {
  res: string;
  label: string;
  sources: Array<Src>;
}

import videojs, {type VideoJsPlayer} from 'video.js';
export default function addQuality() {
  let videoJsResolutionSwitcher,
    defaults = {
      ui: true
    };

  /*
   * Resolution menu item
   */
  const MenuItem = videojs.getComponent('MenuItem');
  const ResolutionMenuItem = videojs.extend(MenuItem, {
    constructor: function (player: VideoJsPlayer, options: videojs.MenuItemOptions) {
      options.selectable = true;
      // Sets this.player_, this.options_ and initializes the component
      MenuItem.call(this, player, options);
      this.src = options.src;

      player.on('resolutionchange', videojs.bind(this, this.update));
    }
  });
  ResolutionMenuItem.prototype.handleClick = function (event) {
    MenuItem.prototype.handleClick.call(this, event);
    this.player_.currentResolution(this.options_.label);
  };
  ResolutionMenuItem.prototype.update = function () {
    let options = <HTMLUListElement>document.getElementsByClassName('vjs-menu-content')[5];
    const length = document.getElementsByClassName('vjs-resolution-button-label')[0].innerHTML
      .length;
    options?.style.setProperty('left', `${0.3 * length - 1.5}vw`);
  };
  MenuItem.registerComponent('ResolutionMenuItem', ResolutionMenuItem);

  /*
   * Resolution menu button
   */
  const MenuButton = videojs.getComponent('MenuButton');
  const ResolutionMenuButton = videojs.extend(MenuButton, {
    constructor: function (player: VideoJsPlayer, options: videojs.MenuItemOptions) {
      this.label = document.createElement('div');
      options.label = 'Quality';
      // Sets this.player_, this.options_ and initializes the component
      MenuButton.call(this, player, options);
      this.el().setAttribute('aria-label', 'Quality');
      this.el().setAttribute('id', 'vjs-re');

      this.controlText('Quality');

      if (options.dynamicLabel) {
        videojs.dom.addClass(this.label, 'vjs-resolution-button-label');
        this.el().insertBefore(this.label, this.el().firstChild);
      } else {
        const staticLabel = document.createElement('span');
        videojs.dom.addClass(staticLabel, 'vjs-menu-icon');
        this.el().appendChild(staticLabel);
      }
      player.on('resolutionchange', videojs.bind(this, this.update));
    }
  });
  ResolutionMenuButton.prototype.createItems = function () {
    const menuItems = [];
    const labels = (this.sources && this.sources.label) || {};

    for (const key in labels) {
      if (labels.hasOwnProperty(key)) {
        menuItems.push(
          new ResolutionMenuItem(this.player_, {
            label: key,
            src: labels[key],
            selected: key === (this.currentSelection ? this.currentSelection.label : false)
          })
        );
      }
    }
    return menuItems;
  };
  ResolutionMenuButton.prototype.update = function () {
    this.sources = this.player_.getGroupedSrc();
    this.currentSelection = this.player_.currentResolution();
    this.label.innerHTML = this.currentSelection ? this.currentSelection.label : '';
    this.label.parentNode?.lastChild.lastChild.style.setProperty('left', '2em', 'important');
    return MenuButton.prototype.update.call(this);
  };
  ResolutionMenuButton.prototype.buildCSSClass = function () {
    return MenuButton.prototype.buildCSSClass.call(this) + ' vjs-resolution-button';
  };
  MenuButton.registerComponent('ResolutionMenuButton', ResolutionMenuButton);

  /**
   * Initialize the plugin.
   * @param {object} [options] configuration for the plugin
   */
  videoJsResolutionSwitcher = function (options: object) {
    const settings = videojs.mergeOptions(defaults, options),
      player = this;

    /**
     * Updates player sources or returns current source URL
     * @param   {Array}  [src] array of sources [{src: '', type: '', label: '', res: ''}]
     * @returns {Object|String|Array} videojs player object if used as setter or current source URL, object, or array of sources
     */
    player.updateSrc = function (src: Array<Src>): VideoJsPlayer | string | Array<Src> {
      //Return current src if src is not given
      if (!src) {
        return player.src();
      }

      // Only add those sources which we can (maybe) play
      src = src.filter((source) => {
        try {
          return player.canPlayType(source.type) !== '';
        } catch (e) {
          // If a Tech doesn't yet have canPlayType just add it
          return true;
        }
      });
      //Sort sources
      this.currentSources = src;
      this.groupedSrc = bucketSources(this.currentSources);
      // Pick one by default
      const chosen: Chosen = chooseSrc(this.groupedSrc, this.currentSources);
      this.currentResolutionState = {
        label: chosen.label,
        sources: chosen.sources
      };
      player.trigger('updateSources'); //trigger update
      player.setSourcesSanitized(chosen.sources, chosen.label, null);
      player.trigger('resolutionchange'); // trigger update
      player.trigger('resolutionchange');
      return player;
    };

    /**
     * Returns current resolution or sets one when label is specified
     * @param {String}   [label]         label name
     * @param {Function} [customSourcePicker] custom function to choose source. Takes 2 arguments: sources, label. Must return player object.
     * @returns {Object}   current resolution object {label: '', sources: []} if used as getter or player object if used as setter
     */
    player.currentResolution = function (label: string, customSourcePicker: Function): object {
      if (label == null) {
        return this.currentResolutionState;
      }

      // Lookup sources for label
      if (!this.groupedSrc || !this.groupedSrc.label || !this.groupedSrc.label[label]) {
        return {};
      }
      const sources = this.groupedSrc.label[label];
      // Remember player state
      const currentTime = player.currentTime();
      const isPaused = player.paused();

      // Hide bigPlayButton
      if (!isPaused && this.player_.options_.bigPlayButton) {
        this.player_.bigPlayButton.hide();
      }

      // Change player source and wait for loadeddata event, then play video
      // loadedmetadata doesn't work right now for flash.
      // Probably because of https://github.com/videojs/video-js-swf/issues/124
      // If player preload is 'none' and then loadeddata not fired. So, we need timeupdate event for seek handle (timeupdate doesn't work properly with flash)
      let handleSeekEvent = 'loadeddata';
      if (
        this.player_.techName_ !== 'Youtube' &&
        this.player_.preload() === 'none' &&
        this.player_.techName_ !== 'Flash'
      ) {
        handleSeekEvent = 'timeupdate';
      }
      player
        .setSourcesSanitized(sources, label, customSourcePicker || settings.customSourcePicker)
        .one(handleSeekEvent, function () {
          player.currentTime(currentTime);
          if (!isPaused && player.paused()) {
            player.play();
          }
          player.trigger('resolutionchange');
        });
      return player;
    };

    /**
     * Returns grouped sources by label, resolution and type
     * @returns {Object} grouped sources: { label: { key: [] }, res: { key: [] }, type: { key: [] } }
     */
    player.getGroupedSrc = function (): object {
      return this.groupedSrc;
    };

    player.setSourcesSanitized = function (
      sources: Array<Src>,
      label: string,
      customSourcePicker: Function | null
    ) {
      this.currentResolutionState = {
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
     * Method used for sorting list of sources
     * @param   {Object} a - source object with res property
     * @param   {Object} b - source object with res property
     * @returns {Number} result of comparation
     */
    function compareResolutions(a: Src, b: Src): number {
      if (!a.res || !b.res) {
        return 0;
      }
      return parseInt(b.res) - parseInt(a.res);
    }

    /**
     * Group sources by label, resolution and type
     * @param   {Array}  src Array of sources
     * @returns {Object} grouped sources: { label: { key: [] }, res: { key: [] }, type: { key: [] } }
     */
    function bucketSources(src: Array<Src>): Resolution {
      let resolutions = {
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

    function initResolutionKey(resolutions: Resolution, key: string, source: Src) {
      if (resolutions[key as keyof Resolution][source[key as keyof Src]] == null)
        resolutions[key as keyof Resolution][source[key as keyof Src]] = [];
    }

    function appendSourceToKey(resolutions: Resolution, key: string, source: Src) {
      resolutions[key as keyof Resolution][source[key as keyof Src]].push(source);
    }

    /**
     * Choose src if option.default is specified
     * @param   {Object} groupedSrc {res: { key: [] }}
     * @param   {Array}  src Array of sources sorted by resolution used to find high and low res
     * @returns {Object} {res: string, sources: []}
     */
    function chooseSrc(groupedSrc: Resolution, src: Array<Src>): Chosen {
      let selectedRes = <string>settings['default']; //
      let selectedLabel = '';
      if (selectedRes === 'high') {
        selectedRes = src[0].res;
        selectedLabel = src[0].label;
      } else if (selectedRes === 'low' || selectedRes == null || !groupedSrc.res[selectedRes]) {
        // Select low-res if default is low or not set
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

    player.ready(function () {
      if (settings.ui) {
        const menuButton = new ResolutionMenuButton(player, settings);
        player.controlBar.resolutionSwitcher = player.controlBar.el_.insertBefore(
          menuButton.el_,
          player.controlBar.getChild('fullscreenToggle').el_
        );
        player.controlBar.resolutionSwitcher.dispose = function () {
          this.parentNode.removeChild(this);
        };
      }
      if (player.options_.sources.length > 1) {
        // tech: Html5 and Flash
        // Create resolution switcher for videos form <source> tag inside <video>
        player.updateSrc(player.options_.sources);
      }
    });
  };

  // register the plugin
  videojs.registerPlugin('videoJsResolutionSwitcher', videoJsResolutionSwitcher);
}
