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
    url: process.env.DATABASE_URL,
    entities,
    migrations,
    cli: {
      migrationsDir,
    },
  },
];
