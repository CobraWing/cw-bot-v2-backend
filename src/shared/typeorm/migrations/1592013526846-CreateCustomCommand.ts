import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateCustomCommand1592013526846
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'custom_commands',
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
            name: 'category_id',
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
            isNullable: true,
          },
          {
            name: 'embeded',
            type: 'boolean',
            default: false,
          },
          {
            name: 'color',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'enabled',
            type: 'boolean',
          },
          {
            name: 'aliases',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'image_content',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'image_thumbnail',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'footer_text',
            type: 'varchar',
            isNullable: true,
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
      'custom_commands',
      new TableForeignKey({
        name: 'FK_CustomCommands_Servers',
        columnNames: ['server_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'servers',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'custom_commands',
      new TableForeignKey({
        name: 'FK_CustomCommands_Categories',
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'command_categories',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'custom_commands',
      'FK_CustomCommands_Categories',
    );

    await queryRunner.dropForeignKey(
      'custom_commands',
      'FK_CustomCommands_Servers',
    );

    await queryRunner.dropTable('custom_commands');
  }
}
