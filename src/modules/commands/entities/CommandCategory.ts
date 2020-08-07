import Server from '@modules/servers/entities/Server';
import { Exclude, Expose } from 'class-transformer';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Exclude()
@Entity('command_categories')
class CommandCategory {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  server_id: string;

  @ManyToOne(() => Server)
  @JoinColumn({ name: 'server_id' })
  server: Server;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column()
  description: string;

  @Expose()
  @Column()
  enabled: boolean;

  @Expose()
  @Column()
  show_in_menu: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Expose()
  @UpdateDateColumn()
  updated_at: Date;
}

export default CommandCategory;
