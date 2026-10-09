// Canonical site origin. Must match the domain Vercel redirects to
// (non-www currently 308s to www) so canonical tags never point at a
// URL that immediately redirects elsewhere.
export const SITE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.atlasmountainsvisit.com').replace(/\/$/, '')
