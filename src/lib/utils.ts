import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Extract plain text from Lexical JSON or return string as-is */
export function extractPlainText(richText: any): string {
  if (!richText) return ''
  if (typeof richText === 'string') return richText
  if (richText.root?.children) {
    const extractFromNodes = (nodes: any[]): string => {
      return nodes.map((node: any) => {
        if (node.type === 'text') return node.text || ''
        if (node.children) return extractFromNodes(node.children)
        return ''
      }).join(' ')
    }
    return extractFromNodes(richText.root.children).trim()
  }
  if (Array.isArray(richText)) {
    const extractFromNodes = (nodes: any[]): string => {
      return nodes.map((node: any) => {
        if (node.text) return node.text
        if (node.children) return extractFromNodes(node.children)
        return ''
      }).join(' ')
    }
    return extractFromNodes(richText).trim()
  }
  return ''
}
