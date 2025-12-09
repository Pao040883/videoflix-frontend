import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import type Component from 'video.js/dist/types/component';

export function registerCustomControlBar() {
  const BaseControlBar = videojs.getComponent('ControlBar') as unknown as {
    new(player: Player, options: any): Component;
  };

  class CustomControlBar extends BaseControlBar {
    constructor(player: Player, options: any) {
      super(player, options);
      this['addClass']('vjs-custom-control-bar');

      // DOM-Struktur für 2-zeilige ControlBar
      const rowTop = document.createElement('div');
      rowTop.className = 'vjs-row vjs-row-top';

      const progress = document.createElement('div');
      progress.className = 'vjs-progress-container';

      const remaining = document.createElement('div');
      remaining.className = 'vjs-remaining-time';

      rowTop.append(progress, remaining);

      const rowBottom = document.createElement('div');
      rowBottom.className = 'vjs-row vjs-row-bottom';

      const left = document.createElement('div');
      left.className = 'vjs-left-controls';

      const title = document.createElement('div');
      title.className = 'vjs-title';

      const right = document.createElement('div');
      right.className = 'vjs-right-controls';

      rowBottom.append(left, title, right);

      this['el_'].append(rowTop, rowBottom);

      // Controls von der Original-ControlBar in unser Layout verschieben
      this.attach('.vjs-progress-container', 'progressControl');
      this.attach('.vjs-remaining-time', 'remainingTimeDisplay');

      this.attach('.vjs-left-controls', 'playToggle');
      // skipBackward/skipForward NICHT mehr verwenden
      this.attach('.vjs-left-controls', 'volumePanel');

      this.attach('.vjs-title', 'TitleBar');

      this.attach('.vjs-right-controls', 'playbackRateMenuButton');
      this.attach('.vjs-right-controls', 'fullscreenToggle');
    }

    attach(selector: string, componentName: string) {
      const target = this['el_'].querySelector(selector);
      const controlBar = this['player_'].getChild('controlBar');
      const child = controlBar?.getChild(componentName);

      if (child && target) {
        target.appendChild(child['el_']);
      }
    }
  }

  videojs.registerComponent('CustomControlBar', CustomControlBar as any);
}
