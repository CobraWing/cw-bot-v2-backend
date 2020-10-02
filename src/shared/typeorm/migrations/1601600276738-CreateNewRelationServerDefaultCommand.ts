import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateNewRelationServerDefaultCommand1601600276738
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'default_commands',
      'FK_DefaultCommands_Servers',
    );

    await queryRunner.dropTable('default_commands');

    await queryRunner.createTable(
      new Table({
        name: 'default_commands',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'show_in_menu',
            type: 'boolean',
            default: true,
          },
          {
            name: 'description',
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
            type: 'varchar',
            isNullable: true,
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
            name: 'extra_1',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'extra_2',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'extra_3',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'server_default_commands',
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
            name: 'default_commands_id',
            type: 'varchar',
          },
          {
            name: 'enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'show_in_menu',
            type: 'boolean',
            default: true,
          },
          {
            name: 'custom',
            type: 'boolean',
            default: true,
          },
          {
            name: 'description',
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
            type: 'varchar',
            isNullable: true,
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
            name: 'extra_1',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'extra_2',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'extra_3',
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
      'server_default_commands',
      new TableForeignKey({
        name: 'FK_ServersToServerDefaultCommands',
        columnNames: ['server_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'servers',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'server_default_commands',
      new TableForeignKey({
        name: 'FK_DefaultCommandsToServerDefaultCommands',
        columnNames: ['default_commands_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'default_commands',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'server_default_commands',
      'FK_DefaultCommandsToServerDefaultCommands',
    );

    await queryRunner.dropForeignKey(
      'server_default_commands',
      'FK_ServersToServerDefaultCommands',
    );

    await queryRunner.dropTable('server_default_commands');

    await queryRunner.dropTable('default_commands');

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
}
