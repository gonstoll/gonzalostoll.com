---
title: Use identity functions
date: '2023-03-26'
summary: Leverage better type safe objects with Typescript
---

In Typescript (and also in JavaScript), when we create an object we automatically get suggestions based on the object’s keys when accessing them:

```typescript
const user = {
  firstName: 'Gonzalo',
  lastName: 'Stoll',
  age: 32,
}

const userName = user.firstName // `firstName` here is suggested for us
//    ^? const userName: string
```

This is the default behaviour and quite frankly, something predictable. For small, simple and flat objects this might be all you need. However things get complicated when you have a more complex data structure and you need to make sure your properties are type safe. Take the following example:

```typescript
const formFields = {
  email: {
    id: 'email',
    name: 'user-email',
    placeholder: 'Inser your email',
    type: 'mail',
  },
  // ...
}
```

Considering this is an object that holds the configuration to setup a contact form, we’d want to make sure we don’t have a typo or miss a crucial property. We might feel tempted to then do something like this:

```typescript
interface Field {
  id: string
  name: string
  placeholder: string
  type: 'text' | 'number' | 'mail'
}

type Foo = {
  id: string
  name: string
  placeholder: string
  type: 'text' | 'number' | 'mail'
}

// Equivalent of {[key: string]: Field}
const formFields: Record<string, Field> = {
  email: {
    id: 'email',
    name: 'user-email',
    placeholder: 'Inser your email',
    type: 'mail',
  },
  // ...
}
```

## The type safe problem

At this point, this solution will work jim-dandy and might look like exactly what we need, however there’s a problem waiting for future us:

```typescript
const emailField = formFields.email.id // `email` and `id` are not suggested here
//    ^? const emailField: string
```

Why is this happening? Well, this is occurring because of how we annotated our `formFields` object. We basically told Typescript: “Hey, this object should have properties of type `string` and values of type `Field`”. By doing so, typescript completely looses track of your keys literals, and in doing so it also looses track of all subsequent nested properties.

This may not look as a complete train wreck at first sight. Arguably if you have this object colocated with the piece of code that’s accessing its properties it just might not be a problem. Nonetheless, if at some point we abstract this object away of its execution, we’d effectively be increasing the chances of making a mistake, i.e `formFields.mail.id` (been there done that).

## Introducing identity functions

Taken out of the Typescript docs:

> _The identity function is a function that will return back whatever is passed in._

At its most basic, this is an identity function:

```typescript
function identity(arg: number): number {
  return arg
}
```

Combining identity functions with generics will introduce you to a world of possibilities. And it’s in fact there where we’d find a solution to our problem. Baby steps. Let’s take the previous example and make it a bit more powerful:

```typescript
function identity<TArg>(arg: TArg) {
  return arg
}
```

Notice the `TArg` right next to the function name? That is a generic! Generics are like type variables that store types as values, giving you a way to compose reusable functions, components and classes. We can try to take this knowledge to our advantage and apply it to our `formFields` object:

```typescript
function asTypedFields<TFields>(fields: TFields) {
  return fields
}
```

Now we have `TFields` as our generic (you can name it as you prefer). Its only job is to capture the fields object, so that we can spit out a fully typed fields object. Nevertheless, this all might look fine at first sight, but sadly it isn’t. We are solving our problem when accessing properties, but we are bringing back the type safe problem on object creation:

```typescript
const formFields = asTypedFields({
  email: {
    // No type safety or autocomplete here :(
  },
})
```

This is happening because Typescript can’t predict the future (sometimes) and doesn’t know what is the type you’re intending to create. To solve this, we need a type that **_constructs_** the desired `formFields` object signature, and make **that** our functions’ argument:

```typescript
function asTypedFields<TFields>(fields: {
  [TKey in keyof TFields]: Field
}) {
  return fields
}
```

If you prefer to split it and make the type more readable, be my guest:

```typescript
type GetTypedFields<TFields> = {
  [TKey in keyof TFields]: Field
}

function asTypedFields<TFields>(fields: GetTypedFields<TFields>) {
  return fields
}
```

Notice how this type is effectively imitating the expected object signature: keys of `TFields` and values of type `Field`. Now we can safely create our object, get type safety on creation and execution:

```typescript
const formFields = asTypedFields({
  email: {
    id: 'email',
    name: 'user-email',
    placeholder: 'Inser your email',
    type: 'mail',
  },
  // ... everything is type safe 🎉
})

const emailField = formFields.email.id // `email` and `id` are type safe 🎉
```

## Improvements

We can still fine tune this a bit. This kind of issues are not extraordinary, it happens more than you think. With our solution so far, we’d have to create identity functions for every object where we need this kind of inference. Wouldn’t it be nice to have a reusable function that handles all cases? There’s a rabbit hole to go through, if you’re still here with me let’s jump in together!

First, let’s take a look at our solution so far and look fro dynamic vs. static parts:

- `[TKey in keyof TFields]`: this part is dynamic. We are working with the `TFields` generic, which captured our whole object and extracts the keys out of it
- `Fields`: this part is static, as we need to explicitly tell the compiler what will we be expecting

Great. So now we understand what’s the limitation of our function. We need to somehow also **_tell_** it what are the values we are going to be expecting. If we manage to achieve that, we can then create our reusable function 🎉

Generics are not only variables that capture type values, we can also manually **_tell_** it what is the type it should capture. Going back to our first identity example:

```typescript
function identity<TArg>(arg: TArg) {
  return arg
}

const foo = identity<string>('bar')
```

This looks like something we can pick up. What if we add a second generic to our function that expects the type value?

```typescript
function asTypedFields<TFields, TValue>(fields: {
  [TKey in keyof TFields]: TValue
}) {
  return fields
}
```

This presents us with a problem. `asTypedFields` now expects two generics. If we intend to manually set them, seems like extra work. Not only that, but also `TFields` is meant to be dynamic since we need to _infer_ its values. The same would happen if we flip the order or generics:

```typescript
function asTypedFields<TValue, TFields>(fields: {
  [TKey in keyof TFields]: TValue
}) {
  return fields
}

const formFields = asTypedFields<Field>({})
//                               ^? Expected 2 type arguments, but got 1
```

Hm. This is a bit frustrating, right? Fortunately, there’s a light at the end of the tunnel. Here’s a thought… What if we then split our generics into two nested functions? The parent can take the static type, and the child can take the dynamic type. Let’s try it out:

```typescript
function asTypedFields<TValue>() {
  return function <TFields>(fields: {[TKey in keyof TFields]: TValue}) {
    return fields
  }
}

const formFields = asTypedFields<Fields>()({
  email: {
    id: 'email',
    name: 'user-email',
    placeholder: 'Inser your email',
    type: 'mail',
  },
  // ... everything is type safe 🎉🎉🎉
})
```

Nice! Arguably the syntax looks a bit odd, but with this we can have a fully reusable function that gets us cover. We can do a little cleanup so that this function is fully reusable naming-wise:

```typescript
type GetTypedObject<TValue, TObject> = {
  [TKey in keyof TObject]: TValue
}

function asTypedObject<TValue>() {
  return function <TObject>(fields: GetTypedObject<TValue, TObject>) {
    return fields
  }
}
```

Well done 👏! You’ve successfully eradicated an annoying problem for good, and taken a step forward into full type safety 🏆
