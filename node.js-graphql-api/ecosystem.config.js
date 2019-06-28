module.exports = {
  apps: [
    {
      name: 'neo4j-graphql-api',
      script: 'app.js',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        COMPANY: '{company_name_here}',
      },
    },
  ],

};
