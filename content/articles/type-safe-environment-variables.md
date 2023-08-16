---
title: Type safe environment variables
date: '2023-08-10'
summary: Get those pesky environment variables to typesafe land
categories:
  - typescript
meta:
  keywords:
    - typescript
    - environment variables
    - zod
---

If you've been working with Typescript and needed to access environment variables on your code, you must've noticed that
after you type `proces.env` you don't get any suggestions. And that makes a lot of sense, because there's no way
Typescript can effectively know what are the variables living in your `env` file. That's because it's code you never import
and is executed at runtime.

Personally, when working with Typescript I like to get as much help from it as possible. Now, I know what you're
thinking. We usually don't go around using env variables a hundred of times across our codebases, it's only on selected
spots of our codebase where we do use them. But still, arguably those places where you use them are really imporant.
Better safe than sorry!

So, how can we leverage the help from Typescript here?

## Zod

We use [zod](https://zod.dev/)! Zod will not only help us get typed environment variables, but also will parse them and
check if we are missing any.

So, first off, on your `src` (or similar) folder, create a `env.ts` file:

```typescript
// env.ts
import {z} from 'zod'

const envVariables = z.object({
  node_env: z.enum(['development', 'production', 'test']),
  some_super_secret_token: z.string().nonemtpy(),
})

export const ENV = envvariables.parse(process.env)
```

There are a couple of things to notice in this piece of snippet:

1. Notice on line 6, how we chain a `.nonempty()` method to the string parse? That's so you don't accidentally go and
   create a env variable like so: `SOME_SUPER_SECRET_TOKEN=` (which is valid on your `.env` file). If you do, zod will
   warn you about it
2. We are exporting a `ENV` constant, which parses our entire `process.env` object containing our environment variables.
   That means that, if `process.env` is missing any of the variables declared on your `envVariables` schema, `zod` will
   throw an error as soon as this file gets imported.
3. Because of how `zod` works, any other variable that's not defined in the schema will get filtered out. So this helps
   declaring in one single place all the variables that you'll be using on your entire application. This is extremely
   useful, this file tends to get really big over time and on big applications.

With this, now we can import our newly created `ENV` constant and safely use our env variables 🎉

```typescript
// Somewhere on your app
import {ENV} from '~/env'

const connection = connect({
  token: ENV.SOME_SUPER_SECRET_TOKEN,
})
```

## Parse as soon as possible

There's a problem with this approach. What if the first time we use our `ENV` object is with an invalid/unset variable
deep inside our component tree? Our app will run like nothing happened, until it reaches that point and blows up
eventually.

To avoid this, ideally we'd want to parse our `process.env` as soon as possible. So let's do that!

In order to achive this, we need to `parse` our schema as soon as our app is mounted. For that, we need to tweak our
`env.ts` file a bit:

```typescript{9-21}
// env.ts
import {z} from 'zod'

const envVariables = z.object({
  node_env: z.enum(['development', 'production', 'test']),
  some_super_secret_token: z.string().nonemtpy(),
})

try {
  envVariables.parse(process.env)
} catch (error) {
  if (error instanceof z.ZodError) {
    const {fieldErrors} = error.flatten()
    const errorMessage = Object.entries(fieldErrors)
      .map(([field, errors]) =>
        errors ? `${field}: ${errors.join(', ')}` : field
      )
      .join('\n  ')
    throw new Error(`Missing environment variables:\n  ${errorMessage}`)
  }
}

export const ENV = envvariables.parse(process.env)
```

This `try catch` block will run as soon as this file gets imported, and throw a more pretty error message listing the
environment variables that were problematic.

So now all we need to do is import this file at the root of our application. Which file this is depends on the
framework you're using:

### Remix

```typescript
// entry.server.ts
import '~/env.server' // Notice the .server on the file name
```

### Nextjs

```typescript
// app/layout.tsx
import '~/env'
```

Now our `env.ts` will be executed as soon as our app is run.

## Declaration merging

There's one more thing we can add to our file before we close it at take it home.

Depending on the configuration of your project, there are places where you'd still need to access `process.env`
directly. Doing so with our current solution will still throw you into the unknown.

```sh
// .env
FOO_ACCESS_TOKEN=1234
```

```typescript
// some.config.ts

const accessToken = process.env.eerk // This will not lint, nor will it suggest variables based on your .env file
```

To avoid this we can use declaration merging. We interfere the global `ProcessEnv` interface under the `NodeJS`
namespace, and add our infered typed variables. This is how:

```typescript{}
// env.ts
import {z} from 'zod'

const envVariables = z.object({
  node_env: z.enum(['development', 'production', 'test']),
  some_super_secret_token: z.string().nonemtpy(),
})

declare global {
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof envVariables> {}
    }
}

try {
  envVariables.parse(process.env)
} catch (error) {
  if (error instanceof z.ZodError) {
    const {fieldErrors} = error.flatten()
    const errorMessage = Object.entries(fieldErrors)
      .map(([field, errors]) =>
        errors ? `${field}: ${errors.join(', ')}` : field
      )
      .join('\n  ')
    throw new Error(`Missing environment variables:\n  ${errorMessage}`)
  }
}

export const ENV = envvariables.parse(process.env)
```
