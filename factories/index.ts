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