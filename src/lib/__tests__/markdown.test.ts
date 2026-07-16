import { describe, it, expect } from 'vitest'
import { repairMisplacedBold, cleanupUnparsedTableArtifacts } from '../markdown'

describe('repairMisplacedBold', () => {
  it('deja intacto el markdown con negritas bien emparejadas', () => {
    const md = '**Beneficio**: Siempre que **ataques**, ganas +1.'
    expect(repairMisplacedBold(md)).toBe(md)
  })

  it('no toca pares ya completos separados por salto de línea', () => {
    const md = '**DEFENSA**\n**CA** 20, toque 11'
    expect(repairMisplacedBold(md)).toBe(md)
  })

  it('mueve el salto de línea delante del marcador cuando falta antes de él', () => {
    const md = 'CN Humanoides Medianos (gigante) **\nInit** +5'
    expect(repairMisplacedBold(md)).toBe('CN Humanoides Medianos (gigante) \n**Init** +5')
  })

  it('retira un marcador de cierre huérfano pegado a un par ya completo', () => {
    const md = '(+4 armadura, +1 Des, +5 natural)**\n**PG** 28 (3d10+12)'
    expect(repairMisplacedBold(md)).toBe('(+4 armadura, +1 Des, +5 natural)\n**PG** 28 (3d10+12)')
  })

  it('cierra la negrita al llegar a un encabezado ATX en vez de dejarla abierta', () => {
    const md = '#### **Deformidades del Enano Gigante (Ex)\n**\nLa cabeza...'
    expect(repairMisplacedBold(md)).toBe('#### Deformidades del Enano Gigante (Ex)\n\nLa cabeza...')
  })

  it('retira la apertura final si el documento termina con una negrita sin cerrar', () => {
    expect(repairMisplacedBold('texto **sin cerrar')).toBe('texto sin cerrar')
  })
})

describe('cleanupUnparsedTableArtifacts', () => {
  it('elimina pipes y guiones de separador sueltos que no formaron una tabla real', () => {
    const html = '<p>| Enano Gigante | FD 3 |</p><p>| --- | --- |</p>'
    const result = cleanupUnparsedTableArtifacts(html)
    expect(result).not.toContain('|')
    expect(result).not.toContain('---')
  })

  it('no toca una tabla HTML ya parseada correctamente', () => {
    const html = '<table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>'
    expect(cleanupUnparsedTableArtifacts(html)).toBe(html)
  })
})
