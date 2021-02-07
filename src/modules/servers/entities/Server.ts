import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import ServerConfiguration from '@modules/configurations/entities/ServerConfiguration';
import ServerDefaultCommand from '@modules/default-commands/entities/ServerDefaultCommand';

@Entity('servers')
class Server {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  id_discord: string;

  @Column()
  enabled: boolean;

  @OneToMany(() => ServerConfiguration, serverConfiguration => serverConfiguration.server, {
    cascade: true,
    eager: true,
  })
  server_configurations: ServerConfiguration[];

  @OneToMany(() => ServerDefaultCommand, serverDefaultCommand => serverDefaultCommand.server, {
    cascade: true,
  })
  server_default_command: ServerDefaultCommand[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  getConfiguration(configuration_id: string): string | undefined {
    if (!this.server_configurations) {
      return undefined;
    }
    const config = this.server_configurations.find(c => c.configuration_id === configuration_id);

    return config?.value;
  }

  findConfiguration(configuration_id: string): ServerConfiguration[] | undefined {
    if (!this.server_configurations) {
      return undefined;
    }
    const configurations = this.server_configurations.filter(c => c.configuration_id === configuration_id);
    return configurations && configurations.length > 0 ? configurations : undefined;
  }
}

export default Server;
