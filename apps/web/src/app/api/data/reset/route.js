import sql from "@/app/api/utils/sql";

// DELETE /api/data/reset - Reset all data (delete everything)
export async function DELETE(request) {
  try {
    // Delete in order to respect foreign key constraints
    await sql.transaction([
      sql`DELETE FROM prompt_context_links`,
      sql`DELETE FROM knowledge_context_links`, 
      sql`DELETE FROM prompts`,
      sql`DELETE FROM knowledge_bases`,
      sql`DELETE FROM context_profiles`
    ]);

    return Response.json({ 
      message: 'All data has been successfully reset',
      reset_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    return Response.json({ error: 'Failed to reset data' }, { status: 500 });
  }
}