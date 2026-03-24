import { Scene } from 'phaser';
import { C, T } from '../ui/designTokens';
import { fillRoundedPanel } from '../ui/drawRoundedRect';
import type { Subject } from '../data/questions';
import { MIN_BATTLE_SKILLS, getSolvedCount, getSolvedCountForSubject } from '../data/playerProgress';

interface ServerInfo {
    subject: Subject;
    title: string;
    blurb: string;
    accent: number;
}

/**
 * 서버(과목) 선택 — 입장 후 로비는 해당 과목 채널로 동작한다.
 */
export class IntroScene extends Scene
{
    constructor ()
    {
        super('IntroScene');
    }

    create ()
    {
        const { width } = this.scale;
        this.cameras.main.setBackgroundColor('#f4f6f9');

        const bg = this.add.graphics();
        bg.fillGradientStyle(C.page, C.page, 0xeff6ff, 0xf4f6f9, 1);
        bg.fillRect(0, 0, width, 960);

        this.add.text(width / 2, 52, '배틀런', { ...T.hero, fontSize: '26px' }).setOrigin(0.5);
        this.add.text(width / 2, 86, '입장할 학습 서버를 선택하세요', { ...T.body, fontSize: '15px' }).setOrigin(0.5);

        const total = getSolvedCount();
        this.add.text(width / 2, 112, `풀어둔 문제(스킬) ${total} / ${MIN_BATTLE_SKILLS} · 배틀은 ${MIN_BATTLE_SKILLS}개 이상 필요`, {
            ...T.caption,
            fontSize: '13px',
            color: total >= MIN_BATTLE_SKILLS ? '#059669' : '#b45309'
        }).setOrigin(0.5);

        const servers: ServerInfo[] = [
            { subject: '역사', title: '역사 서버', blurb: '한국사·세계사 복습 채널', accent: 0x2563eb },
            { subject: '수학', title: '수학 서버', blurb: '개념·풀이 감각 유지', accent: 0x7c3aed },
            { subject: '영어', title: '영어 서버', blurb: '어휘·문법·독해', accent: 0xdb2777 },
            { subject: '과학', title: '과학 서버', blurb: '통합과학 핵심', accent: 0x059669 },
            { subject: '자격증/상식', title: '상식·자격 서버', blurb: '직무·안전·상식', accent: 0xd97706 }
        ];

        let y = 148;
        servers.forEach((sv) =>
        {
            const solved = getSolvedCountForSubject(sv.subject);
            const card = this.add.graphics();
            fillRoundedPanel(card, 16, y, width - 32, 96, 14, C.surface, C.border, 1);

            this.add.rectangle(44, y + 48, 6, 56, sv.accent).setOrigin(0.5);

            this.add.text(64, y + 26, sv.title, { ...T.title, fontSize: '17px' });
            this.add.text(64, y + 50, sv.blurb, { ...T.caption, fontSize: '12px' });
            this.add.text(width - 28, y + 30, `${solved}문항`, { ...T.caption, fontSize: '12px' }).setOrigin(1, 0);

            const enter = this.add.rectangle(width - 88, y + 62, 100, 36, C.accent).setInteractive({ useHandCursor: true });
            this.add.text(width - 88, y + 62, '입장', T.button).setOrigin(0.5);
            enter.on('pointerover', () => enter.setFillStyle(C.accentHover));
            enter.on('pointerout', () => enter.setFillStyle(C.accent));
            enter.on('pointerdown', () =>
            {
                this.registry.set('currentSubject', sv.subject);
                this.cameras.main.fadeOut(160, 244, 246, 249);
                this.time.delayedCall(170, () => this.scene.start('LobbyScene', { subject: sv.subject }));
            });

            y += 108;
        });

        this.add.text(width / 2, y + 24, '서버마다 출제·보상 풀이 다릅니다. 학습으로 스킬을 모은 뒤 배틀에 참여하세요.', {
            ...T.caption,
            fontSize: '12px',
            align: 'center',
            wordWrap: { width: width - 40 }
        }).setOrigin(0.5);
    }
}
