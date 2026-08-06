/** Tracker shares Clerk with Faralin — hide/replace Faralin-branded Clerk chrome. */
export const trackerClerkAppearance = {
  layout: {
    socialButtonsPlacement: 'top' as const,
  },
  elements: {
    rootBox: { width: '100%' },
    cardBox: { width: '100%', boxShadow: 'none' },
    card: { boxShadow: 'none', border: 'none', padding: 0, gap: '1rem' },
    header: { display: 'none' },
    headerTitle: { display: 'none' },
    headerSubtitle: { display: 'none' },
    footer: { background: 'transparent' },
    footerAction: { justifyContent: 'center' },
    formButtonPrimary: {
      fontSize: '0.9375rem',
      fontWeight: 600,
    },
  },
};
