import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * hero-infra block — real tabs (like the Dell "Optimize with future-ready
 * infrastructure" module: click a label, the image + copy + CTA on the
 * right switch to match).
 *
 * Authoring table:
 *  Row 1: Heading (single cell, rich text — bold the accent word)
 *  Row 2: Description (single cell)
 *  Row 3+: One row per tab, 3 cells each:
 *          [ Tab label ] [ Image ] [ Body: heading/paragraph/link(s) ]
 *
 * Rows are classified by shape, not fixed index: any row containing an
 * image is a tab row; everything else is treated as intro copy, in the
 * order it appears (heading, then description).
 */
export default function decorate(block) {
  const rows = [...block.children];

  const tabRows = rows.filter((row) => row.querySelector('picture, img'));
  const introRows = rows.filter((row) => !tabRows.includes(row));
  const [headingRow, descRow] = introRows;

  const intro = document.createElement('div');
  intro.className = 'hero-infra-intro';

  if (headingRow) {
    const h2 = document.createElement('h2');
    h2.innerHTML = headingRow.children[0]?.innerHTML ?? headingRow.innerHTML;
    intro.append(h2);
  }

  if (descRow) {
    const p = document.createElement('p');
    p.className = 'hero-infra-description';
    p.innerHTML = descRow.children[0]?.innerHTML ?? descRow.innerHTML;
    intro.append(p);
  }

  const tabsWrapper = document.createElement('div');
  tabsWrapper.className = 'hero-infra-tabs';

  const tablist = document.createElement('ul');
  tablist.className = 'hero-infra-tablist';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-orientation', 'vertical');

  const panelWrapper = document.createElement('div');
  panelWrapper.className = 'hero-infra-panels';

  tabRows.forEach((row, i) => {
    const [labelCell, imageCell, bodyCell] = row.children;
    const label = labelCell?.textContent.trim() || `Tab ${i + 1}`;
    const id = `hero-infra-tab-${i}`;
    const isActive = i === 0;

    // --- Tab button ---
    const li = document.createElement('li');
    li.setAttribute('role', 'presentation');

    const button = document.createElement('button');
    button.type = 'button';
    button.id = `${id}-btn`;
    button.className = 'hero-infra-tab-btn';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `${id}-panel`);
    button.setAttribute('aria-selected', String(isActive));
    button.tabIndex = isActive ? 0 : -1;
    button.textContent = label;

    li.append(button);
    tablist.append(li);

    // --- Panel (image + copy for this tab) ---
    const panel = document.createElement('div');
    panel.id = `${id}-panel`;
    panel.className = 'hero-infra-panel';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${id}-btn`);
    panel.hidden = !isActive;

    const media = document.createElement('div');
    media.className = 'hero-infra-panel-image';
    const img = imageCell?.querySelector('img');
    if (img) {
      media.append(createOptimizedPicture(img.src, img.alt || label, isActive, [{ width: '1200' }]));
    }

    const content = document.createElement('div');
    content.className = 'hero-infra-panel-content';
    content.innerHTML = bodyCell?.innerHTML ?? '';
    content.querySelectorAll('a').forEach((a) => a.classList.add('hero-infra-panel-link'));

    panel.append(media, content);
    panelWrapper.append(panel);

    // --- Tab switching ---
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-selected') === 'true') return;

      tablist.querySelectorAll('.hero-infra-tab-btn').forEach((btn) => {
        btn.setAttribute('aria-selected', 'false');
        btn.tabIndex = -1;
      });
      panelWrapper.querySelectorAll('.hero-infra-panel').forEach((p) => { p.hidden = true; });

      button.setAttribute('aria-selected', 'true');
      button.tabIndex = 0;
      panel.hidden = false;
    });

    // Arrow-key navigation between tabs (standard tablist keyboard behavior)
    button.addEventListener('keydown', (e) => {
      const buttons = [...tablist.querySelectorAll('.hero-infra-tab-btn')];
      const idx = buttons.indexOf(button);
      let next;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = buttons[(idx + 1) % buttons.length];
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = buttons[(idx - 1 + buttons.length) % buttons.length];
      if (next) {
        e.preventDefault();
        next.focus();
        next.click();
      }
    });
  });

  tabsWrapper.append(tablist, panelWrapper);

  block.innerHTML = '';
  block.append(intro, tabsWrapper);
}
