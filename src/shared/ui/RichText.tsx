import type { ReactElement, ReactNode } from 'react'
import styles from './RichText.module.css'

/**
 * RichText — безопасный рендерер rich-text без внешних зависимостей.
 *
 * Поле «Подробное описание» услуги редактируется в CMS через richtext-редактор
 * Decap CMS, который сохраняет результат в формате CommonMark-разметки
 * (жирный, курсив, зачёркнутый, код, заголовки, списки, цитаты, ссылки,
 * изображения и таблицы). Ниже она разбирается и строится в React-элементы
 * со сквозной проверкой допустимых тегов: никакого innerHTML и произвольных
 * атрибутов, поэтому административный контент не может «сломать» страницу.
 */

type InlineNode = string | ReactElement

const INLINE_RE =
  /(`[^`]+`)|(\*\*[^*\n]+?\*\*)|(\*[^*\n]+?\*)|(~~[\s\S]+?~~)|(!\[([^\]]*)\]\(([^)\s]+)\))|(\[([^\]]+)\]\(([^)\s]+)\))/g

const HEADING_RE = /^(#{1,6})\s+(.*)$/
const FENCE_RE = /^(```+|~~~+)\s*(\S*)$/
const HR_RE = /^(-{3,}|\*{3,}|_{3,})\s*$/
const BLOCKQUOTE_RE = /^\s*>\s?(.*)$/
const LIST_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/
const LIST_LINE_RE = /^\s*([-*+]|\d+[.)])\s+/
const TABLE_SEP_RE = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/

function isBlank(line: string): boolean {
  return line.trim() === ''
}

function isListLine(line: string): boolean {
  return LIST_LINE_RE.test(line)
}

function isTableCellLine(line: string): boolean {
  // Строка-содержимое таблицы: в ней есть хотя бы одна вертикальная черта.
  return line.includes('|')
}

function splitCells(line: string): string[] {
  return line
    .split('|')
    .map((cell) => cell.trim())
    .filter((cell) => cell !== '')
}

function isTableSeparator(line: string): boolean {
  return TABLE_SEP_RE.test(line)
}

interface ListItem {
  indent: number
  ordered: boolean
  content: string
}

function parseListItem(line: string): ListItem | null {
  const match = LIST_RE.exec(line)
  if (!match) return null
  const marker = match[2]
  return {
    indent: match[1].replace(/\t/g, '  ').length,
    ordered: /\d/.test(marker[0]),
    content: match[3],
  }
}
function renderList(lines: string[], depth = 0): ReactElement {
  const parsed = lines.map((line) => parseListItem(line)).filter(Boolean) as ListItem[]
  let minIndent = Infinity
  for (const item of parsed) minIndent = Math.min(minIndent, item.indent)
  const ordered = parsed.find((item) => item.indent === minIndent)?.ordered ?? false

  const items: ReactElement[] = []
  let i = 0
  while (i < lines.length) {
    const item = parseListItem(lines[i])
    if (!item || item.indent !== minIndent) {
      i += 1
      continue
    }

    let j = i + 1
    const rest: string[] = []
    while (j < lines.length) {
      const next = parseListItem(lines[j])
      if (next && next.indent <= minIndent) break
      if (isBlank(lines[j])) {
        j += 1
        continue
      }
      rest.push(lines[j])
      j += 1
    }

    const textParts: string[] = [item.content]
    const nested: string[] = []
    for (const restLine of rest) {
      const restItem = parseListItem(restLine)
      if (restItem && restItem.indent > minIndent) nested.push(restLine)
      else textParts.push(restLine)
    }

    const nodeKey = `${depth}-${i}`
    items.push(
      <li key={nodeKey} className={styles.item}>
        {renderInline(textParts.join(' '), nodeKey)}
        {nested.length > 0 ? renderList(nested, depth + 1) : null}
      </li>,
    )
    i = j
  }

  return ordered ? (
    <ol key={`ol-${depth}`} className={styles.ordered}>{items}</ol>
  ) : (
    <ul key={`ul-${depth}`} className={styles.unordered}>{items}</ul>
  )
}

function renderTable(lines: string[], tableKey: number): ReactNode {
  const header = splitCells(lines[0])
  const body = lines.slice(2).map(splitCells).filter((row) => row.length > 0)
  return (
    <div className={styles.tableWrap} key={`table-${tableKey}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            {header.map((cell, index) => (
              <th key={index}>{renderInline(cell, `th-${tableKey}-${index}`)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{renderInline(cell, `td-${tableKey}-${rowIndex}-${cellIndex}`)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
function renderBlocks(lines: string[]): ReactNode[] {
  const nodes: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]
    if (isBlank(line)) {
      i += 1
      continue
    }

    // fenced code block
    const fence = FENCE_RE.exec(line)
    if (fence) {
      const opening = fence[1]
      const marker = opening[0]
      const length = opening.length
      const closeRe = new RegExp(`^[${marker}]{${length},}\\s*$`)
      const code: string[] = []
      i += 1
      while (i < lines.length && !closeRe.test(lines[i])) {
        code.push(lines[i])
        i += 1
      }
      i += 1 // закрывающий блок (или конец документа)
      nodes.push(
        <pre key={`pre-${key++}`} className={styles.pre}>
          <code className={styles.codeBlock}>{code.join('\n')}</code>
        </pre>,
      )
      continue
    }

    // heading
    const heading = HEADING_RE.exec(line)
    if (heading) {
      const level = Math.min(heading[1].length, 6)
      const Tag = `h${level}` as 'h1'
      nodes.push(
        <Tag key={`h-${key++}`} className={styles.heading}>
          {renderInline(heading[2].trim(), `heading-${key}`)}
        </Tag>,
      )
      i += 1
      continue
    }

    // blockquote
    if (BLOCKQUOTE_RE.test(line)) {
      const inner: string[] = []
      while (i < lines.length && BLOCKQUOTE_RE.test(lines[i])) {
        inner.push(lines[i].replace(/^\s*>\s?/, ''))
        i += 1
      }
      nodes.push(
        <blockquote key={`quote-${key++}`} className={styles.blockquote}>
          {renderBlocks(inner)}
        </blockquote>,
      )
      continue
    }

    // horizontal rule
    if (HR_RE.test(line)) {
      nodes.push(<hr key={`hr-${key++}`} className={styles.hr} />)
      i += 1
      continue
    }

    // список (пункты + вложенные строки-продолжения)
    if (isListLine(line)) {
      const listLines: string[] = []
      while (
        i < lines.length &&
        !isBlank(lines[i]) &&
        (isListLine(lines[i]) || !isBlockStart(lines[i]))
      ) {
        listLines.push(lines[i])
        i += 1
      }
      nodes.push(
        <div key={`list-${key++}`}>{renderList(listLines)}</div>,
      )
      continue
    }

    // таблица — строка с «|», за которой идёт разделитель |---|---|
    if (isTableCellLine(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const tableLines: string[] = []
      while (i < lines.length && isTableCellLine(lines[i])) {
        tableLines.push(lines[i])
        i += 1
      }
      nodes.push(renderTable(tableLines, key++))
      continue
    }

    // параграф
    const paragraph: string[] = [line.trim()]
    i += 1
    while (
      i < lines.length &&
      !isBlank(lines[i]) &&
      !isBlockStart(lines[i]) &&
      !(isTableCellLine(lines[i]) && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
    ) {
      paragraph.push(lines[i].trim())
      i += 1
    }
    nodes.push(
      <p key={`p-${key++}`} className={styles.paragraph}>
        {renderInline(paragraph.join(' '), `paragraph-${key}`)}
      </p>,
    )
  }

  return nodes
}

function isBlockStart(line: string): boolean {
  return (
    HEADING_RE.test(line) ||
    FENCE_RE.test(line) ||
    BLOCKQUOTE_RE.test(line) ||
    HR_RE.test(line) ||
    isListLine(line)
  )
}
function renderInline(text: string, keyBase: string): InlineNode[] {
  // Отдельный экземпляр регулярки на каждый вызов: renderInline рекурсивно
  // обрабатывает вложенный жирный/курсив/ссылки, и общий /g-паттерн с общим
  // lastIndex при параллельной итерации зацикливался бы навсегда.
  const re = new RegExp(INLINE_RE.source, INLINE_RE.flags)
  const out: InlineNode[] = []
  let last = 0
  let index = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index))
    const key = `${keyBase}:${index}`
    index += 1

    if (match[1] !== undefined) {
      // inline code
      out.push(<code key={key} className={styles.codeInline}>{match[1].slice(1, -1)}</code>)
    } else if (match[2] !== undefined) {
      // bold
      out.push(<strong key={key}>{renderInline(match[2].slice(2, -2), key)}</strong>)
    } else if (match[3] !== undefined) {
      // italic
      out.push(<em key={key}>{renderInline(match[3].slice(1, -1), key)}</em>)
    } else if (match[4] !== undefined) {
      // strikethrough
      out.push(<s key={key}>{renderInline(match[4].slice(2, -2), key)}</s>)
    } else if (match[5] !== undefined) {
      // image
      out.push(<img key={key} className={styles.image} src={match[7]} alt={match[6] ?? ''} />)
    } else if (match[8] !== undefined) {
      // link
      const href = match[10]
      const external = /^(https?:)?\/\//i.test(href) || href.startsWith('mailto:')
      out.push(
        <a
          key={key}
          className={styles.link}
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
        >
          {renderInline(match[9], key)}
        </a>,
      )
    }
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

interface RichTextProps {
  /** Разметка из richtext-редактора CMS (CommonMark). */
  text: string
  /** Дополнительный класс к обёртке root. */
  className?: string
}

export function RichText({ text, className }: RichTextProps): ReactNode {
  if (!text) return null
  const blocks = renderBlocks(text.replace(/\r\n?/g, '\n').split('\n'))
  const rootClass = className ? `${styles.root} ${className}` : styles.root
  return <div className={rootClass}>{blocks}</div>
}