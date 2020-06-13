import Server from '@modules/servers/entities/Server';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('command_categories')
class DefaultCommand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  server_id: string;

  @ManyToOne(() => Server)
  @JoinColumn({ name: 'server_id' })
  server: Server;

  @Column()
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default DefaultCommand;
