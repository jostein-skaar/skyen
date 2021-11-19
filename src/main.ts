import Phaser from 'phaser';
import { Skysene } from './sener/skysene';
import { Tapssene } from './sener/tapssene';
import { Velkomstsene } from './sener/velkomstsene';
import { Volumsene } from './sener/volumsene';
import './style.css';

let erDebug = true;
erDebug = false;

let hackForIos = Date.now();
let omstartVedResizeTimeout: any;
const erIos = /iPad|iPhone|iPod/.test(navigator.userAgent);

// @ts-ignore
const [bredde, hoyde, vinduBredde, vinduHoyde, skaleringsmetode] = beregnDimensjon();
const phaserGame = new Phaser.Game(lagKonfigurasjon(bredde, hoyde, skaleringsmetode, erDebug));

window.onresize = () => {
  if (erIos && Date.now() - hackForIos < 1000) {
    return;
  }

  clearTimeout(omstartVedResizeTimeout);
  omstartVedResizeTimeout = setTimeout(() => {
    if (phaserGame) {
      phaserGame.destroy(true);
    }
    document.location.reload();
  }, 200);
};

function lagKonfigurasjon(
  bredde: number,
  hoyde: number,
  skaleringsmetode: Phaser.Scale.ScaleModes,
  erDebug: boolean
): Phaser.Types.Core.GameConfig {
  const konfigurasjon = {
    type: Phaser.AUTO,
    // resolution: 2,
    width: bredde,
    height: hoyde,
    scene: [Velkomstsene, Volumsene, Skysene, Tapssene],
    parent: 'spillkonteiner',
    dom: {
      createContainer: true,
    },
    backgroundColor: 0x87ceeb,
    autoFocus: true,
    pixelArt: false,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: erDebug,
      },
    },

    scale: {
      // Vi har denne som FIT først, for da vil canvas.style.width og .height settes automatisk.
      // Må fjernes etterpå, ellers vil rare ting skje i forbindelse med resize.
      mode: skaleringsmetode,
      // mode: Phaser.Scale.ScaleModes.NONE,
      // mode: Phaser.Scale.ScaleModes.FIT,
      // min: {
      //   width: 400,
      //   height: 800,
      // },
      // max: {
      //   width: 1024,
      //   height: 800,
      // },
      autoCenter: Phaser.Scale.Center.CENTER_BOTH,
      // autoCenter: Phaser.Scale.Center.CENTER_HORIZONTALLY,
      // expandParent: true
    },
  };

  return konfigurasjon;
}

function beregnDimensjon(): [number, number, number, number, Phaser.Scale.ScaleModes] {
  // Dette spillet er basert på at høyden må være lik for alle.
  // Det gir kanskje en liten fordel å ha større bredde, men det viktigste er at hoyden alltid er lik.
  // Det oppnås ved å man bruke FIT når høyden er mindre enn ønsket høyde.

  const vinduBredde = window.innerWidth;
  const vinduHoyde = window.innerHeight;

  const hoyde = 800;

  const brekkpunktLitenDings = 1024;

  // iPad:
  // 768 - 20 (status bar)
  // height: 748,
  // width: 1024,

  let bredde = 0;

  let skaleringsmetode: Phaser.Scale.ScaleModes = Phaser.Scale.ScaleModes.NONE;

  if (vinduHoyde <= brekkpunktLitenDings) {
    console.log('vinduHoyde <= brekkpunktLitenDings. Må ha FIT.');
    bredde = (vinduBredde / vinduHoyde) * hoyde;
    console.log('hoyde og bredde når viduHøyde < minsteHoyde', bredde, hoyde);
    skaleringsmetode = Phaser.Scale.ScaleModes.FIT;
  } else {
    bredde = 1024;
    // skaleringsmetode = Phaser.Scale.ScaleModes.FIT;
  }

  if (bredde > vinduBredde) {
    skaleringsmetode = Phaser.Scale.ScaleModes.FIT;
  }

  // hoyde = 800;
  // bredde = (vinduBredde / vinduHoyde) * hoyde;

  console.table({ vindu: [vinduBredde, vinduHoyde], beregnet: [bredde, hoyde] });
  console.log('skaleringsmetode', skaleringsmetode);
  return [bredde, hoyde, vinduBredde, vinduHoyde, skaleringsmetode];
}
