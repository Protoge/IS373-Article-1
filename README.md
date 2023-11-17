# IS 373 Next.js Project

## Local Setup

<details>
<summary><strong>Setup</strong></summary>

1. Clone repo
2. Start Docker desktop
3. Create a new `.env` file and copy the contents:

   ```sh
   DATABASE_URL=
   ```

<details>
<summary><strong>Local Setup</strong></summary>

Install Dependencies

   ```sh
   npm install
   ```

</details>

<details>
<summary><strong>Local Docker Setup</strong></summary>

Start up the postgres docker container in the `local-container/` directory

   ```sh
   cd local-container/
   docker-compose up
   ```

</details>

<details>
<summary><strong>Prisma Setup</strong></summary>

Generate Prisma Client, Migrate Database Schema, and Seed Database

   ```sh
   npx prisma migrate dev
   npx prisma generate
   npx prisma db seed
   ```

</details>

<details>
<summary><strong>Jest Testing</strong></summary>

Run CRUD tests on the API

   ```sh
   npm run test
   ```

</details>
</details>

## Article 1: Implementing Seeding, Migrations, Factory, and Jest Testing with Next.js and Prisma

### Introduction

Welcome to this comprehensive guide on enhancing your Next.js application using Prisma. We'll explore essential development practices like data seeding, database migrations, data factories, and Jest testing. These techniques are crucial for maintaining a structured and testable project, ensuring data consistency, and improving efficiency in your development process.

### Prerequisites

Before diving in, ensure you have the following:

- Node.js installed on your machine.
- An operational Next.js 13 project.
- Prisma ORM set up within your Next.js project.

### Dependencies

Our project will utilize these dependencies:

- **Primary Dependencies**: `@prisma/client`, `axios`, `concurrently`, `next`, `react`, `react-dom`.
- **Development Dependencies**: `@faker-js/faker`, `@testing-library/jest-dom`, `@testing-library/react`, `@types/node`, `@types/react`, `@types/react-dom`, `autoprefixer`, `eslint`, `eslint-config-next`, `eslint-plugin-jest-dom`, `eslint-plugin-testing-library`, `jest`, `jest-environment-jsdom`, `jest-mock-extended`, `postcss`, `prisma`, `tailwindcss`, `ts-node`, `typescript`.

### 1. Setting up Prisma

Let's begin by integrating Prisma into your Next.js project. If Prisma is not already set up, initiate it with the following command:

```bash
npx prisma init
```

This command creates a new Prisma directory in your project, including a `schema.prisma` file, which is crucial for defining your database schema.

### Prisma Schema Configuration

In your `schema.prisma` file, set up the database providers and tables. Here's an example configuration for a PostgreSQL database:

```prisma
// Prisma schema file configuration

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = "postgresql://postgres:postgres@localhost:5432/mydb?schema=public"
}

model User {
  id    String @id @default(uuid())
  email String
  name  String
  posts Post[]
}

model Post {
  id        String @id @default(uuid())
  title     String
  content   String
  userId    String
  user      User @relation(fields: [userId], references: [id])
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id])
  @@index([categoryId])
}

model Category {
  id    String @id @default(uuid())
  name  String
  posts Post[]
}
```

This schema defines three models: `User`, `Post`, and `Category`, each with various fields and relationships.

### Docker Setup for PostgreSQL

To manage the PostgreSQL database locally, use Docker. Create a `docker-compose.yml` file in your project's root directory and include the following configuration:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:latest
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
```

This Docker Compose file sets up a PostgreSQL container with the necessary environment variables, port, and volume configurations.

## Database Migrations and Data Seeding

Database migrations are vital for managing and applying schema changes in a controlled and versioned manner. To create a new migration and apply it to your database, execute the following command:

```bash
npx prisma migrate dev
```

This command will prompt Prisma to create an initial migration based on your schema definition and apply it to the database, ensuring that your database schema matches the structure defined in `schema.prisma`.

### 3. Data Seeding

Data seeding is an essential step for populating your database with initial data, which can be particularly useful for development and testing.

#### Creating the Seed Script

In your project's `prisma` folder, create a file named `seed.ts`. This script will use Prisma along with the `faker` library to generate and insert fake data into your database. Here is an example seed script:

```typescript
import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const main = async () => {
  for (let i = 0; i < 10; i++) {
    await prisma.user.create({
      data: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
      },
    });
  }
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

This script generates 10 fake users with randomly generated names and emails, and inserts them into the database.

#### Configuring the Seed Command

To run this script, add a seeding command to your `package.json` file:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Now, execute the seeding process using:

```bash
npx prisma db seed
```

This command will run the `seed.ts` script, populating your database with the fake data.

## Data Factories and Jest Testing

Excellent! Moving on to the third part of the article, we will focus on setting up Data Factories and implementing Jest Testing in your Next.js project using Prisma.

---

## Part 3: Data Factories and Jest Testing

### 4. Data Factories

Data factories are useful for generating mock data, which is particularly helpful during testing. We'll use the `faker` library to create these factories.

#### Creating a Data Factory

In your project's main directory, create a `factories` folder. Inside this folder, create a file named `index.ts`. This file will contain our data factory functions. Here's an example of a factory function for generating categories:

```typescript
import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

export async function categoryFactory() {
  const categoryData = {
    name: faker.lorem.word(),
  };

  const category = await prisma.category.create({
    data: categoryData,
  });

  return category;
}
```

This function generates a random category name and inserts it into the database.

### 5. Jest Testing

Jest is a popular JavaScript testing framework. It's important to configure Jest correctly to work with Next.js and Prisma.

#### Setting Up Jest Configuration

1. **Update `package.json`**: Add the following Jest scripts for running tests:

    ```json
    "scripts": {
      "test": "jest",
      "test:watch": "jest --watchAll"
    }
    ```

2. **Create Jest Configuration File**: In your project root, create a `jest.config.js` file:

    ```javascript
    const nextJest = require("next/jest");

    const createJestConfig = nextJest({
      dir: "./", // Path to your Next.js app
    });

    const config = {
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
      testEnvironment: "jest-environment-jsdom",
    };

    module.exports = createJestConfig(config);
    ```

This configuration prepares Jest for testing in a Next.js environment.

#### Writing Tests

Create a `__tests__` folder in your project. Inside this folder, create test files, such as `crud.test.tsx`. Here's an example of how to structure your tests:

```typescript
import { PrismaClient } from "@prisma/client";
import { categoryFactory } from "../factories";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Example test for creating a new user
test("should create new user", async () => {
  const userData = {
    name: faker.name.fullName(),
    email: faker.internet.email(),
  };

  const createdUser = await prisma.user.create({ data: userData });
  const findUser = await prisma.user.findUnique({ where: { id: createdUser.id } });

  expect(createdUser).toEqual(findUser);
});

// Additional CRUD operation tests...
```

These tests use Prisma and the data factories to create and verify data in your database, ensuring the integrity and functionality of your application.

## Conclusion

We've covered the essential steps for implementing seeding, migrations, data factories, and Jest testing in a Next.js 13 application using Prisma. These practices will help you maintain a clean and organized codebase, ensure data consistency, and test your application effectively.
