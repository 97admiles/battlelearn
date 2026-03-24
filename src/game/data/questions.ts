/**
 * 전투 문제 데이터 타입.
 * 실제 서비스에서는 API 응답을 이 타입으로 매핑하면 바로 UI에 연결 가능하다.
 */
export type Difficulty = '초급' | '중급' | '심화' | '챌린지';
export type Subject = '역사' | '수학' | '영어' | '과학' | '자격증/상식';

export interface BattleQuestion {
    id: string;
    subject: Subject;
    difficulty: Difficulty;
    question: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
    rewardXp: number;
    rewardKnowledge: number;
    damage: number;
    risk: number;
}

/**
 * 총 12개 이상의 고품질 mock 문제.
 * 과목/난이도를 고르게 섞어 실제 학습 배틀 서비스의 콘텐츠 밀도를 보여준다.
 */
export const questionBank: BattleQuestion[] = [
    {
        id: 'HIS-201',
        subject: '역사',
        difficulty: '중급',
        question: '임진왜란 시기 행주대첩에서 권율 장군의 방어 전략과 가장 밀접한 요소는?',
        choices: ['수차를 활용한 야간 기동', '지형을 활용한 화력 집중 방어', '기병 중심 평지 유인', '해상 봉쇄 후 상륙전'],
        correctIndex: 1,
        explanation: '행주산성은 좁은 지형 이점을 활용해 화력과 방어를 집중한 대표 사례다.',
        rewardXp: 38,
        rewardKnowledge: 14,
        damage: 20,
        risk: 13
    },
    {
        id: 'HIS-302',
        subject: '역사',
        difficulty: '심화',
        question: '갑오개혁의 2차 개혁 시기에 추진된 정책으로 가장 적절한 것은?',
        choices: ['홍범 14조 공포', '신분제 폐지와 과거제 폐지', '한성판윤 직선제', '광무개혁의 회사령 반포'],
        correctIndex: 1,
        explanation: '2차 갑오개혁에서는 신분제·과거제 폐지 등 근대적 제도 정비가 핵심이었다.',
        rewardXp: 44,
        rewardKnowledge: 16,
        damage: 23,
        risk: 14
    },
    {
        id: 'MTH-203',
        subject: '수학',
        difficulty: '중급',
        question: '이차방정식 x^2 - 5x + 6 = 0의 해를 모두 고른 것은?',
        choices: ['x=2,3', 'x=-2,-3', 'x=1,6', 'x=0,5'],
        correctIndex: 0,
        explanation: '(x-2)(x-3)=0으로 인수분해하면 해는 2와 3이다.',
        rewardXp: 34,
        rewardKnowledge: 12,
        damage: 18,
        risk: 11
    },
    {
        id: 'MTH-311',
        subject: '수학',
        difficulty: '심화',
        question: '등비수열 3, 6, 12, ... 의 n번째 항 공식은?',
        choices: ['a_n=3n', 'a_n=3*2^(n-1)', 'a_n=6*2^n', 'a_n=3^n'],
        correctIndex: 1,
        explanation: '첫항 3, 공비 2인 등비수열의 일반항은 a_n=3*2^(n-1)이다.',
        rewardXp: 42,
        rewardKnowledge: 15,
        damage: 22,
        risk: 14
    },
    {
        id: 'ENG-104',
        subject: '영어',
        difficulty: '초급',
        question: '문맥상 가장 자연스러운 표현은? "She is good ___ solving logic puzzles."',
        choices: ['at', 'to', 'for', 'with'],
        correctIndex: 0,
        explanation: 'be good at + 동명사 형태를 사용한다.',
        rewardXp: 28,
        rewardKnowledge: 10,
        damage: 16,
        risk: 10
    },
    {
        id: 'ENG-330',
        subject: '영어',
        difficulty: '심화',
        question: '다음 문장에서 관계대명사 쓰임이 적절한 것은? "The theory ___ changed modern physics was first ignored."',
        choices: ['who', 'whom', 'which', 'whose'],
        correctIndex: 2,
        explanation: '선행사가 사물(theory)이므로 주격 관계대명사 which가 적절하다.',
        rewardXp: 46,
        rewardKnowledge: 17,
        damage: 24,
        risk: 15
    },
    {
        id: 'SCI-215',
        subject: '과학',
        difficulty: '중급',
        question: '광합성의 명반응에서 생성되는 에너지 전달 물질 조합은?',
        choices: ['ATP와 NADPH', 'ADP와 NADP+', 'ATP와 CO2', 'NADH와 O2'],
        correctIndex: 0,
        explanation: '명반응에서는 ATP와 NADPH가 생성되어 암반응에 사용된다.',
        rewardXp: 36,
        rewardKnowledge: 13,
        damage: 19,
        risk: 12
    },
    {
        id: 'SCI-341',
        subject: '과학',
        difficulty: '챌린지',
        question: '세포 호흡에서 전자전달계의 최종 전자 수용체는?',
        choices: ['포도당', '산소', 'NADH', 'ATP'],
        correctIndex: 1,
        explanation: '전자전달계에서 산소가 최종 전자 수용체로 작용해 물이 생성된다.',
        rewardXp: 52,
        rewardKnowledge: 20,
        damage: 28,
        risk: 18
    },
    {
        id: 'LIC-222',
        subject: '자격증/상식',
        difficulty: '중급',
        question: '위험성 평가의 우선순위 설정 원칙으로 가장 적절한 것은?',
        choices: ['발생 가능성만 고려', '중대성만 고려', '중대성·가능성을 종합 평가', '관리자 직감 우선'],
        correctIndex: 2,
        explanation: '위험성 평가는 중대성과 발생 가능성을 함께 고려해 우선순위를 정한다.',
        rewardXp: 37,
        rewardKnowledge: 14,
        damage: 20,
        risk: 13
    },
    {
        id: 'LIC-350',
        subject: '자격증/상식',
        difficulty: '챌린지',
        question: 'PDCA 사이클에서 "C" 단계의 핵심 활동은?',
        choices: ['표준화', '실행', '점검', '계획 수립'],
        correctIndex: 2,
        explanation: 'PDCA의 C(Check)는 수행 결과를 측정·검토하는 단계다.',
        rewardXp: 50,
        rewardKnowledge: 18,
        damage: 26,
        risk: 17
    },
    {
        id: 'HIS-120',
        subject: '역사',
        difficulty: '초급',
        question: '훈민정음 창제를 주도한 왕은?',
        choices: ['태종', '세종', '성종', '숙종'],
        correctIndex: 1,
        explanation: '훈민정음은 세종대왕이 창제하였다.',
        rewardXp: 24,
        rewardKnowledge: 9,
        damage: 14,
        risk: 9
    },
    {
        id: 'SCI-118',
        subject: '과학',
        difficulty: '초급',
        question: '물질이 고체에서 액체로 변하는 상태 변화는?',
        choices: ['응고', '기화', '융해', '승화'],
        correctIndex: 2,
        explanation: '고체→액체 변화는 융해이다.',
        rewardXp: 24,
        rewardKnowledge: 9,
        damage: 14,
        risk: 9
    },
    {
        id: 'HIS-410',
        subject: '역사',
        difficulty: '심화',
        question: '조선 후기 실학자 박지원이 『열하일기』에서 비판적으로 서술한 대상에 가장 가까운 것은?',
        choices: ['양반 중심의 과거 교육', '상공업의 발달', '서양의 군사 제도', '청나라 황실의 문화'],
        correctIndex: 0,
        explanation: '박지원은 북학론적 시각으로 양반 중심 질서와 현실과 동떨어진 학문을 날카롭게 비판했다.',
        rewardXp: 48,
        rewardKnowledge: 18,
        damage: 24,
        risk: 15
    },
    {
        id: 'MTH-420',
        subject: '수학',
        difficulty: '심화',
        question: '함수 f(x)=ln(x^2+1)의 도함수 f\'(x)는?',
        choices: ['2x/(x^2+1)', '1/(x^2+1)', '2x·ln(x^2+1)', '2/(x^2+1)'],
        correctIndex: 0,
        explanation: '연쇄법칙: d/dx ln(u)=u\'/u, 여기서 u=x^2+1이면 u\'=2x.',
        rewardXp: 46,
        rewardKnowledge: 17,
        damage: 23,
        risk: 15
    },
    {
        id: 'ENG-240',
        subject: '영어',
        difficulty: '중급',
        question: '빈칸에 들어갈 말로 가장 적절한 것은? "The committee reached a ___ on funding after hours of debate."',
        choices: ['consensus', 'collision', 'collision course', 'consequence'],
        correctIndex: 0,
        explanation: 'reach a consensus는 “합의에 도달하다”라는 고정 표현이다.',
        rewardXp: 36,
        rewardKnowledge: 13,
        damage: 19,
        risk: 12
    },
    {
        id: 'SCI-260',
        subject: '과학',
        difficulty: '중급',
        question: '뉴턴의 운동 제2법칙을 식으로 옳게 나타낸 것은? (F: 힘, m: 질량, a: 가속도)',
        choices: ['F = ma', 'F = m/a', 'F = m + a', 'F = m^2a'],
        correctIndex: 0,
        explanation: '가속도는 힘에 비례하고 질량에 반비례하므로 F=ma이다.',
        rewardXp: 34,
        rewardKnowledge: 12,
        damage: 18,
        risk: 11
    },
    {
        id: 'HIS-180',
        subject: '역사',
        difficulty: '중급',
        question: '고려 말·조선 초, 신흥 사대부 세력이 추구한 정치·사회 이념의 핵심은?',
        choices: ['불교 국교화', '유교적 질서와 실천 윤리', '무신 독재의 정당화', '해양 무역 독점'],
        correctIndex: 1,
        explanation: '성리학을 바탕으로 한 유교적 통치 질서와 실천 윤리가 조선 건국의 이념적 토대였다.',
        rewardXp: 38,
        rewardKnowledge: 14,
        damage: 20,
        risk: 13
    },
    {
        id: 'MTH-150',
        subject: '수학',
        difficulty: '초급',
        question: '한 직각삼각형에서 두 직각변이 3cm, 4cm일 때 빗변의 길이는?',
        choices: ['5cm', '6cm', '7cm', '12cm'],
        correctIndex: 0,
        explanation: '피타고라스 정리: 3²+4²=5².',
        rewardXp: 26,
        rewardKnowledge: 10,
        damage: 15,
        risk: 10
    },
    {
        id: 'SCI-290',
        subject: '과학',
        difficulty: '심화',
        question: 'DNA 복제 시 이끌쇠(프라이머)의 역할로 가장 적절한 것은?',
        choices: ['DNA 가닥을 절단한다', 'DNA 중합효소가 합성을 시작할 3\' 끝을 제공한다', 'RNA를 DNA로 바꾼다', '염기쌍을 수소 결합으로 안정화한다'],
        correctIndex: 1,
        explanation: '프라이머는 DNA 중합효소가 새 가닥을 연장할 수 있는 3\'-OH 끝을 제공한다.',
        rewardXp: 44,
        rewardKnowledge: 16,
        damage: 22,
        risk: 14
    },
    {
        id: 'LIC-280',
        subject: '자격증/상식',
        difficulty: '심화',
        question: '개인정보 처리 시 “최소 수집” 원칙에 부합하는 예는?',
        choices: ['서비스와 무관한 민감정보까지 사전 동의로 수집', '목적 달성에 필요한 최소한의 정보만 수집', '마케팅을 위해 보유 기간 없이 무제한 보관', '제3자 제공 시 별도 고지 없이 업체 관행에 따름'],
        correctIndex: 1,
        explanation: '목적에 필요한 최소 범위에서만 수집하는 것이 개인정보보호법의 기본 원칙이다.',
        rewardXp: 42,
        rewardKnowledge: 15,
        damage: 21,
        risk: 14
    },
    {
        id: 'ENG-160',
        subject: '영어',
        difficulty: '중급',
        question: '다음 중 문법적으로 옳은 문장은?',
        choices: ['Neither of the options are valid.', 'Neither of the options is valid.', 'Neither of the options be valid.', 'Neither of the options am valid.'],
        correctIndex: 1,
        explanation: 'Neither of + 복수명사 구조에서 동사는 단수(is)를 쓰는 것이 표준이다.',
        rewardXp: 35,
        rewardKnowledge: 13,
        damage: 18,
        risk: 12
    },
    {
        id: 'HIS-501',
        subject: '역사',
        difficulty: '초급',
        question: '조선 건국을 이끈 인물은?',
        choices: ['이성계', '세종', '연산군', '광해군'],
        correctIndex: 0,
        explanation: '이성계가 조선을 건국하였다.',
        rewardXp: 22,
        rewardKnowledge: 8,
        damage: 12,
        risk: 8
    },
    {
        id: 'MTH-501',
        subject: '수학',
        difficulty: '중급',
        question: 'log₂ 8의 값은?',
        choices: ['2', '3', '4', '8'],
        correctIndex: 1,
        explanation: '2³=8이므로 log₂8=3이다.',
        rewardXp: 32,
        rewardKnowledge: 11,
        damage: 17,
        risk: 11
    },
    {
        id: 'ENG-501',
        subject: '영어',
        difficulty: '초급',
        question: '다음 중 복수형이 맞는 것은?',
        choices: ['childs', 'children', 'childes', 'childrens'],
        correctIndex: 1,
        explanation: 'child의 불규칙 복수형은 children이다.',
        rewardXp: 24,
        rewardKnowledge: 9,
        damage: 14,
        risk: 9
    },
    {
        id: 'SCI-501',
        subject: '과학',
        difficulty: '중급',
        question: '지구 대기 중 비율이 가장 큰 기체는?',
        choices: ['산소', '질소', '이산화 탄소', '아르곤'],
        correctIndex: 1,
        explanation: '질소가 약 78%로 가장 많다.',
        rewardXp: 34,
        rewardKnowledge: 12,
        damage: 18,
        risk: 11
    },
    {
        id: 'LIC-501',
        subject: '자격증/상식',
        difficulty: '초급',
        question: '화재 시 엘리베터 이용이 위험한 이유로 적절한 것은?',
        choices: ['속도가 느려서', '정전 시 멈출 수 있어서', '공간이 좁아서', '소음이 커서'],
        correctIndex: 1,
        explanation: '정전·고장 시 승강로에 갇힐 위험이 크다.',
        rewardXp: 22,
        rewardKnowledge: 8,
        damage: 12,
        risk: 8
    },
    {
        id: 'HIS-502',
        subject: '역사',
        difficulty: '심화',
        question: '6·25 전쟁 당시 UN군의 주요 참전국이 아닌 것은?',
        choices: ['미국', '영국', '일본', '캐나다'],
        correctIndex: 2,
        explanation: '당시 일본은 UN군 파병국이 아니었다.',
        rewardXp: 44,
        rewardKnowledge: 16,
        damage: 22,
        risk: 14
    },
    {
        id: 'MTH-502',
        subject: '수학',
        difficulty: '심화',
        question: 'sin 30° + cos 60°의 값은?',
        choices: ['0.5', '1', '1.5', '√2'],
        correctIndex: 1,
        explanation: 'sin30°=0.5, cos60°=0.5이므로 합은 1이다.',
        rewardXp: 40,
        rewardKnowledge: 14,
        damage: 21,
        risk: 13
    },
    {
        id: 'SCI-502',
        subject: '과학',
        difficulty: '초급',
        question: '소리는 어떤 매질에서도 전파될 수 있을까?',
        choices: ['진공에서도 된다', '고체·액체·기체에서 된다', '기체에서만', '액체에서만'],
        correctIndex: 1,
        explanation: '소파체가 있어야 하므로 진공에서는 전파되지 않는다.',
        rewardXp: 24,
        rewardKnowledge: 9,
        damage: 14,
        risk: 9
    },
    {
        id: 'ENG-502',
        subject: '영어',
        difficulty: '심화',
        question: '가정법 과거 완료에 가장 가까운 문장은?',
        choices: ['If I was you, I would go.', 'If I had known, I would have helped.', 'If I know, I will help.', 'If I will go, I tell you.'],
        correctIndex: 1,
        explanation: '과거 사실과 반대인 가정에 과거완료+would have p.p. 조합이 쓰인다.',
        rewardXp: 44,
        rewardKnowledge: 16,
        damage: 23,
        risk: 14
    }
];

/** 난이도 → 등급 라벨 (수집·과시용) */
export function difficultyToGrade (difficulty: Difficulty): string
{
    switch (difficulty)
    {
        case '초급': return 'E';
        case '중급': return 'D';
        case '심화': return 'C';
        case '챌린지': return 'S';
        default: return '?';
    }
}

/** 난이도 티어 (1~4) — 데미지 배율 UI 등에 사용 */
export function difficultyTier (difficulty: Difficulty): number
{
    switch (difficulty)
    {
        case '초급': return 1;
        case '중급': return 2;
        case '심화': return 3;
        case '챌린지': return 4;
        default: return 1;
    }
}

/**
 * 해당 과목에서 푼 고유 문항 수 기준 학습 레벨(1~10).
 * 은행 난이도 밴드(초급~챌린지)를 좁히는 데 사용한다.
 */
export function learnerLevelFromSolvedInSubject (solvedInSubject: number): number
{
    return Math.max(1, Math.min(10, 1 + Math.floor(Math.max(0, solvedInSubject) / 3)));
}

export function difficultyBandForLevel (level: number): readonly Difficulty[]
{
    const L = Math.max(1, Math.min(10, level));
    if (L <= 2) return ['초급'];
    if (L <= 4) return ['초급', '중급'];
    if (L <= 6) return ['중급', '심화'];
    if (L <= 8) return ['중급', '심화', '챌린지'];
    return ['심화', '챌린지'];
}

export function bandLabelKo (band: readonly Difficulty[]): string
{
    if (band.length === 0) return '전체';
    if (band.length === 1) return band[0];
    return `${band[0]} ~ ${band[band.length - 1]}`;
}

/**
 * 학습 씬용 — 과목 + 이미 푼 ID + 해당 과목 누적 풀이 수로 난이도 밴드를 맞춘 뒤 출제.
 * 미해결 우선, 밴드에 문항이 없으면 과목 전체에서 선택.
 */
export function pickNextStudyQuestion (
    subject: Subject,
    solvedIds: Set<string>,
    solvedInSubject: number
): BattleQuestion
{
    const level = learnerLevelFromSolvedInSubject(solvedInSubject);
    const band = difficultyBandForLevel(level);
    let candidates = questionBank.filter(
        q => q.subject === subject && band.includes(q.difficulty)
    );
    if (candidates.length === 0)
    {
        candidates = questionBank.filter(q => q.subject === subject);
    }
    if (candidates.length === 0)
    {
        candidates = [...questionBank];
    }
    const unsolved = candidates.filter(q => !solvedIds.has(q.id));
    const pool = unsolved.length > 0 ? unsolved : candidates;
    return pool[Math.floor(Math.random() * pool.length)];
}

function shuffleCopy<T> (items: readonly T[]): T[]
{
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/** 배틀에서 라운드 순환용으로 전체 은행을 섞은 복사본을 만든다. */
export function createShuffledQuestionQueue (): BattleQuestion[]
{
    return shuffleCopy(questionBank);
}

/** 상대(방어) 턴용 — 선택한 서버(과목) 문제만 순환 */
export function createShuffledQuestionQueueForSubject (subject: Subject): BattleQuestion[]
{
    const list = questionBank.filter(q => q.subject === subject);
    if (list.length === 0) return shuffleCopy([...questionBank]);
    return shuffleCopy(list);
}

/**
 * 전투 1판용 문제 세트(레거시 씬 호환).
 * 신규 배틀은 `createShuffledQuestionQueue` + 순환 사용을 권장한다.
 */
export const battleQuestions: BattleQuestion[] = questionBank.slice(0, 5);
