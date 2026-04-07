# Auditoría de funcionalidades vs Pathfinder 1e

## [Categoría: Creación de Personaje]

### [Funcionalidad: Atributos (Ability Scores)]
- Estado: ✅ Implementado
- Estado actual: Sistema de 6 atributos (FUE, DES, CON, INT, SAB, CAR) con cálculo de modificadores.
- Falta: Sistema de incremento de atributos por nivel,打破了 atributos Racial.

### [Funcionalidad: Razas]
- Estado: ✅ Implementado
- Estado actual: Catálogo de razas en data/races.ts con traits.
- Falta: Todos los rasgos raciales completos (ej: tamaño, velocidad, idiomas, habilidades raciales), bonificadores raciales detallados.

### [Funcionalidad: Clases]
- Estado: ✅ Implementado
- Estado actual: 12+ clases (Bárbaro, Bardo, Clérigo, Druida, Guerrero, Monje, Paladín, Explorador, Pícaro, Hechicero, Mago, Alquimista, Oráculo, Inquisidor) con progresión, Hit Die, saves, BAB.
- Falta: Tablas completas de spells per day para todas las clases, class features detalladas.

### [Funcionalidad: Arquetipos de Clase]
- Estado: ⚠️ Parcial
- Estado actual: Componente ArchetypeSelector básico.
- Falta: Sistema completo de archetype features y modificaciones.

### [Funcionalidad: Dominios y Blessings]
- Estado: ✅ Implementado
- Estado actual: DomainPicker y BlessingPicker.
- Falta: Todos los dominios completos con spells de dominio.

### [Funcionalidad: Alineamiento]
- Estado: ✅ Implementado
- Estado actual: Sistema de alineamiento (9 tipos).
- Falta: Restricciones de alineamiento por clase verificadas automáticamente.

### [Funcionalidad: Puntos de Habilidad (Skill Points)]
- Estado: ✅ Implementado
- Estado actual: Sistema de skill points por nivel según clase.
- Falta: Regla de máximo de ranks = nivel +3, cross-class skills.

### [Funcionalidad: Dotes (Feats)]
- Estado: ✅ Implementado
- Estado actual: FeatsSelector con catálogo extenso de feats.
- Falta: Verificación de prerequisitos, bonus feats por nivel par, metamagic feats.

### [Funcionalidad: Rasgos (Traits)]
- Estado: ⚠️ Parcial
- Estado actual: Campo de traits en personaje.
- Falta: Biblioteca completa de rasgos de personaje.

## [Categoría: Combate]

### [Funcionalidad: Iniciativa]
- Estado: ⚠️ Parcial
- Estado actual: Tirada de iniciativa DES mod.
- Falta: Sistemas de iniciativa sorprendida,修饰iniciativa.

### [Funcionalidad: Clase de Armadura (CA)]
- Estado: ✅ Implementado
- Estado actual: CA = 10 + DES mod + armadura + escudo + otros bonos.
- Falta: Touch AC, Flat-footed AC, CA natural sin armadura.

### [Funcionalidad: Ataque Base (BAB)]
- Estado: ✅ Implementado
- Estado actual: BAB basado en clase (good/medium/poor).
- Falta: Multiple Attacks (Full Attack), atacofase de ataque completo.

### [Funcionalidad: Tiradas de Ataque]
- Estado: ✅ Implementado
- Estado actual: Sistema de ataque con bonificador.
- Falta: Críticos (×2, ×3, ×4), margen de amenaza, confirmación de crítico.

### [Funcionalidad: Daño]
- Estado: ✅ Implementado
- Estado actual: Daño base más modificadores.
- Falta: Daño crítico, multiplicadores de crítico, daño por tipo (piercing, slashing, bludgeoning).

### [Funcionalidad: CMB/CMD]
- Estado: ✅ Implementado
- Estado actual: CMB = BAB + FUE mod + tamaño mod; CMD = BAB + FUE + DES + tamaño.
- Falta: Bonificadores varios a CMB/CMD (por maneuvers específicas).

### [Funcionalidad: Acciones de Combate]
- Estado: ⚠️ Parcial
- Estado actual: Acciones estándar, de movimiento, libres.
- Falta: Ataque de oportunidad (AoO), acción de carga, acción de huida, acción total.

### [Funcionalidad: Armas]
- Estado: ✅ Implementado
- Estado actual: WeaponManager con armas, bonificadores de ataque, daño, crítico.
- Falta: Propiedades de armas (reach, ranged, thrown,ammunition), grupos de armas, especialización.

### [Funcionalidad: Armaduras]
- Estado: ✅ Implementado
- Estado actual: Sistema de armaduras con AC bonus, armor check penalty, max DEX, spell failure.
- Falta: Proficiency con armaduras, armado/desarmado de armadura.

### [Funcionalidad: Espacio y Alcance]
- Estado: ❌ No implementado
- Estado actual: N/A
- Falta: Sistema de squares (5 pies), reach,/flank, occupied squares.

### [Funcionalidad: Cobertura]
- Estado: ❌ No implementado
- Estado actual: N/A
- Falta: Cobertura normal (×4), cobertura buena (×2), cobertura total.

### [Funcionalidad: Flanqueo]
- Estado: ⚠️ Parcial
- Estado actual: Sistema de flanqueo.
- Falta: Bonificador de flanqueo,flank vs.AC especial.

## [Categoría: Estados y Condiciones]

### [Funcionalidad: Sistema de Condiciones]
- Estado: ⚠️ Parcial
- Estado actual: StatusEffect básico.
- Falta: Todas las condiciones: Blinded, Cowering, Dazed, Disabled, Dying, Exhausted, Frightened, Grapple, Helpless, Nauseated, Panicked, Paralyzed, Petrified, Prone, Shaken, Sickened, Staggered, Stunned, Unconscious, etc.

### [Funcionalidad: Daño No Letal]
- Estado: ⚠️ Parcial
- Estado actual: Sistema de temp HP y damage básico.
- Falta: Daño no lethal, recuperaciddano nolethal.

### [Funcionalidad: Muerto]
- Estado: ⚠️ Parcial
- Estado actual: Sistema demorir,negative HP.
- Falta: Stabilization, death saving throws.

### [Funcionalidad: Venenos y Enfermedades]
- Estado: ⚠️ Parcial
- Estado actual: Sistema básico de efecto.
- Falta: Veneno por Hit Die, enfermedad, curas.

## [Categoría: Salvaciones]

### [Funcionalidad: Tiradas de Salvación]
- Estado: ✅ Implementado
- Estado actual: Fortitude, Reflex, Will.
- Falta: Bonificadores por clase específicos,bonús同心円.

### [Funcionalidad: Dificultad (DC)]
-Estado: ⚠️ Parcial
- Estado actual: DC básico.
- Falta: Tabla de DC estándar por nivel y tipo de spell.

## [Categoría: Magia]

### [Funcionalidad: Spellbook]
- Estado: ✅ Implementado
- Estado actual: Spellbook con spell slots, known spells, prepared spells.
- Falta: Spells conocidos por nivel para casters,spells prépareds.

### [Funcionalidad: Preparación de Hechizos]
- Estado: ⚠️ Parcial
- Estado actual: Sistema de spell slots.
- Falta: Preparación de spells (Mago), restar spells preparats,spell recovery.

### [Funcionalidad: Lanzamiento]
- Estado: ⚠️ Parcial
- Estado actual: Sistema de lanzamiento de hechizos.
- Falta: Casting time, componentes (V, S, M, DF), concentración, range, target, duration, Saving Throw, Spell Resistance.

### [Funcionalidad: Spell Schools]
- Estado: ✅ Implementado
- Estado actual: Schools (Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, Transmutation).
- Falta: Specialization de escuela (especialización/escuela prohibida), school bonuses.

### [Funcionalidad: Metamagia]
- Estado: ❌ No implementado
- Estado actual: N/A
- Falta: Feats de metamagia (Empower, Extend, Quicken, etc.), efectos de metamagia.

### [Funcionalidad: Summoning]
- Estado: ⚠️ Parcial
- Estado actual: Spell de summoning básico.
- Falta: Summoned creatures, duración, dismiss.

### [Funcionalidad: Conjuración]
- Estado: ⚠️ Parcial
- Estado actual: Spell de conjuración.
- Falta: Summoned creatures duración, concentración.

## [Categoría: Habilidades (Skills)]

### [Funcionalidad: Sistema de Skills]
- Estado: ✅ Implementado
- Estado actual: 30+ skills definidos (Acrobatics, Appraise, Bluff, Climb, Craft, Diplomacy, Disable Device, Disguise, Escape Artist, Fly, Handle Animal, Heal, Intimidate, Knowledge, Linguistics, Perception, Perform, Profession, Ride, Sense Motive, Sleight of Hand, Spellcraft, Stealth, Survival, Swim, Use Magic Device).
- Falta: Skill untyeds, DC detallada por uso.

### [Funcionalidad: Class Skills]
- Estado: ✅ Implementado
- Estado actual: Class skills por clase.
- Falta: Verificación automática decross-class.

### [Funcionalidad: Armor Check Penalty]
- Estado: ✅ Implementado
- Estado actual: ACP para skills aplicables.
- Falta: Detección de ACP en todas las skills.

### [Funcionalidad: Skills Training]
- Estado: ✅ Implementado
- Estado actual: Sistema de ranks.
- Falta: Untrained skills, training requirement.

## [Categoría: Equipamiento]

### [Funcionalidad: Inventario]
- Estado: ✅ Implementado
- Estado actual: InventoryManager con items, cantidad, peso.
- Falta: Item properties, item creation rules.

### [Funcionalidad: Dinero]
- Estado: ✅ Implementado
- Estado actual: Sistema de monedas (PP, GP, SP, CP).
- Falta: Transacciones, cambio, comercio.

### [Funcionalidad: Peso y Carga]
- Estado: ⚠️ Parcial
- Estado actual: Peso de items.
- Falta: Capacidad de carga, encumbrance, movimientoreduccónin por carga.

### [Funcionalidad: Objetos Mágicos]
- Estado: ⚠️ Parcial
- Estado actual: Objetos con efectos.
- Falta: Slots de corpo, item identification, activation.

### [Funcionalidad: Weapons Arsenal]
- Estado: ✅ Implementado
- Estado actual: ArsenalManager de armas.
- Falta: Weapon properties detallados.

## [Categoría: Progresión]

### [Funcionalidad: Experiencia]
- Estado: ⚠️ Parcial
- Estado actual: XP básico.
- Falta: Tabla de XP por CR/tipo de encuentro.

### [Funcionalidad: Level Up]
- Estado: ✅ Implementado
- Estado actual: LevelUpModal con progression.
- Falta: HP roll vs promedio, bonus feats, skill points.

### [Funcionalidad: Hit Points]
-Estado: ✅ Implementado
- Estado actual: HP max.
- Falta: Constitutiondamage,daño temporall.

### [Funcionalidad: Saving Throws]
- Estado: ✅ Implementado
- Estado actual: Saves por nivel.
- Falta: Improved saves, progresión del save.

### [Funcionalidad: Bonus Feats]
- Estado: ⚠️ Parcial
- Estado actual: Sistema de feats básico.
- Falta: Bonus feats por nivel par, combat feats, metamagic.

## [Categoría: Rasgos de Clase]

### [Funcionalidad: Class Features]
- Estado: ✅ Implementado
- Estado actual: Features por clase.
- Falta: Todos los detalles de features, uses per day.

### [Funcionalidad: Channel Energy]
- Estado: ⚠️ Parcial
- Estado actual: Channel type, energía básica.
- Falta: channel positive/negative, uses per day, DC.

### [Funcionalidad: Rage]
- Estado: ⚠️ Parcial
- Estado actual: Rabia básica.
- Falta: Rounds per day,poweres de rabia.

### [Funcionalidad: Ki Pool]
- Estado: ⚠️ Parcial
- Estado actual: Ki pool básico.
- Falta: Ki powers, ki strike.

### [Funcionalidad: Sneak Attack]
- Estado: ✅ Implementado
- Estado actual: Sneak attack +1d6.
- Falta: sneak attack conditions (flanking, unaware), progression.

### [Funcionalidad: Poison Use]
- Estado: ⚠️ Parcial
- Estado actual: Uso de venenos.
- Falta: Poison types, save DC.

### [Funcionalidad: Evasion]
- Estado: ⚠️ Parcial
- Estado actual: Evasión básica.
- Falta: Improved Evasion.

## [Categoría:bestiary/PNJs]

### [Funcionalidad: NPC Data]
- Estado: ⚠️ Parcial
- Estado actual: Bestiary, NPCs.
- Falta: Stats completos, CR adjustment.

### [Funcionalidad: Animal Companion]
- Estado: ✅ Implementado
- Estado actual: AnimalCompanion con stats, tricks.
- Falta: Animal companion progression (HD, abilities).

### [Funcionalidad: Familiar]
- Estado: ❌ No implementado
- Estado actual: N/A
- Falta: Sistema de familiar, abilities.

## [Categoría: Reglas Especiales]

### [Funcionalidad: Critical Hits]
- Estado: ⚠️ Parcial
- Estado actual: Crítico básico de arma.
- Falta: Confirmación de crítico, damage roll crítico.

### [Funcionalidad: Touch Attacks]
- Estado: ⚠️ Parcial
- Estado actual: Touch attack básico.
- Falta: Touch spells, resolución de touch ataques.

### [Funcionalidad: Concentration]
- Estado: ❌ No implementado
- Estado actual: N/A
- Falta: Concentration check, concentración en combate.

### [Funcionalidad: Spell Resistance]
- Estado: ❌ No implementado
- Estado actual: N/A
- Falta: SR vs spells,SR del objetivo.

### [Funcionalidad: Damage Resistance]
- Estado: ⚠️ Parcial
- Estado actual: DR básico.
- Falta: DR type, DR bypass.

### [Funcionalidad: Energy Resistance]
- Estado: ⚠️ Parcial
- Estado actual: Resistencias básicas.
- Falta: Resistances por tipo (cold, fire, acid, etc.).

### [Funcionalidad: Flat-Footed]
- Estado: ⚠️ Parcial
- Estado actual: Estado de flat-footed.
- Falta: Touch AC en flat-footed.

### [Funcionalidad: AoO]
- Estado: ⚠️ Parcial
- Estado actual: AoO basic.
- Falta: AoO triggers, AoO por weapon type.

## [Categoría: Campaña]

### [Funcionalidad: Tracking de Encuentro]
- Estado: ✅ Implementado
- Estado actual: EncounterTracker.
- Falta: Initiative tracking en combate.

### [Funcionalidad: Party]
- Estado: ✅ Implementado
- Estado actual: PartyCard y asignación.
- Falta: Party-wide bonuses.

### [Funcionalidad: Diario/Journal]
- Estado: ✅ Implementado
- Estado actual: Journal entries.
- Falta: Sistema de logging detallado.

## [Categoría: Datos SRD]

### [Funcionalidad: Classes]
- Estado: ✅ Implementado
- Estado actual: 12+ clases con datos completos.
- Falta: Más clases (Cavalier, Gunslinger, Inquisitor completo, etc.).

### [Funcionalidad: Spells]
- Estado: ✅ Implementado
- Estado actual: Multi-level spells database.
- Falta: Spells completos (900+), spells por clase.

### [Funcionalidad: Feats]
- Estado: ✅ Implementado
- Estado actual: Extenso catálogo de feats.
- Falta: Más feats, verification de prerequisites.

### [Funcionalidad: Races]
- Estado: ✅ Implementado
- Estado actual: Multiple races.
- Falta: Más razas, rasgos raciales completos.

### [Funcionalidad: Skills]
- Estado: ✅ Implementado
- Estado actual: Skills completos.
- Falta: Detailed DCs y uses.

## [Categoría: Sistema de Auth/Admin]

### [Funcionalidad: Autenticación]
- Estado: ✅ Implementado
- Estado actual: Supabase Auth.
- Falta: N/A.

### [Funcionalidad: Admin Panel]
- Estado: ⚠️ Parcial
- Estado actual: Admin page.
- Falta: Complete admin tools.

## [Categoría: UI/UX]

### [Funcionalidad: Componentes UI]
- Estado: ✅ Implementado
- Estado actual: Button, Card, Input, Select.
- Falta: Más componentes especializados.

### [Funcionalidad: Estilos]
- Estado: ✅ Implementado
- Estado actual: CSS Modules + variables CSS.
- Falta: Tema completo PF1e style.

### [Funcionalidad: Responsive]
- Estado: ✓ Implementado
- Estado actual: Diseño responsive.
- Falta: Verificación mobile completa.