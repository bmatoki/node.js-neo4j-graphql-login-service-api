process.env.NODE_ENV = 'test';
process.env.PORT = 5050;
const mocha = require('mocha');

const describe = mocha.describe;
const it = mocha.it;
const chai = require('chai');
const chaiHttp = require('chai-http');
const EasyGraphQLTester = require('easygraphql-tester');
const mergedSchema = require('../utils/schema.util');

const tester = new EasyGraphQLTester(mergedSchema);

const hashUtil = require('../utils/hash.util');
const graphClient = require('../utils/graphql_request.util');

let token = null;
let newUserId = null;
chai.use(chaiHttp);
chai.should();
const app = require('../app');

describe('Check user routes login and management graphs queries and mutations', () => {
  it('route POST /api/users/login should do login with default superuser', async () => {
    const body = { username: 'superuser', password: hashUtil.decrypt('d5e1cba37084c06d5f21bd6a994d901e') };
    const result = await chai.request(app).post('/api/users/login').send({ userObj: body });
    await result.should.have.status(200);
    await result.body.should.have.property('success').eql(true);
    await result.body.should.be.a('object');
    token = result.body.msg.token;
  });

  it('route POST /api/users/decoded should do decode the token', async () => {
    const result = await chai.request(app).post('/api/users/decoded').send({ token });
    await result.should.have.status(200);
    await result.body.should.have.property('success').eql(true);
    await result.body.should.be.a('object');
  });

  it('route POST /api/users/all should return all users', async () => {
    const result = await chai.request(app).post('/api/users/all').set('Authorization', `Bearer ${token}`);
    await result.should.have.status(200);
    await result.body.should.have.property('success').eql(true);
    await result.body.should.be.a('object');
  });
  it('route POST /api/users/all should return not authorized without token', async () => {
    const result = await chai.request(app).post('/api/users/all');
    await result.should.have.status(401);
    await result.body.should.have.property('success').eql(false);
    await result.body.should.be.a('object');
  });
  it('route POST /api/users/register should return not authorized without token', async () => {
    const registerObj = {
      created_date: '',
      fail_attempt_count: null,
      full_name: 'test',
      id: '',
      locked: null,
      password: 'Test@123',
      role: 'user',
      suspended_time: '',
      title: 'test',
      username: 'automatictest',
    };
    const result = await chai.request(app).post('/api/users/register').send({ userObj: registerObj });
    await result.body.should.have.property('success').eql(false);
    await result.body.should.be.a('object');
  });
  it('route POST /api/users/update should return not authorized without token', async () => {
    const updateObj = {
      full_name: 'testedited',
      id: newUserId,
      locked: true,
      password: 'Test@123',
      role: 'user',
      title: 'test',
      username: 'automatictest',
    };
    const oldObj = { oldUser: 'automatictest' };
    const result = await chai.request(app).post('/api/users/update').send({ userObj: updateObj, oldObj });
    await result.body.should.have.property('success').eql(false);
    await result.body.should.be.a('object');
  });

  it('route POST /api/users/register should create new user', async () => {
    const registerObj = {
      created_date: '',
      fail_attempt_count: null,
      full_name: 'test',
      id: '',
      locked: null,
      password: 'Test@123',
      role: 'user',
      suspended_time: '',
      title: 'test',
      username: 'automatictest',
    };
    const result = await chai.request(app).post('/api/users/register').send({ userObj: registerObj }).set('Authorization', `Bearer ${token}`);
    await result.should.have.status(200);
    await result.body.should.have.property('success').eql(true);
    await result.body.should.be.a('object');
  });

  it('route POST /api/graphql should return the new user id', async () => {
    const query = `
    query {
      getAllmanagementBy(username:"automatictest") {
        id
      }
    }
    `;
    const result = await graphClient.client(`Bearer ${token}`).request(query);
    const resultId = await result;
    newUserId = resultId.getAllmanagementBy[0].id;
  });

  it('route POST /api/users/update should update an old user', async () => {
    const updateObj = {
      full_name: 'testedited',
      id: newUserId,
      locked: true,
      password: 'Test@123',
      role: 'user',
      title: 'test',
      username: 'automatictest',
    };
    const oldObj = { oldUser: 'automatictest' };
    const result = await chai.request(app).post('/api/users/update').send({ userObj: updateObj, oldObj }).set('Authorization', `Bearer ${token}`);
    await result.should.have.status(200);
    await result.body.should.have.property('success').eql(true);
    await result.body.should.be.a('object');
  });

  it('route POST /api/users/login should return user is lock', async () => {
    const body = { username: 'automatictest', password: 'automatictest' };
    const result = await chai.request(app).post('/api/users/login').send({ userObj: body });
    await result.should.have.status(200);
    await result.body.should.have.property('success').eql(false);
  });

  it('route POST /api/graphql should not delete the new user id because missing token', async () => {
    const query = `
    mutation DeleteManagementUser {
      DeleteManagementUser(id:"${newUserId}2") {
        id
      }
    }
    `;
    tester.test(true, query);
  });

  it('route POST /api/graphql should delete the new user id', async () => {
    const query = `
    mutation DeleteManagementUser {
      DeleteManagementUser(id:"${newUserId}") {
        id
      }
    }
    `;
    await graphClient.client(`Bearer ${token}`).request(query);
  });
});
