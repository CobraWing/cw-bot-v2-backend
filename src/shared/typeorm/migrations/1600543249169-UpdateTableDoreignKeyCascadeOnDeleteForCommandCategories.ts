import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class UpdateTableDoreignKeyCascadeOnDeleteForCommandCategories1600543249169
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'custom_commands',
      'FK_CustomCommands_Categories',
    );

    await queryRunner.createForeignKey(
      'custom_commands',
      new TableForeignKey({
        name: 'FK_CustomCommands_Categories',
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'command_categories',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'custom_commands',
      'FK_CustomCommands_Categories',
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
}
