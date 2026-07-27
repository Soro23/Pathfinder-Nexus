# Documento de diseño — Modo Juego (Pathfinder Nexus)

**Versión:** 1.0
**Estado:** especificación de implementación
**Destinatario:** equipo de desarrollo
**Plataforma objetivo:** móvil (columna única, ~380–430 px de ancho útil), con vista de escritorio secundaria
**Alcance:** modificar exclusivamente la pantalla **Modo Juego** (`src/pages/PlayMode.tsx` + `PlayMode.module.css`, ruta `/characters/:id/play`) de Pathfinder Nexus.
**Origen:** este documento es una adaptación de [`Especificaciones_disenyo.md`](./Especificaciones_disenyo.md) (hoja de personaje Pathfinder 2e Remaster). Se conserva su estructura y sus objetivos de usabilidad, pero **todo el contenido mecánico se ha reescrito para Pathfinder Primera Edición / SRD 3.5**, que es el sistema de reglas real de este proyecto (ver `CLAUDE.md`), y todo el contenido de interfaz se ha reescrito contra el código actual de `PlayMode.tsx`, no contra un diseño genérico.

---

> ## ⚠ AVISO SOBRE DATOS Y ALCANCE
>
> 1. **Pathfinder Nexus usa Pathfinder 1e / D20 SRD 3.5, no Pathfinder 2e.** El documento origen describe rangos de competencia 0–4, CD de clase, puntos de foco, iconos de coste de acción (◆/◆◆/◆◆◆) y agonía por pasos — ninguno de estos conceptos existe en el motor de este proyecto (`src/engine/`). Donde no hay equivalente real, este documento lo dice explícitamente en vez de inventar uno.
> 2. **Este documento describe cambios sobre código que ya existe.** Cada sección indica, con una etiqueta, si describe comportamiento ya implementado, comportamiento que se modifica, o una pantalla/componente nuevo:
>    - **[ACTUAL]** — ya implementado en `PlayMode.tsx`, sin cambios de comportamiento (puede haber ajustes de estilo).
>    - **[MODIFICA]** — existe pero cambia su comportamiento o presentación.
>    - **[NUEVO]** — no existe hoy en Modo Juego; se añade.
>    - **[FUERA DE ALCANCE]** — pertenece a otra pantalla (normalmente `CharacterView.tsx`) y no se toca.
> 3. **Gestión de personaje (build) no es Modo Juego.** Elegir dotes, aprender conjuros, comprar equipo, subir de nivel: todo eso vive en `CharacterView`. Modo Juego solo gestiona **estado de sesión** (PV, usos de poderes de clase, espacios de conjuro gastados, efectos activos, tracker de encuentro) sobre un build ya construido.
> 4. Cualquier fórmula citada aquí (BAB, salvaciones, CA, etc.) proviene de `src/engine/`, no se inventa para este documento.

---

## 1. Objetivo y criterios de aceptación

### 1.1 Objetivo

Modo Juego es la pantalla que un jugador usa **durante una partida en vivo**, no un editor de ficha. El criterio que ordena las decisiones de este documento —heredado sin cambios del documento origen— es:

> Cualquier acción que un jugador realiza varias veces por combate debe resolverse en **un solo toque**, sin cálculo mental y sin navegar fuera de la pestaña actual.

### 1.2 Criterios de aceptación

| ID | Criterio | Estado |
|---|---|---|
| G-01 | Ningún valor derivado se almacena: todo se calcula desde `resolveModifiers` + `computeCombatStats` en cada render | **[ACTUAL]** — `PlayMode.tsx:144-153` recalcula con `useMemo` en cada cambio de `character` |
| G-02 | Toda condición o efecto activo se refleja en todos los valores afectados | **[MODIFICA]** — los `statusEffects` sí se propagan (vía `resolveModifiers`); las `conditions` reglamentarias (aturdido, fatigado, etc.) están **implementadas en el motor pero no expuestas en ninguna pantalla**, incluida Modo Juego. Ver sección 8. |
| G-03 | Estado compartido entre pantallas (PV, usos de poderes, espacios de conjuro) tiene una única fuente de verdad | **[ACTUAL]** — todo vive en el store Zustand (`characterStore.ts`), persistido en `localStorage`; Modo Juego y la ficha (`CharacterView`) leen y escriben el mismo `Character` |
| G-04 | El header de Modo Juego es persistente durante el scroll de la pestaña activa | **[MODIFICA]** — hoy `.header` solo tiene `margin-bottom`, no `position: sticky` (`PlayMode.module.css:17-19`); en pantallas largas (p. ej. pestaña Combate con muchos poderes de clase) el header y el tracker de PV se pierden al hacer scroll |
| G-05 | Toda tirada muestra de dónde sale el número, no solo el total | **[MODIFICA]** — `handleQuickRoll` guarda `{ notation, result }`; no conserva el desglose por bonificador aunque el motor ya lo calcula (`ResolvedStats.allModifiers`). Ver sección 10.4 |
| G-06 | Las áreas táctiles interactivas miden como mínimo 44×44 px | **[MODIFICA]** — `Button` ya cumple 44 px en móvil vía media query (`Button.module.css:104-109`); `.skillBtn`, `.tabBtn`, `.slotPip` (20×20 px) y `.effectToggleBtn` no tienen ese mínimo |
| G-07 | La pantalla funciona sin conexión una vez cargado el personaje | **[ACTUAL]** — datos en `localStorage`, sin llamadas de red bloqueantes para tirar dados o consultar la ficha; la sincronización con Supabase es en segundo plano y no bloquea la UI |

---

## 2. Arquitectura de interfaz

### 2.1 Estado actual — tres patrones de superposición distintos

`PlayMode.tsx` usa hoy **tres mecanismos distintos** para mostrar contenido secundario, cada uno con su propio z-index y comportamiento:

| Patrón | Dónde | Comportamiento | z-index |
|---|---|---|---|
| Modal centrado | Crítico / pifia (`critOverlay` / `critModal`, líneas 396-439) | Overlay a pantalla completa, contenido centrado | 1000 |
| Drawer lateral derecho | Efectos de estado (`effectsOverlay` / `effectsDrawer`, líneas 442-660) | Se desliza desde la derecha, ancho 320 px | 1000 |
| Panel flotante fijo | Selector de dados (`dicePanelFloating`, líneas 1610-1653) | Fijo abajo-derecha, no cubre el resto de la pantalla | 100 |

**[MODIFICA] Regla de contenedor único.** Heredando el criterio del documento origen (sección 2.2): converger estos tres patrones en un único **drawer lateral derecho**, con la única excepción del selector de dados rápido (que puede seguir siendo un popover flotante, igual que en el diseño de referencia). Concretamente:

- El modal de crítico/pifia pasa a renderizarse como contenido del drawer (tipo A, ver 15.2), no como overlay propio con su animación `critPop` independiente.
- El drawer de efectos de estado ya sigue el patrón correcto; se reutiliza como base para el resto de contenido secundario (explicaciones de CA/CMB/CMD, panel de condiciones nuevo — sección 8, gestión de PV — sección 7).

### 2.2 Navegación — [ACTUAL, se mantiene]

A diferencia del documento origen (que asume 10+ secciones y por tanto descarta una tab bar y exige un menú FAB a pantalla completa), Modo Juego solo necesita **5 secciones** y ya usa una tab bar fija (`tabNav`, líneas 733-764): Combate, Habilidades, Conjuros, Dados, Encuentro. Con 5 pestañas la tab bar es la solución correcta; no se sustituye por un menú FAB. No se toca esta decisión.

### 2.3 Controles del header — [MODIFICA]

Hoy el acceso a Efectos y a Dados son dos botones-icono en el header (`statusBtn`, líneas 670-684), no un FAB inferior. Funcionalmente cumplen el mismo papel que el "FAB cluster" del documento origen, pero están en la esquina superior derecha, lejos del pulgar en el uso a una mano típico de un móvil sujeto durante la partida. Se recomienda:

- Mantener los iconos en el header como atajo secundario (para quien usa el móvil con dos manos o tablet).
- Añadir un control fijo inferior-derecho (ya existe parcialmente: `dicePanelFloating` se ancla ahí cuando está abierto) que agrupe el acceso a Dados y a Efectos/Condiciones, con área táctil ≥44×44 px.

---

## 3. Modelo de datos — [ACTUAL, documentado por primera vez]

El documento origen define un modelo `Character` + `SessionState` separados. Pathfinder Nexus **no separa build y sesión en tipos distintos**: todo vive en una única interfaz `Character` (`characterStore.ts:178-227`). Esto es una decisión ya tomada del proyecto y **no se propone cambiarla** — el criterio G-03 (fuente única de verdad) ya se cumple porque todo pasa por el mismo store, con o sin la separación de tipos.

Campos de `Character` relevantes para Modo Juego (estado "de sesión", editado desde esta pantalla):

```ts
hp: { current: number; max: number; temp: number }
statusEffects?: StatusEffect[]        // efectos libres con bono a un target concreto
conditions?: Condition[]              // condiciones reglamentarias (id, label, active) — ver sección 8
temporaryEffects?: TemporaryEffect[]  // efectos con lista de Modifier[] (conjuros, pociones…)
spellSlots: Record<number, SpellSlot> // por nivel de conjuro: { max, used }
classFeatureUses?: Record<string, number>  // usos restantes de poderes de clase, por clave libre
selectedDomains?: string[]
selectedBlessings?: string[]
channelType?: 'positive' | 'negative'
negativeLevels?: number
```

Campos de build (no se editan desde Modo Juego, solo se leen): `abilities`, `classes`, `feats`, `skills`, `spells`, `weapons`, `armor`, `inventory`.

### 3.1 Motor de valores derivados — [ACTUAL]

Ya existe y ya cumple G-01. Vive en `src/engine/`, no en componentes:

```ts
// src/store/characterStore.ts
function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

// src/engine/combatStats.ts — sustituye a "proficiencyBonus" del PF2e:
// el BAB y las bases de salvación NO dependen de un rango 0-4 sino de la
// progresión de cada clase (getMulticlassStats), acumulada por nivel de clase.
const bab = mcStats.bab
const fortitude = mcStats.fortitude + conMod + resolvedStats.saveBonuses.fort - negativeLevelPenalty
```

No existe (ni se propone) un equivalente a `proficiencyBonus(rank, level)` porque Pathfinder 1e no tiene rangos de competencia — la progresión de BAB/salvaciones es una tabla por clase (buena/mala/media), ya resuelta en `getMulticlassStats`.

### 3.2 Reglas de acumulación de bonificadores — [ACTUAL, no se toca]

El documento origen advierte de esta regla como "fuente habitual de bugs" y **ya está correctamente implementada** en `src/engine/modifiers.ts:7-27` (`stackModifiers`), con los tipos reales de Pathfinder 1e (no los de PF2e):

| Tipo (`ModifierType`) | Acumula con otros del mismo tipo |
|---|---|
| `untyped`, `circumstance`, `dodge` | Sí — se suman |
| `competence`, `enhancement`, `insight`, `luck`, `morale`, `natural`, `racial`, `deflection`, `sacred`, `profane`, `armor`, `shield` | No — solo el mayor |

**[NUEVO]** Lo que falta no es la lógica de acumulación (ya existe) sino **mostrarla**: `ResolvedStats.allModifiers` ya trae `{ source, type, target, value }` por cada modificador, pero ningún componente de Modo Juego lo renderiza. Es la base técnica de G-05 y de la sección 10.4.

### 3.3 Condiciones reglamentarias — [NUEVO para la UI, ya existe en el motor]

Esto es el hallazgo más relevante de esta adaptación. `src/engine/modifiers.ts:65-104` define `CONDITION_MODIFIERS`, una tabla de condiciones Pathfinder 1e con efecto mecánico automático:

| Condición (`id`) | Efecto ya calculado por el motor |
|---|---|
| `sickened` | −2 ataque, daño, Fortaleza, Reflejos, Voluntad, todas las habilidades |
| `fatigued` | −2 Fuerza, −2 Destreza |
| `exhausted` | −6 Fuerza, −6 Destreza |
| `shaken` | −2 ataque, Fortaleza, Reflejos, Voluntad, todas las habilidades |
| `frightened` | −2 ataque, Fortaleza, Reflejos, Voluntad, todas las habilidades |
| `blinded` | −2 CA, −4 ataque |
| `prone` | −4 ataque |
| `staggered`, `stunned` | Sin penalizador numérico — restricción de acciones, solo informativo |

`Character.conditions` (`{ id, label, active }[]`) es el campo pensado para activarlas, y `resolveModifiers` ya las consume (`modifiers.ts:196-201`). **Pero ningún `.tsx` del proyecto lee ni escribe `character.conditions`** — ni `PlayMode.tsx` ni `CharacterView.tsx`. Es una funcionalidad del motor completamente invisible para el jugador. Ver sección 8 para la pantalla que la expone.

---

## 4. Vocabulario visual

El documento origen define una tabla normativa de tipos de elemento. Se adapta quitando lo que no tiene equivalente en Pathfinder 1e y añadiendo lo que ya existe en el código:

| Elemento | Tratamiento actual | Cambio propuesto |
|---|---|---|
| `RollableValue` | `<Button>` con `onClick={() => handleQuickRoll(...)}` | **[ACTUAL]** patrón correcto, se mantiene |
| `StaticValue` (CA, Toque, Desprevenido, CMD, BAB) | `statPill` sin interacción (líneas 770-790) | **[MODIFICA]** añadir `onClick` que abra explicación con desglose (sección 10.4) |
| Indicador de rango de habilidad | No existe — Pathfinder 1e no tiene rangos de competencia 0–4; usa **rangos numéricos + "es habilidad de clase" (sí/no)** | **[ACTUAL]**, ya representado como `●` junto al nombre de la habilidad (`classSkillDot`, línea 1375). No se propone cambio de formato |
| Icono de coste de acción (◆/◆◆/◆◆◆/↻/◇) | No existe | **[FUERA DE ALCANCE]** — es un sistema propio de Pathfinder 2e (economía de 3 acciones). Pathfinder 1e usa acción estándar/veloz/movimiento/completa por descripción textual, sin icono normativo en el modelo de datos. No se introduce este sistema |
| `Checkbox` (recurso consumible) | `slotPip` (espacios de conjuro, líneas 1430-1438) | **[MODIFICA]** solo el tamaño táctil (20 px → 44 px), el patrón de interacción se mantiene |
| `Stepper` | No existe hoy en Modo Juego (los usos de poder de clase son `Button` "Usar" que resta 1, sin `+`/`−` visibles salvo el caso Grit) | **[MODIFICA]** unificar: todo contador de usos debería tener `+`/`−` simétricos, no solo botón de gasto (hoy solo Grit del pistolero tiene el botón `+1`, línea 1264) |
| `Pill` de filtro | No existe — Modo Juego no filtra listas por pill, usa pestañas | **[FUERA DE ALCANCE]** |
| `AlteredValue` (valor modificado por condición, con marca visual) | No existe | **[NUEVO]** — necesario en cuanto se implemente la sección 8; sin esto, un jugador con "Aturdido" activo ve un ataque más bajo sin saber por qué |
| Estados vacíos `--` / `+ Añadir X` | Se usa de forma inconsistente: a veces texto plano ("Sin efectos", "Sin habilidades con rangos"), a veces nada | **[MODIFICA]** unificar bajo el mismo patrón textual en las 5 pestañas |

---

## 5. Inventario de componentes

Componentes que **ya existen** como bloques repetidos dentro de `PlayMode.tsx` pero no están extraídos como componente reutilizable, y componentes **nuevos** necesarios para las secciones siguientes:

| Componente | Estado | Props principales | Sustituye a |
|---|---|---|---|
| `HpTracker` | **[MODIFICA]** extraer | `current`, `max`, `temp`, `onAdjust` | Bloque inline líneas 692-713 |
| `StatPill` | **[MODIFICA]** extraer + hacer tappable | `label`, `value`, `format`, `onExplain` | Bloque inline líneas 770-790 |
| `WeaponAttackRow` | **[MODIFICA]** extraer | `weapon`, `iterativeOffsets`, `damageNotation`, `onRoll` | Bloque inline líneas 805-849 |
| `ClassFeatureRow` | **[MODIFICA]** extraer patrón común | `name`, `meta`, `uses`, `max`, `onUse` | ~15 bloques casi idénticos, líneas 916-1321 |
| `ConditionPanel` | **[NUEVO]** | `conditions`, `onToggle`, `resolvedEffects` | No existe — ver sección 8 |
| `RollExplainDrawer` | **[NUEVO]** | `breakdown: Modifier[]`, `label` | No existe — ver sección 10.4 |
| `DicePool` | **[FUERA DE ALCANCE, opcional futuro]** | — | El tirador actual (`diceRoller`) ya resuelve el caso de uso; acumular varios dados antes de tirar (como el `DicePicker` del documento origen) no es un requisito planteado por ningún usuario del proyecto, se deja como mejora futura opcional |

---

## 6. Header de Modo Juego

### 6.1 Contenido actual — [ACTUAL]

```
← Volver   |   Modo Juego — {nombre}   [🔔 Efectos]  [🎲 Dados]
```

(`PlayMode.tsx:663-686`). No hay banda de defensas ni de salvaciones en el header — CA, Toque, Desprevenido, Iniciativa, CMB, CMD y BAB están en la pestaña Combate (`combatStats`, líneas 770-790), no en una franja persistente.

### 6.2 Cambios propuestos

| ID | Cambio |
|---|---|
| H-01 | **[MODIFICA]** `.header` pasa a `position: sticky; top: 0` para que el nombre del personaje, el botón de Efectos y el botón de Dados sean accesibles sin volver arriba en pestañas largas (Combate con muchos poderes, Encuentro con muchos combatientes) |
| H-02 | **[MODIFICA]** El botón de Efectos (`statusBtn`) ya muestra un badge con el número de `statusEffects` activos (línea 676); al implementar la sección 8, el badge debe sumar también las `conditions` activas, no solo los `statusEffects` |
| H-03 | **[NUEVO]** El tracker de PV (hoy solo en la pestaña Combate como parte de `tabShell`, líneas 692-713) debe quedar visible también al cambiar de pestaña, no solo en Combate — es el dato que más se consulta en cualquier momento del turno de otro jugador. Se mueve fuera del contenido específico de cada pestaña, junto al header sticky |
| H-04 | **[NUEVO]** Si `character.hp.current === 0`, el bloque de PV cambia de tratamiento visual (hoy solo hay una clase `.critical` a ≤25% de PV máximos, línea 698; no hay tratamiento específico para 0 PV) |

---

## 7. Gestión de Puntos de Golpe

### 7.1 Estado actual — [ACTUAL]

Ya implementado como card fija en la pestaña Combate (líneas 692-713): valor actual/máximo, botones `+1`/`−1` grandes, y accesos rápidos `−1/4`, `−5`, `+5`, `+1/4`. El daño se aplica directamente sobre `hp.current`, acotado entre 0 y `effectiveMaxHp` (`adjustHP`, líneas 229-232). No hay campo de PV temporales editable en Modo Juego aunque `Character.hp.temp` existe en el modelo — no se lee ni se muestra en esta pantalla.

### 7.2 Cambios propuestos

| ID | Cambio |
|---|---|
| HP-01 | **[NUEVO]** Exponer `hp.temp` en el tracker (campo editable + indicado como sufijo, p. ej. `18 / 24 (+5 temp)`). Hoy es un campo del modelo completamente huérfano en la UI |
| HP-02 | **[NUEVO]** Cuando se aplica daño con `adjustHP(-n)`, restar primero de `hp.temp` y solo después de `hp.current` — regla estándar de Pathfinder 1e que hoy no se aplica: `adjustHP` ignora `temp` por completo |
| HP-03 | **[FUERA DE ALCANCE / cuestión abierta]** El documento origen (PF2e) define un contador de "Moribundo"/"Herido" por pasos (0–4 / 0–3). Pathfinder 1e no tiene ese mecanismo: a 0 PV el personaje queda inconsciente/incapacitado, y muere típicamente a −Constitución PV (con variantes de mesa). No se implementa un stepper de agonía porque no hay una regla única de referencia — queda como cuestión abierta en la sección 20 |

---

## 8. Panel de Condiciones — [NUEVO]

Esta es la sección con mayor impacto de todo el documento: activa una funcionalidad que ya está completamente resuelta en el motor (sección 3.3) pero invisible para el jugador.

### 8.1 Contenido

Lista de condiciones reglamentarias con toggle, agrupadas igual que en el documento origen (sección 7.2):

- **Con efecto mecánico automático** (usa `CONDITION_MODIFIERS`): Nauseabundo (`sickened`), Fatigado (`fatigued`), Exhausto (`exhausted`), Sacudido (`shaken`), Asustado (`frightened`), Cegado (`blinded`), Postrado (`prone`).
- **Sin efecto numérico, solo informativas** (restringen acciones disponibles): Aturdido (`staggered`), Paralizado/Atontado (`stunned`).

Cada fila, al activarse, muestra debajo en gris el efecto ya resuelto (igual que pide el documento origen), leyendo directamente de `CONDITION_MODIFIERS[id]` — no hay que calcular nada nuevo, solo formatear lo que el motor ya expone.

### 8.2 Interacción

```ts
const toggleCondition = (id: string, label: string) => {
  const existing = character.conditions ?? []
  const found = existing.find(c => c.id === id)
  const next = found
    ? existing.map(c => c.id === id ? { ...c, active: !c.active } : c)
    : [...existing, { id, label, active: true }]
  updateCharacter(character.id, { conditions: next })
}
```

### 8.3 Criterios de aceptación

| ID | Criterio |
|---|---|
| C-01 | Al activar una condición, todos los valores derivados visibles en Modo Juego (CA, salvaciones, ataque, daño, habilidades) se recalculan en el mismo ciclo de render — ya garantizado porque `resolveModifiers` ya consume `character.conditions`; solo falta que algo escriba en ese campo |
| C-02 | Todo valor alterado por una condición activa se marca como `AlteredValue` (color + icono), para que el jugador no reste la penalización dos veces |
| C-03 | El panel de Condiciones y el de Efectos de estado (`statusEffects`, ya implementado) conviven en el mismo drawer, como dos secciones separadas — no se fusionan en un único modelo de datos porque son conceptualmente distintos (condiciones = catálogo reglamentario cerrado con efecto automático; efectos de estado = bonificadores libres definidos por el jugador) |

---

## 9. Efectos de Estado (`statusEffects`) — [ACTUAL]

Ya implementado en su totalidad (líneas 441-660): formulario de alta con nombre, descripción, duración, target de bonificador (incluye habilidades concretas) y valor; lista con toggle activo/inactivo, edición inline y borrado. Cumple ya el criterio G-02 para este subconjunto de efectos. No se proponen cambios funcionales, solo:

| ID | Cambio |
|---|---|
| SE-01 | **[MODIFICA]** Mover este bloque al mismo drawer que el nuevo Panel de Condiciones (sección 8), como pestaña o sección hermana, en vez de ser el único contenido del drawer de "Efectos" |

---

## 10. Pestaña: Combate

### 10.1 Barra de estadísticas — [MODIFICA]

`combatStats` (líneas 770-790) ya muestra CA, Toque, Desprevenido, Iniciativa, CMB, CMD, BAB como `StaticValue`. Cambio: hacerlos tappables para abrir explicación con desglose (ver 10.4). Nota de implementación: el array de configuración ya reserva un campo `bonus` que **siempre vale `0`** (líneas 771-778) — es código muerto pensado para mostrar un bonus de efecto activo que nunca se rellena; al implementar la sección 8 este campo pasa a usarse de verdad, sumando lo que aporten condiciones/efectos activos a cada stat.

### 10.2 Ataques — [ACTUAL, ya cumple AC-01/AC-02]

El bloque de armas (líneas 793-883) ya calcula y muestra **ataques iterativos independientes** (`getIterativeAttackOffsets`) con Ataque Poderoso opcional, y el daño como `RollableValue` separado del ataque — exactamente lo que pide el criterio AC-01/AC-02 del documento origen, sin necesidad de cambio.

### 10.3 Tiros de salvación — [MODIFICA, bug de datos muerto]

Líneas 886-907: cada salvación se renderiza con un campo `eff` que, igual que en 10.1, **está hardcodeado a `0`** y nunca se actualiza — es la misma cadena de código muerto. `fortSave`/`refSave`/`willSave` ya incluyen `resolvedStats.saveBonuses` (vía `computeCombatStats`), así que el desglose visual no está duplicando el cálculo, solo no lo expone. Cambio: sustituir el `eff` fijo por la contribución real de condiciones/efectos activos a esa salvación en concreto, calculada filtrando `resolvedStats.allModifiers` por `target: 'save_fort' | 'save_ref' | 'save_will'`.

### 10.4 Resultado de tirada con desglose — [NUEVO]

Es el equivalente directo al `RollResultPanel` del documento origen (su sección 15.3, la de más requisitos). Adaptado a Pathfinder 1e:

```ts
interface RollBreakdown {
  label: string
  dieResult: number
  rolls: number[]              // para tiradas de daño con varios dados
  modifiers: Array<{
    label: string               // 'Fuerza', 'BAB', 'Ataque Poderoso', 'Sacudido'
    value: number
    type: ModifierType          // ver sección 3.2
    applied: boolean            // false si fue descartado por no acumular con otro del mismo tipo
  }>
  total: number
  isCrit?: boolean
  isFumble?: boolean
}
```

Pathfinder Nexus **ya tiene** algo que el documento origen no contempla y que cumple parcialmente el mismo objetivo por otra vía: el modal de confirmación de crítico/pifia (`critEvent`, líneas 396-439) detecta un `1` o `20` natural en tiradas de ataque y ofrece confirmar el crítico, siguiendo la regla real de Pathfinder 1e (no la de "sube un grado" de PF2e). Esto **ya cumple la intención de RD-01** para ataques. Lo que falta es el desglose por tipo de bonificador para *cualquier* tirada, no solo el aviso de crítico:

| ID | Requisito |
|---|---|
| RD-01 | Toda tirada lanzada desde `handleQuickRoll` conserva qué modificadores individuales sumaron al total (fuente + tipo + valor), no solo `{ notation, result }` como hoy |
| RD-02 | Los bonificadores descartados por regla de acumulación (sección 3.2) se muestran tachados con el motivo, reutilizando el campo `applied` que ya calcula `stackModifiers` internamente (hoy se descarta, no se expone) |
| RD-03 | El modal de crítico/pifia existente se integra como caso especial de este panel, no como overlay aparte (ver 2.1) |

---

## 11. Pestaña: Habilidades — [ACTUAL, cambios menores]

`computeSkillTotal` ya resuelve correctamente la regla de Pathfinder 1e "habilidad no entrenada = sin rangos, pero puede seguir tirándose con solo el modificador de característica" (equivalente funcional a SK-01 del documento origen, aunque la regla exacta difiere de PF2e: en Pathfinder 1e casi todas las habilidades pueden usarse sin rangos, solo un subconjunto —Oficio de Conjuros, Descifrar Escritura, algunas de Conocimientos— requiere al menos 1 rango; ese matiz vive en los datos de `SKILLS`, no en Modo Juego). No se propone cambio de fórmula.

| ID | Cambio |
|---|---|
| SK-01 | **[FUERA DE ALCANCE]** El documento origen pide desplegar "acciones asociadas" por habilidad con icono de coste (SK-02 original) — es un patrón de PF2e (p. ej. Trepar tiene una acción explícita con coste ◆). Pathfinder 1e no modela las habilidades así; se descarta |
| SK-02 | **[MODIFICA]** Aplicar el mismo mínimo táctil de 44 px a `.skillBtn` (sección 4, fila `Checkbox`/tamaño) |

---

## 12. Pestaña: Conjuros — [ACTUAL]

Ya implementa lo esencial: espacios de conjuro por nivel como `SlotTracker` (checkboxes `slotPip`, líneas 1419-1446), lista de conjuros conocidos o preparados según el tipo de lanzador (`isPreparedCaster`), y tirada de concentración por conjuro. Diferencias con el documento origen, todas por diseño y no por omisión:

- No hay "rango" de conjuro, solo **nivel** — terminología correcta para Pathfinder 1e, no se cambia.
- No hay coste de acción variable por conjuro (sección 11.3 del original) — Pathfinder 1e no tiene conjuros con efecto escalable por acciones gastadas del mismo modo que PF2e; se descarta.
- No hay reserva de "Foco" — concepto exclusivo de PF2e; el pool más cercano en este proyecto es el de dominios/bendiciones de clérigo y guerrero sacerdote, que **ya está implementado** como parte de Poderes de Clase (sección 13), no de la pestaña Conjuros.
- La preparación diaria (asignar conjuros a espacios concretos) vive en `CharacterView`, no aquí — correcto, coincide con el criterio del documento origen de que la gestión no es cosa de la pantalla de juego.

Único cambio: aplicar el mínimo táctil de 44 px a `.slotPip` (hoy 20×20 px, línea 442-449).

---

## 13. Poderes de Clase (dentro de la pestaña Combate) — [ACTUAL]

No tiene equivalente directo en el documento origen porque PF2e no agrupa así sus capacidades de clase, pero es la sección más completa de todo `PlayMode.tsx` (líneas 909-1347): cubre usos limitados por día para 18 clases distintas (Rabia, Canalizar Energía, Imponer Manos, Puño Aturdidor, Actuación Bárdica, Forma Salvaje, Bombas, Mutágeno, Sentencia, Desafío, Reserva Arcana, Grit, Aspecto, Canal de Energía del Oráculo, Fervor, poderes de dominio y de bendición), más una lista de rasgos pasivos leídos directamente de los datos de clase. No se propone rehacerla.

| ID | Cambio |
|---|---|
| CF-01 | **[MODIFICA]** Unificar el patrón de contador: hoy la mayoría de poderes solo tienen botón de gasto (`Usar` resta 1) y ningún `+`; el Grit del pistolero es la única excepción con botón `+1` explícito (línea 1264). Todo poder con usos limitados debería permitir tanto gastar como devolver un uso manualmente (para corregir errores en mesa), no solo Grit |
| CF-02 | **[NUEVO]** Sincronizar con el Panel de Condiciones (sección 8): activar Rabia ya debería, en rigor, aplicar sus modificadores (+4 FUE/CON, +2 Voluntad, −2 CA) como un `TemporaryEffect` en vez de ser solo un booleano local (`raging`, línea 131) que no toca `resolveModifiers`. Hoy el toggle de Rabia es puramente visual/informativo y no afecta a ningún cálculo de combate |

---

## 14. Pestaña: Dados — [ACTUAL, suficiente]

El tirador libre (input de notación + presets `1d4`…`1d100`, líneas 1487-1530) y el panel flotante equivalente (`dicePanelFloating`) ya cubren el caso de uso de una tirada rápida fuera de contexto de habilidad/ataque. El documento origen propone un `DicePicker` que acumula varios dados de distintos tipos antes de tirar todos juntos (sección 16.1) — no hay ningún indicio en el código o en el resto de la app de que esa acumulación sea necesaria; se deja fuera de alcance como mejora opcional futura, no como requisito de esta adaptación.

---

## 15. Pestaña: Encuentro — [ACTUAL, sin equivalente en el documento origen]

Tracker de iniciativa completo (combatientes, ronda, turno activo, alta de enemigos con PV/CA/iniciativa, ajuste de PV por combatiente) — líneas 1532-1606. El documento origen no contempla nada parecido porque describe solo una hoja de personaje, no herramientas de DJ. Esta pestaña es una capacidad propia de Pathfinder Nexus que se mantiene tal cual; no se propone ningún cambio.

---

## 16. Drawer lateral derecho — [NUEVO, formaliza 2.1]

Una vez aplicada la convergencia de la sección 2.1, el drawer único de Modo Juego debe soportar estos tipos de contenido:

| Tipo | Invocado desde | Contenido | Estado |
|---|---|---|---|
| A — Resultado de tirada | Cualquier `RollableValue` | Desglose de sección 10.4, incluye el caso crítico/pifia | **[NUEVO]** (crítico/pifia ya existe como overlay aparte, se migra aquí) |
| B — Explicación | `StaticValue` (CA, Toque, CMB, CMD, BAB, salvaciones) | Desglose de bonificadores por tipo, solo lectura | **[NUEVO]** |
| C — Condiciones y efectos | Botón de header "Efectos" | Panel de condiciones (sección 8) + efectos de estado (sección 9, ya existente) | **[MODIFICA]**, une dos orígenes de datos en una sola vista |

No se incluye el tipo D ("Detalle de entidad": ficha de conjuro/objeto/dote) porque en Modo Juego los conjuros y poderes ya muestran su información relevante en línea (nombre, nivel, escuela, CD) sin necesitar una ficha aparte; abrir una ficha de detalle completa de un conjuro es un caso de consulta de reglamento, más propio de la pantalla `/rules` que de esta.

---

## 17. Gramática de interacción (normativa)

| Elemento | Gesto | Resultado | Estado |
|---|---|---|---|
| `RollableValue` (ataque, daño, salvación, habilidad, conjuro) | tap | Abre drawer tipo A con desglose (10.4) | **[MODIFICA]** hoy tira directo sin drawer |
| `StaticValue` (CA, Toque, Desprevenido, CMB, CMD, BAB) | tap | Abre drawer tipo B, explicación | **[NUEVO]** hoy no reacciona al tap |
| Botón `Atq.1`/`Atq.2`/`Atq.3` de ataques iterativos | tap | Tirada con la penalización iterativa ya aplicada | **[ACTUAL]** |
| Toggle de condición | tap | Activa/desactiva y recalcula toda la pantalla | **[NUEVO]** (sección 8) |
| `Checkbox` de espacio de conjuro (`slotPip`) | tap | Consume o libera el espacio | **[ACTUAL]** |
| Botón "Usar" de poder de clase | tap | Resta 1 uso y, si aplica, lanza la tirada asociada | **[ACTUAL]** |
| Botón `+1` de recuperación de uso | tap | Devuelve 1 uso | **[MODIFICA]** hoy solo existe para Grit, se generaliza (CF-01) |
| Toggle `ALZADO` de escudo | — | **[FUERA DE ALCANCE]** — no existe modelo de escudo activable como objeto de estado en este proyecto; el escudo es solo una pieza de armadura equipada que ya suma su bono de CA de forma pasiva |
| Toggle "Ataque Poderoso" | tap | Activa/desactiva penalización a ataque / bono a daño en el bloque de armas | **[ACTUAL]** (línea 796-803) |
| FAB dados / efectos | tap | Abre panel flotante de dados / drawer de efectos | **[ACTUAL]**, reubicación pendiente (2.3) |
| Tap fuera del drawer | tap | Cierra el drawer | **[ACTUAL]** para el drawer de efectos; se generaliza a los nuevos tipos A/B |

---

## 18. Fuera de alcance

No forman parte de esta especificación de Modo Juego:

- Gestión completa de la ficha (clases, dotes, conjuros conocidos, equipo, dinero) — pertenece a `CharacterView.tsx`.
- Creación de personaje y subida de nivel — `CharacterNew.tsx` y el asistente de nivel existente.
- Sistema de iconos de coste de acción tipo PF2e (sección 4).
- Reserva de Foco tipo PF2e (sección 12).
- Stepper de agonía por pasos tipo PF2e (sección 7.3 — cuestión abierta en su lugar).
- Acumulación de varios dados en un pool antes de tirar (sección 14).
- Sincronización multijugador en tiempo real durante el combate.

---

## 19. Cuestiones abiertas

| # | Cuestión | Impacto |
|---|---|---|
| 1 | ¿Qué regla de muerte/inestabilidad usa la mesa (−CON PV clásico, variante "muerte a 0", Pathfinder Unchained, etc.)? | Determina si vale la pena añadir un tracker de estado moribundo a la sección 7, y con qué fórmula |
| 2 | Al activar Rabia (y poderes similares con bonificadores conocidos: Mutágeno, Aspecto, Forma Salvaje), ¿se modela como `TemporaryEffect` automático o se deja como toggle informativo tal como está hoy? | Determina el alcance real de CF-02 — aplicarlo a los ~6 poderes con bonificadores numéricos conocidos es bastante más trabajo que dejarlo informativo |
| 3 | ¿El desglose de tirada (sección 10.4) debe persistir en un historial entre sesiones, o basta con el historial en memoria que ya existe (`history`, se pierde al recargar)? | Afecta a si `RollBreakdown` necesita guardarse en el store o puede quedarse en estado local del componente |
| 4 | ¿Se quiere registrar `staggered`/`stunned` (sin efecto numérico) de algún modo visible aunque no alteren ningún cálculo, o basta con que aparezcan en el Panel de Condiciones como informativas? | Afecta al diseño visual de la sección 8, fila "sin valor" |
