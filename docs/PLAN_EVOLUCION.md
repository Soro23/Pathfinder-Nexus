# Plan de Evolución de Software
## Pathfinder Nexus — Gestión de Personajes y Campañas

**Versión:** 1.0
**Fecha:** 2026-03-19
**Preparado por:** Análisis Funcional & Arquitectura de Software
**Stack:** React 19 + TypeScript + Vite · Zustand + localStorage · React Router v7 · CSS Modules

---

## 1. Objetivo

Evolucionar Pathfinder Nexus desde su estado actual (gestión básica de personajes y campañas) hasta un sistema completo de referencia y juego para Pathfinder 1e, cubriendo la totalidad del SRD disponible en d20pfsrd.com.

Los objetivos concretos son:

- Ampliar la cobertura de clases, razas, hechizos, dotes y habilidades al 100% del núcleo de Pathfinder 1e.
- Corregir y completar la lógica de negocio (cálculo de oro inicial, visibilidad de pestaña de hechizos, magia por tipo de clase, niveles de hechizo completos, bonificadores automáticos).
- Mejorar la UX de la ficha de personaje (cabecera, modos visualización/edición, progresión de clase, diario).
- Sentar las bases para el sistema homebrew y las expansiones futuras (dados, sonidos, contenido personalizado).

---

## 2. Alcance

### Dentro del alcance

| Área | Descripción |
|------|-------------|
| Personajes | Creación completa, ficha, progresión, hechizos, habilidades, dotes, inventario, diario |
| Campañas | CRUD independiente, gestión de party mediante pop-up |
| Datos SRD | Ampliación a todas las clases y razas del núcleo de Pathfinder 1e |
| Reglas | Motor de modificadores automáticos (dotes, objetos → stats) |
| UI/UX | Cabecera de personaje, modos vista/edición, iconos, tabla de progresión |

### Fuera del alcance (Fase Futura)

- Sistema de dados (roller).
- Sonidos ambientales.
- Sistema homebrew (skills, feats, classes, spells personalizados).
- Backend / sincronización en la nube.
- Autenticación real.

---

## 3. Estado Actual

### Completado

- Fases 1–3: MVP, ficha completa, combate, hechizos básicos.
- Diseño Stitch: paleta, tipografía, sistema de capas tonales, sin líneas.
- Ficha de personaje con 8 pestañas: Personaje, Hechizos, Inventario, Habilidades, Dotes, Arsenal, Diario, Compañero.
- Campañas: CRUD completo, notas, NPCs, asignación de personajes.
- Sistema de magia: 200+ hechizos (niveles 0–9, arcano/divino), filtros, ranuras por nivel.
- 11 clases, 7 razas, 35 habilidades, ~50 dotes.
- Cálculos de combate: CA, CAT, CF, BAB, CMB, CMD, salvaciones.
- ArsenalManager: armaduras y armas con reglas de equipado.
- AnimalCompanion para Ranger/Druida.
- Efectos de estado (buffs/debuffs).

### Pendiente identificado (en curso)

- Contador de capacidad de inventario (X/12 ranuras).
- Tarjetas de arma expandibles con detalle de crítico/alcance.
- Penalización de armadura reflejada en tabla de habilidades.
- Bonificador de clase en tabla de habilidades.
- Notas tácticas por sesión de combate.

### Deuda técnica relevante

- Las clases que lanzan magia no están modeladas con su tipo de magia (arcana/divina/psíquica/barda), lo que impide filtrar correctamente los hechizos disponibles y mostrar/ocultar la pestaña de forma automática.
- No existe motor de modificadores: las dotes y objetos no aplican sus efectos a las stats automáticamente.
- No hay tabla de progresión por clase expuesta al usuario.
- El oro inicial no se calcula según la clase.
- El sistema de razas/clases no cubre el catálogo completo del SRD.

---

## 4. Requisitos Funcionales

### 4.1 Personajes — Creación

#### RF-P01: Cobertura completa de razas
- **Referencia de datos:** Ver [docs/RACES_LIST.md](RACES_LIST.md) para el catálogo completo de razas con stats, traits y fuentes SRD.
- **Descripción:** Ampliar `src/data/races.ts` para incluir todas las razas del núcleo de Pathfinder 1e (mínimo: las 7 actuales + Aasimar, Tiefling, Goblín, Kobold, Tengu, Kitsune, Suli, y demás razas del Advanced Race Guide).
- **Estructura de datos requerida:**
  ```typescript
  interface Race {
    id: string
    name: string
    size: 'small' | 'medium' | 'large'
    speed: number
    abilityAdjustments: Partial<Record<AbilityKey, number>>
    traits: RacialTrait[]
    favoredClass?: string[]       // Puede tener múltiples
    languages: string[]
    bonusLanguages: string[]
    subraces?: Subrace[]
  }
  ```
- **Criterio de aceptación:** El selector de raza en CharacterNew muestra todas las razas del SRD núcleo, agrupadas por categoría (core, featured, uncommon).

#### RF-P02: Cobertura completa de clases
- **Referencia de datos:** Ver [docs/CLASS_LIST.md](CLASS_LIST.md) para el catálogo completo de clases con descripción, URLs y agrupación por fuente (Core, APG, etc.).
- **Descripción:** Ampliar `src/data/classes.ts` para incluir todas las clases del núcleo y las más comunes del APG (Advanced Player's Guide): Alquimista, Caballero, Inquisidor, Oráculo, Summoner, Brujo.
- **Propiedad `magicType` requerida:**
  ```typescript
  type MagicType = 'arcane' | 'divine' | 'psychic' | 'bardic' | 'alchemist' | null
  interface ClassData {
    // ...campos existentes...
    magicType: MagicType           // null = no lanzador
    spellsKnown?: SpellsKnownTable // Hechizos conocidos por nivel (Bardo, Hechicero)
    spellsPerDay?: SpellsPerDayTable // Ranuras por nivel de personaje
    casterAbility: AbilityKey | null  // 'intelligence' | 'wisdom' | 'charisma' | null
    startingGoldDice: string       // "5d6*10"
  }
  ```
- **Criterio de aceptación:** El selector de clase muestra todas las clases implementadas. Las clases sin magia tienen `magicType: null`.

#### RF-P03: Oro inicial por clase
- **Descripción:** Al completar la creación de personaje, calcular el oro inicial automáticamente según la clase principal.
- **Tabla de referencia (d20pfsrd):**

  | Clase | Oro inicial |
  |-------|-------------|
  | Bárbaro | 3d6 × 10 gp |
  | Bardo | 3d6 × 10 gp |
  | Clérigo | 4d6 × 10 gp |
  | Druida | 2d6 × 10 gp |
  | Guerrero | 5d6 × 10 gp |
  | Mago | 2d6 × 10 gp |
  | Monje | 1d6 × 10 gp |
  | Paladín | 5d6 × 10 gp |
  | Pícaro | 4d6 × 10 gp |
  | Ranger | 5d6 × 10 gp |
  | Hechicero | 2d6 × 10 gp |

- **Implementación:** Añadir propiedad `startingGoldDice: string` en `ClassData`. En el último paso del wizard (`CharacterNew.tsx`), calcular y asignar `character.coins.gp`.
- **Criterio de aceptación:** El personaje recién creado tiene el campo `coins.gp` con el valor calculado del roll; se muestra en el resumen final del wizard.

---

### 4.2 Ficha de Personaje — Cabecera (Header)

#### RF-P04: Alineación vertical de stats
- **Descripción:** Los siguientes campos de la cabecera deben estar centrados verticalmente en su celda y entre sí: Iniciativa, BAB, Bono de Competencia, XP, CA.
- **Cambio:** En `CharacterView.tsx`, asegurar `align-items: center` y altura consistente entre items.
- **Iconos visuales:** Añadir un icono Lucide React representativo junto a cada stat:

  | Stat | Icono |
  |------|-------|
  | Iniciativa | `Zap` |
  | BAB | `Sword` |
  | Bono de Competencia | `Star` |
  | XP | `TrendingUp` |
  | CA | `Shield` |

- **Criterio de aceptación:** En cualquier resolución ≥320px, los 5 stats aparecen alineados verticalmente, con icono a la izquierda del valor.

---

### 4.3 Hechizos

#### RF-P05: Visibilidad condicional de la pestaña Hechizos
- **Descripción:** La pestaña "Hechizos" solo debe aparecer si la clase (o una de las clases en multiclase) es lanzadora de magia.
- **Implementación:**
  ```typescript
  // En CharacterView.tsx
  const isCaster = character.classes.some(c => {
    const cls = getClassById(c.id)
    return cls?.magicType !== null
  })
  // Solo renderizar la tab si isCaster === true
  ```
- **Criterio de aceptación:** Un Guerrero o Bárbaro no ven la pestaña. Un Mago, Clérigo, Bardo sí la ven. Un multiclase Guerrero/Mago la ve.

#### RF-P06: Filtrado de hechizos por clase
- **Descripción:** En el componente `Spellbook.tsx`, los hechizos mostrados deben corresponder únicamente a la lista de hechizos de la clase del personaje.
- **Cambios en datos:** Añadir propiedad `classLists` en cada hechizo:
  ```typescript
  interface Spell {
    // ...campos existentes...
    classLists: Record<string, SpellLevel>  // { wizard: 1, sorcerer: 1, bard: 2 }
  }
  ```
- **Lógica de filtrado:**
  ```typescript
  const availableSpells = SPELLS.filter(spell =>
    character.classes.some(c => spell.classLists[c.id] !== undefined)
  )
  ```
- **Criterio de aceptación:** Un Clérigo solo ve hechizos de clérigo. Un Bardo ve hechizos de bardo. Un multiclase ve la unión de sus listas.

#### RF-P07: Soporte de tipos de magia adicionales
- **Descripción:** El sistema debe distinguir y etiquetar correctamente:
  - **Arcana:** Mago, Hechicero, Brujo, Magus.
  - **Divina:** Clérigo, Druida, Paladín, Ranger, Oráculo, Inquisidor.
  - **Bárdica:** Bardo (magia arcana basada en Carisma, lista propia).
  - **Alquímica:** Alquimista (extracts, no hechizos clásicos).
- **UI:** En la cabecera de Spellbook, mostrar el tipo de magia activo con un badge.
- **Criterio de aceptación:** Badge visible y correcto según la clase. Si multiclase con dos tipos, mostrar ambos.

#### RF-P08: Hechizos de todos los niveles (0–9)
- **Descripción:** Asegurar que `Spellbook.tsx` renderiza secciones para los niveles 0 al 9, incluso si el personaje aún no tiene acceso a niveles altos.
- **UX:** Los niveles a los que el personaje no llega todavía se muestran colapsados o en estado "bloqueado" con un candado.
- **Criterio de aceptación:** Un Mago de nivel 1 ve las secciones 0–9; los niveles 2–9 están bloqueados con un indicador de nivel requerido.

---

### 4.4 Habilidades (Skills)

#### RF-P09: Bonificadores misceláneos (misc)
- **Descripción:** Cada habilidad debe permitir uno o más bonificadores misceláneos con descripción opcional.
- **Ya implementado parcialmente:** `SkillRank.miscBonuses?: MiscBonus[]` existe en la tienda.
- **Pendiente:** Asegurar que `SkillsList.tsx` permite añadir/editar/eliminar estos bonos en modo edición, y los suma correctamente al total.
- **Fórmula completa de skill:**
  ```
  Total = Ranks + Ability Modifier + Class Skill Bonus (+3 si tiene ≥1 rank)
        + Racial Bonus + Feat Bonus + Item Bonus + Armor Check Penalty + Misc Bonuses
  ```
- **Criterio de aceptación:** El total de una skill refleja todos los bonificadores. En tooltip o desplegable se puede ver el desglose.

#### RF-P10: Penalización de armadura en habilidades
- **Descripción:** Las habilidades con `hasArmorCheckPenalty: true` deben restar el `armorCheckPenalty` de la armadura equipada.
- **Ya disponible:** `Armor.armorCheckPenalty` y `Skill.hasArmorCheckPenalty` existen en los datos.
- **Pendiente:** Conectar el cálculo en `SkillsList.tsx`.
- **Criterio de aceptación:** Si se equipa una Cota de Malla (ACP -5), Acrobacias muestra -5 en su total.

#### RF-P11: Bonificador de clase skill
- **Descripción:** Si una skill es de clase y el personaje tiene ≥1 rango asignado, suma +3 al total.
- **Criterio de aceptación:** Al asignar el primer rango en una skill de clase, el total sube +4 (1 rango + 3 clase).

---

### 4.5 Dotes

#### RF-P12: Modos visualización y edición de dotes
- **Referencia de datos:** Ver [docs/FEATS_LIST.md](FEATS_LIST.md) para el catálogo de dotes con categorías, descripciones y URLs SRD.

- **Descripción:**
  - **Modo visualización:** Mostrar solo las dotes seleccionadas (tarjetas compactas con nombre, tipo y beneficio).
  - **Modo edición:** Mostrar el `FeatsSelector` completo con búsqueda, filtros por tipo y selector.
- **Implementación:** En `CharacterView.tsx`, condicionar el render de `FeatsSelector` según el estado de edición del personaje.
- **Criterio de aceptación:** Al entrar en la pestaña Dotes en modo lectura, no hay controles de selección. Al activar edición, aparece el selector completo.

---

### 4.6 Tabla de Progresión de Clase

#### RF-P13: Tabla de progresión hasta nivel 20
- **Descripción:** Nueva sección en la pestaña "Personaje" o subpestaña accesible desde ella: tabla de progresión completa de la clase del personaje.
- **Columnas:**

  | Nivel | BAB | Fort | Ref | Vol | Puntos de habilidad | Hechizos/día | Características especiales |
  |-------|-----|------|-----|-----|---------------------|--------------|---------------------------|
  | 1–20  | ... | ...  | ... | ... | ...                 | (si caster)  | lista de features          |

- **Datos:** Las fórmulas para BAB y salvaciones ya existen en `getBABForLevel()` y `getSaveForLevel()` en `src/data/classes.ts`. Las características de clase (`ClassFeature[]`) están en `ClassData.features`.
- **UI:** La fila del nivel actual del personaje debe resaltarse.
- **Criterio de aceptación:** El jugador puede ver de un vistazo qué ganará su personaje en los próximos niveles.

---

### 4.7 Diario

#### RF-P14: Control de modo edición en Diario
- **Descripción:**
  - **Modo visualización:** El diario muestra entradas en modo lectura. No hay botones de edición/borrado inline.
  - **Modo edición:** Aparece botón "Nueva entrada". Al pulsarlo, abre un **modal/pop-up obligatorio** con campos: Contenido, Personajes importantes (nombre + rol), Lugares descubiertos.
- **Criterio de aceptación:** En modo lectura, las entradas son solo texto. En modo edición, el modal es el único punto de entrada para nuevas entradas; no se puede escribir directamente en la lista.

---

### 4.8 Motor de Modificadores Automáticos

#### RF-P15: Sistema de reglas/modificadores
- **Descripción:** Las dotes y objetos del inventario pueden declarar efectos que se aplican automáticamente a las stats del personaje.
- **Diseño del motor:**
  ```typescript
  interface Modifier {
    id: string
    source: string            // "Feat: Power Attack", "Item: Amulet of Natural Armor"
    type: ModifierType        // 'competence' | 'enhancement' | 'insight' | 'luck' |
                              // 'morale' | 'natural' | 'circumstance' | 'racial' | 'untyped'
    target: ModifierTarget
    value: number
    condition?: string        // "while raging", "vs undead"
  }

  type ModifierTarget =
    | 'ac' | 'ac_natural' | 'ac_deflection'
    | 'attack' | 'damage'
    | 'save_fort' | 'save_ref' | 'save_will'
    | 'initiative'
    | 'cmb' | 'cmd'
    | `skill:${string}`       // skill:acrobatics, skill:perception
    | 'hp' | 'speed'
  ```
- **Regla de apilamiento:** Los bonificadores del mismo tipo (excepto `untyped` y `circumstance`) **no se apilan** — solo aplica el mayor.
- **Implementación:**
  - Nuevo módulo `src/engine/modifiers.ts` con función `resolveModifiers(character): ResolvedStats`.
  - `ResolvedStats` contiene todos los stats calculados incluyendo todos los bonificadores activos.
  - Los componentes consumen `ResolvedStats` en lugar de calcular inline.
- **Dotes con efectos automáticos (ejemplos):**

  | Dote | Modificador |
  |------|-------------|
  | Toughness | +3 hp (y +1 por nivel > 3) |
  | Weapon Focus | +1 attack con arma elegida |
  | Skill Focus | +3 (o +6 si 10 ranks) a skill elegida |
  | Alertness | +2 Perception, +2 Sense Motive |

- **Objetos con efectos (ejemplos):**

  | Objeto | Modificador |
  |--------|-------------|
  | Amulet of Natural Armor +1 | +1 AC natural |
  | Cloak of Resistance +1 | +1 todas las salvaciones |
  | Headband of Vast Intellect +2 | +2 INT enhancement |

- **Criterio de aceptación:** Al seleccionar "Skill Focus (Percepción)", el total de Percepción sube +3 automáticamente. Al equipar un "Anillo de Protección +1", la CA aumenta +1 (deflección).

---

### 4.9 Campañas

#### RF-C01: Campañas independientes de personajes
- **Descripción:** Ya implementado en el store (`campaignStore.ts`). Verificar que `CampaignNew.tsx` no requiere personajes para crear una campaña.
- **Criterio de aceptación:** Se puede crear y guardar una campaña con solo nombre, descripción y GM; sin personajes asignados.

#### RF-C02: Añadir personaje a campaña mediante pop-up
- **Descripción:** En `CampaignView.tsx`, el flujo de asignación de personaje debe hacerse vía modal con los siguientes datos del personaje:
  - Nombre + Raza + Clase + Nivel
  - Salvaciones (Fort, Ref, Vol)
  - Habilidades relevantes (Percepción, Sigilo, Diplomacia)
  - CA actual
- **Ya existe:** `CharacterAssigner.tsx` como base. Ampliar para mostrar los stats listados arriba.
- **Criterio de aceptación:** El GM puede abrir el modal, ver stats clave de cada personaje disponible y asignarlo a la campaña con un click.

---

## 5. Requisitos No Funcionales

| ID | Requisito | Criterio |
|----|-----------|----------|
| RNF-01 | **Rendimiento** | La ficha de personaje carga en <200ms con 500 hechizos en memoria. Sin recálculos innecesarios. |
| RNF-02 | **Escalabilidad de datos** | Los archivos de datos deben soportar 50+ clases y 2000+ hechizos. Usar índices Map para búsquedas O(1). |
| RNF-03 | **Separación de capas** | La lógica de reglas (cálculos, modificadores, progresión) debe vivir en `src/engine/`, nunca inline en componentes React. |
| RNF-04 | **Tipado estricto** | Todo nuevo código en TypeScript con `strict: true`. Sin `any`. |
| RNF-05 | **Persistencia** | El estado del motor de modificadores se calcula en tiempo real; no se persiste en localStorage (se deriva del character). |
| RNF-06 | **Compatibilidad** | Funcionar en Chrome/Firefox/Edge modernos (últimas 2 versiones) y en móvil (≥375px). |
| RNF-07 | **Consistencia de diseño** | Todo nuevo componente sigue las reglas del sistema Stitch: sin bordes de línea, profundidad por capas tonales, border-radius 4px/2px/9999px según contexto. |
| RNF-08 | **Sin regresiones** | Las funcionalidades existentes (inventario, arsenal, animal companion) no deben verse afectadas. |

---

## 6. Priorización

### P0 — Crítico (bloquea uso correcto del sistema)

| ID | Título |
|----|--------|
| RF-P05 | Pestaña hechizos solo si es caster |
| RF-P06 | Filtrar hechizos por lista de clase |
| RF-P03 | Oro inicial por clase |
| RF-P09 | Bonificadores misc en skills |
| RF-P10 | Penalización de armadura en skills |
| RF-P11 | Bonificador de clase en skills |
| RF-C01 | Campañas independientes (verificar) |

### P1 — Alta prioridad (mejora significativa de UX)

| ID | Título |
|----|--------|
| RF-P02 | Ampliar clases (núcleo + APG básico) |
| RF-P04 | Cabecera: centrado vertical + iconos |
| RF-P07 | Tipos de magia adicionales |
| RF-P08 | Hechizos todos los niveles 0–9 |
| RF-P12 | Modos visualización/edición de dotes |
| RF-P14 | Diario: modo vista/edición + modal |
| RF-C02 | Pop-up de asignación de personaje |

### P2 — Media prioridad (completitud del sistema)

| ID | Título |
|----|--------|
| RF-P01 | Ampliar razas (featured + uncommon) |
| RF-P13 | Tabla de progresión nivel 1–20 |
| RF-P15 | Motor de modificadores automáticos |

---

## 7. Roadmap por Fases

### Fase A — Correcciones Core
*Objetivo: Corregir los errores funcionales que afectan al uso diario.*

**Archivos principales:** `src/data/classes.ts`, `src/store/characterStore.ts`, `src/pages/CharacterNew.tsx`, `src/components/character/SkillsList.tsx`, `src/components/character/Spellbook.tsx`, `src/pages/CharacterView.tsx`

| Tarea | RF | Estimación |
|-------|----|------------|
| Añadir `magicType` y `casterAbility` a todas las clases | RF-P02 | 2h |
| Pestaña hechizos condicional | RF-P05 | 1h |
| Añadir `classLists` a hechizos y filtrar por clase | RF-P06 | 4h |
| Oro inicial por clase en wizard | RF-P03 | 2h |
| Bonificador de clase y ACP en SkillsList | RF-P10, RF-P11 | 3h |
| Añadir UI de misc bonuses en SkillsList | RF-P09 | 3h |
| Verificar independencia de campañas | RF-C01 | 1h |

**Entregable:** App sin errores funcionales en el flujo principal de creación y gestión de personaje.

---

### Fase B — UX & Completitud
*Objetivo: Mejorar la experiencia y completar las funcionalidades de la ficha.*

**Archivos principales:** `src/pages/CharacterView.tsx`, `src/components/character/Spellbook.tsx`, `src/pages/CampaignView.tsx`, `src/components/campaign/CharacterAssigner.tsx`

| Tarea | RF | Estimación |
|-------|----|------------|
| Cabecera: centrado vertical + iconos Lucide | RF-P04 | 3h |
| Badge de tipo de magia en Spellbook | RF-P07 | 2h |
| Niveles 0–9 con estado bloqueado en Spellbook | RF-P08 | 3h |
| Modos visualización/edición de dotes | RF-P12 | 2h |
| Diario: modo lectura + modal para nueva entrada | RF-P14 | 4h |
| Pop-up de asignación con stats clave | RF-C02 | 4h |

**Entregable:** Ficha de personaje completa y campaña con flujo de party usable.

---

### Fase C — Datos SRD Completos
*Objetivo: Ampliar la cobertura de datos al catálogo completo del SRD.*

**Documentos de referencia:**
- [docs/RACES_LIST.md](RACES_LIST.md) — Catálogo de razas (core, featured, uncommon) con stats y traits
- [docs/CLASS_LIST.md](CLASS_LIST.md) — Catálogo de clases (core, APG, Ultimate…) con descripción y URLs
- [docs/FEATS_LIST.md](FEATS_LIST.md) — Catálogo de dotes por categoría con URLs SRD
- [docs/SPELLS_LIST.md](SPELLS_LIST.md) — Catálogo de hechizos con URLs SRD
- [docs/SPELLS_LIST_EXTENDED.md](SPELL_LIST_EXTENDED.md) — Catálogo de hechizos con URLs SRD

**Archivos principales:** `src/data/classes.ts`, `src/data/races.ts`, `src/data/spells.ts`, `src/data/feats.ts`

| Tarea | RF | Estimación |
|-------|----|------------|
| Razas: añadir featured + uncommon (Aasimar, Tiefling, Tengu, etc.) | RF-P01 | 6h |
| Clases APG básico: Alquimista, Oráculo, Brujo, Inquisidor, Caballero | RF-P02 | 8h |
| Hechizos: ampliar a 600+ (listas completas por clase) | RF-P06 | 12h |
| Tabla de progresión nivel 1–20 por clase | RF-P13 | 6h |

**Estrategia de datos — índices O(1):**
```typescript
// src/data/index.ts
export const SPELL_INDEX = new Map(SPELLS.map(s => [s.id, s]))
export const CLASS_INDEX = new Map(CLASSES.map(c => [c.id, c]))
export const SPELLS_BY_CLASS: Map<string, Spell[]> = new Map()
for (const spell of SPELLS) {
  for (const classId of Object.keys(spell.classLists)) {
    if (!SPELLS_BY_CLASS.has(classId)) SPELLS_BY_CLASS.set(classId, [])
    SPELLS_BY_CLASS.get(classId)!.push(spell)
  }
}
```

**Entregable:** Cobertura ≥90% del SRD núcleo de Pathfinder 1e.

---

### Fase D — Motor de Modificadores
*Objetivo: Sistema de reglas automático para dotes y objetos mágicos.*

- [docs/FEATS_LIST.md](FEATS_LIST.md) — Catálogo de dotes con URLs SRD

**Archivos a crear:** `src/engine/modifiers.ts`, `src/engine/types.ts`
**Archivos a modificar:** `src/data/feats.ts`, `src/store/characterStore.ts`, `src/pages/CharacterView.tsx`, `src/components/character/SkillsList.tsx`

| Tarea | RF | Estimación |
|-------|----|------------|
| Definir tipos `Modifier`, `ModifierTarget`, `ModifierType` | RF-P15 | 2h |
| Implementar `resolveModifiers(character)` con apilamiento | RF-P15 | 6h |
| Añadir `effects: Modifier[]` a dotes | RF-P15 | 4h |
| Añadir `effects: Modifier[]` a items de inventario | RF-P15 | 4h |
| Conectar `ResolvedStats` a CharacterView, SkillsList | RF-P15 | 4h |
| Tooltip de desglose de bonificadores por stat | RF-P15 | 3h |

**Regla de apilamiento (crítica):**
```typescript
function stackModifiers(modifiers: Modifier[], target: ModifierTarget): number {
  const grouped = groupBy(modifiers, m => m.type)
  return Object.values(grouped).reduce((total, group) => {
    if (group[0].type === 'untyped' || group[0].type === 'circumstance') {
      return total + sum(group.map(m => m.value))  // Todos se apilan
    }
    return total + Math.max(...group.map(m => m.value))  // Solo el mayor
  }, 0)
}
```

**Entregable:** Las dotes y objetos mágicos aplican sus efectos automáticamente. Los totales de AC, skills y salvaciones son completamente precisos.

---

### Fase E — Futuro (sin fecha comprometida)

| Feature | Descripción |
|---------|-------------|
| Sistema de dados | Roller con historial, modificadores automáticos, macros |
| Sonidos ambientales | Biblioteca de audio ambiental por tipo de escena |
| Homebrew Skills | Crear skills personalizadas con ability asociada |
| Homebrew Feats | Crear dotes con efectos personalizados (usa el motor de modificadores) |
| Homebrew Classes | Definir clases con progresión personalizada |
| Homebrew Spells | Crear hechizos con todos los parámetros del SRD |

---

## 8. Riesgos

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|-------------|---------|------------|
| R01 | La ampliación de hechizos (600+) degrada el rendimiento del filtrado | Media | Alto | Usar índices Map; virtualizar la lista si supera 200 items visibles |
| R02 | El motor de modificadores introduce bugs en stats existentes | Alta | Alto | Implementar como capa aditiva; mantener cálculos actuales como fallback durante transición |
| R03 | Datos del SRD incompletos o incorrectos | Alta | Medio | Documentar fuente (d20pfsrd.com) en comentarios; revisión manual por clase |
| R04 | Pérdida de datos en localStorage al migrar tipos | Media | Alto | Versionar el schema del store; implementar migración con `_version` |
| R05 | Explosión de complejidad en el sistema homebrew | Baja | Medio | Diseñar homebrew como extensión del sistema de datos existente |
| R06 | Reglas de apilamiento de modificadores mal implementadas | Media | Alto | Cubrir con tests unitarios para los casos de Power Attack, múltiples Enhancement bonuses |

---

## 9. Arquitectura Recomendada

### 9.1 Estructura de directorios objetivo

```
src/
├── data/                          # Datos SRD puros (sin lógica)
│   ├── classes.ts
│   ├── races.ts
│   ├── spells.ts
│   ├── feats.ts
│   ├── skills.ts
│   └── index.ts                   # Barrel + índices Map
│
├── engine/                        # Lógica de negocio de Pathfinder (NUEVO)
│   ├── modifiers.ts               # Motor de modificadores + apilamiento
│   ├── progression.ts             # Tablas de BAB, saves, skills por nivel
│   ├── spellAccess.ts             # Qué hechizos puede usar una clase/nivel
│   └── types.ts                   # Tipos del motor (Modifier, ResolvedStats, etc.)
│
├── store/
│   ├── characterStore.ts          # CRUD + tipos Character
│   └── campaignStore.ts           # CRUD + tipos Campaign
│
├── pages/                         # Solo presentación + llamadas al engine
├── components/                    # UI pura, sin cálculos de reglas inline
└── styles/
```

### 9.2 Principios de separación de capas

1. **`src/data/`** — Solo datos. Sin funciones que calculen reglas.
2. **`src/engine/`** — Toda la lógica de Pathfinder. Sin JSX ni imports de React.
3. **`src/store/`** — Estado de la app. Llama al engine para cálculos derivados.
4. **`src/pages/` y `src/components/`** — Solo presentación. Consumen datos del store y del engine.

### 9.3 Migración de schema localStorage

```typescript
// src/store/characterStore.ts
const SCHEMA_VERSION = 2
const migrate = (data: unknown): Character[] => {
  // Si data viene de versión anterior, aplicar transformaciones
}
```

---

## 10. Verificación (Criterios de Done por Fase)

### Fase A
- [ ] Crear un Guerrero: no aparece la pestaña Hechizos.
- [ ] Crear un Mago: aparece la pestaña Hechizos con solo hechizos de mago.
- [ ] Crear un Clérigo: aparece pestaña con solo hechizos de clérigo.
- [ ] El Guerrero recién creado tiene ~100gp (5d6×10). El Mago tiene ~35gp (2d6×10).
- [ ] Equipar una Cota de Malla: Acrobacias, Escalar, Sigilo bajan por el ACP.
- [ ] Asignar primer rango a Percepción (skill de clase): total sube +4.
- [ ] Crear campaña sin personajes: se guarda correctamente.

### Fase B
- [ ] En la cabecera, Iniciativa/BAB/BC/XP/CA están alineados verticalmente con iconos.
- [ ] En modo lectura de Dotes: no hay controles de selección.
- [ ] En modo lectura del Diario: no hay botón de edición inline.
- [ ] Al pulsar "Nueva entrada" en modo edición del Diario: aparece modal.
- [ ] En CampaignView, el modal de añadir personaje muestra CA, salvaciones y skills.

### Fase C
- [ ] El selector de raza incluye Aasimar, Tiefling y Tengu.
- [ ] El selector de clase incluye Oráculo, Alquimista e Inquisidor.
- [ ] La tabla de progresión del Mago muestra niveles 1–20 con hechizos/día correctos.

### Fase D
- [ ] Seleccionar "Skill Focus (Percepción)": el total de Percepción sube +3 automáticamente.
- [ ] Equipar "Amulet of Natural Armor +1": la CA aumenta +1.
- [ ] Dos ítems con Enhancement +1 a Fuerza: solo aplica uno (+1, no +2).
- [ ] El tooltip de CA muestra el desglose completo de bonificadores.

---

## 11. Conclusión

Pathfinder Nexus tiene una base técnica sólida y un diseño visual coherente. Los requisitos identificados se agrupan en cuatro vectores de mejora:

1. **Correcciones de lógica de negocio** (Fase A): el más urgente. Afectan directamente a la correctitud del sistema según las reglas de Pathfinder 1e.
2. **UX de la ficha** (Fase B): mejoran la usabilidad sin cambiar la arquitectura.
3. **Cobertura de datos SRD** (Fase C): amplían el valor del producto para el usuario final.
4. **Motor de modificadores** (Fase D): la pieza arquitectónica más compleja; sienta la base para el sistema homebrew futuro.

La separación propuesta entre `src/data/`, `src/engine/` y `src/components/` garantiza que el sistema escale a cientos de clases, miles de hechizos y un futuro sistema homebrew sin degradar la mantenibilidad.

**Fuente de referencia para datos:** https://www.d20pfsrd.com/
