/**
 * Parte del contenido scrapeado del SRD trae Markdown roto: negritas `**`
 * desparejadas o filas de tabla que no llegan a parsear como `<table>`
 * (p.ej. un salto de línea incrustado dentro de una celda). En vez de
 * mostrar la sintaxis cruda al usuario, se limpia antes/después de pasar
 * por `marked`.
 */

import { marked } from 'marked'
import DOMPurify from 'dompurify'

function forceCloseLastOpen(result: string): string {
  const lastOpen = result.lastIndexOf('**')
  return result.slice(0, lastOpen) + result.slice(lastOpen + 2)
}

/**
 * Repara negritas `**` mal colocadas por el scraping de origen. Se detectaron
 * dos patrones distintos que no se pueden distinguir con una regex simple:
 *
 * - Falta un salto de línea antes del marcador de apertura: `(gigante) **\nInit** +5`
 *   → se mueve el `\n` delante del `**`: `(gigante)\n**Init** +5`.
 * - Sobra un marcador de cierre huérfano justo antes de un par ya completo:
 *   `natural)**\n**PG** 28` → se retira el `**` sobrante: `natural)\n**PG** 28`.
 *
 * Recorre el texto llevando un estado "¿hay una negrita abierta?" para no
 * tocar los pares que ya están bien formados (p.ej. `**DEFENSA**\n**CA**`).
 * Los encabezados ATX (`#### ...`) y los saltos de párrafo cierran cualquier
 * negrita que quedara abierta dentro de ellos, porque en Markdown real un
 * encabezado no puede continuar en la siguiente línea/bloque.
 */
export function repairMisplacedBold(markdown: string): string {
  let result = ''
  let insideBold = false
  let onHeadingLine = markdown[0] === '#'
  let i = 0

  while (i < markdown.length) {
    if (markdown[i] === '\n') {
      const startsNewBlock = markdown[i + 1] === '\n' || markdown[i + 1] === '#'
      if (insideBold && (onHeadingLine || startsNewBlock)) {
        result = forceCloseLastOpen(result)
        insideBold = false
      }
      onHeadingLine = markdown[i + 1] === '#'
      result += '\n'
      i++
      continue
    }

    if (markdown[i] === '*' && markdown[i + 1] === '*') {
      if (!insideBold) {
        if (markdown[i + 2] === '\n') {
          // "**\n**Word**" — el primer ** es un cierre huérfano suelto, se descarta.
          if (markdown[i + 3] === '*' && markdown[i + 4] === '*') {
            i += 2
            continue
          }
          // "**\nWord**" — al ** de apertura le falta el \n delante: se mueve.
          result += '\n**'
          insideBold = true
          i += 3
          continue
        }
        result += '**'
        insideBold = true
        i += 2
        continue
      }
      result += '**'
      insideBold = false
      i += 2
      continue
    }

    result += markdown[i]
    i++
  }

  if (insideBold) result = forceCloseLastOpen(result)
  return result
}

/**
 * Cualquier "|" que sobreviva al parseo de `marked` es sintaxis de tabla
 * rota — una tabla bien formada nunca deja pipes literales en el HTML
 * resultante. Se limpian junto con los guiones de separador que quedan huérfanos.
 */
export function cleanupUnparsedTableArtifacts(html: string): string {
  return html
    .replace(/\|/g, ' ')
    .replace(/(^|\s)-{2,}(?=\s|$)/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
}

/**
 * Pipeline compartido para renderizar los campos `_es` en Markdown crudo del
 * schema `v1` (dotes, habilidades, clases, características...): repara
 * negritas mal colocadas, parsea a HTML, limpia artefactos de tabla sin
 * parsear y sanea el resultado antes de volcarlo con `dangerouslySetInnerHTML`.
 */
export function renderMarkdown(markdown: string): string {
  const html = marked.parse(repairMisplacedBold(markdown), { async: false, breaks: true }) as string
  return cleanupUnparsedTableArtifacts(DOMPurify.sanitize(html))
}
