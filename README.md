# GraphQL Yoga Prometheus Plugin Breaks Subscriptions

To install dependencies:

```bash
bun install
```

To run:

```bash
bun dev
```

This project was created using `bun init` in bun v1.1.13. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

If we install the prometheus plugin, subscriptions fail with the error:

```bash
65 |             return undefined;
66 |         },
67 |         onParse() {
68 |             return ({ result: document, context: { params, request } }) => {
69 |                 const operationAST = getOperationAST(document, params.operationName);
70 |                 paramsByRequest.set(request, {
                                     ^
TypeError: WeakMap keys must be objects or non-registered symbols
      at /Users/snigdhasingh/Development/bun-graphql-yoga-prometheus/node_modules/@graphql-yoga/plugin-prometheus/esm/index.js:70:33
      at /Users/snigdhasingh/Development/bun-graphql-yoga-prometheus/node_modules/@envelop/core/esm/orchestrator.js:111:17
      at /Users/snigdhasingh/Development/bun-graphql-yoga-prometheus/src/index.ts:71:17
      at onSubscribe (/Users/snigdhasingh/Development/bun-graphql-yoga-prometheus/src/index.ts:60:23)
      at /Users/snigdhasingh/Development/bun-graphql-yoga-prometheus/node_modules/graphql-ws/lib/server.mjs:146:124
      at onMessage (/Users/snigdhasingh/Development/bun-graphql-yoga-prometheus/node_modules/graphql-ws/lib/server.mjs:51:61)


```

If we comment out the plugin, everything works as expected.

If we use the plugins from `@envelop/prometheus`, the subscriptions work again, but <http://localhost:4000/metrics> gives a 404.
