import { Boot } from './scenes/Boot';
import { AUTO, Game, Scale, Types } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { SplashScene } from './scenes/SplashScene';
import { IntroScene } from './scenes/IntroScene';
import { StudyScene } from './scenes/StudyScene';
import { LobbyScene } from './scenes/LobbyScene';
import { BattleScene } from './scenes/BattleScene';
import { ResultScene } from './scenes/ResultScene';
import { DeckScene } from './scenes/DeckScene';
import { QuestionInventoryScene } from './scenes/QuestionInventoryScene';
import { ShopScene } from './scenes/ShopScene';
import { PassScene } from './scenes/PassScene';

// Phaser 게임 전체 설정.
// Android 패키징을 염두에 두고 기본 해상도는 세로형 모바일 비율(540x960)로 고정한다.
// 실제 기기 화면에서는 FIT + CENTER_BOTH로 안전하게 비율을 유지한다.
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 540,
    height: 960,
    parent: 'game-container',
    backgroundColor: '#0b2240',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    // 사각형 HUD/UI 대비를 더 선명하게 유지하기 위해 픽셀 라운딩을 켠다.
    render: {
        pixelArt: true,
        roundPixels: true
    },
    // Scene 순서는 서비스 시연용 사용자 여정에 맞춰 구성한다.
    scene: [
        Boot,
        Preloader,
        SplashScene,
        IntroScene,
        StudyScene,
        LobbyScene,
        BattleScene,
        ResultScene,
        DeckScene,
        QuestionInventoryScene,
        ShopScene,
        PassScene
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

};

export default StartGame;
