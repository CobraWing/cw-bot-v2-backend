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

@Entity('default_commands')
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

  @Column()
  description: string;

  @Column()
  content: string;

  @Column()
  embedded: boolean;

  @Column()
  color: string;

  @Column()
  enabled: boolean;

  @Column()
  aliases: string;

  @Column()
  image_content: string;

  @Column()
  image_thumbnail: string;

  @Column()
  footer_text: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  updated_by: string;
}

export default DefaultCommand;
