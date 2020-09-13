import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddUpdateByInCommandCategory1600040265592
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'command_categories',
      new TableColumn({
        name: 'updated_by',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('command_categories', 'updated_by');
  }
}
