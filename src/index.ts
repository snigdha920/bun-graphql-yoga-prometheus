import { setTimeout as setTimeout$ } from 'node:timers/promises';
import Bun, { type ServerWebSocket } from 'bun';
import { makeHandler } from 'graphql-ws/lib/use/bun';
import { createSchema, createYoga } from 'graphql-yoga';
import { usePrometheus } from '@graphql-yoga/plugin-prometheus';
import { execute, parse, specifiedRules, subscribe, validate } from 'graphql'
import { envelop, useEngine } from '@envelop/core'
import { usePrometheus as useEnvelopPrometheus } from '@envelop/prometheus'


const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      greetings: String
    }
    type Subscription {
      dynamicLoading(loadTime: Int!): String!
    }
  `,
  resolvers: {
    Query: {
      greetings: () => 'Hello Bun!',
    },
    Subscription: {
      dynamicLoading: {
        async *subscribe(_, { loadTime }) {
          let counter = 0;
          const spinnerFrames = ['\u25D4', '\u25D1', '\u25D5', '\u25D0'];
          while (counter < loadTime) {
            await setTimeout$(1000); // Wait for a second
            yield { dynamicLoading: `Loading ${spinnerFrames[counter % spinnerFrames.length]}` };
            counter++;
          }
          yield { dynamicLoading: 'Loaded \u2713' };
        },
      },
    },
  },
});

const yoga = createYoga({
  schema,
  plugins: [
    usePrometheus({
      execute: true,
      errors: true,
      requestCount: true, // requires `execute` to be true as well
      requestSummary: true, // requires `execute` to be true as well
    }),
    // useEngine({ parse, validate, specifiedRules, execute, subscribe }),
    // useEnvelopPrometheus({
    //   execute: true,
    //   errors: true,
    //   requestCount: true, // requires `execute` to be true as well
    //   requestSummary: true, // requires `execute` to be true as well
    // })
  ],
  graphiql: {
    subscriptionsProtocol: 'WS', // use WebSockets instead of SSE
  },
});

export const websocketHandler = makeHandler<
  Record<string, unknown>,
  { request: Request; socket: ServerWebSocket }
>({
  schema,
  execute: args => (args.rootValue as any).execute(args),
  subscribe: args => (args.rootValue as any).subscribe(args),
  onSubscribe: async (ctx, msg) => {
    const { schema, execute, subscribe, contextFactory, parse, validate } = yoga.getEnveloped({
      ...ctx,
      req: ctx.extra.request,
      socket: ctx.extra.socket,
      params: msg.payload,
    });

    const args = {
      schema,
      operationName: msg.payload.operationName,
      document: parse(msg.payload.query),
      variableValues: msg.payload.variables,
      contextValue: await contextFactory(),
      rootValue: {
        execute,
        subscribe,
      },
    };

    const errors = validate(args.schema, args.document);
    if (errors.length) return errors;
    return args;
  },
});

const server: Bun.Server = Bun.serve({
  fetch: (request: Request, server: Bun.Server): Promise<Response> | Response => {
    // Upgrade the request to a WebSocket
    if (server.upgrade(request)) {
      return new Response();
    }
    return yoga.fetch(request, server);
  },
  port: 4000,
  websocket: websocketHandler,
});

console.info(
  `🚀 Server is running on ${new URL(
    yoga.graphqlEndpoint,
    `http://${server.hostname}:${server.port}`,
  )}`,
);