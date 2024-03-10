import {z} from 'zod'

const envVariables = z.object({
  ACCESS_TOKEN: z.string().trim().min(1),
  ACCOUNT_NAME: z.string().trim().min(1),
  REPO_NAME: z.string().trim().min(1),
  SESSION_SECRET: z.string().trim().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

export const ENV = envVariables.parse(process.env)

// Just in case somewhere around the codebase we access process.env
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
