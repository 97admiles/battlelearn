export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type CardType = '공격형' | '방어형' | '복습형' | '서포트형';

export interface SkillCard {
    id: string;
    name: string;
    rarity: CardRarity;
    type: CardType;
    effect: string;
    condition: string;
    resourceCost: number;
    recommendedSubjects: string[];
    colorTheme: string;
}

export const skillCards: SkillCard[] = [
    { id: 'CARD-01', name: '개념 폭발', rarity: 'Epic', type: '공격형', effect: '정답 시 추가 피해 +8', condition: '연속 정답 2회', resourceCost: 3, recommendedSubjects: ['수학', '과학'], colorTheme: '#ff7d68' },
    { id: 'CARD-02', name: '기억 고정', rarity: 'Rare', type: '복습형', effect: '문제 설명 보상 +30%', condition: '전투 중 1회', resourceCost: 2, recommendedSubjects: ['영어', '역사'], colorTheme: '#5ecff7' },
    { id: 'CARD-03', name: '오답 반사', rarity: 'Epic', type: '방어형', effect: '오답 피해 40% 감소', condition: '오답 직후 자동', resourceCost: 3, recommendedSubjects: ['자격증/상식'], colorTheme: '#8ea2ff' },
    { id: 'CARD-04', name: '빠른 연산', rarity: 'Common', type: '공격형', effect: '수학 문제 정답 피해 +5', condition: '수학 과목 한정', resourceCost: 1, recommendedSubjects: ['수학'], colorTheme: '#7be0b7' },
    { id: 'CARD-05', name: '시대 통찰', rarity: 'Rare', type: '서포트형', effect: '역사 문제 오답 위험 -3', condition: '역사 문제 시작 시', resourceCost: 2, recommendedSubjects: ['역사'], colorTheme: '#f4b66e' },
    { id: 'CARD-06', name: '핵심 문맥 추적', rarity: 'Legendary', type: '서포트형', effect: '영어 문제 보기 제거 1개', condition: '전투당 1회', resourceCost: 4, recommendedSubjects: ['영어'], colorTheme: '#d38fff' },
    { id: 'CARD-07', name: '빈칸 섬광', rarity: 'Rare', type: '공격형', effect: '정답 시 지식 포인트 +12', condition: '초급/중급 문제', resourceCost: 2, recommendedSubjects: ['영어', '과학'], colorTheme: '#79f1ea' },
    { id: 'CARD-08', name: '복습 축적', rarity: 'Common', type: '복습형', effect: '전투 종료 후 복습 포인트 +20%', condition: '항상 적용', resourceCost: 1, recommendedSubjects: ['전체'], colorTheme: '#6adf95' },
    { id: 'CARD-09', name: 'AI 추천 전개', rarity: 'Legendary', type: '서포트형', effect: '현재 문제 추천 보기 힌트 제공', condition: '전투당 1회', resourceCost: 5, recommendedSubjects: ['전체'], colorTheme: '#69a4ff' }
];

export const equippedDeckIds = ['CARD-01', 'CARD-03', 'CARD-05', 'CARD-08', 'CARD-09'];
