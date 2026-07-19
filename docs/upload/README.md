# Paquete de datos estructurados — Pathfinder Nexus

Datos mecánicos del SRD de Pathfinder 1e parseados desde el scrape de d20pfsrd
(`data/site`), listos para cargar en Supabase. Generado por `etl/build_structured.py`;
regenerar con:

```bash
python3 etl/build_structured.py            # todo
python3 etl/build_structured.py --only classes|races|feats
```

Este paquete cubre lo que el motor de cálculo y el pipeline de subida de nivel
necesitan como **datos consultables** (validaciones V-01…V-13): progresiones de
clase, razas con opciones de clase predilecta y prerrequisitos de dotes
estructurados. El contenido puramente descriptivo sigue en `srd_pages`.

## Estructura

```
upload/
├── manifest.json          # conteos, fecha de generación
├── classes/
│   ├── _index.json        # resumen por clase
│   └── <slug>.json        # 39 clases (core, base, hybrid, alternate, unchained)
├── races/
│   ├── _index.json
│   └── <slug>.json        # 7 razas core
└── feats/
    └── feats.json         # 3 278 dotes Paizo (sin 3rd party)
```

## Esquemas

### `classes/<slug>.json`

| Campo | Contenido |
|---|---|
| `slug`, `name`, `group` | Identidad; `group` ∈ core/base/hybrid/alternate/unchained |
| `hit_die` | `"d6"`…`"d12"` |
| `alignment` | Restricción de alineamiento (texto) |
| `skill_ranks_per_level` | Entero (se suma el mod. de Int) |
| `class_skills[]` | `{skill, ability}` — habilidad de clase y característica asociada |
| `levels[]` | 20 entradas: `{level, bab, bab_first, fort, ref, will, special[], spells_per_day?}` |
| `favored_class_bonuses[]` | `{race, bonus, source, publisher_group}` |

- `bab` conserva la cadena completa (`"+6/+1"`); `bab_first` es el primer valor numérico.
- `spells_per_day` mapea nivel de conjuro → espacios (cadena; puede contener notas como `"3+1"`).
- `special` es la lista de rasgos ganados en ese nivel, tal como aparecen en la tabla.

### `races/<slug>.json`

| Campo | Contenido |
|---|---|
| `ability_modifiers` | `{Str…Cha: ±n}`; vacío si la raza elige (ver siguiente) |
| `ability_modifier_choice` | `+n` a una característica a elección (human, half-elf, half-orc) |
| `size`, `type`, `base_speed`, `languages` | `type` normalizado: `"Humanoid (subtipo)"` |
| `standard_traits[]` / `alternate_traits[]` | `{name, text}` |
| `favored_class_options[]` | `{class, bonus}` — catálogo por clase (§9 de la especificación) |

### `feats/feats.json`

| Campo | Contenido |
|---|---|
| `slug`, `name`, `category` | `category`: combat, metamagic, teamwork… |
| `prerequisites_raw` | Línea original de la página |
| `prerequisites[]` | Cláusulas parseadas (ver tipos) |
| `benefit` | Primer párrafo del beneficio |

Tipos de cláusula: `ability {ability,min}` · `bab {min}` · `feat {name}` ·
`skill {skill,ranks}` · `class_level {class,min}` · `caster_level {min}` ·
`character_level {min}` · `class_feature {feature}` · `race {race}` ·
`save {save,min}` · `proficiency {raw}` · `any_of {options[]}` · `other {raw}`.

**Cobertura**: ~87 % de las cláusulas quedan tipadas; el resto conserva su texto en
`other`/`raw` para que un validador pueda al menos mostrarlas. Trata `other` como
«requiere revisión manual», nunca como «se cumple».

## Notas de carga

- Idempotencia: seguir el patrón del ETL existente (`ON CONFLICT DO NOTHING`),
  clave natural = `slug`.
- Los `slug` coinciden con los nombres de fichero del scrape, por lo que casan
  con `srd_pages` y con las tablas ya cargadas (`feats`, `archetypes`).
- **Licencia**: contenido OGL de Paizo vía d20pfsrd; se excluyó el material
  3rd-party. Si la app sale de uso personal, revisar la Sección 15 de la OGL.

## Fuera de alcance (fase 2)

Clases de prestigio, clases de monstruo/PNJ, razas featured/uncommon completas,
vampire-hunter (sin tabla de progresión parseable) y traducciones ES de estos
campos (las tablas `*_es` existentes cubren dotes/conjuros/objetos).
