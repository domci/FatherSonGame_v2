import { describe, expect, it } from 'vitest';
import { ONLINE } from '../content/online';
import { RESEARCH, type ResearchId } from '../content/research';
import { applyCommand } from './commands';
import { HOUR } from './clock';
import { humanSides, isAway, isHuman } from './humans';
import { createOnlineWorld, freeSeats } from './online';
import { relationOf } from './relations';
import { rivalOf } from './ai/targets';
import { defeat, defeatSystem } from './defeat';
import { tick } from './update';
import type { GameState } from './state';

const T0 = 1_700_000_000_000;

/** A world with one computer, the maker and one free place. */
function world(computers = 1, people = 2): GameState {
  return createOnlineWorld({
    seed: 3,
    time: T0,
    faction: 'human',
    name: 'Roter Falke',
    difficulty: 'normal',
    computers,
    people,
  });
}

function joinSeat(s: GameState, name = 'Blauer Komet'): void {
  const seat = freeSeats(s)[0];
  if (!seat) throw new Error('no seat');
  expect(applyCommand(s, { type: 'join', player: seat, faction: 'alien', name }).ok).toBe(true);
}

function skipShields(s: GameState): void {
  s.time += ONLINE.shieldMs + 1;
}

function research(s: GameState, side: 'player' | 'ai2', n: number): void {
  const p = s.players[side];
  if (p) p.research.done = (Object.keys(RESEARCH) as ResearchId[]).slice(0, n);
}

describe('online worlds (M7)', () => {
  it('has seats: the maker, the computers, then free places for people', () => {
    const s = world(1, 3);
    expect(s.settings.online).toBe(true);
    expect(s.players.player?.name).toBe('Roter Falke');
    expect(s.players.player?.shieldUntil).toBe(T0 + ONLINE.shieldMs);
    expect(s.ai.ai).toBeDefined();
    expect(freeSeats(s)).toEqual(['ai2', 'ai3']);
    expect(s.system.homes).toHaveLength(4);
  });

  it('lets a person take a free seat: own base, spiders, peace and a beginner shield', () => {
    const s = world();
    joinSeat(s);
    const p = s.players.ai2;
    expect(p?.name).toBe('Blauer Komet');
    expect(isHuman(s, 'ai2')).toBe(true);
    expect(humanSides(s)).toEqual(['player', 'ai2']);
    expect(p?.homeBodyId).toBe(s.system.homes[2]);
    const things = s.world.entities.filter((e) => e.zone === p?.homeBodyId);
    expect(things.some((e) => e.building?.type === 'commandDome' && e.owner === 'ai2')).toBe(true);
    expect(things.some((e) => e.nest)).toBe(true);
    expect(relationOf(s, 'player', 'ai2')).toBe('peace');
    expect(relationOf(s, 'ai', 'ai2')).toBe('war');
    expect(freeSeats(s)).toEqual([]);
    expect(applyCommand(s, { type: 'join', player: 'ai2', faction: 'human', name: 'X' }).ok).toBe(
      false,
    );
  });

  it('shows news only to the side it is about', () => {
    const s = world();
    joinSeat(s);
    s.events = [];
    applyCommand(s, { type: 'diplomacy', player: 'player', side: 'ai', action: 'peace' });
    s.time += 10 * 60_000;
    expect(applyCommand(s, { type: 'presence', player: 'ai2', here: true }).ok).toBe(true);
    const offer = applyCommand(s, {
      type: 'diplomacy',
      player: 'ai2',
      side: 'player',
      action: 'alliance',
    });
    expect(offer.ok).toBe(true);
    const news = s.events.filter((e) => e.text.includes('Bündnis an'));
    expect(news.map((e) => e.to)).toEqual(['player']);
    expect(s.offers[0]?.until).toBe(s.time + 24 * HOUR);
  });

  it('protects new and much weaker people from war', () => {
    const s = world();
    joinSeat(s);
    const war = () =>
      applyCommand(s, { type: 'diplomacy', player: 'player', side: 'ai2', action: 'war' });
    const first = war();
    expect(first.ok ? '' : first.reason).toContain('Anfänger-Schild');
    skipShields(s);
    research(s, 'player', 6);
    const second = war();
    expect(second.ok ? '' : second.reason).toContain('schwächer');
    research(s, 'ai2', 6);
    s.players.player!.shieldUntil = s.time + HOUR;
    expect(war().ok).toBe(true);
    expect(relationOf(s, 'player', 'ai2')).toBe('war');
    expect(s.players.player?.shieldUntil).toBe(s.time);
  });

  it('computers leave people alone who are not connected (offline attacks off)', () => {
    const s = world();
    expect(isAway(s, 'player', false)).toBe(true);
    applyCommand(s, { type: 'presence', player: 'player', here: true });
    expect(isAway(s, 'player', false)).toBe(false);
    s.settings.offlineAttacks = true;
    applyCommand(s, { type: 'presence', player: 'player', here: false });
    expect(isAway(s, 'player', false)).toBe(true);
  });

  it('computers follow the weakest person they fight', () => {
    const s = world();
    joinSeat(s);
    research(s, 'player', 8);
    expect(rivalOf(s, 'ai')).toBe('ai2');
  });

  it('a beaten person loses the base but the world goes on; they can start again', () => {
    const s = world();
    joinSeat(s);
    defeat(s, 'player', 'ai');
    defeatSystem(s);
    expect(s.winner).toBeUndefined();
    expect(s.world.entities.some((e) => e.owner === 'player')).toBe(false);
    s.time += HOUR;
    expect(applyCommand(s, { type: 'restart', player: 'player' }).ok).toBe(true);
    const p = s.players.player;
    expect(p?.defeated).toBeUndefined();
    expect(p?.name).toBe('Roter Falke');
    expect(p?.shieldUntil).toBe(s.time + ONLINE.shieldMs);
    expect(s.world.entities.some((e) => e.owner === 'player' && e.building)).toBe(true);
    expect(relationOf(s, 'player', 'ai2')).toBe('peace');
    expect(applyCommand(s, { type: 'restart', player: 'player' }).ok).toBe(false);
  });

  it('a person who leaves frees the seat', () => {
    const s = world();
    joinSeat(s);
    expect(applyCommand(s, { type: 'leave', player: 'ai2' }).ok).toBe(true);
    expect(s.players.ai2).toBeUndefined();
    expect(s.world.entities.some((e) => e.owner === 'ai2')).toBe(false);
    expect(freeSeats(s)).toEqual(['ai2']);
    expect(applyCommand(s, { type: 'leave', player: 'player' }).ok).toBe(false);
  });

  it('runs a world with two people and a computer for a while', () => {
    const s = world();
    joinSeat(s);
    for (let i = 0; i < 600; i++) tick(s);
    expect(s.players.ai2?.colony.people).toBeGreaterThan(0);
    expect(s.events.every((e) => !e.to || isHuman(s, e.to))).toBe(true);
  });
});
