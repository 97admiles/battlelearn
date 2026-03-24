export interface ShopItem {
    id: string;
    name: string;
    description: string;
    priceLabel: string;
    banner: string;
    limited: boolean;
    recommendedTag: string;
}

export const shopItems: ShopItem[] = [
    { id: 'SHOP-1', name: '젬 팩 80', description: '빠른 카드 강화와 즉시 뽑기용 기본 패키지', priceLabel: '₩1,200', banner: '첫 구매 보너스 +40%', limited: false, recommendedTag: '입문 추천' },
    { id: 'SHOP-2', name: '에너지 충전 키트', description: '에너지 120 + 배틀 티켓 3장', priceLabel: '₩5,900', banner: '학습 집중 타임 패키지', limited: false, recommendedTag: '학습 부스터' },
    { id: 'SHOP-3', name: '카드 소환권 10+1', description: '고급 스킬카드 획득 확률 증가', priceLabel: '₩12,000', banner: '이번 주 추천 번들', limited: true, recommendedTag: '확률 UP' },
    { id: 'SHOP-4', name: '복습 부스터 7일', description: '복습 포인트 획득량 +35%', priceLabel: '₩5,900', banner: '복습 효율 강화', limited: false, recommendedTag: '효율형' },
    { id: 'SHOP-5', name: '시즌 패스 업그레이드', description: '프리미엄 트랙 즉시 해금 + 보상 10단계 점프', priceLabel: '₩29,000', banner: '한정 스타터 패키지', limited: true, recommendedTag: '핵심 상품' }
];
