import { MongoClient, type Db } from 'mongodb';
import { MONGODB_URI, MONGODB_DB } from '$app/env/private';

let dbPromise: Promise<Db> | undefined;

/** Lazily connects once per server instance (reused across serverless invocations). */
export function getDb(): Promise<Db> {
	if (!MONGODB_URI) throw new Error('MONGODB_URI is not set. Add it to .env (see .env.example).');
	dbPromise ??= (async () => {
		const client = await new MongoClient(MONGODB_URI).connect();
		const db = client.db(MONGODB_DB);
		await ensureIndexes(db);
		return db;
	})().catch((err) => {
		dbPromise = undefined;
		throw err;
	});
	return dbPromise;
}

async function ensureIndexes(db: Db) {
	await Promise.all([
		// At most one active match at a time; guards against both players creating one simultaneously.
		db
			.collection('matches')
			.createIndex(
				{ status: 1 },
				{ unique: true, partialFilterExpression: { status: 'active' }, name: 'one_active_match' }
			),
		db.collection('matches').createIndex({ createdAt: -1 })
	]);
}
