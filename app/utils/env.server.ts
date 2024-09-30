import {z} from 'zod'

const envVariables = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test'] as const),
  ACCESS_TOKEN: z.string().trim().min(1),
  ACCOUNT_NAME: z.string().trim().min(1),
  REPO_NAME: z.string().trim().min(1),
  SESSION_SECRET: z.string().trim().min(1),
})

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}

export function init() {
  const parsed = envVariables.safeParse(process.env)

  if (parsed.success === false) {
    const {fieldErrors} = parsed.error.flatten()
    const errorMessage = Object.entries(fieldErrors)
      .map(([field, errors]) =>
        errors ? `${field}: ${errors.join(', ')}` : field,
      )
      .join('\n  ')
    console.error('❌ Invalid environment variables:', fieldErrors)
    throw new Error(`Invalid envirmonment variables:\n ${errorMessage}`)
  }
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
  }
}

type ENV = ReturnType<typeof getEnv>

declare global {
  // eslint-disable-next-line no-var
  var ENV: ENV
  interface Window {
    ENV: ENV
  }
}
