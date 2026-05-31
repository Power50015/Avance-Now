import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Handler for `GET /`.
 *
 * Renders the EJS index view with the current application configuration.
 * This route is only registered when `config.enableViews` is `true`
 * (see {@link buildApp}), so `reply.view` is guaranteed to exist.
 *
 * @param request - The incoming Fastify request.
 * @param reply - The Fastify reply used to render the view.
 */
export async function rootHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const config = request.server.config;
  return reply.view('index.ejs', { config });
}
