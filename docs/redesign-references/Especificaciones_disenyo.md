# Documento de diseño — Hoja de personaje Pathfinder 2e (Remaster)

**Versión:** 2.0
**Estado:** especificación de implementación
**Destinatario:** equipo de desarrollo
**Plataforma objetivo:** móvil (columna única, ~380–430 px de ancho útil)
**Alcance:** replicar la hoja de personaje descrita a continuación. Las mejoras de UX quedan fuera de este documento y se abordarán en una fase posterior.

---

> ## ⚠ AVISO SOBRE LOS DATOS
>
> **Todos los datos de personaje que aparecen en este documento son DATOS DE EJEMPLO.**
>
> Los valores concretos (nombres, atributos, puntos de golpe, conjuros, objetos, bonos, precios) existen únicamente para ilustrar el formato, la densidad y el comportamiento de cada pantalla. **No son datos validados de reglamento y no deben quemarse en el código.**
>
> Reglas de uso:
>
> 1. **Ningún valor de este documento se escribe directamente en un componente.** Todo dato de personaje se lee del modelo de datos definido en la sección 3.
> 2. **Los ejemplos sirven para construir los fixtures de desarrollo y los tests visuales**, no para poblar producción.
> 3. **Los datos de reglamento (conjuros, dotes, objetos, condiciones) provienen de una fuente externa de contenido**, no de este documento. Ver sección 3.1.
> 4. Los casos límite de los ejemplos (valores negativos, campos vacíos, listas de un solo elemento) **sí son intencionados** y deben soportarse.
> 5. La sección 15 recoge la ficha de ejemplo completa, marcada como tal, para usarla como fixture de referencia.
>
> Cualquier discrepancia entre este documento y el reglamento oficial se resuelve **a favor del reglamento**, y no invalida la especificación de interfaz: los ejemplos son intercambiables, la estructura no.

---

## 1. Objetivo y criterios de aceptación globales

### 1.1 Objetivo

Construir una hoja de personaje **utilizable durante una partida en vivo**, no un visor de datos. El criterio que ordena todas las decisiones de este documento es:

> Cualquier acción que un jugador realiza varias veces por combate debe resolverse en **un solo toque**, sin cálculo mental y sin navegar fuera de la pantalla actual.

### 1.2 Criterios de aceptación globales

| ID | Criterio |
|---|---|
| G-01 | Ningún valor derivado se almacena: todos se calculan desde el modelo base en cada render |
| G-02 | Toda condición activa se refleja en **todos** los valores afectados de la hoja, no solo en el panel de condiciones |
| G-03 | Cualquier estado compartido entre pantallas (usos, PG de escudo, foco, espacios de conjuro) tiene una única fuente de verdad |
| G-04 | El header de personaje es idéntico y persistente en todas las sub-vistas |
| G-05 | Toda tirada devuelve fórmula desglosada, no solo el total |
| G-06 | Las áreas táctiles interactivas miden como mínimo 44×44 px |
| G-07 | La aplicación funciona sin conexión una vez cargado el personaje |

---

## 2. Arquitectura de interfaz

### 2.1 Capas

| Capa | z-index | Contenido | Comportamiento |
|---|---|---|---|
| 0 | 0 | Contenido de la sección activa | Scroll vertical |
| 1 | 10 | Header de personaje | Sticky superior, persistente |
| 2 | 20 | Drawer lateral derecho | Overlay deslizante desde la derecha |
| 3 | 30 | Menú de navegación | Overlay a pantalla completa |
| 4 | 40 | Controles flotantes (FAB) | Fijos inferiores, siempre visibles |

### 2.2 Regla de contenedor único

**Todo contenido secundario se muestra en el drawer lateral derecho.** No existen modales centrados, ni pantallas de detalle con navegación propia, ni popovers salvo el selector de dados. Esta restricción es deliberada y debe respetarse: da predictibilidad y permite volver al contexto con un solo gesto.

### 2.3 Navegación

Un único nivel de secciones, sin jerarquía anidada. Se accede a todas desde el menú del FAB central. No hay barra de pestañas: no caben diez secciones en una tab bar móvil.

---

## 3. Modelo de datos

Esta es la parte que un programador necesita para no acabar con lógica de reglas repartida por los componentes.

### 3.1 Separación entre datos de personaje y datos de reglamento

Son dos orígenes distintos y no deben mezclarse:

| Origen | Contenido | Mutabilidad | Ejemplo |
|---|---|---|---|
| **Contenido de juego** (`gameData`) | Conjuros, dotes, objetos, condiciones, acciones básicas, ascendencias, clases | Solo lectura, versionada | La descripción del conjuro Curar |
| **Personaje** (`character`) | Elecciones, valores base, estado de sesión | Editable, persistida por usuario | Que este personaje tiene Curar preparado en el espacio 1 |

El personaje almacena **referencias por identificador** al contenido de juego, nunca copias. Esto permite actualizar reglamento sin migrar fichas.

### 3.2 Estructura del personaje

```ts
interface Character {
  id: string;
  name: string;
  level: number;                    // 1–20

  ancestry: { id: string; heritageId: string };
  background: { id: string };
  class: { id: string; subclassId: string };  // subclass = doctrina, orden, etc.
  deity?: { id: string; sanctification?: string };

  // Puntuaciones base, sin modificadores de condición ni de objeto
  attributes: Record<AttributeKey, number>;   // 8–18 a nivel 1

  proficiencies: {
    perception: Rank;
    saves: Record<SaveKey, Rank>;
    skills: Record<string, Rank>;             // clave = id de habilidad
    lores: Array<{ name: string; rank: Rank }>;
    attacks: Record<WeaponCategory, Rank>;
    defenses: Record<ArmorCategory, Rank>;
    classDC: Rank;
    spellcasting?: Rank;
  };

  feats: Array<{ id: string; source: FeatSource; levelTaken: number; choices?: Record<string, string> }>;

  inventory: InventoryItem[];
  currency: { pp: number; gp: number; sp: number; cp: number };

  spellcasting?: SpellcastingBlock;

  // Estado de sesión — se resetea con descansos, no forma parte del build
  session: SessionState;
}

type AttributeKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
type SaveKey = 'fortitude' | 'reflex' | 'will';
type Rank = 0 | 1 | 2 | 3 | 4;   // 0 = no entrenado … 4 = legendario
type FeatSource = 'ancestry' | 'class' | 'skill' | 'general' | 'background' | 'archetype';
```

### 3.3 Estado de sesión

Es lo que cambia durante la partida. Debe estar aislado del build porque tiene un ciclo de vida distinto (se resetea con descansos) y porque es lo que más se escribe.

```ts
interface SessionState {
  hp: { current: number; temporary: number; maxModifier: number; maxOverride?: number };
  dying: number;        // 0–4
  wounded: number;      // 0–3
  heroPoints: number;   // 0–3

  conditions: Array<{ id: string; value?: number }>;

  spellSlots: Record<number, boolean[]>;      // rango -> array de espacios consumidos
  fontSlots: boolean[];                       // espacios de fuente divina
  focusPoints: { current: number; max: number };

  featUses: Record<string, number>;           // id de dote -> usos consumidos
  shields: Record<string, { hp: number; raised: boolean }>;

  equipped: Record<string, boolean>;          // id de objeto -> equipado
  invested: string[];                         // ids de objetos invertidos (máx. 10)
}
```

### 3.4 Motor de valores derivados

**Ningún valor derivado se persiste.** Todos se calculan mediante funciones puras a partir de `character` + `gameData` + `session`. Esta es la pieza central del sistema y debe vivir en un módulo aislado y testeado, no dentro de componentes.

Fórmulas base:

```ts
// Bonificador de competencia
function proficiencyBonus(rank: Rank, level: number): number {
  return rank === 0 ? 0 : level + rank * 2;
}
// No entrenado NO suma nivel. Es la diferencia estructural con D&D 5e.

// Modificador de atributo
function attributeMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

// Cualquier valor tirable
function modifier(input: ModifierInput): ResolvedModifier {
  // = mod. de atributo
  //   + proficiencyBonus(rango, nivel)
  //   + resolveBonuses(bonos por tipo)
  //   + resolvePenalties(penalizadores por tipo)
}
```

### 3.5 Reglas de acumulación de bonificadores

Regla crítica del sistema y fuente habitual de bugs: **los bonificadores del mismo tipo no se acumulan; se aplica solo el mayor. Los penalizadores del mismo tipo tampoco; se aplica solo el peor. Los penalizadores sin tipo sí se acumulan entre sí.**

| Tipo | Acumula con otros del mismo tipo | Ejemplo |
|---|---|---|
| Objeto | No — solo el mayor | Bonificador de armadura, arma mágica |
| Circunstancia | No — solo el mayor | Escudo alzado, cobertura |
| Estado | No — solo el mayor | Bendición, condición Asustado (penalizador) |
| Sin tipo | Sí | Penalizador por ataques múltiples |

El resolutor debe devolver **qué bonificadores se han aplicado y cuáles se han descartado**, porque el panel de tirada tiene que mostrarlo (ver 13.2).

```ts
interface ResolvedModifier {
  total: number;
  breakdown: Array<{
    label: string;                                     // 'Sabiduría', 'Experto', 'Bendición'
    value: number;
    type: 'attribute' | 'proficiency' | 'item' | 'circumstance' | 'status' | 'untyped';
    applied: boolean;                                  // false si se ha descartado por no acumular
    supersededBy?: string;
  }>;
}
```

### 3.6 Propagación de condiciones

**Requisito G-02.** Al cambiar una condición, la hoja entera debe recalcularse. Las condiciones con valor aplican penalizadores de estado:

| Condición | Efecto que la interfaz debe propagar |
|---|---|
| Torpe n | −n a CA, Reflejos y todo lo basado en Destreza |
| Debilitado n | −n a todo lo basado en Fuerza (ataque y daño cuerpo a cuerpo, Atletismo) |
| Estupefacto n | −n a CD de conjuro, ataque de conjuro y habilidades mentales |
| Drenado n | −n a Fortaleza y a lo basado en Constitución; reduce PG máximos |
| Asustado n | −n a **todas** las tiradas y CD |
| Enfermo n | −n a todas las tiradas y CD |
| Desprevenido | −2 de circunstancia a la CA |
| Ralentizado n | Reduce las acciones disponibles por turno |

Todo valor cuyo cálculo se vea alterado por una condición debe renderizarse con **indicador visual de alteración** (color distinto y marca), para que el jugador sepa que el número que ve ya incluye la penalización y no la aplique dos veces.

### 3.7 Estado compartido entre pantallas

**Requisito G-03.** Los siguientes datos aparecen en más de una pantalla y deben tener una única fuente de verdad en el store, nunca estado local de componente:

| Dato | Pantallas donde aparece |
|---|---|
| PG y estado de agonía | Header, drawer de PG |
| PG del escudo y estado alzado | Acciones, Inventario |
| Puntos de foco | Conjuros, Acciones |
| Espacios de conjuro y de fuente divina | Conjuros, Acciones |
| Usos limitados de dotes | Acciones, Dotes y Aptitudes |
| Estado equipado de objetos | Inventario, Acciones, header (CA) |
| Condiciones activas | Header, y como modificador en todas las demás |

---

## 4. Sistema de diseño

### 4.1 Tipos de elemento visual y su significado

Esta tabla es normativa: define qué significa cada tratamiento visual. Un mismo tratamiento debe implicar siempre el mismo tipo de interacción.

| Elemento | Tratamiento | Significa |
|---|---|---|
| `RollableValue` | Número dentro de recuadro con borde | Tirable con un toque |
| `StaticValue` | Número sin recuadro | Informativo; el toque abre explicación |
| `RankIndicator` | 4 marcas + etiqueta textual | Rango de competencia (0–4) |
| `ActionCost` | Icono ◆ / ◆◆ / ◆◆◆ / ↻ / ◇ | Coste en acciones; el toque ejecuta |
| `Checkbox` | Casilla cuadrada | Recurso consumible (espacio, uso, equipado) |
| `Stepper` | `−` valor `+` | Contador ajustable (condiciones, agonía, foco) |
| `Pill` | Cápsula con texto | Filtro de sección, o rasgo de objeto/conjuro |
| `TraitTag` | Cápsula pequeña sin interacción | Rasgo de reglamento (Ágil, Empujar, Sagrado) |
| `AlteredValue` | Valor con color de aviso + marca | Modificado por una condición activa |

### 4.2 Iconografía de coste de acción

| Icono | Coste | Uso |
|---|---|---|
| ◆ | Una acción | |
| ◆◆ | Dos acciones | |
| ◆◆◆ | Tres acciones | |
| ↻ | Reacción | |
| ◇ | Acción libre | |
| ◆–◆◆◆ | Variable | Requiere selector antes de ejecutar |

El icono de coste es **obligatorio** en toda entrada accionable. No hay entradas sin coste.

### 4.3 Estados vacíos

Dos representaciones, con significados distintos y consistentes en toda la aplicación:

- `--` → campo estructurado existente pero sin valor
- `+ Añadir X` → contenedor de lista o texto libre, vacío, con acción de creación explícita

---

## 5. Inventario de componentes

Componentes reutilizables que deben existir antes de montar las pantallas. Framework-agnóstico; las props describen el contrato.

| Componente | Props principales | Usado en |
|---|---|---|
| `CharacterHeader` | `character`, `session` | Todas las pantallas |
| `SectionCard` | `title`, `onGear`, `gearMode: 'explain' \| 'manage'`, `children` | Todas |
| `FilterPills` | `options[]`, `active`, `onChange` | Acciones, Conjuros, Inventario, Dotes, Trasfondo, Notas, Adicionales |
| `RollableValue` | `label`, `modifier: ResolvedModifier`, `dc?`, `onRoll` | Todas |
| `RankIndicator` | `rank: Rank`, `showLabel` | Habilidades, Salvaciones, Competencias |
| `ActionCostIcon` | `cost`, `variable?`, `onExecute` | Acciones, Conjuros |
| `AttackRow` | `weapon`, `mapValues: [number,number,number]`, `damage`, `traits[]` | Acciones |
| `SpellRow` | `spell`, `cost`, `prepared`, `onCast` | Conjuros |
| `SlotTracker` | `slots: boolean[]`, `onToggle` | Conjuros, Acciones, Dotes |
| `FocusPool` | `current`, `max`, `onSpend`, `onRefocus` | Conjuros |
| `ShieldBlock` | `shield`, `raised`, `hp`, `onRaise`, `onDamage` | Acciones, Inventario |
| `ConditionStepper` | `condition`, `value`, `onChange` | Drawer de condiciones |
| `Drawer` | `type: 'roll' \| 'explain' \| 'manage' \| 'detail'`, `content` | Global |
| `RollResultPanel` | `roll: RollResult` | Drawer |
| `DicePicker` | `sets`, `counts`, `onRoll`, `onReset` | FAB |
| `FabCluster` | `onDice`, `onNav`, `onToggleDrawer` | Global |
| `EmptyState` | `mode: 'dash' \| 'add'`, `label`, `onAdd` | Todas |

---

## 6. Pantalla: Header persistente

Tres bandas apiladas, sticky en la parte superior de todas las secciones.

### 6.1 Banda de identidad

| Elemento | Contenido | Interacción |
|---|---|---|
| Retrato | Imagen cuadrada con marco | Tap → detalle de personaje |
| Identidad | Nombre / ascendencia + herencia + clase / nivel + deidad | — |
| `GESTIONAR` | Botón outline | Tap → gestión del personaje |
| Opciones de vista | Icono de controles, con punto indicador si hay ajustes activos | Tap → preferencias de la hoja |
| Bloque PG | `actuales / máximos` (+ temporales como sufijo si > 0) | Tap → drawer de gestión de PG |
| Puntos de Héroe | 3 iconos de punto, rellenos según disponibles | Tap → incrementa / decrementa (0–3) |

### 6.2 Banda de defensas

| Elemento | Componente | Interacción |
|---|---|---|
| CA | `StaticValue` | Tap → explicación con desglose |
| Percepción | `RollableValue` + `RankIndicator` | Tap valor → tirada |
| Velocidad | `StaticValue` | Tap → explicación |
| CD de Clase | `StaticValue` | Tap → explicación |
| `DEFENSAS` | Botón outline | Tap → drawer con resistencias, debilidades, inmunidades |
| `CONDICIONES` | Botón outline, con badge numérico si hay activas | Tap → drawer de condiciones |

### 6.3 Banda de salvaciones

Tres `RollableValue` con `RankIndicator`: Fortaleza, Reflejos, Voluntad.

Las salvaciones ocupan espacio de header —y no una pantalla secundaria— porque en este sistema son la tirada más frecuente que hace un jugador en el turno de otro.

### 6.4 Criterios de aceptación

- H-01: el header ocupa como máximo el 35 % de la altura de viewport
- H-02: el badge de condiciones muestra el número de condiciones activas
- H-03: si el personaje está a 0 PG, el bloque de PG cambia de tratamiento visual y el estado de agonía es visible sin abrir el drawer
- H-04: los valores del header afectados por condiciones se renderizan como `AlteredValue`

---

## 7. Drawer: paneles del header

### 7.1 Gestión de PG

Contenido, en orden:

1. Campos `ACTUALES` (editable) `/ MÁXIMOS` (lectura) · `TEMPORALES` (editable)
2. Calculadora: campo `CURACIÓN` (verde) · preview `NUEVOS PG` · campo `DAÑO` (rojo) · botones `+` y `−` grandes alineados con cada campo
3. Bloque de agonía:
   - `Stepper` de **Moribundo** (0–4)
   - `Stepper` de **Herido** (0–3)
   - Texto de estado calculado y `RollableValue` de la tirada de recuperación, con CD calculada automáticamente
4. Campos avanzados: `MODIFICADOR DE PG MÁX.` · `SOBRESCRIBIR PG MÁX.`

**Automatismos requeridos:**

- Al llegar a 0 PG, Moribundo pasa a `1 + wounded`
- Al recuperar PG por encima de 0, Moribundo vuelve a 0 y Herido incrementa en 1
- Si Moribundo alcanza 4, se marca el estado de muerte
- El daño se aplica primero a PG temporales

### 7.2 Panel de condiciones

Dos grupos:

- **Con valor** → `ConditionStepper` por fila
- **Sin valor** → toggle por fila

Cada fila muestra debajo, en gris, el efecto mecánico ya resuelto con el valor actual.

**Criterio de aceptación C-01:** al modificar cualquier condición, todos los valores derivados visibles en la aplicación se actualizan en el mismo ciclo de render.

---

## 8. Pantalla: Atributos, Salvaciones y Sentidos

### 8.1 Rejilla de atributos

Seis cards 3×2. **Jerarquía tipográfica: modificador grande, puntuación pequeña.** En este sistema el modificador es el dato operativo y la puntuación solo se usa para requisitos.

**Interacción — diferencia respecto a otras hojas:** el modificador de atributo **no es tirable**. No existen pruebas de atributo puro; todo pasa por una habilidad o por Percepción. El tap abre explicación. Implementar como `StaticValue`, no como `RollableValue`.

### 8.2 Salvaciones

Card con tres filas: `RankIndicator` · nombre · atributo de origen · `RollableValue`.

Debajo, notas de efectos especiales procedentes de ascendencia, herencia o dotes.

### 8.3 Sentidos

Percepción como `RollableValue` + `RankIndicator`, más los sentidos especiales y las notas de bonificadores condicionales.

**No existe bloque de sentidos pasivos.** Si se ha portado desde una hoja de otro sistema, debe eliminarse.

---

## 9. Pantalla: Habilidades

Tabla de 16 habilidades base + Saberes.

Columnas: `RANGO` (`RankIndicator`) · `ATR` · `HABILIDAD` · `BONO` (`RollableValue`)

**Requisitos específicos:**

| ID | Requisito |
|---|---|
| SK-01 | Las habilidades no entrenadas muestran solo el modificador de atributo, sin sumar nivel |
| SK-02 | Cada habilidad se despliega mostrando sus acciones asociadas, con `ActionCostIcon` y requisito de rango |
| SK-03 | Las acciones bloqueadas por rango insuficiente se muestran atenuadas y no son ejecutables |
| SK-04 | Los Saberes son una lista dinámica con acción de añadir; no forman parte de la lista fija |
| SK-05 | El penalizador de la armadura equipada se aplica a las habilidades afectadas y se marca como `AlteredValue` |

---

## 10. Pantalla: Acciones

La pantalla más divergente respecto a hojas de otros sistemas. Se organiza por **coste**, no por tipo de acción.

### 10.1 Filtros

`TODO` · `ATAQUES` · `◆` · `◆◆` · `◆◆◆` · `↻` · `USO LIMITADO` · `EXPLORACIÓN` · `DESCENSO`

Los dos últimos corresponden a actividades fuera de combate y deben existir aunque en muchos personajes estén poco poblados.

### 10.2 Bloque de ataques

**Tres columnas de ataque por arma**, no una:

Columnas: arma + `ActionCostIcon` · alcance · `1.º` · `2.º` · `3.º` · daño · `TraitTag[]`

```ts
function multipleAttackPenalty(attackNumber: 1 | 2 | 3, agile: boolean): number {
  if (attackNumber === 1) return 0;
  const base = attackNumber === 2 ? -5 : -10;
  return agile ? base + 1 * (attackNumber === 2 ? 1 : 2) : base;
  // ágil: -4 y -8
}
```

**Requisito AC-01:** los tres valores se precalculan y son tirables de forma independiente. Sin esto la pantalla no cumple el objetivo de la sección 1.1, porque obliga al jugador a restar mentalmente cada turno.

**Requisito AC-02:** el daño es un `RollableValue` independiente del ataque.

### 10.3 Bloque de escudo

Componente `ShieldBlock` con estado propio:

- Toggle `ALZADO` → aplica bonificador de circunstancia a la CA del header
- `Dureza` · `PG actuales / máximos` · `Umbral de rotura`
- Contador de PG editable, decrementado al usar Bloqueo con escudo
- Al cruzar el umbral, estado Roto: el bonificador deja de aplicarse

### 10.4 Acciones básicas y reacciones

Listado por coste. **Advertencia de implementación:** las reacciones **no** son universales en este sistema. No deben precargarse reacciones que el personaje no posee por dote o aptitud; se listan solo las que su build concede.

### 10.5 Usos limitados

Toda entrada con usos limitados incluye `SlotTracker` sincronizado con la pantalla de Dotes y Aptitudes (requisito G-03).

---

## 11. Pantalla: Conjuros

### 11.1 Cabecera

`CD de conjuro` · `Ataque de conjuro` (`RollableValue`) · `Tradición` · `Tipo de preparación`

**Nomenclatura:** los conjuros tienen **rango**, no nivel. Debe respetarse en toda la interfaz para evitar confusión con el nivel del personaje.

### 11.2 Estructura de listado

```
TRUCOS                    (rango efectivo = ceil(nivel / 2))
RANGO 1    [ ][ ] ESPACIOS
RANGO 2    [ ][ ][ ] ESPACIOS
FUENTE (si aplica)  [ ][ ] espacios adicionales
FOCO       ● ○ ○
```

Columnas por fila: `ActionCostIcon` · nombre + `TraitTag[]` · alcance · tiro o CD · efecto · botón de lanzar.

### 11.3 Coste variable

**Requisito SP-01.** Un conjuro puede tener efectos distintos según cuántas acciones se gasten. Un botón único de "lanzar" es insuficiente: el `ActionCostIcon` con `variable: true` debe desplegar las opciones de coste con su efecto asociado antes de ejecutar.

### 11.4 Reserva de foco

Componente `FocusPool` con:
- Indicador de puntos actuales / máximos
- Acción de gasto al lanzar un conjuro de foco
- Botón explícito de **Reenfocarse** (actividad de exploración de 10 minutos)

Los puntos de foco **no** se recuperan con descansos. El botón de Reenfocarse debe estar en esta pantalla, no dentro de un menú de descanso.

### 11.5 Gestión

El engranaje abre el panel de **preparación diaria**: asignación de conjuros a espacios concretos. No es un selector en el momento del lanzamiento. El modelo debe reflejar la asignación espacio a espacio.

---

## 12. Pantallas de referencia

### 12.1 Competencias

Lista con `RankIndicator` por entrada, agrupada en: armaduras, armas, CD de clase, idiomas. El rango escala con el nivel y determina CA y bono de ataque, por lo que no puede omitirse.

### 12.2 Dotes y Aptitudes

Filtros por **origen**: `TODO` · `CLASE` · `ASCENDENCIA` · `HABILIDAD` · `GENERALES` · `APTITUDES`

Cada entrada muestra: nombre · origen · **nivel en que se obtuvo** · texto de reglas · elecciones realizadas · `SlotTracker` si tiene usos limitados.

**Requisito FT-01:** la trazabilidad de origen y nivel es obligatoria. En este sistema el personaje acumula muchas dotes y es lo que permite auditar el build al subir de nivel.

### 12.3 Trasfondo

Filtros: `TODO` · `TRASFONDO` · `CARACTERÍSTICAS` · `APARIENCIA` · `FE`

**No existe campo de alineamiento.** El bloque `FE` lo sustituye funcionalmente:

- Deidad · Santificación · Arma favorita · Dominios (marcando los tomados)
- **Preceptos** y **Anatemas** como texto consultable

Los preceptos y anatemas deben ser visibles en partida, no un campo opcional enterrado: son la información que un personaje devoto necesita consultar en el momento en que una decisión los pone en juego.

### 12.4 Notas

Secciones de texto libre con `EmptyState` en modo `add`: organizaciones, aliados, enemigos, historia, otros.

---

## 13. Pantalla: Inventario

### 13.1 Cabecera de carga

Volumen en lugar de peso. La notación admite **valores numéricos y `L`** (ligero); diez objetos ligeros equivalen a 1 de Volumen. El parser debe soportar ambos.

```
Volumen actual / umbral de sobrecarga / máximo
```

### 13.2 Tabla de objetos

Columnas: `EQUIPADO` (`Checkbox`) · nombre + subtipo · volumen · cantidad · precio

**Requisito INV-01:** el estado equipado alimenta directamente el cálculo de CA, el penalizador a pruebas y el penalizador a velocidad del header.

### 13.3 Inversión

Sustituye a la sintonización de otros sistemas. Límite de **10 objetos**, no una rejilla fija de slots. Mostrar contador `n / 10`.

---

## 14. Pantalla: Adicionales

Contenedor genérico de entidades asociadas: compañeros animales, familiares, acompañantes, invocaciones, bloques de PNJ o criaturas de referencia.

Columnas de la tabla resumen: `NOMBRE` · `CA` · `PG` · `VELOCIDAD` · `PERCEPCIÓN`

Se incluye Percepción porque la iniciativa se tira normalmente con ella y es el primer dato que se necesita al empezar un combate.

**Requisito EX-01:** los compañeros animales actúan gastando acciones del personaje. Su bloque debe mostrar el coste de comandarlos, no solo sus estadísticas.

**Requisito EX-02:** los PG de cada entidad son editables con el mismo componente que los del personaje.

---

## 15. Drawer lateral derecho

### 15.1 Comportamiento

- Se desliza desde el borde derecho
- Cubre la mayor parte del ancho, dejando visible una franja atenuada del contenido subyacente
- Cierre: FAB de doble flecha, o tap sobre el área atenuada

### 15.2 Tipos de contenido

| Tipo | Invocado desde | Naturaleza |
|---|---|---|
| A — Resultado de tirada | Cualquier `RollableValue` | Efímero, con historial |
| B — Explicación de reglas | `StaticValue`, etiquetas, engranaje en ciertas secciones | Solo lectura |
| C — Gestión / edición | Engranaje en ciertas secciones, botones `GESTIONAR` | Editable |
| D — Detalle de entidad | Nombre de conjuro, objeto, dote o criatura | Solo lectura |

### 15.3 Panel de resultado de tirada

Es el componente con más requisitos del sistema, porque el resultado no es un número sino un grado.

Contenido obligatorio:

1. Nombre de la tirada
2. Fórmula desglosada: dado, modificador de atributo, competencia, y cada bonificador con su etiqueta
3. **Bonificadores descartados** por no acumular, mostrados tachados con la razón
4. CD objetivo si se conoce
5. **Grado de éxito** con tratamiento visual diferenciado: éxito crítico / éxito / fallo / fallo crítico
6. **Indicación explícita de ajuste por dado natural**: un 20 natural sube un grado y un 1 natural lo baja
7. Historial de tiradas de la sesión

```ts
interface RollResult {
  label: string;
  dieResult: number;
  modifier: ResolvedModifier;
  total: number;
  dc?: number;
  degree?: 'criticalSuccess' | 'success' | 'failure' | 'criticalFailure';
  naturalAdjustment?: 'upgraded' | 'downgraded';
  timestamp: number;
}
```

**Requisito RD-01:** sin el grado de éxito, la hoja no cumple el objetivo de la sección 1.1, porque traslada la aritmética al jugador.

---

## 16. Controles flotantes

| Posición | Icono | Función |
|---|---|---|
| Inferior izquierda | d20 | Selector de dados |
| Inferior derecha | Rejilla 3×3 | Menú de navegación |
| Extremo inferior derecho | `«` / `»` | Mostrar / ocultar drawer |

La doble flecha invierte su dirección según el estado del drawer.

### 16.1 Selector de dados

Popover anclado al FAB, con punta apuntando al botón.

- Cabecera: set de dados activo, cambio de set, ajustes
- Rejilla de tipos: d20, d12, d100, d10, d8, d6, d4
- Tap sobre un dado lo añade a la tirada, con badge numérico de cantidad acumulada
- `REINICIAR` · `TIRAR` · `LIMPIAR DADOS`

---

## 17. Gramática de interacción (normativa)

| Elemento | Gesto | Resultado |
|---|---|---|
| `RollableValue` | tap | Tirada con grado de éxito en el drawer |
| Modificador de atributo | tap | Explicación (**no** tirada) |
| Etiqueta de estadística | tap | Explicación con desglose por tipo de bonificador |
| `ActionCostIcon` fijo | tap | Ejecuta la acción |
| `ActionCostIcon` variable | tap | Despliega opciones de coste, luego ejecuta |
| Columna 1.ª / 2.ª / 3.ª de ataque | tap | Tirada con la penalización múltiple ya aplicada |
| `RankIndicator` | tap | Explicación del rango y de lo que desbloquea |
| Nombre de habilidad | tap | Despliega acciones asociadas |
| Nombre de conjuro / objeto / dote / criatura | tap | Ficha de detalle en el drawer |
| `Checkbox` | tap | Consume o libera el recurso |
| `Stepper` | tap `+` / `−` | Ajusta el valor y recalcula la hoja completa |
| Toggle `ALZADO` | tap | Aplica o retira el bonificador de circunstancia a la CA |
| Botón de lanzar | tap | Consume el espacio y marca la casilla |
| `Pill` de filtro | tap | Filtra el listado de la sección |
| Engranaje | tap | Explicación o gestión, según sección (ver 17.1) |
| FAB d20 / rejilla / flecha | tap | Dados / navegación / drawer |
| Tap fuera del drawer | tap | Cierra el drawer |

### 17.1 Inconsistencia heredada del engranaje

**Documentada intencionadamente.** En el diseño de referencia el icono de engranaje tiene dos significados según la sección: en unas abre una **explicación** (solo lectura) y en otras abre **gestión** (edición). El mismo icono, en la misma posición, produce resultados de naturaleza opuesta.

Para esta fase se replica el comportamiento tal cual, mediante la prop `gearMode` del componente `SectionCard`. Queda registrado como deuda de diseño a resolver en la fase de mejora, y por eso el modo es una prop explícita y no lógica dispersa: cambiarlo después debe ser una modificación de un solo punto.

---

## 18. Ficha de ejemplo (fixture de desarrollo)

> **DATOS DE EJEMPLO.** Este bloque existe para poblar el entorno de desarrollo y los tests visuales. No es una ficha validada contra reglamento y no debe usarse como contenido de producción. Ver el aviso del encabezado del documento.

```
Nombre: Clériga enana (ejemplo)
Nivel: 1
Ascendencia: Enano  ·  Herencia: Enano de sangre fuerte
Trasfondo: Acólito  ·  Clase: Clérigo (doctrina Sacerdote de Guerra)
Deidad: Torag  ·  Santificación: Sagrado
Tamaño: Mediano  ·  Velocidad: 20 pies  ·  Visión en la oscuridad

ATRIBUTOS
  FUE 12 (+1)   DES 12 (+1)   CON 14 (+2)
  INT 10 (+0)   SAB 18 (+4)   CAR 12 (+1)

DEFENSAS
  PG 20  ·  CA 15  (10 + 1 DES + 1 objeto + 3 entrenado)
  Fortaleza +7 (Experto) · Reflejos +4 (Entrenado) · Voluntad +9 (Experto)
  Resistencia a veneno 1
  Escudo de acero: Dureza 5, PG 20, Umbral de rotura 10

OFENSIVA
  Percepción +7 (Entrenado)
  CD de clase 17  ·  CD de conjuro 17  ·  Ataque de conjuro +7
  Martillo de guerra  +4 / −1 / −6   1d8+1 contundente  (Empujar)
  Golpe desarmado     +4 /  0 / −4   1d4+1 contundente  (Ágil, No letal)

HABILIDADES ENTRENADAS
  Diplomacia +4 · Medicina +7 · Religión +7 · Sociedad +3 · Saber: Escribiente +3
  (Las no entrenadas muestran solo el modificador de atributo)

CONJUROS — Tradición divina, preparados
  Trucos (5): Lanza divina, Guía, Luz, Escudo, Estabilizar
  Rango 1 (2 espacios): Bendición, Santuario
  Fuente divina (2 espacios): Curar ×2
  Foco (1 punto): Sacrificio del Protector

DOTES
  Clase: Iniciado de Dominio (Protección) — nivel 1
  Ascendencia: Ojo de cantero — nivel 1
  Habilidad: Estudioso del Canon — nivel 1, del trasfondo
  Otorgada por doctrina: Bloqueo con escudo

EQUIPO
  Camisa de cota (equipada), escudo de acero (equipado),
  martillo de guerra (equipado), kit de sanador,
  símbolo sagrado de madera, kit de aventurero
  Volumen 3 (sobrecarga a 6, máximo 11)  ·  15 po
```

### 18.1 Casos límite que el fixture debe cubrir

Estos rasgos del ejemplo son **intencionados** y sirven de prueba:

| Caso | Dónde aparece |
|---|---|
| Modificador de atributo igual a 0 | INT 10 |
| Valor de ataque negativo | 3.er ataque, `−6` |
| Valor de ataque igual a 0 | 2.º ataque del golpe desarmado |
| Velocidad de dos dígitos por debajo de lo habitual | 20 pies |
| Volumen expresado como `L` | Símbolo sagrado |
| Rango mixto en un mismo bloque | Salvaciones: dos Expertos y un Entrenado |
| Habilidad entrenada y no entrenada con el mismo atributo | Medicina +7 vs Naturaleza +4 |
| Recurso con un solo punto | Reserva de foco 1/1 |
| Lista vacía | Notas, todas las secciones |
| Decisión pendiente sin resolver | Debe existir al menos una en el fixture |

---

## 19. Fuera de alcance

No forman parte de esta fase:

- Mejoras de UX sobre el diseño de referencia (incluida la resolución de la inconsistencia del engranaje)
- Creación y subida de nivel del personaje
- Sincronización multijugador o mesa compartida
- Importación desde otros formatos de ficha
- Integración con generadores de contenido de reglamento

---

## 20. Cuestiones abiertas

| # | Cuestión | Impacto |
|---|---|---|
| 1 | Origen de los datos de reglamento: ¿base propia, API externa o paquete estático? | Determina el diseño de `gameData` y la estrategia offline |
| 2 | Idioma del contenido de reglamento: ¿traducción oficial o propia? | Afecta a toda la nomenclatura de la interfaz |
| 3 | ¿La hoja debe soportar personajes por encima de nivel 1 desde la primera versión? | Determina si el motor de derivados se implementa completo desde el inicio |
| 4 | Persistencia: ¿solo local o con cuenta de usuario? | Afecta al modelo de sincronización de `SessionState` |
| 5 | ¿Se registran las tiradas en un histórico persistente entre sesiones? | Afecta al almacenamiento del panel de resultado |