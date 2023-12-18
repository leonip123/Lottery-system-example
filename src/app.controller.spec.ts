import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { TicketService } from './ticket/ticket.service';
import { DrawService } from './draw/draw.service';
import { DatabaseService } from './database/database.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PurchaseTicketRequest } from './body/purchase-ticket.request';

describe('AppController', () => {
  let appController: AppController;
  let ticketService: TicketService;
  let drawService: DrawService;
  let mockDatabaseService: Partial<DatabaseService>;

  beforeEach(async () => {
    mockDatabaseService = {
      // Provide mock implementations for DatabaseService methods used by AppController
      getDraw: jest.fn(),
      findTickets: jest.fn(),
      saveEmptyDraw: jest.fn(),
      getAllTickets: jest.fn(),
      updateDraw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        TicketService,
        DrawService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    ticketService = module.get<TicketService>(TicketService);
    drawService = module.get<DrawService>(DrawService);
  });

  describe('assignTickets', () => {
    it('should throw a HttpException when the user is already assigned', async () => {
      const requestBody: PurchaseTicketRequest = { username: 'test' };
      const draw = 123;

      jest
        .spyOn(ticketService, 'isUserAssigned')
        .mockImplementation(async () => true);

      // Ensure that the asynchronous operation is awaited
      await expect(
        async () => await appController.assignTickets(requestBody),
      ).rejects.toThrowError(
        new HttpException('User already assigned', HttpStatus.BAD_REQUEST),
      );
    });

    it('should return "Purchase success" when the user is not already assigned', async () => {
      const requestBody: PurchaseTicketRequest = { username: 'test' };
      const draw = 123;

      jest
        .spyOn(ticketService, 'isUserAssigned')
        .mockImplementation(async () => false);

      jest
        .spyOn(ticketService, 'assignTicket')
        .mockResolvedValue(Promise.resolve());

      const result = await appController.assignTickets(requestBody);

      expect(result).toEqual('Purchase success');
    });
  });
});
