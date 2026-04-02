export interface DomainPower {
  name: string
  description: string
  usesFormula: 'wisdomMod' | 'fixed' | 'unlimited'
  fixedUses?: number
  unlocksAtLevel: 1 | 6 | 8
}

export interface DomainSpellEntry {
  level: number
  spellName: string
}

export interface DomainData {
  id: string
  name: string
  description: string
  powers: DomainPower[]
  spells: DomainSpellEntry[]
}

export const DOMAINS: DomainData[] = [
  {
    id: 'air',
    name: 'Aire',
    description: 'Dominio del viento, las tormentas y el cielo abierto.',
    powers: [
      {
        name: 'Rayo de Relámpago',
        description: 'Como acción estándar, disparas un rayo de electricidad que inflige 1d6 de daño eléctrico por nivel de clérigo (máx 10d6) a una criatura a 30 pies. Tirada de salvación de Reflejos CD (10 + ½ nivel + mod SAB) para reducir a la mitad.',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 1,
      },
      {
        name: 'Vuelo Divino',
        description: 'A partir del nivel 8, puedes volar (velocidad 60 pies, maniobrabilidad buena) durante 1 minuto por nivel de clérigo. Puedes dividir esta duración en incrementos de 1 minuto.',
        usesFormula: 'fixed',
        fixedUses: 1,
        unlocksAtLevel: 8,
      },
    ],
    spells: [
      { level: 1, spellName: 'Alas de Viento' },
      { level: 2, spellName: 'Resistencia a la Electricidad' },
      { level: 3, spellName: 'Llamar al Relámpago' },
      { level: 4, spellName: 'Control del Viento' },
      { level: 5, spellName: 'Tormenta de Relámpagos' },
      { level: 6, spellName: 'Cadena de Relámpagos' },
      { level: 7, spellName: 'Control del Tiempo' },
      { level: 8, spellName: 'Torbellino' },
      { level: 9, spellName: 'Tormenta de Veneno' },
    ],
  },
  {
    id: 'animal',
    name: 'Animal',
    description: 'Dominio de las bestias, la naturaleza salvaje y los instintos primarios.',
    powers: [
      {
        name: 'Amistad con los Animales',
        description: 'Puedes lanzar encantamiento en animales como si fuera un hechizo divino sin necesidad de tirada de salvación. Los animales tienen un actitud inicial de Amigable hacia ti. Este efecto dura 1 hora por nivel de clérigo.',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 1,
      },
      {
        name: 'Ojos de la Bestia',
        description: 'A partir del nivel 6, puedes ver a través de los ojos de cualquier animal a 100 pies durante 1 minuto por nivel de clérigo como si lanzaras el conjuro Compartir Sentidos.',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 6,
      },
    ],
    spells: [
      { level: 1, spellName: 'Hablar con los Animales' },
      { level: 2, spellName: 'Amistad con los Animales' },
      { level: 3, spellName: 'Dominar Animal' },
      { level: 4, spellName: 'Piel de Oso' },
      { level: 5, spellName: 'Convocar Monstruo V (animales)' },
      { level: 6, spellName: 'Antipatía' },
      { level: 7, spellName: 'Convocar Monstruo VII (animales)' },
      { level: 8, spellName: 'Piel de Bestia Animal' },
      { level: 9, spellName: 'Cambiaformas' },
    ],
  },
  {
    id: 'darkness',
    name: 'Oscuridad',
    description: 'Dominio de las sombras, la noche y lo oculto.',
    powers: [
      {
        name: 'Toque de Oscuridad',
        description: 'Como acción estándar, puedes tocar a una criatura infligiéndole ceguera durante 1 ronda por cada dos niveles de clérigo. Las criaturas con visión en la oscuridad son inmunes. Tirada de salvación de Fortaleza CD (10 + ½ nivel + mod SAB) para negar.',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 1,
      },
      {
        name: 'Ojos de la Oscuridad',
        description: 'A partir del nivel 8, tu visión en la oscuridad se extiende a 60 pies. Si ya tenías visión en la oscuridad, se dobla su alcance. Puedes ver incluso en oscuridad mágica.',
        usesFormula: 'unlimited',
        unlocksAtLevel: 8,
      },
    ],
    spells: [
      { level: 1, spellName: 'Oscuridad Menor' },
      { level: 2, spellName: 'Oscuridad' },
      { level: 3, spellName: 'Oscuridad Mayor' },
      { level: 4, spellName: 'Puerta de Sombras' },
      { level: 5, spellName: 'Sombra Evocada' },
      { level: 6, spellName: 'Sombra Conjurada' },
      { level: 7, spellName: 'Forma de Sombra' },
      { level: 8, spellName: 'Sombra Demoníaca' },
      { level: 9, spellName: 'Oscuridad Sobrenatural' },
    ],
  },
  {
    id: 'death',
    name: 'Muerte',
    description: 'Dominio del fin de la vida, los no-muertos y el tránsito al más allá.',
    powers: [
      {
        name: 'Toque Mortífero',
        description: 'Como acción estándar, tocas a una criatura viviente infligiéndole 1d6 de daño por dos niveles de clérigo (mínimo 1d6). Este daño no puede ser reducido por resistencia o inmunidad al daño. Tirada de salvación de Fortaleza CD (10 + ½ nivel + mod SAB) para reducir a la mitad.',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 1,
      },
      {
        name: 'Aura de Muerte',
        description: 'A partir del nivel 8, irradias un aura de muerte de 30 pies. Las criaturas vivas que entren en el aura reciben 4d6 de daño de negative energy. Tirada de Voluntad CD (10 + ½ nivel + mod SAB) para reducir a la mitad. Este efecto dura 1 ronda por nivel.',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 8,
      },
    ],
    spells: [
      { level: 1, spellName: 'Causar Miedo' },
      { level: 2, spellName: 'Toque de la Mortaja' },
      { level: 3, spellName: 'Animar Muertos' },
      { level: 4, spellName: 'Matar' },
      { level: 5, spellName: 'Muerte Súbita' },
      { level: 6, spellName: 'Crear No-Muertos' },
      { level: 7, spellName: 'Destruir No-Muertos' },
      { level: 8, spellName: 'Crear No-Muertos Mayores' },
      { level: 9, spellName: 'Muerte' },
    ],
  },
  {
    id: 'earth',
    name: 'Tierra',
    description: 'Dominio de la roca, los minerales y la solidez de la tierra.',
    powers: [
      {
        name: 'Toque Ácido',
        description: 'Como acción estándar, tocas a una criatura infligiéndole 1d6 de daño ácido + 1 por nivel de clérigo. Tirada de salvación de Reflejos CD (10 + ½ nivel + mod SAB) para reducir a la mitad.',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 1,
      },
      {
        name: 'Piel de Piedra',
        description: 'A partir del nivel 6, tu piel adquiere dureza pétrea. Ganas RD 6/adamantina. Este efecto dura 1 minuto por nivel de clérigo.',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 6,
      },
    ],
    spells: [
      { level: 1, spellName: 'Polvo Cegador' },
      { level: 2, spellName: 'Piel de Tierra' },
      { level: 3, spellName: 'Remodelación de Piedra' },
      { level: 4, spellName: 'Piel de Piedra' },
      { level: 5, spellName: 'Teletransporte Terrestre' },
      { level: 6, spellName: 'Mover la Tierra' },
      { level: 7, spellName: 'Terremoto' },
      { level: 8, spellName: 'Torrente de Lava' },
      { level: 9, spellName: 'Elemental de Tierra (superior)' },
    ],
  },
  {
    id: 'fire',
    name: 'Fuego',
    description: 'Dominio de las llamas, el calor y la destrucción purificadora.',
    powers: [
      {
        name: 'Toque de Llamas',
        description: 'Como acción estándar, tocas a una criatura infligiéndole 1d6 de daño de fuego + 1 por nivel de clérigo. Las criaturas inflamables pueden prenderse fuego. Tirada de salvación de Reflejos CD (10 + ½ nivel + mod SAB) para reducir a la mitad.',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 1,
      },
      {
        name: 'Aura de Fuego',
        description: 'A partir del nivel 8, irradias un aura de fuego. Las criaturas a 10 pies reciben 1d6 de daño de fuego por ronda. Ganas inmunidad al fuego. Este efecto dura 1 ronda por nivel.',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 8,
      },
    ],
    spells: [
      { level: 1, spellName: 'Manos Ardientes' },
      { level: 2, spellName: 'Producir Llamas' },
      { level: 3, spellName: 'Bola de Fuego' },
      { level: 4, spellName: 'Pared de Fuego' },
      { level: 5, spellName: 'Nube de Fuego' },
      { level: 6, spellName: 'Semilla de Fuego' },
      { level: 7, spellName: 'Tormenta de Fuego' },
      { level: 8, spellName: 'Manto Íncubo de Llamas' },
      { level: 9, spellName: 'Elemental de Fuego (superior)' },
    ],
  },
  {
    id: 'good',
    name: 'Bien',
    description: 'Dominio de la bondad, la protección divina y la lucha contra el mal.',
    powers: [
      {
        name: 'Toque Sagrado',
        description: 'Como acción estándar, tocas a una criatura aliada infundiéndole valor divino. Recibe un bonificador de sagrado de +1 a tiradas de ataque, salvación y pruebas de habilidad durante 1 rondo por nivel de clérigo. El bonificador aumenta en +1 cada cuatro niveles.',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 1,
      },
      {
        name: 'Aura de Bien',
        description: 'A partir del nivel 8, irradias un aura de bien de 30 pies que otorga a los aliados resistencia 10 al daño de alineamiento maligno y un bonificador de sagrado de +4 a tiradas de salvación contra hechizos de criaturas malignas.',
        usesFormula: 'unlimited',
        unlocksAtLevel: 8,
      },
    ],
    spells: [
      { level: 1, spellName: 'Protección contra el Mal' },
      { level: 2, spellName: 'Ayuda' },
      { level: 3, spellName: 'Círculo Mágico contra el Mal' },
      { level: 4, spellName: 'Bien Santo' },
      { level: 5, spellName: 'Disipar el Mal' },
      { level: 6, spellName: 'Convocar Monstruo VI (bien)' },
      { level: 7, spellName: 'Palabra Sagrada' },
      { level: 8, spellName: 'Escudo de la Ley' },
      { level: 9, spellName: 'Convocar Monstruo IX (bien)' },
    ],
  },
  {
    id: 'healing',
    name: 'Curación',
    description: 'Dominio de la restauración, la salud y el poder de sanar.',
    powers: [
      {
        name: 'Toque Curativo',
        description: 'Como acción estándar, tocas a una criatura curándole 1d6 + 1 por nivel de clérigo puntos de golpe. Este poder puede usarse también para dañar a no-muertos (tirada de salvación de Voluntad CD para reducir a la mitad).',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 1,
      },
      {
        name: 'Curación Mayor',
        description: 'A partir del nivel 6, cuando lanzas hechizos de curación curas el máximo posible de puntos de golpe (sin tirada de dados). Además, los hechizos de curación que lances en otros curan puntos adicionales iguales a tu nivel de clérigo.',
        usesFormula: 'unlimited',
        unlocksAtLevel: 6,
      },
    ],
    spells: [
      { level: 1, spellName: 'Curar Heridas Leves' },
      { level: 2, spellName: 'Curar Heridas Moderadas' },
      { level: 3, spellName: 'Curar Heridas Graves' },
      { level: 4, spellName: 'Curar Heridas Críticas' },
      { level: 5, spellName: 'Curar Heridas Leves (Masivo)' },
      { level: 6, spellName: 'Curar Heridas Moderadas (Masivo)' },
      { level: 7, spellName: 'Curar Heridas Graves (Masivo)' },
      { level: 8, spellName: 'Curar Heridas Críticas (Masivo)' },
      { level: 9, spellName: 'Curación Total' },
    ],
  },
  {
    id: 'knowledge',
    name: 'Conocimiento',
    description: 'Dominio de la sabiduría, el aprendizaje y la verdad divina.',
    powers: [
      {
        name: 'Lore Divino',
        description: 'Recibes un bonificador de competencia a todas las pruebas de Conocimiento igual a la mitad de tu nivel de clérigo (mínimo +1). Puedes hacer tiradas de Conocimiento sin entrenamiento en cualquier campo.',
        usesFormula: 'unlimited',
        unlocksAtLevel: 1,
      },
      {
        name: 'Ojo de la Verdad',
        description: 'A partir del nivel 8, puedes lanzar Visión Verdadera como poder divino una vez al día. La duración es de 1 ronda por nivel de clérigo.',
        usesFormula: 'fixed',
        fixedUses: 1,
        unlocksAtLevel: 8,
      },
    ],
    spells: [
      { level: 1, spellName: 'Comprensión de Idiomas' },
      { level: 2, spellName: 'Detección de Pensamientos' },
      { level: 3, spellName: 'Clarividencia/Clariaudiencia' },
      { level: 4, spellName: 'Discernir Mentiras' },
      { level: 5, spellName: 'Verdad Compulsiva' },
      { level: 6, spellName: 'Visión Verdadera' },
      { level: 7, spellName: 'Visión del Oráculo' },
      { level: 8, spellName: 'Mente en Blanco' },
      { level: 9, spellName: 'Foresight' },
    ],
  },
  {
    id: 'strength',
    name: 'Fuerza',
    description: 'Dominio del poder físico, la musculatura y las proezas atléticas.',
    powers: [
      {
        name: 'Mano Poderosa',
        description: 'Como acción rápida, recibes un bonificador de +1 a tiradas de ataque y pruebas de Fuerza durante 1 ronda. Este bonificador aumenta en +1 por cada cinco niveles de clérigo.',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 1,
      },
      {
        name: 'Cuerpo de Gigante',
        description: 'A partir del nivel 8, puedes aumentar tu tamaño a Grande durante 1 ronda por nivel de clérigo. Ganas +4 FUE, –2 DES, +2 al aguante, alcance de 10 pies y RD 2/–. Puedes activar y desactivar este poder como acción rápida.',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 8,
      },
    ],
    spells: [
      { level: 1, spellName: 'Agrandar Persona' },
      { level: 2, spellName: 'Resistencia a los Elementos' },
      { level: 3, spellName: 'Intensificar la Gravedad' },
      { level: 4, spellName: 'Fuerza del Oso' },
      { level: 5, spellName: 'Agrandar Persona (Masivo)' },
      { level: 6, spellName: 'Golpe Poderoso' },
      { level: 7, spellName: 'Piel de Roca' },
      { level: 8, spellName: 'Terremoto' },
      { level: 9, spellName: 'Ira de la Tormenta' },
    ],
  },
  {
    id: 'sun',
    name: 'Sol',
    description: 'Dominio de la luz, el calor solar y la destrucción de la oscuridad.',
    powers: [
      {
        name: 'Rayo de Sol',
        description: 'Como acción estándar, disparas un rayo de luz solar a 30 pies que inflige 1d6 de daño de fuego por dos niveles de clérigo a una criatura. Los no-muertos reciben el doble de daño. Tirada de salvación de Reflejos CD (10 + ½ nivel + mod SAB) para reducir a la mitad.',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 1,
      },
      {
        name: 'Sol de Mediodia',
        description: 'A partir del nivel 8, una vez por día puedes crear un efecto de luz de luz solar durante 1 minuto por nivel de clérigo que ilumina 60 pies. Los no-muertos en el área reciben daño igual a tu nivel de clérigo por ronda (tirada de Voluntad para reducir a la mitad).',
        usesFormula: 'fixed',
        fixedUses: 1,
        unlocksAtLevel: 8,
      },
    ],
    spells: [
      { level: 1, spellName: 'Luz Astral' },
      { level: 2, spellName: 'Luz Cegadora' },
      { level: 3, spellName: 'Explosión de Luz' },
      { level: 4, spellName: 'Golpe Ardiente' },
      { level: 5, spellName: 'Luz del Día (Mejorada)' },
      { level: 6, spellName: 'Prisma de Colores' },
      { level: 7, spellName: 'Prisma de Rayo' },
      { level: 8, spellName: 'Rayo Solar' },
      { level: 9, spellName: 'Prisma (Mejorado)' },
    ],
  },
  {
    id: 'war',
    name: 'Guerra',
    description: 'Dominio del combate, las armas y el poder en la batalla.',
    powers: [
      {
        name: 'Bendición de las Armas',
        description: 'Como acción rápida, puedes conceder a un arma tocada un bonificador de mejora de +1 a tiradas de ataque y daño durante 1 ronda por nivel de clérigo. Este bonificador aumenta en +1 por cada cuatro niveles de clérigo (máx +5).',
        usesFormula: 'wisdomMod',
        unlocksAtLevel: 1,
      },
      {
        name: 'Maestría en Armas de Guerra',
        description: 'A partir del nivel 8, eres competente con todas las armas marciales. Además, cuando golpeas con un arma, añades tu bonificador de Sabiduría al daño adicional al bonificador normal de Fuerza.',
        usesFormula: 'unlimited',
        unlocksAtLevel: 8,
      },
    ],
    spells: [
      { level: 1, spellName: 'Bendición de las Armas' },
      { level: 2, spellName: 'Arma Espiritual' },
      { level: 3, spellName: 'Guardia del Espíritu' },
      { level: 4, spellName: 'Arma Sagrada' },
      { level: 5, spellName: 'Brasas de la Llama' },
      { level: 6, spellName: 'Golpe de la Llama' },
      { level: 7, spellName: 'Maestría de Armas' },
      { level: 8, spellName: 'Escudo del Héroe' },
      { level: 9, spellName: 'Tormenta de Armas' },
    ],
  },
]

export function getDomainById(id: string): DomainData | undefined {
  return DOMAINS.find(d => d.id === id)
}
