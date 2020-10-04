import { Exclude } from 'class-transformer';
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
import DefaultCommand from './DefaultCommand';

@Entity('server_default_commands')
class ServerDefaultCommand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Server)
  @JoinColumn({ name: 'server_id' })
  @Exclude()
  server: Server;

  @ManyToOne(() => DefaultCommand)
  @JoinColumn({ name: 'default_commands_id' })
  default_command: DefaultCommand;

  @Column()
  @Exclude()
  server_id: string;

  @Column()
  default_commands_id: string;

  @Column()
  enabled: boolean;

  @Column()
  show_in_menu: boolean;

  @Column()
  custom: boolean;

  @Column()
  description: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  image_content: string;

  @Column()
  image_thumbnail: string;

  @Column()
  embedded: boolean;

  @Column()
  color: string;

  @Column()
  footer_text: string;

  @Column()
  extra_1: string;

  @Column()
  extra_2: string;

  @Column()
  extra_3: string;

  @Column()
  role_limited: boolean;

  @Column()
  role_blacklist: string;

  @Column()
  role_whitelist: string;

  @Column()
  channel_limited: boolean;

  @Column()
  channel_blacklist: string;

  @Column()
  channel_whitelist: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  updated_by: string;
}

export default ServerDefaultCommand;
