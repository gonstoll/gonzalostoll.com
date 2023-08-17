---
title: Identity functions and how we can make use of them
date: '2023-03-27'
summary: Leverage better type safety in dynamic objects with Typescript
published: true
categories:
  - typescript
meta:
  keywords:
    - typescript
    - object suggestions
    - satisfies
    - identity functions
    - generics
---

Have you struggled with Typescript’s object suggestions sometimes? Do you feel like you’re missing out on some of the benefits of Typescript? Well, you’re definitely not alone. This has bitten me quite a few times, so in this article we’ll explore how to leverage better type safety in dynamic objects with Typescript.

If you're running with Typescript v4.9 or higher, you can skip to the [Using the satisfies operator](#using-the-satisfies-operator) section, where we discover a clean and readable solution to this particular issue. However, across this article we are going to cover the basics of generics and identity functions, and how we can use them to solve this problem. If you are unfamiliar with these concepts, I'd recommend you to read along!

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

This is the default behaviour and quite frankly, something predictable. For small, simple and flat objects this might be all you need. However things get complicated when we have a more complex data structure and we need to make sure our properties are type safe. Take the following example:

```typescript
const formFields = {
  email: {
    id: 'email',
    name: 'user-email',
    placeholder: 'Insert your email',
    type: 'mail',
  },
  // ...
}
```

Considering this is an object that holds the configuration to setup a contact form, we’d want to make sure we don’t have a typo or miss a crucial property, to avoid things like:

```typescript{6}
const formFields = {
  email: {
    id: 'email',
    name: 'user-email',
    placeholder: 'Insert your email',
    type: 'email',
  },
}
```

As you might know, `email` is not an existing type of `input`. Typescript won't warn us about this, yet this is a common mistake that can be easily avoided with Typescript. So, we might feel tempted to then do something like this:

```typescript
type Field = {
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

This is the solution I've seen in so many places, and at a first glance it looks like all we need. When we create the object, we get autocomplete from Typescript. Great! However there’s a problem waiting for future us:

```typescript
const emailField = formFields.email.id // `email` and `id` are not suggested here
//    ^? const emailField: string
```

Why is this happening? Well, this is because of how we annotated our `formFields` object. We basically told Typescript: “Hey, this object should have properties of type `string` and values of type `Field`”. By doing so, typescript completely looses track of your keys literals, and in doing so it also looses track of all subsequent nested properties.

This may not look as a complete train wreck at first sight. Arguably if you have this object colocated with the piece of code that’s accessing its properties it just might not be a problem. Nonetheless, if at some point we abstract this object away of its execution, we’d effectively be increasing the chances of making a mistake, i.e `formFields.mail.id` (been there done that).

## Introducing identity functions

Taken out of the Typescript docs:

> The identity function is a function that will return back whatever is passed in.

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

Notice the `TArg` right next to the function name? That is a generic! Generics are like type variables that store types as values, giving you a way to compose reusable functions, components and classes. You can learn more about generics [here](https://www.typescriptlang.org/docs/handbook/2/generics.html#handbook-content).

Now we can try to take this knowledge to our advantage and apply it to our `formFields` object:

```typescript
function asTypedFields<TFields>(fields: TFields) {
  return fields
}
```

We now have `TFields` as our generic (you can name it as you prefer). Its only job is to capture the fields object, so that we can spit out a fully typed fields object. This is the first step towards our goal. Let’s try it out:

```typescript
const formFields = asTypedFields({
  email: {
    // No type safety or autocomplete here :(
  },
})
```

This is happening because Typescript can’t predict the future (sometimes) and doesn’t know what is the type you’re intending to create. To solve this, we need a type that **constructs** the desired `formFields` object signature, and make **that** our functions’ argument:

```typescript
function asTypedFields<TFields>(fields: {
  [TKey in keyof TFields]: Field
}) {
  return fields
}
```

Notice how this type is effectively imitating the expected object signature: keys of `TFields` and values of type `Field`. Now we can safely create our object and get type safety on creation and execution:

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

Sweet! Now we can really feel we are taking advantage of having Typescript by our side, and gain back the confidence it gives us when writing code!

We can totally leave it there and carry on with our next task. However, this kind of issues are not that rare, they happen more than you think. With the solution we have so far, we’d have to create identity functions for every object where we need this kind of inference. Wouldn’t it be nice to have a reusable function that handles all cases? There’s a rabbit hole to go through, if you’re still here with me let’s jump in together!

First, let’s take a look at our solution so far and distinguish between dynamic vs. static parts:

- `[TKey in keyof TFields]`: this part is **dynamic**. We are working with the `TFields` generic, who's job is to capture our whole objects' signature. We then extract the keys out of it
- `Fields`: this part is static, as we need to explicitly tell the compiler what we will be expecting the values to be

Great. With this knowledge now we understand what’s the limitation of our function. We need to somehow also **tell** the function what are the values we are going to be expecting. If we manage to achieve that, we can then create our reusable function 💪

Generics are not only variables that capture type values, we can also manually **tell** them what is the type they should capture. Going back to our first identity example:

```typescript
function identity<TArg>(arg: TArg) {
  return arg
}

const foo = identity<string>('bar')
//                  ^ We are manually telling Typescript that `TArg` should be a string
```

This looks like something we can pick up. What if we add a second generic to our function that expects the type value? Something like this:

```typescript
function asTypedObject<TObj, TValue>(obj: {
  [TKey in keyof TObj]: TValue
}) {
  return obj
}
```

This presents us with a problem. `asTypedObject` expects two generics. If we intend to manually set them, it seems like extra work. Not only that, but also `TObj` is meant to be dynamic since we need to _infer_ its values. Ok, so maybe we can just flip the order of the generics and make `TValue` the first one:

```typescript
function asTypedObject<TValue, TObj>(obj: {
  [TKey in keyof TObj]: TValue
}) {
  return obj
}

const formFields = asTypedObject<Field>({})
//                               ^? Expected 2 type arguments, but got 1
```

Hm. This is a bit frustrating, right? Fortunately, there’s a light at the end of the tunnel. Here’s a thought… What if we then split our generics into two nested functions? The parent can take the static type, and the child can take the dynamic type. Let’s try it out:

```typescript
function asTypedObject<TValue>() {
  //                   ^ This will be the static type, we can manually set it
  return function <TObj>(obj: {[TKey in keyof TObj]: TValue}) {
    //             ^ This will be the dynamic type, it'll be inferred from the object we pass in
    return obj
  }
}

const formFields = asTypedObject<Field>()({
  email: {
    id: 'email',
    name: 'user-email',
    placeholder: 'Inser your email',
    type: 'mail',
    // ... all these properties are now type safe 🎉🎉🎉
  },
})
```

Nice! Arguably the syntax looks a bit odd, but with this we can have a fully reusable function that gets us cover. We can even do a little cleanup so that this function is more readable by extracting the type into a separate type alias:

```typescript{1-3}
type GetTypedObject<TValue, TObj> = {
  [TKey in keyof TObj]: TValue
}

function asTypedObject<TValue>() {
  return function <TObj>(obj: GetTypedObject<TValue, TObj>) {
    return obj
  }
}
```

Well done 👏! You’ve successfully eradicated an annoying problem for good, and taken a step forward into full type safety 🏆

## Using the `satisfies` operator

Typescript v4.9 introduced `satisfies`, a new operator that will help us achieve the same result with a **much** cleaner approach. You can read more about it and how it works [here](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator). Let’s take a look at how it can help us in our scenario:

```typescript
const formFields = {
  email: {
    id: 'email',
    name: 'user-email',
    placeholder: 'Inser your email',
    type: 'mail',
    // ... all these properties are now type safe 🎉🎉🎉
  },
} satisfies Record<string, Field>

const emailField = formFields.email.id // `email` and `id` are type safe 🎉
```

How cool is that? `satisfies` lets us check, while we create an object, if the properties match the expected type. In our case, we want an object of keys of type `string`, and values of type `Field`.

On the other end, when we consume the object, `satifies` matches the type of the object and its properties with its most specific type. In our case, the keys that were of type `string` are now their literal type (`email`, etc).

This shows us how we can use `satisfies` to achieve the same result as our previous solution, with a lot less lines of code and quite frankly, with a lot more readability. This is a very powerful operator that can be used in many different scenarios, and I encourage you to read the documentation to learn more about it.

## Conculsion

Although this is a contrived example, it shows you how you can use generics to your advantage. There are many more use cases where you can apply this knowledge, and I hope this article has given you a good starting point. If you have any questions or comments, feel free to reach out to me on Twitter [@gonstoll](https://twitter.com/gonstoll), [Linkedin](https://www.linkedin.com/in/gonzalostoll/) or by [mail](mailto:stollgonzalo@gmail.com), I’ll be happy to help.

Thanks for reading!Thanks for reading!
