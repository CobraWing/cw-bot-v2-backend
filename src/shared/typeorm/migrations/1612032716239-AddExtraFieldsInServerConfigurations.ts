import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddExtraFieldsInServerConfigurations1612032716239 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'server_configurations',
      new TableColumn({
        name: 'extra1',
        type: 'varchar',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'server_configurations',
      new TableColumn({
        name: 'extra2',
        type: 'varchar',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'server_configurations',
      new TableColumn({
        name: 'extra3',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('server_configurations', 'extra3');
    await queryRunner.dropColumn('server_configurations', 'extra2');
    await queryRunner.dropColumn('server_configurations', 'extra1');
  }
}
