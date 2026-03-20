# Pathfinder Nexus - Especificación del Proyecto

## 1. Concepto & Visión

Pathfinder Nexus es una aplicación web para gestionar personajes del juego de rol Pathfinder (basado en d20/SRD 3.5). La experiencia debe sentirse como un **cuaderno de personaje premium digital**: elegante, funcional, con la estética de pergamino y tinta pero con la precisión de una herramienta moderna. Diseñada para jugadores que quieren gestionar sus personajes sin perder tiempo en cálculos manuales.

**Personalidad**: Medieval-fantasy moderno. Profesional pero con alma de aventurero.

---

## 2. Design Language

### Estética
- **Referencia**: Interfaz de cuaderno de aventurero + UI de juegos de mesa premium
- **Atmósfera**: Parcialmente oscurecida, con acentos dorados y detalles en cuero/piel

### Paleta de Colores
```
--color-bg-primary: #1a1612         (marrón muy oscuro, pergamino viejo)
--color-bg-secondary: #2a2420        (panel de cuero)
--color-bg-tertiary: #3a3430         (zonas elevadas)
--color-text-primary: #e8e0d4        (texto claro, tinta pálida)
--color-text-secondary: #a89880      (texto secundario, pergamino)
--color-accent-gold: #d4a44c         (dorado, bordes importantes)
--color-accent-red: #8b3a3a         (rojo oscuro, alertas, sangre)
--color-accent-green: #4a7c4a        (verde bosque, éxito)
--color-border: #4a4035              (bordes sutiles)
```

### Tipografía
- **Títulos**: "Cinzel" (serif medieval) - Google Fonts
- **Cuerpo**: "Crimson Text" (legible, estilo libro antiguo)
- **Números/Stats**: "Fira Code" (monospace para alineación)

### Sistema Espacial
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px
- Border radius: 4px (sutil), 8px (tarjetas)

### Filosofía de Movimiento
- Transiciones suaves de 200-300ms ease-out
- Hover states con brillo sutil dorado
- Sin animaciones excesivas - eficiencia sobre espectáculo

---

## 3. Layout & Estructura

### Arquitectura de Páginas

```
/                     → Dashboard (lista de personajes)
/characters/new       → Crear personaje
/characters/:id       → Ver/editar personaje
/characters/:id/play  → Modo de juego (simplificado para partidas)
/rules                → Referencia rápida de reglas d20pfsrd
/campaigns            → Gestión de campañas
/campaigns/:id        → Detalle de campaña
```

### Layout Principal
```
┌─────────────────────────────────────────────────────┐
│  HEADER: Logo + Nav + Usuario                       │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  SIDEBAR │           MAIN CONTENT                  │
│  (mini-  │                                          │
│  stats)  │                                          │
│          │                                          │
├──────────┴──────────────────────────────────────────┤
│  FOOTER: Info de campaña actual                     │
└─────────────────────────────────────────────────────┘
```

### Responsive Strategy
- **Desktop (>1024px)**: Layout completo con sidebar
- **Tablet (768-1024px)**: Sidebar colapsable
- **Mobile (<768px)**: Navegación inferior, tabs para secciones

---

## 4. Features & Interactions

### 4.1 Gestión de Personajes

#### Crear Personaje
- Selector visual de raza (con imagen e icono)
- Selector de clase (multi-clase soportado)
- Asistente de atributos: array de 6 stats (STR, DEX, CON, INT, WIS, CHA)
- Selección de habilidades por nivel
- Puntos de backstory (nombre, alineamiento, deity, homeland)

#### Hoja de Personaje (Full)
Secciones colapsables/expandibles:

**Cabecera**
- Nombre, clase, nivel, raza, alineamiento
- XP actual / siguiente nivel
- Vida (HP actual / máxima)

**Atributos (Ability Scores)**
- 6 stats principales con:
  - Valor base
  - Modificador calculado (ej: STR 18 → +4)
  - Bonificadores por raza
  - Equipo/condiciones que afectan

**Combat Stats**
- CA (Armor Class) - calculado
- Iniciativa (DEX mod + rasgos)
- Velocidad
- Tiro de salvación de cada stat
- BAB (Base Attack Bonus)

**Combatencia (Combat)**
- Tabla de ataques:
  - Arma | Ataque | Daño | Crítico | Rango | Tipo
- CMB (Combat Maneuver Bonus)
- CMD (Combat Maneuver Defense)

**Skills**
- Lista completa de skills de Pathfinder
- Rango invertido por nivel
- Skill points restantes
- Ability mod asociado

**Feats (Dones)**
- Lista de dones tomados
- Filtro por tipo (combat, metamagic, item creation, etc.)
- Bonificadores otorgados

**Spells (Hechizos)**
- Slots por nivel (0-9)
- Lista de hechizos conocidos/preparados
- DC por nivel de hechizo

**Inventory (Inventario)**
- Peso total calculado
- Monedas (PP, GP, SP, CP)
- Lista de objetos con peso
- Equipamiento equipado

**Notes**
- Campo de texto libre para historia, quests, etc.

### 4.2 Modo de Juego (Play Mode)

Interfaz simplificada para usar durante partidas:
- HP grande y editable
- Atajos para:
  - Tirar dado (d4-d100)
  - Calcular ataque
  - Calcular daño
  - Tiro de salvación
- Historial de tiradas de la sesión

### 4.3 Base de Datos de Reglas

Referencia rápida integrable:
- Lista de feats con descripción
- Lista de spells con descripción
- Clases y sus features
- Rasgos raciales
- Condiciones del juego

### 4.4 Campañas

- Crear campañas con nombre y descripción
- Asignar personajes a campañas
- Notas de campaña compartibles

---

## 5. Component Inventory

### Buttons
- **Primary**: Borde dorado, fondo oscuro, hover con brillo
- **Secondary**: Borde sutil, fondo transparente
- **Danger**: Rojo oscuro para acciones destructivas
- **States**: default, hover, active, disabled, loading

### Inputs
- Fondo semi-transparente con borde sutil
- Focus: borde dorado brillante
- Error: borde rojo + mensaje debajo
- Números: alineación derecha, monospace

### Cards
- Fondo elevado (--color-bg-tertiary)
- Borde sutil con esquinas suaves
- Hover: sombra dorada sutil

### Stat Block
- Display de atributo: valor grande + mod pequeño debajo
- Color coding por tipo (rojo=combat, azul=mental, verde=utility)

### Dice Roller
- Input para cantidad y tipo de dado (ej: "2d6+3")
- Resultado grande animado
- Historial de tiradas

### Collapsible Section
- Header clickeable con chevron
- Transición suave de altura
- Estado guardado en localStorage

### Modal/Dialog
- Overlay oscuro
- Centrado con animación de escala
- Close con X, click fuera, o ESC

### Navigation Tabs
- Tabs horizontales para secciones de personaje
- Indicador dorado bajo tab activo
- Transición suave entre tabs

---

## 6. Technical Approach

### Stack
- **Frontend**: React 19 + TypeScript
- **Build**: Vite
- **Styling**: CSS Modules + CSS Variables (sin Tailwind)
- **State**: Zustand (ligero, simple)
- **Routing**: React Router v7
- **Data**: LocalStorage (persist simple) + JSON para datos de referencia
- **Icons**: Lucide React

### Arquitectura de Datos

```typescript
// Personaje
interface Character {
  id: string;
  name: string;
  race: RaceId;
  classes: CharacterClass[];
  level: number;
  xp: number;
  alignment: Alignment;

  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };

  hp: { current: number; max: number; temp: number };

  feats: FeatId[];
  skills: SkillRank[];
  spells: SpellId[];
  inventory: InventoryItem[];

  notes: string;
  campaignId?: string;

  createdAt: string;
  updatedAt: string;
}

// Clase con niveles múltiples
interface CharacterClass {
  id: ClassId;
  level: number;
}

// Item de inventario
interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  equipped: boolean;
  notes?: string;
}

// Campaña
interface Campaign {
  id: string;
  name: string;
  description: string;
  characterIds: string[];
  notes: string;
  createdAt: string;
}
```

### Estructura de Archivos

```
src/
├── components/
│   ├── ui/              # Componentes base (Button, Input, Card, etc.)
│   ├── character/        # Componentes de personaje
│   │   ├── AbilityScores.tsx
│   │   ├── CombatStats.tsx
│   │   ├── SkillsList.tsx
│   │   ├── Inventory.tsx
│   │   ├── Spellbook.tsx
│   │   └── CharacterSheet.tsx
│   ├── dice/            # Tirador de dados
│   └── layout/          # Header, Sidebar, Footer
├── pages/
│   ├── Dashboard.tsx
│   ├── CharacterNew.tsx
│   ├── CharacterView.tsx
│   ├── PlayMode.tsx
│   ├── Rules.tsx
│   ├── Campaigns.tsx
│   └── CampaignDetail.tsx
├── data/
│   ├── races.ts          # Datos de razas
│   ├── classes.ts       # Datos de clases
│   ├── feats.ts         # Lista de feats
│   ├── spells.ts        # Lista de hechizos
│   ├── skills.ts        # Lista de skills
│   └── conditions.ts    # Condiciones del juego
├── store/
│   ├── characterStore.ts
│   ├── campaignStore.ts
│   └── uiStore.ts
├── utils/
│   ├── dice.ts          # Funciones de tiradas
│   ├── calculations.ts  # Cálculos de Pathfinder
│   └── storage.ts       # Persistencia LocalStorage
├── styles/
│   ├── variables.css
│   ├── global.css
│   └── animations.css
├── App.tsx
└── main.tsx
```

### Datos de Referencia (SRD)

Los datos de Pathfinder (clases, feats, spells, skills, races) se incluirán como JSON estático basado en el SRD (System Reference Document) de Pathfinder. Esto evita dependencias externas.

### Roadmap de Desarrollo

Ver el archivo [STITCH_ROADMAP.md](./STITCH_ROADMAP.md) para el progreso detallado y [PLAN_EVOLUCION.md](./PLAN_EVOLUCION.md) para el plan de evolución completo.
