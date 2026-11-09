import { describe, expect, it } from 'vitest';
import { BUILDING_LIST } from './building-list';
import { buildingDescription, buildingName, FACTIONS, otherFaction, unitName } from './factions';
import { UNITS } from './units';

describe('peoples', () => {
  it('aliens have their own name for every building and unit', () => {
    for (const b of BUILDING_LIST) {
      expect(buildingName(b.id, 'alien')).not.toBe(buildingName(b.id, 'human'));
      expect(buildingDescription(b.id, 'alien').length).toBeGreaterThan(5);
    }
    for (const id of Object.keys(UNITS) as (keyof typeof UNITS)[]) {
      if (id !== 'spider') expect(unitName(id, 'alien')).not.toBe(unitName(id, 'human'));
    }
  });

  it('both peoples play by the same rules', () => {
    expect(otherFaction('human')).toBe('alien');
    expect(FACTIONS.alien.core).toBe(buildingName('commandDome', 'alien'));
  });
});
