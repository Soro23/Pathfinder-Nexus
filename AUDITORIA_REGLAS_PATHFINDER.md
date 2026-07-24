# Auditoría de normas de Pathfinder (SRD 3.5 / PF1e) en Pathfinder Nexus

**Fecha:** 2026-07-23
**Alcance:** Motor de cálculo (`src/engine/`), datos estáticos de reglas (`src/data/`) y su consumo en componentes (`CharacterNew`, `CharacterView`, `LevelUpModal`, `PlayMode`, `ArsenalManager`, `SkillsList`, `PartyCard`).
**Metodología:** Lectura directa del código fuente de cada fórmula de reglas, comparación línea a línea contra las tablas y fórmulas oficiales del Pathfinder Core Rulebook / SRD 1e, y verificación cruzada entre las distintas pantallas que reimplementan el mismo cálculo (para detectar inconsistencias entre vistas).

---

## 1. Resumen ejecutivo

El núcleo matemático del motor de reglas (`src/engine/`) está **muy bien implementado**: las progresiones de BAB, salvaciones, tabla de carga, modificadores de tamaño, ataques iterativos, bono de Fuerza al daño según empuñadura y la fórmula de conjuros bonus por característica coinciden **exactamente** con el SRD, fórmula a fórmula.

Los problemas encontrados no están en la aritmética central, sino en **puntos de integración**: reglas que existen como texto descriptivo pero nunca se conectan al motor de cálculo (rasgos raciales de Humano/Mediano Elfo/Medio Orco), y reglas que solo se aplican en algunas pantallas y no en otras (penalización de nivel negativo en Modo de Juego).

**Hallazgos:** 5 problemas de lógica/reglas confirmados con evidencia de código, más 2 limitaciones de alcance de la auditoría. Un sexto hallazgo (3.1, multiplicador ×4 de puntos de habilidad a nivel 1) se descartó por no estar verificado contra ninguna fuente real — ver sección 3.1. Se detalla severidad, evidencia y recomendación de cada uno en la sección 3.

---

## 2. Normas correctamente implementadas

Todas las siguientes se verificaron comparando la fórmula/tabla del código contra el Core Rulebook y coinciden exactamente.

| # | Norma | Ubicación | Verificación |
|---|-------|-----------|--------------|
| 1 | Modificador de característica `floor((score-10)/2)` | `characterStore.ts` (`calculateModifier`) | Fórmula estándar correcta |
| 2 | BAB bueno = nivel · 1 | `data/classes.ts:1841-1842` | `floor(level*1)` correcto |
| 3 | BAB medio = `floor(nivel·0.75)` | `data/classes.ts:1843-1844` | Verificado nivel a nivel (1-10) contra tabla de Clérigo, coincide exacto |
| 4 | BAB pobre = `floor(nivel/2)` | `data/classes.ts:1845-1846` | Verificado contra tabla de Mago, coincide exacto |
| 5 | Salvación buena = `2 + floor(nivel/2)` | `data/classes.ts:1849-1851` | Coincide exacto con tabla oficial |
| 6 | Salvación pobre = `floor(nivel/3)` | `data/classes.ts:1852-1853` | Coincide exacto con tabla oficial |
| 7 | Multiclase: BAB/salvaciones se suman por clase, no se recalculan sobre el nivel total | `data/classes.ts:1863-1874` | Correcto — así funciona el multiclase en PF1e (a diferencia de D&D 3.5 con tablas por nivel de personaje) |
| 8 | CA / CA de toque / CA desprevenido — fórmulas base | `engine/combatStats.ts:70-72` | Componentes correctos (armadura+escudo+natural+desviación+esquiva+tamaño); el tope de Destreza máxima de la armadura se aplica también a CA de toque, lo cual es correcto y está documentado con un comentario explicando la sutileza |
| 9 | CMB / CMD, incluido modificador de tamaño con signo invertido respecto a CA | `engine/combatStats.ts:78-79`, `engine/size.ts:12-14` | Correcto (Pequeño −1 a CMB/CMD, Grande +1, etc.) |
| 10 | Ataques iterativos: +1 ataque cada +5 de BAB desde +6, máx. 4, cada uno a −5 acumulativo | `engine/combatStats.ts:110-116` | BAB 6→2 ataques, 11→3, 16→4 (tope), correcto |
| 11 | Bono de Fuerza al daño según empuñadura (×1.5 a dos manos, ×0.5 en mano secundaria, penalizaciones nunca se multiplican) | `engine/weapon.ts:6-11` | Correcto |
| 12 | Escalado de daño de Ataque Poderoso (×2 una mano, ×3 dos manos, ×1 mano secundaria) | `engine/weapon.ts:15-19` | Correcto |
| 13 | Tabla de capacidad de carga (Fuerza 1-20) y regla de extensión ×4 cada +10 de Fuerza sobre 20 | `engine/carryingCapacity.ts:1-30` | Los 3 arrays coinciden dígito a dígito con la Tabla 7-9 del Core Rulebook |
| 14 | Reducción de velocidad por armadura media/pesada o carga media/pesada/sobrecargada | `engine/speed.ts` | Tabla 20→15, 30→20, 40→30 correcta |
| 15 | Conjuros bonus por característica: `floor((mod-nivel_conjuro)/4)+1` si mod ≥ nivel | `data/bonusSpells.ts:16-23` | Coincide exacto con la fórmula y tabla oficial (verificado también el `BONUS_SPELL_TABLE` de referencia, puntuaciones 1-45) |
| 16 | CD de conjuro = `10 + nivel del conjuro + mod. característica (+ focus)` | `data/spells.ts:48-50` | Correcto |
| 17 | Modificadores de tamaño a CA/ataque, Sigilo y Volar | `engine/size.ts` | Las 3 tablas (`SIZE_AC_ATTACK_MOD`, `SIZE_STEALTH_MOD`, `SIZE_FLY_MOD`) coinciden con el SRD |
| 18 | Dotes en niveles impares (1, 3, 5…) | `engine/characterProgression.ts:16-18` | Correcto |
| 19 | Incremento de característica en niveles 4, 8, 12, 16, 20 | `engine/characterProgression.ts:8` | Correcto |
| 20 | Dotes de bonificación de Guerrero (1 y pares), Mago (múltiplos de 5), Monje (1,2,6,10,14,18) | `engine/characterProgression.ts:26-40` | Coincide con las tres progresiones oficiales |
| 21 | PG mínimo 1 por nivel incluso con penalización de Constitución | `engine/characterProgression.ts:58-66` | Correcto (`Math.max(1, …)`) |
| 22 | Bonificadores raciales de característica de Enano, Gnomo, Halfling, Elfo (fijos, no a elección) | `data/races.ts` | +2CON/+2SAB/−2CAR (enano), +2CON/+2CAR/−2FUE (gnomo), +2DES/+2CAR/−2FUE (halfling), +2DES/+2INT/−2CON (elfo) — todos correctos, incluidas clases predilectas (Guerrero, Bardo, Pícaro, Mago respectivamente) |
| 23 | Niveles negativos: −5 PG por nivel negativo, −1 (acumulativo) a salvaciones/CMB/CMD/iniciativa/habilidades, sin penalización directa a CA | `engine/combatStats.ts:28-34`, `engine/skills.ts:69,71` | Correcto — coincide con el SRD (los niveles negativos no penalizan CA directamente) |
| 24 | Puntos de habilidad mínimo 1/nivel independientemente del modificador de Inteligencia | `engine/skills.ts:34` | Correcto (`Math.max(1, …)`) |

---

## 3. Normas mal implementadas, incompletas o inconsistentes

### 3.1. [DESCARTADO] "Puntos de habilidad a nivel 1 no se multiplican ×4"

**Estado: hallazgo inválido, no aplicado.** Esta entrada afirmaba que Pathfinder multiplica ×4 los puntos de habilidad del primer nivel de personaje. Esa afirmación **no se verificó contra ninguna fuente real** al redactar la auditoría — se dio por buena sin contrastarla. El propio autor del proyecto confirmó que la regla tal como estaba descrita aquí es incorrecta, así que no se debe aplicar ningún multiplicador ×4 al primer nivel. `computeSkillPointsAvailable` se mantiene con su fórmula original: `(base de la clase + mod. Int, mínimo 1) × niveles en esa clase`, por cada clase (soporta multiclase).

Se implementó y luego se revirtió en `engine/skills.ts` — ver historial de commits. Si en el futuro se quiere revisar el primer nivel de personaje, verificar primero la regla exacta contra el Core Rulebook/SRD antes de tocar el código.

---

### 3.2. [ALTO] Bono racial flotante de +2 a característica (Humano, Medio Elfo, Medio Orco) no se aplica nunca

**Ubicación:** `data/races.ts` (registros `human` línea 32-46, `half-elf` línea 162-180, `half-orc` línea 181-...)

```ts
{
  id: 'human',
  bonuses: {},
  bonusDesc: '+2 a cualquier atributo (a elegir)',
  ...
  traits: [
    { name: 'Bonificador de Atributo', description: '+2 a un atributo a elección del jugador.' },
    ...
  ],
}
```

**Norma oficial:** Humano, Medio Elfo y Medio Orco reciben +2 a **una** característica elegida libremente por el jugador (a diferencia de Enano/Elfo/Gnomo/Halfling, que tienen bonificadores fijos).

**Problema:** el campo `bonuses` (el único que `resolveModifiers` lee para generar modificadores raciales — ver `engine/modifiers.ts:159-174`) está vacío para estas tres razas. El bonificador solo existe como texto descriptivo en `traits[]` y en `bonusDesc`, que no se usa en ningún cálculo. Se confirmó además que `CharacterNew.tsx` no tiene ningún control de UI para que el jugador elija a qué característica aplicar el +2.

**Impacto:** cualquier personaje Humano, Medio Elfo o Medio Orco pierde silenciosamente su bonificador racial de característica más importante. Afecta a 3 de las 7 razas núcleo (`CORE_RACES` en `CharacterNew.tsx:13`).

**Recomendación:** añadir un selector de característica en el paso de raza de `CharacterNew.tsx` (y en la edición de personaje existente) que genere un modificador racial de +2 sobre la característica elegida, persistido en el personaje.

---

### 3.3. [MEDIO] Rasgos raciales de Humano ("Talento Adicional" y "Habilidades Adicionales") son solo texto, no afectan al cálculo

**Ubicación:** `data/races.ts:42-43` (traits de `human`), `engine/characterProgression.ts:42-56` (`getExpectedFeatCount`), `engine/skills.ts:28-37` (`computeSkillPointsAvailable`)

**Norma oficial:** el Humano recibe **una dote adicional a nivel 1** y **+1 punto de habilidad por nivel** (además de todas las demás fuentes).

**Problema:** ambos rasgos están descritos en `traits[]` (ver ejemplo en el hallazgo 3.2) pero ninguna de las dos funciones que calculan dotes/puntos de habilidad disponibles recibe la raza como parámetro, así que no hay forma de que el bonus humano entre en el cálculo.

**Impacto:** los personajes humanos tienen menos dotes y menos puntos de habilidad de los que les corresponde por regla — su ventaja racial característica (versatilidad) desaparece del todo.

**Recomendación:** pasar la raza a `getExpectedFeatCount` y `computeSkillPointsAvailable` (o añadir un modificador `feats`/`skillPointsPerLevel` en el propio dato de raza) para sumar +1 dote a nivel 1 y +1 punto de habilidad por nivel cuando `race === 'human'`.

---

### 3.4. [MEDIO] Reglas de carga (encumbrance) incompletas: falta el tope de Destreza y la penalización de habilidad por carga media/pesada

**Ubicación:** `engine/carryingCapacity.ts`, `engine/combatStats.ts:39-42` (`getDexForAC`), `engine/skills.ts:59-65` (`computeSkillTotal`)

**Norma oficial (Tabla: Carrying Capacity, Core Rulebook):** además de reducir la velocidad, llevar una carga **media** impone Destreza máxima a CA +3 y penalización de habilidad −3 (idéntica en efecto a la penalización de armadura); una carga **pesada** impone Destreza máxima +1 y penalización de habilidad −6. Estas penalizaciones se acumulan con las de la armadura usando la más restrictiva de las dos (no ambas a la vez).

**Problema:** `getEncumbranceLevel` solo se usa en `speed.ts` para reducir la velocidad. `getDexForAC` únicamente considera el `maxDex` de la armadura corporal equipada, no el nivel de carga. `computeSkillTotal` únicamente aplica el `equippedArmorAcp` (penalización de armadura por pieza equipada), nunca una penalización derivada de llevar peso sin armadura o combinada con una carga superior a la que la armadura permitiría.

**Impacto:** un personaje sin armadura (o con armadura ligera) pero muy cargado de inventario no sufre ninguna penalización a Sigilo, Acrobacias, Trepar, etc., ni ve limitado su bono de Destreza a la CA — una laguna real de las reglas de carga.

**Recomendación:** calcular el tope de Destreza y la penalización de habilidad derivados de `getEncumbranceLevel(totalWeight, strength)` y combinarlos (tomando el más restrictivo) con los de la armadura equipada en `getDexForAC` y `computeSkillTotal`.

---

### 3.5. [BAJO-MEDIO] CA desprevenido (flat-footed) descarta también las *penalizaciones* de Destreza, no solo el bono

**Ubicación:** `engine/combatStats.ts:72`

```ts
const acFlatFooted = 10 + armor + shield + natural + deflection + sizeMod + acMisc
```

**Norma oficial:** un personaje desprevenido pierde su **bonificador** de Destreza a la CA, pero **conserva** cualquier **penalización** de Destreza (un modificador negativo nunca se considera "bonificador").

**Problema:** el cálculo omite el modificador de Destreza por completo, tanto si es positivo como negativo. Para un personaje con Destreza 8 o menos (modificador negativo), la CA desprevenido calculada es más alta de lo que debería.

**Impacto:** caso límite (solo afecta a personajes con penalización de Destreza mientras están desprevenidos), pero es una desviación real de la regla y fácil de corregir.

**Recomendación:** usar `Math.min(dexForAC, 0)` en lugar de omitir `dexForAC` en `acFlatFooted`.

---

### 3.6. [MEDIO] Penalización de nivel negativo al bono de ataque: aplicada en `ArsenalManager` pero no en `PlayMode`

**Ubicación:** `engine/combatStats.ts:96-105` (`computeWeaponAttackBonus`, parámetro `negativeLevelPenalty` con valor por defecto `0`)

- `components/character/ArsenalManager.tsx:116` — **sí** pasa `negativeLevelPenalty`.
- `pages/PlayMode.tsx:796,840,841` — **no** pasa el parámetro (usa el valor por defecto 0).

**Norma oficial:** cada nivel negativo aplica −1 a las tiradas de ataque, entre otras penalizaciones (ya correctamente aplicado a salvaciones, CMB/CMD, iniciativa y habilidades — ver hallazgo positivo #23).

**Problema:** la única función central de cálculo de bono de ataque (`computeWeaponAttackBonus`) está bien diseñada para incluir esta penalización, pero **Modo de Juego** — la pantalla donde realmente se libran los combates — no la invoca con ese argumento, mientras que la pantalla de gestión de arsenal sí lo hace. Resultado: el mismo personaje con niveles negativos muestra bonos de ataque distintos (e incorrectos en Modo de Juego) según la pantalla desde la que se consulten.

**Recomendación:** pasar `combat.negativeLevelPenalty` en las tres llamadas de `PlayMode.tsx` igual que hace `ArsenalManager.tsx`.

---

## 4. Limitaciones de esta auditoría

- **Contenido de dotes (`Feat.effects`) vive en Supabase, no en el repositorio.** `data/feats.ts` solo define el tipo y un accesor (`getFeatById`) que lee de `srdStore`/`homebrewStore`; los modificadores mecánicos reales de cada dote (p. ej. si "Ataque Poderoso" añade correctamente sus modificadores condicionales) no son auditables por revisión estática de código. Se recomienda una auditoría de datos aparte sobre el contenido cargado en la base de datos.
- **Verificación de prerrequisitos de dotes es heurística por diseño y documentada como tal** (`engine/characterProgression.ts:113-164`): solo reconoce patrones de texto para BAB mínimo, puntuación de característica mínima y "requiere otra dote". Prerrequisitos basados en rango de habilidad, raza, tamaño o alineamiento (frecuentes en dotes de estilo/raciales) no se parsean y nunca bloquean la selección — comportamiento intencionado según el comentario del propio código (avisar, no bloquear a ciegas), pero limita la cobertura real de validación.
- No se auditaron exhaustivamente las tablas `spellsPerDay` de cada una de las ~30+ clases en `data/classes.ts` fila por fila contra sus fuentes oficiales — se verificó la fórmula genérica (conjuros bonus, CD) y una muestra, que fueron correctas.
- Se detectaron artefactos de texto (mezcla de inglés/español, caracteres corruptos como "проверку") en las descripciones de habilidades de `data/skills.ts` — son defectos de calidad de datos/localización, no de lógica de reglas, y no se incluyen como hallazgo de reglas pero se anotan aquí por transparencia.

---

## 5. Priorización recomendada

| Prioridad | Hallazgo | Esfuerzo estimado | Estado |
|-----------|----------|--------------------|--------|
| 1 | 3.1 — ~~Puntos de habilidad ×4 a nivel 1~~ | — | **Descartado** — regla no verificada, ver sección 3.1 |
| 2 | 3.2 — Bono racial flotante +2 (Humano/Medio Elfo/Medio Orco) | Medio — requiere UI de selección + persistencia | Corregido |
| 3 | 3.6 — Nivel negativo no aplicado al ataque en Modo de Juego | Muy bajo — pasar un argumento existente | Corregido |
| 4 | 3.3 — Dote y punto de habilidad extra de Humano | Bajo-Medio | Corregido |
| 5 | 3.4 — Penalización de habilidad/Destreza por carga | Medio | Corregido |
| 6 | 3.5 — CA desprevenido con Destreza negativa | Muy bajo | Corregido |

Los hallazgos 3.2 y 3.3 son los de mayor impacto porque afectan a la creación de personaje desde el primer momento y a las razas más comunes.
