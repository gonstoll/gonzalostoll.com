---
title: Why and how to void impossible states with Typescript
date: '2023-03-29'
summary: Use Typescript and discriminated unions to avoid impossible states
categories:
  - typescript
  - react
meta:
  keywords:
    - typescript
    - discriminated unions
    - impossible states
    - union types
---

Often times we are presented with a problem where we need to handle a set of states that are mutually exclusive, each one containing a different set of properties.

For example, let's say we are building a Banner component in React, with two different variants: `primary` and `secondary`. The `primary` variant also expects a `subtitle` property, whereas the `secondary` variant instead expects a `isFixed` boolean property.

Here's a fair first attempt at defining the props for this component:

```tsx
import * as React from 'react'

type BannerProps = {
  title: string
  variant: 'primary' | 'secondary'
  subtitle?: string
  isFixed?: string
}

export default function Banner({
  title,
  children,
  variant,
  subtitle,
  isFixed,
}: React.PropsWithChildren<BannerProps>) {
  return (
    <div className={isFixed ? 'fixed top-0' : null}>
      <h2 className={variant === 'primary' ? 'text-lg' : 'text-base'}>
        {title}
      </h2>
      {subtitle ? <p>{subtitle}</p> : null}
      <div>{children}</div>
    </div>
  )
}
```

There's nothing specifically wrong about this approach. However, we as developers usually have to write code and components that are meant to be reusable not only by us, but also by other developers. Imagine if this component lives in a UI library we are building from scratch, another developer might pick this one up and use like so:

```tsx{5}
...
  <Banner
    variant="primary"
    title="Banner title"
    subtitle="Banner subtitle"
    isFixed // Yikes, this shouldn't be possible
  >
    Some cool banner content here
  </Banner>
...
```

Granted, this is a contrived example. But you get my point. Let's imagine for a second the other developer didn't read the source code for this component and used it like that. It becomes a problem since `isFixed` is not supposed to be used on a `primary` variant! The same would go viceversa, `subtitle` is only meant to be supported by the `primary` variant, yet nothing is stopping us from provinding a subtitle to a `secondary` variant 😬

Ok, so let's try another approach then:

```tsx
export default function Banner({
  title,
  children,
  variant,
  subtitle,
  isFixed,
}: React.PropsWithChildren<BannerProps>) {
  if (variant === 'primary') {
    return (
      <div>
        <h2 className={variant === 'primary' ? 'text-lg' : 'text-base'}>
          {title}
        </h2>
        {subtitle ? <p>{subtitle}</p> : null}
        <div>{children}</div>
      </div>
    )
  }

  return (
    <div className={isFixed ? 'fixed top-0' : null}>
      <h2 className={variant === 'primary' ? 'text-lg' : 'text-base'}>
        {title}
      </h2>
      <div>{children}</div>
    </div>
  )
}
```

This is... better. Our component is sure enough not going to break now, as there's no `subtitle` playing a role on the `secondary` variant, and no `isFixed` on the `primary` variant.

But, things get complicated if we add more complexity to the API on this component. What if we would need to make `subtitle` a required property of the `primary` variant? There's no way we can do that now with our current API.

Moreover, going back to the _other developer_, things look pretty much the same. They will be able to provide any set of properties regardles of the `variant` they choose. So, why is that?

## Discriminated unions

This is happening because of the shape of our props type. We are providing a set of optional properties by default, and so all of them can be declared at any given time. What we need is a way to **constrain** the component's properties depending on the chosen `variant`. In essense, we need Typescript to norrow down the possible current type for us. This is exactly what discriminated unions are useful for. Let's work with them in our example to better understand this:

```tsx{3-7,10-13,15,20}
import * as React from 'react'

type PrimaryBanner = {
  title: string
  variant: 'primary'
  subtitle: string
}

type SecondaryBanner = {
  title: string
  variant: 'secondary'
  isFixed?: boolean
}

type BannerProps = PrimaryBanner | SecondaryBanner
```

Notice how now we have two distinct types: `PrimaryBanner` and `SecondaryBanner`? They both share `title` and `variant`, however their `variant` literal is different. When Typescript sees this it considers it to be a discriminated union, and can effectively narrow **out** members of the union. This means our `variant` property is now the **discriminator** (or "differentiator" if you will) between the two types, which also means we can do something like this:

```tsx{4}
export default function Banner({
  title,
  children,
  ...props
}: React.PropsWithChildren<BannerProps>) {
  if (props.variant === 'primary') {
    return (
      <div>
        <h2 className="text-lg">
          {title}
        </h2>
        <p>{props.subtitle}</p>
        <div>{children}</div>
      </div>
    )
  } else {
    return (
      <div className={props.isFixed ? 'fixed top-0' : ''}>
        <h2 className="text-base">
          {title}
        </h2>
        <p>{props.subtitle}</p>
        {/* ^ ❌ Property 'subtitle' does not exist on type '{ variant: "secondary"; isFixed?: boolean | undefined; }' */}
        <div>{children}</div>
      </div>
    )
  }
}
```

This is great! There's also a hidden improvement with this approach, we managed to make `subtitle` a required property of the `primary` variant 🎉! It goes to say, with discriminated unions you have the freedom of shaping each specific time the way you want. Typescript will just pick the right type and apply it!

## Destructuring props

Furthermore, notice how now we are not desctructuring all the props? That's because only `title` and `variant` are the props shared between the two, but `title` is the only one that keeps its shape between the two. If it helps, let's look at our prop types again and do some rearranging:

```tsx{11}
type PrimaryBanner = {
  variant: 'primary'
  subtitle: string
}

type SecondaryBanner = {
  variant: 'secondary'
  isFixed?: boolean
}

type BannerProps = {title: string} & (PrimaryBanner | SecondaryBanner)
```

Hopefully this makes it more clear! If we were to also destructure `variant` from this shape, then no narrowing will be applied! Here's why:

```tsx
export default function Banner({
  title,
  children,
  variant,
  // Huh... we can't destructure `subtitle` and `isFixed` because we don't know if they'll ever exist 🤔 Guess we are back to spreading the rest of the props
  ...props
}: React.PropsWithChildren<BannerProps>) {
  if (variant === 'primary') {
    // Huh... now `variant` is one constant and `props` is another one that has no type narrowing. This is no bueno!
  }
}
```

What's also cool about our approach is that the _other developer_ will now pick up our component and have proper suggestions depending on the chosen `variant`:

```tsx
...
  <Banner
    variant="primary"
    title="Banner title"
    subtitle="Banner subtitle"
    isFixed // ❌ Property 'isFixed' does not exist on type 'IntrinsicAttributes & PrimaryBanner & { children?: ReactNode; }'
  >
    Some cool banner content here
  </Banner>
...
```

Notice how also our error message infers that the `PrimaryBanner` type is being used. Typescript is so cool!

## Conclusion

I hope this article was helpful and you learned something new! I'm sure there are other ways to achieve the same result, but this is the one I found to be the most straightforward and easy to understand. If you have any questions or suggestions, feel free to reach out to me on Twitter [@gonstoll](https://twitter.com/gonstoll), [Linkedin](https://www.linkedin.com/in/gonzalostoll/) or by [mail](mailto:stollgonzalo@gmail.com). I'm always happy to chat!

Cheers!
