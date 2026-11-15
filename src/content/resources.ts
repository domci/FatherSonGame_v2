import { L } from './text';
import type { Loc } from './text';
/**
 * All resources that can be stored. Energy is not stored: it is a flow (production vs. use).
 * Knowledge crystals come only from the quiz (M5).
 */
export const RESOURCE_IDS = [
  'regolith',
  'metal',
  'gas',
  'diamonds',
  'pinkLiquid',
  'water',
  'oxygen',
  'food',
  'crystals',
] as const;

export type ResourceId = (typeof RESOURCE_IDS)[number];
export type ResourceAmounts = Partial<Record<ResourceId, number>>;

export interface ResourceInfo {
  name: Loc;
  color: string;
}

export const RESOURCE_INFO: Record<ResourceId, ResourceInfo> = {
  regolith: { name: L('Regolith', 'Regolith'), color: '#b8a58a' },
  metal: { name: L('Metall', 'Metal'), color: '#9fb3c8' },
  gas: { name: L('Gas', 'Gas'), color: '#f2c879' },
  diamonds: { name: L('Diamanten', 'Diamonds'), color: '#8fe3ff' },
  pinkLiquid: { name: L('Pinke Flüssigkeit', 'Pink Liquid'), color: '#ff6ec7' },
  water: { name: L('Wasser', 'Water'), color: '#4aa8ff' },
  oxygen: { name: L('Sauerstoff', 'Oxygen'), color: '#b8f0ff' },
  food: { name: L('Nahrung', 'Food'), color: '#9be36b' },
  crystals: { name: L('Wissenskristalle', 'Knowledge Crystals'), color: '#c9a2ff' },
};

export const START_RESOURCES: ResourceAmounts = {
  regolith: 400,
  water: 150,
  oxygen: 60,
  food: 120,
};

/** Storage limit per resource without any storage building. */
export const BASE_STORAGE = 1000;
