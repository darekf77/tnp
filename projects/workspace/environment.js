
const config = {

  workspace: {
    projects: [
      {
        baseUrl: '/components',
        name: 'angular-lib',
        port: 4201
      },
      {
        baseUrl: '/api',
        name: 'isomorphic-lib',
        port: 4000,
        $db: {
          name: 'default',
          database: 'tmp/db.sqlite3',
          type: 'sqlite',
          synchronize: true,
          dropSchema: true,
          logging: false
        }
      },
      {
        baseUrl: '/',
        name: 'angular-client',
        port: 4200
      }
    ]
  }

}

module.exports = exports = config;


