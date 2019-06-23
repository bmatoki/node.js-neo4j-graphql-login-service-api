module.exports = {
  production: {
    db: {
      NEO4J_URI: process.env.NEO4J_URI || 'bolt://localhost:7687',
      NEO4J_USER: process.env.NEO4J_USER || '',
      NEO4J_PASSWORD: process.env.NEO4J_PASSWORD || '',
    },
    logger: {
      morganLevel: 'tiny',
      level: 'info',
    },
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    },
    mail: {
      smtp: 'smtp.gmail.com',
      ssl: true,
      port: 465,
      username: '',
      password: '',
      techadmin: '',
      errorAlertThershold: 10,
      alertFrequency: '0 0 */1 * * *', // cron syntax sec min hour days etc
    },
  },
  development: {
    db: {
      NEO4J_URI: process.env.NEO4J_URI || 'bolt://localhost:7687',
      NEO4J_USER: process.env.NEO4J_USER || '',
      NEO4J_PASSWORD: process.env.NEO4J_PASSWORD || '',
    },
    logger: {
      morganLevel: 'dev',
      level: 'debug',
    },
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    },
    mail: {
      smtp: 'smtp.gmail.com',
      ssl: true,
      port: 465,
      username: '',
      password: '',
      techadmin: '',
      errorAlertThershold: 10,
      alertFrequency: '0 0 */1 * * *', // cron syntax sec min hour days etc
    },
  },
  test: {
    db: {
      NEO4J_URI: process.env.NEO4J_URI || 'bolt://localhost:7687',
      NEO4J_USER: process.env.NEO4J_USER || '',
      NEO4J_PASSWORD: process.env.NEO4J_PASSWORD || '',
    },
    logger: {
      morganLevel: 'dev',
      level: 'debug',
    },
    mail: {
      smtp: 'smtp.gmail.com',
      ssl: true,
      port: 465,
      username: '',
      password: '',
      techadmin: '',
      errorAlertThershold: 10,
      alertFrequency: '0 0 */1 * * *', // cron syntax sec min hour days etc
    },
    test: {
      decryptHash: '84b49a6cd08a40a45556ee745b785428',
    },
  },
};
