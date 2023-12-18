// ticket.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from './ticket.service';
import { DatabaseService } from '../database/database.service';

describe('TicketService', () => {
  let ticketService: TicketService;
  let mockDatabaseService: Partial<DatabaseService> & {
    findTickets: jest.Mock;
    getAllTickets: jest.Mock;
  }; // Mock type

  beforeEach(async () => {
    mockDatabaseService = {
      // Provide mock implementations for DatabaseService methods used by TicketService
      saveTicket: jest.fn(),
      updateOneTicket: jest.fn(),
      findTickets: jest.fn(),
      getAllTickets: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    ticketService = module.get<TicketService>(TicketService);
  });

  describe('isUserAssigned', () => {
    it('should return true if user is assigned', async () => {
      // Arrange
      const draw = 1;
      const username = 'testUser';

      // Mock the behavior of the databaseService
      mockDatabaseService.findTickets.mockResolvedValueOnce([
        { draw, username, ticket: 'A' },
        // Add more ticket entities if needed
      ]);

      // Act
      const result = await ticketService.isUserAssigned(draw, username);

      // Assert
      expect(result).toBe(true);
      // Ensure that findTickets was called with the expected arguments
      expect(mockDatabaseService.findTickets).toHaveBeenCalledWith(
        draw,
        username,
      );
    });

    it('should return false if user is not assigned', async () => {
      // Arrange
      const draw = 1;
      const username = 'testUser';

      // Mock the behavior of the databaseService
      mockDatabaseService.findTickets.mockResolvedValueOnce([]);

      // Act
      const result = await ticketService.isUserAssigned(draw, username);

      // Assert
      expect(result).toBe(false);
      // Ensure that findTickets was called with the expected arguments
      expect(mockDatabaseService.findTickets).toHaveBeenCalledWith(
        draw,
        username,
      );
    });
  });

  describe('drawTicketForWinner', () => {
    it('should draw a random ticket for the winner', async () => {
      // Arrange
      const draw = 1;
      const mockTickets = [
        { draw, ticket: 'A' },
        { draw, ticket: 'B' },
        { draw, ticket: 'C' },
      ];

      // Mock the behavior of the databaseService
      mockDatabaseService.getAllTickets.mockResolvedValueOnce(mockTickets);
      jest.spyOn(global.Math, 'random').mockReturnValueOnce(1.0); // Mock Math.random to always return 1.0

      // Act
      const result = await ticketService.drawTicketForWinner(draw);

      // Assert
      expect(result).toBe('A'); // Since Math.random is mocked to always return 1.0, the middle ticket should be selected

      // Ensure that getAllTickets was called with the expected arguments
      expect(mockDatabaseService.getAllTickets).toHaveBeenCalledWith(draw);

      // Restore the original Math.random
      jest.restoreAllMocks();
    });
  });
});
