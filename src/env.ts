import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	MONGODB_URI: {
		description: 'MongoDB connection string',
		// optional at startup so the app can build without it; db.ts errors on first use
		schema: (value) => value
	},
	MONGODB_DB: {
		description: 'MongoDB database name',
		schema: (value) => value || 'wordle'
	}
});
