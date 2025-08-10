import sql from "@/app/api/utils/sql";

// GET /api/prompts - List all prompts with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const favorites = searchParams.get('favorites');
    const recent = searchParams.get('recent');

    let query = `
      SELECT 
        p.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', cp.id,
              'name', cp.name
            )
          ) FILTER (WHERE cp.id IS NOT NULL), 
          '[]'::json
        ) as linked_contexts
      FROM prompts p
      LEFT JOIN prompt_context_links pcl ON p.id = pcl.prompt_id
      LEFT JOIN context_profiles cp ON pcl.context_profile_id = cp.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (category && category !== 'All') {
      paramCount++;
      query += ` AND p.category = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(p.title) LIKE LOWER($${paramCount}) 
        OR LOWER(p.description) LIKE LOWER($${paramCount})
        OR LOWER(p.content) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
    }

    if (favorites === 'true') {
      query += ` AND p.is_favorited = true`;
    }

    query += ` GROUP BY p.id`;

    if (recent === 'true') {
      query += ` ORDER BY p.last_used DESC LIMIT 3`;
    } else {
      query += ` ORDER BY p.updated_at DESC`;
    }

    const prompts = await sql(query, params);
    
    return Response.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return Response.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

// POST /api/prompts - Create a new prompt
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, content, category = 'General', context_profile_ids = [] } = body;

    if (!title || !content) {
      return Response.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Start transaction
    const [prompt] = await sql.transaction([
      sql`
        INSERT INTO prompts (title, description, content, category)
        VALUES (${title}, ${description}, ${content}, ${category})
        RETURNING *
      `
    ]);

    // Link to context profiles if provided
    if (context_profile_ids.length > 0) {
      const linkPromises = context_profile_ids.map(contextId => 
        sql`
          INSERT INTO prompt_context_links (prompt_id, context_profile_id)
          VALUES (${prompt[0].id}, ${contextId})
          ON CONFLICT (prompt_id, context_profile_id) DO NOTHING
        `
      );
      await sql.transaction(linkPromises);
    }

    return Response.json(prompt[0], { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return Response.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
}