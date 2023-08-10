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
Typescript can effectively know what are your variables living in your `env` file because that's code you never import
and is executed at runtime.

Personally, when working with Typescript I like to get as much help from it as possible. Now, I know what you're
thinking. We usually don't go around using env variables a hundred of times across our codebases, it's only on selected
spots of our codebase where we do use them.
