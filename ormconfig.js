let entities, migrations, migrationsDir;

if (process.env.NODE_ENV === 'production') {
  entities = ['./dist/modules/**/entities/*.js'];
  migrations = ['./dist/shared/typeorm/migrations/*.js'];
  migrationsDir = './dist/shared/typeorm/migrations';
} else {
  entities = ['./src/modules/**/entities/*.ts'];
  migrations = ['./src/shared/typeorm/migrations/*.ts'];
  migrationsDir = './src/shared/typeorm/migrations';
}

module.exports = [
  {
    name: 'default',
    type: 'postgres',
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: process.env.POSTGRES_PORT || 5432,
    username: process.env.POSTGRES_USER || 'docker',
    password: process.env.POSTGRES_PASSWORD || 'docker',
    database: process.env.POSTGRES_DATABASE || 'postgres',
    entities,
    migrations,
    cli: {
      migrationsDir,
    },
  },
];
