import sql from "@/app/api/utils/sql";

// GET /api/knowledge-bases - List all knowledge bases with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = `
      SELECT 
        kb.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', cp.id,
              'name', cp.name
            )
          ) FILTER (WHERE cp.id IS NOT NULL), 
          '[]'::json
        ) as linked_contexts
      FROM knowledge_bases kb
      LEFT JOIN knowledge_context_links kcl ON kb.id = kcl.knowledge_base_id
      LEFT JOIN context_profiles cp ON kcl.context_profile_id = cp.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (category && category !== 'All') {
      paramCount++;
      query += ` AND kb.category = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(kb.title) LIKE LOWER($${paramCount}) 
        OR LOWER(kb.description) LIKE LOWER($${paramCount})
        OR LOWER(kb.content) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY kb.id ORDER BY kb.updated_at DESC`;

    const knowledgeBases = await sql(query, params);
    
    return Response.json(knowledgeBases);
  } catch (error) {
    console.error('Error fetching knowledge bases:', error);
    return Response.json({ error: 'Failed to fetch knowledge bases' }, { status: 500 });
  }
}

// POST /api/knowledge-bases - Create a new knowledge base
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, content, category = 'General', context_profile_ids = [] } = body;

    if (!title || !content) {
      return Response.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Start transaction
    const [knowledgeBase] = await sql.transaction([
      sql`
        INSERT INTO knowledge_bases (title, description, content, category)
        VALUES (${title}, ${description}, ${content}, ${category})
        RETURNING *
      `
    ]);

    // Link to context profiles if provided
    if (context_profile_ids.length > 0) {
      const linkPromises = context_profile_ids.map(contextId => 
        sql`
          INSERT INTO knowledge_context_links (knowledge_base_id, context_profile_id)
          VALUES (${knowledgeBase[0].id}, ${contextId})
          ON CONFLICT (knowledge_base_id, context_profile_id) DO NOTHING
        `
      );
      await sql.transaction(linkPromises);
    }

    return Response.json(knowledgeBase[0], { status: 201 });
  } catch (error) {
    console.error('Error creating knowledge base:', error);
    return Response.json({ error: 'Failed to create knowledge base' }, { status: 500 });
  }
}