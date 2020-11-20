import fetch from 'cross-fetch';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://g5ij5sea4nhxdh4lfy4ykxpuqq.appsync-api.us-east-2.amazonaws.com/graphql',
    headers:{
      "x-api-key": "da2-to7dcsrdezhv3ev2zkpvapxkgm"
    },
    fetch,
  }),
  cache: new InMemoryCache()
});