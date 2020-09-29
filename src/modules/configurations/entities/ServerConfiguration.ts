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
import Configuration from './Configuration';

@Entity('server_configurations')
class ServerConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Server)
  @JoinColumn({ name: 'server_id' })
  server: Server;

  @ManyToOne(() => Configuration, { eager: true })
  @JoinColumn({ name: 'configuration_id' })
  configuration: Configuration;

  @Column()
  server_id: string;

  @Column()
  configuration_id: string;

  @Column()
  value: string;

  @Column()
  value_alternative: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  updated_by: string;
}

export default ServerConfiguration;
