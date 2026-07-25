import { getNeo4jSession } from '../db/neo4j';

export interface Place {
  id: string;
  name: string;
  type: string;
  lat: number;
  long: number;
  tags: string[];
  description: string;
}

export interface GraphPath {
  places: Place[];
  relationships: Array<{
    from: string;
    to: string;
    type: string;
    properties: Record<string, any>;
  }>;
}

/**
 * Get places by IDs from Neo4j
 */
export async function getPlacesByIds(placeIds: string[]): Promise<Place[]> {
  const session = getNeo4jSession();
  
  try {
    const result = await session.run(
      `MATCH (p:Place)
       WHERE p.id IN $ids
       RETURN p`,
      { ids: placeIds }
    );
    
    return result.records.map(record => {
      const place = record.get('p').properties;
      return {
        id: place.id,
        name: place.name,
        type: place.type,
        lat: place.lat,
        long: place.long,
        tags: place.tags,
        description: place.description,
      };
    });
  } finally {
    await session.close();
  }
}

/**
 * Get connected subgraph for given place IDs
 */
export async function getConnectedSubgraph(
  placeIds: string[],
  maxDepth: number = 2
): Promise<GraphPath> {
  const session = getNeo4jSession();
  
  try {
    const result = await session.run(
      `MATCH (p:Place)
       WHERE p.id IN $ids
       MATCH path = (p)-[r:NEAR|POPULAR_WITH|HAS_EVENT*1..${maxDepth}]-(related)
       RETURN path
       LIMIT 50`,
      { ids: placeIds }
    );
    
    const places = new Map<string, Place>();
    const relationships: GraphPath['relationships'] = [];
    
    result.records.forEach(record => {
      const path = record.get('path');
      
      // Extract nodes
      path.segments.forEach((segment: any) => {
        const start = segment.start.properties;
        const end = segment.end.properties;
        
        if (start.id && !places.has(start.id)) {
          places.set(start.id, {
            id: start.id,
            name: start.name,
            type: start.type,
            lat: start.lat,
            long: start.long,
            tags: start.tags || [],
            description: start.description || '',
          });
        }
        
        if (end.id && !places.has(end.id)) {
          places.set(end.id, {
            id: end.id,
            name: end.name,
            type: end.type,
            lat: end.lat,
            long: end.long,
            tags: end.tags || [],
            description: end.description || '',
          });
        }
        
        // Extract relationship
        relationships.push({
          from: start.id,
          to: end.id,
          type: segment.relationship.type,
          properties: segment.relationship.properties,
        });
      });
    });
    
    return {
      places: Array.from(places.values()),
      relationships,
    };
  } finally {
    await session.close();
  }
}

/**
 * Find places popular with a specific persona
 */
export async function getPlacesForPersona(personaName: string): Promise<Place[]> {
  const session = getNeo4jSession();
  
  try {
    const result = await session.run(
      `MATCH (p:Place)-[r:POPULAR_WITH]->(persona:Persona {name: $personaName})
       RETURN p, r.score as score
       ORDER BY score DESC
       LIMIT 10`,
      { personaName }
    );
    
    return result.records.map(record => {
      const place = record.get('p').properties;
      return {
        id: place.id,
        name: place.name,
        type: place.type,
        lat: place.lat,
        long: place.long,
        tags: place.tags,
        description: place.description,
      };
    });
  } finally {
    await session.close();
  }
}