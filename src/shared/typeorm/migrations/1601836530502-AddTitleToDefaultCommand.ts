import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddTitleToDefaultCommand1601836530502
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'default_commands',
      new TableColumn({
        name: 'title',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'server_default_commands',
      new TableColumn({
        name: 'title',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('server_default_commands', 'title');

    await queryRunner.dropColumn('default_commands', 'title');
  }
}
