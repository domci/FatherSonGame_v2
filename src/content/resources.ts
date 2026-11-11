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
  name: string;
  color: string;
}

export const RESOURCE_INFO: Record<ResourceId, ResourceInfo> = {
  regolith: { name: 'Regolith', color: '#b8a58a' },
  metal: { name: 'Metall', color: '#9fb3c8' },
  gas: { name: 'Gas', color: '#f2c879' },
  diamonds: { name: 'Diamanten', color: '#8fe3ff' },
  pinkLiquid: { name: 'Pinke Flüssigkeit', color: '#ff6ec7' },
  water: { name: 'Wasser', color: '#4aa8ff' },
  oxygen: { name: 'Sauerstoff', color: '#b8f0ff' },
  food: { name: 'Nahrung', color: '#9be36b' },
  crystals: { name: 'Wissenskristalle', color: '#c9a2ff' },
};

export const START_RESOURCES: ResourceAmounts = {
  regolith: 400,
  water: 150,
  oxygen: 60,
  food: 120,
};

/** Storage limit per resource without any storage building. */
export const BASE_STORAGE = 1000;
