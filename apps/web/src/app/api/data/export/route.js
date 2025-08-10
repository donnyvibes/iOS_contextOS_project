import sql from "@/app/api/utils/sql";

// GET /api/data/export - Export all data or specific types
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'all', 'prompts', 'knowledge', 'contexts'

    const exportData = {
      exported_at: new Date().toISOString(),
      version: '1.0.0',
      type
    };

    if (type === 'all' || type === 'prompts') {
      // Export prompts with their context links
      const prompts = await sql`
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
        GROUP BY p.id
        ORDER BY p.created_at
      `;
      exportData.prompts = prompts;
    }

    if (type === 'all' || type === 'knowledge') {
      // Export knowledge bases with their context links
      const knowledgeBases = await sql`
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
        GROUP BY kb.id
        ORDER BY kb.created_at
      `;
      exportData.knowledge_bases = knowledgeBases;
    }

    if (type === 'all' || type === 'contexts') {
      // Export context profiles
      const contextProfiles = await sql`
        SELECT * FROM context_profiles 
        ORDER BY created_at
      `;
      exportData.context_profiles = contextProfiles;
    }

    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', `attachment; filename="ai-prompt-manager-export-${type}-${new Date().toISOString().split('T')[0]}.json"`);

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return Response.json({ error: 'Failed to export data' }, { status: 500 });
  }
}