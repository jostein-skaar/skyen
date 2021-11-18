export class Volumsene extends Phaser.Scene {
  bredde: number;
  hoyde: number;
  volumknapp: Phaser.GameObjects.Sprite;
  demp = false;

  constructor() {
    super({ key: 'volumsene' });
  }

  init() {
    this.bredde = this.game.scale.gameSize.width;
    this.hoyde = this.game.scale.gameSize.height;
    this.demp = localStorage.getItem('demp') === 'false' ? false : true;
    this.sound.mute = this.demp;

    // console.log('init()', b, h, this.bredde, this.hoyde);
    // this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
    //   this.bredde = this.game.scale.gameSize.width;
    //   this.hoyde = this.game.scale.gameSize.height;
    //   this.posisjoner();
    // });
  }

  preload() {
    this.load.spritesheet('volum', 'assets/volum.png', { frameWidth: 50, frameHeight: 50 });
  }

  create() {
    // console.log('I volumsene create()');
    this.volumknapp = this.add.sprite(0, 0, 'volum')
      .setScale(0.5)
      .setOrigin(0, 0)
      .setInteractive(new Phaser.Geom.Rectangle(-100, -100, 200, 200), Phaser.Geom.Rectangle.Contains)
      .on('pointerdown', () => this.toggleVolum());

    this.settRiktigVolumknapp();

    this.posisjoner();
  }

  private posisjoner() {
    this.volumknapp.setPosition(this.bredde - 45, 18);
  }

  private toggleVolum() {
    this.demp = !this.demp;
    this.sound.mute = this.demp;
    localStorage.setItem('demp', this.demp.toString());
    this.settRiktigVolumknapp();
  }

  private settRiktigVolumknapp() {
    if (this.demp) {
      this.volumknapp.setFrame(1);
    } else {
      this.volumknapp.setFrame(0);
    }
  }
}
