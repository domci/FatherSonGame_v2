import { APP } from './ui/app';
import { FLEET } from './ui/fleet';
import { HUD } from './ui/hud';
import { LOBBY } from './ui/lobby';
import { MENU } from './ui/menu';
import { ONLINE } from './ui/online';
import { PANELS } from './ui/panels';
import { PARENTS } from './ui/parents';
import { PEOPLES } from './ui/peoples';
import { QUIZ } from './ui/quiz';
import { STORY } from './ui/story';

/** All UI texts, by key. Each catalog file holds one part of the game. */
export const UI = {
  ...APP,
  ...FLEET,
  ...HUD,
  ...LOBBY,
  ...MENU,
  ...ONLINE,
  ...PANELS,
  ...PARENTS,
  ...PEOPLES,
  ...QUIZ,
  ...STORY,
};
export type UiKey = keyof typeof UI;

/** For the test: every catalog on its own (keys must not repeat). */
export const CATALOGS = [
  APP,
  FLEET,
  HUD,
  LOBBY,
  MENU,
  ONLINE,
  PANELS,
  PARENTS,
  PEOPLES,
  QUIZ,
  STORY,
];
