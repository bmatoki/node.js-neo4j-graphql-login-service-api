const { GraphQLClient } = require('graphql-request');

function client(token) {
  const conn = new GraphQLClient('http://localhost:4000/api/graphql', {
    headers: {
      Authorization: token,
    },
  });
  return conn;
}

module.exports = { client };
