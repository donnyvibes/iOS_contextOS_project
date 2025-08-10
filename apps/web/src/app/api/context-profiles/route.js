import sql from "@/app/api/utils/sql";

// GET /api/context-profiles - List all context profiles with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = `
      SELECT 
        cp.*,
        COALESCE(pcl_count.prompt_count, 0) as linked_prompts,
        COALESCE(kcl_count.knowledge_count, 0) as linked_knowledge
      FROM context_profiles cp
      LEFT JOIN (
        SELECT context_profile_id, COUNT(*) as prompt_count
        FROM prompt_context_links
        GROUP BY context_profile_id
      ) pcl_count ON cp.id = pcl_count.context_profile_id
      LEFT JOIN (
        SELECT context_profile_id, COUNT(*) as knowledge_count
        FROM knowledge_context_links
        GROUP BY context_profile_id
      ) kcl_count ON cp.id = kcl_count.context_profile_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(cp.name) LIKE LOWER($${paramCount}) 
        OR LOWER(cp.description) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY cp.updated_at DESC`;

    const contextProfiles = await sql(query, params);
    
    return Response.json(contextProfiles);
  } catch (error) {
    console.error('Error fetching context profiles:', error);
    return Response.json({ error: 'Failed to fetch context profiles' }, { status: 500 });
  }
}

// POST /api/context-profiles - Create a new context profile
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, json_data } = body;

    if (!name || !json_data) {
      return Response.json({ error: 'Name and JSON data are required' }, { status: 400 });
    }

    // Validate JSON data
    let parsedJsonData;
    try {
      if (typeof json_data === 'string') {
        parsedJsonData = JSON.parse(json_data);
      } else {
        parsedJsonData = json_data;
      }
    } catch (e) {
      return Response.json({ error: 'Invalid JSON data' }, { status: 400 });
    }

    const [contextProfile] = await sql`
      INSERT INTO context_profiles (name, description, json_data)
      VALUES (${name}, ${description}, ${JSON.stringify(parsedJsonData)})
      RETURNING *
    `;

    return Response.json(contextProfile, { status: 201 });
  } catch (error) {
    console.error('Error creating context profile:', error);
    return Response.json({ error: 'Failed to create context profile' }, { status: 500 });
  }
}