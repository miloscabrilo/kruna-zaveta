/** Main navigation, shared by header and footer. Paths are relative to the `/:lang` root. */
export const NAV_ITEMS = [
  { path: '', key: 'nav.home', exact: true },
  { path: 'what-we-have-done', key: 'nav.projects', exact: false },
  { path: 'recognitions', key: 'nav.recognitions', exact: false },
  { path: 'about', key: 'nav.about', exact: false },
  { path: 'donors', key: 'nav.donors', exact: false },
  { path: 'contact', key: 'nav.contact', exact: false },
] as const;
