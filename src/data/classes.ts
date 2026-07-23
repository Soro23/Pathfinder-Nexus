import type { CharacterClass } from '../store/characterStore'
import { homebrewStore } from '../store/homebrewStore'

export interface ClassFeature {
  name: string
  level: number
  description: string
}

export type MagicType = 'arcane' | 'divine' | 'bardic' | 'alchemist' | null

// spellsPerDay[charLevel - 1][spellLevel] = number of slots (undefined = no access)
export type SpellsPerDayTable = Array<Array<number | undefined>>

// spellsKnown[charLevel - 1][spellLevel] = number of spells known (undefined = no access)
export type SpellsKnownTable = Array<Array<number | undefined>>

export interface ClassData {
  id: string
  name: string
  hitDie: number
  baseAttackBonus: 'good' | 'medium' | 'poor'
  fortitudeSave: 'good' | 'poor'
  reflexSave: 'good' | 'poor'
  willSave: 'good' | 'poor'
  skillPointsPerLevel: number
  classSkills: string[]
  features: ClassFeature[]
  alignment: string[]
  description: string
  magicType: MagicType
  casterAbility: 'intelligence' | 'wisdom' | 'charisma' | null
  startingGoldDice: string
  source: 'core' | 'apg' | 'acg' | 'other' | 'homebrew'
  proficiencies?: { weapons: string; armor: string }
  spellsPerDay?: SpellsPerDayTable
  spellsKnown?: SpellsKnownTable
}

export const CLASSES: ClassData[] = [
  {
    id: 'barbarian',
    source: 'core' as const,
    name: 'Bárbaro',
    hitDie: 12,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'poor',
    skillPointsPerLevel: 4,
    classSkills: ['acrobatics', 'climb', 'craft', 'handle_animal', 'intimidate', 'knowledge_nature', 'perception', 'ride', 'survival', 'swim'],
    features: [
      { name: 'Rabia', level: 1, description: '+4 FUE y CON, +2 Voluntad, −2 CA. Rondas/día = 4 + mod CON + 2×(nivel−1).' },
      { name: 'Movimiento Rápido', level: 1, description: '+10 pies a velocidad base en tierra.' },
      { name: 'Poderes de Rabia', level: 2, description: 'Ganas poderes especiales que se activan mientras estás en furia.' },
      { name: 'Sentido de Trampa +1', level: 2, description: '+1 a Reflejos y CA contra trampas.' },
      { name: 'Sentido de Trampa +2', level: 5, description: '+2 a Reflejos y CA contra trampas.' },
      { name: 'Reducción de Daño 1/—', level: 7, description: 'DR 1/— que absorbe el daño de ataques.' },
      { name: 'Poder de Rabia Adicional', level: 6, description: 'Ganas un poder de rabia adicional.' },
      { name: 'Sentido de Trampa +3', level: 8, description: '+3 a Reflejos y CA contra trampas.' },
      { name: 'Reducción de Daño 2/—', level: 10, description: 'DR 2/— que absorbe el daño de ataques.' },
      { name: 'Rabia Mayor', level: 11, description: '+6 FUE y CON, +3 Voluntad, −2 CA en furia.' },
      { name: 'Sentido de Trampa +4', level: 11, description: '+4 a Reflejos y CA contra trampas.' },
      { name: 'Poder de Rabia Adicional', level: 10, description: 'Ganas un poder de rabia adicional.' },
      { name: 'Reducción de Daño 3/—', level: 13, description: 'DR 3/— que absorbe el daño de ataques.' },
      { name: 'Sentido de Trampa +5', level: 14, description: '+5 a Reflejos y CA contra trampas.' },
      { name: 'Poder de Rabia Adicional', level: 14, description: 'Ganas un poder de rabia adicional.' },
      { name: 'Rabia Incansable', level: 17, description: 'Ya no te fatigas al salir de la furia.' },
      { name: 'Sentido de Trampa +6', level: 17, description: '+6 a Reflejos y CA contra trampas.' },
      { name: 'Poder de Rabia Adicional', level: 18, description: 'Ganas un poder de rabia adicional.' },
    ],
    alignment: ['Caótico Neutral', 'Caótico Bueno', 'Caótico Malvado'],
    description: 'Guerreros primitivos que channelizan su ira en combate.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '3d6*10',
    proficiencies: { weapons: 'Armas simples y marciales', armor: 'Armaduras ligeras y medias, escudos (no de torre)' },
  },
  {
    id: 'bard',
    source: 'core' as const,
    name: 'Bardo',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'poor',
    reflexSave: 'good',
    willSave: 'good',
    skillPointsPerLevel: 6,
    classSkills: ['acrobatics', 'bluff', 'climb', 'diplomacy', 'disguise', 'escape_artist', 'intimidate', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_engineering', 'knowledge_geography', 'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_nobility', 'knowledge_planes', 'knowledge_religion', 'linguistics', 'perception', 'perform', 'profession', 'sense_motive', 'sleight_of_hand', 'spellcraft', 'stealth', 'use_magic_device'],
    features: [
      { name: 'Actuación Bárdica', level: 1, description: 'Rondas/día = 4 + mod CAR + 2×(nivel−1). Permite usar actuaciones especiales.' },
      { name: 'Conocimiento Bardo', level: 1, description: '+nivel/2 a todas las tiradas de Conocimiento aunque no tengas rangos.' },
      { name: 'Inspiración Valiente +1', level: 1, description: '+1 a tiradas de ataque y contra efectos de miedo.' },
      { name: 'Contracanción', level: 1, description: 'Usar actuación para dar TS contra efectos sónicos/de lenguaje.' },
      { name: 'Distracción', level: 1, description: 'Usar actuación para dar TS contra ilusiones visuales.' },
      { name: 'Fascinar', level: 1, description: 'Hipnotiza hasta nivel/3 criaturas con tu actuación.' },
      { name: 'Inspirar Competencia +2', level: 3, description: '+2 a tiradas de habilidad de aliados.' },
      { name: 'Inspiración Valiente +2', level: 5, description: '+2 a tiradas de ataque y contra efectos de miedo.' },
      { name: 'Sugerencia', level: 6, description: 'Puedes hacer una sugerencia a un objetivo fascinado.' },
      { name: 'Inspirar Competencia +4', level: 7, description: '+4 a tiradas de habilidad de aliados.' },
      { name: 'Inspiración Heroica +2', level: 9, description: '+2 a tiradas de ataque y daño.' },
      { name: 'Inspirar Grandeza', level: 9, description: 'Concede HP temporales y bonificadores de ataque.' },
      { name: 'Inspiración Valiente +3', level: 11, description: '+3 a tiradas de ataque y contra efectos de miedo.' },
      { name: 'Inspirar Competencia +6', level: 11, description: '+6 a tiradas de habilidad de aliados.' },
      { name: 'Actuación Magistral', level: 12, description: 'Puedes realizar actuaciones bárdicas más rápidamente.' },
      { name: 'Inspirar Competencia +8', level: 15, description: '+8 a tiradas de habilidad de aliados.' },
      { name: 'Inspiración Heroica +4', level: 15, description: '+4 a tiradas de ataque y daño.' },
      { name: 'Inspiración Valiente +4', level: 17, description: '+4 a tiradas de ataque y contra efectos de miedo.' },
      { name: 'Sugerencia en Masa', level: 18, description: 'Puede afectar a todos los objetivos fascinados simultáneamente.' },
      { name: 'Actuación Sin Fin', level: 20, description: 'Ya no tienes límite de rondas de actuación.' },
    ],
    alignment: ['No Legal'],
    description: 'Artistas mágicos que inspiran y encanta.',
    magicType: 'bardic',
    casterAbility: 'charisma',
    startingGoldDice: '3d6*10',
    proficiencies: { weapons: 'Armas simples, espada corta, espada larga, rapieras, sai, arco corto, látigo', armor: 'Armaduras ligeras (sin interferencia arcana)' },
    spellsPerDay: [
      [2, 1],               // lv 1
      [3, 2],               // lv 2
      [4, 3],               // lv 3
      [4, 3, 1],            // lv 4
      [4, 4, 2],            // lv 5
      [5, 4, 3],            // lv 6
      [5, 4, 3, 1],         // lv 7
      [5, 4, 4, 2],         // lv 8
      [5, 5, 4, 3],         // lv 9
      [5, 5, 4, 3, 1],      // lv 10
      [5, 5, 4, 4, 2],      // lv 11
      [5, 5, 5, 4, 3],      // lv 12
      [5, 5, 5, 4, 3, 1],   // lv 13
      [5, 5, 5, 4, 4, 2],   // lv 14
      [5, 5, 5, 5, 4, 3],   // lv 15
      [5, 5, 5, 5, 4, 3, 1], // lv 16
      [5, 5, 5, 5, 4, 4, 2], // lv 17
      [5, 5, 5, 5, 5, 4, 3], // lv 18
      [5, 5, 5, 5, 5, 5, 4], // lv 19
      [5, 5, 5, 5, 5, 5, 5], // lv 20
    ],
  },
  {
    id: 'cleric',
    source: 'core' as const,
    name: 'Clérigo',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 2,
    classSkills: ['appraise', 'craft', 'diplomacy', 'heal', 'knowledge_arcana', 'knowledge_history', 'knowledge_religion', 'linguistics', 'profession', 'sense_motive', 'spellcraft'],
    features: [
      { name: 'Canalizar Energía', level: 1, description: 'Puedes canalizar energía positiva o negativa.' },
      { name: 'Dominio', level: 1, description: 'Obtienes dominio sobre una escuela de magia.' },
      { name: 'Hechizos', level: 1, description: 'Puedes preparar y lanzar hechizos divinos.' },
    ],
    alignment: ['No Malvado'],
    description: 'Sacerdotes guerreros que channelizan poder divino.',
    magicType: 'divine',
    casterAbility: 'wisdom',
    startingGoldDice: '4d6*10',
    proficiencies: { weapons: 'Armas simples (+ arma de su deidad)', armor: 'Armaduras ligeras, medias y pesadas; escudos (no de torre)' },
    spellsPerDay: [
      [3, 1],               // lv 1
      [4, 2],               // lv 2
      [4, 2, 1],            // lv 3
      [4, 3, 2],            // lv 4
      [4, 3, 2, 1],         // lv 5
      [4, 3, 3, 2],         // lv 6
      [4, 4, 3, 2, 1],      // lv 7
      [4, 4, 3, 3, 2],      // lv 8
      [4, 4, 4, 3, 2, 1],   // lv 9
      [4, 4, 4, 3, 3, 2],   // lv 10
      [4, 4, 4, 4, 3, 2, 1], // lv 11
      [4, 4, 4, 4, 3, 3, 2], // lv 12
      [4, 4, 4, 4, 4, 3, 2, 1], // lv 13
      [4, 4, 4, 4, 4, 3, 3, 2], // lv 14
      [4, 4, 4, 4, 4, 4, 3, 2, 1], // lv 15
      [4, 4, 4, 4, 4, 4, 3, 3, 2], // lv 16
      [4, 4, 4, 4, 4, 4, 4, 3, 2, 1], // lv 17
      [4, 4, 4, 4, 4, 4, 4, 3, 3, 2], // lv 18
      [4, 4, 4, 4, 4, 4, 4, 4, 3, 3], // lv 19
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4], // lv 20
    ],
  },
  {
    id: 'druid',
    source: 'core' as const,
    name: 'Druida',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 4,
    classSkills: ['climb', 'craft', 'fly', 'handle_animal', 'heal', 'knowledge_geography', 'knowledge_nature', 'perception', 'profession', 'ride', 'spellcraft', 'survival', 'swim'],
    features: [
      { name: 'Vínculo Natural', level: 1, description: 'Elige compañero animal o dominio de naturaleza.' },
      { name: 'Sentido Natural', level: 1, description: '+1 a Supervivencia y Percepción.' },
      { name: 'Orisons', level: 1, description: 'Puedes preparar hechizos de nivel 0.' },
      { name: 'Empatía Salvaje', level: 1, description: 'Puedes mejorar actitud de animales como Diplomacia.' },
      { name: 'Paso por el Bosque', level: 2, description: 'Ignoras penalización por terreno difícil natural.' },
      { name: 'Paso sin Pista', level: 3, description: 'No puedes ser rastreado en exteriores.' },
      { name: 'Resiste el Atractivo de la Naturaleza', level: 4, description: '+4 a TS contra efectos de naturaleza.' },
      { name: 'Forma Salvaje (1/día)', level: 4, description: 'Puedes transformarte en animal 1 vez por día.' },
      { name: 'Forma Salvaje (2/día)', level: 6, description: 'Puedes transformarte en animal 2 veces por día.' },
      { name: 'Forma Salvaje (3/día)', level: 8, description: 'Puedes transformarte en animal 3 veces por día.' },
      { name: 'Inmunidad al Veneno', level: 9, description: 'Inmune a venenos naturales.' },
      { name: 'Forma Salvaje (4/día)', level: 10, description: 'Puedes transformarte en animal 4 veces por día.' },
      { name: 'Forma Salvaje (5/día)', level: 12, description: 'Puedes transformarte en animal 5 veces por día.' },
      { name: 'Mil Caras', level: 13, description: 'Puedes cambiar tu apariencia voluntariamente.' },
      { name: 'Forma Salvaje (6/día)', level: 14, description: 'Puedes transformarte en animal 6 veces por día.' },
      { name: 'Cuerpo Atemporal', level: 15, description: 'Ya no sufres penalizaciones por envejecimiento.' },
      { name: 'Forma Salvaje (7/día)', level: 16, description: 'Puedes transformarte en animal 7 veces por día.' },
      { name: 'Forma Salvaje (8/día)', level: 18, description: 'Puedes transformarte en animal 8 veces por día.' },
      { name: 'Forma Salvaje (a Voluntad)', level: 20, description: 'Puedes transformarte en animal sin límite.' },
    ],
    alignment: ['Neutral'],
    description: 'Protectors de la naturaleza con magia primitiva.',
    magicType: 'divine',
    casterAbility: 'wisdom',
    startingGoldDice: '2d6*10',
    proficiencies: { weapons: 'Garrote, daga, hoz, lanza, honda, bastón, jabalina y armas naturales', armor: 'Armaduras ligeras y medias no metálicas, escudo de madera' },
    spellsPerDay: [
      [3, 1],               // lv 1
      [4, 2],               // lv 2
      [4, 2, 1],            // lv 3
      [4, 3, 2],            // lv 4
      [4, 3, 2, 1],         // lv 5
      [4, 3, 3, 2],         // lv 6
      [4, 4, 3, 2, 1],      // lv 7
      [4, 4, 3, 3, 2],      // lv 8
      [4, 4, 4, 3, 2, 1],   // lv 9
      [4, 4, 4, 3, 3, 2],   // lv 10
      [4, 4, 4, 4, 3, 2, 1], // lv 11
      [4, 4, 4, 4, 3, 3, 2], // lv 12
      [4, 4, 4, 4, 4, 3, 2, 1], // lv 13
      [4, 4, 4, 4, 4, 3, 3, 2], // lv 14
      [4, 4, 4, 4, 4, 4, 3, 2, 1], // lv 15
      [4, 4, 4, 4, 4, 4, 3, 3, 2], // lv 16
      [4, 4, 4, 4, 4, 4, 4, 3, 2, 1], // lv 17
      [4, 4, 4, 4, 4, 4, 4, 3, 3, 2], // lv 18
      [4, 4, 4, 4, 4, 4, 4, 4, 3, 3], // lv 19
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4], // lv 20
    ],
  },
  {
    id: 'fighter',
    source: 'core' as const,
    name: 'Guerrero',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'poor',
    skillPointsPerLevel: 2,
    classSkills: ['climb', 'craft', 'handle_animal', 'intimidate', 'knowledge_dungeoneering', 'knowledge_engineering', 'profession', 'ride', 'survival', 'swim'],
    features: [
      { name: 'Hazaña de Combate', level: 1, description: 'Ganas una hazaña de combate.' },
      { name: 'Hazaña de Combate Adicional', level: 1, description: 'Ganas una segunda hazaña de combate.' },
      { name: 'Hazaña Extra', level: 2, description: 'Ganas una Hazaña de Combate adicional.' },
      { name: 'Valentía +1', level: 2, description: '+1 a TS contra efectos de miedo.' },
      { name: 'Entrenamiento de Armadura 1', level: 3, description: 'Reduce penalización de armadura y aumenta máx DES.' },
      { name: 'Hazaña de Combate', level: 4, description: 'Ganas una hazaña de combate.' },
      { name: 'Entrenamiento con Armas 1', level: 5, description: '+1 a ataque y daño con grupo de armas.' },
      { name: 'Hazaña Extra', level: 6, description: 'Ganas una Hazaña de Combate adicional.' },
      { name: 'Valentía +2', level: 6, description: '+2 a TS contra efectos de miedo.' },
      { name: 'Entrenamiento de Armadura 2', level: 7, description: 'Reduce penalización de armadura y aumenta máx DES.' },
      { name: 'Hazaña de Combate', level: 8, description: 'Ganas una hazaña de combate.' },
      { name: 'Entrenamiento con Armas 2', level: 9, description: '+2 a ataque y daño con grupo de armas.' },
      { name: 'Hazaña Extra', level: 10, description: 'Ganas una Hazaña de Combate adicional.' },
      { name: 'Valentía +3', level: 10, description: '+3 a TS contra efectos de miedo.' },
      { name: 'Entrenamiento de Armadura 3', level: 11, description: 'Reduce penalización de armadura y aumenta máx DES.' },
      { name: 'Hazaña de Combate', level: 12, description: 'Ganas una hazaña de combate.' },
      { name: 'Entrenamiento con Armas 3', level: 13, description: '+3 a ataque y daño con grupo de armas.' },
      { name: 'Hazaña Extra', level: 14, description: 'Ganas una Hazaña de Combate adicional.' },
      { name: 'Valentía +4', level: 14, description: '+4 a TS contra efectos de miedo.' },
      { name: 'Entrenamiento de Armadura 4', level: 15, description: 'Reduce penalización de armadura y aumenta máx DES.' },
      { name: 'Hazaña de Combate', level: 16, description: 'Ganas una hazaña de combate.' },
      { name: 'Entrenamiento con Armas 4', level: 17, description: '+4 a ataque y daño con grupo de armas.' },
      { name: 'Hazaña Extra', level: 18, description: 'Ganas una Hazaña de Combate adicional.' },
      { name: 'Valentía +5', level: 18, description: '+5 a TS contra efectos de miedo.' },
      { name: 'Dominio de la Armadura', level: 19, description: 'Sin penalización por armadura.' },
      { name: 'Obra Extra', level: 20, description: 'Ganas una acción adicional por día.' },
      { name: 'Dominio de Armas', level: 20, description: '+2 al multiplicador de crítico y confirma automáticamente.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Maestros del combate armado.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '5d6*10',
    proficiencies: { weapons: 'Todas las armas simples y marciales', armor: 'Todas las armaduras y escudos, incluido el de torre' },
  },
  {
    id: 'monk',
    source: 'core' as const,
    name: 'Monje',
    hitDie: 8,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'good',
    willSave: 'good',
    skillPointsPerLevel: 4,
    classSkills: ['acrobatics', 'climb', 'craft', 'escape_artist', 'intimidate', 'knowledge_history', 'knowledge_religion', 'perception', 'perform', 'profession', 'ride', 'sense_motive', 'stealth', 'swim'],
    features: [
      { name: 'Hazaña Extra', level: 1, description: 'Ganas una hazaña de monje.' },
      { name: 'Ráfaga de Golpes', level: 1, description: 'Puedes hacer ataques adicionales en un turno.' },
      { name: 'Puño Impresionante', level: 1, description: 'Tu entrenamiento te permite golpear mejor.' },
      { name: 'Golpe Desarmado', level: 1, description: 'Daño desarmado 1d6, no provoca AoO.' },
      { name: 'Obra Extra', level: 2, description: 'Ganas una acción adicional por día.' },
      { name: 'Evasión', level: 2, description: 'Con éxito en Reflejos, no sufres daño.' },
      { name: 'Movimiento Rápido', level: 3, description: '+10 pies a velocidad base.' },
      { name: 'Entrenamiento de Maniobras', level: 3, description: '+1 a CMB y CMD.' },
      { name: 'Mente Quieta', level: 3, description: '+2 a TS contra efectos de mente.' },
      { name: 'Ki Piscina (Mágica)', level: 4, description: 'Reserva de ki = nivel + mod SAB.' },
      { name: 'Bonificador de Armadura Natural +1', level: 4, description: '+1 CA sin armadura.' },
      { name: 'Caída Lenta 20 pies', level: 4, description: 'Reduce la caída 20 pies.' },
      { name: 'Salto de Altura', level: 5, description: 'Puedes saltar más alto.' },
      { name: 'Pureza del Cuerpo', level: 5, description: 'Inmune a enfermedades.' },
      { name: 'Obra Extra', level: 6, description: 'Ganas una acción adicional por día.' },
      { name: 'Caída Lenta 30 pies', level: 6, description: 'Reduce la caída 30 pies.' },
      { name: 'Ki Piscina (Hierro Frío/Plata)', level: 7, description: 'Ki puede ignorar daño.' },
      { name: 'Totalidad del Cuerpo', level: 7, description: '+2 a TS contra hechizos.' },
      { name: 'Bonificador de Armadura Natural +2', level: 8, description: '+2 CA sin armadura.' },
      { name: 'Caída Lenta 40 pies', level: 8, description: 'Reduce la caída 40 pies.' },
      { name: 'Evasión Mejorada', level: 9, description: 'Evasión funciona incluso contra efectos de área.' },
      { name: 'Hazaña Extra', level: 10, description: 'Ganas una acción adicional por día.' },
      { name: 'Ki Piscina (Legal)', level: 10, description: 'Ki puede otorgar efectos legales.' },
      { name: 'Caída Lenta 50 pies', level: 10, description: 'Reduce la caída 50 pies.' },
      { name: 'Cuerpo de Diamante', level: 11, description: 'Resistencia a damage físico.' },
      { name: 'Paso Abundante', level: 12, description: 'Puedes moverte a través de criaturas.' },
      { name: 'Bonificador de Armadura Natural +3', level: 12, description: '+3 CA sin armadura.' },
      { name: 'Caída Lenta 60 pies', level: 12, description: 'Reduce la caída 60 pies.' },
      { name: 'Alma de Diamante', level: 13, description: 'Resistencia a energía.' },
      { name: 'Obra Extra', level: 14, description: 'Ganas una acción adicional por día.' },
      { name: 'Caída Lenta 70 pies', level: 14, description: 'Reduce la caída 70 pies.' },
      { name: 'Palma Temblorosa', level: 15, description: 'Golpe que stunnea.' },
      { name: 'Ki Piscina (Adamantina)', level: 16, description: 'Ki imparable.' },
      { name: 'Bonificador de Armadura Natural +4', level: 16, description: '+4 CA sin armadura.' },
      { name: 'Caída Lenta 80 pies', level: 16, description: 'Reduce la caída 80 pies.' },
      { name: 'Cuerpo Atemporal', level: 17, description: 'No envejeces.' },
      { name: 'Lengua del Sol y la Luna', level: 17, description: 'Puedes entender todos los idiomas.' },
      { name: 'Obra Extra', level: 18, description: 'Ganas una acción adicional por día.' },
      { name: 'Caída Lenta 90 pies', level: 18, description: 'Reduce la caída 90 pies.' },
      { name: 'Cuerpo Vacío', level: 19, description: 'Golpes ignoran invisibilidad.' },
      { name: 'Yo Perfecto', level: 20, description: 'Inmune a venenos, enfermedades y envejecimiento.' },
      { name: 'Bonificador de Armadura Natural +5', level: 20, description: '+5 CA sin armadura.' },
      { name: 'Caída Lenta a Cualquier Distancia', level: 20, description: 'Inmune a daño por caída.' },
    ],
    alignment: ['Legal Neutral', 'Legal Bueno', 'Neutral', 'Caótico Bueno'],
    description: 'Artes marciales con poderes místicos.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '1d6*10',
    proficiencies: { weapons: 'Armas de monje (bastón, nunchaku, kama, sai, shuriken, siangham)', armor: 'Ninguna' },
  },
  {
    id: 'paladin',
    source: 'core' as const,
    name: 'Paladín',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 2,
    classSkills: ['craft', 'diplomacy', 'handle_animal', 'heal', 'knowledge_nobility', 'knowledge_religion', 'profession', 'ride', 'sense_motive', 'spellcraft'],
    features: [
      { name: 'Aura de Bien', level: 1, description: 'Emites un aura de bien fuerte.' },
      { name: 'Detectar Maldad', level: 1, description: 'Puedes detectar el mal a voluntad como acción de concentración.' },
      { name: 'Golpe del Paladín', level: 1, description: 'Gasta usos para añadir bono CAR a ataque/daño y HP temporales. Usos = 1 + nivel/2.' },
      { name: 'Imponer Manos', level: 2, description: 'Curas nivel×CAR/2 PV/día. Gasta la mitad de usos para dañar no-muertos.' },
      { name: 'Aura de Valentía', level: 3, description: 'Tú y aliados a 10 pies sois inmunes al miedo.' },
      { name: 'Salud Divina', level: 3, description: 'Inmune a todas las enfermedades, incluidas enfermedades sobrenaturales.' },
      { name: 'Misericordia', level: 3, description: 'Imponer Manos también elimina una condición negativa.' },
      { name: 'Canal de Energía Positiva', level: 4, description: 'Usa imponer manos para canalizar energía positiva.' },
      { name: 'Magia Divina', level: 4, description: 'Puedes preparar y lanzar hechizos divinos de la lista del paladín.' },
      { name: 'Montura Divina', level: 5, description: 'Puedes invocar una montura mágica como compañero.' },
      { name: 'Misericordia', level: 6, description: 'Imponer Manos también elimina una condición negativa.' },
      { name: 'Aura de Resolución', level: 8, description: 'Tú y aliados a 10 pies sois inmunes a encantamientos mágicos.' },
      { name: 'Misericordia', level: 9, description: 'Imponer Manos también elimina una condición negativa.' },
      { name: 'Aura de Justicia', level: 11, description: 'Puedes gastar 2 usos para que aliados usen tu Golpe del Paladín.' },
      { name: 'Misericordia', level: 12, description: 'Imponer Manos también elimina una condición negativa.' },
      { name: 'Aura de Fe', level: 14, description: 'Tus armas se consideran Buenas para penetrar RI.' },
      { name: 'Misericordia', level: 15, description: 'Imponer Manos también elimina una condición negativa.' },
      { name: 'Aura de Rectitud', level: 17, description: 'DR 5/Malvado y aliados a 10 pies obtienen DR 5/Malvado.' },
      { name: 'Misericordia', level: 18, description: 'Imponer Manos también elimina una condición negativa.' },
      { name: 'Campeón Sagrado', level: 20, description: 'Cuando activas Golpe del Paladín, emites un campo de bien sagrado.' },
    ],
    alignment: ['Legal Bueno'],
    description: 'Caballeros sagrados que combaten el mal.',
    magicType: 'divine',
    casterAbility: 'wisdom',
    startingGoldDice: '5d6*10',
    proficiencies: { weapons: 'Todas las armas simples y marciales', armor: 'Todas las armaduras y escudos (no de torre)' },
    spellsPerDay: [
      [],              // lv 1
      [],              // lv 2
      [],              // lv 3
      [1],             // lv 4
      [1],             // lv 5
      [1],             // lv 6
      [1, 1],          // lv 7
      [1, 1],          // lv 8
      [2, 1],          // lv 9
      [2, 1, 1],       // lv 10
      [2, 1, 1],       // lv 11
      [2, 1, 1, 1],    // lv 12
      [3, 2, 1, 1],    // lv 13
      [3, 2, 1, 1],    // lv 14
      [3, 2, 1, 1],    // lv 15
      [3, 2, 2, 1],    // lv 16
      [4, 3, 2, 1],    // lv 17
      [4, 3, 2, 1],    // lv 18
      [4, 3, 3, 2],    // lv 19
      [4, 3, 3, 2],    // lv 20
    ],
  },
  {
    id: 'ranger',
    source: 'core' as const,
    name: 'Explorador',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'good',
    willSave: 'poor',
    skillPointsPerLevel: 6,
    classSkills: ['climb', 'craft', 'disguise', 'fly', 'handle_animal', 'heal', 'knowledge_dungeoneering', 'knowledge_geography', 'knowledge_nature', 'perception', 'profession', 'ride', 'sense_motive', 'spellcraft', 'stealth', 'survival', 'swim', 'use_magic_device'],
    features: [
      { name: 'Enemigo Favorito +2', level: 1, description: '+2 ataque, daño, Conocimiento, Percepción, Supervivencia vs tipo elegido.' },
      { name: 'Rastrear', level: 1, description: '+1/2 nivel a Supervivencia para rastrear.' },
      { name: 'Empatía Salvaje', level: 1, description: 'Puede mejorar actitud de animales como Diplomacia.' },
      { name: 'Combate en el Terreno', level: 2, description: '+2 iniciativa y a Percepción, Furtividad, Supervivencia en terreno favorito.' },
      { name: 'Estilo de Combate', level: 2, description: 'Ganas un talento de combate según estilo (arco o dos armas), ignorando prerrequisitos.' },
      { name: 'Terreno Favorito +2', level: 3, description: '+2 Iniciativa y bonificadores en terreno elegido.' },
      { name: 'Enemigo Favorito +4', level: 5, description: '+4 ataque, daño, Conocimiento, Percepción, Supervivencia vs tipo elegido.' },
      { name: 'Compañero Animal', level: 4, description: 'Obtienes un compañero animal leal con nivel efectivo nivel−3.' },
      { name: 'Magia del Explorador', level: 4, description: 'Puedes preparar y lanzar hechizos divinos de la lista del explorador.' },
      { name: 'Terreno Favorito +4', level: 8, description: '+4 Iniciativa y bonificadores en terreno elegido.' },
      { name: 'Evasión', level: 9, description: 'Con éxito en Reflejos, no sufres daño.' },
      { name: 'Enemigo Favorito +6', level: 9, description: '+6 ataque, daño, Conocimiento, Percepción, Supervivencia vs tipo elegido.' },
      { name: 'Enemigo Favorito +8', level: 13, description: '+8 ataque, daño, Conocimiento, Percepción, Supervivencia vs tipo elegido.' },
      { name: 'Terreno Favorito +6', level: 13, description: '+6 Iniciativa y bonificadores en terreno elegido.' },
      { name: 'Enemigo Favorito +10', level: 17, description: '+10 ataque, daño, Conocimiento, Percepción, Supervivencia vs tipo elegido.' },
      { name: 'Ocultarse a Simple Vista', level: 17, description: 'Puedes usar Furtividad incluso mientras te observan.' },
      { name: 'Terreno Favorito +8', level: 18, description: '+8 Iniciativa y bonificadores en terreno elegido.' },
    ],
    alignment: ['No Malvado'],
    description: 'Cazadores expertos que patrullan los territorios.',
    magicType: 'divine',
    casterAbility: 'wisdom',
    startingGoldDice: '5d6*10',
    proficiencies: { weapons: 'Todas las armas simples y marciales', armor: 'Armaduras ligeras y medias, escudos (no de torre)' },
    spellsPerDay: [
      [],              // lv 1
      [],              // lv 2
      [],              // lv 3
      [1],             // lv 4
      [1],             // lv 5
      [1],             // lv 6
      [1, 1],          // lv 7
      [1, 1],          // lv 8
      [2, 1],          // lv 9
      [2, 1, 1],       // lv 10
      [2, 1, 1],       // lv 11
      [2, 1, 1, 1],    // lv 12
      [3, 2, 1, 1],    // lv 13
      [3, 2, 1, 1],    // lv 14
      [3, 2, 1, 1],    // lv 15
      [3, 2, 2, 1],    // lv 16
      [4, 3, 2, 1],    // lv 17
      [4, 3, 2, 1],    // lv 18
      [4, 3, 3, 2],    // lv 19
      [4, 3, 3, 2],    // lv 20
    ],
  },
  {
    id: 'rogue',
    source: 'core' as const,
    name: 'Pícaro',
    hitDie: 6,
    baseAttackBonus: 'poor',
    fortitudeSave: 'poor',
    reflexSave: 'good',
    willSave: 'poor',
    skillPointsPerLevel: 8,
    classSkills: ['acrobatics', 'appraise', 'bluff', 'climb', 'craft', 'diplomacy', 'disable_device', 'disguise', 'escape_artist', 'intimidate', 'knowledge_dungeoneering', 'knowledge_local', 'linguistics', 'perception', 'perform', 'profession', 'sense_motive', 'sleight_of_hand', 'spellcraft', 'stealth', 'swim', 'use_magic_device'],
    features: [
      { name: 'Ataque Furtivo +1d6', level: 1, description: '+1d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Búsqueda de Trampas', level: 1, description: 'Buscar trampas con tirada de Percepción. Activa Disable Device.' },
      { name: 'Evasión', level: 2, description: 'Con éxito en Reflejos, no sufres daño (falla = daño medio).' },
      { name: 'Talento de Pícaro', level: 2, description: 'Ganas un talento de pícaro menor.' },
      { name: 'Ataque Furtivo +2d6', level: 3, description: '+2d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Sentido de Trampa +1', level: 3, description: '+1 a Reflejos y CA contra trampas.' },
      { name: 'Movimiento Sigiloso', level: 4, description: 'No puedes ser flanqueado excepto por luchadores con más de 4 niveles.' },
      { name: 'Ataque Furtivo +3d6', level: 5, description: '+3d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Talento de Pícaro', level: 6, description: 'Ganas un talento de pícaro menor.' },
      { name: 'Sentido de Trampa +2', level: 6, description: '+2 a Reflejos y CA contra trampas.' },
      { name: 'Ataque Furtivo +4d6', level: 7, description: '+4d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Evasión Mejorada', level: 8, description: 'Con fallo en Reflejos, sólo recibes la mitad del daño.' },
      { name: 'Oportunista', level: 8, description: 'Una vez por ronda, puedes hacer un AoO contra un objetivo atacado por un aliado.' },
      { name: 'Talento de Pícaro', level: 8, description: 'Ganas un talento de pícaro menor.' },
      { name: 'Ataque Furtivo +5d6', level: 9, description: '+5d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Sentido de Trampa +3', level: 9, description: '+3 a Reflejos y CA contra trampas.' },
      { name: 'Talentos Avanzados', level: 10, description: 'Puedes elegir talentos avanzados de pícaro en lugar de menores.' },
      { name: 'Talento de Pícaro', level: 10, description: 'Ganas un talento de pícaro.' },
      { name: 'Ataque Furtivo +6d6', level: 11, description: '+6d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Talento de Pícaro', level: 12, description: 'Ganas un talento de pícaro.' },
      { name: 'Sentido de Trampa +4', level: 12, description: '+4 a Reflejos y CA contra trampas.' },
      { name: 'Ataque Furtivo +7d6', level: 13, description: '+7d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Talento de Pícaro', level: 14, description: 'Ganas un talento de pícaro.' },
      { name: 'Ocultarse a Simple Vista', level: 14, description: 'Puedes usar Furtividad mientras te observan.' },
      { name: 'Sentido del Peligro', level: 14, description: 'No pierdes el bono a DES en la primera ronda de combate.' },
      { name: 'Ataque Furtivo +8d6', level: 15, description: '+8d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Sentido de Trampa +5', level: 15, description: '+5 a Reflejos y CA contra trampas.' },
      { name: 'Talento de Pícaro', level: 16, description: 'Ganas un talento de pícaro.' },
      { name: 'Ataque Furtivo +9d6', level: 17, description: '+9d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Talento de Pícaro', level: 18, description: 'Ganas un talento de pícaro.' },
      { name: 'Sentido de Trampa +6', level: 18, description: '+6 a Reflejos y CA contra trampas.' },
      { name: 'Ataque Furtivo +10d6', level: 19, description: '+10d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Talento de Pícaro', level: 20, description: 'Ganas un talento de pícaro.' },
      { name: 'Huelga Maestra', level: 20, description: 'Tu ataque furtivo puede aplicarse a criaturas inmunes a críticos.' },
    ],
    alignment: ['No Legal'],
    description: 'Especialistas en sigilo, trampas y ataques críticos.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '4d6*10',
    proficiencies: { weapons: 'Armas simples, ballesta de mano, espada corta, sai', armor: 'Armaduras ligeras' },
  },
  {
    id: 'sorcerer',
    source: 'core' as const,
    name: 'Hechicero',
    hitDie: 6,
    baseAttackBonus: 'poor',
    fortitudeSave: 'poor',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 2,
    classSkills: ['appraise', 'bluff', 'craft', 'fly', 'intimidate', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_local', 'knowledge_planes', 'profession', 'spellcraft', 'use_magic_device'],
    features: [
      { name: 'Linaje de Sangre', level: 1, description: 'Tienes un origen mágico especial.' },
      { name: 'Hechizos', level: 1, description: 'Lanzas hechizos innatos.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Lanzadores de hechizos innatos con poder mágico.',
    magicType: 'arcane',
    casterAbility: 'charisma',
    startingGoldDice: '2d6*10',
    proficiencies: { weapons: 'Armas simples', armor: 'Ninguna' },
  },
  {
    id: 'wizard',
    source: 'core' as const,
    name: 'Mago',
    hitDie: 6,
    baseAttackBonus: 'poor',
    fortitudeSave: 'poor',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 2,
    classSkills: ['appraise', 'craft', 'fly', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_engineering', 'knowledge_geography', 'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_nobility', 'knowledge_planes', 'knowledge_religion', 'linguistics', 'profession', 'spellcraft', 'use_magic_device'],
    features: [
      { name: 'Arcane Bond', level: 1, description: 'Estás vinculado a un objeto o familiar mágica.' },
      { name: 'Escuela Arcana', level: 1, description: 'Te especializas en una escuela de magia (Abjuración, Conjuración, Encantamiento, Ilusión, Nigromancia, Transmutación, Universal).' },
      { name: 'Cantrips', level: 1, description: 'Puedes lanzar hechizos de nivel 0 a voluntad.' },
      { name: 'Scribe Scroll', level: 1, description: 'Puedes crear pergaminos de hechizos.' },
      { name: 'Hechizo de Grimorio', level: 3, description: 'Puedes copiar hechizos adicionales de pergaminos y otros grimorios.' },
      { name: 'Talento de Bonus', level: 5, description: 'Ganas un talento de mago adicional.' },
      { name: 'Arma de Mago', level: 7, description: 'Puedes usar un tipo de arma marcial.' },
      { name: 'Talento de Bonus', level: 10, description: 'Ganas un talento de mago adicional.' },
      { name: 'Grimorio Mejorado', level: 10, description: 'Tu grimorio gana protecciones mágicas.' },
      { name: 'Talento de Bonus', level: 15, description: 'Ganas un talento de mago adicional.' },
      { name: 'Maestría Arcana', level: 15, description: 'Reduces el coste de componentes en hechizos de tu escuela.' },
      { name: 'Talento de Bonus', level: 20, description: 'Ganas un talento de mago adicional.' },
      { name: 'Gran Maestría Arcana', level: 20, description: 'Tus hechizos de escuela ignoran resistencia a la magia.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Estudiosos de la magia que preparan hechizos.',
    magicType: 'arcane',
    casterAbility: 'intelligence',
    startingGoldDice: '2d6*10',
    proficiencies: { weapons: 'Bastón, daga, ballesta ligera y pesada', armor: 'Ninguna' },
    // Pathfinder 1e Wizard spells per day (levels 0-9, index = char level - 1)
    spellsPerDay: [
      [3, 1],               // lv 1
      [4, 2],               // lv 2
      [4, 2, 1],             // lv 3
      [4, 3, 2],             // lv 4
      [4, 3, 2, 1],           // lv 5
      [4, 3, 3, 2],           // lv 6
      [4, 4, 3, 2, 1],         // lv 7
      [4, 4, 3, 3, 2],         // lv 8
      [4, 4, 4, 3, 2, 1],       // lv 9
      [4, 4, 4, 3, 3, 2],       // lv 10
      [4, 4, 4, 4, 3, 2, 1],     // lv 11
      [4, 4, 4, 4, 3, 3, 2],     // lv 12
      [4, 4, 4, 4, 4, 3, 2, 1],   // lv 13
      [4, 4, 4, 4, 4, 3, 3, 2],   // lv 14
      [4, 4, 4, 4, 4, 4, 3, 2, 1], // lv 15
      [4, 4, 4, 4, 4, 4, 3, 3, 2], // lv 16
      [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],// lv 17
      [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],// lv 18
      [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],// lv 19
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],// lv 20
    ],
  },
  // ── APG Base Classes ──
  {
    id: 'alchemist',
    source: 'apg' as const,
    name: 'Alquimista',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'good',
    reflexSave: 'good',
    willSave: 'poor',
    skillPointsPerLevel: 4,
    classSkills: ['appraise', 'craft', 'disable_device', 'fly', 'heal', 'knowledge_arcana', 'knowledge_nature', 'perception', 'profession', 'sleight_of_hand', 'spellcraft', 'survival', 'use_magic_device'],
    features: [
      { name: 'Alquimia', level: 1, description: 'Puedes crear pociones, extractos y bombas.' },
      { name: 'Bomba 1d6', level: 1, description: 'Creas bombas explosivas que inflijen daño de fuego.' },
      { name: 'Preparar Poción', level: 1, description: 'Puedes preparar pociones.' },
      { name: 'Mutágeno', level: 1, description: 'Bebes una mezcla que mejora tu físico a costa de tu mente.' },
      { name: 'Tirar Cualquier Cosa', level: 1, description: 'Puedes lanzar objetos a distancia.' },
      { name: 'Descubrimiento', level: 2, description: 'Aprendes un descubrimiento alquímico especial.' },
      { name: 'Resistencia al Veneno +2', level: 2, description: '+2 a TS contra venenos.' },
      { name: 'Uso de Veneno', level: 2, description: 'Puedes usar venenos.' },
      { name: 'Bomba 2d6', level: 3, description: 'Tus bombas inflict 2d6 daño.' },
      { name: 'Alquimia Rápida', level: 3, description: 'Puedes crear extractos más rápido.' },
      { name: 'Descubrimiento', level: 4, description: 'Aprendes un descubrimiento alquímico.' },
      { name: 'Bomba 3d6', level: 5, description: 'Tus bombas inflict 3d6 daño.' },
      { name: 'Resistencia al Veneno +4', level: 5, description: '+4 a TS contra venenos.' },
      { name: 'Descubrimiento', level: 6, description: 'Aprendes un descubrimiento alquímico.' },
      { name: 'Envenenamiento Rápido', level: 6, description: 'Puedes aplicar veneno rápidamente.' },
      { name: 'Bomba 4d6', level: 7, description: 'Tus bombas inflict 4d6 daño.' },
      { name: 'Descubrimiento', level: 8, description: 'Aprendes un descubrimiento alquímico.' },
      { name: 'Resistencia al Veneno +6', level: 8, description: '+6 a TS contra venenos.' },
      { name: 'Bomba 5d6', level: 9, description: 'Tus bombas inflict 5d6 daño.' },
      { name: 'Descubrimiento', level: 10, description: 'Aprendes un descubrimiento alquímico.' },
      { name: 'Inmunidad al Veneno', level: 10, description: 'Eres inmune a venenos.' },
      { name: 'Bomba 6d6', level: 11, description: 'Tus bombas inflict 6d6 daño.' },
      { name: 'Descubrimiento', level: 12, description: 'Aprendes un descubrimiento alquímico.' },
      { name: 'Bomba 7d6', level: 13, description: 'Tus bombas inflict 7d6 daño.' },
      { name: 'Descubrimiento', level: 14, description: 'Aprendes un descubrimiento alquímico.' },
      { name: 'Mutágeno Persistente', level: 14, description: 'Tu mutágeno dura más tiempo.' },
      { name: 'Bomba 8d6', level: 15, description: 'Tus bombas inflict 8d6 daño.' },
      { name: 'Descubrimiento', level: 16, description: 'Aprendes un descubrimiento alquímico.' },
      { name: 'Bomba 9d6', level: 17, description: 'Tus bombas inflict 9d6 daño.' },
      { name: 'Descubrimiento', level: 18, description: 'Aprendes un descubrimiento alquímico.' },
      { name: 'Alquimia Instantánea', level: 18, description: 'Puedes crear extractos como acción rápida.' },
      { name: 'Bomba 10d6', level: 19, description: 'Tus bombas inflict 10d6 daño.' },
      { name: 'Gran Descubrimiento', level: 20, description: 'Ganas un descubrimiento mayor.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Maestros de la alquimia que crean pociones, bombas y mutágenos.',
    magicType: 'alchemist',
    casterAbility: 'intelligence',
    startingGoldDice: '3d6*10',
    proficiencies: { weapons: 'Armas simples, bombas', armor: 'Armaduras ligeras' },
    spellsPerDay: [
      [1],               // lv 1
      [2],               // lv 2
      [3],               // lv 3
      [3, 1],             // lv 4
      [4, 2],             // lv 5
      [4, 3],             // lv 6
      [4, 3, 1],           // lv 7
      [4, 4, 2],           // lv 8
      [5, 4, 3],           // lv 9
      [5, 4, 3, 1],         // lv 10
      [5, 4, 4, 2],         // lv 11
      [5, 5, 4, 3],         // lv 12
      [5, 5, 4, 3, 1],       // lv 13
      [5, 5, 4, 4, 2],       // lv 14
      [5, 5, 5, 4, 3],       // lv 15
      [5, 5, 5, 4, 3, 1],     // lv 16
      [5, 5, 5, 4, 4, 2],     // lv 17
      [5, 5, 5, 5, 4, 3],     // lv 18
      [5, 5, 5, 5, 5, 4],     // lv 19
      [5, 5, 5, 5, 5, 5],     // lv 20
    ],
  },
  {
    id: 'oracle',
    source: 'apg' as const,
    name: 'Oráculo',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'poor',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 4,
    classSkills: ['craft', 'diplomacy', 'heal', 'knowledge_history', 'knowledge_planes', 'knowledge_religion', 'profession', 'sense_motive', 'spellcraft'],
    features: [
      { name: 'Misterio', level: 1, description: 'Eliges un misterio divino que define tus poderes.' },
      { name: 'Maldición del Oráculo', level: 1, description: 'Tu vínculo con los dioses viene con una debilidad permanente.' },
      { name: 'Orisons', level: 1, description: 'Puedes preparar hechizos de nivel 0.' },
      { name: 'Revelación', level: 1, description: 'Ganas una revelación del misterio elegido.' },
      { name: 'Hechizo Misterioso', level: 2, description: 'Ganas un hechizo del misterio.' },
      { name: 'Revelación', level: 3, description: 'Ganas una revelación adicional.' },
      { name: 'Hechizo Misterioso', level: 4, description: 'Ganas un hechizo del misterio.' },
      { name: 'Hechizo Misterioso', level: 6, description: 'Ganas un hechizo del misterio.' },
      { name: 'Revelación', level: 7, description: 'Ganas una revelación.' },
      { name: 'Hechizo Misterioso', level: 8, description: 'Ganas un hechizo del misterio.' },
      { name: 'Hechizo Misterioso', level: 10, description: 'Ganas un hechizo del misterio.' },
      { name: 'Revelación', level: 11, description: 'Ganas una revelación.' },
      { name: 'Hechizo Misterioso', level: 12, description: 'Ganas un hechizo del misterio.' },
      { name: 'Hechizo Misterioso', level: 14, description: 'Ganas un hechizo del misterio.' },
      { name: 'Revelación', level: 15, description: 'Ganas una revelación.' },
      { name: 'Hechizo Misterioso', level: 16, description: 'Ganas un hechizo del misterio.' },
      { name: 'Hechizo Misterioso', level: 18, description: 'Ganas un hechizo del misterio.' },
      { name: 'Revelación', level: 19, description: 'Ganas una revelación.' },
      { name: 'Revelación Final', level: 20, description: 'La revelación definitiva transforma tu ser.' },
    ],
    spellsPerDay: [
      [3, 1],               // lv 1
      [4, 2],               // lv 2
      [5, 3],               // lv 3
      [6, 3, 1],            // lv 4
      [6, 4, 2],            // lv 5
      [6, 5, 3],            // lv 6
      [6, 6, 4],            // lv 7
      [6, 6, 5, 3],         // lv 8
      [6, 6, 6, 4],         // lv 9
      [6, 6, 6, 5, 3],      // lv 10
      [6, 6, 6, 6, 4],      // lv 11
      [6, 6, 6, 6, 5, 3],   // lv 12
      [6, 6, 6, 6, 6, 4],   // lv 13
      [6, 6, 6, 6, 6, 5, 3], // lv 14
      [6, 6, 6, 6, 6, 6, 4], // lv 15
      [6, 6, 6, 6, 6, 6, 5, 3], // lv 16
      [6, 6, 6, 6, 6, 6, 6, 4], // lv 17
      [6, 6, 6, 6, 6, 6, 6, 5, 3], // lv 18
      [6, 6, 6, 6, 6, 6, 6, 6, 4], // lv 19
      [6, 6, 6, 6, 6, 6, 6, 6, 6], // lv 20
    ],
    alignment: ['Cualquiera'],
    description: 'Canalizadores de poder divino guiados por una maldición y un misterio.',
    magicType: 'divine',
    casterAbility: 'charisma',
    startingGoldDice: '3d6*10',
    proficiencies: { weapons: 'Armas simples', armor: 'Armaduras ligeras y medias, escudos (no de torre)' },
  },
  {
    id: 'inquisitor',
    source: 'apg' as const,
    name: 'Inquisidor',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 6,
    classSkills: ['bluff', 'craft', 'diplomacy', 'disguise', 'heal', 'intimidate', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_local', 'knowledge_nature', 'knowledge_planes', 'knowledge_religion', 'perception', 'profession', 'ride', 'sense_motive', 'spellcraft', 'stealth', 'survival', 'use_magic_device'],
    features: [
      { name: 'Dominio', level: 1, description: 'Ganas un dominio divino de tu deidad.' },
      { name: 'Juicio 1/día', level: 1, description: 'Puedes proclamar juicio sobre un enemigo.' },
      { name: 'Tradición de Monstruos', level: 1, description: '+2 a Conocimiento para identificar criaturas.' },
      { name: 'Orisons', level: 1, description: 'Puedes preparar hechizos de nivel 0.' },
      { name: 'Mirada Severa', level: 1, description: 'Intimida a criaturas.' },
      { name: 'Iniciativa Astuta', level: 2, description: '+2 a Iniciativa.' },
      { name: 'Detectar Alineación', level: 2, description: 'Puedes detectar alineación.' },
      { name: 'Pista', level: 2, description: 'Puedes seguir rastros.' },
      { name: 'Tácticas en Solitario', level: 3, description: 'Puedes trabajar solo.' },
      { name: 'Hazaña de Trabajo en Equipo', level: 3, description: 'Ganas una hazaña de trabajo en equipo.' },
      { name: 'Sentencia 2/día', level: 4, description: 'Puedes pronunciar 2 sentencias.' },
      { name: 'Bane', level: 5, description: 'Puedes cargar armas con poder sagrado.' },
      { name: 'Discernir Mentiras', level: 5, description: 'Puedes detectar mentiras.' },
      { name: 'Trabajo en Equipo Feat', level: 6, description: 'Ganas un talento de trabajo en equipo.' },
      { name: 'Sentencia 3/día', level: 7, description: 'Puedes pronunciar 3 sentencias.' },
      { name: 'Segunda Sentencia', level: 8, description: 'Puedes tener dos sentencias activas.' },
      { name: 'Trabajo en Equipo Feat', level: 9, description: 'Ganas un talento de trabajo en equipo.' },
      { name: 'Sentencia 4/día', level: 10, description: 'Puedes pronunciar 4 sentencias.' },
      { name: 'Leal', level: 11, description: 'Eres leal a tu causa.' },
      { name: 'Mayor Pesadilla', level: 12, description: 'Tu PESadilla es más poderosa.' },
      { name: 'Hazaña de Trabajo en Equipo', level: 12, description: 'Ganas un talento de trabajo en equipo.' },
      { name: 'Sentencia 5/día', level: 13, description: 'Puedes pronunciar 5 sentencias.' },
      { name: 'Explotar la Debilidad', level: 14, description: 'Puedes explotar debilidades del enemigo.' },
      { name: 'Trabajo en Equipo Feat', level: 15, description: 'Ganas un talento de trabajo en equipo.' },
      { name: 'Sentencia 6/día', level: 16, description: 'Puedes pronunciar 6 sentencias.' },
      { name: 'Tercera Sentencia', level: 16, description: 'Puedes tener tres sentencias activas.' },
      { name: 'Asesino', level: 17, description: 'Eres un asesino efectivo.' },
      { name: 'Trabajo en Equipo Feat', level: 18, description: 'Ganas un talento de trabajo en equipo.' },
      { name: 'Sentencia 7/día', level: 19, description: 'Puedes pronunciar 7 sentencias.' },
      { name: 'Juicio Verdadero', level: 20, description: 'Tu juicio es absoluto.' },
    ],
    alignment: ['Cualquiera (misma deidad)'],
    description: 'Cazadores de herejes que combinan magia divina y habilidades de combate.',
    magicType: 'divine',
    casterAbility: 'wisdom',
    startingGoldDice: '4d6*10',
    proficiencies: { weapons: 'Armas simples y marciales', armor: 'Armaduras ligeras y medias, escudos (no de torre)' },
    spellsPerDay: [
      [1],             // lv 1
      [2],             // lv 2
      [3],             // lv 3
      [3, 1],           // lv 4
      [4, 2],           // lv 5
      [4, 3],           // lv 6
      [4, 3, 1],         // lv 7
      [4, 4, 2],         // lv 8
      [5, 4, 3],         // lv 9
      [5, 4, 3, 1],       // lv 10
      [5, 4, 4, 2],       // lv 11
      [5, 5, 4, 3],       // lv 12
      [5, 5, 4, 3, 1],     // lv 13
      [5, 5, 4, 4, 2],     // lv 14
      [5, 5, 5, 4, 3],     // lv 15
      [5, 5, 5, 4, 3, 1],   // lv 16
      [5, 5, 5, 4, 4, 2],   // lv 17
      [5, 5, 5, 5, 4, 3],   // lv 18
      [5, 5, 5, 5, 5, 4],   // lv 19
      [5, 5, 5, 5, 5, 5],   // lv 20
    ],
    spellsKnown: [
      [4, 2],           // lv 1
      [5, 3],           // lv 2
      [6, 4],           // lv 3
      [6, 4, 2],        // lv 4
      [6, 4, 3],        // lv 5
      [6, 4, 4],        // lv 6
      [6, 5, 4, 2],     // lv 7
      [6, 5, 4, 3],     // lv 8
      [6, 5, 4, 4],     // lv 9
      [6, 5, 5, 4, 2],  // lv 10
      [6, 6, 5, 4, 3],  // lv 11
      [6, 6, 5, 4, 4],  // lv 12
      [6, 6, 5, 5, 4, 2], // lv 13
      [6, 6, 6, 5, 4, 3], // lv 14
      [6, 6, 6, 5, 4, 4], // lv 15
      [6, 6, 6, 5, 5, 4, 2], // lv 16
      [6, 6, 6, 6, 5, 4, 3], // lv 17
      [6, 6, 6, 6, 5, 4, 4], // lv 18
      [6, 6, 6, 6, 5, 5, 4], // lv 19
      [6, 6, 6, 6, 6, 5, 5], // lv 20
    ],
  },
  {
    id: 'witch',
    source: 'apg' as const,
    name: 'Bruja',
    hitDie: 6,
    baseAttackBonus: 'poor',
    fortitudeSave: 'poor',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 2,
    classSkills: ['craft', 'fly', 'heal', 'intimidate', 'knowledge_arcana', 'knowledge_history', 'knowledge_nature', 'knowledge_planes', 'profession', 'spellcraft', 'use_magic_device'],
    features: [
      { name: 'Familiar', level: 1, description: 'Obtienes un familiar especial que almacena tus hechizos.' },
      { name: 'Cantrips', level: 1, description: 'Puedes lanzar hechizos de nivel 0 a voluntad.' },
      { name: 'Hex', level: 1, description: 'Ganas un hex: poder de bruja que afecta a los enemigos.' },
      { name: 'Maldición de Bruja', level: 1, description: 'Puedes maldecir a los enemigos con efectos debilitantes.' },
      { name: 'Patrono', level: 1, description: 'Pides hechizos a un patrono misterioso.' },
      { name: 'Hex', level: 2, description: 'Ganas un hex adicional.' },
      { name: 'Hex', level: 4, description: 'Ganas un hex adicional.' },
      { name: 'Hex', level: 6, description: 'Ganas un hex adicional.' },
      { name: 'Hex', level: 8, description: 'Ganas un hex adicional.' },
      { name: 'Gran Hex', level: 10, description: 'Accedes a hexes de mayor poder.' },
      { name: 'Hex Mayor', level: 10, description: 'Ganas un hex de nivel alto.' },
      { name: 'Hex', level: 12, description: 'Ganas un hex adicional.' },
      { name: 'Hex', level: 14, description: 'Ganas un hex adicional.' },
      { name: 'Hex', level: 16, description: 'Ganas un hex adicional.' },
      { name: 'Gran Hexágono', level: 18, description: 'Accedes a los hexes más poderosos.' },
      { name: 'Hex', level: 20, description: 'Ganas un hex adicional.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Lanzadoras arcanas conectadas a misteriosos patrones a través de familiares.',
    magicType: 'arcane',
    casterAbility: 'intelligence',
    startingGoldDice: '2d6*10',
    proficiencies: { weapons: 'Armas simples', armor: 'Ninguna' },
    spellsPerDay: [
      [3, 1],               // lv 1
      [4, 2],               // lv 2
      [4, 2, 1],             // lv 3
      [4, 3, 2],             // lv 4
      [4, 3, 2, 1],           // lv 5
      [4, 3, 3, 2],           // lv 6
      [4, 4, 3, 2, 1],         // lv 7
      [4, 4, 3, 3, 2],         // lv 8
      [4, 4, 4, 3, 2, 1],       // lv 9
      [4, 4, 4, 3, 3, 2],       // lv 10
      [4, 4, 4, 4, 3, 2, 1],     // lv 11
      [4, 4, 4, 4, 3, 3, 2],     // lv 12
      [4, 4, 4, 4, 4, 3, 2, 1],   // lv 13
      [4, 4, 4, 4, 4, 3, 3, 2],   // lv 14
      [4, 4, 4, 4, 4, 4, 3, 2, 1], // lv 15
      [4, 4, 4, 4, 4, 4, 3, 3, 2], // lv 16
      [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],// lv 17
      [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],// lv 18
      [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],// lv 19
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],// lv 20
    ],
  },
  {
    id: 'cavalier',
    source: 'apg' as const,
    name: 'Caballero',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'poor',
    skillPointsPerLevel: 4,
    classSkills: ['bluff', 'climb', 'craft', 'diplomacy', 'handle_animal', 'intimidate', 'profession', 'ride', 'sense_motive', 'swim'],
    features: [
      { name: 'Desafío 1/día', level: 1, description: 'Desafías a un enemigo: +2 a ataques y +2 a daño.' },
      { name: 'Montaje', level: 1, description: 'Obtienes una montura especial como compañero permanente.' },
      { name: 'Pedido', level: 1, description: 'Juras lealtad a una orden caballeresca.' },
      { name: 'Táctico', level: 1, description: 'Ganas habilidades tácticas.' },
      { name: 'Capacidad de Pedido', level: 2, description: 'Puedes dar órdenes a tus aliados.' },
      { name: 'El Cargo de Cavalier', level: 3, description: 'Tu cargo te otorga poderes especiales.' },
      { name: 'Desafío 2/día', level: 4, description: 'Desafías a un enemigo: +2 a ataques y +2 a daño.' },
      { name: 'Formador Experto', level: 4, description: 'Puedes entrenar monturas.' },
      { name: 'Bandera', level: 5, description: 'Tu presencia inspira a tus aliados.' },
      { name: 'Hazaña de Caballo', level: 6, description: 'Ganas una hazaña de caballero.' },
      { name: 'Desafío 3/día', level: 7, description: 'Desafías a un enemigo: +2 a ataques y +2 a daño.' },
      { name: 'Capacidad de Pedido', level: 8, description: 'Puedes dar órdenes a tus aliados.' },
      { name: 'Gran Táctico', level: 9, description: 'Eres un táctico magistral.' },
      { name: 'Desafío 4/día', level: 10, description: 'Desafías a un enemigo: +2 a ataques y +2 a daño.' },
      { name: 'Carga Poderosa', level: 11, description: 'Tus cargas son devastadoras.' },
      { name: 'Obra Extra', level: 12, description: 'Ganas una acción adicional por día.' },
      { name: 'Desafío Exigente', level: 12, description: 'Desafío otorga +3 a daño.' },
      { name: 'Desafío 5/día', level: 13, description: 'Desafías a un enemigo: +2 a ataques y +2 a daño.' },
      { name: 'Bandera Mayor', level: 14, description: 'Tu presencia inspira más a tus aliados (+2).' },
      { name: 'Capacidad de Pedido', level: 15, description: 'Puedes dar órdenes a tus aliados.' },
      { name: 'Desafío 6/día', level: 16, description: 'Desafías a un enemigo: +2 a ataques y +2 a daño.' },
      { name: 'Maestro Táctico', level: 17, description: 'Eres un maestro de la táctica.' },
      { name: 'Hazaña de Caballo', level: 18, description: 'Ganas una hazaña de caballero.' },
      { name: 'Desafío 7/día', level: 19, description: 'Desafías a un enemigo: +2 a ataques y +2 a daño.' },
      { name: 'Cargo Supremo', level: 20, description: 'Alcanzas la cima de la orden caballeresca.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Guerreros montados vinculados a una orden caballeresca.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '5d6*10',
    proficiencies: { weapons: 'Todas las armas simples y marciales', armor: 'Todas las armaduras y escudos' },
  },
  {
    id: 'magus',
    source: 'other' as const,
    name: 'Magus',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 2,
    classSkills: ['climb', 'craft', 'fly', 'intimidate', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_engineering', 'knowledge_geography', 'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_nobility', 'knowledge_planes', 'knowledge_religion', 'linguistics', 'profession', 'ride', 'sense_motive', 'spellcraft', 'swim', 'use_magic_device'],
    features: [
      { name: 'Arcano', level: 1, description: 'Combinas hechizos con ataques de arma mediante arcanos especiales.' },
      { name: 'Golpe Mágico', level: 1, description: 'Puedes canalizar un hechizo a través de tu arma cuerpo a cuerpo.' },
      { name: 'Reserva Mágica', level: 1, description: 'Acumulas reserva de poder arcano para mejorar armas y hechizos.' },
      { name: 'Armadura Arcana', level: 1, description: 'Puedes lanzar hechizos en armadura media sin penalización.' },
      { name: 'Conocimiento Mágico', level: 3, description: 'Añades hechizos de mago a tu lista de hechizos.' },
      { name: 'Golpe Mágico Mejorado', level: 5, description: 'Tu golpe mágico mejora notablemente.' },
      { name: 'Reserva Mágica +1', level: 7, description: 'Acumulas reserva de poder arcano adicional.' },
      { name: 'Gran Arcano', level: 10, description: 'Tus arcanos se potencian.' },
      { name: 'Gran Golpe Mágico', level: 11, description: 'Puedes lanzar dos hechizos con un ataque.' },
      { name: 'Reserva Mágica +2', level: 13, description: 'Acumulas reserva de poder arcano adicional.' },
      { name: 'Reserva Mágica +3', level: 15, description: 'Acumulas reserva de poder arcano adicional.' },
      { name: 'Reserva Mágica +4', level: 17, description: 'Acumulas reserva de poder arcano adicional.' },
      { name: 'Maestro Arcano', level: 20, description: 'Tu fusión de arma y magia es perfecta.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Combatientes arcanos que funden magia y espada con maestría.',
    magicType: 'arcane',
    casterAbility: 'intelligence',
    startingGoldDice: '4d6*10',
    proficiencies: { weapons: 'Armas simples y marciales', armor: 'Armaduras ligeras' },
    spellsPerDay: [
      [3, 1],           // lv 1
      [4, 2],           // lv 2
      [4, 3],           // lv 3
      [4, 3, 1],         // lv 4
      [4, 4, 2],         // lv 5
      [5, 4, 3],         // lv 6
      [5, 4, 3, 1],       // lv 7
      [5, 4, 4, 2],       // lv 8
      [5, 5, 4, 3],       // lv 9
      [5, 5, 4, 3, 1],     // lv 10
      [5, 5, 4, 4, 2],     // lv 11
      [5, 5, 5, 4, 3],     // lv 12
      [5, 5, 5, 4, 3, 1],   // lv 13
      [5, 5, 5, 4, 4, 2],   // lv 14
      [5, 5, 5, 5, 4, 3],   // lv 15
      [5, 5, 5, 5, 4, 3, 1], // lv 16
      [5, 5, 5, 5, 4, 4, 2], // lv 17
      [5, 5, 5, 5, 5, 4, 3], // lv 18
      [5, 5, 5, 5, 5, 5, 4], // lv 19
      [5, 5, 5, 5, 5, 5, 5], // lv 20
    ],
  },
  {
    id: 'summoner',
    source: 'apg' as const,
    name: 'Invocador',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'poor',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 2,
    classSkills: ['craft', 'fly', 'handle_animal', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_engineering', 'knowledge_local', 'knowledge_nature', 'knowledge_nobility', 'knowledge_planes', 'knowledge_religion', 'linguistics', 'profession', 'ride', 'spellcraft', 'use_magic_device'],
    features: [
      { name: 'Eidolón', level: 1, description: 'Estás vinculado a una criatura mágica que crece con tu poder.' },
      { name: 'Life Link', level: 1, description: 'Compartes daño con tu eidolón.' },
      { name: 'Cantrips', level: 1, description: 'Puedes lanzar hechizos de nivel 0 a voluntad.' },
      { name: 'Invocación (SM I)', level: 1, description: 'Puedes convocar criaturas como conjuración summon.' },
      { name: 'Evolucionar Eidolón', level: 1, description: 'Tu eidolón gana puntos de evolución para mejorar sus capacidades.' },
      { name: 'Bond Senses', level: 2, description: 'Puedes usar los sentidos de tu eidolón.' },
      { name: 'Invocación (SM II)', level: 3, description: 'Puedes invocar monstruos de nivel 2.' },
      { name: 'Shield Ally', level: 4, description: 'Tu eidolón puede protegerte.' },
      { name: 'Invocación (SM III)', level: 5, description: 'Puedes invocar monstruos de nivel 3.' },
      { name: 'Maker\'s Call', level: 6, description: 'Puedes llamar a tu eidolón a tu lado.' },
      { name: 'Invocación (SM IV)', level: 7, description: 'Puedes invocar monstruos de nivel 4.' },
      { name: 'Transposition', level: 8, description: 'Puedes intercambiaposiciones con tu eidolón.' },
      { name: 'Invocación (SM V)', level: 9, description: 'Puedes invocar monstruos de nivel 5.' },
      { name: 'Aspect', level: 10, description: 'Tu eidolón puede adoptar una forma alternativa.' },
      { name: 'Invocación (SM VI)', level: 11, description: 'Puedes invocar monstruos de nivel 6.' },
      { name: 'Greater Shield Ally', level: 12, description: 'Tu eidolón te protege mejor.' },
      { name: 'Invocación (SM VII)', level: 13, description: 'Puedes invocar monstruos de nivel 7.' },
      { name: 'Life Bond', level: 14, description: 'Protección adicional contra daño.' },
      { name: 'Invocación (SM VIII)', level: 15, description: 'Puedes invocar monstruos de nivel 8.' },
      { name: 'Merge Forms', level: 16, description: 'Puedes fusionarte completamente con tu eidolón.' },
      { name: 'Invocación (SM IX)', level: 17, description: 'Puedes invocar monstruos de nivel 9.' },
      { name: 'Greater Aspect', level: 18, description: 'Tu aspect se vuelve más poderoso.' },
      { name: 'Gate', level: 19, description: 'Puedes invocar criaturas a través de un portal.' },
      { name: 'Twin Eidolon', level: 20, description: 'Tu eidolón se divide en dos.' },
    ],
    spellsPerDay: [
      [1],              // lv 1
      [2],              // lv 2
      [3],              // lv 3
      [3, 1],           // lv 4
      [4, 2],           // lv 5
      [4, 3],           // lv 6
      [4, 3, 1],        // lv 7
      [4, 4, 2],        // lv 8
      [5, 4, 3],        // lv 9
      [5, 4, 3, 1],     // lv 10
      [5, 4, 4, 2],     // lv 11
      [5, 5, 4, 3],     // lv 12
      [5, 5, 4, 3, 1],  // lv 13
      [5, 5, 4, 4, 2],  // lv 14
      [5, 5, 5, 4, 3],  // lv 15
      [5, 5, 5, 4, 3, 1], // lv 16
      [5, 5, 5, 4, 4, 2], // lv 17
      [5, 5, 5, 5, 4, 3], // lv 18
      [5, 5, 5, 5, 5, 4], // lv 19
      [5, 5, 5, 5, 5, 5], // lv 20
    ],
    spellsKnown: [
      [4, 2],           // lv 1
      [5, 3],           // lv 2
      [6, 4],           // lv 3
      [6, 4, 2],        // lv 4
      [6, 4, 3],        // lv 5
      [6, 4, 4],        // lv 6
      [6, 5, 4, 2],     // lv 7
      [6, 5, 4, 3],     // lv 8
      [6, 5, 4, 4],     // lv 9
      [6, 5, 5, 4, 2],  // lv 10
      [6, 6, 5, 4, 3],  // lv 11
      [6, 6, 5, 4, 4],  // lv 12
      [6, 6, 5, 5, 4, 2], // lv 13
      [6, 6, 6, 5, 4, 3], // lv 14
      [6, 6, 6, 5, 4, 4], // lv 15
      [6, 6, 6, 5, 5, 4, 2], // lv 16
      [6, 6, 6, 6, 5, 4, 3], // lv 17
      [6, 6, 6, 6, 5, 4, 4], // lv 18
      [6, 6, 6, 6, 5, 5, 4], // lv 19
      [6, 6, 6, 6, 6, 5, 5], // lv 20
    ],
    alignment: ['Cualquiera'],
    description: 'Mágicos vinculados a un eidolón: una criatura extraplanar personalizable.',
    magicType: 'arcane',
    casterAbility: 'charisma',
    startingGoldDice: '2d6*10',
    proficiencies: { weapons: 'Armas simples', armor: 'Armaduras ligeras' },
  },
  {
    id: 'swashbuckler',
    source: 'acg' as const,
    name: 'Espadachín',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'poor',
    reflexSave: 'good',
    willSave: 'poor',
    skillPointsPerLevel: 4,
    classSkills: ['acrobatics', 'bluff', 'climb', 'craft', 'diplomacy', 'disguise', 'escape_artist', 'intimidate', 'knowledge_local', 'linguistics', 'perception', 'perform', 'profession', 'ride', 'sense_motive', 'sleight_of_hand', 'stealth', 'swim'],
    features: [
      { name: 'Hechos', level: 1, description: 'Puntos de suerte que puedes usar para diversas acciones.' },
      { name: 'Estilo', level: 1, description: 'Eliges un estilo de combate con el espadachín.' },
      { name: 'Delicadeza de Espada', level: 1, description: 'Puedes usar agilidad con espadas.' },
      { name: 'Vida Encantada 3/día', level: 2, description: 'Puedes obtener puntos de vida temporales.' },
      { name: 'Hechos Ágiles +1', level: 3, description: '+1 a una tirada de ataque o daño.' },
      { name: 'Hazaña de Espada', level: 4, description: 'Ganas una hazaña de espadachín.' },
      { name: 'Entrenamiento con Armas +1', level: 5, description: '+1 a ataques y daño con espadas.' },
      { name: 'Vida Encantada 4/día', level: 6, description: 'Puedes obtener más puntos de vida temporales.' },
      { name: 'Hechos Ágiles +2', level: 7, description: '+2 a una tirada de ataque o daño.' },
      { name: 'Hazaña de Espada', level: 8, description: 'Ganas una hazaña de espadachín.' },
      { name: 'Entrenamiento con Armas +2', level: 9, description: '+2 a ataques y daño con espadas.' },
      { name: 'Vida Encantada 5/día', level: 10, description: 'Puedes obtener más puntos de vida temporales.' },
      { name: 'Hechos Ágiles +3', level: 11, description: '+3 a una tirada de ataque o daño.' },
      { name: 'Hazaña de Espada', level: 12, description: 'Ganas una hazaña de espadachín.' },
      { name: 'Entrenamiento con Armas +3', level: 13, description: '+3 a ataques y daño con espadas.' },
      { name: 'Vida Encantada 6/día', level: 14, description: 'Puedes obtener más puntos de vida temporales.' },
      { name: 'Hechos Ágiles +4', level: 15, description: '+4 a una tirada de ataque o daño.' },
      { name: 'Hazaña de Espada', level: 16, description: 'Ganas una hazaña de espadachín.' },
      { name: 'Entrenamiento con Armas +4', level: 17, description: '+4 a ataques y daño con espadas.' },
      { name: 'Vida Encantada 7/día', level: 18, description: 'Puedes obtener más puntos de vida temporales.' },
      { name: 'Hechos Ágiles +5', level: 19, description: '+5 a una tirada de ataque o daño.' },
      { name: 'Dominio de Espada', level: 20, description: 'Maestría absoluta con espadas.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Guerrero ágil que usa estilo y gracia con armas de espada.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '4d6*10',
    proficiencies: { weapons: 'Armas simples, espada corta, espada larga, rapieras', armor: 'Armaduras ligeras' },
  },
  {
    id: 'vigilante',
    source: 'other' as const,
    name: 'Vigilante',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'poor',
    reflexSave: 'good',
    willSave: 'good',
    skillPointsPerLevel: 6,
    classSkills: ['acrobatics', 'bluff', 'climb', 'craft', 'diplomacy', 'disguise', 'escape_artist', 'intimidate', 'knowledge_local', 'knowledge_nobility', 'linguistics', 'perception', 'perform', 'profession', 'sense_motive', 'sleight_of_hand', 'stealth', 'swim', 'use_magic_device'],
    features: [
      { name: 'Doble Identidad', level: 1, description: 'Tienes una identidad social y una de vigilante.' },
      { name: 'Apariencia Perfecta', level: 1, description: 'Tu identidad social es irreconocible.' },
      { name: 'Talento Social', level: 1, description: 'Ganas talentos sociales.' },
      { name: 'Especialización de Vigilante', level: 1, description: 'Te especializas en un tipo de vigilante.' },
      { name: 'Talento de Vigilante', level: 2, description: 'Ganas un talento de vigilante.' },
      { name: 'Talento Social', level: 3, description: 'Ganas un talento social adicional.' },
      { name: 'Inquebrantable', level: 3, description: '+2 a TS contra efectos de miedo y encantamiento.' },
      { name: 'Talento de Vigilante', level: 4, description: 'Ganas un talento de vigilante.' },
      { name: 'Talento Social', level: 5, description: 'Ganas un talento social adicional.' },
      { name: 'Apariencia Sorprendente', level: 5, description: 'Tu aparición causa sorpresa.' },
      { name: 'Talento de Vigilante', level: 6, description: 'Ganas un talento de vigilante.' },
      { name: 'Talento Social', level: 7, description: 'Ganas un talento social adicional.' },
      { name: 'Talento de Vigilante', level: 8, description: 'Ganas un talento de vigilante.' },
      { name: 'Talento Social', level: 9, description: 'Ganas un talento social adicional.' },
      { name: 'Talento de Vigilante', level: 10, description: 'Ganas un talento de vigilante.' },
      { name: 'Aspecto Aterrador', level: 11, description: 'Tu apariencia asusta a los enemigos.' },
      { name: 'Talento Social', level: 11, description: 'Ganas un talento social adicional.' },
      { name: 'Talento de Vigilante', level: 12, description: 'Ganas un talento de vigilante.' },
      { name: 'Talento Social', level: 13, description: 'Ganas un talento social adicional.' },
      { name: 'Talento de Vigilante', level: 14, description: 'Ganas un talento de vigilante.' },
      { name: 'Talento Social', level: 15, description: 'Ganas un talento social adicional.' },
      { name: 'Talento de Vigilante', level: 16, description: 'Ganas un talento de vigilante.' },
      { name: 'Apariencia Impresionante', level: 17, description: 'Tu presencia es intimidante.' },
      { name: 'Talento Social', level: 17, description: 'Ganas un talento social adicional.' },
      { name: 'Talento de Vigilante', level: 18, description: 'Ganas un talento de vigilante.' },
      { name: 'Talento Social', level: 19, description: 'Ganas un talento social adicional.' },
      { name: 'Huelga de Venganza', level: 20, description: 'Golpe devastador contra enemigos.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Héroe con identidad secreta que usa habilidades sociales y de combate.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '3d6*10',
    proficiencies: { weapons: 'Armas simples y marciales', armor: 'Armaduras ligeras y medias, escudos' },
  },
  {
    id: 'warpriest',
    source: 'acg' as const,
    name: 'Sacerdote de Guerra',
    hitDie: 10,
    baseAttackBonus: 'medium',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 2,
    classSkills: ['appraise', 'craft', 'diplomacy', 'heal', 'intimidate', 'knowledge_arcana', 'knowledge_history', 'knowledge_religion', 'linguistics', 'profession', 'sense_motive', 'spellcraft'],
    features: [
      { name: 'Aura', level: 1, description: 'Emites un aura de tu alineación.' },
      { name: 'Blessings Menores', level: 1, description: 'Ganas bendiciones menores.' },
      { name: 'Arma de Enfoque', level: 1, description: 'Obtienes competencia con un arma específica.' },
      { name: 'Orisons', level: 1, description: 'Puedes preparar hechizos de nivel 0.' },
      { name: 'Arma Sagrada 1d6', level: 1, description: 'Tu arma dealing daño sagrado.' },
      { name: 'Fervor 1d6', level: 2, description: 'Puedes canalizar energía para darte energía sagrada.' },
      { name: 'Hazaña de Guerra', level: 3, description: 'Ganas una hazaña de sacerdote de guerra.' },
      { name: 'Arma Sagrada +1', level: 4, description: 'Tu arma sagrada es +1.' },
      { name: 'Fervor 2d6', level: 5, description: 'Tu fervor se potencia a 2d6.' },
      { name: 'Hazaña de Guerra', level: 6, description: 'Ganas una hazaña de sacerdote de guerra.' },
      { name: 'Armadura Sagrada +1', level: 7, description: 'Tu armadura otorga bonificador sagrado.' },
      { name: 'Arma Sagrada +2', level: 8, description: 'Tu arma sagrada es +2.' },
      { name: 'Fervor 3d6', level: 8, description: 'Tu fervor se potencia a 3d6.' },
      { name: 'Hazaña de Guerra', level: 9, description: 'Ganas una hazaña de sacerdote de guerra.' },
      { name: 'Blessings Mayores', level: 10, description: 'Ganas bendiciones mayores.' },
      { name: 'Armadura Sagrada +2', level: 10, description: 'Tu armadura otorga bonificador sagrado +2.' },
      { name: 'Fervor 4d6', level: 11, description: 'Tu fervor se potencia a 4d6.' },
      { name: 'Hazaña de Guerra', level: 12, description: 'Ganas una hazaña de sacerdote de guerra.' },
      { name: 'Obra Extra', level: 12, description: 'Puedes realizar una acción adicional por día.' },
      { name: 'Arma Sagrada +3', level: 12, description: 'Tu arma sagrada es +3.' },
      { name: 'Armadura Sagrada +3', level: 13, description: 'Tu armadura otorga bonificador sagrado +3.' },
      { name: 'Fervor 5d6', level: 14, description: 'Tu fervor se potencia a 5d6.' },
      { name: 'Hazaña de Guerra', level: 15, description: 'Ganas una hazaña de sacerdote de guerra.' },
      { name: 'Armadura Sagrada +4', level: 16, description: 'Tu armadura otorga bonificador sagrado +4.' },
      { name: 'Arma Sagrada +4', level: 16, description: 'Tu arma sagrada es +4.' },
      { name: 'Fervor 6d6', level: 17, description: 'Tu fervor se potencia a 6d6.' },
      { name: 'Hazaña de Guerra', level: 18, description: 'Ganas una hazaña de sacerdote de guerra.' },
      { name: 'Armadura Sagrada +5', level: 19, description: 'Tu armadura otorga bonificador sagrado +5.' },
      { name: 'Aspecto de Guerra', level: 20, description: 'Tu presencia es terrorífica en combate.' },
      { name: 'Fervor 7d6', level: 20, description: 'Tu fervor se potencia a 7d6.' },
      { name: 'Arma Sagrada +5', level: 20, description: 'Tu arma sagrada es +5.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Sacerdote guerrero que combina magia divina con habilidades de combate.',
    magicType: 'divine',
    casterAbility: 'wisdom',
    startingGoldDice: '4d6*10',
    proficiencies: { weapons: 'Todas las armas simples y marciales', armor: 'Todas las armaduras y escudos' },
    spellsPerDay: [
      [3, 1],               // lv 1
      [4, 2],               // lv 2
      [4, 3],               // lv 3
      [4, 3, 1],            // lv 4
      [4, 4, 2],            // lv 5
      [5, 4, 3],            // lv 6
      [5, 4, 3, 1],         // lv 7
      [5, 4, 4, 2],         // lv 8
      [5, 5, 4, 3],         // lv 9
      [5, 5, 4, 3, 1],      // lv 10
      [5, 5, 4, 4, 2],      // lv 11
      [5, 5, 5, 4, 3],      // lv 12
      [5, 5, 5, 4, 3, 1],   // lv 13
      [5, 5, 5, 4, 4, 2],   // lv 14
      [5, 5, 5, 5, 4, 3],   // lv 15
      [5, 5, 5, 5, 4, 3, 1], // lv 16
      [5, 5, 5, 5, 4, 4, 2], // lv 17
      [5, 5, 5, 5, 5, 4, 3], // lv 18
      [5, 5, 5, 5, 5, 5, 4], // lv 19
      [5, 5, 5, 5, 5, 5, 5], // lv 20
    ],
  },
  // ── APG adicional ──
  {
    id: 'antipaladin',
    source: 'apg' as const,
    name: 'Antipaladín',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 2,
    classSkills: ['bluff', 'craft', 'disguise', 'handle_animal', 'intimidate', 'knowledge_nobility', 'knowledge_planes', 'knowledge_religion', 'ride', 'sense_motive', 'spellcraft', 'stealth'],
    features: [
      { name: 'Aura de Maldad', level: 1, description: 'Emites un aura de maldad fuerte.' },
      { name: 'Detectar Bien', level: 1, description: 'Detectas bien a voluntad como acción de concentración.' },
      { name: 'Toque de Corrupción', level: 1, description: 'Daña criaturas buenas o cura no-muertos. Usos/día = 1 + nivel/2.' },
      { name: 'Escudo Impío', level: 2, description: 'Añade modificador CAR a todas las tiradas de salvación.' },
      { name: 'Golpe Maligno', level: 2, description: 'Añade bonus CAR a ataques/daño vs. objetivos buenos y otorga PV temporales.' },
      { name: 'Crueldad', level: 3, description: 'Toque de Corrupción también aplica una condición negativa al objetivo.' },
      { name: 'Canal de Energía Negativa', level: 4, description: 'Usa Toque de Corrupción para canalizar energía negativa.' },
      { name: 'Magia Maligna', level: 4, description: 'Prepara y lanza hechizos divinos de la lista del antipaladín.' },
      { name: 'Amigo Fiendish', level: 5, description: 'Convoca un compañero fiendish (animal o familiar extraplanar).' },
      { name: 'Crueldad', level: 6, description: 'Toque de Corrupción aplica una condición adicional.' },
      { name: 'Aura de Cobardía', level: 8, description: 'Enemigos a 10 pies sufren –4 a salvaciones contra miedo.' },
      { name: 'Crueldad', level: 9, description: 'Toque de Corrupción aplica una condición adicional.' },
      { name: 'Aura de Desesperación', level: 11, description: 'Enemigos a 10 pies sufren –2 a todas las tiradas.' },
      { name: 'Crueldad', level: 12, description: 'Toque de Corrupción aplica una condición adicional.' },
      { name: 'Aura de Venganza', level: 14, description: 'Gasta 2 usos para que aliados usen tu Golpe Maligno.' },
      { name: 'Crueldad', level: 15, description: 'Toque de Corrupción aplica una condición adicional.' },
      { name: 'Aura de Pecado', level: 17, description: 'DR 5/Bien y aliados cercanos obtienen DR 5/Bien.' },
      { name: 'Crueldad', level: 18, description: 'Toque de Corrupción aplica una condición adicional.' },
      { name: 'Campeón Impío', level: 20, description: 'Al activar Golpe Maligno, emites un campo de maldad que protege a no-muertos.' },
    ],
    alignment: ['Caótico Malvado'],
    description: 'Paladines caídos que se entregan al mal, combinando magia oscura con habilidades de combate.',
    magicType: 'divine',
    casterAbility: 'charisma',
    startingGoldDice: '5d6*10',
    proficiencies: { weapons: 'Todas las armas simples y marciales', armor: 'Todas las armaduras y escudos (no de torre)' },
    spellsPerDay: [
      [],              // lv 1
      [],              // lv 2
      [],              // lv 3
      [1],             // lv 4
      [1],             // lv 5
      [1],             // lv 6
      [1, 1],          // lv 7
      [1, 1],          // lv 8
      [2, 1],          // lv 9
      [2, 1, 1],       // lv 10
      [2, 1, 1],       // lv 11
      [2, 1, 1, 1],    // lv 12
      [3, 2, 1, 1],    // lv 13
      [3, 2, 1, 1],    // lv 14
      [3, 2, 1, 1],    // lv 15
      [3, 2, 2, 1],    // lv 16
      [4, 3, 2, 1],    // lv 17
      [4, 3, 2, 1],    // lv 18
      [4, 3, 3, 2],    // lv 19
      [4, 3, 3, 2],    // lv 20
    ],
  },
  // ── Ultimate Magic / Ultimate Combat ──
  {
    id: 'gunslinger',
    source: 'other' as const,
    name: 'Pistolero',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'good',
    willSave: 'poor',
    skillPointsPerLevel: 4,
    classSkills: ['acrobatics', 'bluff', 'climb', 'craft', 'handle_animal', 'heal', 'intimidate', 'knowledge_engineering', 'knowledge_local', 'perception', 'profession', 'ride', 'sleight_of_hand', 'survival', 'swim'],
    features: [
      { name: 'Valentía', level: 1, description: 'Reserva de valentía = mod SAB. Se recupera con golpes críticos y matando enemigos.' },
      { name: 'Hazañas', level: 1, description: 'Usa valentía para activar hazañas: maniobras y trucos especiales con armas de fuego.' },
      { name: 'Herrero de Armas', level: 1, description: 'Comienzas con un arma de fuego artesanal y herramientas para fabricar munición.' },
      { name: 'Ágil 1', level: 2, description: '+1 CA sin armadura o con armadura ligera cuando no estás sin defensas.' },
      { name: 'Hazaña de Bono', level: 2, description: 'Ganas una hazaña de combate adicional.' },
      { name: 'Pistolero Diestro 1', level: 5, description: '+1 a ataques con armas de fuego del grupo elegido.' },
      { name: 'Ágil 2', level: 6, description: '+2 CA sin armadura o con armadura ligera.' },
      { name: 'Hazaña de Bono', level: 6, description: 'Ganas una hazaña de combate adicional.' },
      { name: 'Pistolero Diestro 2', level: 9, description: '+2 a ataques con armas de fuego del grupo elegido.' },
      { name: 'Ágil 3', level: 10, description: '+3 CA sin armadura o con armadura ligera.' },
      { name: 'Hazaña de Bono', level: 10, description: 'Ganas una hazaña de combate adicional.' },
      { name: 'Pistolero Diestro 3', level: 13, description: '+3 a ataques con armas de fuego del grupo elegido.' },
      { name: 'Ágil 4', level: 14, description: '+4 CA sin armadura o con armadura ligera.' },
      { name: 'Hazaña de Bono', level: 14, description: 'Ganas una hazaña de combate adicional.' },
      { name: 'Pistolero Diestro 4', level: 17, description: '+4 a ataques con armas de fuego del grupo elegido.' },
      { name: 'Ágil 5', level: 18, description: '+5 CA sin armadura o con armadura ligera.' },
      { name: 'Hazaña de Bono', level: 18, description: 'Ganas una hazaña de combate adicional.' },
      { name: 'Maestro Pistolero', level: 20, description: 'Puedes recargar armas de fuego como acción libre.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Guerrero que domina las armas de fuego, combinando valentía y puntería letal.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '5d6*10',
    proficiencies: { weapons: 'Armas simples, todas las armas de fuego', armor: 'Armaduras ligeras y medias, escudos (no de torre)' },
  },
  {
    id: 'ninja',
    source: 'other' as const,
    name: 'Ninja',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'poor',
    reflexSave: 'good',
    willSave: 'poor',
    skillPointsPerLevel: 8,
    classSkills: ['acrobatics', 'appraise', 'bluff', 'climb', 'craft', 'diplomacy', 'disable_device', 'disguise', 'escape_artist', 'intimidate', 'knowledge_local', 'knowledge_nobility', 'linguistics', 'perception', 'perform', 'profession', 'sense_motive', 'sleight_of_hand', 'stealth', 'swim', 'use_magic_device'],
    features: [
      { name: 'Ataque Furtivo +1d6', level: 1, description: '+1d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Trucos del Ninja', level: 2, description: 'Ganas un truco de ninja: habilidades especiales de sigilo y combate.' },
      { name: 'Reserva de Ki', level: 2, description: 'Reserva de ki = nivel + mod CAR. Permite acciones especiales.' },
      { name: 'Veneno de Baso', level: 2, description: 'Puedes crear un veneno especial de ninja con tu ki.' },
      { name: 'Evasión', level: 2, description: 'Con éxito en Reflejos, no sufres daño.' },
      { name: 'Ataque Furtivo +2d6', level: 3, description: '+2d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Truco de Ninja', level: 4, description: 'Ganas un truco adicional.' },
      { name: 'Ataque Furtivo +3d6', level: 5, description: '+3d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Ocultarse a Simple Vista', level: 6, description: 'Puedes usar Furtividad incluso mientras te observan.' },
      { name: 'Truco de Ninja', level: 6, description: 'Ganas un truco adicional.' },
      { name: 'Ataque Furtivo +4d6', level: 7, description: '+4d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Evasión Mejorada', level: 8, description: 'Con fallo en Reflejos solo recibes la mitad del daño.' },
      { name: 'Trucos Avanzados', level: 8, description: 'Accedes a trucos de ninja avanzados.' },
      { name: 'Truco de Ninja', level: 8, description: 'Ganas un truco adicional.' },
      { name: 'Ataque Furtivo +5d6', level: 9, description: '+5d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Ataque Furtivo +6d6', level: 11, description: '+6d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Truco de Ninja', level: 12, description: 'Ganas un truco adicional.' },
      { name: 'Ataque Furtivo +7d6', level: 13, description: '+7d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Ataque Furtivo +8d6', level: 15, description: '+8d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Truco de Ninja', level: 16, description: 'Ganas un truco adicional.' },
      { name: 'Ataque Furtivo +9d6', level: 17, description: '+9d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Ataque Furtivo +10d6', level: 19, description: '+10d6 daño cuando el objetivo está desprevenido o flanqueado.' },
      { name: 'Maestro del Sigilo', level: 20, description: 'Tu ataque furtivo puede afectar a criaturas inmunes a críticos.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Asesino ágil que usa ki, veneno y sigilo para eliminar objetivos sin ser detectado.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '4d6*10',
    proficiencies: { weapons: 'Armas simples, ballesta de mano, kama, kukri, nunchaku, sai, arco corto, espada corta, shuriken, siangham, wakizashi', armor: 'Armaduras ligeras' },
  },
  {
    id: 'samurai',
    source: 'other' as const,
    name: 'Samurai',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'poor',
    skillPointsPerLevel: 4,
    classSkills: ['climb', 'craft', 'handle_animal', 'intimidate', 'knowledge_history', 'knowledge_nobility', 'perception', 'profession', 'ride', 'sense_motive', 'survival', 'swim'],
    features: [
      { name: 'Desafío 1/día', level: 1, description: 'Desafías a un enemigo: +2 a ataques y daño, con bonificador de orden.' },
      { name: 'Montura', level: 1, description: 'Obtienes una montura especial como compañero permanente.' },
      { name: 'Orden', level: 1, description: 'Juras lealtad a un código bushido y obtienes habilidades de orden.' },
      { name: 'Resolución', level: 1, description: 'Gastas un uso de desafío para relanzar una tirada fallida una vez por combate.' },
      { name: 'Reto', level: 3, description: 'Tu cargo de caballero otorga poderes especiales en combate montado.' },
      { name: 'Bono de Orden', level: 4, description: 'Ganas habilidades adicionales de tu orden.' },
      { name: 'Desafío 2/día', level: 4, description: 'Puedes lanzar 2 desafíos por día.' },
      { name: 'Gran Táctico', level: 5, description: 'Bandera: tu presencia inspira a aliados cercanos.' },
      { name: 'Desafío 3/día', level: 7, description: 'Puedes lanzar 3 desafíos por día.' },
      { name: 'Entrenador Experto', level: 4, description: 'Puedes entrenar monturas con mayor eficacia.' },
      { name: 'Kata', level: 9, description: 'Técnica especial de combate que mejora un tipo de ataque.' },
      { name: 'Desafío 4/día', level: 10, description: 'Puedes lanzar 4 desafíos por día.' },
      { name: 'Kiai', level: 11, description: 'Una vez por día puedes proclamar un kiai para obtener un ataque adicional.' },
      { name: 'Desafío 5/día', level: 13, description: 'Puedes lanzar 5 desafíos por día.' },
      { name: 'Bandera Mayor', level: 14, description: 'Tu inspira a más aliados con mayor bonificador.' },
      { name: 'Desafío 6/día', level: 16, description: 'Puedes lanzar 6 desafíos por día.' },
      { name: 'Honorable Stand', level: 17, description: 'Puedes luchar hasta 0 PV sin caer inconsciente una vez por día.' },
      { name: 'Desafío 7/día', level: 19, description: 'Puedes lanzar 7 desafíos por día.' },
      { name: 'Maestro Samurai', level: 20, description: 'Tus desafíos infunden terror sobrenatural en los enemigos.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Guerrero de honor ligado a un código bushido, maestro del combate montado y el duelo.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '5d6*10',
    proficiencies: { weapons: 'Todas las armas simples y marciales, más armas de samurai (daiklave, katana, naginata, wakizashi)', armor: 'Todas las armaduras y escudos' },
  },
  // ── ACG adicionales ──
  {
    id: 'arcanist',
    source: 'acg' as const,
    name: 'Arcanista',
    hitDie: 6,
    baseAttackBonus: 'poor',
    fortitudeSave: 'poor',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 2,
    classSkills: ['appraise', 'craft', 'fly', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_engineering', 'knowledge_geography', 'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_nobility', 'knowledge_planes', 'knowledge_religion', 'linguistics', 'profession', 'spellcraft', 'use_magic_device'],
    features: [
      { name: 'Reserva Arcana', level: 1, description: 'Reserva de puntos = 3 + INT. Permite potenciar conjuros y exploits.' },
      { name: 'Exploits del Arcanista', level: 1, description: 'Ganas exploits especiales que mejoran tu magia.' },
      { name: 'Consumir Conjuros', level: 1, description: 'Sacrifica ranuras de conjuros preparados para recuperar puntos de reserva arcana.' },
      { name: 'Exploit Arcano Bono', level: 3, description: 'Ganas un exploit adicional.' },
      { name: 'Exploit Arcano Bono', level: 7, description: 'Ganas un exploit adicional.' },
      { name: 'Exploit Arcano Bono', level: 11, description: 'Ganas un exploit adicional.' },
      { name: 'Exploit Mayor', level: 11, description: 'Accedes a exploits de mayor poder.' },
      { name: 'Exploit Arcano Bono', level: 15, description: 'Ganas un exploit adicional.' },
      { name: 'Exploit Arcano Bono', level: 19, description: 'Ganas un exploit adicional.' },
      { name: 'Maestría Arcana Suprema', level: 20, description: 'Tus hechizos de clase se potencian al máximo sin coste adicional.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Híbrido de mago y hechicero que prepara conjuros del libro pero los lanza con flexibilidad innata.',
    magicType: 'arcane',
    casterAbility: 'intelligence',
    startingGoldDice: '2d6*10',
    proficiencies: { weapons: 'Bastón, daga, ballesta ligera y pesada', armor: 'Ninguna' },
    spellsPerDay: [
      [3, 1],               // lv 1
      [4, 2],               // lv 2
      [4, 2, 1],            // lv 3
      [4, 3, 2],            // lv 4
      [4, 3, 2, 1],         // lv 5
      [4, 3, 3, 2],         // lv 6
      [4, 4, 3, 2, 1],      // lv 7
      [4, 4, 3, 3, 2],      // lv 8
      [4, 4, 4, 3, 2, 1],   // lv 9
      [4, 4, 4, 3, 3, 2],   // lv 10
      [4, 4, 4, 4, 3, 2, 1], // lv 11
      [4, 4, 4, 4, 3, 3, 2], // lv 12
      [4, 4, 4, 4, 4, 3, 2, 1], // lv 13
      [4, 4, 4, 4, 4, 3, 3, 2], // lv 14
      [4, 4, 4, 4, 4, 4, 3, 2, 1], // lv 15
      [4, 4, 4, 4, 4, 4, 3, 3, 2], // lv 16
      [4, 4, 4, 4, 4, 4, 4, 3, 2, 1], // lv 17
      [4, 4, 4, 4, 4, 4, 4, 3, 3, 2], // lv 18
      [4, 4, 4, 4, 4, 4, 4, 4, 3, 3], // lv 19
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4], // lv 20
    ],
  },
  {
    id: 'hunter',
    source: 'acg' as const,
    name: 'Cazador',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'good',
    reflexSave: 'good',
    willSave: 'poor',
    skillPointsPerLevel: 6,
    classSkills: ['climb', 'craft', 'handle_animal', 'heal', 'intimidate', 'knowledge_dungeoneering', 'knowledge_geography', 'knowledge_nature', 'perception', 'profession', 'ride', 'spellcraft', 'stealth', 'survival', 'swim'],
    features: [
      { name: 'Compañero Animal', level: 1, description: 'Obtienes un compañero animal al nivel completo del cazador.' },
      { name: 'Empatía Salvaje', level: 1, description: 'Puedes mejorar actitud de animales como Diplomacia.' },
      { name: 'Foco Animal', level: 1, description: 'Canalizas los atributos de un animal en ti o en tu compañero.' },
      { name: 'Hazañas de Trabajo en Equipo', level: 2, description: 'Ganas hazañas de trabajo en equipo que compartes con tu compañero animal.' },
      { name: 'Paso por el Bosque', level: 2, description: 'Ignoras penalización por terreno difícil natural.' },
      { name: 'Compañero Preciso', level: 3, description: 'Tu compañero animal no te bloquea en ataques.' },
      { name: 'Foco Animal 2', level: 4, description: 'Puedes mantener 2 focos de animal simultáneos.' },
      { name: 'Paso sin Pista', level: 4, description: 'No puedes ser rastreado en exteriores.' },
      { name: 'Rastrear', level: 4, description: '+1/2 nivel a Supervivencia para rastrear.' },
      { name: 'Hazañas de Trabajo en Equipo', level: 6, description: 'Ganas hazañas adicionales de trabajo en equipo.' },
      { name: 'Sincronía con la Presa', level: 8, description: 'Tu compañero y tú compartís mejoras de combate.' },
      { name: 'Uno con la Bestia', level: 17, description: 'Puedes asumir las características físicas de tu foco animal.' },
      { name: 'Maestro de la Manada', level: 20, description: 'Tu compañero gana poderes divinos y tu foco se vuelve permanente.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Guerrero de la naturaleza con un compañero animal poderoso y magia de druid/explorador.',
    magicType: 'divine',
    casterAbility: 'wisdom',
    startingGoldDice: '4d6*10',
    proficiencies: { weapons: 'Todas las armas simples y marciales', armor: 'Armaduras ligeras y medias, escudos (no de torre)' },
    spellsPerDay: [
      [2, 1],               // lv 1
      [3, 2],               // lv 2
      [4, 3],               // lv 3
      [4, 3, 1],            // lv 4
      [4, 4, 2],            // lv 5
      [5, 4, 3],            // lv 6
      [5, 4, 3, 1],         // lv 7
      [5, 4, 4, 2],         // lv 8
      [5, 5, 4, 3],         // lv 9
      [5, 5, 4, 3, 1],      // lv 10
      [5, 5, 4, 4, 2],      // lv 11
      [5, 5, 5, 4, 3],      // lv 12
      [5, 5, 5, 4, 3, 1],   // lv 13
      [5, 5, 5, 4, 4, 2],   // lv 14
      [5, 5, 5, 5, 4, 3],   // lv 15
      [5, 5, 5, 5, 4, 3, 1], // lv 16
      [5, 5, 5, 5, 4, 4, 2], // lv 17
      [5, 5, 5, 5, 5, 4, 3], // lv 18
      [5, 5, 5, 5, 5, 5, 4], // lv 19
      [5, 5, 5, 5, 5, 5, 5], // lv 20
    ],
  },
  {
    id: 'shaman',
    source: 'acg' as const,
    name: 'Chamán',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'poor',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 4,
    classSkills: ['craft', 'diplomacy', 'fly', 'handle_animal', 'heal', 'knowledge_arcana', 'knowledge_nature', 'knowledge_planes', 'knowledge_religion', 'profession', 'ride', 'sense_motive', 'spellcraft', 'survival'],
    features: [
      { name: 'Espíritu', level: 1, description: 'Elige un espíritu que guía tus poderes: magia de espíritu y hex de espíritu.' },
      { name: 'Animal Espiritual', level: 1, description: 'Un espíritu animal se vincula a ti y almacena tus hechizos.' },
      { name: 'Orisons', level: 1, description: 'Lanzas hechizos de nivel 0 a voluntad.' },
      { name: 'Hex', level: 1, description: 'Ganas un hex de chamán: poderes que afectan a aliados y enemigos.' },
      { name: 'Espíritu Errante', level: 4, description: 'Puedes acceder a los poderes de un segundo espíritu.' },
      { name: 'Hex', level: 2, description: 'Ganas un hex adicional.' },
      { name: 'Hex', level: 4, description: 'Ganas un hex adicional.' },
      { name: 'Hex', level: 6, description: 'Ganas un hex adicional.' },
      { name: 'Gran Hex', level: 10, description: 'Accedes a hexes de mayor poder.' },
      { name: 'Hex Mayor', level: 10, description: 'Ganas un hex de alto nivel.' },
      { name: 'Hex', level: 12, description: 'Ganas un hex adicional.' },
      { name: 'Magia Espiritual Mayor', level: 14, description: 'El espíritu errante otorga poderes mejorados.' },
      { name: 'Hex', level: 16, description: 'Ganas un hex adicional.' },
      { name: 'Espíritu Verdadero', level: 20, description: 'Tu espíritu principal se vuelve parte de tu alma.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Lanzador divino que canaliza espíritus del mundo natural a través de un animal espiritual.',
    magicType: 'divine',
    casterAbility: 'wisdom',
    startingGoldDice: '3d6*10',
    proficiencies: { weapons: 'Armas simples', armor: 'Armaduras ligeras y medias, escudos (no de torre)' },
    spellsPerDay: [
      [3, 1],               // lv 1
      [4, 2],               // lv 2
      [4, 2, 1],            // lv 3
      [4, 3, 2],            // lv 4
      [4, 3, 2, 1],         // lv 5
      [4, 3, 3, 2],         // lv 6
      [4, 4, 3, 2, 1],      // lv 7
      [4, 4, 3, 3, 2],      // lv 8
      [4, 4, 4, 3, 2, 1],   // lv 9
      [4, 4, 4, 3, 3, 2],   // lv 10
      [4, 4, 4, 4, 3, 2, 1], // lv 11
      [4, 4, 4, 4, 3, 3, 2], // lv 12
      [4, 4, 4, 4, 4, 3, 2, 1], // lv 13
      [4, 4, 4, 4, 4, 3, 3, 2], // lv 14
      [4, 4, 4, 4, 4, 4, 3, 2, 1], // lv 15
      [4, 4, 4, 4, 4, 4, 3, 3, 2], // lv 16
      [4, 4, 4, 4, 4, 4, 4, 3, 2, 1], // lv 17
      [4, 4, 4, 4, 4, 4, 4, 3, 3, 2], // lv 18
      [4, 4, 4, 4, 4, 4, 4, 4, 3, 3], // lv 19
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4], // lv 20
    ],
  },
  {
    id: 'skald',
    source: 'acg' as const,
    name: 'Escaldo',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 4,
    classSkills: ['acrobatics', 'climb', 'craft', 'diplomacy', 'escape_artist', 'intimidate', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_engineering', 'knowledge_geography', 'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_nobility', 'knowledge_planes', 'knowledge_religion', 'linguistics', 'perception', 'perform', 'profession', 'sense_motive', 'spellcraft', 'swim', 'use_magic_device'],
    features: [
      { name: 'Canción Furiosa', level: 1, description: 'Otorga a aliados acceso a poderes de rabia controlada mientras cantas/recitas.' },
      { name: 'Conocimiento Bardo', level: 1, description: '+nivel/2 a todas las tiradas de Conocimiento.' },
      { name: 'Composición Versátil', level: 2, description: 'Puedes usar Representación para habilidades adicionales.' },
      { name: 'Poder de Rabia', level: 3, description: 'Ganas un poder de rabia bárbaro.' },
      { name: 'Bien Preparado', level: 5, description: '+2 a tiradas de ataque mientras la canción furiosa está activa.' },
      { name: 'Kenning del Hechizo', level: 6, description: 'Puedes lanzar hechizos de listas de druida o clérigo gastando puntos de actuación.' },
      { name: 'Poder de Rabia', level: 6, description: 'Ganas un poder de rabia adicional.' },
      { name: 'Actuación sin Fin', level: 8, description: 'Las rondas de actuación bárdica se extienden automáticamente.' },
      { name: 'Poder de Rabia', level: 9, description: 'Ganas un poder de rabia adicional.' },
      { name: 'Actuación Magistral', level: 12, description: 'Puedes iniciar actuación como acción rápida.' },
      { name: 'Poder de Rabia', level: 12, description: 'Ganas un poder de rabia adicional.' },
      { name: 'Poder de Rabia', level: 15, description: 'Ganas un poder de rabia adicional.' },
      { name: 'Actuación Perpetua', level: 20, description: 'Puedes mantener actuaciones sin límite de rondas.' },
    ],
    alignment: ['No Legal'],
    description: 'Bardo guerrero que inspira furia salvaje en sus aliados mientras relata hazañas épicas.',
    magicType: 'bardic',
    casterAbility: 'charisma',
    startingGoldDice: '3d6*10',
    proficiencies: { weapons: 'Armas simples y marciales', armor: 'Armaduras ligeras y medias, escudos (no de torre)' },
    spellsPerDay: [
      [2, 1],               // lv 1
      [3, 2],               // lv 2
      [4, 3],               // lv 3
      [4, 3, 1],            // lv 4
      [4, 4, 2],            // lv 5
      [5, 4, 3],            // lv 6
      [5, 4, 3, 1],         // lv 7
      [5, 4, 4, 2],         // lv 8
      [5, 5, 4, 3],         // lv 9
      [5, 5, 4, 3, 1],      // lv 10
      [5, 5, 4, 4, 2],      // lv 11
      [5, 5, 5, 4, 3],      // lv 12
      [5, 5, 5, 4, 3, 1],   // lv 13
      [5, 5, 5, 4, 4, 2],   // lv 14
      [5, 5, 5, 5, 4, 3],   // lv 15
      [5, 5, 5, 5, 4, 3, 1], // lv 16
      [5, 5, 5, 5, 4, 4, 2], // lv 17
      [5, 5, 5, 5, 5, 4, 3], // lv 18
      [5, 5, 5, 5, 5, 5, 4], // lv 19
      [5, 5, 5, 5, 5, 5, 5], // lv 20
    ],
  },
  {
    id: 'slayer',
    source: 'acg' as const,
    name: 'Exterminador',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'good',
    willSave: 'poor',
    skillPointsPerLevel: 6,
    classSkills: ['acrobatics', 'bluff', 'climb', 'craft', 'disguise', 'intimidate', 'knowledge_dungeoneering', 'knowledge_geography', 'knowledge_local', 'perception', 'profession', 'ride', 'sense_motive', 'stealth', 'survival', 'swim'],
    features: [
      { name: 'Objetivo Estudiado +1', level: 1, description: '+1 a ataques, CA y tiradas de habilidad vs un objetivo marcado. Acción rápida para marcar.' },
      { name: 'Rastrear', level: 1, description: '+1/2 nivel a Supervivencia para rastrear.' },
      { name: 'Talento del Exterminador', level: 2, description: 'Ganas un talento de explorador o pícaro.' },
      { name: 'Ataque Furtivo +1d6', level: 3, description: '+1d6 daño cuando el objetivo está desprevenido.' },
      { name: 'Objetivo Estudiado +2', level: 5, description: '+2 a ataques, CA y tiradas vs objetivo marcado.' },
      { name: 'Talento del Exterminador', level: 6, description: 'Ganas un talento adicional.' },
      { name: 'Ataque Furtivo +2d6', level: 7, description: '+2d6 daño cuando el objetivo está desprevenido.' },
      { name: 'Objetivo Estudiado +3', level: 10, description: '+3 a ataques, CA y tiradas vs objetivo marcado.' },
      { name: 'Ataque Furtivo +3d6', level: 11, description: '+3d6 daño cuando el objetivo está desprevenido.' },
      { name: 'Presa', level: 14, description: 'Marca a un enemigo y ganas +4 a ataques y siempre cuenta como flanqueado.' },
      { name: 'Ataque Furtivo +4d6', level: 15, description: '+4d6 daño cuando el objetivo está desprevenido.' },
      { name: 'Objetivo Estudiado +4', level: 15, description: '+4 a ataques, CA y tiradas vs objetivo marcado.' },
      { name: 'Presa Mayor', level: 19, description: 'Gastar una acción rápida para recuperar usos de presa.' },
      { name: 'Ataque Furtivo +5d6', level: 19, description: '+5d6 daño cuando el objetivo está desprevenido.' },
      { name: 'Objetivo Estudiado +5', level: 20, description: '+5 a ataques, CA y tiradas vs objetivo marcado.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Cazador de primas que estudia a sus objetivos para eliminarlos con eficiencia letal.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '5d6*10',
    proficiencies: { weapons: 'Todas las armas simples y marciales', armor: 'Armaduras ligeras y medias, escudos (no de torre)' },
  },
  {
    id: 'investigator',
    source: 'acg' as const,
    name: 'Investigador',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'poor',
    reflexSave: 'good',
    willSave: 'good',
    skillPointsPerLevel: 6,
    classSkills: ['appraise', 'bluff', 'craft', 'diplomacy', 'disable_device', 'disguise', 'escape_artist', 'heal', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_engineering', 'knowledge_geography', 'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_nobility', 'knowledge_planes', 'knowledge_religion', 'linguistics', 'perception', 'perform', 'profession', 'sense_motive', 'sleight_of_hand', 'spellcraft', 'stealth', 'use_magic_device'],
    features: [
      { name: 'Alquimia', level: 1, description: 'Creas extractos alquímicos (como hechizos de bardo/mago) preparados en un libro.' },
      { name: 'Inspiración', level: 1, description: 'Reserva de puntos = INT. Añade 1d6 a tiradas de habilidad o de ataque.' },
      { name: 'Buscar Trampas', level: 1, description: 'Busca trampas con Percepción; habilita Abrir Cerraduras.' },
      { name: 'Talento del Investigador', level: 2, description: 'Ganas un talento especial de investigador.' },
      { name: 'Alquimia Rápida', level: 3, description: 'Crea extractos más rápidamente.' },
      { name: 'Sentido de Trampa +1', level: 3, description: '+1 a Reflejos y CA contra trampas.' },
      { name: 'Combate Estudiado', level: 4, description: 'Acción de movimiento: +INT a tiradas de ataque cuerpo a cuerpo.' },
      { name: 'Golpe Estudiado +2d6', level: 4, description: 'Termina combate estudiado para añadir +2d6 daño.' },
      { name: 'Talento del Investigador', level: 4, description: 'Ganas un talento adicional.' },
      { name: 'Inspiración Amplia', level: 5, description: 'Puedes usar Inspiración en más tiradas de habilidad.' },
      { name: 'Golpe Estudiado +3d6', level: 6, description: '+3d6 al daño del golpe estudiado.' },
      { name: 'Evasión', level: 7, description: 'Con éxito en Reflejos, no sufres daño.' },
      { name: 'Golpe Estudiado +4d6', level: 8, description: '+4d6 al daño del golpe estudiado.' },
      { name: 'Gran Inspiración', level: 9, description: 'Puedes re-lanzar tiradas de habilidad usando inspiración.' },
      { name: 'Golpe Estudiado +5d6', level: 10, description: '+5d6 al daño del golpe estudiado.' },
      { name: 'Maestro Alquimista', level: 20, description: 'Tus extractos se potencian automáticamente al nivel máximo.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Detective alquímico que combina extractos mágicos e inspiración para resolver crímenes y eliminar enemigos.',
    magicType: 'alchemist',
    casterAbility: 'intelligence',
    startingGoldDice: '3d6*10',
    proficiencies: { weapons: 'Armas simples, ballesta de mano, rapieras, porras, arco corto, espada corta', armor: 'Armaduras ligeras' },
    spellsPerDay: [
      [1],               // lv 1
      [2],               // lv 2
      [3],               // lv 3
      [3, 1],            // lv 4
      [4, 2],            // lv 5
      [4, 3],            // lv 6
      [4, 3, 1],         // lv 7
      [4, 4, 2],         // lv 8
      [5, 4, 3],         // lv 9
      [5, 4, 3, 1],      // lv 10
      [5, 4, 4, 2],      // lv 11
      [5, 5, 4, 3],      // lv 12
      [5, 5, 4, 3, 1],   // lv 13
      [5, 5, 4, 4, 2],   // lv 14
      [5, 5, 5, 4, 3],   // lv 15
      [5, 5, 5, 4, 3, 1], // lv 16
      [5, 5, 5, 4, 4, 2], // lv 17
      [5, 5, 5, 5, 4, 3], // lv 18
      [5, 5, 5, 5, 5, 4], // lv 19
      [5, 5, 5, 5, 5, 5], // lv 20
    ],
  },
  {
    id: 'brawler',
    source: 'acg' as const,
    name: 'Pugilista',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'good',
    willSave: 'poor',
    skillPointsPerLevel: 4,
    classSkills: ['acrobatics', 'climb', 'craft', 'escape_artist', 'handle_animal', 'intimidate', 'knowledge_dungeoneering', 'knowledge_local', 'perception', 'profession', 'ride', 'sense_motive', 'swim'],
    features: [
      { name: 'Inteligencia Pugilista', level: 1, description: 'Usa INT en lugar de FUE para cumplir prerrequisitos de hazañas de combate cuerpo a cuerpo.' },
      { name: 'Golpe Desarmado', level: 1, description: 'Daño desarmado 1d6, no provoca AoO.' },
      { name: 'Flexibilidad Marcial', level: 2, description: 'Gana temporalmente hazañas de combate durante el combate sin cumplir prerrequisitos.' },
      { name: 'Entrenamiento de Maniobras', level: 3, description: '+1 a CMB con una maniobra de combate.' },
      { name: 'Bono de CA', level: 4, description: '+1 CA sin armadura o con armadura ligera.' },
      { name: 'Golpe del Pugilista', level: 5, description: 'Ataques desarmados superan DR/magia.' },
      { name: 'Golpe de Nocaut', level: 5, description: 'Una vez/día: una criatura golpeada debe superar Fort o queda inconsciente.' },
      { name: 'Entrenamiento de Maniobras', level: 7, description: '+1 a CMB con maniobra adicional.' },
      { name: 'Cerrar Hueco', level: 8, description: 'No provocas ataques de oportunidad al moverte junto a enemigos.' },
      { name: 'Golpe Feroz', level: 9, description: 'Ataques cuerpo a cuerpo superan DR/plata e hierro frío.' },
      { name: 'Entrenamiento de Maniobras', level: 11, description: '+1 a CMB con maniobra adicional.' },
      { name: 'Bono de CA mejorado', level: 12, description: '+2 CA sin armadura o con armadura ligera.' },
      { name: 'Golpe Legendario', level: 17, description: 'Ataques superan DR/adamantina y DR/—.' },
      { name: 'Maestro del Combate Desarmado', level: 20, description: 'Tu golpe desarmado tiene el doble de multiplicador de crítico.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Luchador versátil que mezcla técnicas del guerrero y el monje con flexibilidad táctica.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '3d6*10',
    proficiencies: { weapons: 'Armas simples y marciales, armas de monje', armor: 'Armaduras ligeras y medias, escudos' },
  },
  {
    id: 'bloodrager',
    source: 'acg' as const,
    name: 'Rabioso de sangre',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'poor',
    skillPointsPerLevel: 4,
    classSkills: ['acrobatics', 'climb', 'craft', 'handle_animal', 'intimidate', 'knowledge_arcana', 'perception', 'ride', 'spellcraft', 'survival', 'swim'],
    features: [
      { name: 'Rabia de Sangre', level: 1, description: '+4 FUE y CON, +2 Voluntad, −2 CA. Puede lanzar conjuros durante la rabia. Rondas/día = 4 + CON + 2×(nivel−1).' },
      { name: 'Movimiento Rápido', level: 1, description: '+10 pies a velocidad base en tierra.' },
      { name: 'Linaje de Sangre', level: 1, description: 'Poder de un linaje de sangre arcana que otorga habilidades únicas.' },
      { name: 'Sentido de Trampa +1', level: 3, description: '+1 a Reflejos y CA contra trampas.' },
      { name: 'Poder de Linaje', level: 4, description: 'El linaje de sangre otorga un poder adicional.' },
      { name: 'Castigo de Sangre', level: 4, description: 'Puedes lanzar conjuros mientras estás en rabia de sangre.' },
      { name: 'Descaro Indomable', level: 5, description: '+2 a Voluntad mientras estás en rabia de sangre.' },
      { name: 'Reducción de Daño 1/—', level: 7, description: 'DR 1/— mientras no estás en rabia.' },
      { name: 'Sentido de Trampa +2', level: 6, description: '+2 a Reflejos y CA contra trampas.' },
      { name: 'Rabia Mayor', level: 11, description: '+6 FUE y CON, +3 Voluntad, −2 CA.' },
      { name: 'Poder de Linaje Mayor', level: 12, description: 'El linaje otorga un poder de mayor nivel.' },
      { name: 'Rabia Incansable', level: 17, description: 'Ya no te fatigas al salir de la rabia.' },
      { name: 'Poder de Linaje Superior', level: 20, description: 'El poder definitivo de tu linaje arcano se despierta.' },
      { name: 'Rabia de Sangre Mítica', level: 20, description: 'Tu rabia de sangre dura sin límite de rondas.' },
    ],
    alignment: ['Cualquiera no legal'],
    description: 'Híbrido de bárbaro y hechicero cuya sangre mágica explota en una rabia arcana devastadora.',
    magicType: 'arcane',
    casterAbility: 'charisma',
    startingGoldDice: '4d6*10',
    proficiencies: { weapons: 'Armas simples y marciales', armor: 'Armaduras ligeras y medias, escudos (no de torre)' },
    spellsPerDay: [
      [],              // lv 1
      [],              // lv 2
      [],              // lv 3
      [1],             // lv 4
      [1],             // lv 5
      [1],             // lv 6
      [1, 1],          // lv 7
      [1, 1],          // lv 8
      [2, 1],          // lv 9
      [2, 1, 1],       // lv 10
      [2, 1, 1],       // lv 11
      [2, 1, 1, 1],    // lv 12
      [3, 2, 1, 1],    // lv 13
      [3, 2, 1, 1],    // lv 14
      [3, 2, 1, 1],    // lv 15
      [3, 2, 2, 1],    // lv 16
      [4, 3, 2, 1],    // lv 17
      [4, 3, 2, 1],    // lv 18
      [4, 3, 3, 2],    // lv 19
      [4, 3, 3, 2],    // lv 20
    ],
  },
]

export function getClassById(id: string): ClassData | undefined {
  return CLASSES.find((c) => c.id === id) ?? homebrewStore.getState().classes.find((c) => c.id === id)
}

export function getBABForLevel(level: number, babType: 'good' | 'medium' | 'poor'): number {
  if (babType === 'good') {
    return Math.floor(level * 1)
  } else if (babType === 'medium') {
    return Math.floor(level * 0.75)
  }
  return Math.floor(level / 2)
}

export function getSaveForLevel(level: number, saveType: 'good' | 'poor'): number {
  if (saveType === 'good') {
    return 2 + Math.floor(level / 2)
  }
  return Math.floor(level / 3)
}

export interface MulticlassStats {
  bab: number
  fortitude: number
  reflex: number
  will: number
}

export function getMulticlassStats(classes: CharacterClass[]): MulticlassStats {
  let bab = 0, fortitude = 0, reflex = 0, will = 0
  for (const cc of classes) {
    const cd = getClassById(cc.id)
    if (!cd) continue
    bab += getBABForLevel(cc.level, cd.baseAttackBonus)
    fortitude += getSaveForLevel(cc.level, cd.fortitudeSave)
    reflex += getSaveForLevel(cc.level, cd.reflexSave)
    will += getSaveForLevel(cc.level, cd.willSave)
  }
  return { bab, fortitude, reflex, will }
}
