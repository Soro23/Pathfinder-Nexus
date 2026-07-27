/**
 * Upload domains and blessings to Supabase.
 *
 * ANTES DE EJECUTAR: crear las tablas en Supabase con este SQL:
 *
 *   CREATE TABLE IF NOT EXISTS public.domains (
 *     id text PRIMARY KEY,
 *     name text NOT NULL,
 *     description text,
 *     powers jsonb DEFAULT '[]',
 *     spells jsonb DEFAULT '[]'
 *   );
 *   ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "Public read" ON public.domains FOR SELECT USING (true);
 *   CREATE POLICY "Service insert" ON public.domains FOR INSERT WITH CHECK (true);
 *   CREATE POLICY "Service update" ON public.domains FOR UPDATE USING (true);
 *
 *   CREATE TABLE IF NOT EXISTS public.blessings (
 *     id text PRIMARY KEY,
 *     name text NOT NULL,
 *     description text,
 *     powers jsonb DEFAULT '[]'
 *   );
 *   ALTER TABLE public.blessings ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "Public read" ON public.blessings FOR SELECT USING (true);
 *   CREATE POLICY "Service insert" ON public.blessings FOR INSERT WITH CHECK (true);
 *   CREATE POLICY "Service update" ON public.blessings FOR UPDATE USING (true);
 *
 * Ejecutar:  node --env-file=.env.local scripts/upload-domains-blessings.cjs
 */

const https = require('https')

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL ?? '').replace(/^https?:\/\//, '')
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars (run with --env-file=.env.local)')
  process.exit(1)
}

// ── Local data (inline, same as src/data/domains.ts + src/data/blessings.ts) ──

const DOMAINS = [
  { id: 'air', name: 'Aire', description: 'Dominio del viento, las tormentas y el cielo abierto.', powers: [{ name: 'Rayo de Relámpago', description: 'Como acción estándar, disparas un rayo de electricidad que inflige 1d6 de daño eléctrico por nivel de clérigo (máx 10d6) a una criatura a 30 pies. Tirada de salvación de Reflejos CD (10 + ½ nivel + mod SAB) para reducir a la mitad.', usesFormula: 'wisdomMod', unlocksAtLevel: 1 }, { name: 'Vuelo Divino', description: 'A partir del nivel 8, puedes volar (velocidad 60 pies, maniobrabilidad buena) durante 1 minuto por nivel de clérigo. Puedes dividir esta duración en incrementos de 1 minuto.', usesFormula: 'fixed', fixedUses: 1, unlocksAtLevel: 8 }], spells: [{ level: 1, spellName: 'Alas de Viento' }, { level: 2, spellName: 'Resistencia a la Electricidad' }, { level: 3, spellName: 'Llamar al Relámpago' }, { level: 4, spellName: 'Control del Viento' }, { level: 5, spellName: 'Tormenta de Relámpagos' }, { level: 6, spellName: 'Cadena de Relámpagos' }, { level: 7, spellName: 'Control del Tiempo' }, { level: 8, spellName: 'Torbellino' }, { level: 9, spellName: 'Tormenta de Veneno' }] },
  { id: 'animal', name: 'Animal', description: 'Dominio de las bestias, la naturaleza salvaje y los instintos primarios.', powers: [{ name: 'Amistad con los Animales', description: 'Puedes lanzar encantamiento en animales como si fuera un hechizo divino sin necesidad de tirada de salvación. Los animales tienen un actitud inicial de Amigable hacia ti. Este efecto dura 1 hora por nivel de clérigo.', usesFormula: 'wisdomMod', unlocksAtLevel: 1 }, { name: 'Ojos de la Bestia', description: 'A partir del nivel 6, puedes ver a través de los ojos de cualquier animal a 100 pies durante 1 minuto por nivel de clérigo como si lanzaras el conjuro Compartir Sentidos.', usesFormula: 'wisdomMod', unlocksAtLevel: 6 }], spells: [{ level: 1, spellName: 'Hablar con los Animales' }, { level: 2, spellName: 'Amistad con los Animales' }, { level: 3, spellName: 'Dominar Animal' }, { level: 4, spellName: 'Piel de Oso' }, { level: 5, spellName: 'Convocar Monstruo V (animales)' }, { level: 6, spellName: 'Antipatía' }, { level: 7, spellName: 'Convocar Monstruo VII (animales)' }, { level: 8, spellName: 'Piel de Bestia Animal' }, { level: 9, spellName: 'Cambiaformas' }] },
  { id: 'darkness', name: 'Oscuridad', description: 'Dominio de las sombras, la noche y lo oculto.', powers: [{ name: 'Toque de Oscuridad', description: 'Como acción estándar, puedes tocar a una criatura infligiéndole ceguera durante 1 ronda por cada dos niveles de clérigo.', usesFormula: 'wisdomMod', unlocksAtLevel: 1 }, { name: 'Ojos de la Oscuridad', description: 'A partir del nivel 8, tu visión en la oscuridad se extiende a 60 pies. Puedes ver incluso en oscuridad mágica.', usesFormula: 'unlimited', unlocksAtLevel: 8 }], spells: [{ level: 1, spellName: 'Oscuridad Menor' }, { level: 2, spellName: 'Oscuridad' }, { level: 3, spellName: 'Oscuridad Mayor' }, { level: 4, spellName: 'Puerta de Sombras' }, { level: 5, spellName: 'Sombra Evocada' }, { level: 6, spellName: 'Sombra Conjurada' }, { level: 7, spellName: 'Forma de Sombra' }, { level: 8, spellName: 'Sombra Demoníaca' }, { level: 9, spellName: 'Oscuridad Sobrenatural' }] },
  { id: 'death', name: 'Muerte', description: 'Dominio del fin de la vida, los no-muertos y el tránsito al más allá.', powers: [{ name: 'Toque Mortífero', description: 'Como acción estándar, tocas a una criatura viviente infligiéndole 1d6 de daño por dos niveles de clérigo (mínimo 1d6).', usesFormula: 'wisdomMod', unlocksAtLevel: 1 }, { name: 'Aura de Muerte', description: 'A partir del nivel 8, irradias un aura de muerte de 30 pies. Las criaturas vivas que entren en el aura reciben 4d6 de daño de negative energy.', usesFormula: 'wisdomMod', unlocksAtLevel: 8 }], spells: [{ level: 1, spellName: 'Causar Miedo' }, { level: 2, spellName: 'Toque de la Mortaja' }, { level: 3, spellName: 'Animar Muertos' }, { level: 4, spellName: 'Matar' }, { level: 5, spellName: 'Muerte Súbita' }, { level: 6, spellName: 'Crear No-Muertos' }, { level: 7, spellName: 'Destruir No-Muertos' }, { level: 8, spellName: 'Crear No-Muertos Mayores' }, { level: 9, spellName: 'Muerte' }] },
  { id: 'earth', name: 'Tierra', description: 'Dominio de la roca, los minerales y la solidez de la tierra.', powers: [{ name: 'Toque Ácido', description: 'Como acción estándar, tocas a una criatura infligiéndole 1d6 de daño ácido + 1 por nivel de clérigo.', usesFormula: 'wisdomMod', unlocksAtLevel: 1 }, { name: 'Piel de Piedra', description: 'A partir del nivel 6, tu piel adquiere dureza pétrea. Ganas RD 6/adamantina durante 1 minuto por nivel de clérigo.', usesFormula: 'wisdomMod', unlocksAtLevel: 6 }], spells: [{ level: 1, spellName: 'Polvo Cegador' }, { level: 2, spellName: 'Piel de Tierra' }, { level: 3, spellName: 'Remodelación de Piedra' }, { level: 4, spellName: 'Piel de Piedra' }, { level: 5, spellName: 'Teletransporte Terrestre' }, { level: 6, spellName: 'Mover la Tierra' }, { level: 7, spellName: 'Terremoto' }, { level: 8, spellName: 'Torrente de Lava' }, { level: 9, spellName: 'Elemental de Tierra (superior)' }] },
  { id: 'fire', name: 'Fuego', description: 'Dominio de las llamas, el calor y la destrucción purificadora.', powers: [{ name: 'Toque de Llamas', description: 'Como acción estándar, tocas a una criatura infligiéndole 1d6 de daño de fuego + 1 por nivel de clérigo.', usesFormula: 'wisdomMod', unlocksAtLevel: 1 }, { name: 'Aura de Fuego', description: 'A partir del nivel 8, irradias un aura de fuego. Las criaturas a 10 pies reciben 1d6 de daño de fuego por ronda.', usesFormula: 'wisdomMod', unlocksAtLevel: 8 }], spells: [{ level: 1, spellName: 'Manos Ardientes' }, { level: 2, spellName: 'Producir Llamas' }, { level: 3, spellName: 'Bola de Fuego' }, { level: 4, spellName: 'Pared de Fuego' }, { level: 5, spellName: 'Nube de Fuego' }, { level: 6, spellName: 'Semilla de Fuego' }, { level: 7, spellName: 'Tormenta de Fuego' }, { level: 8, spellName: 'Manto Íncubo de Llamas' }, { level: 9, spellName: 'Elemental de Fuego (superior)' }] },
  { id: 'good', name: 'Bien', description: 'Dominio de la bondad, la protección divina y la lucha contra el mal.', powers: [{ name: 'Toque Sagrado', description: 'Como acción estándar, tocas a una criatura aliada infundiéndole valor divino. Recibe un bonificador de sagrado de +1 a tiradas de ataque, salvación y pruebas de habilidad durante 1 rondo por nivel de clérigo.', usesFormula: 'wisdomMod', unlocksAtLevel: 1 }, { name: 'Aura de Bien', description: 'A partir del nivel 8, irradias un aura de bien de 30 pies que otorga a los aliados resistencia 10 al daño de alineamiento maligno.', usesFormula: 'unlimited', unlocksAtLevel: 8 }], spells: [{ level: 1, spellName: 'Protección contra el Mal' }, { level: 2, spellName: 'Ayuda' }, { level: 3, spellName: 'Círculo Mágico contra el Mal' }, { level: 4, spellName: 'Bien Santo' }, { level: 5, spellName: 'Disipar el Mal' }, { level: 6, spellName: 'Convocar Monstruo VI (bien)' }, { level: 7, spellName: 'Palabra Sagrada' }, { level: 8, spellName: 'Escudo de la Ley' }, { level: 9, spellName: 'Convocar Monstruo IX (bien)' }] },
  { id: 'healing', name: 'Curación', description: 'Dominio de la restauración, la salud y el poder de sanar.', powers: [{ name: 'Toque Curativo', description: 'Como acción estándar, tocas a una criatura curándole 1d6 + 1 por nivel de clérigo puntos de golpe.', usesFormula: 'wisdomMod', unlocksAtLevel: 1 }, { name: 'Curación Mayor', description: 'A partir del nivel 6, cuando lanzas hechizos de curación curas el máximo posible de puntos de golpe.', usesFormula: 'unlimited', unlocksAtLevel: 6 }], spells: [{ level: 1, spellName: 'Curar Heridas Leves' }, { level: 2, spellName: 'Curar Heridas Moderadas' }, { level: 3, spellName: 'Curar Heridas Graves' }, { level: 4, spellName: 'Curar Heridas Críticas' }, { level: 5, spellName: 'Curar Heridas Leves (Masivo)' }, { level: 6, spellName: 'Curar Heridas Moderadas (Masivo)' }, { level: 7, spellName: 'Curar Heridas Graves (Masivo)' }, { level: 8, spellName: 'Curar Heridas Críticas (Masivo)' }, { level: 9, spellName: 'Curación Total' }] },
  { id: 'knowledge', name: 'Conocimiento', description: 'Dominio de la sabiduría, el aprendizaje y la verdad divina.', powers: [{ name: 'Lore Divino', description: 'Recibes un bonificador de competencia a todas las pruebas de Conocimiento igual a la mitad de tu nivel de clérigo (mínimo +1).', usesFormula: 'unlimited', unlocksAtLevel: 1 }, { name: 'Ojo de la Verdad', description: 'A partir del nivel 8, puedes lanzar Visión Verdadera como poder divino una vez al día.', usesFormula: 'fixed', fixedUses: 1, unlocksAtLevel: 8 }], spells: [{ level: 1, spellName: 'Comprensión de Idiomas' }, { level: 2, spellName: 'Detección de Pensamientos' }, { level: 3, spellName: 'Clarividencia/Clariaudiencia' }, { level: 4, spellName: 'Discernir Mentiras' }, { level: 5, spellName: 'Verdad Compulsiva' }, { level: 6, spellName: 'Visión Verdadera' }, { level: 7, spellName: 'Visión del Oráculo' }, { level: 8, spellName: 'Mente en Blanco' }, { level: 9, spellName: 'Foresight' }] },
  { id: 'strength', name: 'Fuerza', description: 'Dominio del poder físico, la musculatura y las proezas atléticas.', powers: [{ name: 'Mano Poderosa', description: 'Como acción rápida, recibes un bonificador de +1 a tiradas de ataque y pruebas de Fuerza durante 1 ronda.', usesFormula: 'wisdomMod', unlocksAtLevel: 1 }, { name: 'Cuerpo de Gigante', description: 'A partir del nivel 8, puedes aumentar tu tamaño a Grande durante 1 ronda por nivel de clérigo.', usesFormula: 'wisdomMod', unlocksAtLevel: 8 }], spells: [{ level: 1, spellName: 'Agrandar Persona' }, { level: 2, spellName: 'Resistencia a los Elementos' }, { level: 3, spellName: 'Intensificar la Gravedad' }, { level: 4, spellName: 'Fuerza del Oso' }, { level: 5, spellName: 'Agrandar Persona (Masivo)' }, { level: 6, spellName: 'Golpe Poderoso' }, { level: 7, spellName: 'Piel de Roca' }, { level: 8, spellName: 'Terremoto' }, { level: 9, spellName: 'Ira de la Tormenta' }] },
  { id: 'sun', name: 'Sol', description: 'Dominio de la luz, el calor solar y la destrucción de la oscuridad.', powers: [{ name: 'Rayo de Sol', description: 'Como acción estándar, disparas un rayo de luz solar a 30 pies que inflige 1d6 de daño de fuego por dos niveles de clérigo.', usesFormula: 'wisdomMod', unlocksAtLevel: 1 }, { name: 'Sol de Mediodia', description: 'A partir del nivel 8, una vez por día puedes crear un efecto de luz de luz solar durante 1 minuto por nivel de clérigo.', usesFormula: 'fixed', fixedUses: 1, unlocksAtLevel: 8 }], spells: [{ level: 1, spellName: 'Luz Astral' }, { level: 2, spellName: 'Luz Cegadora' }, { level: 3, spellName: 'Explosión de Luz' }, { level: 4, spellName: 'Golpe Ardiente' }, { level: 5, spellName: 'Luz del Día (Mejorada)' }, { level: 6, spellName: 'Prisma de Colores' }, { level: 7, spellName: 'Prisma de Rayo' }, { level: 8, spellName: 'Rayo Solar' }, { level: 9, spellName: 'Prisma (Mejorado)' }] },
  { id: 'war', name: 'Guerra', description: 'Dominio del combate, las armas y el poder en la batalla.', powers: [{ name: 'Bendición de las Armas', description: 'Como acción rápida, puedes conceder a un arma tocada un bonificador de mejora de +1 a tiradas de ataque y daño durante 1 ronda por nivel de clérigo.', usesFormula: 'wisdomMod', unlocksAtLevel: 1 }, { name: 'Maestría en Armas de Guerra', description: 'A partir del nivel 8, eres competente con todas las armas marciales.', usesFormula: 'unlimited', unlocksAtLevel: 8 }], spells: [{ level: 1, spellName: 'Bendición de las Armas' }, { level: 2, spellName: 'Arma Espiritual' }, { level: 3, spellName: 'Guardia del Espíritu' }, { level: 4, spellName: 'Arma Sagrada' }, { level: 5, spellName: 'Brasas de la Llama' }, { level: 6, spellName: 'Golpe de la Llama' }, { level: 7, spellName: 'Maestría de Armas' }, { level: 8, spellName: 'Escudo del Héroe' }, { level: 9, spellName: 'Tormenta de Armas' }] },
]

const BLESSINGS = [
  { id: 'air', name: 'Aire', description: 'Bendición del viento y los cielos.', powers: [{ name: 'Golpe del Viento', description: 'Como acción veloz, el objetivo debe superar una tirada de Fortaleza o ser empujado 5 pies.', actionType: 'swift', costsFervor: true, unlocksAtLevel: 1 }, { name: 'Forma de Viento', description: 'Puedes convertirte en aire (como Forma Gaseosa) durante 1 minuto por nivel de sacerdote de guerra.', actionType: 'standard', costsFervor: false, unlocksAtLevel: 10 }] },
  { id: 'animal', name: 'Animal', description: 'Bendición de las bestias y la naturaleza salvaje.', powers: [{ name: 'Colmillos de la Bestia', description: 'Como acción veloz, recibes un ataque de mordisco (1d6 de daño) durante 1 ronda.', actionType: 'swift', costsFervor: true, unlocksAtLevel: 1 }, { name: 'Amistad Salvaje', description: 'Puedes lanzar Dominar Animal como poder sobrenatural una vez al día.', actionType: 'standard', costsFervor: false, unlocksAtLevel: 10 }] },
  { id: 'darkness', name: 'Oscuridad', description: 'Bendición de las sombras y la noche.', powers: [{ name: 'Manto de Sombras', description: 'Como acción veloz, recibes un bonificador de +2 a CA y tiradas de salvación contra efectos de luz durante 1 ronda.', actionType: 'swift', costsFervor: true, unlocksAtLevel: 1 }, { name: 'Forma de Sombra', description: 'Puedes fusionarte con las sombras durante 1 minuto por nivel de sacerdote de guerra.', actionType: 'standard', costsFervor: false, unlocksAtLevel: 10 }] },
  { id: 'earth', name: 'Tierra', description: 'Bendición de la roca, la solidez y la durabilidad.', powers: [{ name: 'Fortaleza de la Tierra', description: 'Como acción veloz, recibes RD 2/— durante 1 ronda.', actionType: 'swift', costsFervor: true, unlocksAtLevel: 1 }, { name: 'Golpe de Roca', description: 'El suelo a 20 pies tiembla violentamente durante 1 ronda. Las criaturas deben superar Reflejos o caer derribadas.', actionType: 'standard', costsFervor: false, unlocksAtLevel: 10 }] },
  { id: 'fire', name: 'Fuego', description: 'Bendición de las llamas y el poder purificador del fuego.', powers: [{ name: 'Golpe Ardiente', description: 'Como acción veloz, tu próximo ataque inflige 1d6 de daño de fuego adicional.', actionType: 'swift', costsFervor: true, unlocksAtLevel: 1 }, { name: 'Lluvia de Fuego', description: 'Conjuras una lluvia de fuego en un área de 20 pies de radio a 60 pies. Las criaturas reciben 1d6 de daño por nivel.', actionType: 'standard', costsFervor: false, unlocksAtLevel: 10 }] },
  { id: 'good', name: 'Bien', description: 'Bendición de la bondad divina y la protección contra el mal.', powers: [{ name: 'Huelga Santa', description: 'Puedes tocar un arma bendiciéndola con el poder de la pureza. Durante 1 minuto, causa 1d6 puntos adicionales de daño contra criaturas malvadas.', actionType: 'swift', costsFervor: false, unlocksAtLevel: 1 }, { name: 'Compañero de batalla', description: 'Puedes convocar un compañero de batalla (como invocar monstruo IV) durante 1 minuto. Solo convoca outsiders buenos o animales con plantilla celestial.', actionType: 'swift', costsFervor: false, unlocksAtLevel: 10 }] },
  { id: 'healing', name: 'Curación', description: 'Bendición de la restauración y el poder de sanar.', powers: [{ name: 'Curación Rápida', description: 'Como acción veloz, curas a una criatura tocada por 1d6 puntos de golpe + 1 por nivel de sacerdote de guerra.', actionType: 'swift', costsFervor: true, unlocksAtLevel: 1 }, { name: 'Curación Masiva', description: 'Curas a todos los aliados en un radio de 30 pies por 2d6 + nivel de sacerdote de guerra puntos de golpe.', actionType: 'standard', costsFervor: false, unlocksAtLevel: 10 }] },
  { id: 'knowledge', name: 'Conocimiento', description: 'Bendición de la sabiduría y el discernimiento divino.', powers: [{ name: 'Discernimiento Rápido', description: 'Como acción veloz, recibes un bonificador de sagrado de +4 a tu próxima tirada de Percepción o Conocimiento.', actionType: 'swift', costsFervor: true, unlocksAtLevel: 1 }, { name: 'Ojo Divino', description: 'Ganas el efecto de Visión Verdadera durante 1 ronda por nivel de sacerdote de guerra.', actionType: 'standard', costsFervor: false, unlocksAtLevel: 10 }] },
  { id: 'strength', name: 'Fuerza', description: 'Bendición del poder físico y la potencia en combate.', powers: [{ name: 'Aumento de fuerza', description: 'Como acción rápida, obtienes un bono de mejora igual a ½ tu nivel de sacerdote de guerra en ataques cuerpo a cuerpo y controles de maniobra basados en Fuerza durante 1 ronda.', actionType: 'swift', costsFervor: false, unlocksAtLevel: 1 }, { name: 'Fuerza de voluntad', description: 'Como acción rápida, puedes ignorar las penalizaciones de movimiento por armadura media o pesada durante 1 minuto. También añades tu modificador de Fuerza a salvaciones contra efectos de enredado, aturdimiento o parálisis.', actionType: 'swift', costsFervor: false, unlocksAtLevel: 10 }] },
  { id: 'sun', name: 'Sol', description: 'Bendición de la luz solar y el poder destructivo contra los no-muertos.', powers: [{ name: 'Golpe de Luz', description: 'Como acción veloz, tu próximo ataque inflige 1d6 de daño adicional de luz sagrada a no-muertos.', actionType: 'swift', costsFervor: true, unlocksAtLevel: 1 }, { name: 'Explosión Solar', description: 'Creas un destello de luz solar en un radio de 30 pies. Los no-muertos reciben 1d6 de daño por nivel (Voluntad para reducir a la mitad).', actionType: 'standard', costsFervor: false, unlocksAtLevel: 10 }] },
  { id: 'travel', name: 'Viaje', description: 'Bendición del movimiento, la velocidad y la exploración.', powers: [{ name: 'Paso Ágil', description: 'Como acción veloz, ignoras el terreno difícil durante 1 ronda y tu velocidad aumenta en 10 pies.', actionType: 'swift', costsFervor: true, unlocksAtLevel: 1 }, { name: 'Teletransporte', description: 'Una vez al día, puedes teletransportarte hasta 100 pies por nivel de sacerdote de guerra.', actionType: 'standard', costsFervor: false, unlocksAtLevel: 10 }] },
  { id: 'war', name: 'Guerra', description: 'Bendición del combate, las armas y la victoria en batalla.', powers: [{ name: 'Golpe de Batalla', description: 'Como acción veloz, recibes un bonificador de sagrado de +1 a tiradas de ataque con armas sagradas durante 1 ronda.', actionType: 'swift', costsFervor: true, unlocksAtLevel: 1 }, { name: 'Maestría en Batalla', description: 'Todos los aliados a 30 pies reciben el beneficio del talento Ataque de Guerrero durante 1 ronda por nivel.', actionType: 'standard', costsFervor: false, unlocksAtLevel: 10 }] },
]

// ── HTTP helper ────────────────────────────────────────────────────────────

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const options = {
      hostname: SUPABASE_URL,
      path: '/rest/v1/' + path,
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
    }
    if (data) options.headers['Content-Length'] = Buffer.byteLength(data)

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        if (res.statusCode >= 400) reject(new Error(`HTTP ${res.statusCode}: ${body}`))
        else resolve(body ? JSON.parse(body) : null)
      })
    })
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

async function upsert(table, rows) {
  console.log(`Uploading ${rows.length} rows to ${table}...`)
  // Supabase POST with Prefer: resolution=merge-duplicates → upsert
  await request('POST', table, rows)
  console.log(`✓ ${table}: ${rows.length} rows uploaded`)
}

async function main() {
  try {
    await upsert('domains', DOMAINS)
    await upsert('blessings', BLESSINGS)
    console.log('\n✅ Done! Domains and blessings uploaded to Supabase.')
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

main()
