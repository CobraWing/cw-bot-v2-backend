import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateDefaultCommand1592010375282
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'default_commands',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'server_id',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'varchar',
          },
          {
            name: 'content',
            type: 'varchar',
          },
          {
            name: 'embeded',
            type: 'boolean',
          },
          {
            name: 'color',
            type: 'varchar',
          },
          {
            name: 'enabled',
            type: 'boolean',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },

          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_by',
            type: 'varchar',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'default_commands',
      new TableForeignKey({
        name: 'FK_DefaultCommands_Servers',
        columnNames: ['server_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'servers',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'default_commands',
      'FK_DefaultCommands_Servers',
    );

    await queryRunner.dropTable('default_commands');
  }
}
