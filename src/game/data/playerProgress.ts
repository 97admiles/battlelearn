import { questionBank } from './questions';
import type { BattleQuestion, Subject } from './questions';

const STORAGE_KEY = 'battlelearn_solved_question_ids_v1';

/** 배틀 참가: 풀어둔 고유 문제(스킬) 최소 개수 */
export const MIN_BATTLE_SKILLS = 30;

function loadIds (): Set<string>
{
    try
    {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Set();
        const arr = JSON.parse(raw) as string[];
        return new Set(Array.isArray(arr) ? arr : []);
    }
    catch
    {
        return new Set();
    }
}

function saveIds (ids: Set<string>): void
{
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function getSolvedQuestionIds (): Set<string>
{
    return loadIds();
}

export function getSolvedCount (): number
{
    return loadIds().size;
}

export function isQuestionSolved (questionId: string): boolean
{
    return loadIds().has(questionId);
}

/** 학습에서 정답 시 호출 — 같은 문제는 한 번만 카운트 */
export function markQuestionSolved (questionId: string): void
{
    const ids = loadIds();
    if (ids.has(questionId)) return;
    ids.add(questionId);
    saveIds(ids);
}

export function canEnterBattle (): boolean
{
    return getSolvedCount() >= MIN_BATTLE_SKILLS;
}

/** 해당 과목(서버)에서 풀어둔 문제만 배틀 공격 스킬로 사용 */
export function getAttackDeckForSubject (subject: Subject): BattleQuestion[]
{
    const ids = loadIds();
    return questionBank.filter(q => q.subject === subject && ids.has(q.id));
}

export function getSolvedCountForSubject (subject: Subject): number
{
    const ids = loadIds();
    return questionBank.filter(q => q.subject === subject && ids.has(q.id)).length;
}

/**
 * 테스트 편의: 특정 서버 과목 우선으로 스킬을 최소 개수까지 채운다.
 * 실제 서비스에서는 제거하거나 관리자 전용으로 분리한다.
 */
export function grantTestSkillsForSubject (subject: Subject, minCount: number = MIN_BATTLE_SKILLS): number
{
    const ids = loadIds();
    const current = ids.size;
    if (current >= minCount) return current;

    const ordered = [
        ...questionBank.filter(q => q.subject === subject),
        ...questionBank.filter(q => q.subject !== subject)
    ];

    for (const q of ordered)
    {
        ids.add(q.id);
        if (ids.size >= minCount) break;
    }
    saveIds(ids);
    return ids.size;
}
