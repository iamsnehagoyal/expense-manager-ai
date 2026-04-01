import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.create({ data: { name: 'Demo Corp' } });
  const password = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: { name: 'Sneha Goyal', email: 'sneha@demo.com', password, orgId: org.id }
  });

  const categories = ['Food', 'Travel', 'Software', 'Office', 'Marketing', 'Utilities'];
  const vendors = ['Zomato', 'MakeMyTrip', 'AWS', 'Staples', 'Google Ads', 'BESCOM'];

  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 30);
    const cat = categories[i % categories.length];

    await prisma.invoice.create({
      data: {
        orgId: org.id,
        vendorName: vendors[i % vendors.length],
        invoiceDate: date,
        dueDate,
        totalAmount: Math.floor(Math.random() * 10000) + 500,
        currency: 'INR',
        category: cat,
        status: Math.random() > 0.5 ? 'paid' : 'unpaid',
        confidence: 0.9,
        lineItems: {
          create: [{ description: `${cat} service`, quantity: 1, unitPrice: 1000, totalPrice: 1000 }]
        }
      }
    });
  }

  for (const cat of categories) {
    await prisma.budget.create({
      data: {
        orgId: org.id, category: cat, monthlyLimit: 10000,
        month: new Date().getMonth() + 1, year: new Date().getFullYear()
      }
    });
  }

  console.log('✅ Seed complete! Login: sneha@demo.com / password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
