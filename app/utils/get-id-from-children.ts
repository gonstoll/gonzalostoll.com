import * as React from 'react'

function isReactElement(child: unknown): child is React.ReactElement {
  return typeof child === 'object' && child !== null && 'props' in child
}

function flatten(text: string, child: React.ReactNode): string {
  if (typeof child === 'string') {
    return text + child
  }
  if (isReactElement(child)) {
    return React.Children.toArray(child?.props.children).reduce(flatten, text)
  }
  return ''
}

export function getIdFromChildren(children: Array<React.ReactNode>) {
  const text = children.reduce(flatten, '')
  const slug = text.toLowerCase().replace(/\W/g, '-')
  return slug
}
