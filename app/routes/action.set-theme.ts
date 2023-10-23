import type {ActionArgs} from '@vercel/remix'
import {json, redirect} from '@vercel/remix'
import {isValidTheme} from '~/utils/theme-provider'
import {getThemeSession} from '~/utils/theme.server'

export async function loader() {
  return redirect('/', {status: 404})
}

export async function action({request}: ActionArgs) {
  const themeSession = await getThemeSession(request)
  const requestText = await request.text()
  const form = new URLSearchParams(requestText)
  const theme = form.get('theme')

  if (!isValidTheme(theme)) {
    return json({
      success: false,
      message: `Invalid theme: ${theme}`,
    })
  }

  themeSession.setTheme(theme)
  return json(
    {success: true},
    {headers: {'Set-Cookie': await themeSession.commit()}},
  )
}
