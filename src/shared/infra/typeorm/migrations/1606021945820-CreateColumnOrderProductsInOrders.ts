import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class CreateColumnOrderProductsInOrders1606021945820
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        name: 'orderProducts',
        columnNames: ['order_products'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        name: 'customer',
        columnNames: ['custumer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customers',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('orders', 'orderProducts');
    await queryRunner.dropForeignKey('orders', 'customer');
  }
}
