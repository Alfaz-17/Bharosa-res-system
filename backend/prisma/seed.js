import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { subDays, startOfDay, addMinutes } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting sequential seeding...');

  // 1. Clear existing data
  console.log('🧹 Cleaning database...');
  await prisma.orderEvents.deleteMany();
  await prisma.payments.deleteMany();
  await prisma.invoices.deleteMany();
  await prisma.orderItems.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.userSessions.deleteMany();
  await prisma.menuItems.deleteMany();
  await prisma.menuCategories.deleteMany();
  await prisma.users.deleteMany();
  await prisma.tables.deleteMany();
  await prisma.restaurant.deleteMany();

  // 2. Create Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Resto SaaS Premium',
      address: 'Skyline Business Tower, MG Road, Bangalore',
      phone: '+91 80 4567 8910',
      email: 'hello@restosaas.com',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      tax_rate: 5.00,
    },
  });
  console.log(`✅ Created Restaurant: ${restaurant.name}`);

  // 3. Create Users
  const passwordHash = await bcrypt.hash('admin123', 12);
  const roles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'WAITER', 'KITCHEN'];
  const createdUsers = [];
  for (const role of roles) {
    const u = await prisma.users.create({
      data: {
        restaurant_id: restaurant.id,
        name: `${role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ')} Member`,
        email: `${role.toLowerCase()}@restosaas.com`,
        password_hash: passwordHash,
        role: role,
        is_active: role === 'SUPER_ADMIN' || role === 'ADMIN',
      }
    });
    createdUsers.push(u);
  }
  console.log(`✅ Created ${createdUsers.length} users`);

  // 4. Create Tables
  console.log('🍽️ Creating 20 tables...');
  for (let i = 1; i <= 20; i++) {
    await prisma.tables.create({
      data: {
        restaurant_id: restaurant.id,
        table_number: String(i).padStart(2, '0'),
      }
    });
  }

  // 5. Create Menu Categories
  const categoriesData = [
    { name: 'Starters', description: 'Quick bites and appetizers' },
    { name: 'Main Course', description: 'Hearty meals for lunch and dinner' },
    { name: 'Desserts', description: 'Sweet treats to end your meal' },
    { name: 'Beverages', description: 'Refreshing drinks and coffees' },
  ];

  const createdCategories = [];
  for (let i = 0; i < categoriesData.length; i++) {
    const cat = await prisma.menuCategories.create({
      data: {
        restaurant_id: restaurant.id,
        name: categoriesData[i].name,
        description: categoriesData[i].description,
        position: i + 1,
      }
    });
    createdCategories.push(cat);
  }
  console.log(`✅ Created ${createdCategories.length} categories`);

  // 6. Create Menu Items
  const itemsData = [
    { cat: 'Starters', name: 'Spring Rolls', price: 180, desc: 'Crispy veg rolls' },
    { cat: 'Starters', name: 'Chicken Wings', price: 250, desc: 'Spicy buffalo wings' },
    { cat: 'Main Course', name: 'Butter Chicken', price: 350, desc: 'Rich tomato gravy' },
    { cat: 'Main Course', name: 'Paneer Makhani', price: 320, desc: 'Creamy paneer' },
    { cat: 'Desserts', name: 'Gulab Jamun', price: 90, desc: 'Warm dumplings' },
    { cat: 'Beverages', name: 'Iced Tea', price: 110, desc: 'Lemon tea' },
  ];

  const createdItems = [];
  for (const item of itemsData) {
    const cat = createdCategories.find(c => c.name === item.cat);
    const it = await prisma.menuItems.create({
      data: {
        restaurant_id: restaurant.id,
        category_id: cat.id,
        name: item.name,
        price: item.price,
        description: item.desc,
      }
    });
    createdItems.push(it);
  }
  console.log(`✅ Created ${createdItems.length} menu items`);

  // 7. Create Historical Orders
  const waiter = createdUsers.find(u => u.role === 'WAITER');
  console.log('⏳ Generating 20 historical orders...');
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 5);
    const date = addMinutes(startOfDay(subDays(new Date(), daysAgo)), Math.random() * 1440);
    const tableNum = Math.floor(Math.random() * 20) + 1;
    const finalTotal = 500;
    
    await prisma.orders.create({
      data: {
        restaurant_id: restaurant.id,
        order_number: `ORD-${Date.now()}-${i}`,
        table_number: String(tableNum).padStart(2, '0'),
        status: 'PAID',
        total_amount: finalTotal,
        created_at: date,
        waiter_id: waiter.id,
        invoices: {
          create: {
            invoice_number: `INV-${Date.now()}-${i}`,
            subtotal: 475,
            tax: 25,
            total: 500,
            created_at: date,
            payments: {
              create: {
                method: 'CASH',
                amount: 500,
                paid_at: date,
              }
            }
          }
        }
      }
    });
  }

  console.log('\n🎉 SUCCESS: Seeding finished!');
  console.log('Login: admin@restosaas.com / admin123');
}

main()
  .catch(async (e) => {
    console.error('❌ SEED ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
