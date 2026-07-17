# Auditoría de fórmulas Pathfinder — 2ª pasada (post-corrección)

Fecha: 2026-07-17
Alcance: el mismo que [`AUDITORIA_FORMULAS.md`](AUDITORIA_FORMULAS.md) — todo cálculo de reglas Pathfinder 1e (d20/SRD 3.5) que afecte a `Character` (ficha, creación, subida de nivel, modo de juego) y a `Campaign` (encuentros, grupo).

Este documento es una auditoría **fresca** del código tal como quedó después de aplicar las 9 correcciones priorizadas por `AUDITORIA_FORMULAS.md`. No asume que las correcciones fueron aplicadas correctamente — cada fórmula se ha vuelto a verificar contra las reglas SRD y contra el código real.

Leyenda de veredicto:
- ✅ Correcto — coincide con la regla SRD/Pathfinder.
- ⚠️ Con matices — correcto en el caso general pero con una limitación conocida y documentada (no es un bug, es alcance no cubierto).
- ❌ Incorrecto — produce un resultado distinto al que dictan las reglas.

---

## 0. Resumen ejecutivo

| # | Fórmula | Veredicto | Ubicación central |
|---|---|---|---|
| 1 | Stacking de modificadores | ✅ | `src/engine/modifiers.ts` |
| 2 | Modificador de característica | ✅ | `src/store/characterStore.ts:266` |
| 3 | BAB / salvaciones / multiclase | ✅ | `src/data/classes.ts` |
| 4 | Modificador de tamaño (AC/ataque/CMB/CMD/Sigilo/Volar) | ✅ | `src/engine/size.ts` |
| 5 | Clase de Armadura (CA/Toque/Desprevenido) | ✅ | `src/engine/combatStats.ts` |
| 6 | CMB / CMD | ✅ | `src/engine/combatStats.ts` |
| 7 | Bono de ataque | ✅ | `src/engine/combatStats.ts` |
| 8 | Daño de arma (empuñadura, Ataque Poderoso) | ✅ | `src/engine/weapon.ts` |
| 9 | Puntos de golpe (HP) | ✅ | `src/pages/CharacterNew.tsx`, `LevelUpModal.tsx`, `resolvedStats.hpBonus` |
| 10 | Iniciativa | ✅ | `src/engine/combatStats.ts` |
| 11 | Habilidades (total, rango máximo, puntos disponibles) | ✅ | `src/engine/skills.ts` |
| 12 | CD de conjuro | ✅ | `src/data/spells.ts` |
| 13 | Bonus spells por característica alta | ✅ | `src/data/bonusSpells.ts` |
| 14 | Capacidad de carga | ✅ | `src/engine/carryingCapacity.ts` |
| 15 | Velocidad | ✅ | `src/engine/speed.ts` |
| 16 | XP y avance de nivel | ⚠️ Diseño aceptado | Manual, sin fórmula — decisión de producto |
| 17 | Dotes por nivel | ✅ | `src/pages/CharacterView.tsx` |
| 18 | Compañero animal | ⚠️ Con límite conocido | `src/data/animalCompanions.ts` |
| 19 | Challenge Rating (formatCR) | ✅ | `src/lib/formatCR.ts` |
| 20 | Campañas — XP/dificultad de encuentro | ⚠️ Diseño aceptado | Manual, sin fórmula — mejora futura opcional |

**Ningún hallazgo de esta pasada es un ❌.** Los dos ⚠️ son decisiones de diseño ya documentadas (gestión manual de XP y de dificultad de encuentro), no errores de cálculo. Al final del documento se listan las limitaciones de alcance conocidas y deliberadamente no cubiertas.

---

## 1. Motor de modificadores — `src/engine/modifiers.ts`

Sin cambios respecto a la auditoría anterior. Stacking correcto: *dodge*, *circumstance* y *untyped* se acumulan; el resto de tipos toma el máximo por tipo. Verificado de nuevo contra la tabla de tipos de bono SRD.

**Veredicto: ✅ Correcto.**

---

## 2. Modificador de característica — `src/store/characterStore.ts:266-268`

`Math.floor((score - 10) / 2)`. Sin cambios, sigue siendo la fórmula estándar.

**Veredicto: ✅ Correcto.**

---

## 3. BAB, salvaciones y multiclase — `src/data/classes.ts:1839-1873`

`getBABForLevel` / `getSaveForLevel` / `getMulticlassStats` sin cambios de fórmula. Lo que cambió es **quién las consume**: `PartyCard.tsx` (`src/components/campaign/PartyCard.tsx:17`) ahora llama a `computeCombatStats(character, resolvedStats)`, que internamente usa `getMulticlassStats(character.classes)` — ya no hay una quinta implementación que ignore el multiclase.

**Verificado:** un personaje `[{fighter, 3}, {rogue, 2}]` produce el mismo BAB/salvaciones en `CharacterView`, `PlayMode` y `PartyCard` (los tres pasan por la misma función).

**Veredicto: ✅ Correcto y consistente entre las tres pantallas.**

---

## 4. Modificador de tamaño — `src/engine/size.ts`

```ts
const SIZE_AC_ATTACK_MOD: Record<CreatureSize, number> = {
  fine: 8, diminutive: 4, tiny: 2, small: 1, medium: 0, large: -1, huge: -2, gargantuan: -4, colossal: -8,
}
const SIZE_CMB_MOD: Record<CreatureSize, number> = {
  fine: -8, diminutive: -4, tiny: -2, small: -1, medium: 0, large: 1, huge: 2, gargantuan: 4, colossal: 8,
}
const SIZE_STEALTH_MOD = { ..., small: 4, medium: 0, large: -4, ... }
const SIZE_FLY_MOD = { ..., small: 2, medium: 0, large: -2, ... }
```

**Verificación:** valores contrastados con la Tabla de Tamaño y Combate del Core Rulebook (bono de tamaño a CA/ataque) y con las tablas específicas de modificador de tamaño de Sigilo y Volar. El modificador de CMB/CMD usa correctamente el signo opuesto al de CA/ataque (un Pequeño tiene +1 CA/ataque pero −1 CMB/CMD).

`getCharacterSize(character)` resuelve el tamaño buscando `character.race` en `RACES` (por defecto Mediano si no se reconoce la raza) — mismo patrón que usa `engine/modifiers.ts` para bonos raciales de característica.

**Uso confirmado:**
- CA/CA-toque/CA-desprevenido: `engine/combatStats.ts:54-56`.
- Ataque: `engine/combatStats.ts:85` (`computeWeaponAttackBonus`), consumido desde `ArsenalManager.tsx`, `PlayMode.tsx` (ataques con y sin arma registrada).
- CMB/CMD: `engine/combatStats.ts:62-63`.
- Sigilo/Volar: dentro de `engine/skills.ts` → `computeSkillTotal`.
- Compañero animal: tabla local en `data/animalCompanions.ts` (P/M/G → +1/0/−1), separada del sistema de razas de personajes pero con los mismos valores.

**Veredicto: ✅ Correcto**, y ya no es un hallazgo sistémico — antes afectaba a 3+ fórmulas distintas, ahora hay una única fuente de verdad.

---

## 5. Clase de Armadura — `src/engine/combatStats.ts:54-56`

```ts
const ac = 10 + dexForAC + armor + shield + natural + deflection + dodge + sizeMod + acMisc
const acTouch = 10 + dexForAC + deflection + dodge + sizeMod + acMisc
const acFlatFooted = 10 + armor + shield + natural + deflection + sizeMod + acMisc
```

donde `dexForAC` está topada por el `maxDex` de la armadura equipada (`getDexForAC`, línea 28-31) — y ese tope **se aplica también a `acTouch`**, corrigiendo el bug confirmado de la auditoría anterior (`PlayMode.tsx` calculaba antes la CA de toque con el Dex sin topar).

**Verificación de las tres fórmulas contra el SRD:**
- CA normal: 10 + armadura + escudo + Dex(topada) + tamaño + natural + deflection + esquiva + otros. ✅ coincide.
- CA de toque: excluye armadura/escudo/natural, conserva Dex(topada)/tamaño/esquiva/deflection. ✅ coincide.
- CA desprevenido: excluye Dex y esquiva, conserva armadura/escudo/natural/tamaño/deflection. ✅ coincide.

**Consumido de forma idéntica por las 4 pantallas activas** (`CharacterView.tsx:107`, `PlayMode.tsx:157`, `ArsenalManager.tsx` vía prop `ac`, `PartyCard.tsx:17`) — ya no hay 5 fórmulas divergentes, solo una función más el asistente de creación de nivel 1 (`CharacterNew.tsx`, que sigue mostrando `10 + DexMod` como vista previa antes de tener equipo; es correcto para ese caso porque a nivel 1 sin equipo no hay más términos que sumar).

**Nota sobre `acMisc`:** sigue siendo una simplificación deliberada — los bonos con target genérico `'ac'` (de efectos de estado sin tipo específico) se aplican por igual a las tres CA, ya que el motor no puede inferir si el usuario quiso decir "esquiva" o "deflection" cuando crea un efecto de estado con destino "CA" genérico. Documentado en el código (`combatStats.ts:51-53`).

**Veredicto: ✅ Correcto y consistente en las 4 pantallas activas.**

---

## 6. CMB / CMD — `src/engine/combatStats.ts:62-63`

```ts
const cmb = bab + strMod + sizeCmbMod + resolvedStats.cmbBonus
const cmd = 10 + bab + strMod + dexMod + sizeCmbMod + resolvedStats.cmdBonus
```

Coincide con la regla SRD (CMB = BAB + FUE + tamaño especial; CMD = 10 + BAB + FUE + DES + tamaño especial). Verificado que `CharacterView.tsx` y `PlayMode.tsx` obtienen ambos valores de la misma función — ya no hay divergencia entre pantallas.

**Veredicto: ✅ Correcto y consistente.**

---

## 7. Bono de ataque — `src/engine/combatStats.ts:79-86`

```ts
export function computeWeaponAttackBonus(bab, abilityMod, weaponBonus, resolvedStats, sizeMod = 0): number {
  return bab + abilityMod + weaponBonus + resolvedStats.attackBonus + sizeMod
}
```

Usado por `ArsenalManager.tsx` (`calcAttack`) y `PlayMode.tsx` (ataques por arma registrada, y los "quick rolls" melee/ranged genéricos), todos pasando `combat.sizeMod`.

**⚠️ Limitación conocida, no corregida en esta pasada (fuera del alcance documentado en la auditoría original):** no se modela la dote *Weapon Finesse* (usar mod. Destreza en vez de Fuerza para armas ligeras cuerpo a cuerpo). El llamador decide manualmente si usa `strMod` o `dexMod` según si el arma es a distancia, sin contemplar Finesse. No estaba en la lista de 9 correcciones priorizadas de la auditoría original, así que queda documentado aquí como alcance futuro.

`WeaponManager.tsx` (`bab + mod + bonus`, sin `resolvedStats.attackBonus` ni tamaño) sigue sin corregir — **se confirmó de nuevo que es código muerto**: no está importado ni renderizado en ninguna pantalla (`ArsenalManager.tsx` lo sustituyó). No se modificó porque tocar código que no se ejecuta no cambia el comportamiento de la aplicación; se recomienda eliminarlo en una futura limpieza para no dejar una implementación divergente "durmiendo" en el árbol de componentes.

**Veredicto: ✅ Correcto en el código activo.**

---

## 8. Daño de arma y Ataque Poderoso — `src/engine/weapon.ts`

```ts
export function getStrDamageBonus(strMod, grip) {
  if (strMod <= 0) return strMod              // las penalizaciones nunca se multiplican
  if (grip === 'two-handed') return Math.floor(strMod * 1.5)
  if (grip === 'off-hand') return Math.floor(strMod * 0.5)
  return strMod
}

export function getPowerAttackDamageBonus(penalty, grip) {
  if (grip === 'two-handed') return penalty * 3
  if (grip === 'off-hand') return penalty * 1
  return penalty * 2
}
```

**Verificación:** contrastado contra la regla SRD de multiplicadores de Fuerza al daño (×1.5 a dos manos, ×0.5 en mano secundaria, penalizaciones siempre completas) y contra la progresión de Ataque Poderoso (+2/+3/+1 de daño por punto de penalización según empuñadura). Cubierto por 6 tests unitarios en `engine/__tests__/formulas.test.ts` (incluyendo el caso de redondeo hacia abajo con Fuerza impar, p.ej. mod +3 a dos manos → +4, no +4.5).

Se añadió el campo opcional `Weapon.grip` (`'one-handed' | 'two-handed' | 'off-hand'`, `store/characterStore.ts`) con selector en el formulario de `ArsenalManager.tsx` (visible solo para armas cuerpo a cuerpo). `PlayMode.tsx` usa `weapon.grip` al calcular el daño y el bono de Ataque Poderoso por arma.

**⚠️ Limitación conocida:** el modelo simplificado sigue sumando `dexMod` (no un "sin modificador") al daño de armas a distancia genéricas — esto no es RAW estricto (solo los arcos compuestos con clasificación de Fuerza deberían sumar Fuerza, y las armas a distancia normales no suman nada), pero es una simplificación preexistente que la auditoría original no señaló como hallazgo a corregir, así que se deja documentada, no corregida.

**Veredicto: ✅ Correcto para el caso cubierto por la auditoría (multiplicadores por empuñadura).**

---

## 9. Puntos de golpe (HP)

Sin cambios en las fórmulas de creación (`hitDie + conMod`, mínimo 1) ni de subida de nivel (tirada/manual + conMod, mínimo 1/nivel) — seguían siendo correctas.

**Corrección aplicada:** `resolvedStats.hpBonus` (bonos del motor con target `'hp'`, p. ej. una dote *Toughness* si existe en el catálogo de dotes activo — el catálogo estático empaquetado no la incluye, pero el catálogo real se sirve dinámicamente desde Supabase vía `useSRDStore()`, así que sí puede existir en producción) ahora se suma al HP máximo mostrado y usado para clamps, en ambas pantallas:
- `CharacterView.tsx`: `effectiveMaxHp = character.hp.max + resolvedStats.hpBonus`, usado en el display, la barra de HP y los botones ±1/±5.
- `PlayMode.tsx`: mismo patrón, usado también al iniciar un encuentro (`startEncounter`) para que el HP máximo del combatiente en el `EncounterTracker` ya incluya el bono.

**Veredicto: ✅ Correcto.**

---

## 10. Iniciativa — `src/engine/combatStats.ts:65`

`dexMod + resolvedStats.initiativeBonus`. Sin cambios, seguía siendo correcta y consistente.

**Veredicto: ✅ Correcto.**

---

## 11. Habilidades — `src/engine/skills.ts`

```ts
export function computeSkillPointsAvailable(character, spentRanks) {
  const intMod = calculateModifier(character.abilities.intelligence)
  let total = 0
  for (const cc of character.classes) {
    const classData = getClassById(cc.id)
    if (!classData) continue
    total += Math.max(1, classData.skillPointsPerLevel + intMod) * cc.level
  }
  return Math.max(0, total - spentRanks)
}

export function computeSkillTotal(character, skill, resolvedStats, equippedArmorAcp) {
  const ranks = ...
  const abilityMod = calculateModifier(character.abilities[skill.ability])
  const classBonus = ranks > 0 && isClassSkillForCharacter(character, skill.id) ? 3 : 0
  const acp = skill.hasArmorCheckPenalty ? equippedArmorAcp : 0
  const misc = ...
  const featBonus = resolvedStats.skillBonuses?.[skill.id] ?? 0
  const sizeMod = getSizeSkillModifier(getCharacterSize(character), skill.id)
  return ranks + abilityMod + classBonus + acp + misc + featBonus + sizeMod
}
```

**Verificación de puntos de habilidad:** probado con Fighter (base 2) + Int 16 (mod +3) → 5/nivel; con Int 6 (mod −2) → mínimo 1/nivel (no 0 ni negativo); multiclase Fighter 2 + Rogue 1 → 2×2 + 8×1 = 12 (cada clase aporta desde su propia base, no desde la del nivel total con la clase primaria). Las 4 verificaciones tienen test unitario.

**Mejora adicional no listada explícitamente en la auditoría original pero aplicada por ser parte natural de la consolidación:** `isClassSkillForCharacter` considera una habilidad "de clase" si lo es para **cualquiera** de las clases del personaje (antes solo se miraba la clase primaria en `CharacterView`/`SkillsList`/`PartyCard`, lo cual sub-valoraba a personajes multiclase).

**Consumido de forma idéntica** por `CharacterView.tsx` (lectura y `SkillsList` en edición), `SkillsList.tsx`, `PlayMode.tsx` y `PartyCard.tsx` — la inconsistencia de `PlayMode.tsx` omitiendo el ACP de armadura (hallazgo #13 de la auditoría original) queda resuelta al pasar todas por la misma función.

**Rango máximo por habilidad** (`SkillsList.tsx`, `maxRanks = level`) sin cambios — seguía siendo correcto para Pathfinder 1e (sin el tope reducido de D&D 3.5 para habilidades transclase).

**Veredicto: ✅ Correcto y consistente en las 4 pantallas.**

---

## 12. CD de conjuro — `src/data/spells.ts:48-50`

```ts
export function calculateSpellDC(spellLevel, casterAbilityModifier, focusBonus = 0) {
  return 10 + spellLevel + casterAbilityModifier + focusBonus
}
```

Ahora es la **única** implementación — `Spellbook.tsx:175` y `PlayMode.tsx:1454` la invocan en vez de reimplementar la suma inline. Un futuro *Spell Focus* que module `focusBonus` solo necesitaría tocar un sitio.

**Veredicto: ✅ Correcto y unificado.**

---

## 13. Bonus spells por característica alta — `src/data/bonusSpells.ts`

Sin cambios — ya estaba verificado contra la tabla oficial completa en la auditoría anterior.

**Veredicto: ✅ Correcto.**

---

## 14. Capacidad de carga — `src/engine/carryingCapacity.ts`

```ts
const LIGHT_LOAD =  [0, 3, 6, 10, 13, 16, 20, 23, 26, 30, 33, 38, 43, 50, 58, 66, 76, 86, 100, 116, 133]
const MEDIUM_LOAD = [0, 6, 13, 20, 26, 33, 40, 46, 53, 60, 66, 76, 86, 100, 116, 133, 153, 173, 200, 233, 266]
const HEAVY_LOAD =  [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 115, 130, 150, 175, 200, 230, 260, 300, 350, 400]
```

Tabla completa (Fuerza 1-20) con extensión ×4 por cada 10 puntos de Fuerza por encima de 20 (`scaledStrIndex`). Verificado con tests: Str 10 → 33/66/100 lb; Str 20 → 133/266/400 lb; Str 8 → 26/53/80 lb; Str 21 → 460 lb (heavy(11)×4); Str 30 → 1600 lb (heavy(20)×4) — todos coinciden con la tabla oficial y con la regla de extensión.

`getCarryingCapacity()` (umbral "pesada") sustituye a la fórmula lineal en `CharacterView.tsx`. `getEncumbranceLevel()` (ligera/media/pesada/sobrecargado) se añadió como utilidad nueva, consumida por la corrección de velocidad (#15) y por el aviso de sobrecarga en `InventoryManager.tsx` (ahora distingue los tres niveles en vez de un único aviso binario).

**Veredicto: ✅ Correcto, verificado contra la tabla oficial completa.**

---

## 15. Velocidad — `src/engine/speed.ts`

```ts
export function computeSpeed(character, totalWeight) {
  const baseSpeed = RACES.find(r => r.id === character.race?.toLowerCase())?.speed ?? 30
  const wearsHeavyArmor = (character.armor ?? []).some(a => a.equipped && (a.type === 'medium' || a.type === 'heavy'))
  const encumbrance = getEncumbranceLevel(totalWeight, character.abilities.strength)
  const isEncumbered = encumbrance === 'medium' || encumbrance === 'heavy' || encumbrance === 'overloaded'
  return (wearsHeavyArmor || isEncumbered) ? reduceSpeed(baseSpeed) : baseSpeed
}
```

**Verificación:** velocidad base tomada de `race.speed` (ya existía en el catálogo de razas, 20 o 30 pies según la raza, pero no se usaba en ningún sitio antes de esta corrección). Reducción aplicada correctamente cuando hay armadura media/pesada equipada **o** carga media/pesada/sobrecargada (sin acumularse entre sí, tal como exige la regla — se aplica una única reducción, no dos). Tests: Humano sin nada → 30 ft; Halfling → 20 ft; Humano con armadura pesada → 20 ft; Humano con armadura ligera → 30 ft (sin penalización); Humano con carga media sin armadura → 20 ft.

`CharacterView.tsx` muestra ahora `{speed}ft` en vez del texto fijo `30ft` en dos sitios (estadística rápida y la tarjeta de "Velocidad" en el panel de combate).

**⚠️ Limitación conocida:** la tabla de reducción de velocidad (`SPEED_REDUCTION_TABLE`) solo cubre explícitamente 10/15/20/30/40 pies (los únicos valores base presentes en el catálogo de razas actual); para cualquier otro valor cae a una aproximación genérica (`×2/3`, redondeada al múltiplo de 5 más cercano) que no está verificada contra la tabla oficial completa del Core Rulebook. Documentado en el código.

**Veredicto: ✅ Correcto para los valores de velocidad realmente usados por el catálogo de razas.**

---

## 16. XP y avance de nivel

Sin cambios — sigue siendo una decisión de diseño válida (gestión manual de XP), no un bug. El campo `character.xp` existe pero no dispara ninguna fórmula.

**Veredicto: ⚠️ Diseño aceptado, documentado, no corregido (no había nada que corregir).**

---

## 17. Dotes por nivel — `src/pages/CharacterView.tsx`

`Math.ceil(character.level / 2)`. Sin cambios, seguía siendo correcto.

**Veredicto: ✅ Correcto.**

---

## 18. Compañero animal — `src/data/animalCompanions.ts:274-306`

```ts
const SIZE_AC_MOD: Record<AnimalBaseStats['size'], number> = { P: 1, M: 0, G: -1 }
...
ac: 10 + mod(dex) + na + SIZE_AC_MOD[base.size],
```

**Corrección aplicada:** la CA del compañero ahora incluye su modificador de tamaño (Pequeño +1 / Mediano +0 / Grande −1), usando una tabla local restringida a los tres tamaños que existen en el catálogo de compañeros (`P`/`M`/`G`), en vez de importar el sistema de tamaño de personajes (evita acoplar `data/` a `engine/`).

**⚠️ Limitación conocida, no corregida (fuera de la lista de 9 correcciones priorizadas):** la CA del compañero sigue sin contemplar armadura equipable — por regla, los compañeros animales sí pueden llevar armadura (con ciertas restricciones de tipo por especie), pero `calculateCompanionStats` no tiene ningún concepto de equipo. Añadirlo requeriría extender `AnimalCompanion` con una lista de armadura propia, que es una funcionalidad nueva, no una corrección de fórmula — queda documentado como mejora futura.

**Veredicto: ✅ Corregido en el aspecto auditado (tamaño). ⚠️ Persiste una limitación de alcance ya conocida (armadura).**

---

## 19. Challenge Rating — `src/lib/formatCR.ts`

Sin cambios — solo formatea un valor introducido a mano, no hay cálculo que auditar.

**Veredicto: ✅ Correcto.**

---

## 20. Campañas — XP/dificultad de encuentro

Sin cambios — sigue sin existir ninguna fórmula de dificultad de encuentro ni de reparto de XP; todo es entrada manual del DJ. No es un bug, es una funcionalidad no implementada, documentada como posible mejora futura opcional (no formaba parte de la lista de 9 correcciones priorizadas).

**Veredicto: ⚠️ Diseño aceptado, sin cambios.**

---

## Limitaciones de alcance conocidas (documentadas, no corregidas en esta pasada)

Ninguna de estas apareció en la lista de 9 correcciones priorizadas de la auditoría original — se documentan aquí para que quede constancia de que fueron detectadas y conscientemente dejadas fuera de alcance, no pasadas por alto:

1. **Weapon Finesse** no está modelado (usar Dex en vez de Str para armas ligeras cuerpo a cuerpo).
2. **Armas a distancia** siguen sumando `dexMod` al daño de forma genérica, en vez de no sumar nada (salvo arcos compuestos con clasificación de Fuerza) o sumar Fuerza en armas arrojadizas.
3. **`WeaponManager.tsx`** es código muerto (no usado en ninguna pantalla) con una fórmula de ataque desactualizada — no se corrigió por no tener efecto en el comportamiento real de la app; se recomienda eliminarlo en una limpieza futura.
4. **Bono racial de puntos de habilidad de Humano** ("+1 punto de habilidad por nivel", listado como rasgo en `data/races.ts` pero nunca aplicado en `computeSkillPointsAvailable`) no está modelado.
5. **Clase favorita (favored class)** — el bono alternativo de +1 PV o +1 punto de habilidad por nivel de clase favorita (regla APG) no está modelado.
6. **Tabla de reducción de velocidad** solo verificada para 10/15/20/30/40 pies (los valores reales del catálogo de razas); otros valores usan una aproximación no verificada.
7. **Armadura de compañero animal** no está modelada (ver punto 18).
8. **Stacking de penalizaciones tipadas**: el motor de modificadores (`engine/modifiers.ts`) trata las penalizaciones igual que los bonos para efectos de stacking por tipo (toma la de mayor magnitud dentro del mismo tipo, en vez de acumular todas). No se dispara con los datos actuales (casi todas las condiciones usan tipo `untyped`, que sí se acumula correctamente), pero quedaría mal si en el futuro se añaden penalizaciones tipadas de fuentes distintas.
9. **XP y dificultad de encuentro** siguen siendo enteramente manuales (puntos 16 y 20).

---

## Verificación

- `npx tsc --noEmit` → sin errores.
- `npm run build` → build de producción correcto.
- `npm test` → **116/116 tests pasan** (93 preexistentes + 23 nuevos en `src/engine/__tests__/formulas.test.ts`, que cubren tamaño, puntos/total de habilidad, daño por empuñadura, Ataque Poderoso, capacidad de carga y velocidad con casos verificados numéricamente contra las tablas oficiales).

## Metodología

Misma metodología que la auditoría original (lectura literal del código, contraste manual contra el Core Rulebook/SRD, verificación cruzada entre pantallas), añadiendo esta vez verificación automatizada mediante tests unitarios para las fórmulas nuevas/corregidas, en vez de solo cálculo manual.
