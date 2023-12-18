import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DrawEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  ticket: string;
}
