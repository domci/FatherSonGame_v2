import { describe, expect, it } from 'vitest';
import { checkRules } from './chat-rules';
import { readGuard, aiModerator, rulesOnly, type Moderator } from './moderation';
import { canRead, RoomChat } from './room-chat';
import { createOnlineWorld } from '../src/sim/online';
import { setRelation } from '../src/sim/relations';

const me = { side: 'player' as const, name: 'Roter Falke 1', chatBanUntil: 0 };

describe('chat checks (M7)', () => {
  it('blocks insults, numbers, links and real-life contact', () => {
    expect(checkRules('Gut gemacht, wollen wir Frieden?')).toBeUndefined();
    expect(checkRules('du bist ein 1d1ot')?.strike).toBe(true);
    expect(checkRules('ruf an 0171 2345678')?.text).toContain('Nummern');
    expect(checkRules('schau www.example.com')?.text).toContain('Links');
    expect(checkRules('Wo wohnst du?')?.text).toContain('echten Daten');
    expect(checkRules('   ')?.strike).toBe(false);
    expect(checkRules('x'.repeat(500))?.strike).toBe(false);
  });

  it('reads the answers of the AI check (and fails closed)', async () => {
    expect(readGuard({ response: 'safe' })).toBe('ok');
    expect(readGuard({ response: '\n\nunsafe\nS10' })).toBe('blocked');
    expect(readGuard({ response: { safe: false, categories: ['S1'] } })).toBe('blocked');
    expect(readGuard({})).toBe('unavailable');
    expect(await aiModerator(undefined).check('hi')).toBe('unavailable');
    const broken = { run: () => Promise.reject(new Error('quota')) };
    expect(await aiModerator(broken).check('hi')).toBe('unavailable');
    const fine = { run: () => Promise.resolve({ response: 'safe' }) };
    expect(await aiModerator(fine).check('hi')).toBe('ok');
  });

  it('sends ready-made messages always, free text only after the checks', async () => {
    const blocked: Moderator = { check: () => Promise.resolve('blocked') };
    const chat = new RoomChat(blocked, () => 100);
    const quick = await chat.post({ ...me, chatBanUntil: 999 }, { kind: 'world' }, { quick: 0 });
    expect(quick.ok && quick.line.text).toBe('Hallo!');
    const bad = await chat.post(me, { kind: 'world' }, { text: 'Hallo zusammen' });
    expect(bad).toEqual({ ok: false, strike: true, text: 'Diese Nachricht ist nicht erlaubt.' });
    const paused = await chat.post(
      { ...me, chatBanUntil: 200_000 },
      { kind: 'world' },
      { text: 'hi' },
    );
    expect(!paused.ok && paused.text).toContain('Chat-Pause');
    const ok = await new RoomChat(rulesOnly, () => 100).post(
      me,
      { kind: 'world' },
      { text: 'Hallo zusammen' },
    );
    expect(ok.ok).toBe(true);
  });

  it('shows ally and private lines only to the right people', async () => {
    const s = createOnlineWorld({
      seed: 1,
      time: 0,
      faction: 'human',
      name: 'A',
      difficulty: 'easy',
      computers: 1,
      people: 3,
    });
    const chat = new RoomChat(rulesOnly, () => 1);
    const r = await chat.post(me, { kind: 'allies' }, { quick: 1 });
    if (!r.ok) throw new Error('not sent');
    expect(canRead(s, 'ai2', r.line)).toBe(false);
    setRelation(s, 'player', 'ai2', 'alliance');
    expect(canRead(s, 'ai2', r.line)).toBe(true);
    const dm = await chat.post(me, { kind: 'side', side: 'ai3' }, { quick: 2 });
    if (!dm.ok) throw new Error('not sent');
    expect(canRead(s, 'ai3', dm.line)).toBe(true);
    expect(canRead(s, 'ai2', dm.line)).toBe(false);
    expect(chat.find(dm.line.id)?.text).toBe('Gut gemacht!');
  });

  it('forgets old lines after a week', async () => {
    let now = 0;
    const chat = new RoomChat(rulesOnly, () => now);
    await chat.post(me, { kind: 'world' }, { quick: 0 });
    now = 8 * 24 * 3_600_000;
    chat.trim();
    expect(chat.lines).toEqual([]);
  });
});
