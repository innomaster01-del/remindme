// Shopping list "notepad" mode: the user edits the list as plain text, one item per line.
// Lines are matched back to existing items by name so ids, quantities and departments survive.
const norm = (s) => s.trim().toLowerCase();

export function itemsToText(items) {
  return items.filter((i) => !i.checked).map((i) => i.name).join('\n');
}

export function syncItemsFromText(items, text, newId) {
  const lines = text.split('\n').map((l) => l.replace(/^[\s•\-*☐◻▢]+/, '').trim()).filter(Boolean);
  const pool = new Map();
  for (const it of items) {
    if (it.checked) continue;
    const k = norm(it.name);
    if (!pool.has(k)) pool.set(k, []);
    pool.get(k).push(it);
  }
  const out = [];
  const added = [];
  for (const line of lines) {
    const k = norm(line);
    const bucket = pool.get(k);
    if (bucket && bucket.length) {
      const it = bucket.shift();
      out.push(it.name === line ? it : { ...it, name: line });
    } else {
      out.push({ id: newId(), name: line, qty: '', checked: false });
      added.push(line);
    }
  }
  return { items: [...out, ...items.filter((i) => i.checked)], added };
}

// A note's title is its first non-empty line.
export function splitTitle(text) {
  const lines = (text || '').split('\n');
  const i = lines.findIndex((l) => l.trim());
  if (i === -1) return { title: '', body: '' };
  return { title: lines[i].trim(), body: lines.slice(i + 1).join('\n').replace(/^\n+/, '').trimEnd() };
}
