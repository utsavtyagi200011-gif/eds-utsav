export default function decorate(block) {
  const rows = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'insights-wrapper';

  let headingEl = null;
  let ctaHref = null;
  let ctaLabel = 'Read more insights';
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'insights-cards';

  rows.forEach((row) => {
    const cells = [...row.children];
    const nonEmptyCells = cells.filter((c) => c.textContent.trim() || c.querySelector('picture, img'));

    // Heading row: exactly one non-empty cell, no image
    if (nonEmptyCells.length === 1 && !nonEmptyCells[0].querySelector('picture, img')
        && rows.indexOf(row) === 0) {
      headingEl = document.createElement('h2');
      headingEl.className = 'insights-heading';
      headingEl.textContent = nonEmptyCells[0].textContent.trim();
      return;
    }

    // CTA row: only the first 1-2 cells have content, no image anywhere in the row,
    // and it's NOT the first row (so it can't be mistaken for the heading)
    const hasImage = row.querySelector('picture, img');
    if (!hasImage && nonEmptyCells.length <= 2 && rows.indexOf(row) !== 0) {
      const link = row.querySelector('a');
      ctaLabel = cells[0]?.textContent.trim() || ctaLabel;
      // fall back to plain text as the href if it wasn't authored as a real link
      ctaHref = link ? link.getAttribute('href') : (cells[1]?.textContent.trim() || '#');
      return;
    }

    // Card row
    const [imgCell, titleCell, descCell, authorIconCell, authorCell, dateCell, readTimeCell,
      tagsCell] = cells;

    const card = document.createElement('div');
    card.className = 'insights-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'insights-card-image';
    const picture = imgCell?.querySelector('picture');
    if (picture) imgWrap.append(picture);
    card.append(imgWrap);

    const body = document.createElement('div');
    body.className = 'insights-card-body';

    const title = document.createElement('h3');
    title.className = 'insights-card-title';
    title.textContent = titleCell?.textContent.trim() || '';
    body.append(title);

    const desc = document.createElement('p');
    desc.className = 'insights-card-desc';
    desc.textContent = descCell?.textContent.trim() || '';
    body.append(desc);

    const meta = document.createElement('div');
    meta.className = 'insights-card-meta';

    const authorRow = document.createElement('div');
    authorRow.className = 'insights-card-author';
    const authorIconPic = authorIconCell?.querySelector('picture');
    const authorIcon = document.createElement('span');
    authorIcon.className = 'insights-card-author-icon';
    if (authorIconPic) {
      authorIcon.append(authorIconPic);
    }
    const authorName = document.createElement('span');
    authorName.textContent = authorCell?.textContent.trim() || '';
    const dateLine = document.createElement('span');
    dateLine.className = 'insights-card-date';
    const dateText = dateCell?.textContent.trim() || '';
    const readTimeText = readTimeCell?.textContent.trim() || '';
    dateLine.textContent = readTimeText ? `${dateText} • ${readTimeText}` : dateText;
    const authorDate = document.createElement('div');
    authorDate.className = 'insights-author-date';
    authorDate.append(authorName, dateLine);
    authorRow.append(authorIcon, authorDate);
    meta.append(authorRow);

    // meta.append(dateLine);

    body.append(meta);

    const tagsText = tagsCell?.textContent.trim() || '';
    if (tagsText) {
      const tagsWrap = document.createElement('div');
      tagsWrap.className = 'insights-card-tags';
      tagsText.split(',').forEach((tag) => {
        const t = tag.trim();
        if (!t) return;
        const tagEl = document.createElement('span');
        tagEl.className = 'insights-tag';
        tagEl.textContent = t;
        tagsWrap.append(tagEl);
      });
      body.append(tagsWrap);
    }

    card.append(body);
    cardsContainer.append(card);
  });

  block.textContent = '';
  if (headingEl) wrapper.append(headingEl);
  wrapper.append(cardsContainer);

  const allCards = [...cardsContainer.children];
  const CARDS_PER_PAGE = 3;
  let visibleCount = CARDS_PER_PAGE;

  const applyVisibility = () => {
    allCards.forEach((card, i) => { card.hidden = i >= visibleCount; });
  };

  if (allCards.length > CARDS_PER_PAGE) {
    applyVisibility();
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.type = 'button';
    loadMoreBtn.className = 'insights-cta';
    loadMoreBtn.textContent = ctaLabel;
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += CARDS_PER_PAGE;
      applyVisibility();
      if (visibleCount >= allCards.length) loadMoreBtn.remove();
    });
    wrapper.append(loadMoreBtn);
  } else if (ctaHref) {
    const ctaEl = document.createElement('a');
    ctaEl.className = 'insights-cta';
    ctaEl.href = ctaHref;
    ctaEl.textContent = ctaLabel;
    wrapper.append(ctaEl);
  }

  block.append(wrapper);
}
