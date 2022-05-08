import { Authorization, RouteError, H3 } from "@skulpture/serve";
import { createHmac, timingSafeEqual } from "crypto";

const AuthorizationSecrets = {
	githubSecret: process.env.GITHUB_SECRET,
};

const Authorization: Authorization = {
	get: async () => {
		throw new Error("Unsupported");
	},
	verify: async (request, options = AuthorizationSecrets) => {
		const body = await H3.useRawBody(request);
		const signature = request.headers["X-Hub-Signature"];

		if (!body) throw new Error("Invalid request");

		if (!signature || Array.isArray(signature))
			throw new RouteError("Signature is invalid", 401);

		if (options && options.githubSecret) {
			const buffer = Buffer.from(signature, "utf-8");
			const hmac = createHmac("sha256", options.githubSecret);
			const digest = Buffer.from(
				`sha256=${hmac.update(body).digest("hex")}`,
				"utf-8",
			);

			if (buffer.length !== digest.length || !timingSafeEqual(digest, buffer))
				throw new Error("Invalid request");
		} else throw new RouteError("No options provided", 500);
	},
};
