'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { CurrencyConverterNode } from '../nodes/currency-converter-node'

interface CurrencyConverterAttributes {
  fromCurrency: string
  toCurrency: string
  fromAmount: string
  toAmount: string
}

const CurrencyConverterExtension = Node.create<{
  HTMLAttributes: Record<string, any>
}>({
  name: 'currencyConverterBlock',
  group: 'block',
  atom: true,

  addAttributes () {
    const defaults: CurrencyConverterAttributes = {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      fromAmount: '1',
      toAmount: ''
    }
    return defaults
  },

  parseHTML () {
    return [
      {
        tag: 'div[data-type="currency-converter-block"]'
      }
    ]
  },

  renderHTML ({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'currency-converter-block'
      })
    ]
  },

  addNodeView () {
    return ReactNodeViewRenderer(CurrencyConverterNode)
  }
})

export default CurrencyConverterExtension
