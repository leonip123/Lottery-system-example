import { ConflictException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, EntityManager, Repository } from 'typeorm';
import { DrawEntity } from './entities/draw.entity';
import { TicketEntity } from './entities/ticket.entity';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(DrawEntity)
    private readonly drawRepository: Repository<DrawEntity>,
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
    @InjectConnection() readonly connection: Connection,
  ) {}

  // Ticket Repository functions
  async saveTicket(draw: number, tickets: string[]): Promise<TicketEntity[]> {
    const objects = tickets.map((ticket) =>
      TicketEntity.create({ draw, ticket }),
    );

    try {
      const savedObjects = await this.ticketRepository.save(objects);
      return savedObjects;
    } catch (error) {
      console.error('Error saving list of objects:', error.message);
      // Handle the error appropriately, e.g., log it, throw a custom error, etc.
      return [];
    }
  }

  async updateOneTicket(draw: number, username: string) {
    const currentVersion = 1;

    const query = `
      WITH cte AS (
         SELECT id
         FROM   ticket_entity
         WHERE  draw = $2
           AND  username IS NULL
           AND  version = $3
         LIMIT  1
      )
      UPDATE ticket_entity t
      SET    username = $1, version = version + 1
      FROM   cte
      WHERE  t.id = cte.id
      RETURNING *;
    `;

    try {
      // Use the transaction provided by the connection
      await this.connection.transaction(async (queryRunner: EntityManager) => {
        // Execute the raw SQL query
        const result = await queryRunner.query(query, [
          username,
          draw,
          currentVersion,
        ]);

        // Check if the update was successful
        const affectedRows = result[0].length;
        if (affectedRows === 0) {
          // No rows were affected, indicating a concurrency conflict
          throw new ConflictException(
            'Out of tickets. Please try again later.',
          );
        }
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // Handle other potential errors
      throw new Error('Error updating the ticket.');
    }
  }

  async findTickets(draw: number, username: string) {
    const tickets = await this.ticketRepository.find({
      where: { username: username, draw: draw },
    });

    return tickets;
  }

  async getAllTickets(draw: number) {
    const tickets = await this.ticketRepository.find({
      where: { draw: draw },
    });

    return tickets;
  }

  // Draw Repository functions
  async getLatestDraw() {
    return this.drawRepository.findOne({
      order: {
        id: 'DESC',
      },
      where: {},
    });
  }

  async getDraw(draw: number) {
    return this.drawRepository.findOne({
      where: { id: draw },
    });
  }

  async saveEmptyDraw() {
    return this.drawRepository.save({});
  }

  async updateDraw(draw: number, ticket: string) {
    return this.drawRepository.update({ id: draw }, { ticket: ticket });
  }
}
