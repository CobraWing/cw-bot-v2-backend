import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import Configurations from '@modules/configurations/entities/Configurations';

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

  @OneToMany(() => Configurations, configurations => configurations.server) // note: we will create author property in the Photo class below
  configurations: Configurations[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Server;
