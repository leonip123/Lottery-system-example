import { Injectable, OnModuleInit } from '@nestjs/common';
import { TicketService } from '../ticket/ticket.service';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DrawService implements OnModuleInit {
  draw = 0;
  intervalPeriodInSeconds = parseInt(process.env.DRAW_SECOND_PERIOD, 10);
  private interval: NodeJS.Timeout;

  constructor(
    private readonly ticketService: TicketService,
    private readonly databaseService: DatabaseService,
  ) {}

  startDrawInterval() {
    // Clear any existing interval to avoid multiple intervals
    if (this.interval) {
      clearInterval(this.interval);
    }

    // Start a new interval
    this.interval = setInterval(async () => {
      console.log('Draw interval');
      // Put your logic here
      await this.drawWinner(this.draw);
      await this.startNewDraw();
    }, this.intervalPeriodInSeconds * 1000);
  }

  async drawWinner(draw: number) {
    const ticket = await this.ticketService.drawTicketForWinner(draw);
    await this.databaseService.updateDraw(draw, ticket);
  }

  async startNewDraw() {
    const drawEntity = await this.databaseService.saveEmptyDraw();
    this.draw = drawEntity.id;
    await this.ticketService.generateTickets(this.draw);
  }

  async onModuleInit() {
    const drawEntity = await this.databaseService.getLatestDraw();
    if (drawEntity) {
      this.draw = drawEntity.id;
    } else {
      await this.startNewDraw();
    }

    this.startDrawInterval();
  }
}
