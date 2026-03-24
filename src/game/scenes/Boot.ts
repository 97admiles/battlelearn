import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        // Boot 단계는 가능한 가볍게 유지한다.
        // 현재 프로토타입은 외부 이미지가 없어도 동작하도록 UI를 전부 도형/텍스트로 그린다.
        // 따라서 이곳에서는 별도 에셋을 로드하지 않는다.
    }

    create ()
    {
        // 다음 단계인 Preloader로 즉시 이동한다.
        this.scene.start('Preloader');
    }
}
