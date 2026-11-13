import { api } from '../online/api';
import { parentsPage } from '../ui/parents-page';
import { privacyPage } from '../ui/privacy-page';

/** Pages over everything, opened by the address: #datenschutz and #eltern. */
function showPage(): void {
  document.querySelector('.info-page')?.remove();
  const close = (): void => {
    history.replaceState(null, '', location.pathname + location.search);
    document.querySelector('.info-page')?.remove();
  };
  if (location.hash === '#datenschutz') document.body.append(privacyPage(close));
  if (location.hash === '#eltern') document.body.append(parentsPage(api, close));
}

export function watchPages(): void {
  window.addEventListener('hashchange', showPage);
  showPage();
}
