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