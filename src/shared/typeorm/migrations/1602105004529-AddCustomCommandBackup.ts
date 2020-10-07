import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class AddCustomCommandBackup1602105004529
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'custom_commands_audit',
        columns: [
          {
            name: 'uuid',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'id',
            type: 'uuid',
            isNullable: true,
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
            name: 'enabled',
            type: 'boolean',
          },
          {
            name: 'show_in_menu',
            type: 'boolean',
            default: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'content',
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
            name: 'embedded',
            type: 'boolean',
            default: false,
          },
          {
            name: 'color',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'footer_text',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'role_limited',
            type: 'boolean',
            default: false,
          },
          {
            name: 'role_blacklist',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'role_whitelist',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'channel_limited',
            type: 'boolean',
            default: false,
          },
          {
            name: 'channel_blacklist',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'channel_whitelist',
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
      'custom_commands_audit',
      new TableForeignKey({
        name: 'FK_CustomCommandsAudit_CustomCommands',
        columnNames: ['id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'custom_commands',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'custom_commands_audit',
      'FK_CustomCommandsAudit_CustomCommands',
    );

    await queryRunner.dropTable('custom_commands_audit');
  }
}
