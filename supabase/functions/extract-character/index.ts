import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EXTRACTION_PROMPT = `You are analyzing a Pathfinder (d20/SRD 3.5) character sheet image.
Extract all visible character data and return it as a single valid JSON object.
Use the exact structure below. If a field is not visible or not applicable, use the default shown.

Return ONLY the JSON object, no explanation or markdown code blocks.

{
  "name": "Character Name",
  "race": "human",
  "class": "fighter",
  "level": 1,
  "xp": 0,
  "alignment": "n",
  "abilities": {
    "strength": 10,
    "dexterity": 10,
    "constitution": 10,
    "intelligence": 10,
    "wisdom": 10,
    "charisma": 10
  },
  "hp": {
    "current": 10,
    "max": 10,
    "temp": 0
  },
  "skills": [
    { "id": "acrobatics", "ranks": 1 }
  ],
  "feats": ["Power Attack", "Cleave"],
  "weapons": [
    {
      "name": "Longsword",
      "attackBonus": 3,
      "damage": "1d8+2",
      "critical": "19-20/x2",
      "range": "melee",
      "type": "slashing",
      "notes": ""
    }
  ],
  "armor": [
    {
      "name": "Chain Shirt",
      "type": "light",
      "acBonus": 4,
      "armorCheckPenalty": -2,
      "maxDex": 4,
      "spellFailure": 20,
      "weight": 25,
      "equipped": true,
      "notes": ""
    }
  ],
  "coins": {
    "pp": 0,
    "gp": 0,
    "sp": 0,
    "cp": 0
  },
  "notes": ""
}

Notes on field values:
- alignment: use slugs "lg", "ng", "cg", "ln", "n", "cn", "le", "ne", "ce"
- race: use lowercase English slug (e.g., "human", "elf", "dwarf", "halfling", "gnome", "half-elf", "half-orc")
- class: use lowercase English slug (e.g., "fighter", "wizard", "cleric", "rogue", "paladin", "barbarian", "ranger", "druid", "bard", "sorcerer", "monk")
- skills: only include skills with ranks > 0; use lowercase English IDs (e.g., "acrobatics", "climb", "perception", "stealth", "bluff", "diplomacy", "knowledge_arcana", "spellcraft", "use_magic_device")
- armor.type: "light", "medium", "heavy", or "shield"
- If multiple pages are provided, combine all data from all images.
`

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { images } = await req.json() as {
      images: Array<{ data: string; mediaType: string }>
    }

    if (!images || images.length === 0) {
      return new Response(JSON.stringify({ error: 'No images provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY')!
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              ...images.map((img) => ({
                inline_data: { mime_type: img.mediaType, data: img.data },
              })),
              { text: EXTRACTION_PROMPT },
            ],
          }],
          generationConfig: { maxOutputTokens: 4096 },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: `Gemini API error: ${err}` }), {
        status: 502,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    // Extract JSON from response (Claude may wrap it in backticks despite instructions)
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      return new Response(JSON.stringify({ error: 'No JSON found in response', raw: text }), {
        status: 422,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const character = JSON.parse(match[0])

    return new Response(JSON.stringify({ character }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})
