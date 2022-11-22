let entities, migrations, migrationsDir;

if (process.env.NODE_ENV === 'production') {
  entities = [__dirname + '/dist/modules/**/entities/*.js'];
  migrations = [__dirname + '/dist/shared/typeorm/migrations/*.js'];
  migrationsDir = __dirname + '/dist/shared/typeorm/migrations';
} else {
  entities = [__dirname + '/src/modules/**/entities/*.ts'];
  migrations = [__dirname + '/src/shared/typeorm/migrations/*.ts'];
  migrationsDir = __dirname + '/src/shared/typeorm/migrations';
}

module.exports = [
  {
    name: 'default',
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DATABASE || 'postgres',
    entities,
    migrations,
    cli: {
      migrationsDir,
    },
    logging: false,
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },
];
