import fetch from 'cross-fetch';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://q3tnhlvz6jcjfnukr47gnm4gfm.appsync-api.us-east-2.amazonaws.com/graphql',
    headers:{
      "x-api-key": "da2-tws3q5kycbd43ka6mj7imj5gzi"
    },
    fetch,
  }),
  cache: new InMemoryCache()
});