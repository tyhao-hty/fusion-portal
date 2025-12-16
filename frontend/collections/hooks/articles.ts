import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { PayloadRequest } from 'payload'
import { sanitizeRichTextHtml } from '../../utils/sanitizeHtml'

type BeforeChangeArgs = {
  data?: any
  originalDoc?: any
  operation: 'create' | 'update'
  req: PayloadRequest
}

const WORDS_PER_MINUTE = 230

const safeConvertToHTML = (content: any) => {
  if (!content) return null
  try {
    return convertLexicalToHTML({ data: content })
  } catch (error) {
    console.error('articles: convertLexicalToHTML failed', error)
    return null
  }
}

const safeConvertToPlaintext = (content: any) => {
  if (!content) return ''
  try {
    return convertLexicalToPlaintext({ data: content })
  } catch (error) {
    console.error('articles: convertLexicalToPlaintext failed', error)
    return ''
  }
}

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

const calcReadingTimeMinutes = (text: string) => {
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0
  if (!words) return 0
  return Math.ceil(words / WORDS_PER_MINUTE)
}

export const applyArticleComputedFields = ({ data }: BeforeChangeArgs) => {
  if (!data) return data

  const next = { ...data }
  const rawHtml = safeConvertToHTML(data.content)
  const sanitizedHtml = sanitizeRichTextHtml(rawHtml)
  if (sanitizedHtml) {
    next.content_html = sanitizedHtml
  }

  const textForReading = sanitizedHtml ? stripHtml(sanitizedHtml) : stripHtml(safeConvertToPlaintext(data.content))
  if (textForReading) {
    next.readingTime = calcReadingTimeMinutes(textForReading)
  }

  return next
}

export const applyPublishedAt = ({ data, originalDoc, operation }: BeforeChangeArgs) => {
  if (!data) return data
  const isPublishing =
    data._status === 'published' && (operation === 'create' || originalDoc?._status !== 'published')
  if (isPublishing && !data.publishedAt) {
    return { ...data, publishedAt: new Date().toISOString() }
  }
  return data
}
