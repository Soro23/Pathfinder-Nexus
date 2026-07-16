import { describe, it, expect } from 'vitest'
import { formatCR } from '../formatCR'

describe('formatCR', () => {
  it('formatea los CR fraccionarios de NPCs (redondeados a 2 cifras en BD)', () => {
    expect(formatCR(0.5)).toBe('1/2')
    expect(formatCR(0.33)).toBe('1/3')
    expect(formatCR(0.25)).toBe('1/4')
    expect(formatCR(0.17)).toBe('1/6')
  })

  it('formatea 1/8, por si se añaden monstruos con ese CR', () => {
    expect(formatCR(0.13)).toBe('1/8')
    expect(formatCR(0.125)).toBe('1/8') // valor exacto usado en la tabla `monsters`
  })

  it('usa tolerancia ±0.01 en vez de igualdad exacta de flotantes', () => {
    expect(formatCR(0.51)).toBe('1/2')
    expect(formatCR(0.49)).toBe('1/2')
    expect(formatCR(0.34)).toBe('1/3')
    expect(formatCR(0.16)).toBe('1/6')
  })

  it('formatea enteros sin decimales', () => {
    expect(formatCR(1)).toBe('1')
    expect(formatCR(5)).toBe('5')
    expect(formatCR(20)).toBe('20')
    expect(formatCR(27)).toBe('27')
  })

  it('no confunde un entero con un fraccionario cercano', () => {
    expect(formatCR(0)).toBe('0')
    expect(formatCR(1)).not.toBe('1/2')
  })

  it('devuelve "—" para valores desconocidos', () => {
    expect(formatCR(null)).toBe('—')
    expect(formatCR(undefined)).toBe('—')
    expect(formatCR(NaN)).toBe('—')
  })
})
