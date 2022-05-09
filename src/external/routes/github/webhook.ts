import {
	BaseRoute,
	Methods,
	Route,
	Protected,
	loadConfig,
	H3,
	sendError,
	sendSuccess,
	Logger,
	ServeContext,
} from "@skulpture/serve";
import { resolve } from "path";
import { NodeSSH } from "node-ssh";

let config: Record<string, any>;

@Methods("post")
@Protected()
@Route("/github/webhook")
export default class GithubWebHook extends BaseRoute {
	async use(
		request: H3.IncomingMessage,
		response: H3.ServerResponse,
		context: ServeContext,
	) {
		const Logger: Logger = context.get("Logger");

		if (!config)
			config = await loadConfig(
				resolve(__dirname, "../../../../"),
				"sync",
				Object.create(null),
			);

		const body = await H3.useBody(request);

		if (
			!body ||
			typeof body !== "object" ||
			!body.rule ||
			!body.rule.name ||
			!body.repository ||
			!body.repository.name
		)
			return sendError(response, "Invalid request");

		const repo = body.repository.name;
		const branch = body.rule.name;

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
					try {
						await ssh.connect({
							host: config[server].host,
							username: config[server].username,
							password: config[server].password,
							port: config[server].port,
						});

						await ssh.exec(
							config[server].commands(repo, branch).join(" && "),
							[],
						);
					} catch (error: any) {
						Logger.error(error);
					}
				}
			}
		}

		return sendSuccess(response, "Successfully synced");
	}
}
