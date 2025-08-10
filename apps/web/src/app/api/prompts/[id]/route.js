import sql from "@/app/api/utils/sql";

// GET /api/prompts/[id] - Get a single prompt by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const [prompt] = await sql`
      SELECT 
        p.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', cp.id,
              'name', cp.name,
              'description', cp.description
            )
          ) FILTER (WHERE cp.id IS NOT NULL), 
          '[]'::json
        ) as linked_contexts
      FROM prompts p
      LEFT JOIN prompt_context_links pcl ON p.id = pcl.prompt_id
      LEFT JOIN context_profiles cp ON pcl.context_profile_id = cp.id
      WHERE p.id = ${id}
      GROUP BY p.id
    `;

    if (!prompt) {
      return Response.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return Response.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return Response.json({ error: 'Failed to fetch prompt' }, { status: 500 });
  }
}

// PUT /api/prompts/[id] - Update a prompt
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, content, category, is_favorited, context_profile_ids } = body;

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (title !== undefined) {
      paramCount++;
      updateFields.push(`title = $${paramCount}`);
      updateValues.push(title);
    }

    if (description !== undefined) {
      paramCount++;
      updateFields.push(`description = $${paramCount}`);
      updateValues.push(description);
    }

    if (content !== undefined) {
      paramCount++;
      updateFields.push(`content = $${paramCount}`);
      updateValues.push(content);
    }

    if (category !== undefined) {
      paramCount++;
      updateFields.push(`category = $${paramCount}`);
      updateValues.push(category);
    }

    if (is_favorited !== undefined) {
      paramCount++;
      updateFields.push(`is_favorited = $${paramCount}`);
      updateValues.push(is_favorited);
    }

    if (updateFields.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Always update the updated_at timestamp
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date().toISOString());

    // Add WHERE clause parameter
    paramCount++;
    updateValues.push(id);

    const updateQuery = `
      UPDATE prompts 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const [updatedPrompt] = await sql(updateQuery, updateValues);

    if (!updatedPrompt) {
      return Response.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Update context profile links if provided
    if (context_profile_ids !== undefined) {
      // Remove existing links
      await sql`DELETE FROM prompt_context_links WHERE prompt_id = ${id}`;
      
      // Add new links
      if (context_profile_ids.length > 0) {
        const linkPromises = context_profile_ids.map(contextId => 
          sql`
            INSERT INTO prompt_context_links (prompt_id, context_profile_id)
            VALUES (${id}, ${contextId})
          `
        );
        await sql.transaction(linkPromises);
      }
    }

    return Response.json(updatedPrompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return Response.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}

// DELETE /api/prompts/[id] - Delete a prompt
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const [deletedPrompt] = await sql`
      DELETE FROM prompts 
      WHERE id = ${id}
      RETURNING *
    `;

    if (!deletedPrompt) {
      return Response.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return Response.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return Response.json({ error: 'Failed to delete prompt' }, { status: 500 });
  }
}

// PATCH /api/prompts/[id] - Update last used timestamp
export async function PATCH(request, { params }) {
  try {
    const { id } = params;

    const [updatedPrompt] = await sql`
      UPDATE prompts 
      SET last_used = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updatedPrompt) {
      return Response.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return Response.json(updatedPrompt);
  } catch (error) {
    console.error('Error updating prompt last used:', error);
    return Response.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}