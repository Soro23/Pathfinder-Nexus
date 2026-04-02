import type { CharacterClass } from '../store/characterStore'

export interface ClassFeature {
  name: string
  level: number
  description: string
}

export type MagicType = 'arcane' | 'divine' | 'bardic' | 'alchemist' | null

// spellsPerDay[charLevel - 1][spellLevel] = number of slots (undefined = no access)
export type SpellsPerDayTable = Array<Array<number | undefined>>

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
      { name: 'Grimorio', level: 1, description: 'Tienes un libro de hechizos.' },
      { name: 'Escuela de Especialización', level: 1, description: 'Te especializas en una escuela de magia.' },
      { name: 'Descanso de Estudio', level: 1, description: 'Puedes preparar hechizos durante el descanso.' },
      { name: 'Hechizo de Grimorio', level: 3, description: 'Puedes copiar hechizos adicionales de pergaminos y otros grimorios.' },
      { name: 'Hechizo en Bono', level: 5, description: 'Ganas un poder de escuela adicional.' },
      { name: 'Arma de Mago', level: 7, description: 'Puedes usar un tipo de arma marcial.' },
      { name: 'Grimorio Mejorado', level: 10, description: 'Tu grimorio gana protecciones mágicas.' },
      { name: 'Maestría Arcana', level: 15, description: 'Reduces el coste de componentes en hechizos de tu escuela.' },
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
      { name: 'Maldición de Bruja', level: 1, description: 'Puedes maldecir a los enemigos con efectos debilitantes.' },
      { name: 'Patrono', level: 1, description: 'Pides hechizos a un patrono misterioso.' },
      { name: 'Hex', level: 2, description: 'Ganas hexes: poderes de bruja especiales de efecto variado.' },
      { name: 'Hex', level: 4, description: 'Ganas hexes adicionales.' },
      { name: 'Hex', level: 6, description: 'Ganas hexes adicionales.' },
      { name: 'Hex', level: 8, description: 'Ganas hexes adicionales.' },
      { name: 'Gran Hex', level: 10, description: 'Accedes a hexes de mayor poder.' },
      { name: 'Hex', level: 12, description: 'Ganas hexes adicionales.' },
      { name: 'Hex', level: 14, description: 'Ganas hexes adicionales.' },
      { name: 'Hex', level: 16, description: 'Ganas hexes adicionales.' },
      { name: 'Hex Mayor', level: 18, description: 'Accedes a los hexes más poderosos de la bruja.' },
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
      { name: 'Lazo', level: 1, description: 'Tu vínculo con el eidolón te otorga poderes especiales.' },
      { name: 'Invocación (SM I)', level: 1, description: 'Puedes convocar criaturas como conjuración summon.' },
      { name: 'Evolucionar Eidolón', level: 1, description: 'Tu eidolón gana puntos de evolución para mejorar sus capacidades.' },
      { name: 'Fusión Carnal', level: 4, description: 'Puedes fusionarte con tu eidolón.' },
      { name: 'Invocación Mejorada', level: 7, description: 'Invocaciones más poderosas.' },
      { name: 'Fusión Carnal Mejorada', level: 9, description: 'Fusión más efectiva con el eidolón.' },
      { name: 'Invocación Mejorada', level: 11, description: 'Invocaciones más poderosas.' },
      { name: 'Fuerza del Transporte', level: 12, description: 'Tu convocación se acelera.' },
      { name: 'Invocación Mejorada', level: 15, description: 'Invocaciones más poderosas.' },
      { name: 'Gran Invocación', level: 19, description: 'Puedes invocar criaturas extremadamente poderosas.' },
      { name: 'Vínculo Eterno', level: 20, description: 'Tu vínculo con el eidolón trasciende la vida y la muerte.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Mágicos vinculados a un eidolón: una criatura extraplanar personalizable.',
    magicType: 'arcane',
    casterAbility: 'charisma',
    startingGoldDice: '2d6*10',
    spellsPerDay: [
      [4, 1],           // lv 1
      [5, 2],           // lv 2
      [5, 3],           // lv 3
      [5, 3, 1],         // lv 4
      [5, 4, 2],         // lv 5
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
  // ── Remaining Base Classes ──
  {
    id: 'gunslinger',
    name: 'Pistolero',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'good',
    willSave: 'poor',
    skillPointsPerLevel: 4,
    classSkills: ['acrobatics', 'bluff', 'climb', 'craft', 'handle_animal', 'heal', 'intimidate', 'knowledge_engineering', 'knowledge_local', 'perception', 'profession', 'ride', 'sleight_of_hand', 'survival', 'swim'],
    features: [
      { name: 'Chispa', level: 1, description: 'Puntos de suerte que usas para hazañas y trucos de pistolero.' },
      { name: 'Destreza con Armas de Fuego', level: 1, description: 'Usas DES en lugar de FUE para tiradas de ataque con armas de fuego.' },
      { name: 'Trucos de Pistolero', level: 1, description: 'Aprendes trucos especiales de combate con armas de fuego.' },
      { name: 'Disparo Rápido', level: 2, description: 'Puedes recargar como acción libre.' },
      { name: 'Trucos de Pistolero', level: 4, description: 'Aprendes trucos adicionales.' },
      { name: 'Disparo Certero', level: 5, description: 'Ignoras el rango de penalización y la cobertura parcial.' },
      { name: 'Trucos de Pistolero', level: 7, description: 'Aprendes trucos adicionales.' },
      { name: 'Trucos de Pistolero', level: 9, description: 'Aprendes trucos adicionales.' },
      { name: 'Gran Disparo', level: 11, description: 'Tus disparos son extremadamente precisos.' },
      { name: 'Trucos de Pistolero', level: 13, description: 'Aprendes trucos adicionales.' },
      { name: 'Trucos de Pistolero', level: 15, description: 'Aprendes trucos adicionales.' },
      { name: 'Trucos de Pistolero', level: 17, description: 'Aprendes trucos adicionales.' },
      { name: 'Maestro Pistolero', level: 20, description: 'Alcanzas la cima del dominio de las armas de fuego.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Maestro de las armas de fuego que combina velocidad, precisión y chispa.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '4d6*10',
  },
  {
    id: 'shifter',
    name: 'Cambiaformas',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'good',
    willSave: 'poor',
    skillPointsPerLevel: 4,
    classSkills: ['acrobatics', 'climb', 'fly', 'handle_animal', 'knowledge_nature', 'perception', 'profession', 'ride', 'stealth', 'survival', 'swim'],
    features: [
      { name: 'Aspecto de Cambista', level: 1, description: 'Adoptas aspectos de animales, ganando sus características parcialmente.' },
      { name: 'Garras de Cambista', level: 1, description: 'Ataques de garra que mejoran según el aspecto adoptado.' },
      { name: 'Forma Salvaje', level: 4, description: 'Puedes transformarte completamente en animal.' },
      { name: 'Aspecto Menor', level: 4, description: 'Puedes activar dos aspectos simultáneamente.' },
      { name: 'Garras de Cambista +1', level: 6, description: 'Tus ataques de garra mejoran.' },
      { name: 'Garras de Cambista +2', level: 8, description: 'Tus ataques de garra mejoran.' },
      { name: 'Aspecto Mayor', level: 9, description: 'Tus aspectos se potencian enormemente.' },
      { name: 'Garras de Cambista +3', level: 10, description: 'Tus ataques de garra mejoran.' },
      { name: 'Garras de Cambista +4', level: 12, description: 'Tus ataques de garra mejoran.' },
      { name: 'Garras de Cambista +5', level: 14, description: 'Tus ataques de garra mejoran.' },
      { name: 'Garras de Cambista +6', level: 16, description: 'Tus ataques de garra mejoran.' },
      { name: 'Garras de Cambista +7', level: 18, description: 'Tus ataques de garra mejoran.' },
      { name: 'Forma Legendaria', level: 20, description: 'Te transformas en una criatura legendaria.' },
    ],
    alignment: ['Neutral'],
    description: 'Guardián de la naturaleza que adopta formas y aspectos animales.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '3d6*10',
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
      { name: 'Identidad Doble', level: 1, description: 'Tienes dos identidades: una social y una de vigilante con habilidades distintas.' },
      { name: 'Cambio de Identidad', level: 1, description: 'Cambias de identidad en 1 minuto.' },
      { name: 'Talentos de Vigilante', level: 2, description: 'Ganas talentos especiales de vigilante.' },
      { name: 'Visión en la Oscuridad', level: 3, description: 'Puedes ver en la oscuridad.' },
      { name: 'Talentos de Vigilante', level: 4, description: 'Ganas talentos adicionales.' },
      { name: 'Estilo de Lucha', level: 4, description: 'Adoptas un estilo de combate único.' },
      { name: 'Talentos de Vigilante', level: 6, description: 'Ganas talentos adicionales.' },
      { name: 'Talentos de Vigilante', level: 8, description: 'Ganas talentos adicionales.' },
      { name: 'Talentos de Vigilante', level: 10, description: 'Ganas talentos adicionales.' },
      { name: 'Ataque sin Dejar Rastro', level: 11, description: 'Tus ataques no pueden rastrearse hasta tu identidad social.' },
      { name: 'Talentos de Vigilante', level: 12, description: 'Ganas talentos adicionales.' },
      { name: 'Talentos de Vigilante', level: 14, description: 'Ganas talentos adicionales.' },
      { name: 'Talentos de Vigilante', level: 16, description: 'Ganas talentos adicionales.' },
      { name: 'Talentos de Vigilante', level: 18, description: 'Ganas talentos adicionales.' },
      { name: 'Identidad Legendaria', level: 20, description: 'Tu identidad de vigilante se convierte en leyenda.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Héroe de doble identidad que opera entre la sociedad y las sombras.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '3d6*10',
  },
  // ── Hybrid Classes ──
  {
    id: 'arcanist',
    name: 'Arcanista',
    hitDie: 6,
    baseAttackBonus: 'poor',
    fortitudeSave: 'poor',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 2,
    classSkills: ['appraise', 'craft', 'fly', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_engineering', 'knowledge_geography', 'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_nobility', 'knowledge_planes', 'knowledge_religion', 'linguistics', 'profession', 'spellcraft', 'use_magic_device'],
    features: [
      { name: 'Grimorio', level: 1, description: 'Tienes un grimorio que determina qué hechizos puedes preparar.' },
      { name: 'Conjuros Conocidos', level: 1, description: 'Conoces hechizos como un hechicero.' },
      { name: 'Explotación Arcana', level: 1, description: 'Consumes ranuras para activar explotaciones mágicas especiales.' },
      { name: 'Explotaciones', level: 3, description: 'Ganas explotaciones: poderes arcanos especiales.' },
      { name: 'Explotaciones', level: 5, description: 'Ganas explotaciones adicionales.' },
      { name: 'Explotaciones', level: 7, description: 'Ganas explotaciones adicionales.' },
      { name: 'Explotaciones', level: 9, description: 'Ganas explotaciones adicionales.' },
      { name: 'Gran Explotación', level: 11, description: 'Accedes a las explotaciones más poderosas.' },
      { name: 'Explotaciones', level: 13, description: 'Ganas explotaciones adicionales.' },
      { name: 'Explotaciones', level: 15, description: 'Ganas explotaciones adicionales.' },
      { name: 'Explotaciones', level: 17, description: 'Ganas explotaciones adicionales.' },
      { name: 'Maestría Arcana', level: 20, description: 'Dominas la magia arcana como nadie más.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Fusión de mago y hechicero que combina preparación con magia innata.',
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
    id: 'bloodrager',
    name: 'Rabioso de Sangre',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'poor',
    skillPointsPerLevel: 4,
    classSkills: ['acrobatics', 'climb', 'craft', 'handle_animal', 'intimidate', 'knowledge_arcana', 'knowledge_nature', 'perception', 'ride', 'spellcraft', 'survival', 'swim'],
    features: [
      { name: 'Linaje de Sangre', level: 1, description: 'Tienes un linaje mágico que potencia tu furia con efectos mágicos.' },
      { name: 'Furia de Sangre', level: 1, description: 'Entras en furia y simultáneamente canalizas poder mágico.' },
      { name: 'Hechizos', level: 4, description: 'A partir del nivel 4 puedes lanzar hechizos mientras estás en furia.' },
      { name: 'Hechizos', level: 5, description: 'Accedes a hechizos adicionales.' },
      { name: 'Hechizos', level: 6, description: 'Accedes a hechizos adicionales.' },
      { name: 'Poder de Linaje', level: 8, description: 'Tu linaje te otorga poderes especiales.' },
      { name: 'Hechizos', level: 9, description: 'Accedes a hechizos adicionales.' },
      { name: 'Hechizos', level: 11, description: 'Accedes a hechizos adicionales.' },
      { name: 'Hechizos', level: 13, description: 'Accedes a hechizos adicionales.' },
      { name: 'Hechizos', level: 15, description: 'Accedes a hechizos adicionales.' },
      { name: 'Hechizos', level: 17, description: 'Accedes a hechizos adicionales.' },
      { name: 'Gran Furia de Sangre', level: 15, description: 'Tu furia mágica alcanza su apogeo.' },
      { name: 'Hechizos', level: 19, description: 'Accedes a hechizos adicionales.' },
    ],
    alignment: ['No Legal'],
    description: 'Berserker con linaje mágico que lanza hechizos en plena furia.',
    magicType: 'arcane',
    casterAbility: 'charisma',
    startingGoldDice: '3d6*10',
    spellsPerDay: [
      [],              // lv 1 (no spells)
      [],              // lv 2
      [],              // lv 3
      [1],             // lv 4
      [1],             // lv 5
      [2],             // lv 6
      [2],             // lv 7
      [2, 1],           // lv 8
      [2, 1],           // lv 9
      [3, 1],           // lv 10
      [3, 1],           // lv 11
      [3, 2, 1],         // lv 12
      [3, 2, 1],         // lv 13
      [4, 2, 1],         // lv 14
      [4, 2, 1],         // lv 15
      [4, 3, 2, 1],       // lv 16
      [4, 3, 2, 1],       // lv 17
      [4, 3, 2, 1],       // lv 18
      [4, 3, 3, 1],       // lv 19
      [4, 4, 3, 2],       // lv 20
    ],
  },
  {
    id: 'brawler',
    name: 'Luchador',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'good',
    willSave: 'poor',
    skillPointsPerLevel: 4,
    classSkills: ['acrobatics', 'climb', 'craft', 'escape_artist', 'handle_animal', 'intimidate', 'knowledge_dungeoneering', 'knowledge_local', 'linguistics', 'perception', 'profession', 'ride', 'sense_motive', 'sleight_of_hand', 'stealth', 'swim'],
    features: [
      { name: 'Golpe sin Arma', level: 1, description: 'Lucha a mano desnuda con efectividad.' },
      { name: 'Flurry of Blows', level: 1, description: 'Puedes realizar ataques adicionales con armas de monje.' },
      { name: 'Combate Marcial', level: 2, description: 'Puedes aplicar dotes de combate temporalmente.' },
      { name: 'Connivencia +1', level: 3, description: '+1 a CMB en maniobras de combate.' },
      { name: 'Combate Marcial', level: 4, description: 'Puedes aplicar dotes adicionales.' },
      { name: 'Connivencia +2', level: 6, description: '+2 a CMB en maniobras de combate.' },
      { name: 'Combate Marcial', level: 6, description: 'Puedes aplicar dotes adicionales.' },
      { name: 'Connivencia +3', level: 9, description: '+3 a CMB en maniobras de combate.' },
      { name: 'Combate Marcial', level: 8, description: 'Puedes aplicar dotes adicionales.' },
      { name: 'Combate Marcial', level: 10, description: 'Puedes aplicar dotes adicionales.' },
      { name: 'Connivencia +4', level: 12, description: '+4 a CMB en maniobras de combate.' },
      { name: 'Combate Marcial', level: 12, description: 'Puedes aplicar dotes adicionales.' },
      { name: 'Combate Marcial', level: 14, description: 'Puedes aplicar dotes adicionales.' },
      { name: 'Gran Golpe sin Arma', level: 15, description: 'Tu golpe sin arma ignora reducción de daño.' },
      { name: 'Connivencia +5', level: 15, description: '+5 a CMB en maniobras de combate.' },
      { name: 'Combate Marcial', level: 16, description: 'Puedes aplicar dotes adicionales.' },
      { name: 'Combate Marcial', level: 18, description: 'Puedes aplicar dotes adicionales.' },
      { name: 'Maestro del Combate', level: 20, description: 'Alcanzas la perfección en combate sin armas.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Combatiente sin armas que combina la fuerza del guerrero con las artes marciales del monje.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '3d6*10',
  },
  {
    id: 'hunter',
    name: 'Cazador',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'good',
    reflexSave: 'good',
    willSave: 'poor',
    skillPointsPerLevel: 6,
    classSkills: ['climb', 'craft', 'handle_animal', 'heal', 'knowledge_dungeoneering', 'knowledge_geography', 'knowledge_nature', 'perception', 'profession', 'ride', 'spellcraft', 'stealth', 'survival', 'swim'],
    features: [
      { name: 'Compañero Animal', level: 1, description: 'Tienes un compañero animal con poderes mejorados.' },
      { name: 'Enemigo Favorito +2', level: 1, description: '+2 a ataque, daño, Conocimiento, Percepción, Supervivencia vs tipo elegido.' },
      { name: 'Terreno Favorito +2', level: 3, description: '+2 Iniciativa y bonificadores en terreno elegido.' },
      { name: 'Tácticas Conjuntas', level: 3, description: 'Tú y tu compañero comparten dotes de trabajo en equipo.' },
      { name: 'Enemigo Favorito +4', level: 5, description: '+4 a ataque, daño, Conocimiento, Percepción, Supervivencia vs tipo elegido.' },
      { name: 'Terreno Favorito +4', level: 6, description: '+4 Iniciativa y bonificadores en terreno elegido.' },
      { name: 'Enemigo Favorito +6', level: 7, description: '+6 a ataque, daño, Conocimiento, Percepción, Supervivencia vs tipo elegido.' },
      { name: 'Terreno Favorito +6', level: 9, description: '+6 Iniciativa y bonificadores en terreno elegido.' },
      { name: 'Enemigo Favorito +8', level: 9, description: '+8 a ataque, daño, Conocimiento, Percepción, Supervivencia vs tipo elegido.' },
      { name: 'Terreno Favorito +8', level: 12, description: '+8 Iniciativa y bonificadores en terreno elegido.' },
      { name: 'Enemigo Favorito +10', level: 11, description: '+10 a ataque, daño, Conocimiento, Percepción, Supervivencia vs tipo elegido.' },
      { name: 'Enemigo Favorito +12', level: 13, description: '+12 a ataque, daño, Conocimiento, Percepción, Supervivencia vs tipo elegido.' },
      { name: 'Terreno Favorito +10', level: 15, description: '+10 Iniciativa y bonificadores en terreno elegido.' },
      { name: 'Gran Compañero', level: 14, description: 'Tu compañero se vuelve extraordinariamente poderoso.' },
      { name: 'Enemigo Favorito +14', level: 15, description: '+14 a ataque, daño, Conocimiento, Percepción, Supervivencia vs tipo elegido.' },
      { name: 'Enemigo Favorito +16', level: 17, description: '+16 a ataque, daño, Conocimiento, Percepción, Supervivencia vs tipo elegido.' },
      { name: 'Terreno Favorito +12', level: 18, description: '+12 Iniciativa y bonificadores en terreno elegido.' },
      { name: 'Enemigo Favorito +18', level: 19, description: '+18 a ataque, daño, Conocimiento, Percepción, Supervivencia vs tipo elegido.' },
      { name: 'Enemigo Favorito +20', level: 20, description: '+20 a ataque, daño, Conocimiento, Percepción, Supervivencia vs tipo elegido.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Rastreador con compañero animal que combina lo mejor del druida y el explorador.',
    magicType: 'divine',
    casterAbility: 'wisdom',
    startingGoldDice: '4d6*10',
    spellsPerDay: [
      [2, 1],           // lv 1
      [3, 2],           // lv 2
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
    id: 'investigator',
    name: 'Investigador',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'poor',
    reflexSave: 'good',
    willSave: 'good',
    skillPointsPerLevel: 6,
    classSkills: ['acrobatics', 'appraise', 'bluff', 'climb', 'craft', 'diplomacy', 'disable_device', 'disguise', 'escape_artist', 'heal', 'intimidate', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_local', 'knowledge_nature', 'knowledge_planes', 'knowledge_religion', 'linguistics', 'perception', 'perform', 'profession', 'sense_motive', 'sleight_of_hand', 'spellcraft', 'stealth', 'swim', 'use_magic_device'],
    features: [
      { name: 'Alquimia', level: 1, description: 'Creas extractos alquímicos y mutágenos.' },
      { name: 'Inspiración', level: 1, description: 'Pool de inspiración para potenciar tiradas de habilidad e inteligencia.' },
      { name: 'Estudio Rápido', level: 2, description: 'Estudias a un enemigo para mejorar ataques contra él.' },
      { name: 'Talentos de Investigador', level: 3, description: 'Ganas talentos especiales de investigador.' },
      { name: 'Talentos de Investigador', level: 5, description: 'Ganas talentos adicionales.' },
      { name: 'Talentos de Investigador', level: 7, description: 'Ganas talentos adicionales.' },
      { name: 'Talentos de Investigador', level: 9, description: 'Ganas talentos adicionales.' },
      { name: 'Talentos de Investigador', level: 11, description: 'Ganas talentos adicionales.' },
      { name: 'Gran Inspiración', level: 11, description: 'Tu inspiración mejora notablemente.' },
      { name: 'Talentos de Investigador', level: 13, description: 'Ganas talentos adicionales.' },
      { name: 'Talentos de Investigador', level: 15, description: 'Ganas talentos adicionales.' },
      { name: 'Talentos de Investigador', level: 17, description: 'Ganas talentos adicionales.' },
      { name: 'Genio Táctico', level: 20, description: 'Tu mente es excepcional en todo sentido.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Detective alquímico con extracts, inspiración y perspicacia fuera de lo común.',
    magicType: 'alchemist',
    casterAbility: 'intelligence',
    startingGoldDice: '3d6*10',
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
    id: 'shaman',
    name: 'Chamán',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'poor',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 4,
    classSkills: ['craft', 'diplomacy', 'fly', 'handle_animal', 'heal', 'knowledge_arcana', 'knowledge_history', 'knowledge_nature', 'knowledge_planes', 'knowledge_religion', 'profession', 'ride', 'sense_motive', 'spellcraft', 'survival'],
    features: [
      { name: 'Espíritu', level: 1, description: 'Te vinculas a un espíritu primordial que otorga poderes y hechizos.' },
      { name: 'Hechizos de Espíritu', level: 1, description: 'Los espíritus te conceden hechizos adicionales.' },
      { name: 'Familiar del Espíritu', level: 1, description: 'Tu familiar almacena los secretos de tu espíritu.' },
      { name: 'Espíritu Errante', level: 4, description: 'Puedes vincular un segundo espíritu temporalmente.' },
      { name: 'Hechizos de Espíritu', level: 6, description: 'Los espíritus te conceden hechizos adicionales.' },
      { name: 'Hechizos de Espíritu', level: 8, description: 'Los espíritus te conceden hechizos adicionales.' },
      { name: 'Hechizos de Espíritu', level: 10, description: 'Los espíritus te conceden hechizos adicionales.' },
      { name: 'Hechizos de Espíritu', level: 12, description: 'Los espíritus te conceden hechizos adicionales.' },
      { name: 'Hechizos de Espíritu', level: 14, description: 'Los espíritus te conceden hechizos adicionales.' },
      { name: 'Hechizos de Espíritu', level: 16, description: 'Los espíritus te conceden hechizos adicionales.' },
      { name: 'Hechizos de Espíritu', level: 18, description: 'Los espíritus te conceden hechizos adicionales.' },
      { name: 'Gran Espíritu', level: 20, description: 'Te fusionas completamente con tu espíritu.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Conjurador de espíritus que combina lo arcano de la bruja con lo divino del oráculo.',
    magicType: 'divine',
    casterAbility: 'wisdom',
    startingGoldDice: '3d6*10',
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
    id: 'skald',
    name: 'Escaldo',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 4,
    classSkills: ['acrobatics', 'bluff', 'climb', 'craft', 'diplomacy', 'escape_artist', 'intimidate', 'knowledge_arcana', 'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_nobility', 'knowledge_planes', 'knowledge_religion', 'linguistics', 'perception', 'perform', 'profession', 'ride', 'sense_motive', 'spellcraft', 'swim', 'use_magic_device'],
    features: [
      { name: 'Canto Bárbaro', level: 1, description: 'Tu canto de batalla inspira a los aliados a entrar en furia.' },
      { name: 'Furia Enardecida', level: 1, description: 'Los aliados que escuchan tu canto obtienen bonificadores de furia.' },
      { name: 'Conocimiento de Escaldo', level: 1, description: 'Conocimiento amplio en muchas áreas.' },
      { name: 'Descanso sin Fatiga', level: 2, description: 'Tus aliados no sufren fatiga al salir de la furia.' },
      { name: 'Furia Enardecida +1', level: 4, description: 'Los aliados obtienen bonificadores de furia adicionales.' },
      { name: 'Furia Enardecida +2', level: 6, description: 'Los aliados obtienen bonificadores de furia adicionales.' },
      { name: 'Furia Enardecida +3', level: 8, description: 'Los aliados obtienen bonificadores de furia adicionales.' },
      { name: 'Furia Enardecida +4', level: 10, description: 'Los aliados obtienen bonificadores de furia adicionales.' },
      { name: 'Gran Furia', level: 11, description: 'Tu canto otorga furia potenciada.' },
      { name: 'Furia Enardecida +5', level: 12, description: 'Los aliados obtienen bonificadores de furia adicionales.' },
      { name: 'Furia Enardecida +6', level: 14, description: 'Los aliados obtienen bonificadores de furia adicionales.' },
      { name: 'Furia Enardecida +7', level: 16, description: 'Los aliados obtienen bonificadores de furia adicionales.' },
      { name: 'Furia Enardecida +8', level: 18, description: 'Los aliados obtienen bonificadores de furia adicionales.' },
      { name: 'Maestro Escaldo', level: 20, description: 'Tu canto inspira hazañas legendarias.' },
    ],
    alignment: ['No Legal'],
    description: 'Bardo bárbaro que inspira a sus aliados con cantos de guerra furiosos.',
    magicType: 'bardic',
    casterAbility: 'charisma',
    startingGoldDice: '3d6*10',
    spellsPerDay: [
      [2, 1],           // lv 1
      [3, 2],           // lv 2
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
    id: 'slayer',
    name: 'Segador',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'good',
    willSave: 'poor',
    skillPointsPerLevel: 6,
    classSkills: ['acrobatics', 'bluff', 'climb', 'craft', 'disguise', 'handle_animal', 'heal', 'intimidate', 'knowledge_dungeoneering', 'knowledge_geography', 'knowledge_local', 'knowledge_nature', 'perception', 'profession', 'ride', 'sense_motive', 'stealth', 'survival', 'swim'],
    features: [
      { name: 'Estudio del Objetivo', level: 1, description: 'Estudias a un enemigo para aplicar daño de ataque furtivo.' },
      { name: 'Ataque Furtivo', level: 1, description: 'Inflige daño extra a enemigos desprevenidos o flanqueados.' },
      { name: 'Rastrear', level: 1, description: '+1 por nivel a Supervivencia para rastrear.' },
      { name: 'Talento de Segador', level: 2, description: 'Ganas talentos especiales de pícaro o segador.' },
      { name: 'Talento de Segador', level: 4, description: 'Ganas talentos adicionales.' },
      { name: 'Talento de Segador', level: 6, description: 'Ganas talentos adicionales.' },
      { name: 'Talento de Segador', level: 8, description: 'Ganas talentos adicionales.' },
      { name: 'Talento de Segador', level: 10, description: 'Ganas talentos adicionales.' },
      { name: 'Objetivo Marcado', level: 10, description: 'Aplicas bonificadores mejorados contra objetivos estudiados.' },
      { name: 'Talento de Segador', level: 12, description: 'Ganas talentos adicionales.' },
      { name: 'Talento de Segador', level: 14, description: 'Ganas talentos adicionales.' },
      { name: 'Talento de Segador', level: 16, description: 'Ganas talentos adicionales.' },
      { name: 'Talento de Segador', level: 18, description: 'Ganas talentos adicionales.' },
      { name: 'Maestro de la Caza', level: 20, description: 'Ninguna presa puede escapar de ti.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Cazador letal que combina el rastreo del explorador con el sigilo del pícaro.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '4d6*10',
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
    classSkills: ['acrobatics', 'bluff', 'climb', 'craft', 'diplomacy', 'escape_artist', 'intimidate', 'knowledge_local', 'knowledge_nobility', 'perception', 'perform', 'profession', 'ride', 'sense_motive', 'sleight_of_hand', 'swim'],
    features: [
      { name: 'Gracia del Espadachín', level: 1, description: 'Añades DES a daño con espadas ligeras.' },
      { name: 'Panache', level: 1, description: 'Puntos de panache que usas para hazañas y proezas.' },
      { name: 'Proeza', level: 1, description: 'Hazañas de espadachín: maniobras elegantes de combate.' },
      { name: 'Gracia del Combate', level: 3, description: 'Añades DES al daño con más armas.' },
      { name: 'Recuperar Panache', level: 5, description: 'Recuperas panache al confirmar críticos.' },
      { name: 'Gracia del Combate +1', level: 7, description: 'Añades DES al daño con armas adicionales.' },
      { name: 'Recuperar Panache', level: 9, description: 'Recuperas panache al confirmar críticos.' },
      { name: 'Gracia del Combate +2', level: 11, description: 'Añades DES al daño con armas adicionales.' },
      { name: 'Recuperar Panache', level: 13, description: 'Recuperas panache al confirmar críticos.' },
      { name: 'Gracia del Combate +3', level: 15, description: 'Añades DES al daño con armas adicionales.' },
      { name: 'Recuperar Panache', level: 17, description: 'Recuperas panache al confirmar críticos.' },
      { name: 'Maestro Espadachín', level: 20, description: 'Tu habilidad con la espada es legendaria.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Combatiente ágil y elegante que usa destreza y panache en lugar de fuerza bruta.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '3d6*10',
  },
  {
    id: 'warpriest',
    name: 'Sacerdote de Guerra',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 2,
    classSkills: ['climb', 'craft', 'diplomacy', 'handle_animal', 'heal', 'intimidate', 'knowledge_religion', 'profession', 'ride', 'sense_motive', 'spellcraft', 'survival', 'swim'],
    features: [
      { name: 'Ferviente de Arma', level: 1, description: 'Potencia tu arma sagrada con bendiciones divinas.' },
      { name: 'Bendiciones', level: 1, description: 'Invocas bendiciones de tu deidad en combate.' },
      { name: 'Fervor', level: 2, description: 'Pool de fervor para mejorar ataques y curaciones.' },
      { name: 'Canalizar Energía', level: 4, description: 'Canaliza energía positiva o negativa.' },
      { name: 'Bendiciones', level: 6, description: 'Invocas bendiciones adicionales.' },
      { name: 'Bendiciones', level: 8, description: 'Invocas bendiciones adicionales.' },
      { name: 'Bendiciones', level: 10, description: 'Invocas bendiciones adicionales.' },
      { name: 'Sagrado de Arma', level: 12, description: 'Tu arma obtiene propiedades mágicas permanentes.' },
      { name: 'Bendiciones', level: 14, description: 'Invocas bendiciones adicionales.' },
      { name: 'Bendiciones', level: 16, description: 'Invocas bendiciones adicionales.' },
      { name: 'Bendiciones', level: 18, description: 'Invocas bendiciones adicionales.' },
      { name: 'Maestro de la Fe', level: 20, description: 'Tu fe y tu fuerza son absolutas.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Combina la fuerza del guerrero con las bendiciones sagradas del clérigo.',
    magicType: 'divine',
    casterAbility: 'wisdom',
    startingGoldDice: '4d6*10',
    spellsPerDay: [
      [2, 1],           // lv 1
      [3, 2],           // lv 2
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
  // ── Alternate Classes ──
  {
    id: 'antipaladin',
    name: 'Antipaladín',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 2,
    classSkills: ['bluff', 'craft', 'disguise', 'handle_animal', 'intimidate', 'knowledge_planes', 'knowledge_religion', 'profession', 'ride', 'sense_motive', 'spellcraft', 'stealth'],
    features: [
      { name: 'Detectar Bondad', level: 1, description: 'Detectas el bien a voluntad.' },
      { name: 'Aura de Maldad', level: 1, description: 'Emites un aura de maldad.' },
      { name: 'Golpe Profano', level: 1, description: 'Tus ataques pueden aplicar energía negativa.' },
      { name: 'Toque Corruptor', level: 2, description: 'Tu toque causa enfermedades profanas.' },
      { name: 'Montura Profana', level: 5, description: 'Obtienes una montura oscura.' },
      { name: 'Toque Corruptor', level: 6, description: 'Tu toque causa enfermedades adicionales.' },
      { name: 'Toque Corruptor', level: 10, description: 'Tu toque causa enfermedades adicionales.' },
      { name: 'Toque Corruptor', level: 14, description: 'Tu toque causa enfermedades adicionales.' },
      { name: 'Toque Corruptor', level: 18, description: 'Tu toque causa enfermedades adicionales.' },
    ],
    alignment: ['Legal Malvado'],
    description: 'La contraparte oscura del paladín, un campeón del mal y la tiranía.',
    magicType: 'divine',
    casterAbility: 'charisma',
    startingGoldDice: '5d6*10',
    spellsPerDay: [
      [], [], [],
      [1], [1], [1],
      [1, 0], [1, 0], [1, 1],
      [2, 1, 0], [2, 1, 0], [2, 1, 1],
      [2, 2, 1, 0], [2, 2, 1, 0], [2, 2, 1, 1],
      [3, 2, 2, 1], [3, 2, 2, 1], [3, 3, 2, 1],
      [3, 3, 3, 1], [4, 3, 3, 2],
    ],
  },
  {
    id: 'ninja',
    name: 'Ninja',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'poor',
    reflexSave: 'good',
    willSave: 'poor',
    skillPointsPerLevel: 8,
    classSkills: ['acrobatics', 'appraise', 'bluff', 'climb', 'craft', 'diplomacy', 'disable_device', 'disguise', 'escape_artist', 'intimidate', 'knowledge_local', 'linguistics', 'perception', 'perform', 'profession', 'sense_motive', 'sleight_of_hand', 'stealth', 'swim', 'use_magic_device'],
    features: [
      { name: 'Ataque Furtivo', level: 1, description: 'Daño extra contra enemigos desprevenidos o flanqueados.' },
      { name: 'Reserva Ki', level: 2, description: 'Pool de ki para poderes místicos ninja.' },
      { name: 'Sigilo Ligero', level: 2, description: 'Puedes usar Sigilo sin necesitar cobertura o distracción.' },
      { name: 'Trucos Ninja', level: 2, description: 'Habilidades especiales del ninja que mejoran con nivel.' },
      { name: 'Trucos Ninja', level: 4, description: 'Ganas truco ninja adicional.' },
      { name: 'Desvanecerse', level: 4, description: 'Puedes volverte invisible como acción rápida.' },
      { name: 'Trucos Ninja', level: 6, description: 'Ganas truco ninja adicional.' },
      { name: 'Trucos Ninja', level: 8, description: 'Ganas truco ninja adicional.' },
      { name: 'Trucos Ninja', level: 10, description: 'Ganas truco ninja adicional.' },
      { name: 'Trucos Ninja', level: 12, description: 'Ganas truco ninja adicional.' },
      { name: 'Trucos Ninja', level: 14, description: 'Ganas truco ninja adicional.' },
      { name: 'Trucos Ninja', level: 16, description: 'Ganas truco ninja adicional.' },
      { name: 'Trucos Ninja', level: 18, description: 'Ganas truco ninja adicional.' },
      { name: 'Maestro Ninja', level: 20, description: 'Tu dominio de las artes ninja es absoluto.' },
    ],
    alignment: ['No Bueno'],
    description: 'Espía y asesino que combina las habilidades del pícaro con poderes místicos ki.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '4d6*10',
  },
  {
    id: 'samurai',
    name: 'Samurai',
    hitDie: 10,
    baseAttackBonus: 'good',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'poor',
    skillPointsPerLevel: 4,
    classSkills: ['bluff', 'climb', 'craft', 'diplomacy', 'handle_animal', 'intimidate', 'knowledge_history', 'knowledge_local', 'knowledge_nobility', 'perception', 'profession', 'ride', 'sense_motive', 'swim'],
    features: [
      { name: 'Orden', level: 1, description: 'Juras lealtad a un código de honor que define tus capacidades.' },
      { name: 'Katana Resolvente', level: 1, description: 'Puedes hacer un ataque devastador con tu katana.' },
      { name: 'Montura', level: 1, description: 'Obtienes una montura entrenada.' },
      { name: 'Desafío', level: 1, description: 'Desafías a un enemigo: bonificadores de ataque y daño.' },
      { name: 'Desafío', level: 4, description: 'Puedes desafiar a un enemigo.' },
      { name: 'Desafío', level: 7, description: 'Puedes desafiar a un enemigo.' },
      { name: 'Gran Resolución', level: 5, description: 'Tu voluntad es inquebrantable.' },
      { name: 'Desafío', level: 10, description: 'Puedes desafiar a un enemigo.' },
      { name: 'Desafío', level: 13, description: 'Puedes desafiar a un enemigo.' },
      { name: 'Desafío', level: 16, description: 'Puedes desafiar a un enemigo.' },
      { name: 'Desafío', level: 19, description: 'Puedes desafiar a un enemigo.' },
      { name: 'Maestro Samurai', level: 20, description: 'Tu código es perfecto, tu filo es legendario.' },
    ],
    alignment: ['Legal'],
    description: 'Guerrero noble guiado por un código de honor, maestro de la katana y el caballo.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '3d6*10',
  },
  // ── Occult Classes ──
  {
    id: 'kineticist',
    name: 'Kineticista',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'poor',
    skillPointsPerLevel: 4,
    classSkills: ['acrobatics', 'craft', 'heal', 'intimidate', 'knowledge_nature', 'perception', 'profession', 'stealth', 'use_magic_device'],
    features: [
      { name: 'Elemento Elemental', level: 1, description: 'Eliges un elemento (fuego, agua, tierra, aire, etc.) como tu dominio.' },
      { name: 'Impulso Cinético', level: 1, description: 'Ataque especial de energía elemental sin necesidad de componentes.' },
      { name: 'Quemadura', level: 1, description: 'Daño no letal acumulado al usar poderes cinéticos.' },
      { name: 'Defensa Elemental', level: 2, description: 'Escudo de energía elemental que protege tu cuerpo.' },
      { name: 'Aceptar Quemadura', level: 3, description: 'Puedes aumentar el daño de impulso aceptando más quemadura.' },
      { name: 'Defensa Elemental +1', level: 5, description: 'Escudo de energía elemental mejorado.' },
      { name: 'Defensa Elemental +2', level: 8, description: 'Escudo de energía elemental mejorado.' },
      { name: 'Defensa Elemental +3', level: 11, description: 'Escudo de energía elemental mejorado.' },
      { name: 'Defensa Elemental +4', level: 14, description: 'Escudo de energía elemental mejorado.' },
      { name: 'Defensa Elemental +5', level: 17, description: 'Escudo de energía elemental mejorado.' },
      { name: 'Maestro Elemental', level: 20, description: 'Tu control elemental es absoluto.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Canal viviente de energía elemental que lanza impulsos cinéticos sin hechizos.',
    magicType: null,
    casterAbility: null,
    startingGoldDice: '2d6*10',
  },
  {
    id: 'psychic',
    name: 'Psíquico',
    hitDie: 6,
    baseAttackBonus: 'poor',
    fortitudeSave: 'poor',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 2,
    classSkills: ['bluff', 'craft', 'disguise', 'fly', 'intimidate', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_geography', 'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_nobility', 'knowledge_planes', 'knowledge_religion', 'linguistics', 'perception', 'profession', 'sense_motive', 'spellcraft'],
    features: [
      { name: 'Disciplina Psíquica', level: 1, description: 'Eliges una disciplina mental que define tu acceso a hechizos.' },
      { name: 'Hechizos Psíquicos', level: 1, description: 'Lanzas hechizos psíquicos usando la mente en lugar de componentes verbales/somáticos.' },
      { name: 'Componentes Pensamiento/Emoción', level: 1, description: 'Reemplazas V/S con componentes mentales.' },
      { name: 'Phrenic Amplification', level: 1, description: 'Amplificaciones que potencian tus hechizos psíquicos.' },
      { name: 'Poderes de Disciplina', level: 1, description: 'Poderes especiales de tu disciplina mental.' },
      { name: 'Amplificación +1', level: 5, description: 'Phrenic Amplification se potencia.' },
      { name: 'Amplificación +2', level: 10, description: 'Phrenic Amplification se potencia.' },
      { name: 'Amplificación +3', level: 15, description: 'Phrenic Amplification se potencia.' },
      { name: 'Gran Psíquico', level: 20, description: 'Tu mente trasciende lo humano.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Lanzador de hechizos psíquicos de máxima potencia que usa la mente como canal arcano.',
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
    id: 'mesmerist',
    name: 'Mesmerista',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'poor',
    reflexSave: 'good',
    willSave: 'good',
    skillPointsPerLevel: 6,
    classSkills: ['bluff', 'craft', 'diplomacy', 'disguise', 'escape_artist', 'intimidate', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_history', 'knowledge_local', 'knowledge_planes', 'linguistics', 'perception', 'perform', 'profession', 'sense_motive', 'sleight_of_hand', 'spellcraft', 'use_magic_device'],
    features: [
      { name: 'Mirada Hipnótica', level: 1, description: 'Tu mirada penetrante puede hipnotizar a los enemigos.' },
      { name: 'Trucos de Mente', level: 1, description: 'Implanta sugestiones en las mentes de tus enemigos.' },
      { name: 'Golpe Doloroso', level: 1, description: 'Tus ataques causan efectos mentales adicionales.' },
      { name: 'Ilusiones Consumadas', level: 3, description: 'Tus ilusiones son extraordinariamente convincentes.' },
      { name: 'Golpe Doloroso +1', level: 5, description: 'Tus ataques causan efectos mentales adicionales.' },
      { name: 'Golpe Doloroso +2', level: 7, description: 'Tus ataques causan efectos mentales adicionales.' },
      { name: 'Golpe Doloroso +3', level: 9, description: 'Tus ataques causan efectos mentales adicionales.' },
      { name: 'Golpe Doloroso +4', level: 11, description: 'Tus ataques causan efectos mentales adicionales.' },
      { name: 'Gran Hipnosis', level: 11, description: 'Tu hipnosis es prácticamente irresistible.' },
      { name: 'Golpe Doloroso +5', level: 13, description: 'Tus ataques causan efectos mentales adicionales.' },
      { name: 'Golpe Doloroso +6', level: 15, description: 'Tus ataques causan efectos mentales adicionales.' },
      { name: 'Golpe Doloroso +7', level: 17, description: 'Tus ataques causan efectos mentales adicionales.' },
      { name: 'Golpe Doloroso +8', level: 19, description: 'Tus ataques causan efectos mentales adicionales.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Maestro del encantamiento y la ilusión que controla mentes con su mirada.',
    magicType: 'arcane',
    casterAbility: 'charisma',
    startingGoldDice: '3d6*10',
    spellsPerDay: [
      [2, 1],           // lv 1
      [3, 2],           // lv 2
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
    id: 'occultist',
    name: 'Ocultista',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'good',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 4,
    classSkills: ['appraise', 'craft', 'diplomacy', 'disguise', 'fly', 'heal', 'intimidate', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_engineering', 'knowledge_geography', 'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_nobility', 'knowledge_planes', 'knowledge_religion', 'linguistics', 'perception', 'profession', 'sense_motive', 'spellcraft', 'use_magic_device'],
    features: [
      { name: 'Implementos', level: 1, description: 'Canalizas energía psíquica a través de objetos mágicos.' },
      { name: 'Escuelas de Implemento', level: 1, description: 'Cada implemento concede acceso a una escuela de magia.' },
      { name: 'Enfoque Mental', level: 1, description: 'Pool de enfoque para activar poderes de implemento.' },
      { name: 'Outsider del Implemento', level: 2, description: 'Puedes evocar poderes adicionales de los implementos.' },
      { name: 'Enfoque Mental +1', level: 6, description: 'Pool de enfoque mental adicional.' },
      { name: 'Enfoque Mental +2', level: 10, description: 'Pool de enfoque mental adicional.' },
      { name: 'Enfoque Mental +3', level: 14, description: 'Pool de enfoque mental adicional.' },
      { name: 'Gran Implemento', level: 18, description: 'Tus implementos alcanzan su potencia máxima.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Canaliza magia psíquica a través de antigüedades y objetos de poder.',
    magicType: 'arcane',
    casterAbility: 'intelligence',
    startingGoldDice: '3d6*10',
    spellsPerDay: [
      [2, 1],           // lv 1
      [3, 2],           // lv 2
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
    id: 'medium',
    name: 'Médium',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'poor',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 4,
    classSkills: ['bluff', 'craft', 'diplomacy', 'fly', 'heal', 'intimidate', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_history', 'knowledge_local', 'knowledge_planes', 'knowledge_religion', 'linguistics', 'perception', 'perform', 'profession', 'sense_motive', 'spellcraft', 'use_magic_device'],
    features: [
      { name: 'Canal de Espíritu', level: 1, description: 'Contactas espíritus legendarios en lugares de poder.' },
      { name: 'Espíritus', level: 1, description: 'Canalizas uno de seis arquetipos de espíritu: Archmage, Champion, Guardian, Hierophant, Marshal, Trickster.' },
      { name: 'Karma Espiritual', level: 1, description: 'Acumulas karma al invocar espíritus poderosos.' },
      { name: 'Influencia de Espíritu', level: 4, description: 'El espíritu toma mayor influencia sobre ti.' },
      { name: 'Influencia de Espíritu', level: 8, description: 'El espíritu toma mayor influencia sobre ti.' },
      { name: 'Influencia de Espíritu', level: 12, description: 'El espíritu toma mayor influencia sobre ti.' },
      { name: 'Influencia de Espíritu', level: 16, description: 'El espíritu toma mayor influencia sobre ti.' },
      { name: 'Fusión de Espíritu', level: 20, description: 'Te fusionas permanentemente con un espíritu.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Canaliza la influencia de espíritus legendarios que alteran sus habilidades.',
    magicType: 'arcane',
    casterAbility: 'charisma',
    startingGoldDice: '3d6*10',
    spellsPerDay: [
      [1], [1], [2], [2], [3], [3],
      [3, 1], [3, 1], [4, 1], [4, 2],
      [4, 2], [4, 3], [4, 3], [4, 3, 1],
      [4, 4, 1], [4, 4, 2], [4, 4, 2], [4, 4, 3],
      [4, 4, 3], [4, 4, 4],
    ],
  },
  {
    id: 'spiritualist',
    name: 'Espiritista',
    hitDie: 8,
    baseAttackBonus: 'medium',
    fortitudeSave: 'poor',
    reflexSave: 'poor',
    willSave: 'good',
    skillPointsPerLevel: 4,
    classSkills: ['bluff', 'craft', 'fly', 'heal', 'intimidate', 'knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_history', 'knowledge_planes', 'knowledge_religion', 'linguistics', 'perception', 'profession', 'sense_motive', 'spellcraft', 'use_magic_device'],
    features: [
      { name: 'Fantasma', level: 1, description: 'Estás vinculado a un fantasma con asuntos inconclusos.' },
      { name: 'Vínculo con el Fantasma', level: 1, description: 'El fantasma puede alternar entre forma etérea y ectoplásmica.' },
      { name: 'Furia del Fantasma', level: 1, description: 'El fantasma puede enloquecer temporalmente en combate.' },
      { name: 'Fusión Espiritual', level: 4, description: 'Puedes fusionarte con tu fantasma.' },
      { name: 'Furia del Fantasma', level: 6, description: 'El fantasma puede enloquecer adicionalmente.' },
      { name: 'Fusión Espiritual', level: 8, description: 'Puedes fusionarte con tu fantasma.' },
      { name: 'Furia del Fantasma', level: 8, description: 'El fantasma puede enloquecer adicionalmente.' },
      { name: 'Fusión Espiritual', level: 12, description: 'Puedes fusionarte con tu fantasma.' },
      { name: 'Manifestación Poderosa', level: 12, description: 'El fantasma puede manifestarse con mayor fuerza.' },
      { name: 'Furia del Fantasma', level: 12, description: 'El fantasma puede enloquecer adicionalmente.' },
      { name: 'Unión Eterna', level: 20, description: 'Tu vínculo con el fantasma trasciende la muerte.' },
    ],
    alignment: ['Cualquiera'],
    description: 'Vinculado a un fantasma ectoplásmico que lo acompaña y combate a su lado.',
    magicType: 'divine',
    casterAbility: 'wisdom',
    startingGoldDice: '3d6*10',
    spellsPerDay: [
      [2, 1],           // lv 1
      [3, 2],           // lv 2
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
