/** Kaana Tracker Clerk theme — hide Clerk branding, keep sign-in/sign-up links. */
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
    footerPages: { display: 'none' },
    logoBox: { display: 'none' },
    logoImage: { display: 'none' },
    footer: {
      background: 'transparent',
      padding: 0,
      margin: 0,
    },
    footerAction: {
      justifyContent: 'center',
      padding: 0,
      margin: '1rem 0 0',
    },
    formButtonPrimary: {
      fontSize: '0.9375rem',
      fontWeight: 600,
    },
  },
};
