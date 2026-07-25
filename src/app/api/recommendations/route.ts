import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { generateEmbedding } from '@/lib/rag/embeddings';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

interface RecommendationRequest {
    preferences: string[];
    location?: { lat: number; lng: number };
    limit?: number;
}

export async function POST(request: NextRequest) {
    try {
        const body: RecommendationRequest = await request.json();
        const { preferences, location, limit = 10 } = body;

        // Generate embedding from preferences
        const preferenceText = preferences.join(' ');
        const embedding = await generateEmbedding(preferenceText);

        let query = `
      SELECT 
        place_id as id,
        description,
        1 - (embedding <=> $1::vector) as similarity
      FROM place_embeddings
    `;

        const params: any[] = [`[${embedding.join(',')}]`];

        query += `
      ORDER BY similarity DESC
      LIMIT $${params.length + 1}
    `;
        params.push(limit);

        const result = await pool.query(query, params);

        // Parse description to extract place details
        const recommendations = result.rows.map(row => {
            const text = row.description || '';
            const lines = text.split('\n');
            const nameLine = lines.find((l: string) => l.startsWith('Name:')) || '';
            const typeLine = lines.find((l: string) => l.startsWith('Type:')) || '';
            const tagsLine = lines.find((l: string) => l.startsWith('Tags:')) || '';

            return {
                id: row.id,
                name: nameLine.replace('Name:', '').trim() || 'Unknown',
                type: typeLine.replace('Type:', '').trim() || 'place',
                tags: tagsLine.replace('Tags:', '').trim().split(',').map((t: string) => t.trim()).filter(Boolean),
                description: text.substring(0, 150),
                similarity: parseFloat(row.similarity),
            };
        });

        return NextResponse.json({
            success: true,
            recommendations,
            count: recommendations.length,
        });
    } catch (error: any) {
        console.error('Error generating recommendations:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
