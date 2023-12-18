## Prerequisites
* Node.js (>=16.0.0)
* Docker (>=21.0.0)
* Docker Compose (>=1.29.2)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# docker
$ docker-compose up -d

# development
$ npm run start
```

## Test

```bash
# unit tests
$ npm run test
```

## API Documentation

POST /assign/tickets
Assigns tickets to a contestant
```bash
curl --location 'http://localhost:3000/assign/tickets' \
--header 'Content-Type: application/json' \
--data '{
    "username": "username"
}'
```

GET /tickets-enquiry/{username}/{draw}
Enquires about the tickets assigned to a contestant
```bash
curl --location 'http://localhost:3000/tickets-enquiry/{username}/{draw}'
```

## Test case
src/ticket/ticket.service.spec.ts
src/app.controller.spec.ts

## Limitations
* The application's ability to scale horizontally is limited due to the use of duplicated draw functions.
  * If scaling is required, the draw service should be moved to a separate service and the service should be deployed as a separate microservice.
* No validation for API request body
  * Validation should be added to ensure that the request body is valid
* Slow query for tickets-enquiry
  * Adding redis cache to the tickets-enquiry endpoint will improve the performance
  * Using a sql index on the username column will also improve the performance
* Slow query for assign/tickets
  * Enable partitioning on the ticket table will improve the performance

