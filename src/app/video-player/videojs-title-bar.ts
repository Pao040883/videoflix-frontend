import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';

export function registerTitleBar() {
  const Component = videojs.getComponent('Component') as any;

  class TitleBar extends Component {
    constructor(player: Player, options: any) {
      super(player, options);

      this['addClass']('vjs-custom-title');

      const span = document.createElement('span');
      span.className = 'vjs-custom-title-text';
      span.textContent = options.title || '';

      this['el_'].appendChild(span);
    }
  }

  videojs.registerComponent('TitleBar', TitleBar as any);
}
