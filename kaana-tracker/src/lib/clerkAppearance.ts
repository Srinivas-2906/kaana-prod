/** Kaana Tracker Clerk theme — hide shared-app (Faralin) and Clerk chrome. */
export const trackerClerkAppearance = {
  layout: {
    socialButtonsPlacement: 'top' as const,
    unsafe_disableDevelopmentModeWarnings: true,
  },
  elements: {
    rootBox: { width: '100%' },
    cardBox: { width: '100%', boxShadow: 'none' },
    card: { boxShadow: 'none', border: 'none', padding: 0, gap: '1rem' },
    header: { display: 'none' },
    headerTitle: { display: 'none' },
    headerSubtitle: { display: 'none' },
    footer: { display: 'none' },
    footerPages: { display: 'none' },
    footerAction: { display: 'none' },
    footerActionLink: { display: 'none' },
    footerActionText: { display: 'none' },
    logoBox: { display: 'none' },
    logoImage: { display: 'none' },
    formButtonPrimary: {
      fontSize: '0.9375rem',
      fontWeight: 600,
    },
  },
};
