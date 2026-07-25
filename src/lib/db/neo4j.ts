import neo4j, { Driver, Session } from 'neo4j-driver';

let driver: Driver | null = null;

export function getNeo4jDriver(): Driver {
    if (!driver) {
        const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
        const user = process.env.NEO4J_USER || 'neo4j';
        const password = process.env.NEO4J_PASSWORD || 'your_password_here';

        driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    }
    return driver;
}

// Alias for compatibility
export const getDriver = getNeo4jDriver;

export function getNeo4jSession(): Session {
    return getNeo4jDriver().session();
}

export async function closeNeo4jDriver(): Promise<void> {
    if (driver) {
        await driver.close();
        driver = null;
    }
}

// Test connection
export async function testNeo4jConnection(): Promise<boolean> {
    const session = getNeo4jSession();
    try {
        const result = await session.run('RETURN 1 as test');
        return result.records.length > 0;
    } catch (error) {
        console.error('Neo4j connection failed:', error);
        return false;
    } finally {
        await session.close();
    }
}