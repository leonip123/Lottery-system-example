import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TicketService } from './ticket/ticket.service';
import { DrawService } from './draw/draw.service';
import { DatabaseService } from './database/database.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from './typeorm.config';
import { DrawEntity } from './database/entities/draw.entity';
import { TicketEntity } from './database/entities/ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...config, autoLoadEntities: true }),
    TypeOrmModule.forFeature([DrawEntity, TicketEntity]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [TicketService, DrawService, DatabaseService],
})
export class AppModule {}
