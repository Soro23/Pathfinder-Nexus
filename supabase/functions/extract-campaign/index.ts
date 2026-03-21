import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EXTRACTION_PROMPT = `You are analyzing a Pathfinder (d20/SRD 3.5) campaign module PDF.
Extract all relevant campaign data and return it as a single valid JSON object.
Use the exact structure below. If a field is not present or not applicable, use the default shown.

Return ONLY the JSON object, no explanation or markdown code blocks.

{
  "name": "Campaign or Adventure Name",
  "description": "2-4 sentence synopsis of the adventure premise, main conflict, and stakes",
  "setting": "World or setting name (e.g., Golarion, Forgotten Realms, Homebrew)",
  "npcs": [
    {
      "name": "NPC Full Name",
      "role": "ally",
      "notes": "Background, history, relationship to the adventure",
      "location": "Where this NPC can be found",
      "race": "Race (Human, Elf, Dwarf, etc.)",
      "appearance": "Physical description",
      "motivation": "What this NPC wants or fears",
      "cr": 2,
      "hp": 18,
      "ac": 14
    }
  ],
  "locations": [
    {
      "name": "Location Name",
      "type": "dungeon",
      "description": "Detailed description of the location and its significance",
      "notes": "Any special notes, secrets, or GM information"
    }
  ],
  "quests": [
    {
      "title": "Quest Title",
      "description": "What the players need to do and why",
      "type": "main",
      "xpReward": 1200,
      "goldReward": 500,
      "notes": "Additional context or conditions"
    }
  ],
  "encounters": [
    {
      "name": "Encounter Name or Location",
      "difficulty": "moderate",
      "enemies": [
        {
          "name": "Monster or Enemy Name",
          "hpMax": 24,
          "ac": 14
        }
      ],
      "xpReward": 800,
      "treasure": "Description of treasure or loot found here",
      "notes": "Tactical notes, special conditions, or setup"
    }
  ],
  "loot": [
    {
      "name": "Item Name",
      "type": "weapon",
      "value": 300,
      "notes": "Item description, magical properties, or context"
    }
  ]
}

Field rules:
- npcs[].role: "ally" (helpful to party), "enemy" (hostile), "neutral" (indifferent), "unknown" (unclear allegiance)
- npcs[].cr, npcs[].hp, npcs[].ac: omit if not stated in the PDF
- locations[].type: "city", "town", "dungeon", "wilderness", "building", "ruin", or "other"
- quests[].type: "main" (primary objective), "side" (optional), "personal" (character-specific)
- quests[].xpReward, quests[].goldReward: omit if not stated
- encounters[].difficulty: "trivial" (very easy), "low" (easy), "moderate" (balanced), "severe" (hard), "extreme" (very hard)
- encounters[].enemies[].hpMax: use average HP from stat block if available, otherwise estimate
- loot[].type: "weapon", "armor", "magic", "coin", or "misc"
- loot[].value: gold piece value, omit if unknown
- Extract ALL named NPCs, ALL distinct locations, ALL quests/objectives, ALL combat encounters, and ALL notable treasure items
- Include stat block creatures as enemies in encounters and as NPCs if they have names and roles
`

function cleanJson(raw: string): string {
  return raw
    .replace(/```(?:json)?\s*/gi, '').replace(/```/g, '')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim()
}

// ── Gemini File API helpers ────────────────────────────────────────────────────

async function uploadToGeminiFileApi(
  pdfBytes: Uint8Array,
  apiKey: string,
): Promise<string> {
  const displayName = `campaign_${Date.now()}.pdf`
  const mimeType = 'application/pdf'
  const numBytes = pdfBytes.length

  // Step 1: initiate resumable upload
  const initRes = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': String(numBytes),
        'X-Goog-Upload-Header-Content-Type': mimeType,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ file: { display_name: displayName } }),
    },
  )

  if (!initRes.ok) {
    const txt = await initRes.text()
    throw new Error(`Gemini File API init failed (${initRes.status}): ${txt}`)
  }

  const uploadUrl = initRes.headers.get('X-Goog-Upload-URL')
  if (!uploadUrl) throw new Error('Gemini File API did not return upload URL')

  // Step 2: upload bytes
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Command': 'upload, finalize',
      'X-Goog-Upload-Offset': '0',
      'content-length': String(numBytes),
    },
    body: pdfBytes,
  })

  if (!uploadRes.ok) {
    const txt = await uploadRes.text()
    throw new Error(`Gemini File API upload failed (${uploadRes.status}): ${txt}`)
  }

  const fileData = await uploadRes.json()
  const uri = fileData?.file?.uri as string | undefined
  if (!uri) throw new Error(`Gemini File API response missing URI: ${JSON.stringify(fileData)}`)

  return uri
}

async function deleteGeminiFile(uri: string, apiKey: string): Promise<void> {
  // URI format: https://generativelanguage.googleapis.com/v1beta/files/{name}
  const name = uri.split('/').slice(-1)[0]
  if (!name) return
  await fetch(
    `https://generativelanguage.googleapis.com/v1beta/files/${name}?key=${apiKey}`,
    { method: 'DELETE' },
  ).catch(() => {})
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  let geminiFileUri: string | null = null
  const apiKey = Deno.env.get('GEMINI_API_KEY')

  try {
    const { storagePath } = await req.json() as { storagePath: string }

    if (!storagePath) {
      return new Response(JSON.stringify({ error: 'No storagePath provided' }), {
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY secret not configured' }), {
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    // Download PDF from Supabase Storage using service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Supabase env vars not configured' }), {
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { data: fileData, error: dlError } = await adminClient.storage
      .from('campaign-pdfs')
      .download(storagePath)
    if (dlError) throw new Error(`Storage download failed: ${dlError.message}`)
    if (!fileData) throw new Error('Storage download returned no data')

    const pdfBytes = new Uint8Array(await fileData.arrayBuffer())

    // Upload to Gemini File API
    geminiFileUri = await uploadToGeminiFileApi(pdfBytes, apiKey)

    // Generate content using the file URI
    const genRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { file_data: { mime_type: 'application/pdf', file_uri: geminiFileUri } },
              { text: EXTRACTION_PROMPT },
            ],
          }],
          generationConfig: {
            maxOutputTokens: 65536,
            responseMimeType: 'application/json',
          },
        }),
      },
    )

    if (!genRes.ok) {
      const err = await genRes.text()
      throw new Error(`Gemini generateContent error (${genRes.status}): ${err}`)
    }

    const data = await genRes.json()
    const parts: Array<{ text?: string; thought?: boolean }> = data.candidates?.[0]?.content?.parts ?? []
    const text = parts.find((p) => !p.thought && p.text)?.text ?? ''

    if (!text) {
      throw new Error(`Empty response from Gemini. Raw: ${JSON.stringify(data).slice(0, 500)}`)
    }

    let campaign: unknown
    try {
      campaign = JSON.parse(cleanJson(text))
    } catch (parseErr) {
      throw new Error(`JSON parse failed: ${String(parseErr)}. Raw: ${text.slice(0, 500)}`)
    }

    // Clean up Gemini file (best-effort)
    deleteGeminiFile(geminiFileUri, apiKey)

    return new Response(JSON.stringify({ campaign }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (err) {
    // Best-effort cleanup of Gemini file
    if (geminiFileUri && apiKey) deleteGeminiFile(geminiFileUri, apiKey)

    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})
