# Auditoría de fórmulas Pathfinder (Personajes y Campañas)

Fecha: 2026-07-17
Estado: **⚠️ DOCUMENTO HISTÓRICO — TODOS LOS HALLAZGOS ACCIONABLES YA FUERON CORREGIDOS.**
Ver [`AUDITORIA_FORMULAS_2.md`](AUDITORIA_FORMULAS_2.md) para el estado actual del código tras las correcciones (fecha 2026-07-17, segunda pasada). Este archivo se conserva como registro de qué se encontró y qué se decidió hacer con cada punto.

Alcance: todo cálculo de reglas Pathfinder 1e (d20/SRD 3.5) que afecte a `Character` (ficha, creación, subida de nivel, modo de juego) y a `Campaign` (encuentros, grupo). No cubre Bestiary/NPCs de forma exhaustiva salvo donde comparten código con personajes.

Leyenda de veredicto (en el momento de esta auditoría):
- ✅ Correcto — coincide con la regla SRD/Pathfinder.
- ⚠️ Con matices — correcto en el caso general pero incompleto, inconsistente entre pantallas, o es una simplificación deliberada discutible.
- ❌ Incorrecto — produce un resultado distinto al que dictan las reglas.

Leyenda de estado (columna añadida tras la corrección):
- 🟢 **Corregido** — se aplicó un cambio de código para resolver el hallazgo.
- ⚪ **Sin cambio** — ya era correcto, o es una decisión de diseño aceptada tal cual (documentada, no es un bug).

---

## 0. Resumen ejecutivo

| # | Fórmula | Veredicto (al auditar) | Estado | Impacto |
|---|---|---|---|---|
| 1 | Stacking de modificadores (`engine/modifiers.ts`) | ✅ | ⚪ Sin cambio | Núcleo del motor, correcto. El matiz sobre penalizaciones tipadas se documenta pero se acepta tal cual (no se dispara con los datos actuales) |
| 2 | Modificador de característica | ✅ | ⚪ Sin cambio | — |
| 3 | BAB por nivel (full/medium/poor) | ✅ | ⚪ Sin cambio | — |
| 4 | Multiclase BAB/salvaciones (`getMulticlassStats`) | ✅ (pero inconsistente entre pantallas) | 🟢 Corregido | `PartyCard.tsx` ahora usa `computeCombatStats` (multiclase real) |
| 5 | Salvaciones (buena/mala) | ✅ | 🟢 Corregido | Misma corrección que #4 |
| 6 | Bono de ataque total | ⚠️ | 🟢 Corregido | Tamaño añadido vía `computeWeaponAttackBonus(..., sizeMod)`; `WeaponManager.tsx` queda sin tocar por ser código muerto (no se usa en ningún sitio) |
| 7 | Daño de arma | ⚠️ | 🟢 Corregido | Campo `Weapon.grip` + `getStrDamageBonus` (×1.5 dos manos, ×0.5 secundaria) |
| 8 | Power Attack | ⚠️ | 🟢 Corregido | `getPowerAttackDamageBonus` (×3 dos manos, ×1 secundaria) |
| 9 | CMB / CMD | ⚠️ | 🟢 Corregido | Tamaño + consistencia vía `computeCombatStats` |
| 10 | Clase de Armadura (AC/Touch/Flat-footed) | ❌ | 🟢 Corregido | Unificado en `computeCombatStats`; tamaño, tope `maxDex` en toque, y bono genérico `ac` ya se aplican en las 4 pantallas activas |
| 11 | Puntos de golpe (HP) | ✅ (creación y subida de nivel) | 🟢 Corregido | `resolvedStats.hpBonus` (dotes/objetos, p.ej. Toughness si existe en el catálogo vivo) ahora se suma al máximo mostrado |
| 12 | Iniciativa | ✅ | ⚪ Sin cambio | — |
| 13 | Habilidades (total y rango máximo) | ⚠️ | 🟢 Corregido | `computeSkillTotal` unificado — ACP y tamaño (Sigilo/Volar) ya se aplican en las 3 pantallas |
| 14 | **Puntos de habilidad disponibles** | ❌ | 🟢 Corregido | `computeSkillPointsAvailable` — suma mod. Int y soporta multiclase |
| 15 | CD de conjuro | ✅ (fórmula) / ⚠️ (triplicada) | 🟢 Corregido | `Spellbook.tsx` y `PlayMode.tsx` llaman ahora a `calculateSpellDC` |
| 16 | Bonus spells por característica | ✅ | ⚪ Sin cambio | — |
| 17 | Capacidad de carga | ❌ | 🟢 Corregido | Tabla oficial completa en `engine/carryingCapacity.ts` |
| 18 | Velocidad / penalización por carga excesiva | ❌ | 🟢 Corregido | `computeSpeed` — velocidad racial real, reducida por armadura media/pesada o carga media/pesada/sobrecargada |
| 19 | Tamaño (AC/CMB/CMD/sigilo/volar) | ❌ | 🟢 Corregido | `engine/size.ts`, aplicado en AC/ataque/CMB/CMD y en Sigilo/Volar |
| 20 | XP y avance de nivel | ⚠️ | ⚪ Sin cambio | Decisión de diseño aceptada (gestión manual de XP); documentado, no es un bug |
| 21 | Dotes por nivel (`ceil(level/2)`) | ✅ | ⚪ Sin cambio | — |
| 22 | Compañero animal | ✅ (progresión) / ⚠️ (AC sin armadura ni tamaño) | 🟢 Corregido (parcial) | Tamaño añadido a la CA; sigue sin modelar armadura equipable en compañeros (fuera de alcance de esta pasada) |
| 23 | Challenge Rating (formatCR) | ✅ | ⚪ Sin cambio | — |
| 24 | Campañas — XP/dificultad de encuentro | ⚠️ | ⚪ Sin cambio | Funcionalidad no implementada, no es un bug; queda como mejora futura opcional |

---

## 1. Motor de modificadores — `src/engine/modifiers.ts`

```ts
if (type === 'untyped' || type === 'circumstance' || type === 'dodge') {
  total += mods.reduce((s, m) => s + m.value, 0)
} else {
  total += Math.max(...mods.map((m) => m.value))
}
```

**Regla SRD:** los bonos del mismo tipo no se acumulan (se queda el mayor), salvo *dodge*, *circumstance* y los bonos sin tipo (*untyped*), que siempre se acumulan.

**Veredicto: ✅ Correcto.** Es la pieza más sólida del sistema — replica con precisión la tabla de tipos de bono de Pathfinder.

**⚠️ Matiz a revisar (no es un bug claro, es una decisión de diseño):** la regla no distingue entre *bonos* y *penalizaciones*. Por FAQ oficial de Pathfinder, las penalizaciones (valores negativos) normalmente **sí se acumulan** aunque compartan el mismo tipo con nombre (p. ej. dos penalizaciones "morale" de fuentes distintas), mientras que aquí `Math.max` conserva la penalización *menos* severa cuando dos modificadores del mismo tipo son negativos. En la práctica actual del código esto rara vez se dispara porque casi todas las condiciones (`CONDITION_MODIFIERS`) usan tipo `untyped` (que sí se acumula correctamente), pero si en el futuro se añaden penalizaciones tipadas (p. ej. un objeto maldito con penalización "profane") el comportamiento se desviaría de RAW. Documentar y decidir conscientemente si se acepta la simplificación.

---

## 2. Modificador de característica — `src/store/characterStore.ts:266-268`

```ts
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}
```

**Veredicto: ✅ Correcto.** Fórmula estándar SRD.

---

## 3-4. Bono Base de Ataque (BAB) y multiclase — `src/data/classes.ts:1839-1873`

```ts
export function getBABForLevel(level: number, babType: 'good' | 'medium' | 'poor'): number {
  if (babType === 'good') return Math.floor(level * 1)
  else if (babType === 'medium') return Math.floor(level * 0.75)
  return Math.floor(level / 2)
}

export function getMulticlassStats(classes: CharacterClass[]): MulticlassStats {
  let bab = 0, fortitude = 0, reflex = 0, will = 0
  for (const cc of classes) {
    const cd = getClassById(cc.id)
    if (!cd) continue
    bab += getBABForLevel(cc.level, cd.baseAttackBonus)
    fortitude += getSaveForLevel(cc.level, cd.fortitudeSave)
    reflex += getSaveForLevel(cc.level, cd.reflexSave)
    will += getSaveForLevel(cc.level, cd.willSave)
  }
  return { bab, fortitude, reflex, will }
}
```

**Verificación contra tabla oficial:** progresión "medium" (`floor(level*0.75)`) reproduce exactamente la tabla PF1e (nv5→+3, nv9→+6, nv10→+7, etc.). Progresión "poor" (`floor(level/2)`) también coincide.

**Veredicto: ✅ Correcto**, y el cálculo multiclase (sumar BAB/salvaciones por cada clase y nivel) es la forma correcta de manejar multiclase en Pathfinder.

**❌ Inconsistencia de uso:** `src/components/campaign/PartyCard.tsx:21`
```ts
const bab = getBABForLevel(character.level, classData?.baseAttackBonus || 'poor')
```
Usa el **nivel total** del personaje con el BAB de **una sola clase** (la primaria), en vez de `getMulticlassStats`. Para un personaje multiclase esto da un BAB incorrecto en la tarjeta de campaña (`PartyCard`), distinto al que se muestra en `CharacterView`/`PlayMode`.

---

## 5. Salvaciones — `src/data/classes.ts:1848-1853`

```ts
export function getSaveForLevel(level: number, saveType: 'good' | 'poor'): number {
  if (saveType === 'good') return 2 + Math.floor(level / 2)
  return Math.floor(level / 3)
}
```

**Veredicto: ✅ Correcto.** Coincide con la tabla oficial (buena: nv1=+2, nv20=+12; mala: nv1=+0, nv20=+6).

**⚠️ Misma inconsistencia que el BAB en `PartyCard.tsx:28-30`:** usa `character.level` con la clase primaria solamente, sin `getMulticlassStats` ni `resolvedStats.saveBonuses`. Un personaje multiclase o con un ítem/dote que otorgue bono a salvación verá un valor distinto (y menor) en la tarjeta de campaña que en su ficha.

---

## 6. Bono de ataque total

Implementaciones encontradas:

- `src/pages/PlayMode.tsx:812`: `bab + (isRanged ? dexMod : strMod) + weapon.attackBonus + resolvedStats.attackBonus + paAtkPenalty` — **la más completa**.
- `src/pages/PlayMode.tsx:861` (sin arma registrada): `bab + strMod + resolvedStats.attackBonus + paAtkPenalty` (melee) / `bab + dexMod + resolvedStats.attackBonus` (distancia).
- `src/components/character/WeaponManager.tsx:63-66`: `bab + mod + bonus` — **no suma `resolvedStats.attackBonus`** (dotes/objetos con bono a ataque no se reflejan aquí).
- `src/components/character/ArsenalManager.tsx:105-106`: idéntica a WeaponManager, mismo defecto.

**Regla SRD:** BAB + mod. característica (Str melee / Dex distancia o Str con *Finesse*) + bono de tamaño + bono del arma + otros modificadores.

**Veredicto: ⚠️ Con matices.**
- ❌ **Falta el modificador de tamaño** en las cuatro implementaciones (ver hallazgo #19, sistémico).
- ⚠️ `WeaponManager.tsx` y `ArsenalManager.tsx` no incluyen `resolvedStats.attackBonus`, por lo que dotes/objetos que otorguen bono de ataque (vía `engine/modifiers.ts`) no aparecen en esas dos pantallas aunque sí en `PlayMode.tsx`. Esto es una inconsistencia real entre pantallas del mismo personaje.
- No se contempla *Weapon Finesse* (usar Dex en vez de Str para armas ligeras cuerpo a cuerpo); es una dote común en PF1e y no está modelada en el cálculo de ataque.

---

## 7. Daño de armas — `src/pages/PlayMode.tsx:14-23, 812, 882-887`

```ts
function addModifierToNotation(notation: string, extra: number): string {
  if (extra === 0) return notation
  const match = notation.match(/^(\d+d\d+)([+-]\d+)?$/)
  if (!match) return notation
  const base = match[1]
  const existing = match[2] ? parseInt(match[2]) : 0
  const total = existing + extra
  if (total === 0) return base
  return `${base}${total > 0 ? '+' : ''}${total}`
}
```
Uso: `addModifierToNotation(weapon.damage, resolvedStats.damageBonus + dmgMod + paDmgBonus)`.

**Regla SRD:** daño = dado(s) del arma + mod. Str (arma cuerpo a cuerpo, ×1.5 si se empuña a dos manos o es el ataque principal con arma a dos manos) + mod. Str ×0.5 en el ataque de la mano secundaria al pelear con dos armas (*Two-Weapon Fighting*) + bonos de daño (encantamiento, dotes, Power Attack, etc.).

**Veredicto: ⚠️ Con matices.**
- ✅ La suma de bonos y el parser de notación `NdM+X` funcionan correctamente para el caso base (una mano, un arma).
- ❌ **No existe en todo el repo** ningún multiplicador ×1.5 Str para armas a dos manos ni ×0.5 para la mano secundaria en ataque con dos armas — se confirmó por búsqueda exhaustiva en `WeaponManager.tsx`, `ArsenalManager.tsx` y `PlayMode.tsx`. El campo `Weapon.type` (string libre) no se usa para derivar este multiplicador en ningún sitio.
- Efecto práctico: un personaje que empuña un arma a dos manos (p. ej. mandoble) recibe menos daño del que le corresponde por regla (Str en vez de 1.5×Str).

---

## 8. Power Attack — `src/pages/PlayMode.tsx:177-179, 808-812`

```ts
const powerAttackPenalty = Math.floor(bab / 4) + 1
const powerAttackDmgBonus = powerAttackPenalty * 2
```

**Regla SRD:** penalización a ataque = `-1` por cada 4 puntos de BAB (redondeando hacia arriba desde 1) — `floor(bab/4) + 1` es correcto. Bono de daño = penalización × 2 con arma en una mano, × 3 con arma a dos manos o ataque a dos manos, × 1 (mitad, redondeado hacia abajo) con arma en mano secundaria.

**Veredicto: ⚠️ Con matices.**
- ✅ La progresión de la penalización es correcta.
- ❌ El bono de daño está **fijo en ×2**, sin distinguir arma a dos manos (debería ser ×3). Mismo origen que el hallazgo #7 (no hay noción de "empuñado a dos manos" en el modelo de datos del arma).

---

## 9. CMB / CMD

- `src/pages/CharacterView.tsx:122-124`:
  ```ts
  const cmb = bab + strMod
  const cmd = 10 + bab + strMod + calculateModifier(abilities.dexterity)
  ```
- `src/pages/PlayMode.tsx:184-185`:
  ```ts
  const cmb = bab + strMod + resolvedStats.cmbBonus
  const cmd = 10 + bab + strMod + dexMod + resolvedStats.cmdBonus
  ```

**Regla SRD:** CMB = BAB + mod. Str (+ mod. tamaño especial, que en PF1e usa la misma tabla que el bono de tamaño a CA salvo que Fino/Diminuto no invierten el signo igual — en la práctica: mismo valor que el "size modifier" de la tabla estándar). CMD = 10 + BAB + mod. Str + mod. Dex (+ mod. tamaño).

**Veredicto: ❌ Incorrecto / inconsistente.**
- `CharacterView.tsx` **no suma** `resolvedStats.cmbBonus` / `resolvedStats.cmdBonus`, mientras que `PlayMode.tsx` sí lo hace. Un personaje con una dote o efecto que otorgue bono a CMB/CMD (el motor de modificadores lo soporta, target `cmb`/`cmd`) mostrará un valor distinto en la ficha que en el modo de juego.
- Falta el modificador de tamaño en ambas (ver hallazgo #19).

---

## 10. Clase de Armadura (AC, Touch, Flat-footed)

Se detectaron **cinco implementaciones independientes**:

**10.1 `src/pages/CharacterView.tsx:109-115`**
```ts
const ac = 10 + effectiveDex + armor + shield + natural + deflection + dodge
const acTouch = 10 + effectiveDex + deflection + dodge
const acFlat = 10 + armor + shield + natural + deflection
```
`effectiveDex` respeta el tope `maxDex` de la armadura equipada. **No suma `resolvedStats.acBonuses.total`** (el bucket de bonos genéricos con target `'ac'`, alcanzable p. ej. desde un efecto de estado con `bonusTarget: 'ac'`).

**10.2 `src/pages/PlayMode.tsx:161-174`**
```ts
const ac = 10 + armor + shield + dexForAC + natural + deflection + dodge + resolvedStats.acBonuses.total
const touchAC = 10 + calculateModifier(abilities.dexterity) + deflection + dodge   // ← sin tope maxDex
const flatFootedAC = 10 + armor + shield + natural + deflection
```

**10.3 `src/components/character/ArsenalManager.tsx:96-102`** y **10.4 `src/components/campaign/PartyCard.tsx:23-26`** (idénticas entre sí):
```ts
const computedAC = 10 + effectiveDex + (equippedBody?.acBonus ?? 0) + (equippedShield?.acBonus ?? 0)
```
Solo Dex + armadura + escudo; ignora natural, deflection, dodge y cualquier bono del motor.

**10.5 `src/pages/CharacterNew.tsx:679-682`** (resumen del asistente): `10 + calculateModifier(form.dexterity)` — válido únicamente porque a nivel 1, sin equipo, no hay más términos que sumar.

**Regla SRD:**
- AC = 10 + armadura + escudo + Dex (con tope) + tamaño + natural + deflection + esquiva + otros.
- AC de toque = 10 + Dex (**con el mismo tope de `maxDex` de la armadura, la restricción es sobre el propio Dex, no sobre el bono de armadura**) + tamaño + esquiva + deflection.
- AC desprevenido = 10 + armadura + escudo + natural + tamaño + deflection (sin Dex ni esquiva).

**Veredicto: ❌ Incorrecto / inconsistente.**
1. **Bug confirmado:** `PlayMode.tsx:173` calcula `touchAC` con `calculateModifier(abilities.dexterity)` sin aplicar el tope `maxDex` de la armadura equipada, mientras que `CharacterView.tsx:114` sí lo aplica correctamente. Por regla oficial, el tope de Dex por armadura **sí afecta también a la AC de toque** (es una restricción sobre el propio modificador de Destreza, no sobre el bono de armadura), así que `PlayMode.tsx` sobreestima la AC de toque de cualquier personaje con armadura pesada y Dex alta.
2. **Bug confirmado:** `CharacterView.tsx` omite `resolvedStats.acBonuses.total` (bonos genéricos con target `'ac'`, usable desde efectos de estado personalizados que el propio `CharacterView` permite crear con `bonusTarget: 'ac'`). Un efecto de estado creado por el usuario con destino "AC" se refleja en `PlayMode` pero no en la ficha principal.
3. `ArsenalManager.tsx` y `PartyCard.tsx` usan una fórmula de AC muchísimo más simplificada (sin natural/deflection/dodge/bonos del motor), por lo que la CA mostrada en el gestor de arsenal o en la tarjeta de campaña puede diferir bastante de la CA "oficial" del personaje.
4. Falta el modificador de tamaño en las cinco (hallazgo sistémico #19).

**Recomendación:** extraer una única función `calculateAC(character, resolvedStats)` en el store/engine y reutilizarla en las cinco pantallas.

---

## 11. Puntos de golpe (HP)

**Nivel 1 — `src/pages/CharacterNew.tsx:264-267, 676`**
```ts
const startingHp = Math.max(1, hitDie + conMod)
```
**Regla SRD:** a nivel 1 se toma el máximo del dado de golpe + mod. Con. Asumiendo que `hitDie` almacena la cara máxima del dado (10 para d10, etc.), es correcto.

**Subida de nivel — `src/components/character/LevelUpModal.tsx:45-51`**
```ts
const result = Math.floor(Math.random() * hitDie) + 1     // tirada 1..hitDie
const hpGained = Math.max(1, activeRoll + conMod)          // mínimo 1 PV/nivel
```
**Veredicto: ✅ Correcto.** Tirada aleatoria (o manual) + mod. Con, con el mínimo de 1 PV por nivel que exige la regla.

**Ausente (no es un bug, es una funcionalidad no implementada):**
- No hay opción de "tomar la media" (regla opcional pero muy usada en mesas: `hitDie/2 + 1`).
- No hay bono de "clase favorita" (+1 PV) de las reglas APG — es opcional en el reglamento base, así que su ausencia es aceptable pero conviene anotarlo si el proyecto quiere soportarlo.
- No se aplica la dote *Toughness* al total de HP en ningún cálculo (se confirmó por búsqueda; si `Toughness` existe en `data/feats.ts` con `effects` de target `'hp'`, sí se sumaría automáticamente vía `resolvedStats.hpBonus` — pero **ningún componente de HP suma `resolvedStats.hpBonus`** al HP máximo mostrado). Esto sí es una omisión real si la dote existe en el catálogo: revisar si `character.hp.max` en algún punto se recalcula sumando `resolvedStats.hpBonus`.

---

## 12. Iniciativa

- `CharacterView.tsx:121`: `calculateModifier(abilities.dexterity) + resolvedStats.initiativeBonus`
- `PlayMode.tsx:186`: `dexMod + resolvedStats.initiativeBonus`

**Veredicto: ✅ Correcto y consistente** entre ambas pantallas.

---

## 13-14. Habilidades

**Total de habilidad (3 implementaciones):**
- `CharacterView.tsx:846-855`: `ranks + abilityMod + (rank>0 && isClass ? 3 : 0) + ACP + misc + featBonus` ✅ completa.
- `SkillsList.tsx:51-69`: misma fórmula ✅ completa.
- `PlayMode.tsx:1374-1380`: **omite el ACP de armadura** — un personaje con armadura pesada verá su Sigilo/Acrobacias etc. sin penalización en el modo de juego, pero correctamente penalizado en la ficha. ⚠️ Inconsistencia real.

**Rango máximo por habilidad — `SkillsList.tsx:77`:** `maxRanks = level` (nivel total del personaje) para cualquier habilidad, sin distinguir clase/transclase.
**Veredicto: ✅ Correcto para Pathfinder 1e** (a diferencia de D&D 3.5, Pathfinder eliminó el tope reducido para habilidades transclase; el único efecto de ser transclase es no recibir el bono de +3).

**❌ Puntos de habilidad disponibles — `CharacterView.tsx:834`:**
```ts
skillPointsAvailable={Math.max(0, (character.level * (classData?.skillPointsPerLevel || 2)) - character.skills.reduce((sum, s) => sum + s.ranks, 0))}
```
**Regla SRD:** puntos de habilidad por nivel = base de la clase (según su tabla) **+ mod. Int, con un mínimo de 1 por nivel**; en multiclase, cada nivel de cada clase aporta sus propios puntos según la base de esa clase.

Este cálculo:
1. **Ignora completamente el modificador de Inteligencia.** `classData.skillPointsPerLevel` es el valor base sin Int (verificado en `data/classes.ts`, p. ej. `barbarian: 4`, `rogue: 8`). Un personaje con Int 18 (+4) debería tener 4 puntos extra por nivel; con esta fórmula no obtiene ninguno.
2. **No soporta multiclase:** multiplica el nivel *total* del personaje por el `skillPointsPerLevel` de la **clase primaria únicamente**, en vez de sumar, nivel a nivel, los puntos de cada clase por la que pasó el personaje.
3. Contrasta con `LevelUpModal.tsx:41-43`, que sí calcula correctamente `Math.max(1, skillPointsPerLevel + intMod)` — pero ese valor es **puramente informativo** en el modal de subida de nivel; no se persiste ni se sustituye a la fórmula defectuosa de `CharacterView.tsx`, que es la que realmente limita cuánto puede gastar el usuario en `SkillsList`.

**Impacto:** es el bug de mayor severidad del informe — afecta directamente cuántos rangos de habilidad puede asignar cada personaje, y penaliza sistemáticamente a los personajes con Int alta (que son, por diseño, los que más deberían beneficiarse).

---

## 15. CD de conjuro

Tres implementaciones, todas con la misma fórmula matemática pero solo dos en uso real:

- `src/data/spells.ts:48-50` (**exportada pero no usada en ningún componente**, confirmado por búsqueda; solo re-exportada en `data/index.ts`):
  ```ts
  export function calculateSpellDC(spellLevel, casterAbilityModifier, focusBonus = 0) {
    return 10 + spellLevel + casterAbilityModifier + focusBonus
  }
  ```
- `Spellbook.tsx:175`: `10 + abilityModifier + level` (inline)
- `PlayMode.tsx:1476`: `10 + spell.level + casterAbilityMod` (inline, mismo resultado, orden de sumandos distinto)

**Regla SRD:** CD = 10 + nivel del conjuro + mod. característica de lanzador (+ bonos como *Spell Focus*).

**Veredicto: ✅ Fórmula correcta en las dos implementaciones activas.** ⚠️ Triplicada innecesariamente (una función helper sin usar, dos copias inline) — riesgo de que diverjan si en el futuro se añade *Spell Focus* solo en un sitio. Se recomienda que `Spellbook.tsx` y `PlayMode.tsx` llamen a `calculateSpellDC` en vez de reimplementarla.

---

## 16. Bonus spells por característica alta — `src/data/bonusSpells.ts:16-23`

```ts
export function getBonusSpells(abilityScore: number): number[] {
  const mod = calculateModifier(abilityScore)
  return Array.from({ length: 10 }, (_, sl) => {
    if (sl === 0) return 0
    if (mod < sl) return 0
    return Math.floor((mod - sl) / 4) + 1
  })
}
```

**Verificación:** contrastado nivel por nivel contra la tabla oficial de conjuros adicionales (Core Rulebook), incluyendo los umbrales de doble conjuro adicional a partir de mod. +5 (ej. Cha 20 → 2 conjuros extra de nivel 1). **Coincide exactamente** en todos los casos probados (mod +1 a +6, niveles de conjuro 1 a 6).

**Veredicto: ✅ Correcto.**

---

## 17. Capacidad de carga — `src/pages/CharacterView.tsx:954`

```ts
carryCapacity={(abilities.strength * 10) + (calculateModifier(abilities.strength) * 10)}
```

**Regla SRD:** la capacidad de carga sigue la Tabla de Capacidad de Carga (no lineal): p. ej. Str 10 → 100 lb, Str 15 → 175 lb, Str 20 → 400 lb, Str 8 → 60 lb. La progresión es aproximadamente exponencial a partir de Str 10, no lineal.

**Veredicto: ❌ Incorrecto.** Es una fórmula lineal inventada que **coincide por casualidad en Str 10** (100 = 100) pero diverge cada vez más cuanto más se aleja la característica de 10:
- Str 8 (mod −1): fórmula da 70 lb; tabla real ≈ 60 lb.
- Str 20 (mod +5): fórmula da 250 lb; tabla real = 400 lb (infravalora en un 37%).

**Recomendación:** portar la tabla oficial de capacidad de carga (o su aproximación matemática estándar `capacity = 10 * str * 4^(floor(str/5) - 2)` ajustada a los tramos de la tabla) a una función dedicada en lugar de la fórmula lineal actual.

---

## 18. Velocidad y penalización por carga excesiva

- Velocidad: no existe ningún cálculo dinámico; se muestra como texto fijo `'30ft'` / `'30 ft'` (`CharacterView.tsx:335-336, 458`). No se ajusta por raza (algunas razas tienen 20 ft, p. ej. Enano/Gnomo), ni por armadura pesada, ni por carga.
- `InventoryManager.tsx:191-209` muestra el aviso *"¡Carga excesiva! Velocidad reducida a la mitad"* cuando `totalWeight > carryCapacity`, pero es **solo texto**: no hay ningún lugar del código que efectivamente reduzca la velocidad usada en combate/iniciativa.

**Veredicto: ❌ Incorrecto / incompleto.** La velocidad base debería derivarse de la raza (`data/races.ts` probablemente ya tiene un campo `speed` por raza — verificar si se usa) y verse afectada por armadura pesada y sobrecarga; actualmente ninguna de las tres cosas ocurre.

---

## 19. Modificador de tamaño (hallazgo sistémico, afecta a 10, 6, 9, y habilidades)

`src/data/races.ts` almacena `size: 'small' | 'medium'` por raza, y `src/pages/Tables.tsx:119` incluso contiene una `SIZE_MODIFIERS_TABLE` de referencia (visible en la pantalla de Tablas), pero **se confirmó por búsqueda exhaustiva** (`race.size`, `sizeModifier`, `SIZE_MOD`) que el tamaño del personaje **nunca se usa** para ajustar:
- AC / CMB / CMD (bono de tamaño, ej. Pequeño +1 AC/+1 ataque/−1 CMB/CMD).
- Bono de ataque (mismo modificador que el de AC).
- Habilidades Volar y Sigilo (que en PF1e reciben un modificador de tamaño distinto al genérico de combate).

**Veredicto: ❌ Falta sistemáticamente en todo el motor de combate.** Es la causa raíz común de la mayoría de los "⚠️ falta tamaño" señalados en las secciones 6, 9 y 10. Con el modelo de datos actual (razas Pequeñas ya identificadas como `size: 'small'`), añadir esto es relativamente contenido: definir una función `getSizeModifier(size)` y sumarla en las fórmulas de AC/ataque/CMB/CMD/Volar/Sigilo.

---

## 20. XP y avance de nivel

- `src/pages/Tables.tsx:249+`: tabla `XP_TABLE` estática (lento/medio/rápido), es solo material de referencia en la pantalla de Tablas — **no está conectada** al campo `character.xp` ni dispara ninguna sugerencia de subida de nivel automática.
- La subida de nivel (`LevelUpModal.tsx`) es enteramente manual: el jugador decide cuándo subir, sin comprobar el XP acumulado contra la tabla.

**Veredicto: ⚠️ Es una decisión de diseño válida** (muchas mesas gestionan el XP de palabra), pero merece quedar documentada como tal: el campo `xp` en `Character` existe pero no tiene ninguna fórmula asociada ni gatilla nada automáticamente.

---

## 21. Dotes por nivel — `src/pages/CharacterView.tsx:882, 887`

```ts
Math.ceil(character.level / 2)
```

**Regla SRD:** se obtiene una dote a nivel 1 y luego cada nivel impar (3, 5, 7…). `ceil(level/2)`: nivel1→1, nivel2→1, nivel3→2, nivel4→2, nivel5→3… coincide exactamente con el conteo acumulado de dotes ganadas.

**Veredicto: ✅ Correcto.**

---

## 22. Compañero animal — `src/data/animalCompanions.ts:274-302`

```ts
export function calculateCompanionStats(base, companionLevel) {
  const prog = COMPANION_PROGRESSION[lvl - 1]
  const str = base.str + prog.strDexBonus
  const dex = base.dex + prog.strDexBonus
  return {
    hd: prog.hd, bab: prog.bab,
    fort: prog.fort + mod(con), ref: prog.ref + mod(dex), will: prog.will + mod(base.wis),
    ac: 10 + mod(dex) + na,
    ...
  }
}
```

**Veredicto: ✅ La tabla de progresión (`COMPANION_PROGRESSION`, niveles 1-20 con HD/BAB/salvaciones/bonos de Str-Dex/AN) y su aplicación son correctas** y siguen la tabla oficial de compañeros animales.

**⚠️ Matiz:** el AC del compañero (`10 + mod(dex) + naturalArmor`) no contempla armadura equipable (los compañeros animales sí pueden llevar armadura por reglas) ni modificador de tamaño (muchos animales base son "Pequeño" o "Grande" según especie, lo que afectaría su AC/CMB/CMD igual que el hallazgo #19 en personajes).

---

## 23. Challenge Rating — `src/lib/formatCR.ts`

Solo formatea (fracciones 1/2, 1/3, 1/4, 1/6, 1/8) un valor de CR ya asignado manualmente; no hay ninguna fórmula que derive CR a partir de las estadísticas de un monstruo/NPC.

**Veredicto: ✅ Correcto para lo que hace** (formateo de presentación). El campo `cr` de `CampaignNPC` se introduce a mano; no aplica revisar "fórmula" porque no existe cálculo, solo entrada de datos.

---

## 24. Campañas — XP de encuentro, dificultad, agregación de grupo

`src/store/campaignStore.ts` y `src/components/campaign/EncounterTracker.tsx`: **no existe ninguna fórmula** de cálculo de dificultad de encuentro (p. ej. sumar CR de enemigos vs. nivel de grupo, o el sistema de "XP budget" por encuentro de las reglas de Gamemastery). Todos los campos (`xpReward`, `difficulty`, `xpAwarded`) son de entrada manual del DJ vía formulario.

Único cálculo real presente:
```ts
// EncounterTracker.tsx
const pct = enemy.hpMax > 0 ? (enemy.hpCurrent / enemy.hpMax) * 100 : 0
```
(barra de vida, no es una regla de Pathfinder, es presentación).

**Veredicto: ⚠️ No es un error — es una funcionalidad no implementada.** Si se desea, Pathfinder/GameMastery Guide sí define una tabla de "XP Award" por CR y nivel de grupo que podría automatizarse aquí; documentado como posible mejora futura, no como bug.

---

## Lista priorizada de correcciones sugeridas

1. **[Alto] Puntos de habilidad disponibles** (`CharacterView.tsx:834`) — sumar mod. Int y soportar multiclase. Es el bug con mayor impacto en la jugabilidad. — 🟢 **CORREGIDO** (`engine/skills.ts` → `computeSkillPointsAvailable`)
2. **[Alto] Unificar el cálculo de AC** en una sola función compartida (motor/engine), corrigiendo de paso el `touchAC` sin tope `maxDex` en `PlayMode.tsx:173` y el bono genérico `ac` que falta en `CharacterView.tsx`. — 🟢 **CORREGIDO** (`engine/combatStats.ts` → `computeCombatStats`)
3. **[Medio] Unificar CMB/CMD** para que ambas pantallas sumen `resolvedStats.cmbBonus`/`cmdBonus`. — 🟢 **CORREGIDO** (parte de `computeCombatStats`)
4. **[Medio] Modificador de tamaño** — implementar `getSizeModifier` y aplicarlo a AC/ataque/CMB/CMD (y opcionalmente Volar/Sigilo). — 🟢 **CORREGIDO** (`engine/size.ts`, incluye Volar/Sigilo)
5. **[Medio] `PartyCard.tsx`** — reemplazar los cálculos de BAB/salvaciones/AC simplificados por las mismas funciones que usa `CharacterView.tsx`/`PlayMode.tsx` (evitar quinta implementación divergente). — 🟢 **CORREGIDO**
6. **[Bajo] Capacidad de carga** — sustituir la fórmula lineal por la tabla oficial. — 🟢 **CORREGIDO** (`engine/carryingCapacity.ts`)
7. **[Bajo] Velocidad** — derivar de la raza y aplicar penalización real por armadura pesada/sobrecarga en vez de solo el aviso de texto. — 🟢 **CORREGIDO** (`engine/speed.ts`)
8. **[Bajo] Daño a dos manos / TWF** — añadir el multiplicador ×1.5 Str (y ajustar Power Attack a ×3 en consecuencia) cuando se modele el "tipo de empuñadura" del arma. — 🟢 **CORREGIDO** (campo `Weapon.grip` + `engine/weapon.ts`)
9. **[Cosmético] CD de conjuro** — hacer que `Spellbook.tsx` y `PlayMode.tsx` llamen a `calculateSpellDC` en vez de reimplementarla inline. — 🟢 **CORREGIDO**

**Las 9 correcciones de esta lista se aplicaron íntegramente.** Detalle completo, decisiones de diseño y limitaciones conocidas restantes en [`AUDITORIA_FORMULAS_2.md`](AUDITORIA_FORMULAS_2.md).

---

## Metodología

Auditoría realizada mediante:
1. Mapeo exhaustivo por búsqueda de patrones (`BAB`, `CMB`, `CMD`, `maxDex`, `carryCapacity`, `hitDie`, `casterLevel`, etc.) sobre todo `src/`.
2. Lectura literal del código de cada fórmula encontrada (no resúmenes).
3. Contraste manual de cada fórmula contra las reglas del Pathfinder Core Rulebook / SRD (stacking de bonos, tablas de BAB/salvaciones, tabla de conjuros adicionales, tabla de capacidad de carga, reglas de Power Attack, reglas de AC de toque/desprevenido).
4. Verificación cruzada entre las distintas pantallas que reimplementan la misma fórmula (`CharacterView.tsx`, `PlayMode.tsx`, `WeaponManager.tsx`, `ArsenalManager.tsx`, `SkillsList.tsx`, `PartyCard.tsx`, `CharacterNew.tsx`) para detectar divergencias.

**Actualización (misma fecha, segunda pasada):** se aplicaron las 9 correcciones de la lista priorizada. Ver `AUDITORIA_FORMULAS_2.md` para el detalle de cada cambio, la verificación (tsc + build + 116 tests, incluyendo 23 nuevos tests de fórmulas) y una auditoría fresca del estado resultante.
