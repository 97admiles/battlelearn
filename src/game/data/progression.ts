export interface PassReward {
    level: number;
    freeReward: string;
    premiumReward: string;
}

export const seasonInfo = {
    seasonName: '시즌 3: 기억의 균열',
    currentLevel: 12,
    maxLevel: 30,
    nextRewardPreview: 'Epic 카드 조각 x30'
};

export const passRewards: PassReward[] = [
    { level: 1, freeReward: '골드 x500', premiumReward: '젬 x80' },
    { level: 2, freeReward: '에너지 x30', premiumReward: '카드 소환권 x1' },
    { level: 3, freeReward: '복습 포인트 x60', premiumReward: 'Rare 카드 조각 x20' },
    { level: 4, freeReward: '골드 x700', premiumReward: '젬 x120' },
    { level: 5, freeReward: '카드 조각 x15', premiumReward: 'Epic 카드 조각 x15' }
];

export const attendanceRewards = [
    'DAY1 골드 x300',
    'DAY2 에너지 x20',
    'DAY3 젬 x40',
    'DAY4 카드 소환권 x1',
    'DAY5 복습 부스터 1일',
    'DAY6 골드 x1200',
    'DAY7 Legendary 카드 조각 x10'
];
