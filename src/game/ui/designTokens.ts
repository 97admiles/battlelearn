/**
 * BattleLearn UI 토큰 — 교육 앱을 기준으로 한 “차분한 프리미엄” 톤.
 * 게임 요소는 액센트·진행·보상에만 제한적으로 사용한다.
 *
 * 참고: Phaser Graphics/Rectangle은 숫자 색(0xRRGGBB)을 사용한다.
 */
export const C = {
    /** 페이지 배경 (밝은 쿨 그레이) */
    page: 0xf4f6f9,
    /** 카드/표면 */
    surface: 0xffffff,
    /** 얇은 구분선 */
    border: 0xe2e6ee,
    /** 강조 테두리 */
    borderStrong: 0xcdd4e0,
    /** 본문 텍스트 */
    text: 0x1c2333,
    /** 보조 텍스트 */
    textSecondary: 0x5a6472,
    /** 캡션 */
    textMuted: 0x8b939e,
    /** 주 액션 (교육 앱에서 흔한 차분한 블루) */
    accent: 0x2563eb,
    accentHover: 0x1d4ed8,
    /** 액센트 배경 (버튼 위 힌트 영역 등) */
    accentSoft: 0xeff6ff,
    /** 긍정/완료 */
    success: 0x059669,
    successSoft: 0xecfdf5,
    /** 보조 액션 (테두리 버튼) */
    neutralButton: 0xf8fafc,
    /** 배틀 전용 — 살짝 더 어두운 캔버스 (게임 구역만) */
    battleCanvas: 0x1e293b,
    battleSurface: 0x334155
} as const;

/** UI 전역 폰트 — index.html에서 Noto Sans KR 로드 */
export const FONT_UI = '"Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';

/** 텍스트 스타일 — 제목은 Bold, 본문은 Regular로 위계를 둔다. */
export const T = {
    hero: { fontFamily: FONT_UI, fontSize: '28px', color: '#1c2333', fontStyle: 'bold' },
    title: { fontFamily: FONT_UI, fontSize: '20px', color: '#1c2333', fontStyle: 'bold' },
    body: { fontFamily: FONT_UI, fontSize: '15px', color: '#5a6472' },
    caption: { fontFamily: FONT_UI, fontSize: '13px', color: '#8b939e' },
    label: { fontFamily: FONT_UI, fontSize: '12px', color: '#8b939e' },
    button: { fontFamily: FONT_UI, fontSize: '16px', color: '#ffffff', fontStyle: 'bold' },
    buttonSecondary: { fontFamily: FONT_UI, fontSize: '15px', color: '#2563eb', fontStyle: 'bold' }
} as const;
