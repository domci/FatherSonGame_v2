import type { ReportAction, ReportInfo } from '../net/protocol';
import { el } from './dom';
import { icon, type IconName } from './icons';

export interface ParentsApi {
  reports(password: string): Promise<ReportInfo[]>;
  resolve(password: string, id: string, action: ReportAction): Promise<unknown>;
}

const ACTIONS: { action: ReportAction; label: string; icon: IconName; help: string }[] = [
  { action: 'dismiss', label: 'Ist okay', icon: 'check', help: 'Meldung schließen.' },
  {
    action: 'strike',
    label: 'Verwarnen',
    icon: 'triangle-alert',
    help: 'Wie eine schlimme Nachricht: Verwarnung, dann Chat-Pause.',
  },
  { action: 'ban', label: 'Sperren', icon: 'x', help: 'Darf nicht mehr online spielen.' },
];

function reportRow(r: ReportInfo, act: (a: ReportAction) => void): HTMLElement {
  const when = new Date(r.time).toLocaleString('de-DE');
  return el(
    'div',
    { class: 'report-row' },
    el('div', { class: 'wr-info' }, `${when} · Welt ${r.world}`),
    el('div', { class: 'chat-line' }, el('span', { class: 'chat-name' }, r.name), r.text),
    el(
      'div',
      { class: 'report-actions' },
      ...ACTIONS.map((a) =>
        el(
          'button',
          { class: 'm-item small', title: a.help, onclick: () => act(a.action) },
          icon(a.icon),
          el('span', {}, a.label),
        ),
      ),
    ),
  );
}

/** Loads the open reports into the list; each button closes or punishes, then reloads. */
function reportLoader(api: ParentsApi, password: HTMLInputElement, list: HTMLElement) {
  const say = (text: string): void =>
    list.replaceChildren(el('p', { class: 'p-text muted' }, text));
  const load = async (): Promise<void> => {
    try {
      const reports = await api.reports(password.value);
      if (reports.length === 0) return say('Keine offenen Meldungen.');
      const act = (r: ReportInfo, a: ReportAction): void =>
        void api.resolve(password.value, r.id, a).then(load);
      const rows = reports
        .sort((a, b) => b.time - a.time)
        .map((r) => reportRow(r, (a) => act(r, a)));
      list.replaceChildren(...rows);
    } catch (e) {
      say(e instanceof Error ? e.message : String(e));
    }
  };
  return load;
}

function plainButton(ico: IconName, label: string, onclick: () => void): HTMLElement {
  return el('button', { class: 'm-item', onclick }, icon(ico), el('span', {}, label));
}

/** Parents' page (#eltern): reported chat lines, with the server password. */
export function parentsPage(api: ParentsApi, onClose: () => void): HTMLElement {
  const password = el('input', { class: 'code-input', type: 'password', placeholder: 'Passwort' });
  const list = el('div', { class: 'world-list' });
  const load = reportLoader(api, password, list);
  password.onkeydown = (e) => e.key === 'Enter' && void load();
  return el(
    'div',
    { class: 'screen modal info-page' },
    el(
      'div',
      { class: 'panel dialog wide' },
      el('div', { class: 'p-sub' }, 'Für Eltern'),
      el('h2', {}, 'Meldungen'),
      el(
        'p',
        { class: 'p-text muted' },
        'Hier stehen Chat-Nachrichten, die Kinder gemeldet haben. Das Passwort ist der ADMIN_KEY des Servers.',
      ),
      el(
        'div',
        { class: 'code-row' },
        password,
        plainButton('log-in', 'Zeigen', () => void load()),
      ),
      list,
      plainButton('x', 'Schließen', onClose),
    ),
  );
}
