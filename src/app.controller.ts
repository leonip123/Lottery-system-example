import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { TicketService } from './ticket/ticket.service';
import { PurchaseTicketRequest } from './body/purchase-ticket.request';
import { DrawService } from './draw/draw.service';
import { DatabaseService } from './database/database.service';
import { UserTicketResponse } from './body/user-ticket.response';

@Controller()
export class AppController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly drawService: DrawService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Post('/assign/tickets')
  async assignTickets(@Body() requestBody: PurchaseTicketRequest) {
    const draw = this.drawService.draw;

    try {
      const isUserAssigned = await this.ticketService.isUserAssigned(
        draw,
        requestBody.username,
      );

      if (isUserAssigned) {
        throw new HttpException(
          'User already assigned',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.ticketService.assignTicket(draw, requestBody.username);
      return 'Purchase success';
    } catch (e) {
      throw e;
    }
  }

  @Get('/tickets-enquiry/:username/:draw')
  async userTicketEnquiry(
    @Param('username') username: string,
    @Param('draw') draw: number,
  ) {
    const drawEntity = await this.databaseService.getDraw(draw);
    if (!drawEntity) {
      throw new HttpException('Draw not started', HttpStatus.BAD_REQUEST);
    } else if (drawEntity.ticket === undefined) {
      throw new HttpException('Draw not started', HttpStatus.BAD_REQUEST);
    }

    const ticketsEntity = await this.databaseService.findTickets(
      draw,
      username,
    );
    if (ticketsEntity.length === 0) {
      throw new HttpException(
        'No ticket assigned to user',
        HttpStatus.BAD_REQUEST,
      );
    }

    return new UserTicketResponse(
      ticketsEntity[0].ticket === drawEntity.ticket,
      ticketsEntity[0].ticket,
    );
  }

  @Get()
  async getSampleData(): Promise<string> {
    throw new HttpException('Sample error', HttpStatus.BAD_REQUEST);
  }
}
