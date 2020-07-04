import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import Server from '@modules/servers/entities/Server';
import CommandCategory from './CommandCategory';

@Entity('custom_commands')
class CustomCommand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  server_id: string;

  @ManyToOne(() => Server)
  @JoinColumn({ name: 'server_id' })
  server: Server;

  @Column()
  category_id: string;

  @ManyToOne(() => CommandCategory)
  @JoinColumn({ name: 'server_id' })
  category: CommandCategory;

  @Column()
  enabled: boolean;

  @Column()
  show_in_menu: boolean;

  @Column()
  name: string;

  @Column()
  description: string;

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

export default CustomCommand;
