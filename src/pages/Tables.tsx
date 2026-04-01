import { LayoutList, ChevronDown } from 'lucide-react'
import { BONUS_SPELL_TABLE } from '../data/bonusSpells'
import styles from './Tables.module.css'
import mobile from '../styles/compendiumMobile.module.css'

// ── Static data ──────────────────────────────────────────────────────────────

const ABILITY_MOD_RANGES = [
  { range: '1',      mod: -5 },
  { range: '2–3',   mod: -4 },
  { range: '4–5',   mod: -3 },
  { range: '6–7',   mod: -2 },
  { range: '8–9',   mod: -1 },
  { range: '10–11', mod:  0 },
  { range: '12–13', mod: +1 },
  { range: '14–15', mod: +2 },
  { range: '16–17', mod: +3 },
  { range: '18–19', mod: +4 },
  { range: '20–21', mod: +5 },
  { range: '22–23', mod: +6 },
  { range: '24–25', mod: +7 },
  { range: '26–27', mod: +8 },
  { range: '28–29', mod: +9 },
  { range: '30–31', mod: +10 },
  { range: '32–33', mod: +11 },
  { range: '34–35', mod: +12 },
  { range: '36–37', mod: +13 },
  { range: '38–39', mod: +14 },
  { range: '40–41', mod: +15 },
  { range: '42–43', mod: +16 },
  { range: '44–45', mod: +17 },
]

const CARRY_LOAD_TABLE = [
  { str:  1, light:    3, medium:    6, heavy:    10 },
  { str:  2, light:    6, medium:   13, heavy:    20 },
  { str:  3, light:   10, medium:   20, heavy:    30 },
  { str:  4, light:   13, medium:   26, heavy:    40 },
  { str:  5, light:   16, medium:   33, heavy:    50 },
  { str:  6, light:   20, medium:   40, heavy:    60 },
  { str:  7, light:   23, medium:   46, heavy:    70 },
  { str:  8, light:   26, medium:   53, heavy:    80 },
  { str:  9, light:   30, medium:   60, heavy:    90 },
  { str: 10, light:   33, medium:   66, heavy:   100 },
  { str: 11, light:   38, medium:   76, heavy:   115 },
  { str: 12, light:   43, medium:   86, heavy:   130 },
  { str: 13, light:   50, medium:  100, heavy:   150 },
  { str: 14, light:   58, medium:  116, heavy:   175 },
  { str: 15, light:   66, medium:  133, heavy:   200 },
  { str: 16, light:   76, medium:  153, heavy:   230 },
  { str: 17, light:   86, medium:  173, heavy:   260 },
  { str: 18, light:  100, medium:  200, heavy:   300 },
  { str: 19, light:  116, medium:  233, heavy:   350 },
  { str: 20, light:  133, medium:  266, heavy:   400 },
  { str: 21, light:  153, medium:  306, heavy:   460 },
  { str: 22, light:  173, medium:  346, heavy:   520 },
  { str: 23, light:  200, medium:  400, heavy:   600 },
  { str: 24, light:  233, medium:  466, heavy:   700 },
  { str: 25, light:  266, medium:  533, heavy:   800 },
  { str: 26, light:  306, medium:  613, heavy:   920 },
  { str: 27, light:  346, medium:  693, heavy:  1040 },
  { str: 28, light:  400, medium:  800, heavy:  1200 },
  { str: 29, light:  466, medium:  933, heavy:  1400 },
]

const DERIVED_BONUSES_TABLE = [
  { stat: 'Fuerza (FUE)',        affects: 'Ataques c/c, Daño c/c, CMB, CMD, Capacidad de carga, Trepar/Nadar' },
  { stat: 'Destreza (DES)',      affects: 'CA, Ataques a distancia, Ref, CMD, Iniciativa, Sigilo, Acrobacias' },
  { stat: 'Constitución (CON)',  affects: 'PG por dado de golpe, Fort' },
  { stat: 'Inteligencia (INT)',  affects: 'Puntos de habilidad/nivel, Idiomas extra, Conjuros (Mago)' },
  { stat: 'Sabiduría (SAB)',     affects: 'Vol, Percepción, Conjuros (Clérigo/Druida/Ranger/Paladín)' },
  { stat: 'Carisma (CAR)',       affects: 'Conjuros (Hechicero/Bardo), usos diarios de habilidades de clase' },
]

const SPELL_DC_MODS = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const SPELL_LEVELS_DC = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const TOUCH_ATTACK_TABLE = [
  { type: 'Toque cuerpo a cuerpo', formula: 'BAB + mod. FUE + mod. tamaño', ignores: 'Armadura, escudo, armadura natural' },
  { type: 'Toque a distancia',     formula: 'BAB + mod. DES + mod. tamaño', ignores: 'Armadura, escudo, armadura natural' },
]

const CL_EFFECTS_TABLE = [
  { effect: 'Alcance corto',          formula: '7,5 m + 1,5 m por cada 2 NL' },
  { effect: 'Alcance medio',          formula: '30 m + 3 m por NL' },
  { effect: 'Alcance largo',          formula: '120 m + 12 m por NL' },
  { effect: 'CD disipar magia',       formula: '11 + NL del lanzador original' },
  { effect: 'CD contrahechizo',       formula: '15 + nivel del conjuro' },
  { effect: 'Duración 1 ronda/NL',    formula: 'NL rondas' },
  { effect: 'Duración 1 minuto/NL',   formula: 'NL × 10 rondas' },
  { effect: 'Duración 1 hora/NL',     formula: 'NL × 60 minutos' },
  { effect: 'Daño máximo (Bola de fuego)', formula: '10d6 (a NL 10), luego +1d6/2 NL adicionales' },
]

const BAB_PROGRESSION = [
  { level:  1, full: '+1',             threeQ: '+0',         half: '+0'    },
  { level:  2, full: '+2',             threeQ: '+1',         half: '+1'    },
  { level:  3, full: '+3',             threeQ: '+2',         half: '+1'    },
  { level:  4, full: '+4',             threeQ: '+3',         half: '+2'    },
  { level:  5, full: '+5',             threeQ: '+3',         half: '+2'    },
  { level:  6, full: '+6/+1',          threeQ: '+4',         half: '+3'    },
  { level:  7, full: '+7/+2',          threeQ: '+5',         half: '+3'    },
  { level:  8, full: '+8/+3',          threeQ: '+6/+1',      half: '+4'    },
  { level:  9, full: '+9/+4',          threeQ: '+6/+1',      half: '+4'    },
  { level: 10, full: '+10/+5',         threeQ: '+7/+2',      half: '+5'    },
  { level: 11, full: '+11/+6/+1',      threeQ: '+8/+3',      half: '+5'    },
  { level: 12, full: '+12/+7/+2',      threeQ: '+9/+4',      half: '+6/+1' },
  { level: 13, full: '+13/+8/+3',      threeQ: '+9/+4',      half: '+6/+1' },
  { level: 14, full: '+14/+9/+4',      threeQ: '+10/+5',     half: '+7/+2' },
  { level: 15, full: '+15/+10/+5',     threeQ: '+11/+6/+1',  half: '+7/+2' },
  { level: 16, full: '+16/+11/+6/+1',  threeQ: '+12/+7/+2',  half: '+8/+3' },
  { level: 17, full: '+17/+12/+7/+2',  threeQ: '+12/+7/+2',  half: '+8/+3' },
  { level: 18, full: '+18/+13/+8/+3',  threeQ: '+13/+8/+3',  half: '+9/+4' },
  { level: 19, full: '+19/+14/+9/+4',  threeQ: '+14/+9/+4',  half: '+9/+4' },
  { level: 20, full: '+20/+15/+10/+5', threeQ: '+15/+10/+5', half: '+10/+5'},
]

const SIZE_MODIFIERS_TABLE = [
  { size: 'Diminuto',     acAttack: '+8', cmb: '−8', cmd: '−8', stealth: '+16', fly: '+8'  },
  { size: 'Minúsculo',    acAttack: '+4', cmb: '−4', cmd: '−4', stealth: '+8',  fly: '+6'  },
  { size: 'Pequeñísimo',  acAttack: '+2', cmb: '−2', cmd: '−2', stealth: '+4',  fly: '+4'  },
  { size: 'Pequeño',      acAttack: '+1', cmb: '−1', cmd: '−1', stealth: '+4',  fly: '+2'  },
  { size: 'Mediano',      acAttack:  '0', cmb:  '0', cmd:  '0', stealth:  '0',  fly:  '0'  },
  { size: 'Grande',       acAttack: '−1', cmb: '+1', cmd: '+1', stealth: '−4',  fly: '−2'  },
  { size: 'Enorme',       acAttack: '−2', cmb: '+2', cmd: '+2', stealth: '−8',  fly: '−4'  },
  { size: 'Gargantuesco', acAttack: '−4', cmb: '+4', cmd: '+4', stealth: '−12', fly: '−6'  },
  { size: 'Colosal',      acAttack: '−8', cmb: '+8', cmd: '+8', stealth: '−16', fly: '−8'  },
]

const COMBAT_MODS_TABLE = [
  { situation: 'Flanqueo',                          attacker: '+2 al ataque',                              notes: 'Requiere aliado en lado opuesto' },
  { situation: 'Carga',                             attacker: '+2 al ataque, −2 CA',                       notes: 'Sólo movimiento en línea recta' },
  { situation: 'Atacante oculto / a ciegas',        attacker: '−4 al ataque + 50% fallo',                  notes: 'Si ignora la ubicación, no puede atacar' },
  { situation: 'Objetivo en el suelo (c/c)',        attacker: '+4 al ataque',                              notes: '−4 al ataque a distancia vs objetivo en suelo' },
  { situation: 'Atacante en el suelo',              attacker: '−4 al ataque c/c',                          notes: '+4 CA vs ataques c/c, −4 CA vs distancia' },
  { situation: 'Disparo en cuerpo a cuerpo',        attacker: '−4 al ataque',                              notes: 'Riesgo de golpear aliado si falla' },
  { situation: 'Ataque sin pericia en el arma',     attacker: '−4 al ataque',                              notes: 'Aplica también a hechizos de toque' },
  { situation: 'Dos armas – principal',             attacker: '−4 al ataque (−2 con secundaria ligera)',   notes: 'Con don Combate con dos armas: −2/−2 o −0/−0' },
  { situation: 'Dos armas – secundaria',            attacker: '−8 al ataque (−4 con secundaria ligera)',   notes: '' },
  { situation: 'Combate a la defensiva',            attacker: '−4 al ataque, +2 CA',                       notes: '+3 CA con Maniobra defensiva mejorada' },
  { situation: 'Ataque total',                      attacker: 'Todos los ataques del turno',               notes: 'No puedes moverte más de 1,5 m' },
]

const CMB_CMD_TABLE = [
  { maneuver: 'Agarrar (Grapple)',        effect: 'Objetivo queda agarrado; ambos −4 DES a CA',     bonus: '—' },
  { maneuver: 'Derribar (Trip)',          effect: 'Objetivo cae al suelo (tumbado)',                 bonus: '−4 CA cuerpo a cuerpo, +4 a distancia' },
  { maneuver: 'Desarmar (Disarm)',        effect: 'Objetivo pierde su arma',                        bonus: '+4 vs rival sin escudo' },
  { maneuver: 'Empujar (Bull Rush)',      effect: 'Mueve al objetivo 1,5 m por 5 pts. de margen',   bonus: 'Sin AO si retrocede' },
  { maneuver: 'Reorientar (Reposition)', effect: 'Mueve al objetivo sin hacerle daño',              bonus: '—' },
  { maneuver: 'Robar (Steal)',            effect: 'Arrebata un objeto al objetivo',                 bonus: '—' },
  { maneuver: 'Maniobra sucia (Dirty T.)',effect: 'Aplica cegado, enredado o similar 1 ronda',      bonus: '+2 si rival ya está en desventaja' },
]

const COVER_TABLE = [
  { type: 'Cobertura',                acBonus: '+4', refBonus: '+2', notes: 'Normal: obstáculo sólido entre atacante y objetivo' },
  { type: 'Cobertura blanda',         acBonus: '+4', refBonus: '—',  notes: 'Criatura u obstáculo no sólido' },
  { type: 'Cobertura total',          acBonus: 'Sin LDV',  refBonus: '—',  notes: 'No se puede atacar directamente; sólo área/conjuro' },
  { type: 'Cobertura mejorada (don)', acBonus: '+8', refBonus: '+4', notes: 'Con don Tiro mejorado + cobertura' },
]

const CONCEALMENT_TABLE = [
  { type: 'Ocultación parcial (humo, niebla ligera)', miss: '20%', notes: 'Tirada de dados; ≤20 = fallo automático' },
  { type: 'Ocultación total (oscuridad, invisible)',   miss: '50%', notes: 'No puede atacar si desconoce ubicación del objetivo' },
  { type: 'Invisible atacando a objetivo visible',     miss: '50% del defensor', notes: '+2 al ataque del invisible' },
]

const AC_BONUS_TYPES = [
  { type: 'Armadura',   source: 'Armadura / hechizo armor',           stacks: 'No (mismo tipo)', lost: 'Desprevenido' },
  { type: 'Escudo',     source: 'Escudo / hechizo shield',            stacks: 'No',              lost: 'Desprevenido' },
  { type: 'Destreza',   source: 'Mod. DES (capped por armadura)',      stacks: 'No',              lost: 'Desprevenido, inmovilizado, toque' },
  { type: 'Natural',    source: 'Piel, hechizos (barkskin, etc.)',     stacks: 'Sí (fuentes distintas)', lost: '—' },
  { type: 'Deflexión',  source: 'Anillo de protección, conjuros',      stacks: 'No',              lost: '—' },
  { type: 'Esquiva',    source: 'Don Esquiva, habilidades',            stacks: 'Sí',              lost: 'Desprevenido, inmovilizado' },
  { type: 'Sagrado',    source: 'Favor divino',                        stacks: 'No',              lost: '—' },
  { type: 'Profano',    source: 'Maldición / magia oscura',            stacks: 'No',              lost: '—' },
  { type: 'Insight',    source: 'Hechizos de presciencia',             stacks: 'No',              lost: '—' },
  { type: 'Tamaño',     source: 'Tabla de tamaño',                     stacks: '—',               lost: '—' },
]

const SAVE_PROGRESSION = Array.from({ length: 20 }, (_, i) => {
  const level = i + 1
  const good = 2 + Math.floor(level / 2)
  const poor = Math.floor(level / 3)
  return { level, good: `+${good}`, poor: `+${poor}` }
})

const SAVE_MODIFIERS_TABLE = [
  { condition: 'Veneno',                    fort: 'Anula', ref: '—', vol: '—',         notes: 'Frecuencia y daño varían por tipo' },
  { condition: 'Enfermedad',                fort: 'Anula', ref: '—', vol: '—',         notes: '' },
  { condition: 'Energía negativa / nivel',  fort: 'Anula', ref: '—', vol: '—',         notes: 'Muertos vivientes: inmunes a la mayoría' },
  { condition: 'Conjuro de área (c. Bola)', fort: '—',     ref: 'Mitad daño', vol: '—', notes: 'Fallo = daño completo' },
  { condition: 'Conjuro mental / mente',    fort: '—',     ref: '—', vol: 'Anula',     notes: 'Ej. confusión, dominación' },
  { condition: 'Miedo',                     fort: '—',     ref: '—', vol: 'Anula',     notes: '' },
  { condition: 'Paralización (hechizo)',    fort: '—',     ref: '—', vol: 'Anula',     notes: '' },
  { condition: 'Ilusión (incredulidad)',    fort: '—',     ref: '—', vol: 'Anula',     notes: 'Sólo al interactuar con la ilusión' },
  { condition: 'Muerte (power word kill)',  fort: 'Anula', ref: '—', vol: '—',         notes: 'Sólo funciona si PG < umbral' },
]

const SKILL_ABILITY_TABLE = [
  { skill: 'Acrobacias',                ability: 'DES', trained: false },
  { skill: 'Artesanía',                 ability: 'INT', trained: false },
  { skill: 'Averigar intenciones',      ability: 'SAB', trained: false },
  { skill: 'Conocimiento (arcano)',     ability: 'INT', trained: true },
  { skill: 'Conocimiento (geografía)',  ability: 'INT', trained: true },
  { skill: 'Conocimiento (historia)',   ability: 'INT', trained: true },
  { skill: 'Conocimiento (ingeniería)', ability: 'INT', trained: true },
  { skill: 'Conocimiento (local)',      ability: 'INT', trained: true },
  { skill: 'Conocimiento (mazmorras)',  ability: 'INT', trained: true },
  { skill: 'Conocimiento (naturaleza)', ability: 'INT', trained: true },
  { skill: 'Conocimiento (nobleza)',    ability: 'INT', trained: true },
  { skill: 'Conocimiento (planos)',     ability: 'INT', trained: true },
  { skill: 'Conocimiento (religión)',   ability: 'INT', trained: true },
  { skill: 'Conocimiento de conjuros',  ability: 'INT', trained: true },
  { skill: 'Desactivar mecanismo',       ability: 'DES', trained: true },
  { skill: 'Diplomacia',                ability: 'CAR', trained: false },
  { skill: 'Disfrazarse',               ability: 'CAR', trained: false },
  { skill: 'Engañar',                   ability: 'CAR', trained: false },
  { skill: 'Escapismo',                 ability: 'DES', trained: false },
  { skill: 'Interpretar',               ability: 'CAR', trained: false },
  { skill: 'Intimidar',                 ability: 'CAR', trained: false },
  { skill: 'Juego de manos',             ability: 'DES', trained: true },
  { skill: 'Lingüística',               ability: 'INT', trained: true },
  { skill: 'Montar',                    ability: 'DES', trained: false },
  { skill: 'Nadar',                     ability: 'FUE', trained: false },
  { skill: 'Oficio',                    ability: 'SAB', trained: true },
  { skill: 'Percepción',                ability: 'SAB', trained: false },
  { skill: 'Sanar',                     ability: 'SAB', trained: false },
  { skill: 'Sigilo',                    ability: 'DES', trained: false },
  { skill: 'Supervivencia',             ability: 'SAB', trained: false },
  { skill: 'Tasación',                  ability: 'INT', trained: false },
  { skill: 'Trato con animales',        ability: 'CAR', trained: true },
  { skill: 'Trepar',                    ability: 'FUE', trained: false },
  { skill: 'Usar objeto mágico',        ability: 'CAR', trained: true },
  { skill: 'Volar',                     ability: 'DES', trained: false },
]

const TYPICAL_DCS = [
  { difficulty: 'Trivial',        dc:  5, example: 'Escalar una cuerda con nudos' },
  { difficulty: 'Fácil',         dc: 10, example: 'Nadar en aguas tranquilas' },
  { difficulty: 'Moderada',      dc: 15, example: 'Forzar una cerradura sencilla' },
  { difficulty: 'Difícil',       dc: 20, example: 'Escalar un acantilado bajo lluvia' },
  { difficulty: 'Muy difícil',   dc: 25, example: 'Nadar contra corriente fuerte' },
  { difficulty: 'Heroica',       dc: 30, example: 'Forzar una cerradura maestra' },
  { difficulty: 'Casi imposible',dc: 35, example: 'Hazaña legendaria de habilidad' },
  { difficulty: 'Imposible',     dc: 40, example: 'Desafiar las leyes naturales' },
]

const XP_TABLE = [
  { level:  1, slow:          '0', medium:          '0', fast:          '0' },
  { level:  2, slow:      '2.000', medium:      '1.300', fast:      '1.000' },
  { level:  3, slow:      '5.000', medium:      '3.300', fast:      '3.000' },
  { level:  4, slow:      '9.000', medium:      '6.000', fast:      '6.000' },
  { level:  5, slow:     '15.000', medium:     '10.000', fast:     '10.000' },
  { level:  6, slow:     '23.000', medium:     '15.000', fast:     '15.000' },
  { level:  7, slow:     '35.000', medium:     '23.000', fast:     '23.000' },
  { level:  8, slow:     '51.000', medium:     '34.000', fast:     '34.000' },
  { level:  9, slow:     '75.000', medium:     '50.000', fast:     '50.000' },
  { level: 10, slow:    '105.000', medium:     '71.000', fast:     '71.000' },
  { level: 11, slow:    '155.000', medium:    '105.000', fast:    '105.000' },
  { level: 12, slow:    '220.000', medium:    '145.000', fast:    '145.000' },
  { level: 13, slow:    '315.000', medium:    '210.000', fast:    '210.000' },
  { level: 14, slow:    '445.000', medium:    '295.000', fast:    '295.000' },
  { level: 15, slow:    '635.000', medium:    '425.000', fast:    '425.000' },
  { level: 16, slow:    '890.000', medium:    '600.000', fast:    '600.000' },
  { level: 17, slow:  '1.300.000', medium:    '850.000', fast:    '850.000' },
  { level: 18, slow:  '1.800.000', medium:  '1.200.000', fast:  '1.200.000' },
  { level: 19, slow:  '2.550.000', medium:  '1.700.000', fast:  '1.700.000' },
  { level: 20, slow:  '3.600.000', medium:  '2.400.000', fast:  '2.400.000' },
]

const WBL_TABLE = [
  { level:  1, wbl:         '—' },
  { level:  2, wbl:     '1.000' },
  { level:  3, wbl:     '3.000' },
  { level:  4, wbl:     '6.000' },
  { level:  5, wbl:    '10.500' },
  { level:  6, wbl:    '16.000' },
  { level:  7, wbl:    '23.500' },
  { level:  8, wbl:    '33.000' },
  { level:  9, wbl:    '46.000' },
  { level: 10, wbl:    '62.000' },
  { level: 11, wbl:    '82.000' },
  { level: 12, wbl:   '108.000' },
  { level: 13, wbl:   '140.000' },
  { level: 14, wbl:   '185.000' },
  { level: 15, wbl:   '240.000' },
  { level: 16, wbl:   '315.000' },
  { level: 17, wbl:   '410.000' },
  { level: 18, wbl:   '530.000' },
  { level: 19, wbl:   '685.000' },
  { level: 20, wbl:   '880.000' },
]

const CREATURE_SIZE_TABLE = [
  { size: 'Diminuto',     space: '0,15 m',  reach: '0 m',        mod: '+8',  stealth: '+16' },
  { size: 'Minúsculo',    space: '0,3 m',   reach: '0 m',        mod: '+4',  stealth: '+12' },
  { size: 'Pequeñísimo',  space: '0,75 m',  reach: '0 m',        mod: '+2',  stealth: '+8'  },
  { size: 'Pequeño',      space: '1,5 m',   reach: '1,5 m',      mod: '+1',  stealth: '+4'  },
  { size: 'Mediano',      space: '1,5 m',   reach: '1,5 m',      mod:  '0',  stealth:  '0'  },
  { size: 'Grande',       space: '3 m',     reach: '1,5–3 m',    mod: '−1',  stealth: '−4'  },
  { size: 'Enorme',       space: '4,5 m',   reach: '3 m',        mod: '−2',  stealth: '−8'  },
  { size: 'Gargantuesco', space: '6 m',     reach: '4,5 m',      mod: '−4',  stealth: '−12' },
  { size: 'Colosal',      space: '9 m',     reach: '6 m',        mod: '−8',  stealth: '−16' },
]

// ── Nav structure ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'caracteristicas', label: 'Características',
    sections: [
      { id: 'mod-caracteristica',  label: 'Modificadores de característica' },
      { id: 'cap-carga',           label: 'Capacidad de carga' },
      { id: 'bon-derivados',       label: 'Bonificadores derivados' },
    ],
  },
  {
    id: 'magia', label: 'Magia',
    sections: [
      { id: 'conjuros-adicionales', label: 'Conjuros adicionales' },
      { id: 'cd-salvacion',         label: 'CD de salvación' },
      { id: 'ataque-toque',         label: 'Ataque de toque' },
      { id: 'nivel-lanzador',       label: 'Nivel de lanzador' },
    ],
  },
  {
    id: 'combate', label: 'Combate',
    sections: [
      { id: 'bab',               label: 'Bonificador base de ataque' },
      { id: 'bon-tamano',        label: 'Bonificadores por tamaño' },
      { id: 'mod-combate',       label: 'Modificadores de combate' },
      { id: 'cmb-cmd',           label: 'Maniobras (CMB/CMD)' },
      { id: 'cobertura',         label: 'Modificadores por cobertura' },
      { id: 'ocultacion',        label: 'Modificadores por ocultación' },
    ],
  },
  {
    id: 'defensa', label: 'Defensa',
    sections: [
      { id: 'bon-ca',            label: 'Bonificadores a la CA' },
      { id: 'salvaciones-base',  label: 'Salvaciones base' },
      { id: 'mod-salvaciones',   label: 'Modificadores a salvaciones' },
    ],
  },
  {
    id: 'habilidades', label: 'Habilidades',
    sections: [
      { id: 'hab-caracteristica', label: 'Habilidades por característica' },
      { id: 'cd-tipicas',         label: 'CD típicas' },
    ],
  },
  {
    id: 'otros', label: 'Otros',
    sections: [
      { id: 'experiencia',  label: 'Experiencia por nivel' },
      { id: 'riqueza',      label: 'Riqueza por nivel' },
      { id: 'tamano-crit',  label: 'Ajustes por tamaño' },
    ],
  },
]

function fmtMod(mod: number) {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

const SPELL_LEVELS_BONUS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const

// ── Component ─────────────────────────────────────────────────────────────────

export function Tables() {
  function scrollTo(id: string) {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile category dropdown ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <LayoutList size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            defaultValue=""
            onChange={e => { scrollTo(e.target.value); (e.target as HTMLSelectElement).value = '' }}
          >
            <option value="" disabled>Ir a sección…</option>
            {CATEGORIES.map(cat => (
              <optgroup key={cat.id} label={cat.label}>
                {cat.sections.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left category nav (desktop) ── */}
      <nav className={styles.tableNav}>
        <div className={styles.tableNavInner}>
          <p className={styles.navTitle}>Categorías</p>
          {CATEGORIES.map(cat => (
            <div key={cat.id} className={styles.navGroup}>
              <button className={styles.navCatBtn} onClick={() => scrollTo(cat.id)}>
                {cat.label}
              </button>
              {cat.sections.map(sec => (
                <button key={sec.id} className={styles.navSecBtn} onClick={() => scrollTo(sec.id)}>
                  {sec.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className={styles.content}>

        <header className={styles.header}>
          <LayoutList size={28} className={styles.headerIcon} />
          <div>
            <h1>Tablas de Referencia</h1>
            <p className={styles.subtitle}>Tablas del sistema d20 Pathfinder ordenadas por categoría</p>
          </div>
        </header>

        {/* ══════════════════════════════════════════════
            CARACTERÍSTICAS
        ══════════════════════════════════════════════ */}
        <div id="caracteristicas" className={styles.category}>
          <h2 className={styles.categoryTitle}>Características</h2>

          {/* Modificadores */}
          <section id="mod-caracteristica" className={styles.section}>
            <h3 className={styles.sectionTitle}>Modificadores de característica</h3>
            <p className={styles.sectionNote}>
              Modificador = ⌊(puntuación − 10) / 2⌋. Un modificador positivo beneficia al personaje; uno negativo le perjudica.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th>Puntuación</th>
                    <th>Modificador</th>
                    <th>Puntuación</th>
                    <th>Modificador</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.ceil(ABILITY_MOD_RANGES.length / 2) }, (_, i) => {
                    const a = ABILITY_MOD_RANGES[i * 2]
                    const b = ABILITY_MOD_RANGES[i * 2 + 1]
                    return (
                      <tr key={i}>
                        <td className={styles.tdLabel}>{a.range}</td>
                        <td><span className={a.mod >= 0 ? styles.cellPos : styles.cellNeg}>{fmtMod(a.mod)}</span></td>
                        {b ? (
                          <>
                            <td className={styles.tdLabel}>{b.range}</td>
                            <td><span className={b.mod >= 0 ? styles.cellPos : styles.cellNeg}>{fmtMod(b.mod)}</span></td>
                          </>
                        ) : <><td /><td /></>}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Capacidad de carga */}
          <section id="cap-carga" className={styles.section}>
            <h3 className={styles.sectionTitle}>Característica y capacidad de carga</h3>
            <p className={styles.sectionNote}>
              Carga ligera: sin penalización. Carga media: velocidad −10 ft, −3 CA max DES, −3 penaliz.
              Carga pesada: velocidad −20 ft, −1 CA max DES, −6 penaliz. Para FUE ≥ 30, multiplicar por 4 los
              valores de FUE 20 por cada +10 adicional.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th>FUE</th>
                    <th>Carga ligera (kg)</th>
                    <th>Carga media (kg)</th>
                    <th>Carga pesada (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {CARRY_LOAD_TABLE.map(r => (
                    <tr key={r.str}>
                      <td className={styles.tdLabel}>{r.str}</td>
                      <td>{r.light} kg</td>
                      <td>{r.medium} kg</td>
                      <td>{r.heavy} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bonificadores derivados */}
          <section id="bon-derivados" className={styles.section}>
            <h3 className={styles.sectionTitle}>Característica y bonificadores derivados</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Característica</th>
                    <th style={{ textAlign: 'left' }}>Afecta a</th>
                  </tr>
                </thead>
                <tbody>
                  {DERIVED_BONUSES_TABLE.map(r => (
                    <tr key={r.stat}>
                      <td className={styles.tdLabel}>{r.stat}</td>
                      <td style={{ textAlign: 'left' }}>{r.affects}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ══════════════════════════════════════════════
            MAGIA
        ══════════════════════════════════════════════ */}
        <div id="magia" className={styles.category}>
          <h2 className={styles.categoryTitle}>Magia</h2>

          {/* Conjuros adicionales */}
          <section id="conjuros-adicionales" className={styles.section}>
            <h3 className={styles.sectionTitle}>Conjuros adicionales por característica</h3>
            <p className={styles.sectionNote}>
              Los lanzadores obtienen hechizos extra por día según su atributo principal (INT para magos,
              SAB para clérigos/druidas/rangers/paladines, CAR para hechiceros/bardos). Los cantrips (Nv 0)
              nunca reciben slots extra.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th>Punt.</th>
                    <th>Mod.</th>
                    {SPELL_LEVELS_BONUS.map(sl => (
                      <th key={sl} className={sl >= 5 ? styles.mobileHide : ''}>{sl === 0 ? 'Nv 0' : `Nv ${sl}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BONUS_SPELL_TABLE.map(row => (
                    <tr key={row.scoreRange} className={!row.canCast ? styles.rowDisabled : ''}>
                      <td className={styles.tdLabel}>{row.scoreRange}</td>
                      <td className={styles.tdMod}>{fmtMod(row.modifier)}</td>
                      {!row.canCast ? (
                        <td colSpan={10} className={styles.cantCastLabel}>
                          No puede lanzar conjuros de este atributo
                        </td>
                      ) : (
                        SPELL_LEVELS_BONUS.map(sl => {
                          const val = row.bonus[sl]
                          return (
                            <td key={sl} className={sl >= 5 ? styles.mobileHide : ''}>
                              {!val ? <span className={styles.cellNone}>—</span>
                                    : <span className={styles.cellBonus}>{val}</span>}
                            </td>
                          )
                        })
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CD de salvación */}
          <section id="cd-salvacion" className={styles.section}>
            <h3 className={styles.sectionTitle}>CD de salvación de conjuros</h3>
            <p className={styles.sectionNote}>
              CD = 10 + nivel del conjuro + modificador del atributo lanzador. Filas = modificador; columnas = nivel.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th>Mod.</th>
                    {SPELL_LEVELS_DC.map(sl => <th key={sl} className={sl >= 6 ? styles.mobileHide : ''}>Nv {sl}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {SPELL_DC_MODS.map(mod => (
                    <tr key={mod}>
                      <td className={styles.tdMod}>{fmtMod(mod)}</td>
                      {SPELL_LEVELS_DC.map(sl => (
                        <td key={sl} className={sl >= 6 ? styles.mobileHide : ''}><span className={styles.cellBonus}>{10 + sl + mod}</span></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Ataque de toque */}
          <section id="ataque-toque" className={styles.section}>
            <h3 className={styles.sectionTitle}>Bonificador de ataque de toque</h3>
            <p className={styles.sectionNote}>
              Los ataques de toque ignoran la bonificación de armadura, escudo y armadura natural a la CA.
              La CA de toque = 10 + DES + deflexión + tamaño.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Tipo</th>
                    <th style={{ textAlign: 'left' }}>Fórmula</th>
                    <th style={{ textAlign: 'left' }}>Ignora</th>
                  </tr>
                </thead>
                <tbody>
                  {TOUCH_ATTACK_TABLE.map(r => (
                    <tr key={r.type}>
                      <td className={styles.tdLabel}>{r.type}</td>
                      <td style={{ textAlign: 'left' }}>{r.formula}</td>
                      <td style={{ textAlign: 'left', color: 'var(--color-text-secondary)' }}>{r.ignores}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Nivel de lanzador */}
          <section id="nivel-lanzador" className={styles.section}>
            <h3 className={styles.sectionTitle}>Nivel de lanzador y efectos</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Efecto</th>
                    <th style={{ textAlign: 'left' }}>Fórmula / valor</th>
                  </tr>
                </thead>
                <tbody>
                  {CL_EFFECTS_TABLE.map(r => (
                    <tr key={r.effect}>
                      <td className={styles.tdLabel}>{r.effect}</td>
                      <td style={{ textAlign: 'left' }}>{r.formula}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ══════════════════════════════════════════════
            COMBATE
        ══════════════════════════════════════════════ */}
        <div id="combate" className={styles.category}>
          <h2 className={styles.categoryTitle}>Combate</h2>

          {/* BAB */}
          <section id="bab" className={styles.section}>
            <h3 className={styles.sectionTitle}>Bonificador base de ataque</h3>
            <p className={styles.sectionNote}>
              <strong>Progresión completa (+1/nivel):</strong> Bárbaro, Guerrero, Paladín, Ranger.&nbsp;
              <strong>¾ (+3/4 niveles):</strong> Bardo, Clérigo, Druida, Pícaro, Alquimista.&nbsp;
              <strong>½ (+1/2 niveles):</strong> Hechicero, Mago, Brujo, Oracle.
              Al alcanzar BAB +6/+11/+16 se obtienen ataques adicionales con −5 cada uno.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th>Nivel</th>
                    <th>Completo</th>
                    <th>¾</th>
                    <th>½</th>
                  </tr>
                </thead>
                <tbody>
                  {BAB_PROGRESSION.map(r => (
                    <tr key={r.level}>
                      <td className={styles.tdLabel}>{r.level}</td>
                      <td><span className={styles.cellBonus}>{r.full}</span></td>
                      <td><span className={styles.cellBonus}>{r.threeQ}</span></td>
                      <td><span className={styles.cellBonus}>{r.half}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Tamaño */}
          <section id="bon-tamano" className={styles.section}>
            <h3 className={styles.sectionTitle}>Bonificadores por tamaño</h3>
            <p className={styles.sectionNote}>
              El modificador de CA/ataque es inverso al de CMB/CMD. Estos valores se suman a los ataques y
              maniobras de combate.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th>Tamaño</th>
                    <th>CA / Ataque</th>
                    <th>CMB / CMD</th>
                    <th>Sigilo</th>
                    <th>Volar</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_MODIFIERS_TABLE.map(r => (
                    <tr key={r.size}>
                      <td className={styles.tdLabel}>{r.size}</td>
                      <td><span className={r.acAttack.startsWith('−') || r.acAttack === '0' ? styles.cellNeg : styles.cellPos}>{r.acAttack}</span></td>
                      <td><span className={r.cmb.startsWith('−') || r.cmb === '0' ? (r.cmb === '0' ? '' : styles.cellNeg) : styles.cellPos}>{r.cmb}</span></td>
                      <td><span className={r.stealth.startsWith('−') || r.stealth === '0' ? (r.stealth === '0' ? '' : styles.cellNeg) : styles.cellPos}>{r.stealth}</span></td>
                      <td><span className={r.fly.startsWith('−') || r.fly === '0' ? (r.fly === '0' ? '' : styles.cellNeg) : styles.cellPos}>{r.fly}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Modificadores combate */}
          <section id="mod-combate" className={styles.section}>
            <h3 className={styles.sectionTitle}>Modificadores de combate</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Situación</th>
                    <th style={{ textAlign: 'left' }}>Efecto al atacante</th>
                    <th style={{ textAlign: 'left' }}>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {COMBAT_MODS_TABLE.map(r => (
                    <tr key={r.situation}>
                      <td className={styles.tdLabel}>{r.situation}</td>
                      <td style={{ textAlign: 'left' }}>{r.attacker}</td>
                      <td style={{ textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CMB/CMD */}
          <section id="cmb-cmd" className={styles.section}>
            <h3 className={styles.sectionTitle}>Maniobras de combate (CMB/CMD)</h3>
            <p className={styles.sectionNote}>
              <strong>CMB</strong> = BAB + mod. FUE + mod. tamaño.&nbsp;
              <strong>CMD</strong> = 10 + BAB + mod. FUE + mod. DES + mod. tamaño.
              La maniobra tiene éxito si CMB del atacante ≥ CMD del defensor.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Maniobra</th>
                    <th style={{ textAlign: 'left' }}>Efecto</th>
                    <th style={{ textAlign: 'left' }}>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {CMB_CMD_TABLE.map(r => (
                    <tr key={r.maneuver}>
                      <td className={styles.tdLabel}>{r.maneuver}</td>
                      <td style={{ textAlign: 'left' }}>{r.effect}</td>
                      <td style={{ textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{r.bonus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Cobertura */}
          <section id="cobertura" className={styles.section}>
            <h3 className={styles.sectionTitle}>Modificadores por cobertura</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Tipo</th>
                    <th>Bon. CA</th>
                    <th>Bon. Ref</th>
                    <th style={{ textAlign: 'left' }}>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {COVER_TABLE.map(r => (
                    <tr key={r.type}>
                      <td className={styles.tdLabel}>{r.type}</td>
                      <td><span className={styles.cellPos}>{r.acBonus}</span></td>
                      <td>{r.refBonus !== '—' ? <span className={styles.cellPos}>{r.refBonus}</span> : <span className={styles.cellNone}>—</span>}</td>
                      <td style={{ textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Ocultación */}
          <section id="ocultacion" className={styles.section}>
            <h3 className={styles.sectionTitle}>Modificadores por ocultación</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Tipo</th>
                    <th>Probabilidad de fallo</th>
                    <th style={{ textAlign: 'left' }}>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {CONCEALMENT_TABLE.map(r => (
                    <tr key={r.type}>
                      <td className={styles.tdLabel}>{r.type}</td>
                      <td><span className={styles.cellBonus}>{r.miss}</span></td>
                      <td style={{ textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ══════════════════════════════════════════════
            DEFENSA
        ══════════════════════════════════════════════ */}
        <div id="defensa" className={styles.category}>
          <h2 className={styles.categoryTitle}>Defensa</h2>

          {/* Bonificadores CA */}
          <section id="bon-ca" className={styles.section}>
            <h3 className={styles.sectionTitle}>Bonificadores a la CA</h3>
            <p className={styles.sectionNote}>
              CA = 10 + armadura + escudo + DES + tamaño + natural + deflexión + miscelánea.
              Bonificadores del mismo tipo no se acumulan (salvo esquiva).
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Tipo</th>
                    <th style={{ textAlign: 'left' }}>Fuente habitual</th>
                    <th>¿Acumula?</th>
                    <th style={{ textAlign: 'left' }}>Se pierde con</th>
                  </tr>
                </thead>
                <tbody>
                  {AC_BONUS_TYPES.map(r => (
                    <tr key={r.type}>
                      <td className={styles.tdLabel}>{r.type}</td>
                      <td style={{ textAlign: 'left' }}>{r.source}</td>
                      <td style={{ textAlign: 'center' }}>{r.stacks}</td>
                      <td style={{ textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{r.lost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Salvaciones base */}
          <section id="salvaciones-base" className={styles.section}>
            <h3 className={styles.sectionTitle}>Tiradas de salvación base</h3>
            <p className={styles.sectionNote}>
              <strong>Buena:</strong> Bárbaro/Fort, Ranger/Fort, Paladín/Fort+Vol, Clérigo/Fort+Vol, Mago/Vol, etc.&nbsp;
              <strong>Mala:</strong> la salvación secundaria de la clase.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th>Nivel</th>
                    <th>Progresión buena</th>
                    <th>Progresión mala</th>
                    <th>Nivel</th>
                    <th>Progresión buena</th>
                    <th>Progresión mala</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }, (_, i) => {
                    const a = SAVE_PROGRESSION[i]
                    const b = SAVE_PROGRESSION[i + 10]
                    return (
                      <tr key={i}>
                        <td className={styles.tdLabel}>{a.level}</td>
                        <td><span className={styles.cellPos}>{a.good}</span></td>
                        <td><span className={styles.cellBonus}>{a.poor}</span></td>
                        <td className={styles.tdLabel}>{b.level}</td>
                        <td><span className={styles.cellPos}>{b.good}</span></td>
                        <td><span className={styles.cellBonus}>{b.poor}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Modificadores a salvaciones */}
          <section id="mod-salvaciones" className={styles.section}>
            <h3 className={styles.sectionTitle}>Modificadores a salvaciones</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Condición / efecto</th>
                    <th>Fort</th>
                    <th>Ref</th>
                    <th>Vol</th>
                    <th style={{ textAlign: 'left' }}>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {SAVE_MODIFIERS_TABLE.map(r => (
                    <tr key={r.condition}>
                      <td className={styles.tdLabel}>{r.condition}</td>
                      <td>{r.fort !== '—' ? <span className={styles.cellBonus}>{r.fort}</span> : <span className={styles.cellNone}>—</span>}</td>
                      <td>{r.ref  !== '—' ? <span className={styles.cellBonus}>{r.ref}</span>  : <span className={styles.cellNone}>—</span>}</td>
                      <td>{r.vol  !== '—' ? <span className={styles.cellBonus}>{r.vol}</span>  : <span className={styles.cellNone}>—</span>}</td>
                      <td style={{ textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ══════════════════════════════════════════════
            HABILIDADES
        ══════════════════════════════════════════════ */}
        <div id="habilidades" className={styles.category}>
          <h2 className={styles.categoryTitle}>Habilidades</h2>

          {/* Habilidades por característica */}
          <section id="hab-caracteristica" className={styles.section}>
            <h3 className={styles.sectionTitle}>Modificadores de habilidad por característica</h3>
            <p className={styles.sectionNote}>
              La columna "Solo entrenados" indica si la habilidad solo puede usarse si el personaje tiene al menos 1 rango en ella.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Habilidad</th>
                    <th>Atributo</th>
                    <th>Solo entrenados</th>
                    <th style={{ textAlign: 'left' }}>Habilidad</th>
                    <th>Atributo</th>
                    <th>Solo entrenados</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.ceil(SKILL_ABILITY_TABLE.length / 2) }, (_, i) => {
                    const a = SKILL_ABILITY_TABLE[i * 2]
                    const b = SKILL_ABILITY_TABLE[i * 2 + 1]
                    return (
                      <tr key={i}>
                        <td className={styles.tdLabel}>{a.skill}</td>
                        <td><span className={styles.cellBonus}>{a.ability}</span></td>
                        <td style={{ textAlign: 'center' }}>{a.trained ? '✓' : '—'}</td>
                        {b ? (
                          <>
                            <td className={styles.tdLabel}>{b.skill}</td>
                            <td><span className={styles.cellBonus}>{b.ability}</span></td>
                            <td style={{ textAlign: 'center' }}>{b.trained ? '✓' : '—'}</td>
                          </>
                        ) : <><td /><td /><td /></>}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* CD típicas */}
          <section id="cd-tipicas" className={styles.section}>
            <h3 className={styles.sectionTitle}>CD típicas de habilidades</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Dificultad</th>
                    <th>CD</th>
                    <th style={{ textAlign: 'left' }}>Ejemplo</th>
                  </tr>
                </thead>
                <tbody>
                  {TYPICAL_DCS.map(r => (
                    <tr key={r.dc}>
                      <td className={styles.tdLabel}>{r.difficulty}</td>
                      <td><span className={styles.cellBonus}>{r.dc}</span></td>
                      <td style={{ textAlign: 'left', color: 'var(--color-text-secondary)' }}>{r.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ══════════════════════════════════════════════
            OTROS
        ══════════════════════════════════════════════ */}
        <div id="otros" className={styles.category}>
          <h2 className={styles.categoryTitle}>Otros</h2>

          {/* Experiencia */}
          <section id="experiencia" className={styles.section}>
            <h3 className={styles.sectionTitle}>Experiencia por nivel</h3>
            <p className={styles.sectionNote}>
              XP necesaria para <em>alcanzar</em> ese nivel. La velocidad de progresión se elige al inicio de la campaña.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th>Nivel</th>
                    <th>Lenta (XP)</th>
                    <th>Media (XP)</th>
                    <th>Rápida (XP)</th>
                  </tr>
                </thead>
                <tbody>
                  {XP_TABLE.map(r => (
                    <tr key={r.level}>
                      <td className={styles.tdLabel}>{r.level}</td>
                      <td>{r.slow}</td>
                      <td>{r.medium}</td>
                      <td>{r.fast}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Riqueza por nivel */}
          <section id="riqueza" className={styles.section}>
            <h3 className={styles.sectionTitle}>Progresión de riqueza por nivel</h3>
            <p className={styles.sectionNote}>
              Riqueza total (en monedas de oro) que debería tener un personaje de ese nivel al comenzar una sesión.
              El nivel 1 parte sin equipamiento comprado; sólo el básico de clase.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th>Nivel</th>
                    <th>Riqueza (mo)</th>
                    <th>Nivel</th>
                    <th>Riqueza (mo)</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }, (_, i) => {
                    const a = WBL_TABLE[i]
                    const b = WBL_TABLE[i + 10]
                    return (
                      <tr key={i}>
                        <td className={styles.tdLabel}>{a.level}</td>
                        <td>{a.wbl}</td>
                        <td className={styles.tdLabel}>{b.level}</td>
                        <td>{b.wbl}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Tamaño criatura */}
          <section id="tamano-crit" className={styles.section}>
            <h3 className={styles.sectionTitle}>Ajustes por tamaño de criatura</h3>
            <p className={styles.sectionNote}>
              El modificador de CA/Ataque también aplica a CMB/CMD con signo contrario.
              El espacio es el área que ocupa la criatura en el mapa.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.refTable}>
                <thead>
                  <tr>
                    <th>Tamaño</th>
                    <th>Espacio</th>
                    <th>Alcance</th>
                    <th>Mod. CA/Ataque</th>
                    <th>Mod. Sigilo</th>
                  </tr>
                </thead>
                <tbody>
                  {CREATURE_SIZE_TABLE.map(r => (
                    <tr key={r.size}>
                      <td className={styles.tdLabel}>{r.size}</td>
                      <td>{r.space}</td>
                      <td>{r.reach}</td>
                      <td><span className={r.mod.startsWith('−') ? styles.cellNeg : (r.mod === '0' ? '' : styles.cellPos)}>{r.mod}</span></td>
                      <td><span className={r.stealth.startsWith('−') ? styles.cellNeg : (r.stealth === '0' ? '' : styles.cellPos)}>{r.stealth}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

      </div>{/* end content */}
    </div>/* end pageLayout */
  )
}
