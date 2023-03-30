import {createCookieSessionStorage} from '@remix-run/node'
import type {Theme} from './theme-provider'
import {isValidTheme} from './theme-provider'

const SESSION_SECRET = process.env.SESSION_SECRET
if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set')
}

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: '__theme',
    secure: true,
    secrets: [SESSION_SECRET],
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
  },
})

export async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get('Cookie'))
  return {
    getTheme() {
      const theme = session.get('theme')
      return isValidTheme(theme) ? theme : 'light'
    },
    setTheme(theme: Theme) {
      return session.set('theme', theme)
    },
    commit() {
      return themeStorage.commitSession(session, {
        expires: new Date('2090-11-21'),
      })
    },
  }
}
