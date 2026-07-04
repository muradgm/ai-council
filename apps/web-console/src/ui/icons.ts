export function icon(name: string) {
  const paths: Record<string, string> = {
    "new-chat": `<path d="M5 12h14"/><path d="M12 5v14"/><path d="M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/>`,
    search: `<circle cx="11" cy="11" r="7"/><path d="m20 20-4.2-4.2"/>`,
    agents: `<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="10" r="2.5"/><path d="M14.5 19a4.5 4.5 0 0 1 6-3.8"/>`,
    councils: `<circle cx="7" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><circle cx="12" cy="17" r="3"/><path d="M9.5 10.5 11 14"/><path d="m14.5 10.5-1.5 3.5"/>`,
    projects: `<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>`,
    runtime: `<path d="M12 2v5"/><path d="M12 17v5"/><path d="M2 12h5"/><path d="M17 12h5"/><path d="m4.9 4.9 3.5 3.5"/><path d="m15.6 15.6 3.5 3.5"/><path d="m19.1 4.9-3.5 3.5"/><path d="m8.4 15.6-3.5 3.5"/>`,
    observability: `<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 14h2v2H8z"/><path d="M11 10h2v6h-2z"/><path d="M14 7h2v9h-2z"/>`,
    library: `<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3Z"/><path d="M8 4v13a3 3 0 0 0 3 3"/><path d="M9 8h5"/>`,
    panel: `<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M9 5v14"/><path d="M12 9h5"/><path d="M12 13h5"/>`,
    settings: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-3v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4v-3h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V4h3v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v3h-.1a1.7 1.7 0 0 0-1.5 1Z"/>`,
    sparkle: `<path d="M12 2 14 9l7 3-7 3-2 7-2-7-7-3 7-3Z"/>`,
    code: `<path d="m10 8-4 4 4 4"/><path d="m14 8 4 4-4 4"/>`,
    shield: `<path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6Z"/>`,
    check: `<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>`,
    mic: `<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>`,
    send: `<path d="m21 3-7.5 18-3-7.5-7.5-3Z"/><path d="m21 3-10.5 10.5"/>`,
    share: `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.6 6.8-4.2"/><path d="m8.6 13.4 6.8 4.2"/>`,
    chevron: `<path d="m8 10 4 4 4-4"/>`,
    more: `<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>`,
    thumbsUp: `<path d="M7 11v9H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z"/><path d="M7 11 12 3a2 2 0 0 1 3 2l-1 4h4a2 2 0 0 1 2 2l-1.5 7a2 2 0 0 1-2 2H7"/>`,
    copy: `<rect x="8" y="8" width="12" height="12" rx="2"/><rect x="4" y="4" width="12" height="12" rx="2"/>`
  };
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.sparkle}</svg>`;
}
