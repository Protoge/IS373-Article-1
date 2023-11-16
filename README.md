## Article 1

## Title: Implementing seeding, migrations, factory, and Jest testing with Next.js and Prisma

  
## Introduction

  

In this article, we will explore how to implement data seeding, database migrations, data factories, and Jest testing in a Next.js application using Prisma. These practices are important for maintaining a well-structured and testable project, ensuring data consistency, and making your development workflow more efficient.

  

## Prerequisites

  

Before we begin, ensure that you have the following tools and knowledge in place:

  

- Node.js installed on your machine
    
- Next.js 13 project up and running
    
- Prisma ORM integrated and into your Next.js project


Here are all the dependencies that this project will be utilizing:

Dependencies:
``@prisma/client axios concurrently next react react-dom``

DevDepencies:
`@faker-js/faker @testing-library/jest-dom @testing-library/react @types/node @types/react @types/react-dom autoprefixer eslint eslint-config-next eslint-plugin-jest-dom eslint-plugin-testing-library jest jest-environment-jsdom jest-mock-extended postcss prisma tailwindcss ts-node typescript
`
    

  
  

## 1. Setting up Prisma

First, we need a way to initialize prisma isntance so we can all it anywhere in our app. In the main directory create a file `client.ts` and insert the code below in the file:

```
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
```
  

Start by setting up Prisma in your Next.js project. If you haven’t already, you can do this by running: 

```
npx prisma init
```

This will create a Prisma folder with a file `schema.prisma` in your directory 

In your `schema.prisma` file, copy the code below to setup your database providers and tables:
```
// This is your Prisma schema file,

// learn more about it in the docs: https://pris.ly/d/prisma-schema

  

generator client {

  provider = "prisma-client-js"

}

  

datasource db {

  provider = "postgresql"

  url      = "postgresql://postgres:postgres@localhost:5432/mydb?schema=public"

}

  

model User {

  id    String @id @default(uuid())

  email String

  name  String

  

  posts Post[]

}

  

model Post {

  id      String @id @default(uuid())

  title   String

  content String

  

  userId String

  user   User   @relation(fields: [userId], references: [id])

  

  categoryId String

  category   Category @relation(fields: [categoryId], references: [id])

  

  @@index([categoryId])

}

  

model Category {

  id   String @id @default(uuid())

  name String

  

  posts Post[]

}
```

For this project we are using postgres as our provider hosted on localhost. We are using Docker to run our localhost postgres. To set up Docker, create a `docker-compose.yml` file and copy the code below into the file:
```
version: "3.8"

services:

  # PostgreSQL database service

  postgres:

    image: postgres:latest

    environment:

      POSTGRES_DB: mydb

      POSTGRES_USER: postgres

      POSTGRES_PASSWORD: postgres

    ports:

      - "5432:5432" # Adjust the port if necessary

    volumes:

      - ./postgres-data:/var/lib/postgresql/data
```
Before we run the migrations, run the command `docker compose up` to spin up our postgres localhost.

## 2. Database Migrations

Migrations are crucial for managing database schema changes. To create and run a migration, execute the following command:
```
npx prisma migrate dev
```

This will generate an initial migration and apply it the database

## 3. Data seeding

Data seeding is essential for populating databases with initial data. In the `prisma` folder in the project create a `seed.ts` file and insert the following code:
```
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

import { faker } from "@faker-js/faker";

  

const fakerUser = (): any => ({

  name: faker.person.firstName(),

  email: faker.internet.email(),

});

  

const main = async () => {

  const fakerRounds = 10;

  

  try {

    for (let i = 0; i < fakerRounds; i++) {

      await db.user.create({ data: fakerUser() });

    }

  } catch (error) {

    console.log(error);

  }

};

  

main()

  .then(async () => {

    await db.$disconnect();

  })

  .catch(async (e) => {

    console.error(e);

    await db.$disconnect();

    process.exit(1);

  });
```

This code creates fake user data using the Prisma and faker libraries and inserts it into a database. It generates 10 fake user records and handles errors, disconnecting from the database when done.

Next, in the `package.json` insert the code below:
```
  "prisma": {

    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"

  },
```

Now that we have the following codes we should be able to run the seed with the command:
```
npx prisma db seed
```

## 4. Data Factories

Data factories help generate fake data for testing purposes. We are using a library called 'faker' to create factories for our models.

In the main directory, create a folder called 'factories' and create a file `index.ts` and copy the code below:
```
import prisma from "@/client";

import { faker } from "@faker-js/faker";

// import {createCategoryFactory} from '../node_modules/prisma-factory/generated'

  

export async function categoryFactory() {

  const categoryData = {

    name: faker.lorem.word()

  };

  

  const category = await prisma.category.create({

    data: {

      name: categoryData.name,

    },

  });

  

  return category;

}
```

Here we created a  function `categoryFactory` that creates a random category name and inserts it into the database.

## 5. Jest Testing

Jest is a popular testing framework for JavaScript applications.

First we have to add Jest scripts in the `package.json`
```
"script":{
"test":"jest",
"test:watch":"jest --watchAll"
}
```

Next, we will setup our configuration for Jest. Create the file `jest.config.js` and copy and paste the code below:
```
const nextJest = require("next/jest");

  

const createJestConfig = nextJest({

  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment

  dir: "./",

});

  

// Add any custom config to be passed to Jest

/** @type {import('jest').Config} */

const config = {

  // Add more setup options before each test is run

  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  //   uncomment this to not save data when doing tests

  //   setupFilesAfterEnv: ['<rootDir>/singleton.ts'],

  

  testEnvironment: "jest-environment-jsdom",

};

  

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async

module.exports = createJestConfig(config);
```

This code configures Jest for testing a Next.js application. It sets up Jest using the `next/jest` module and exports a configuration that includes options like test environment and setup files. This configuration is crucial for seamless testing in Next.js projects.

Next, We set up our testing by creating a folder called `__tests__` and create a file called `crud.test.tsx` and copy the code below:
```
import prisma from "@/client";

import { categoryFactory } from "@/factories";

import { faker } from "@faker-js/faker";

  

// CREATE

test("should create new user", async () => {

  // const user = {

  //     name:"new user",

  //     email:"newuser@email.com"

  // }

  

  // prismaMock.user.create.mockResolvedValue(user)

  

  // await expect(createUser(user)).resolves.toEqual({

  //     id:"1",

  //     name:"new user",

  //     email: "newuser@email.com"

  // })

  

  const fakerUser = (): any => ({

    name: faker.person.fullName(),

    email: faker.internet.email(),

  });

  

  const createdUser = await prisma.user.create({ data: fakerUser() });

  

  const findCreatedUserInDb = await prisma.user.findUnique({

    where: {

      id: createdUser.id,

    },

  });

  

  // Assertions to check if the user was created successfully

  expect(createdUser).toEqual(findCreatedUserInDb);

});

  

// GET

test("should get all users", async () => {

  const users = await prisma.user.findMany();

  

  expect(users.length).toBeGreaterThan(0);

});

  

// UPDATE

test("should update user information", async () => {

  const userData = {

    email: faker.internet.email(),

    name: faker.person.fullName(),

  };

  

  // Create a user with the generated data

  const createdUser = await prisma.user.create({ data: userData });

  

  // Check if the user was created successfully

  expect(createdUser.email).toBe(userData.email);

  expect(createdUser.name).toBe(userData.name);

});

  

// DELETE

test("should delete a specific user", async () => {

  // Create a user for testing purposes

  const userData = {

    email: faker.internet.email(),

    name: faker.person.fullName(),

  };

  

  const createdUser = await prisma.user.create({ data: userData });

  

  // Delete the user

  await prisma.user.delete({

    where: {

      id: createdUser.id,

    },

  });

  

  // Attempt to find the user in the database

  const foundUser = await prisma.user.findUnique({

    where: {

      id: createdUser.id,

    },

  });

  

  // Check that the user is not found in the database (it should be null)

  expect(foundUser).toBeNull();

});

  

// Factory test to generate categories into the table

test(" Test factory to Generate and insert five categories", async () => {

  const numberOfCategoriesToGenerate = 5;

  const createdCategories = [];

  

  for (let i = 0; i < numberOfCategoriesToGenerate; i++) {

    const createdCategory = await categoryFactory();

    createdCategories.push(createdCategory);

  }

  

  expect(createdCategories).toHaveLength(numberOfCategoriesToGenerate);

});
```

This code contains Jest tests for a Prisma-based application:

1. **CREATE Test**: Checks if a new user can be created and verified in the database.
    
2. **GET Test**: Verifies that the application can retrieve users from the database.
    
3. **UPDATE Test**: Ensures that user information can be updated successfully.
    
4. **DELETE Test**: Validates the deletion of a specific user from the database.
    
5. **Factory Test**: Tests a category factory function to insert five categories into the database.
    

These tests are crucial for ensuring the application's functionality and data integrity.


## Conclusion

In this article, we've covered the essential steps for implementing seeding, migrations, data factories, and Jest testing in a Next.js 13 application using Prisma. These practices will help you maintain a clean and organized codebase, ensure data consistency, and test your application effectively.
