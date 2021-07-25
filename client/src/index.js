import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split
} from '@apollo/client';
import 'antd/dist/antd.css';
import dotenv from 'dotenv';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import createUploadLink from 'apollo-upload-client/public/createUploadLink';

dotenv.config();

const httpLink = new createUploadLink({ uri: 'http://localhost:4000/graphql' });
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      Authorization: localStorage.getItem('token')
    }
  }
});

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(context => ({
    headers: {
      ...context.headers,
      authorization: localStorage.getItem('token')
    }
  }));

  return forward(operation);
});

const httpAuthLink = authLink.concat(httpLink);

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);

    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpAuthLink
);

const client = new ApolloClient({ cache: new InMemoryCache(), link });

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
