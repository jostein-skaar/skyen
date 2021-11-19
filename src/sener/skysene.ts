export class Skysene extends Phaser.Scene {
  spillernavn: string;
  bredde: number;
  hoyde: number;
  forrigeResultat = 0;
  resultat = 0;
  toppresultat = 0;
  toppresultatServer = 0;
  // skybil: Phaser.Physics.Arcade.Sprite;
  skybilRoyk: Phaser.GameObjects.Sprite;
  skybilRoykTeller = 0;
  skybilKonteiner: Phaser.GameObjects.Container;
  ballonggruppe: Phaser.Physics.Arcade.Group;
  resultattekst: Phaser.GameObjects.Text;
  startfart = 200;
  fartsokningPerBallong = 5;
  fart = this.startfart;

  innstillinger = {
    tyngekraftSkybil: 900,
    flykraft: 400,
    avstandMellomballonger: 200,
    maksHoydeAvstandMellomToballonger: 100,
    antallballonger: 8,
    nokkelLagring: 'skyen-toppresultat',
    startX: 150,
  };

  lydeffekter: any = {};

  constructor() {
    super({ key: 'skysene' });
  }

  init(data: any) {
    this.bredde = this.game.scale.gameSize.width;
    this.hoyde = this.game.scale.gameSize.height;
    this.innstillinger.antallballonger = Math.ceil(this.bredde / this.innstillinger.avstandMellomballonger);
    // Hvis vi stående og veldig avlang, kan det bli nødvendig å skyve skybilen vår litt mot venstre.
    if (this.hoyde / this.bredde > 2 || this.bredde < 400) {
      this.innstillinger.startX = 70;
    }
    this.sound.volume = 0.25;
    if (data.spillernavn) {
      this.spillernavn = data.spillernavn;
    }
    if (data.toppresultatServer) {
      this.toppresultatServer = data.toppresultatServer;
    }
  }

  preload() {
    this.load.spritesheet('skybil', 'assets/skybil-sprite.png', { frameWidth: 332, frameHeight: 150 });
    this.load.image('ballong', 'assets/ballong.png');
    this.load.audioSprite('lydeffekter', 'assets/lydeffekter.json');

    const tempToppresultat = localStorage.getItem(this.innstillinger.nokkelLagring);
    this.toppresultat = tempToppresultat === null ? 0 : +tempToppresultat;
  }

  create() {
    this.sound.addAudioSprite('lydeffekter');
    this.lydeffekter.poeng = () => {
      this.sound.playAudioSprite('lydeffekter', 'smb_coin', { volume: 0.3 });
    };
    this.lydeffekter.motor = () => {
      this.sound.playAudioSprite('lydeffekter', 'engine4-kort');
    };
    this.lydeffekter.tap = () => {
      this.sound.playAudioSprite('lydeffekter', 'smb_bowserfalls');
    };

    const skybilSprite: Phaser.GameObjects.Sprite = this.add.sprite(0, 0, 'skybil');
    this.skybilRoyk = this.add.sprite(0, 0, 'skybil', 2);
    this.skybilRoyk.visible = false;
    this.skybilKonteiner = this.add.container(this.innstillinger.startX, this.hoyde / 2, [skybilSprite, this.skybilRoyk]);

    this.anims.create({
      key: 'styreanimasjon',
      frames: this.anims.generateFrameNumbers('skybil', { frames: [0, 1] }),
      frameRate: 5,
      repeat: -1,
    });

    skybilSprite.anims.play('styreanimasjon');

    this.skybilKonteiner.setScale(0.6);
    // .setSize(200, 100);

    this.physics.add.existing(this.skybilKonteiner);

    const skybilKropp = this.skybilKonteiner.body as Phaser.Physics.Arcade.Body;
    skybilKropp
      .setGravityY(this.innstillinger.tyngekraftSkybil)
      // .setCollideWorldBounds(true)
      .setSize(200, 100)
      .setOffset(-50, -30)
      .setBounce(0, 0.3);

    this.input.on('pointerdown', () => this.fly());

    this.ballonggruppe = this.physics.add.group();
    let forrigeX = this.skybilKonteiner.x + 100;
    let forrigeY = this.hoyde / 2;

    for (let i = 0; i < this.innstillinger.antallballonger; i++) {
      const [x, y] = this.lagGanskeTilfeldigXY(forrigeX, forrigeY);
      this.ballonggruppe.create(x, y, 'ballong');
      forrigeX = x;
      forrigeY = y;
    }

    this.ballonggruppe.setVelocityX(-this.fart);
    this.ballonggruppe.setVelocityY(-25);

    this.physics.add.overlap(
      this.skybilKonteiner,
      this.ballonggruppe,
      // @ts-ignore
      (skybil: Phaser.GameObjects.Container, ballong: Phaser.Physics.Arcade.Sprite) => {
        ballong.disableBody(true, true);

        this.lydeffekter.poeng();

        const [storsteX, tilhorendeY] = this.finnStorsteXOgTilhorendeYBlantballonger();
        const [x, y] = this.lagGanskeTilfeldigXY(storsteX, tilhorendeY);
        ballong.enableBody(true, x, y, true, true);
        this.fart += this.fartsokningPerBallong;
        // console.log('fart:', this.fart);
        this.ballonggruppe.setVelocityX(-this.fart);

        this.resultat += 1;
        this.resultattekst.setText(this.hentResultattekst());
      }
    );

    this.resultattekst = this.add.text(15, 20, this.hentResultattekst(), { fontFamily: 'arial', fontSize: '20px', fill: '#000' });
  }

  update() {
    // if (this.skybil.y > this.hoyde || this.skybil.y < 0) {
    //   this.tap();
    // }

    // @ts-ignore
    this.ballonggruppe.children.iterate((ballong: Phaser.Physics.Arcade.Sprite) => {
      if (ballong.x < 0) {
        this.tap();
      }
    });

    if (this.skybilRoykTeller > 10) {
      this.skybilRoyk.visible = false;
      this.skybilRoykTeller = 0;
    }
    this.skybilRoykTeller++;
  }

  finnStorsteXOgTilhorendeYBlantballonger(): number[] {
    let storstX = 0;
    let tilhorendeY = 0;
    // @ts-ignore
    this.ballonggruppe.children.iterate((ballong: Phaser.Physics.Arcade.Sprite) => {
      if (ballong.x > storstX) {
        storstX = ballong.x;
        tilhorendeY = ballong.y;
      }
    });
    return [storstX, tilhorendeY];
  }

  private lagGanskeTilfeldigXY(forrigeX: number, forrigeY: number): number[] {
    const x = forrigeX + this.innstillinger.avstandMellomballonger;
    let y = 0;
    do {
      y = Phaser.Math.Between(50, this.hoyde - 50);
      // console.log('Forksjell:', Math.abs(y - forrigeY));
    } while (Math.abs(y - forrigeY) > this.innstillinger.maksHoydeAvstandMellomToballonger);

    return [x, y];
  }

  private fly() {
    this.lydeffekter.motor();
    (this.skybilKonteiner.body as Phaser.Physics.Arcade.Body).setVelocityY(-this.innstillinger.flykraft);
    this.skybilRoyk.visible = true;
    this.skybilRoykTeller = 0;
  }

  private tap() {
    this.lydeffekter.tap();
    this.scene.pause();
    this.cameras.main.setBackgroundColor(0xbababa);
    this.cameras.main.setAlpha(0.5);

    this.forrigeResultat = this.resultat;
    this.toppresultat = Math.max(this.resultat, this.toppresultat);
    if (this.toppresultat > this.toppresultatServer) {
      this.toppresultatServer = this.toppresultat;
    }
    localStorage.setItem(this.innstillinger.nokkelLagring, this.toppresultat.toString());
    this.resultattekst.setText(this.hentResultattekst());

    this.lagreResultat(this.resultat);

    this.scene.launch('tapssene', { resultat: this.resultat });

    this.resultat = 0;
    this.fart = this.startfart;

    console.log('Ferdig i tap().');
  }

  private hentResultattekst(): string {
    let tekst = `Ballonger: ${this.resultat}`;
    if (this.toppresultat > 0) {
      tekst += `\nRekord: ${this.toppresultat}`;
    }
    if (this.forrigeResultat > 0) {
      tekst += `\nForrige forsøk: ${this.forrigeResultat}`;
    }
    return tekst;
  }

  private async lagreResultat(antall: number) {
    if (antall === 0) {
      console.log('Gidder ikke lagre når det ble 0 poeng.');
      return;
    }
    const navn = this.spillernavn ? this.spillernavn : 'Anonym';

    const entitet = {
      Navn: navn,
      Antall: antall,
      Logg: `Poeng ${antall}`,
    };

    console.log('Skal sende:', entitet);

    // const response = await fetch('/api/lagre-poeng', {
    //   method: 'POST',

    //   body: JSON.stringify(entitet),
    //   headers: { 'Content-Type': 'application/json' }
    // });

    // if (!response.ok) {
    //   console.warn('Lagring av poeng gikk ikke bra...');
    // } else {
    //   console.log('Lagring av poeng gikk så bra atte...');

    // }
  }
}
