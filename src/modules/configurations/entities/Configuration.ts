import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import ServerConfiguration from './ServerConfiguration';

@Entity('configurations')
class Configuration {
  @PrimaryColumn()
  id: string;

  @Column()
  value_default: string;

  @Column()
  value_default_alternative: string;

  @OneToMany(() => ServerConfiguration, serverConfiguration => serverConfiguration.configuration, {
    cascade: true,
  })
  server_configurations: ServerConfiguration[];
}

export default Configuration;
