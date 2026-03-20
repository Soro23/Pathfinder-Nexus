# Stitch Design — Pendientes de Implementación

Análisis comparativo realizado el 2026-03-19 entre el proyecto Stitch "Pathfinder Nexus" (ID: 5267706309013381048) y el repositorio actual. El diseño de Stitch se llama **"The Chronicler's Interface"** / **"El Cronista"**.

> **Nota:** Este archivo registra el estado del análisis inicial. Para los pendientes actualizados y el roadmap completo, ver [STITCH_ROADMAP.md](./STITCH_ROADMAP.md) y [PLAN_EVOLUCION.md](./PLAN_EVOLUCION.md).

---

## ✅ YA IMPLEMENTADO (esta sesión)

| Elemento | Detalle |
|---|---|
| Sistema de colores | Paleta parchment: Primary `#7b001f`, Secondary `#7b5800`, Surface `#fcf9f0` |
| Tipografías | Noto Serif (headings) + Inter (body) — reemplazó Cinzel + Crimson Text |
| Regla "No-Line" | Sin bordes 1px; separación por background color shifts |
| Surface hierarchy | 6 niveles: `lowest #fff` → `surface #fcf9f0` + aliases legacy |
| Ambient shadows | Tinted con on-surface, sin negro puro |
| Variables CSS completas | Tokens de tipo, espacio, radio, elevación, glass |
| Button | Carmesí filled (primary) + ghost dorado (secondary) + border-radius 2px |
| Card | Tonal layering sin bordes, lifted paper effect |
| Input / Select | surface-container-highest background, label dorado, sin border |
| Layout sidebar | Sidebar izquierdo con: Mis Personajes, Crear Personaje, Compendio, items contextuales deshabilitados, badge "Pronto" para Campañas, CTA "Nueva Aventura" |
| Dashboard | "Salón de Héroes" + subtítulo correcto + cards con avatar inicial, acento carmesí, stats con tonal shift, "Ver Hoja Detallada" action, "Crear Nuevo" card especial |
| CharacterView tabs | Reordenadas: Personaje → Hechizos → Inventario → Habilidades → Dotes → Arsenal → Diario |
| CharacterView CSS | Light theme: CA tonal, HP bar gradient, quick stats, tabs pill style |

---

## 🔴 FUNCIONALIDADES NUEVAS (no existen en el repo)

### 1. Página de Landing (`/landing` o `/`)
**Pantalla Stitch:** "Landing Page - El Cronista" (height: 6062px — muy larga)
- Hero section con imagen de biblioteca mágica
- Sección "¿Qué es El Cronista?"
- Features destacadas (Hoja digital, Gestor de hechizos, Inventario, Compañero animal)
- CTA "Comienza tu Crónica"
- **Acción requerida:** Crear `src/pages/Landing.tsx` + ruta `/landing`

### 2. Página de Login/Autenticación (`/login`)
**Pantalla Stitch:** "Acceso - El Cronista"
- Título: "Comienza tu Crónica"
- Subtítulo: "Accede a tus bestiarios, hechizos y registros históricos."
- Form: email + password + remember me checkbox
- Botón: "Entrar al Archivo"
- Social login: Google + Discord
- **Acción requerida:** Crear `src/pages/Login.tsx` — actualmente no hay autenticación

### 3. Compañero Animal (`/characters/:id` → tab "Compañero")
**Pantalla Stitch:** "Compañero Animal - El Cronista"
- Stats: HP, CA, FUE/DES/CON/INT/SAB/CAR
- Ataques: Mordisco +7 (1d6+4)
- Salvaciones, Habilidades clave, Rasgos especiales
- **Acción requerida:** Crear `src/components/character/AnimalCompanion.tsx` + añadir tab

### 4. Diario de Campaña (mejorado)
**Pantalla Stitch:** "Habilidades y Diario - El Cronista"
- Fechas en formato "14 de Calistril, 4724 RA"
- Entradas narrativas estructuradas
- Subsecciones: **Personajes Importantes** + **Lugares Descubiertos**
- **Acción requerida:** Mejorar tab "Diario" con estructura de entradas + metadata

---

## 🟡 MEJORAS A COMPONENTES EXISTENTES

### CharacterView — Pantalla "Hoja de Personaje"
- [ ] **HP Bar visual:** barra de progreso gradient bajo los valores HP
- [ ] **Stats: Toque y Desprevenido** en CA
- [ ] **Velocidad** (30 ft / 9 m) como quick stat adicional
- [ ] **CMB y CMD** — mejorar el layout visual

### CharacterView — Pantalla "Combate y Arsenal"
- [ ] **Status effects** (Bless +1 ataque, Stone Skin DR 10/Adamantite)
- [ ] **Capacidad de inventario** (4/12) — contar items vs. capacidad por FUE
- [ ] **Layout de armas** — cards expandibles con crítico, alcance, tipo de daño
- [ ] **Sección de notas tácticas** — campo libre por combate

### CharacterView — Pantalla "Habilidades"
- [ ] **Tabla de habilidades**: Habilidad | Mod | Rango | Total
- [ ] **Penalizador de armadura** — mostrar si aplica
- [ ] **Bonus de clase (+3)** — visible junto a skills

### Dashboard — "Salón de Héroes"
- [ ] **Imágenes de personaje** — añadir campo `imageUrl` al tipo `Character`
- [ ] **Botón contextual** en card — "Ver Libro de Hechizos" / "Ver Inventario"
- [ ] **HP bar mini** en card

### CharacterNew — Wizard de 4 pasos
- [ ] **Step 2** → wizard de 4 pasos: Raza → Clase → **Atributos** → Habilidades
- [ ] **Point-buy UI** — valores con +/− para cada atributo
- [ ] **Summary panel** lateral con raza, clase, nivel y bonificaciones
- [ ] **Consejero Scribe** — tip box contextual por paso
- [ ] **Progress indicator** "Hoja de Scribe en Progreso"

### Layout — Sidebar
- [ ] **Items contextuales** activos cuando hay personaje seleccionado
- [ ] **Indicador de personaje activo** en sidebar

---

## 🔵 RUTAS NUEVAS REQUERIDAS

```tsx
// En App.tsx añadir:
<Route path="landing" element={<Landing />} />
<Route path="login" element={<Login />} />
```

---

## 🔵 TIPOS DE DATOS A AMPLIAR

```typescript
// Character (en characterStore.ts) — campos nuevos:
interface Character {
  // ... campos existentes ...
  imageUrl?: string               // Avatar del personaje
  companion?: AnimalCompanion     // Compañero animal (Rangers, Druidas)
  statusEffects?: StatusEffect[]  // Efectos activos
  journalEntries?: JournalEntry[] // Diario estructurado
}

interface AnimalCompanion {
  name: string
  type: string
  level: number
  hp: { current: number; max: number }
  abilities: AbilityScores
  attacks: Attack[]
  skills: Record<string, number>
  specialAbilities: string[]
}

interface JournalEntry {
  date: string
  content: string
  importantCharacters: { name: string; role: 'ally' | 'enemy' | 'neutral'; notes: string }[]
  discoveredPlaces: { name: string; description: string }[]
}

interface StatusEffect {
  name: string
  description: string
  bonus?: string
  duration?: string
}
```

---

## 📋 PANTALLAS STITCH vs RUTAS ACTUALES

| Pantalla Stitch | Ruta Actual | Estado |
|---|---|---|
| Landing Page | ❌ No existe | Pendiente |
| Acceso (Login) | ❌ No existe | Pendiente |
| Mis Personajes | `/` → Dashboard | ✅ Actualizado |
| Creador de Personaje | `/characters/new` | 🟡 Necesita wizard 4 pasos |
| Hoja de Personaje | `/characters/:id` → tab Personaje | 🟡 Mejorar stats |
| Combate y Arsenal | `/characters/:id` → tab Arsenal | 🟡 Status effects, capacidad |
| Libro de Hechizos | `/characters/:id` → tab Hechizos | ✅ Existe |
| Inventario y Equipo | `/characters/:id` → tab Inventario | ✅ Existe |
| Habilidades y Diario | `/characters/:id` → tabs Habilidades + Diario | 🟡 Mejorar tabla + diario |
| Compañero Animal | `/characters/:id` → tab Compañero | ❌ No existe |

---

## 🎨 PRIORIDAD DE IMPLEMENTACIÓN

1. **Alta:** Compañero Animal (tab nueva) — es pantalla completa en Stitch
2. **Alta:** Mejorar wizard de Creación de Personaje (4 pasos)
3. **Media:** HP Bar visual + status effects en CharacterView
4. **Media:** Tabla de habilidades mejorada
5. **Media:** Imágenes de personaje en Dashboard
6. **Baja:** Landing Page
7. **Baja:** Login/Autenticación (app es localStorage-only actualmente)
