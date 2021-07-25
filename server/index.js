const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { PubSub } = require('graphql-subscriptions');
const express = require('express');
const expressPlayground = require('graphql-playground-middleware-express')
  .default;
const { readFileSync } = require('fs');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8');
const resolvers = require('./resolvers');

const { createServer } = require('http');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');
const path = require('path');

async function start() {
  const app = express();
  const MONGO_DB = process.env.DB_HOST;

  const client = await MongoClient.connect(MONGO_DB, { useNewUrlParser: true });
  const db = client.db();
  const pubsub = new PubSub();

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
    context: async ({ req, connection }) => {
      const githubToken = req
        ? req.headers.authorization
        : connection.context.Authorization;
      const currentUser = await db.collection('users').findOne({ githubToken });

      return { db, currentUser, pubsub };
    }
  });

  server.applyMiddleware({ app });

  app.get('/', (req, res) => res.end('Welcom to the PhotoShare API'));
  app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
  app.use(
    '/img/photos',
    express.static(path.join(__dirname, 'assets', 'photos'))
  );

  const httpServer = createServer(app);
  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      async onConnect(connectionParams, webSocker) {
        const githubToken = connectionParams.Authorization;
        const currentUser = await db
          .collection('users')
          .findOne({ githubToken });
        return { db, currentUser, pubsub };
      }
    },
    { server: httpServer, path: server.graphqlPath }
  );

  httpServer.listen({ port: 4000 }, () =>
    console.log(
      `GraphQL Server running at http://localhost:4000${server.graphqlPath}`
    )
  );
}

start();
