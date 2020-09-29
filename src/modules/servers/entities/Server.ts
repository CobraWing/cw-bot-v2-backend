import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import ServerConfiguration from '@modules/configurations/entities/ServerConfiguration';

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

  @OneToMany(
    () => ServerConfiguration,
    serverConfiguration => serverConfiguration.server,
    {
      cascade: true,
      eager: true,
    },
  )
  server_configurations: ServerConfiguration[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Server;
