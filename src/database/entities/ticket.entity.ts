import { Column, Entity, PrimaryGeneratedColumn, VersionColumn } from 'typeorm';

@Entity()
export class TicketEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  draw: number;

  @Column({ nullable: true })
  username: string;a

  @Column()
  ticket: string;

  @VersionColumn()
  version: number;

  static create(data: { draw: number; ticket: string }): TicketEntity {
    const entity = new this();
    Object.assign(entity, data);
    return entity;
  }
}
