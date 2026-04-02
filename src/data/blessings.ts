export interface BlessingPower {
  name: string
  description: string
  actionType: 'swift' | 'standard' | 'atWill'
  costsFervor: boolean
  unlocksAtLevel: 1 | 10
}

export interface BlessingData {
  id: string
  name: string
  description: string
  powers: BlessingPower[]
}

export const BLESSINGS: BlessingData[] = [
  {
    id: 'air',
    name: 'Aire',
    description: 'Bendición del viento y los cielos, favorecida por deidades del aire y las tormentas.',
    powers: [
      {
        name: 'Golpe del Viento',
        description: 'Como acción veloz, la próxima vez que golpees con un arma sagrada en este turno, el objetivo debe superar una tirada de Fortaleza CD (10 + ½ nivel + mod SAB) o ser empujado 5 pies en una dirección que elijas.',
        actionType: 'swift',
        costsFervor: true,
        unlocksAtLevel: 1,
      },
      {
        name: 'Forma de Viento',
        description: 'Puedes convertirte en aire (como el conjuro Forma Gaseosa) durante 1 minuto por nivel de sacerdote de guerra. Mientras estés en esta forma, eres inmune a ataques no mágicos y ataques basados en veneno y enfermedad.',
        actionType: 'standard',
        costsFervor: false,
        unlocksAtLevel: 10,
      },
    ],
  },
  {
    id: 'animal',
    name: 'Animal',
    description: 'Bendición de las bestias y la naturaleza salvaje.',
    powers: [
      {
        name: 'Colmillos de la Bestia',
        description: 'Como acción veloz, recibes un ataque de mordisco (1d6 de daño + mod FUE para personajes medianos) durante 1 ronda. Si eres pequeño, el daño es 1d4.',
        actionType: 'swift',
        costsFervor: true,
        unlocksAtLevel: 1,
      },
      {
        name: 'Amistad Salvaje',
        description: 'Puedes lanzar Dominar Animal como poder sobrenatural una vez al día. La CD de salvación es 10 + ½ nivel + mod SAB. La duración es de 1 minuto por nivel de sacerdote de guerra.',
        actionType: 'standard',
        costsFervor: false,
        unlocksAtLevel: 10,
      },
    ],
  },
  {
    id: 'darkness',
    name: 'Oscuridad',
    description: 'Bendición de las sombras y la noche.',
    powers: [
      {
        name: 'Manto de Sombras',
        description: 'Como acción veloz, recibes un bonificador de +2 a CA y tiradas de salvación contra efectos de luz durante 1 ronda. Si estás en una zona de oscuridad o penumbra, el bonificador aumenta a +4.',
        actionType: 'swift',
        costsFervor: true,
        unlocksAtLevel: 1,
      },
      {
        name: 'Forma de Sombra',
        description: 'Puedes fusionarte con las sombras (como el conjuro Fundirse con las Sombras) durante 1 minuto por nivel de sacerdote de guerra. Mientras estás fusionado, eres difícil de detectar y recibes bonificadores de las sombras.',
        actionType: 'standard',
        costsFervor: false,
        unlocksAtLevel: 10,
      },
    ],
  },
  {
    id: 'earth',
    name: 'Tierra',
    description: 'Bendición de la roca, la solidez y la durabilidad.',
    powers: [
      {
        name: 'Fortaleza de la Tierra',
        description: 'Como acción veloz, recibes RD 2/— durante 1 ronda. Esta RD aumenta en 1 por cada cinco niveles de sacerdote de guerra (RD 4/— a nivel 10, RD 6/— a nivel 15, RD 8/— a nivel 20).',
        actionType: 'swift',
        costsFervor: true,
        unlocksAtLevel: 1,
      },
      {
        name: 'Golpe de Roca',
        description: 'Como acción estándar, el suelo a 20 pies de ti tiembla violentamente durante 1 ronda. Las criaturas en el área deben superar una tirada de Reflejos CD (10 + ½ nivel + mod SAB) o caer derribadas.',
        actionType: 'standard',
        costsFervor: false,
        unlocksAtLevel: 10,
      },
    ],
  },
  {
    id: 'fire',
    name: 'Fuego',
    description: 'Bendición de las llamas y el poder purificador del fuego.',
    powers: [
      {
        name: 'Golpe Ardiente',
        description: 'Como acción veloz, tu próximo ataque con un arma sagrada este turno inflige 1d6 de daño de fuego adicional. Este daño adicional aumenta en 1d6 por cada cinco niveles de sacerdote de guerra.',
        actionType: 'swift',
        costsFervor: true,
        unlocksAtLevel: 1,
      },
      {
        name: 'Lluvia de Fuego',
        description: 'Como acción estándar, conjuras una lluvia de fuego en un área de 20 pies de radio a 60 pies. Las criaturas en el área reciben 1d6 de daño de fuego por nivel de sacerdote de guerra. Tirada de Reflejos CD (10 + ½ nivel + mod SAB) para reducir a la mitad.',
        actionType: 'standard',
        costsFervor: false,
        unlocksAtLevel: 10,
      },
    ],
  },
  {
    id: 'good',
    name: 'Bien',
    description: 'Bendición de la bondad divina y la protección contra el mal.',
    powers: [
      {
        name: 'Toque de Gracia',
        description: 'Como acción veloz, un aliado a 30 pies (o tú mismo) recibe un bonificador de sagrado de +2 a tiradas de ataque y salvación durante 1 ronda.',
        actionType: 'swift',
        costsFervor: true,
        unlocksAtLevel: 1,
      },
      {
        name: 'Aura Sagrada',
        description: 'Como acción estándar, irradias un aura de bien de 30 pies de radio durante 1 minuto. Los aliados en el aura ganan resistencia 10 al daño de alineamiento maligno y un bonificador de sagrado de +2 a tiradas de salvación.',
        actionType: 'standard',
        costsFervor: false,
        unlocksAtLevel: 10,
      },
    ],
  },
  {
    id: 'healing',
    name: 'Curación',
    description: 'Bendición de la restauración y el poder de sanar.',
    powers: [
      {
        name: 'Curación Rápida',
        description: 'Como acción veloz, curas a una criatura tocada por 1d6 puntos de golpe + 1 por nivel de sacerdote de guerra. Puedes usarte a ti mismo como objetivo.',
        actionType: 'swift',
        costsFervor: true,
        unlocksAtLevel: 1,
      },
      {
        name: 'Curación Masiva',
        description: 'Como acción estándar, curas a todos los aliados en un radio de 30 pies de ti por 2d6 + nivel de sacerdote de guerra puntos de golpe. Los no-muertos en el área reciben el mismo número como daño (Voluntad para reducir a la mitad).',
        actionType: 'standard',
        costsFervor: false,
        unlocksAtLevel: 10,
      },
    ],
  },
  {
    id: 'knowledge',
    name: 'Conocimiento',
    description: 'Bendición de la sabiduría y el discernimiento divino.',
    powers: [
      {
        name: 'Discernimiento Rápido',
        description: 'Como acción veloz, recibes un bonificador de sagrado de +4 a tu próxima tirada de Percepción o Conocimiento en este turno.',
        actionType: 'swift',
        costsFervor: true,
        unlocksAtLevel: 1,
      },
      {
        name: 'Ojo Divino',
        description: 'Como acción estándar, ganas el efecto de Visión Verdadera durante 1 ronda por nivel de sacerdote de guerra. Puedes ver la naturaleza real de las criaturas y objetos ilusionados o transmutados.',
        actionType: 'standard',
        costsFervor: false,
        unlocksAtLevel: 10,
      },
    ],
  },
  {
    id: 'strength',
    name: 'Fuerza',
    description: 'Bendición del poder físico y la potencia en combate.',
    powers: [
      {
        name: 'Golpe Poderoso',
        description: 'Como acción veloz, tu próximo ataque con un arma sagrada este turno recibe un bonificador de +1 al daño por cada dos niveles de sacerdote de guerra (máx +10).',
        actionType: 'swift',
        costsFervor: true,
        unlocksAtLevel: 1,
      },
      {
        name: 'Forma del Gigante',
        description: 'Como acción estándar, aumentas a tamaño Grande durante 1 minuto por nivel de sacerdote de guerra. Ganas +4 FUE, –2 DES, +2 aguante y alcance de 10 pies.',
        actionType: 'standard',
        costsFervor: false,
        unlocksAtLevel: 10,
      },
    ],
  },
  {
    id: 'sun',
    name: 'Sol',
    description: 'Bendición de la luz solar y el poder destructivo contra los no-muertos.',
    powers: [
      {
        name: 'Golpe de Luz',
        description: 'Como acción veloz, tu próximo ataque con un arma sagrada este turno inflige 1d6 de daño adicional de luz sagrada a no-muertos. Las criaturas normales reciben 1d4 de daño de fuego adicional.',
        actionType: 'swift',
        costsFervor: true,
        unlocksAtLevel: 1,
      },
      {
        name: 'Explosión Solar',
        description: 'Como acción estándar, creas un destello de luz solar en un radio de 30 pies. Los no-muertos en el área reciben 1d6 de daño por nivel de sacerdote de guerra (Voluntad para reducir a la mitad). Las criaturas vivas en el área quedan cegadas durante 1 ronda (Fortaleza niega).',
        actionType: 'standard',
        costsFervor: false,
        unlocksAtLevel: 10,
      },
    ],
  },
  {
    id: 'travel',
    name: 'Viaje',
    description: 'Bendición del movimiento, la velocidad y la exploración.',
    powers: [
      {
        name: 'Paso Ágil',
        description: 'Como acción veloz, ignoras el terreno difícil durante 1 ronda y tu velocidad de movimiento aumenta en 10 pies hasta el final de tu turno.',
        actionType: 'swift',
        costsFervor: true,
        unlocksAtLevel: 1,
      },
      {
        name: 'Teletransporte',
        description: 'Una vez al día, puedes teletransportarte como si lanzaras el conjuro Teletransporte. La distancia máxima es de 100 pies por nivel de sacerdote de guerra.',
        actionType: 'standard',
        costsFervor: false,
        unlocksAtLevel: 10,
      },
    ],
  },
  {
    id: 'war',
    name: 'Guerra',
    description: 'Bendición del combate, las armas y la victoria en batalla.',
    powers: [
      {
        name: 'Golpe de Batalla',
        description: 'Como acción veloz, recibes un bonificador de sagrado de +1 a tiradas de ataque con armas sagradas durante 1 ronda. Este bonificador aumenta en +1 por cada cinco niveles de sacerdote de guerra.',
        actionType: 'swift',
        costsFervor: true,
        unlocksAtLevel: 1,
      },
      {
        name: 'Maestría en Batalla',
        description: 'Como acción estándar, todos los aliados a 30 pies reciben el beneficio del talento Ataque de Guerrero durante 1 ronda por nivel de sacerdote de guerra. También pueden reatribuir golpes críticos una vez por ronda.',
        actionType: 'standard',
        costsFervor: false,
        unlocksAtLevel: 10,
      },
    ],
  },
]

export function getBlessingById(id: string): BlessingData | undefined {
  return BLESSINGS.find(b => b.id === id)
}
