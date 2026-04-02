import type { CharacterClass } from '../store/characterStore'

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
  spellsPerDay?: SpellsPerDayTable
  spellsKnown?: SpellsKnownTable
}

export const CLASSES: ClassData[] = [
  {
    id: 'barbarian',
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
  },
  {
    id: 'bard',
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
  },
  {
    id: 'cleric',
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
  },
  {
    id: 'druid',
    name: 'Druida',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 4,
    classSkills: ['climb', 'craft', 'fly', 'handle_animal', 'heal', 'knowledge_geography', 'knowledge_nature', 'perception', 'profession', 'ride', 'spellcraft', 'survival', 'swim'],
    features: [
      { name: 'Vínculo con Naturaleza', level: 1, description: 'Elige compañero animal o dominio de naturaleza.' },
      { name: 'Empatía Salvaje', level: 1, description: 'Puedes mejorar actitud de animales como Diplomacia.' },
      { name: 'Lenguaje del Bosque', level: 2, description: 'Puedes hablar con plantas y animales.' },
      { name: 'Resistencia a Veneno +4', level: 2, description: '+4 a TS contra venenos.' },
      { name: 'Movimiento en la Maleza', level: 2, description: 'Sin penalización por terreno difícil natural.' },
      { name: 'Rastrear +1', level: 2, description: '+1 a Supervivencia para rastrear.' },
      { name: 'Resistencia a Veneno +6', level: 6, description: '+6 a TS contra venenos.' },
      { name: 'Rastrear +2', level: 4, description: '+2 a Supervivencia para rastrear.' },
      { name: 'Forma Salvaje Menor', level: 4, description: 'Puedes transformarte en animal de talla P o M.' },
      { name: 'Resistencia a Veneno +8', level: 10, description: '+8 a TS contra venenos.' },
      { name: 'Rastrear +3', level: 6, description: '+3 a Supervivencia para rastrear.' },
      { name: 'Forma Salvaje', level: 6, description: 'Puedes transformarte en animal de talla M o G.' },
      { name: 'Rastrear +4', level: 8, description: '+4 a Supervivencia para rastrear.' },
      { name: 'Inmunidad a Venenos', level: 9, description: 'Inmune a venenos naturales.' },
      { name: 'Rastrear +5', level: 10, description: '+5 a Supervivencia para rastrear.' },
      { name: 'Forma Salvaje Mayor', level: 10, description: 'Puedes transformarte en animal de talla G.' },
      { name: 'A Thousand Faces', level: 13, description: 'Puedes cambiar tu apariencia voluntariamente.' },
      { name: 'Rastrear +6', level: 12, description: '+6 a Supervivencia para rastrear.' },
      { name: 'No Envejece', level: 15, description: 'Ya no sufres penalizaciones por envejecimiento.' },
      { name: 'Rastrear +7', level: 14, description: '+7 a Supervivencia para rastrear.' },
      { name: 'Rastrear +8', level: 16, description: '+8 a Supervivencia para rastrear.' },
      { name: 'Rastrear +9', level: 18, description: '+9 a Supervivencia para rastrear.' },
      { name: 'Rastrear +10', level: 20, description: '+10 a Supervivencia para rastrear.' },
    ],
    alignment: ['Neutral'],
    description: 'Protectors de la naturaleza con magia primitiva.',
    magicType: 'divine',
    casterAbility: 'wisdom',
    startingGoldDice: '2d6*10',
  },
  {
    id: 'fighter',
    name: 'Guerrero',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'poor',
    skillPointsPerLevel: 2,
    classSkills: ['climb', 'craft', 'handle_animal', 'intimidate', 'knowledge_dungeoneering', 'knowledge_engineering', 'profession', 'ride', 'survival', 'swim'],
    features: [
      { name: 'Competencia con Armas y Armaduras', level: 1, description: 'Competente con todas las armas marciales, escudos y armaduras.' },
      { name: 'Talento de Combate', level: 1, description: 'Ganas un talento de combate.' },
      { name: 'Valentía +1', level: 2, description: '+1 a TS contra efectos de miedo.' },
      { name: 'Entrenamiento de Armadura', level: 3, description: 'Reduces penalización de armadura en 1 y aumentas máx DES en 1.' },
      { name: 'Talento de Combate', level: 4, description: 'Ganas un talento de combate.' },
      { name: 'Entrenamiento de Arma', level: 5, description: '+1 ataque y daño con grupo de armas elegido.' },
      { name: 'Valentía +2', level: 6, description: '+2 a TS contra efectos de miedo.' },
      { name: 'Talento de Combate', level: 6, description: 'Ganas un talento de combate.' },
      { name: 'Entrenamiento de Armadura', level: 7, description: 'Reduces penalización de armadura en 2 y aumentas máx DES en 2.' },
      { name: 'Entrenamiento de Arma +2', level: 9, description: '+2 ataque y daño con grupo de armas elegido.' },
      { name: 'Valentía +3', level: 10, description: '+3 a TS contra efectos de miedo.' },
      { name: 'Talento de Combate', level: 10, description: 'Ganas un talento de combate.' },
      { name: 'Entrenamiento de Armadura', level: 11, description: 'Reduces penalización de armadura en 3 y aumentas máx DES en 3.' },
      { name: 'Entrenamiento de Arma +3', level: 13, description: '+3 ataque y daño con grupo de armas elegido.' },
      { name: 'Valentía +4', level: 14, description: '+4 a TS contra efectos de miedo.' },
      { name: 'Talento de Combate', level: 14, description: 'Ganas un talento de combate.' },
      { name: 'Entrenamiento de Armadura', level: 15, description: 'Reduces penalización de armadura en 4 y aumentas máx DES en 4.' },
      { name: 'Entrenamiento de Arma +4', level: 17, description: '+4 ataque y daño con grupo de armas elegido.' },
      { name: 'Talento de Combate', level: 18, description: 'Ganas un talento de combate.' },
      { name: 'Maestría de Arma', level: 20, description: 'Confirma críticos automáticamente con arma elegida y +2 al multiplicador de crítico.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Maestros del combate armado.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '5d6*10',
  },
  {
    id: 'monk',
    name: 'Monje',
    hitDie: 8,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'good',
    willSave: 'good',
    skillPointsPerLevel: 4,
    classSkills: ['acrobatics', 'climb', 'craft', 'escape_artist', 'intimidate', 'knowledge_history', 'knowledge_religion', 'perception', 'perform', 'profession', 'ride', 'sense_motive', 'stealth', 'swim'],
    features: [
      { name: 'Golpe sin Arma', level: 1, description: 'Daño desarmado como monje; no provoca AoO. Daño 1d10.' },
      { name: 'Golpe Aturdidor', level: 1, description: 'Gasta 1 uso para aturdir o fatigar. Usos = nivel + mod SAB.' },
      { name: 'Bonificador de Armadura Natural +1', level: 1, description: '+1 CA cuando no se viste armadura.' },
      { name: 'Evasión', level: 2, description: 'Con éxito en Reflejos, no sufres daño (falla = daño medio).' },
      { name: 'Movimiento Rápido', level: 3, description: '+10 pies a velocidad base en tierra.' },
      { name: 'Bonificador de Armadura Natural +2', level: 4, description: '+2 CA cuando no se viste armadura.' },
      { name: 'Ki Pool', level: 4, description: 'Reserva de ki = nivel/2 + mod SAB. Gasta para ataques extra, velocidad o habilidades.' },
      { name: 'Caída Lenta 20 pies', level: 4, description: 'Reduce la caída libre hasta 20 pies.' },
      { name: 'Pureza de Cuerpo', level: 5, description: 'Inmune a enfermedades.' },
      { name: 'Golpe Integral', level: 7, description: 'Tus golpes se consideran mágicos para superar reducción de daño.' },
      { name: 'Serenidad', level: 7, description: '+2 a TS contra hechizos de encantamiento y efectos de miedo.' },
      { name: 'Bonificador de Armadura Natural +3', level: 8, description: '+3 CA cuando no se viste armadura.' },
      { name: 'Caída Lenta 30 pies', level: 8, description: 'Reduce la caída libre hasta 30 pies.' },
      { name: 'Movimiento Rápido +20 pies', level: 11, description: '+20 pies a velocidad base en tierra.' },
      { name: 'Bonificador de Armadura Natural +4', level: 12, description: '+4 CA cuando no se viste armadura.' },
      { name: 'Caída Lenta 40 pies', level: 12, description: 'Reduce la caída libre hasta 40 pies.' },
      { name: 'Cuerpo Inmortal', level: 15, description: 'Ya no envejeces y no puedes morir por vejez.' },
      { name: 'Bonificador de Armadura Natural +5', level: 16, description: '+5 CA cuando no se viste armadura.' },
      { name: 'Caída Lenta 50 pies', level: 16, description: 'Reduce la caída libre hasta 50 pies.' },
      { name: 'Golpe Vacío', level: 19, description: 'Tus ataques desarmados ignoran efectos de invisibilidad.' },
      { name: 'Bonificador de Armadura Natural +6', level: 20, description: '+6 CA cuando no se viste armadura.' },
      { name: 'Caída Lenta 60 pies', level: 20, description: 'Reduce la caída libre hasta 60 pies.' },
      { name: 'Ser Perfecto', level: 20, description: 'Inmune a enfermedades, venenos, hechizos y efectos de envejecimiento.' },
    ],
    alignment: ['Legal Neutral', 'Legal Bueno', 'Neutral', 'Caótico Bueno'],
    description: 'Artes marciales con poderes místicos.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '1d6*10',
  },
  {
    id: 'paladin',
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
  },
  {
    id: 'ranger',
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
  },
  {
    id: 'rogue',
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
  },
  {
    id: 'sorcerer',
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
  },
  {
    id: 'wizard',
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
      { name: 'Bombas', level: 1, description: 'Creas bombas explosivas que inflijen daño de fuego.' },
      { name: 'Mutágeno', level: 1, description: 'Bebes una mezcla que mejora tu físico a costa de tu mente.' },
      { name: 'Descubrimientos', level: 2, description: 'Aprendes descubrimientos alquímicos especiales.' },
      { name: 'Veneno Resistente +2', level: 2, description: '+2 a TS contra venenos.' },
      { name: 'Lanzador Rápido', level: 4, description: 'Puedes lanzar bombas como acción rápida.' },
      { name: 'Veneno Resistente +4', level: 5, description: '+4 a TS contra venenos.' },
      { name: 'Veneno Resistente +6', level: 8, description: '+6 a TS contra venenos.' },
      { name: 'Gran Mutágeno', level: 14, description: 'Tu mutágeno mejora dos atributos físicos.' },
      { name: 'Gran Gran Mutágeno', level: 16, description: 'Tu mutágeno mejora tres atributos físicos.' },
      { name: 'Instilación Instantánea', level: 18, description: 'Puedes crear extractos como acción rápida.' },
      { name: 'Forma Milagrosa', level: 20, description: 'Tu cuerpo se vuelve completamente resistente a ciertos daños.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Maestros de la alquimia que crean pociones, bombas y mutágenos.',
    magicType: 'alchemist',
    casterAbility: 'intelligence',
    startingGoldDice: '3d6*10',
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
      { name: 'Revelación', level: 1, description: 'Ganas una revelación del misterio elegido.' },
      { name: 'Maldición de Oráculo', level: 1, description: 'Tu vínculo con los dioses viene con una debilidad permanente.' },
      { name: 'Revelación Adicional', level: 3, description: 'Ganas otra revelación del misterio.' },
      { name: 'Revelación Adicional', level: 5, description: 'Ganas otra revelación del misterio.' },
      { name: 'Revelation Mejorada', level: 7, description: 'Algunas revelaciones se potencian.' },
      { name: 'Revelación Adicional', level: 9, description: 'Ganas otra revelación del misterio.' },
      { name: 'Gran Revelación', level: 11, description: 'Accedes a las revelaciones más poderosas de tu misterio.' },
      { name: 'Revelación Adicional', level: 13, description: 'Ganas otra revelación del misterio.' },
      { name: 'Revelación Adicional', level: 15, description: 'Ganas otra revelación del misterio.' },
      { name: 'Revelación Adicional', level: 17, description: 'Ganas otra revelación del misterio.' },
      { name: 'Revelación Final', level: 20, description: 'La revelación definitiva transforma tu ser.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Canalizadores de poder divino guiados por una maldición y un misterio.',
    magicType: 'divine',
    casterAbility: 'charisma',
    startingGoldDice: '3d6*10',
    spellsPerDay: [
      [4, 3],               // lv 1
      [5, 4],               // lv 2
      [5, 4, 2],             // lv 3
      [5, 5, 3],             // lv 4
      [5, 5, 3, 2],           // lv 5
      [5, 5, 4, 3],           // lv 6
      [5, 5, 4, 3, 2],         // lv 7
      [5, 5, 4, 4, 3],         // lv 8
      [5, 5, 5, 4, 3, 2],       // lv 9
      [5, 5, 5, 4, 4, 3],       // lv 10
      [5, 5, 5, 5, 4, 3, 2],     // lv 11
      [5, 5, 5, 5, 4, 4, 3],     // lv 12
      [5, 5, 5, 5, 5, 4, 3, 2],   // lv 13
      [5, 5, 5, 5, 5, 4, 4, 3],   // lv 14
      [5, 5, 5, 5, 5, 5, 4, 3, 2], // lv 15
      [5, 5, 5, 5, 5, 5, 4, 4, 3], // lv 16
      [5, 5, 5, 5, 5, 5, 5, 4, 3, 2],// lv 17
      [5, 5, 5, 5, 5, 5, 5, 4, 4, 3],// lv 18
      [5, 5, 5, 5, 5, 5, 5, 5, 4, 4],// lv 19
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5],// lv 20
    ],
  },
  {
    id: 'inquisitor',
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
      { name: 'Juicio', level: 1, description: 'Puedes proclamar juicio sobre un enemigo, ganando bonificadores de combate.' },
      { name: 'Juzgar al Monstruo', level: 1, description: '+2 a las tiradas de Conocimiento para identificar criaturas.' },
      { name: 'Rastrear', level: 1, description: '+1 por nivel a Supervivencia para rastrear.' },
      { name: 'Magia del Inquisidor', level: 1, description: 'Lanzas hechizos divinos del inquisidor.' },
      { name: 'Juicio Adicional', level: 3, description: 'Puedes pronunciar un juicio adicional simultáneo.' },
      { name: 'Golpe del Inquisidor', level: 5, description: '+1d6 de daño extra en la primera ronda de combate.' },
      { name: 'Juicio Adicional', level: 7, description: 'Puedes pronunciar un juicio adicional simultáneo.' },
      { name: 'Gran Juicio', level: 10, description: 'Tus juicios se potencian.' },
      { name: 'Juicio Adicional', level: 13, description: 'Puedes pronunciar un juicio adicional simultáneo.' },
      { name: 'Gran Rastreo', level: 12, description: 'Puedes rastrear a velocidad completa sin penalizar.' },
      { name: 'Juicio Adicional', level: 16, description: 'Puedes pronunciar un juicio adicional simultáneo.' },
      { name: 'Juicio Definitivo', level: 20, description: 'Tu juicio es absoluto e irresistible.' },
    ],
    alignment: ['Cualquiera (misma deidad)'],
    description: 'Cazadores de herejes que combinan magia divina y habilidades de combate.',
    magicType: 'divine',
    casterAbility: 'wisdom',
    startingGoldDice: '4d6*10',
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
  },
  {
    id: 'witch',
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
    name: 'Caballero',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'poor',
    skillPointsPerLevel: 4,
    classSkills: ['bluff', 'climb', 'craft', 'diplomacy', 'handle_animal', 'intimidate', 'profession', 'ride', 'sense_motive', 'swim'],
    features: [
      { name: 'Orden', level: 1, description: 'Juras lealtad a una orden caballeresca que te otorga poderes especiales.' },
      { name: 'Montura', level: 1, description: 'Obtienes una montura especial como compañero permanente.' },
      { name: 'Desafío', level: 1, description: 'Puedes desafiar a un enemigo, ganando bonificadores de ataque y daño contra él.' },
      { name: 'Inspeccionar', level: 2, description: 'Puedes analizar a los enemigos para revelar sus debilidades.' },
      { name: 'Carga Montada', level: 3, description: 'Puedes realizar cargas con la montura con mayor eficacia.' },
      { name: 'Desafío', level: 4, description: 'Puedes desafiar a un enemigo, ganando bonificadores.' },
      { name: 'Defensa de Bandera', level: 5, description: 'Proteges a tus aliados con tu presencia.' },
      { name: 'Desafío', level: 7, description: 'Puedes desafiar a un enemigo, ganando bonificadores.' },
      { name: 'Desafío', level: 10, description: 'Puedes desafiar a un enemigo, ganando bonificadores.' },
      { name: 'Gran Desafío', level: 12, description: 'Tu desafío se vuelve más poderoso.' },
      { name: 'Desafío', level: 13, description: 'Puedes desafiar a un enemigo, ganando bonificadores.' },
      { name: 'Desafío', level: 16, description: 'Puedes desafiar a un enemigo, ganando bonificadores.' },
      { name: 'Maestro de la Carga', level: 17, description: 'Tus cargas son devastadoras.' },
      { name: 'Campeón Supremo', level: 20, description: 'Alcanzas la cima de la orden caballeresca.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Guerreros montados vinculados a una orden caballeresca.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '5d6*10',
  },
  {
    id: 'magus',
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
  },
  {
    id: 'swashbuckler',
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
  },
  {
    id: 'vigilante',
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
  },
  {
    id: 'warpriest',
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
]

export function getClassById(id: string): ClassData | undefined {
  return CLASSES.find((c) => c.id === id)
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
    bab       += getBABForLevel(cc.level, cd.baseAttackBonus)
    fortitude += getSaveForLevel(cc.level, cd.fortitudeSave)
    reflex    += getSaveForLevel(cc.level, cd.reflexSave)
    will      += getSaveForLevel(cc.level, cd.willSave)
  }
  return { bab, fortitude, reflex, will }
}
