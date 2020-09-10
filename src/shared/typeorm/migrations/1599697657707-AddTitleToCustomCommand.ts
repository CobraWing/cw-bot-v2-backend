import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddTitleToCustomCommand1599697657707
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'custom_commands',
      new TableColumn({
        name: 'title',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('custom_commands', 'title');
  }
}
