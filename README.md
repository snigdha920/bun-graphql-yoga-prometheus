# GraphQL Yoga Prometheus Plugin Breaks Subscriptions

To install dependencies:

```bash
bun install
```

To run:

```bash
bun dev
```

- If we install the prometheus plugin, subscriptions fail with the error:

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

- If we comment out the plugin, everything works as expected.

- If we use the plugins from `@envelop/prometheus`, the subscriptions work again, but <http://localhost:4000/metrics> gives a 404, normally they should just be compatible: https://the-guild.dev/graphql/yoga-server/docs/features/envelop-plugins#using-plugins. 

- Using this example for setting up graphql-ws with bun: https://github.com/dotansimha/graphql-yoga/blob/main/examples/bun-yoga-ws/src/index.ts

## Steps to reproduce

1. Run  `bun dev`
2. Go to <http://localhost:4000/graphql>
3. Run the subscription: 

```graphql
subscription MySubscription {
  dynamicLoading(loadTime: 10)
}
```

4. You will see there is no data loading: 

<img width="1624" alt="image" src="https://github.com/user-attachments/assets/110ff4d7-c060-4bd1-a012-db1a4b0e898d">

and this error in the console: 

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

5. Comment out the `usePrometheus` plugin, run the subscription again, works as expected

<img width="1624" alt="image" src="https://github.com/user-attachments/assets/4c2d64f7-d579-4ab5-a1cf-0cff2d40743a">


