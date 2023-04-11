---
title: Type safe object keys
date: '2023-04-10'
summary: How to get literal keys from an object, and solve the dreaded Object.keys() issue
categories:
  - typescript
meta:
  keywords:
    - typescript
    - object keys
    - Object.keys()
---

Raise your hand if you have written code like this and struggled with it:

```typescript
const person = {
  name: 'Peter',
  age: 25,
}

Object.keys(person).forEach(key => {
  console.log(person[key])
  //          ^ ❌ No index signature with a parameter of type 'string' was found on type '{ name: string; age: number; }'.
})
```

✋😅. No shame. But why does this happen?

There's an important rule to remember here, and it's that `Object.keys()` will return a type of `Array<string>`, **not** an array of its literal members.

In other words, Typescript doesn't give us a narrowed down type out of `Object.keys()`. Naturally, we would've expected that, inside our `forEach` loop, the `key` parameter was of type `'name' | 'age'`. Instead, Typescript's vision got blurry, lost sight of the shape of the original object, and in turn gave us a much broader type for the `key` paramater: a `string` type. Then, when we try to access `person`'s keys, Typescript (who already lost sight of the shape of our object) warns us that the key might not exist in the object.

So, we need to somehow **tell** Typescript "Hey, this is my object. **Remember it** because the keys are from there you silly goose!".

Hmmm... how can we make Typescript **remember** then?

## Generics

Again, generics will come to our rescue. [As we covered here](https://gonzalostoll.com/blog/identity-functions-and-how-we-can-make-use-of-them#introducing-identity-functions), generics are like type variables that **store** types as values. Sounds handy!

We will first create a function that will take our generic, **capturing** the object's shape:

```typescript
function objectKeys<TObj>(obj: TObj) {
  return Object.keys(obj)
}
```

There's a problem with this. Specifing a generic without a constrain is too wide. Typescript will not know that `TObj` is an object, and trying to do `Object.keys(obj)` on something that may or may not be an object ain't gonna fly with Typescript. So, we need a way to tell it that we are only getting an object here, and nothing else:

```typescript{1}
function objectKeys<TObj extends Record<any, any>>(obj: TObj) {
  return Object.keys(obj)
}

const wrongImpl = objectKeys('Sup')
// ❌ Argument of type 'string' is not assignable to parameter of type 'Record<any, any>'
```

## Working with type assertions

This looks better. Now our function only expects objects! However, we are still having the same issue. Even though the generic captures the shape of the object, `Object.keys()` sends it back to the void. This is where we need to **tell** Typescript what are these keys made of. For that, we need a type assertion:

```typescript{2}
function objectKeys<TObj extends Record<any, any>>(obj: TObj) {
  return Object.keys(obj) as Array<keyof TObj>
}
```

[Type assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions) are a way to tell Typescript "Hey, I know what I'm doing. Trust me, this is a `string`". In this case, we are telling Typescript "Hey, I know what I'm doing. Trust me, these are the keys of the object".

Generally, it's preferred to avoid assertions as Typescript is smart enough to infer types on its own. However, in this particular case, we have already constrained our function enough to be safe that what we are telling Typescript is true and accurate.

Now, we can use our function safely:

```typescript
const person = {
  name: 'Peter',
  age: 25,
}

objectKeys(person).forEach(key => {
  console.log(person[key])
  //          ^ ✅ No error. 'key' is of type 'name' | 'age'
})
```

## Conclusion

We have seen how to use generics to capture the shape of an object, and how to use type assertions to stir Typescript in the right direction **only when we are certain that direction is accurate** and we've done our due diligence to make sure that's right. This is a very useful pattern that can be used in many different scenarios.

If you liked this article, you might also like [this one](https://gonzalostoll.com/blog/identity-functions-and-how-we-can-make-use-of-them) where we cover identity functions and how we can make use of them.

If you have any questions or comments, feel free to reach out to me on [Twitter](https://twitter.com/gonzalostoll), [LinkedIn](https://www.linkedin.com/in/gonzalostoll/) or by [mail](mailto:stollgonzalo@gmail.com).

Til the next one!