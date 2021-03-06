import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import ServerDefaultCommand from './ServerDefaultCommand';

@Entity('default_commands')
class DefaultCommand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @OneToMany(
    () => ServerDefaultCommand,
    serverDefaultCommand => serverDefaultCommand.default_command,
    {
      cascade: true,
      eager: true,
    },
  )
  server_default_command: ServerDefaultCommand[];

  @Column()
  enabled: boolean;

  @Column()
  show_in_menu: boolean;

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

  custom_default_command?: ServerDefaultCommand;
}

export default DefaultCommand;
