import { Injectable } from '@nestjs/common';
import { shuffle, map, range, sample } from 'lodash';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TicketService {
  constructor(private readonly databaseService: DatabaseService) {}

  async generateTickets(draw: number) {
    const count = parseInt(process.env.TICKET_COUNT, 0);
    const tickets = map(range(1, count + 1), (num) => num.toString());
    const shuffleArray = shuffle(tickets);
    await this.databaseService.saveTicket(draw, shuffleArray);
  }

  async isUserAssigned(draw: number, username: string) {
    const result = await this.databaseService.findTickets(draw, username);
    return result.length > 0;
  }

  async assignTicket(draw: number, username: string) {
    const result = await this.databaseService.updateOneTicket(draw, username);
    return result;
  }

  async drawTicketForWinner(draw: number) {
    const tickets = await this.databaseService.getAllTickets(draw);
    const randomItem = sample(tickets);
    return randomItem.ticket;
  }
}
