import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateConfigurations1593311208789
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'configurations',
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
            name: 'key',
            type: 'varchar',
          },
          {
            name: 'value',
            type: 'varchar',
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
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'configurations',
      new TableForeignKey({
        name: 'FK_Configurations_Servers',
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
      'configurations',
      'FK_Configurations_Servers',
    );

    await queryRunner.dropTable('configurations');
  }
}
