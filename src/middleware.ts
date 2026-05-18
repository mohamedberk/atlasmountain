import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all pathnames except for admin, api, _next, _vercel, and files with extensions
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)', '/'],
}
