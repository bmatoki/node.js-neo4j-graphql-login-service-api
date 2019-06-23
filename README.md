# User Management application.
# node.js-neo4j-graphql-login-service-api.

```
this is node.js app full rest api with
neo4j db
using apollo: graphql instead of pure cypher.
JWT - for tokens.
using custom directives,
resolvers,
middle wares.
include brute force
user management api
docker
```

The Roles are:
```
 superuser - can create read update delete .
 user - can create read update .
 view - can view only.
```
Easy to change it , just change the value of the directive on the schema example: @hasRole(role:["superuser"])

Brute force :

```
After 3 failures the user can’t login for 10 minutes
After 6 failures the user can’t login for 30 minutes
After 10 failures the user can’t login for 1 hour
After 12 failures the user is locked
```

## Getting Started

In order to install the application clone the repo.

Open cmd at project root (node.js-server) and type
```
npm i
node app

```

if you are using docker
```
docker-compose up
```

for run the neo4j db cd to neo4j-docker and
```
docker-compose up
```
### Prerequisites

```
* Node
* docker\ neo4j

```

### Dev Installing

**Setting up a deveplopment env**

Clone this repo.
```
git clone https://github.com/bmatoki/node.js-neo4j-graphql-login-service-api.git
```

Install the node dependencies for each service.

```
npm i 

```

for default user name with superuser permission you need to go to default-script folder
```
username: superuser
password: Test@123
```
address:
http://localhost:7474/browser
and run in the neo4j db the script.

All the mutations , queries , seeds, schemas under:

node.js-server/seeds/

config file (for smtp setting , neo4j db connection) under:
node.js-server/utils/config.js


### Running the tests

The tests are mocha and chai,easygraphql-test based and needs a working dev environment.
Currently only the node apps contains unit and e2e testing.

Before running the test, the test config env needs to be updated with the relevant dev/prod details.
The config file can be found at config.js

```
config.json file:

{
  production: {....},
  test: {
    cors: {
      origin: '*',
      methods: 'GET,POST',
    },
    logger: {
      morganLevel: 'debug',
      level: 'info',
    },
  }
  development: {....}
}

```
To run the tests.

```
npm run test

```



### coding style 

Each code addition must be in line with the eslint in the project.
Those extend the airbnb style guide.

## Deployment

To install a production ready application you can follow the [Dev Installing](#dev-installing) after installing/validating Prerequisites are met.

## Uninstalling

Uninstall steps:
 * node - simply delete the files.
 * stop the docker containers


## Built With

* Node.js



## Authors

* Boaz Matoki

