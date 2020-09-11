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

import Server from '@modules/servers/entities/Server';
import CommandCategory from '@modules/categories/entities/CommandCategory';

@Exclude()
@Entity('custom_commands')
class CustomCommand {
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
  category_id: string;

  @Expose()
  @ManyToOne(() => CommandCategory, category => category.id)
  @JoinColumn({ name: 'category_id' })
  category: CommandCategory;

  @Expose()
  @Column()
  enabled: boolean;

  @Expose()
  @Column()
  show_in_menu: boolean;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column()
  description: string;

  @Expose()
  @Column()
  title: string;

  @Expose()
  @Column()
  content: string;

  @Expose()
  @Column()
  image_content: string;

  @Expose()
  @Column()
  image_thumbnail: string;

  @Expose()
  @Column()
  embedded: boolean;

  @Expose()
  @Column()
  color: string;

  @Expose()
  @Column()
  footer_text: string;

  @Expose()
  @Column()
  role_limited: boolean;

  @Expose()
  @Column()
  role_blacklist: string;

  @Expose()
  @Column()
  role_whitelist: string;

  @Expose()
  @Column()
  channel_limited: boolean;

  @Expose()
  @Column()
  channel_blacklist: string;

  @Expose()
  @Column()
  channel_whitelist: string;

  @Expose()
  @CreateDateColumn()
  created_at: Date;

  @Expose()
  @UpdateDateColumn()
  updated_at: Date;

  @Expose()
  @Column()
  updated_by: string;
}

export default CustomCommand;
