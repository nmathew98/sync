import {
	BaseRoute,
	Methods,
	Route,
	Protected,
	loadConfig,
	H3,
	sendError,
	sendSuccess,
} from "@skulpture/serve";
import { IncomingMessage, ServerResponse } from "h3";
import { resolve } from "path";
import { NodeSSH } from "node-ssh";

let config: Record<string, any>;

@Methods("post")
@Protected()
@Route("/github/webhook")
export default class GithubWebHook extends BaseRoute {
	async use(request: IncomingMessage, response: ServerResponse) {
		if (!config)
			config = await loadConfig(
				resolve(__dirname, "../../../"),
				"sync",
				Object.create(null),
			);

		const body = await H3.useBody(request);

		if (!body || typeof body !== "object" || !body.repository)
			return sendError(response, "Invalid request");

		const repo = body.repository.name;

		const requiredKeys = [
			"host",
			"username",
			"password",
			"port",
			"commands",
			"repos",
		];
		for (const server of Object.keys(config)) {
			if (
				Object.keys(config[server]).every(key => requiredKeys.includes(key))
			) {
				const ssh = new NodeSSH();

				if (config[server].repos.includes(repo)) {
					ssh.connect({
						host: config[server].host,
						username: config[server].username,
						password: config[server].password,
						port: config[server].port,
					});

					await ssh.exec(config[server].commands(repo).join(" && "), []);
				}
			}
		}

		return sendSuccess(response, "Successfully synced");
	}
}
