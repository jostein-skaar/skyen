export class Tapssene extends Phaser.Scene {
  bredde: number;
  hoyde: number;
  forrigeResultat: number;

  constructor() {
    super({ key: 'tapssene' });
  }

  init(data: any) {
    this.bredde = this.game.scale.gameSize.width;
    this.hoyde = this.game.scale.gameSize.height;
    this.forrigeResultat = data.resultat;
  }

  create() {
    const tekst = `Du klarte ${this.forrigeResultat}\nTrykk for å prøve igjen`;
    this.add
      .text(this.bredde / 2, this.hoyde / 2, tekst, {
        fontFamily: 'arial',
        fontSize: '20px',
        color: '#000',
        align: 'center',
        backgroundColor: '#87ceeb',
        padding: { x: 5, y: 5 },
      })
      .setOrigin(0.5, 0.5);

    const gaTilVelkomstseneTimeout = setTimeout(() => {
      this.scene.setVisible(false, 'skysene');
      this.scene.start('velkomstsene');
    }, 10000);

    setTimeout(() => {
      this.input.once('pointerdown', () => {
        clearTimeout(gaTilVelkomstseneTimeout);
        this.scene.start('skysene');
      });
    }, 500);
  }
}
