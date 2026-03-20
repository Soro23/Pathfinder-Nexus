# Pathfinder Nexus — Stitch Roadmap

> **Diseño de referencia:** "The Chronicler's Interface / El Cronista" (Stitch ID: `5267706309013381048`)
> **Última actualización:** 19/03/2026
> **Estado actual:** Fases 1–3 completadas + sistema de diseño Stitch aplicado

---

## 1. Concepto & Visión

Pathfinder Nexus es una aplicación web para gestionar personajes del juego de rol Pathfinder (basado en d20/SRD 3.5). La experiencia debe sentirse como un **cuaderno de cronista premium digital**: elegante, funcional, con la estética de pergamino editorial pero con la precisión de una herramienta moderna. Diseñada para jugadores que quieren gestionar sus personajes sin perder tiempo en cálculos manuales.

**Personalidad:** Medieval-fantasy moderno. Profesional pero con alma de aventurero. Parchment claro, tipografía editorial, acentos carmesí y dorado.

---

## 2. Design Language — "El Cronista"

### Paleta de Colores (Stitch)

```
Primary (Carmesí):         #7b001f
Primary Container:         #ffdad9
On Primary:                #ffffff
Secondary (Dorado):        #7b5800
Secondary Container:       #fdc34d
On Secondary Container:    #261a00

Surface base (Vellum):     #fcf9f0
Surface Container Lowest:  #ffffff   ← elevated/lifted
Surface Container Low:     #f6f3ea
Surface Container:         #f1eee5
Surface Container High:    #ebe8df
Surface Container Highest: #e5e2da   ← tabs, inputs

On Surface:                #1c1c17
On Surface Variant:        #594141
Outline:                   #8c7070
Outline Variant:           rgba(140, 112, 112, 0.3)
```

### Tipografía

- **Display/Headings:** Noto Serif (wght 400–700, italic disponible)
- **Body/UI:** Inter (wght 400–700)
- **Números narrativos** (HP, CA, Nivel): Noto Serif — transmiten peso épico

### Reglas de diseño — NO negociables

| Regla | Detalle |
|---|---|
| **No-Line** | Cero `border: 1px solid`. Solo shifts de `background-color` entre niveles de surface |
| **ROUND_FOUR** | `--radius-md: 4px` en cards y contenedores |
| **Paper-cut** | `--radius-sm: 2px` en botones, inputs y elementos inline |
| **Proficiency Chip** | `border-radius: 9999px` exclusivamente para badges/chips de nivel |
| **Tonal Layering** | Profundidad por color (surface hierarchy), no por sombras |
| **Ambient Shadows** | Tintadas con `rgba(28, 28, 23, x)` — nunca negro puro |
| **Glass** | Modals/overlays: `background: rgba(252, 249, 240, 0.8)` + `backdrop-filter: blur(20px)` |

---

## 3. Stack Técnico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript |
| Build | Vite |
| Estilos | CSS Modules + CSS Variables (sin Tailwind) |
| Estado | Zustand — persistido en `localStorage` (`pathfinder-nexus-characters`) |
| Routing | React Router v7 |
| Iconos | Lucide React |
| Datos | JSON estático SRD (clases, feats, skills, spells, razas) |

---

## 4. Arquitectura de Rutas

```
/                         → Dashboard "Salón de Héroes"
/characters/new           → Crear personaje (wizard 4 pasos — pendiente)
/characters/:id           → Hoja de personaje
/characters/:id/play      → Modo de juego
/rules                    → Compendio / referencia rápida
/landing                  → Landing page (pendiente)
/login                    → Autenticación (pendiente)
```

---

## 5. Progreso General

| Fase | Descripción | Estado | % |
|---|---|---|---|
| Fase 1 | MVP Foundation | ✅ Completada | 100% |
| Fase 2 | Character Sheet Completo | ✅ Completada | 100% |
| Fase 3 | Spells & Combat | ✅ ~90% Completa | 90% |
| Fase S | Stitch Design System | ✅ Completada | 100% |
| Fase 4 | Nuevas pantallas Stitch | ✅ Completada | 100% |
| Fase 4.5 | Mejoras de Contenido & UX | ✅ Completada | 100% |
| Fase 5 | Campaigns & Multiplayer | ✅ Completada | 100% |
| Fase 6 | Polish & Extras | ✅ Completada | 100% |

---

## 6. Lo que está hecho

### Fase S — Stitch Design System ✅

- [x] Variables CSS completas — paleta parchment, tipografía, spacing, radii, elevación, glass
- [x] Noto Serif + Inter (reemplazó Cinzel + Crimson Text + Fira Code)
- [x] Regla No-Line implementada en todos los componentes base
- [x] Surface hierarchy — 6 niveles con aliases legacy para compatibilidad
- [x] Button — Carmesí filled (primary) + ghost dorado (secondary) + `radius: 2px`
- [x] Card — tonal layering sin bordes, lifted paper effect
- [x] Input / Select — `surface-container-highest`, label dorado, sin border
- [x] Layout sidebar — nav "Mis Personajes / Crear / Compendio", contextual items, badge "Pronto" para Campañas, CTA "Nueva Aventura"
- [x] Dashboard — "Salón de Héroes" + cards con avatar inicial, acento carmesí, stats tonal, "Ver Hoja Detallada"
- [x] CharacterView tabs — reordenadas: Personaje → Hechizos → Inventario → Habilidades → Dotes → Arsenal → Diario
- [x] CharacterView CSS — HP display en Noto Serif, CA tonal, quick stats, tabs pill style

### Fases 1–3 — Funcionalidad base ✅

- [x] Crear / editar / eliminar personajes
- [x] Atributos con modificadores calculados
- [x] Stats de combate (CA, Iniciativa, Tiros de Salvación, BAB, CMB, CMD, Velocidad)
- [x] Sistema de feats (~90 feats SRD) con filtros
- [x] Skills (35 skills SRD) con ranks y modificadores
- [x] Inventario funcional (items, pesos, monedas, capacidad de carga)
- [x] Spellbook (slots 0–9, hechizos conocidos/preparados, DC)
- [x] Weapon Manager (armas, tiradas de ataque y daño)
- [x] Play Mode (HP editable, tiradas rápidas, tiros de salvación)
- [x] Modo edición inline con guardado automático
- [x] Persistencia en localStorage

---

## 7. Pendientes — Por Fase

### Fase 4A — Nuevas Pantallas Stitch ✅ (COMPLETADA)

#### 4A.1 Compañero Animal — tab nueva en CharacterView
**Pantalla Stitch:** "Compañero Animal - El Cronista"

- [x] Crear `src/components/character/AnimalCompanion.tsx`
- [x] Añadir tipo `AnimalCompanion` al store (ver §9 Tipos)
- [x] Añadir campo `companion?: AnimalCompanion` a `Character`
- [x] Añadir tab `'companion'` → label "Compañero" en `CharacterView`
- Contenido del componente:
  - Stats: HP, CA, atributos FUE/DES/CON/INT/SAB/CAR
  - Ataques: tabla con bonificador y daño
  - Salvaciones + Habilidades clave
  - Rasgos especiales: Vínculo, Compartir Hechizos, Evasión

#### 4A.2 Landing Page — `/landing`
**Pantalla Stitch:** "Landing Page - El Cronista" (6062px altura)

- [x] Crear `src/pages/Landing.tsx`
- [x] Añadir ruta `/landing` en `App.tsx`
- Secciones:
  - Hero con imagen de biblioteca mágica
  - "¿Qué es El Cronista?"
  - Features: Hoja digital, Gestor de hechizos, Inventario, Compañero animal
  - CTA "Comienza tu Crónica"

#### 4A.3 Login / Autenticación — `/login`
**Pantalla Stitch:** "Acceso - El Cronista"

- [x] Crear `src/pages/Login.tsx`
- [x] Añadir ruta `/login` en `App.tsx`
- Contenido:
  - Título: "Comienza tu Crónica"
  - Form: email + password + remember me
  - Botón: "Entrar al Archivo"
  - Social: Google + Discord
  - _(App es localStorage-only actualmente — UI sin backend real)_

---

### Fase 4B — Mejoras a Pantallas Existentes ✅ (COMPLETADA)

#### 4B.1 CharacterView — Hoja de Personaje
- [x] **HP Bar visual:** barra de progreso gradient (`primary → primary-container`) bajo los valores HP
- [x] **Stats de Toque y Desprevenido** en CA
- [x] **Velocidad** como quick stat (30 ft / 9 m)
- [x] **CMB y CMD** — mejorar el layout visual

#### 4B.2 CharacterView — Combate y Arsenal
- [x] **Status effects:** lista de efectos activos
- [ ] **Capacidad de inventario:** contador visual `X/12 slots` por FUE
- [ ] **Cards de armas expandibles** con crítico, alcance, tipo de daño
- [ ] **Notas tácticas** — campo libre por sesión de combate

#### 4B.3 CharacterView — Habilidades
- [x] **Tabla columnar:** Habilidad | Mod | Rango | Total
- [ ] **Penalizador de armadura** — mostrar si aplica
- [ ] **Bonus de clase (+3)** — row de clase junto a skills

#### 4B.4 CharacterView — Diario (mejorado)
**Pantalla Stitch:** "Habilidades y Diario - El Cronista"

- [x] Añadir tipo `JournalEntry` al store
- [x] Reemplazar textarea libre por entradas estructuradas:
  - Fecha en formato "14 de Calistril, 4724 RA"
  - Contenido narrativo
  - **Personajes Importantes** (aliados / enemigos / neutrales)
  - **Lugares Descubiertos**

#### 4B.5 Dashboard — Salón de Héroes
- [x] **Imágenes de personaje** — campo `imageUrl?: string` en `Character`
- [x] **HP bar mini** en card
- [x] **Botón contextual** — "Ver Libro de Hechizos" / "Ver Inventario" según clase

#### 4B.6 Layout — Sidebar contextual
- [x] **Items contextuales** (Inventario, Hechizos) apuntan a `/characters/:activeId`
- [x] **Indicador de personaje activo** en sidebar

---

### Fase 4C — CharacterNew — Wizard 4 Pasos ✅ (COMPLETADA)

**Pantalla Stitch:** "Creador de Personaje - El Cronista"

- [x] Wizard de 4 pasos:
  1. **Paso 1 — Raza:** selector visual con iconos y descripción racial
  2. **Paso 2 — Clase:** selector visual (multi-clase soportado)
  3. **Paso 3 — Atributos:** point-buy UI con +/− por atributo
  4. **Paso 4 — Resumen:** panel con avatar, nombre, clase, raza y atributos
- [x] **Summary panel** lateral: raza, clase, nivel, bonificaciones de clase
- [x] **Consejero Scribe** — tip box con lightbulb contextual por paso
- [x] **Progress indicator** "Hoja de Scribe en Progreso"

---

### Fase 4.5 — Mejoras de Contenido & UX ✅ (COMPLETADA)

#### 4.5.1 CharacterNew — Métodos de generación de atributos
- [x] **Modo actual (Point-buy 25 pts)** — mantenido como opción
- [x] **Método 1 — 4d6 drop lowest**
- [x] **Método 2 — Standard Array:** [15, 14, 13, 12, 10, 8]
- [x] **Método 3 — Heroic Array:** [18, 16, 14, 12, 10, 8]
- [x] **Modo Libre:** inputs numéricos sin restricción (por defecto)

#### 4.5.2 Datos SRD — Razas completas
- [x] 7 razas SRD: Humano, Elfo, Enano, Gnomo, Mediano, Semielfo, Semiorco
- [x] Rasgos raciales completos en español

#### 4.5.3 Datos SRD — Feats ampliados
- [x] ~50 feats adicionales SRD
- [x] Categorías: Combat, Teamwork, Critical, Style, Metamagic, Item Creation, General

#### 4.5.4 Datos SRD — Bonus misceláneos en Skills
- [x] Interfaz `MiscBonus { value: number; description: string }`
- [x] `SkillsList`: botón "+Misc" por fila → panel inline colapsable

#### 4.5.5 Datos SRD — Spells clasificados arcano/divino
- [x] Campo `type: 'arcane' | 'divine'` en interfaz `Spell`
- [x] `Spellbook`: chip bar Todos / Arcano / Divino

#### 4.5.6 Arsenal — Pantalla de Armas y Armaduras
- [x] `ArsenalManager.tsx`: layout split panel (armas izq. / armaduras dcha.)
- [x] Interfaz `Armor` en el store: type, acBonus, armorCheckPenalty, maxDex, spellFailure
- [x] CA calculada automáticamente: `10 + min(DES, maxDex) + armorBonus + shieldBonus`

#### 4.5.7 Diario — Fecha y hora real
- [x] `addJournalEntry()` genera fecha real + fecha Golarion
- [x] Formato: `"19 de Calistril, 4726 RA (19/03/2026, 21:34)"`

---

### Fase 5 — Campaigns & Multiplayer ✅ (COMPLETADA)

- [x] CRUD de campañas
- [x] Asignar personajes a campañas
- [x] Party View (referencia rápida para GM)
- [x] Notas de campaña

---

### Fase 6 — Polish & Extras ✅ (COMPLETADA)

- [x] Critical confirmation en combate — modal de golpe crítico y pifia
- [x] Responsive mobile — bottom nav fijo (≤640px), touch targets 44px+
- [x] Animaciones — bounce dados, shake botón, stagger cards, critPop modal, fadeIn tabs
- [x] Export / Import de personaje (JSON)
- [x] Plantillas de personaje pre-hechas — 5 plantillas

---

## 8. Pantallas Stitch vs Rutas Actuales

| Pantalla Stitch | Ruta Actual | Estado |
|---|---|---|
| Landing Page | `/landing` | ✅ Fase 4A |
| Acceso (Login) | `/login` | ✅ Fase 4A |
| Mis Personajes | `/` → Dashboard | ✅ Actualizado |
| Creador de Personaje | `/characters/new` | ✅ Fase 4C — wizard |
| Hoja de Personaje | `/characters/:id` → Personaje | ✅ Fase 4B.1 |
| Combate y Arsenal | `/characters/:id` → Arsenal | ✅ Fase 4B.2 |
| Libro de Hechizos | `/characters/:id` → Hechizos | ✅ Existe |
| Inventario y Equipo | `/characters/:id` → Inventario | ✅ Existe |
| Habilidades y Diario | `/characters/:id` → Habilidades + Diario | ✅ Fase 4B.3–4 |
| Compañero Animal | `/characters/:id` → Compañero | ✅ Fase 4A.1 |

---

## 9. Tipos de Datos a Ampliar

```typescript
// En characterStore.ts — ampliar interface Character:
interface Character {
  // ... campos existentes ...
  imageUrl?: string               // Avatar del personaje (URL o base64)
  companion?: AnimalCompanion     // Compañero animal (Rangers, Druidas)
  statusEffects?: StatusEffect[]  // Efectos activos (Bless, Stone Skin, etc.)
  journalEntries?: JournalEntry[] // Diario estructurado
}

interface AnimalCompanion {
  name: string
  type: string                    // 'lobo' | 'águila' | 'oso' | etc.
  level: number
  hp: { current: number; max: number }
  abilities: {
    strength: number; dexterity: number; constitution: number
    intelligence: number; wisdom: number; charisma: number
  }
  attacks: { name: string; bonus: number; damage: string }[]
  skills: Record<string, number>
  specialAbilities: string[]
}

interface JournalEntry {
  id: string
  date: string                    // "14 de Calistril, 4724 RA"
  content: string
  importantCharacters: {
    name: string
    role: 'ally' | 'enemy' | 'neutral'
    notes: string
  }[]
  discoveredPlaces: {
    name: string
    description: string
  }[]
}

interface StatusEffect {
  id: string
  name: string
  description: string
  bonus?: string                  // "+1 ataque"
  duration?: string               // "10 min/nivel"
}
```

---

## 10. Prioridad de Implementación

```
✅ HECHO   4A.1 Compañero Animal
✅ HECHO   4A.2 Landing Page
✅ HECHO   4A.3 Login / Autenticación
✅ HECHO   4C   CharacterNew wizard 4 pasos
✅ HECHO   4B.1 HP Bar visual + stats de Toque/Desprevenido
✅ HECHO   4B.2 Status effects en combate
✅ HECHO   4B.3 Tabla de habilidades columnar
✅ HECHO   4B.4 Diario estructurado (JournalEntry)
✅ HECHO   4B.5 Imágenes de personaje en Dashboard
✅ HECHO   4B.6 Sidebar contextual con personaje activo
⏳ PENDIENTE 4B.2 Capacidad inventario, armas expandibles, notas tácticas
⏳ PENDIENTE 4B.3 Penalizador armadura, bonus de clase en skills
✅ HECHO   4.5.1 Métodos de generación de atributos
✅ HECHO   4.5.2 Razas SRD completas
✅ HECHO   4.5.3 Feats SRD ampliados
✅ HECHO   4.5.4 Bonus misceláneos por skill
✅ HECHO   4.5.5 Spells clasificados arcano/divino
✅ HECHO   4.5.6 Arsenal rediseñado (ArsenalManager split panel + CA dinámica)
✅ HECHO   4.5.7 Fecha real en nueva entrada de diario
5          Campaigns & Multiplayer
6          Polish & Extras (mobile, animaciones, export)
```
