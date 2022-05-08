export default {
	sentry: {
		dsn: "",
		tracesSampleRate: 1.0,
	},
	routes: {
		storage: {
			enabled: false,
		},
	},
	cors: {
		origin: (
			origin: string,
			callback: (error: Error | null, origin: string | boolean) => void,
		) => {
			const allowedOrigins: string[] = ["https://github.com"];
			if (allowedOrigins.includes(origin)) return callback(null, origin);

			return callback(null, false);
		},
	},
	alias: {
		"@composables": "dist/composables",
		"@entities": "dist/entities",
		"@adapters": "dist/external/adapters",
	},
};
