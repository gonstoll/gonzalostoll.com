import rangeParser from 'parse-numeric-range'
import type {Language} from 'prism-react-renderer'
import Highlight, {defaultProps} from 'prism-react-renderer'
import * as React from 'react'
import {classNames} from '~/utils/class-names'

function getHighlightLines(meta: string) {
  const HIGHLIGHT_REGEX = /{([\d,-]+)}/
  const parsedMeta = HIGHLIGHT_REGEX.exec(meta)
  if (!parsedMeta) {
    return []
  }
  return rangeParser(parsedMeta[1])
}

function getLanguageFromClassName(className: string) {
  const match = className.match(/language-(\w+)/)
  return match ? match[1] : ''
}

function isLanguageSupported(lang: string): lang is Language {
  return (
    lang === 'markup' ||
    lang === 'bash' ||
    lang === 'clike' ||
    lang === 'c' ||
    lang === 'cpp' ||
    lang === 'css' ||
    lang === 'javascript' ||
    lang === 'jsx' ||
    lang === 'coffeescript' ||
    lang === 'actionscript' ||
    lang === 'css-extr' ||
    lang === 'diff' ||
    lang === 'git' ||
    lang === 'go' ||
    lang === 'graphql' ||
    lang === 'handlebars' ||
    lang === 'json' ||
    lang === 'less' ||
    lang === 'makefile' ||
    lang === 'markdown' ||
    lang === 'objectivec' ||
    lang === 'ocaml' ||
    lang === 'python' ||
    lang === 'reason' ||
    lang === 'sass' ||
    lang === 'scss' ||
    lang === 'sql' ||
    lang === 'stylus' ||
    lang === 'tsx' ||
    lang === 'typescript' ||
    lang === 'wasm' ||
    lang === 'html'
  )
}

export default function CodeBlock({children}: React.PropsWithChildren<object>) {
  if (!children) throw Error('CodeBlock: children is required')

  const childrenArray = React.Children.toArray(children)
  const codeElement = childrenArray[0] as React.ReactElement
  const className = codeElement?.props?.className || ''
  const code = codeElement.props.children[0] || ''
  const lang = getLanguageFromClassName(className)
  const lines = getHighlightLines(className)

  if (!isLanguageSupported(lang)) {
    throw Error(`CodeBlock: language ${lang} is not supported`)
  }

  return (
    <Highlight
      {...defaultProps}
      theme={undefined}
      code={code.trim()}
      language={lang || 'bash'}
    >
      {({className, tokens, getLineProps, getTokenProps}) => (
        <pre
          className={classNames(
            'my-6 overflow-auto rounded-lg bg-codeBg py-4 font-mono text-base duration-300',
            className
          )}
        >
          <code className={className}>
            {tokens.map((line, key) => {
              const lineNumber = key + 1

              return (
                <span
                  key={key}
                  {...getLineProps({line, key})}
                  data-line-number={lineNumber}
                  className={classNames(
                    getLineProps({line, key}).className,
                    'relative block pr-4 before:duration-300',
                    {'highlighted-line': lines.includes(lineNumber)}
                  )}
                >
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({token, key})} />
                  ))}
                </span>
              )
            })}
          </code>
        </pre>
      )}
    </Highlight>
  )
}
