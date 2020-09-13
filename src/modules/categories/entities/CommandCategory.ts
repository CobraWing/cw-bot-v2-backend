import Server from '@modules/servers/entities/Server';
import CustomCommand from '@modules/commands/entities/CustomCommand';
import { Exclude, Expose } from 'class-transformer';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
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

  @OneToMany(() => CustomCommand, customCommands => customCommands.category_id)
  customCommands: CustomCommand[];

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

  @Expose()
  @Column()
  updated_by: string;
}

export default CommandCategory;
