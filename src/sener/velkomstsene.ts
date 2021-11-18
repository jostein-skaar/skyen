export class Velkomstsene extends Phaser.Scene {
  bredde: number;
  hoyde: number;
  logoKonteiner: Phaser.GameObjects.Container;
  spillernavn: string | null = localStorage.getItem('spillernavn');
  toppresultatServer: number;

  constructor() {
    super({ key: 'velkomstsene' });
  }

  init() {
    const b = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.bredde = this.game.scale.gameSize.width;
    this.hoyde = this.game.scale.gameSize.height;

    console.log('init()', b, h, this.bredde, this.hoyde);
    // this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {

    //   this.bredde = gameSize.width;
    //   this.hoyde = gameSize.height;
    //   // console.log('I resize får vi: ', this.bredde, this.hoyde);
    //   this.posisjoner();
    // });

    // La oss alltid ha volumknappen liggene framme.
    if (!this.scene.isActive('volumsene')) {
      this.scene.launch('volumsene');
      this.scene.bringToTop('volumsene');
    }
  }

  preload() {
    this.load.image('skybil-med-tekst', 'assets/skybil-med-tekst.png');
  }

  create() {
    console.log('velkomstsene create()');

    const skybil = this.add
      .image(0, 0, 'skybil-med-tekst')
      .setInteractive()
      .once('pointerdown', () => this.startNyttSpill());
    const maksBredde = this.bredde * 0.8;
    if (skybil.width > maksBredde) {
      const skalering = maksBredde / skybil.width;
      // console.log('Skalerer skybil: ', skalering);
      skybil.setScale(skalering);
    }

    const startTekst = this.add
      .text(0, 200, 'Trykk på skyen for å starte spillet', { fontFamily: 'arial', fontSize: '20px', fill: '#000', align: 'center' })
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .once('pointerdown', () => this.startNyttSpill());

    // const versjonTekst = this.add
    //   .text(0, 225, 'Versjon {VERSJON}', { fontFamily: 'arial', fontSize: '14px', fill: '#000', align: 'center' })
    //   .setOrigin(0.5, 0.5);

    this.logoKonteiner = this.add.container(0, 0, [skybil, startTekst]); //, versjonTekst]);

    this.posisjoner();
  }

  private posisjoner() {
    const posisjonX = this.bredde / 2;
    const posisjonY = this.hoyde / 2 - 75;

    this.logoKonteiner.setPosition(posisjonX, posisjonY);
  }

  private startNyttSpill() {
    this.scene.sleep();
    this.scene.start('skysene', { spillernavn: this.spillernavn, toppresultatServer: this.toppresultatServer });
  }
}
