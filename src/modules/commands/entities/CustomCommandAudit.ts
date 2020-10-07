import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity('custom_commands_audit')
class CustomCommandAudit {
  @PrimaryColumn()
  uuid: string;

  @Column()
  id: string;

  @Column()
  server_id: string;

  @Column()
  category_id: string;

  @Column()
  enabled: boolean;

  @Column()
  show_in_menu: boolean;

  @Column()
  name: string;

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

export default CustomCommandAudit;
