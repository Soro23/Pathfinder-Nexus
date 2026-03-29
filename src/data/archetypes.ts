import type { ClassFeature, SpellsPerDayTable } from './classes'

export type ReplacementType = 'replaces' | 'changes' | 'optional'

export interface ArchetypeReplacement {
  featureName: string
  atLevel: number
  type: ReplacementType
}

export interface Archetype {
  id: string
  classId: string
  name: string
  description: string
  replaces: ArchetypeReplacement[]
  features: ClassFeature[]
  classSkillsAdded?: string[]
  classSkillsRemoved?: string[]
  spellsPerDayOverride?: SpellsPerDayTable
}

export const ARCHETYPES: Archetype[] = [
  // ─── BARBARIAN ───────────────────────────────────────────────────────────────
  {
    id: 'invulnerable-rager',
    classId: 'barbarian',
    name: 'Invulnerable Rager',
    description: 'Cambia la resistencia estándar por invulnerabilidad y resistencia al daño que crece con el nivel.',
    replaces: [
      { featureName: 'Furia Improved', atLevel: 2, type: 'replaces' },
      { featureName: 'Furia Greater', atLevel: 3, type: 'replaces' },
    ],
    features: [
      { name: 'Invulnerabilidad', level: 2, description: 'Reduces todo el daño físico en 1 punto, aumentando cada 4 niveles.' },
      { name: 'Resistencia Extrema', level: 3, description: 'Reduces el daño de fuego y frío en la mitad.' },
    ],
  },
  {
    id: 'brutal-pugilist',
    classId: 'barbarian',
    name: 'Brutal Pugilist',
    description: 'Sustituye algunas características por maestría en combate desarmado y agarres.',
    replaces: [
      { featureName: 'Furia Improved', atLevel: 2, type: 'replaces' },
      { featureName: 'Furia Mayor', atLevel: 4, type: 'replaces' },
    ],
    features: [
      { name: 'Golpe Salvaje', level: 2, description: 'Tu daño desarmado aumenta al igual que el de un monje.' },
      { name: 'Agarre Brutal', level: 4, description: 'Ganas bonificación de +2 a maniobras de combate para agarrar.' },
    ],
  },
  {
    id: 'urban-barbarian',
    classId: 'barbarian',
    name: 'Urban Barbarian',
    description: 'Adapta la furia salvaje a un entorno urbano, cambiando algunas habilidades de clase.',
    replaces: [
      { featureName: 'Despertar de Furia', atLevel: 1, type: 'changes' },
      { featureName: 'Furia Tireless', atLevel: 5, type: 'replaces' },
    ],
    features: [
      { name: 'Furia Controlada', level: 1, description: 'Puedes elegir qué estadísticas mejoran durante la furia.' },
      { name: 'Lealtad Urbana', level: 5, description: 'Ganas habilidades de clase sociales adicionales.' },
    ],
    classSkillsAdded: ['diplomacy', 'knowledge_local', 'linguistics'],
    classSkillsRemoved: ['handle_animal', 'survival'],
  },
  {
    id: 'armored-hulk',
    classId: 'barbarian',
    name: 'Armored Hulk',
    description: 'Especialista en armadura pesada que mantiene la movilidad bárbara.',
    replaces: [
      { featureName: 'Furia Improved', atLevel: 2, type: 'replaces' },
    ],
    features: [
      { name: 'Competencia con Armadura Pesada', level: 1, description: 'Ganas competencia con armaduras pesadas sin penalización extra a movimiento.' },
      { name: 'Mole Blindada', level: 2, description: 'Reduces la penalización de armadura a la velocidad en 5 pies.' },
    ],
  },

  // ─── BARD ─────────────────────────────────────────────────────────────────
  {
    id: 'arcane-duelist',
    classId: 'bard',
    name: 'Arcane Duelist',
    description: 'Combina esgrima mágica con actuación. Reemplaza algunas inspiraciones por habilidades de combate.',
    replaces: [
      { featureName: 'Conocimiento Bardo', atLevel: 1, type: 'replaces' },
      { featureName: 'Inspiración Valiente', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Danza de Espada', level: 1, description: 'Puedes usar Actuación (esgrima) para inspire courage.' },
      { name: 'Arco Arcano', level: 1, description: 'Tratas una espada elegida como arma de duelista arcano.' },
    ],
  },
  {
    id: 'court-bard',
    classId: 'bard',
    name: 'Court Bard',
    description: 'Especializado en intriga y política de la corte. Cambia la inspiración por manipulación social.',
    replaces: [
      { featureName: 'Inspiración Valiente', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Sátira', level: 1, description: 'Tu actuación aplica penalización a los enemigos en lugar de bonificación a aliados.' },
      { name: 'Gracia de Corte', level: 3, description: 'Ganas bonificación a Diplomacia y Engaño igual a la mitad de tu nivel.' },
    ],
    classSkillsAdded: ['knowledge_nobility'],
  },
  {
    id: 'street-performer',
    classId: 'bard',
    name: 'Street Performer',
    description: 'Artista callejero que actúa para multitudes y usa el caos urbano a su favor.',
    replaces: [
      { featureName: 'Inspiración Maestro', atLevel: 5, type: 'replaces' },
    ],
    features: [
      { name: 'Actuación Masiva', level: 5, description: 'Puedes mantener bardic performance sin acción si la multitud ya está involucrada.' },
      { name: 'Carterista', level: 1, description: 'Ganas Sleight of Hand como habilidad de clase y la mitad del nivel como bonificación.' },
    ],
  },

  // ─── CLERIC ───────────────────────────────────────────────────────────────
  {
    id: 'herald-caller',
    classId: 'cleric',
    name: 'Herald Caller',
    description: 'Especialista en convocar aliados divinos en lugar de canalizar energía.',
    replaces: [
      { featureName: 'Canalizar Energía', atLevel: 1, type: 'replaces' },
      { featureName: 'Dominio', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Convocar al Servidor', level: 1, description: 'Obtienes Convocar Monstruos como poder de dominio divino.' },
      { name: 'Aliado Divino', level: 3, description: 'Las criaturas que convocas ganan bonificadores extra por cada 3 niveles.' },
    ],
  },
  {
    id: 'theologian',
    classId: 'cleric',
    name: 'Theologian',
    description: 'Clérigo especializado en un único dominio que lo lleva a la maestría absoluta.',
    replaces: [
      { featureName: 'Dominio', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Dominio Enfocado', level: 1, description: 'Solo tienes un dominio pero sus poderes se duplican en efecto.' },
      { name: 'Magia de Dominio Intensificada', level: 8, description: 'Los conjuros de tu dominio se lanzan como si fueras 4 niveles más alto.' },
    ],
  },
  {
    id: 'ecclesitheurge',
    classId: 'cleric',
    name: 'Ecclesitheurge',
    description: 'Clérigo puro de la fe que evita la lucha y maximiza el poder divino.',
    replaces: [
      { featureName: 'Canalizar Energía', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Dominio Ampliado', level: 1, description: 'Puedes elegir un tercer dominio pero solo usas poderes del primero.' },
      { name: 'Vínculo con el Templo', level: 4, description: 'Mientras estés en terreno sagrado tu nivel de clérigo cuenta +4 para poderes de dominio.' },
    ],
  },

  // ─── DRUID ────────────────────────────────────────────────────────────────
  {
    id: 'blight-druid',
    classId: 'druid',
    name: 'Blight Druid',
    description: 'Druida de la putrefacción y la decadencia. Cambia compañero animal por plaga.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Señor de la Plaga', level: 1, description: 'Obtienes poder sobre criaturas de tipo vermin y plantas corrompidas.' },
      { name: 'Aura de Podredumbre', level: 3, description: 'Las criaturas adyacentes sufren penalización a las salvaciones de Fortaleza.' },
    ],
  },
  {
    id: 'cave-druid',
    classId: 'druid',
    name: 'Cave Druid',
    description: 'Druida de las cavernas y los subterráneos. Adapta la magia de naturaleza al inframundo.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 1, type: 'changes' },
      { featureName: ' forma Salvaje', atLevel: 4, type: 'changes' },
    ],
    features: [
      { name: 'Visión de Caverna', level: 1, description: 'Ganas visión en la oscuridad hasta 30 pies.' },
      { name: 'Adaptación Subterránea', level: 2, description: 'Ignoras la penalización de moverse en terreno difícil subterráneo.' },
    ],
  },
  {
    id: 'storm-druid',
    classId: 'druid',
    name: 'Storm Druid',
    description: 'Druida especializado en tormentas y fenómenos atmosféricos.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 1, type: 'optional' },
    ],
    features: [
      { name: 'Tormenta Menor', level: 1, description: 'Puedes crear efectos meteorológicos menores a voluntad.' },
      { name: 'Llamada de la Tormenta', level: 6, description: 'Convocas una tormenta menor que dura horas igual a tu nivel.' },
    ],
  },

  // ─── FIGHTER ──────────────────────────────────────────────────────────────
  {
    id: 'archer',
    classId: 'fighter',
    name: 'Archer',
    description: 'Guerrero especializado en arco y armas de proyectil.',
    replaces: [
      { featureName: 'Armadura Pesada', atLevel: 3, type: 'replaces' },
    ],
    features: [
      { name: 'Especialista en Arco', level: 2, description: 'Puedes disparar en área de amenaza sin provocar ataques de oportunidad.' },
      { name: 'Puntería Precisa', level: 3, description: 'Ignoras la bonificación de cobertura del objetivo.' },
    ],
  },
  {
    id: 'two-weapon-warrior',
    classId: 'fighter',
    name: 'Two-Weapon Warrior',
    description: 'Maestro del combate con dos armas que minimiza las penalizaciones.',
    replaces: [
      { featureName: 'Armadura Pesada', atLevel: 3, type: 'replaces' },
    ],
    features: [
      { name: 'Guardia con Dos Armas', level: 3, description: 'Cuando luchas con dos armas ganas +1 a CA.' },
      { name: 'Ataque con Dos Armas Mejorado', level: 5, description: 'Reduces la penalización por luchar con dos armas en 1.' },
    ],
  },
  {
    id: 'weapon-master',
    classId: 'fighter',
    name: 'Weapon Master',
    description: 'Guerrero que se concentra en dominar un arma específica a la perfección.',
    replaces: [
      { featureName: 'Destreza', atLevel: 2, type: 'changes' },
    ],
    features: [
      { name: 'Arma Elegida', level: 1, description: 'Eliges un arma; todos tus talentos de guerrero deben relacionarse con ella.' },
      { name: 'Maestría de Arma', level: 3, description: 'Ganas Enfoque en Arma y Especialización en Arma con tu arma elegida gratis.' },
    ],
  },
  {
    id: 'lore-warden',
    classId: 'fighter',
    name: 'Lore Warden',
    description: 'Guerrero académico que combina conocimiento estratégico con habilidades de combate.',
    replaces: [
      { featureName: 'Armadura Pesada', atLevel: 3, type: 'replaces' },
    ],
    features: [
      { name: 'Conocimiento Combativo', level: 2, description: 'Añades la mitad de tu nivel a checks de Conocimiento relacionados con monstruos.' },
      { name: 'Maniobra Táctica', level: 3, description: 'Ganas +2 a maniobras de combate cuando usas un movimiento para estudiar al oponente.' },
    ],
    classSkillsAdded: ['knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_nature', 'knowledge_planes', 'knowledge_religion'],
  },

  // ─── MONK ─────────────────────────────────────────────────────────────────
  {
    id: 'master-of-many-styles',
    classId: 'monk',
    name: 'Master of Many Styles',
    description: 'Monje que domina múltiples estilos de combate desarmado.',
    replaces: [
      { featureName: 'Golpe Aturdidor', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Fusión de Estilos', level: 1, description: 'Puedes tener dos estilos de combate activos simultáneamente.' },
      { name: 'Perfección de Estilo', level: 4, description: 'Puedes entrar en tres estilos de combate a la vez.' },
    ],
  },
  {
    id: 'zen-archer',
    classId: 'monk',
    name: 'Zen Archer',
    description: 'Monje que canaliza disciplina interna a través del arco.',
    replaces: [
      { featureName: 'Golpe sin Arma', atLevel: 1, type: 'changes' },
      { featureName: 'Armadura Natural', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Arco Perfecto', level: 1, description: 'Tratas el arco como arma de monje y ganas Arma Enfocada con él.' },
      { name: 'Flecha Ki', level: 3, description: 'Puedes gastar puntos ki para añadir daño a tus flechas.' },
    ],
  },
  {
    id: 'tetori',
    classId: 'monk',
    name: 'Tetori',
    description: 'Especialista en lucha y agarres, adaptando la disciplina monástica a la inmovilización.',
    replaces: [
      { featureName: 'Golpe Aturdidor', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Presa del Campeón', level: 1, description: 'Ganas Agarre Mejorado como bonificación y no pierdes el modificador de Destreza mientras luchas.' },
      { name: 'Cerrojo Experto', level: 4, description: 'Cuando inmovilizas a un oponente puedes hacer una tirada de daño sin arma.' },
    ],
  },

  // ─── PALADIN ──────────────────────────────────────────────────────────────
  {
    id: 'divine-defender',
    classId: 'paladin',
    name: 'Divine Defender',
    description: 'Paladín protector que refuerza a sus aliados en lugar de atacar.',
    replaces: [
      { featureName: 'Montura Divina', atLevel: 4, type: 'replaces' },
    ],
    features: [
      { name: 'Defensa Compartida', level: 4, description: 'Gastas usos de Manos Puestas para dar bonificaciones de CA a aliados adyacentes.' },
      { name: 'Santuario Divino', level: 8, description: 'Creas un aura de protección de 10 pies que otorga bonificación de sagrado a saves.' },
    ],
  },
  {
    id: 'hospitaler',
    classId: 'paladin',
    name: 'Hospitaler',
    description: 'Paladín dedicado a la curación y el apoyo de sus aliados.',
    replaces: [
      { featureName: 'Aura de Bien', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Curación Potenciada', level: 4, description: 'Tus usos de Manos Puestas curan el doble cuando se usan en tus aliados.' },
      { name: 'Cirujano de Combate', level: 6, description: 'Puedes usar Manos Puestas como acción rápida para estabilizar a un aliado.' },
    ],
  },
  {
    id: 'sacred-servant',
    classId: 'paladin',
    name: 'Sacred Servant',
    description: 'Paladín que añade poder de dominio clerical a sus capacidades divinas.',
    replaces: [
      { featureName: 'Montura Divina', atLevel: 4, type: 'optional' },
    ],
    features: [
      { name: 'Dominio Sagrado', level: 4, description: 'Obtienes los poderes de concesión de un dominio divino de tu deidad.' },
      { name: 'Poder Divino Ampliado', level: 8, description: 'Usas el nivel completo de paladín para determinar los efectos del dominio.' },
    ],
  },

  // ─── RANGER ───────────────────────────────────────────────────────────────
  {
    id: 'beastmaster',
    classId: 'ranger',
    name: 'Beast Master',
    description: 'Explorador que cultiva múltiples compañeros animales.',
    replaces: [
      { featureName: 'Enemigo Favorito', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Lazo Múltiple', level: 1, description: 'Puedes tener hasta tres compañeros animales, aunque son más débiles individualmente.' },
      { name: 'Vínculo de Manada', level: 4, description: 'Tus compañeros actúan coordinados, ganando bonificadores cuando están adyacentes.' },
    ],
  },
  {
    id: 'guide',
    classId: 'ranger',
    name: 'Guide',
    description: 'Explorador experto en navegar terreno y guiar grupos.',
    replaces: [
      { featureName: 'Enemigo Favorito', atLevel: 1, type: 'changes' },
      { featureName: 'Terreno Favorito', atLevel: 3, type: 'changes' },
    ],
    features: [
      { name: 'Guía Experto', level: 1, description: 'Ganas Supervivencia y Conocimiento Geográfico como habilidades enfocadas.' },
      { name: 'Terreno Adaptado', level: 3, description: 'Tus bonificadores de terreno favorito se aplican a un radio mayor e incluyen a aliados.' },
    ],
  },
  {
    id: 'skirmisher',
    classId: 'ranger',
    name: 'Skirmisher',
    description: 'Explorador que usa trucos de combate en lugar de magia.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 4, type: 'optional' },
    ],
    features: [
      { name: 'Trucos de Cazador', level: 4, description: 'Aprendes trucos de combate que se activan al moverte en combate.' },
      { name: 'Movimiento Táctico', level: 6, description: 'Puedes moverte sin provocar ataques de oportunidad una vez por ronda.' },
    ],
  },
  {
    id: 'ranger-archer',
    classId: 'ranger',
    name: 'Archer (Ranger)',
    description: 'Explorador especializado en combate a distancia con arco.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 4, type: 'optional' },
    ],
    features: [
      { name: 'Lluvia de Flechas', level: 4, description: 'Puedes realizar disparos adicionales con penalización reducida.' },
      { name: 'Disparar y Correr', level: 6, description: 'Puedes disparar y moverte sin penalización en el mismo turno.' },
    ],
  },

  // ─── ROGUE ────────────────────────────────────────────────────────────────
  {
    id: 'scout',
    classId: 'rogue',
    name: 'Scout',
    description: 'Pícaro explorador que activa su ataque furtivo al moverse.',
    replaces: [
      { featureName: 'Trampa Sense', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Movimiento Furtivo', level: 4, description: 'Puedes aplicar ataque furtivo cuando te mueves 10 pies antes del ataque.' },
      { name: 'Carga Furtiva', level: 8, description: 'Puedes aplicar ataque furtivo al cargar.' },
    ],
  },
  {
    id: 'swashbuckler-rogue',
    classId: 'rogue',
    name: 'Swashbuckler',
    description: 'Pícaro que usa ingenio y agilidad acrobática en lugar de ocultación.',
    replaces: [
      { featureName: 'Trampa Sense', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Espadachín', level: 1, description: 'Ganas competencia con espadas ligeras y el talento Finesse sin requisitos.' },
      { name: 'Gracia de Duelo', level: 3, description: 'Añades tu modificador de Carisma a los checks de Intimidar contra oponentes que hayas herido.' },
    ],
  },
  {
    id: 'thug',
    classId: 'rogue',
    name: 'Thug',
    description: 'Pícaro violento que usa el miedo como arma principal.',
    replaces: [
      { featureName: 'Trampa Sense', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Intimidación Brutal', level: 1, description: 'Puedes Intimidar como acción de movimiento en lugar de estándar.' },
      { name: 'Golpe Aterrador', level: 2, description: 'Con ataque furtivo puedes asustar al objetivo en lugar de dañarlo.' },
    ],
  },
  {
    id: 'acrobat',
    classId: 'rogue',
    name: 'Acrobat',
    description: 'Pícaro que usa la acrobacia extrema para moverse y atacar.',
    replaces: [
      { featureName: 'Trampa Sense', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Movimiento Ágil', level: 1, description: 'Puedes ignorar terreno difícil con movimiento acrobático.' },
      { name: 'Escalar Ágil', level: 2, description: 'Tu velocidad de escalar es igual a tu velocidad base de tierra.' },
    ],
  },

  // ─── SORCERER ─────────────────────────────────────────────────────────────
  {
    id: 'tattooed-sorcerer',
    classId: 'sorcerer',
    name: 'Tattooed Sorcerer',
    description: 'Hechicero que almacena poderes mágicos en tatuajes corporales.',
    replaces: [
      { featureName: 'Linaje de Sangre', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Tatuaje Familiar', level: 1, description: 'Tu familiar vive en uno de tus tatuajes y puede resurgir de él.' },
      { name: 'Tatuaje Mágico', level: 3, description: 'Puedes activar efectos de conjuro almacenados en tus tatuajes.' },
    ],
  },
  {
    id: 'crossblooded',
    classId: 'sorcerer',
    name: 'Crossblooded',
    description: 'Hechicero con dos linajes de sangre que potencian ciertos hechizos.',
    replaces: [
      { featureName: 'Linaje de Sangre', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Doble Linaje', level: 1, description: 'Eliges dos linajes de sangre; obtienes los hechizos conocidos de ambos.' },
      { name: 'Hechizos Potenciados', level: 1, description: 'Los hechizos de ambos linajes se lanzan a nivel +1.' },
    ],
  },
  {
    id: 'seeker',
    classId: 'sorcerer',
    name: 'Seeker',
    description: 'Hechicero explorador de ruinas y conocimiento arcano perdido.',
    replaces: [
      { featureName: 'Hechizos', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Conocimiento Arcano', level: 1, description: 'Ganas Conocimiento Arcano y Descifrar Escritura como habilidades de clase.' },
      { name: 'Trampa Detectora', level: 2, description: 'Puedes detectar trampas mágicas como un ladrón de nivel igual al tuyo.' },
    ],
    classSkillsAdded: ['knowledge_arcana', 'linguistics', 'perception'],
  },

  // ─── WIZARD ───────────────────────────────────────────────────────────────
  {
    id: 'exploiter-wizard',
    classId: 'wizard',
    name: 'Exploiter Wizard',
    description: 'Mago que intercambia la especialización de escuela por explotaciones arcanas.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Explotación Arcana', level: 1, description: 'Obtienes explotaciones arcanas del arcanista en lugar de poderes de escuela.' },
      { name: 'Reserva Arcana', level: 1, description: 'Tienes una reserva de puntos arcanos igual a tu nivel + mod. INT.' },
    ],
  },
  {
    id: 'spell-sage',
    classId: 'wizard',
    name: 'Spell Sage',
    description: 'Mago generalista que puede lanzar cualquier hechizo de cualquier escuela con potencia máxima.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Conocimiento Completo', level: 1, description: 'No tienes escuelas prohibidas y tratas todos los conjuros como de tu escuela.' },
      { name: 'Hechizo Potenciado', level: 2, description: 'Una vez por día puedes lanzar un hechizo con nivel de conjurador +2.' },
    ],
  },
  {
    id: 'bonded-wizard',
    classId: 'wizard',
    name: 'Bonded Wizard',
    description: 'Mago cuyo vínculo con su objeto arcano o familiar es extremadamente profundo.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Vínculo Arcano Profundo', level: 1, description: 'Tu objeto vinculado o familiar gana poderes adicionales cada 5 niveles.' },
      { name: 'Recuperación Vinculada', level: 5, description: 'Puedes usar el vínculo para recuperar un conjuro lanzado ese día.' },
    ],
  },
  {
    id: 'diviner',
    classId: 'wizard',
    name: 'Diviner',
    description: 'Mago especializado en adivinación y predicción del futuro.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Augure', level: 1, description: 'Lanzas conjuros de adivinación a nivel +2 efectivo.' },
      { name: 'Visión Futura', level: 1, description: 'Una vez por día puedes relanzar un dado de iniciativa.' },
    ],
  },
]
