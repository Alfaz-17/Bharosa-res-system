import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { subDays, startOfDay, addMinutes } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting comprehensive seeding...');

  // 1. Clear existing data (Order matters for foreign keys)
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

  // 3. Create Users for each Role
  const passwordHash = await bcrypt.hash('admin123', 12);
  const roles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'WAITER', 'KITCHEN'];
  const users = await Promise.all(roles.map(role => 
    prisma.users.create({
      data: {
        restaurant_id: restaurant.id,
        name: `${role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ')} Member`,
        email: `${role.toLowerCase()}@restosaas.com`,
        password_hash: passwordHash,
        role: role,
      }
    })
  ));
  console.log(`✅ Created ${users.length} users with distinct roles`);

  // 4. Create Menu Categories
  const categoriesData = [
    { name: 'Starters', description: 'Quick bites and appetizers' },
    { name: 'Main Course', description: 'Hearty meals for lunch and dinner' },
    { name: 'Desserts', description: 'Sweet treats to end your meal' },
    { name: 'Beverages', description: 'Refreshing drinks and coffees' },
  ];

  const categories = await Promise.all(categoriesData.map((cat, i) => 
    prisma.menuCategories.create({
      data: {
        restaurant_id: restaurant.id,
        name: cat.name,
        description: cat.description,
        position: i + 1,
      }
    })
  ));
  console.log(`✅ Created ${categories.length} menu categories`);

  // 5. Create Menu Items
  const itemsData = [
    // Starters
    { cat: 'Starters', name: 'Spring Rolls', price: 180, desc: 'Crispy veg rolls with sweet chilly sauce' },
    { cat: 'Starters', name: 'Chicken Wings', price: 250, desc: 'Spicy buffalo style wings' },
    { cat: 'Starters', name: 'Paneer Tikka', price: 220, desc: 'Grilled cottage cheese with mint chutney' },
    { cat: 'Starters', name: 'French Fries', price: 120, desc: 'Golden salted fries' },
    { cat: 'Starters', name: 'Garlic Bread', price: 150, desc: 'Cheesy garlic bread with herbs' },
    
    // Main Course
    { cat: 'Main Course', name: 'Butter Chicken', price: 350, desc: 'Rich tomato gravy with grilled chicken' },
    { cat: 'Main Course', name: 'Paneer Makhani', price: 320, desc: 'Creamy paneer in tomato butter sauce' },
    { cat: 'Main Course', name: 'Veg Biryani', price: 280, desc: 'Fragrant basmati rice with veg and spices' },
    { cat: 'Main Course', name: 'Fish Curry', price: 420, desc: 'Goan style coconut fish curry' },
    { cat: 'Main Course', name: 'Dal Tadka', price: 240, desc: 'Yellow lentils tempered with garlic and cumin' },

    // Desserts
    { cat: 'Desserts', name: 'Gulab Jamun', price: 90, desc: 'Warm milk dumplings in sugar syrup' },
    { cat: 'Desserts', name: 'Chocolate Brownie', price: 160, desc: 'Fudgy brownie with vanilla ice cream' },
    { cat: 'Desserts', name: 'Fruit Salad', price: 130, desc: 'Seasonal fresh fruits with honey' },

    // Beverages
    { cat: 'Beverages', name: 'Iced Tea', price: 110, desc: 'Lemon flavored chilled tea' },
    { cat: 'Beverages', name: 'Cold Coffee', price: 150, desc: 'Rich creamy blended coffee' },
    { cat: 'Beverages', name: 'Fresh Lime Soda', price: 95, desc: 'Sweet and salty lime soda' },
    { cat: 'Beverages', name: 'Cappuccino', price: 140, desc: 'Hot espresso with frothed milk' },
  ];

  const menuItems = await Promise.all(itemsData.map(item => {
    const catId = categories.find(c => c.name === item.cat).id;
    return prisma.menuItems.create({
      data: {
        restaurant_id: restaurant.id,
        category_id: catId,
        name: item.name,
        price: item.price,
        description: item.desc,
      }
    });
  }));
  console.log(`✅ Created ${menuItems.length} menu items`);

  // 6. Create Historical Orders for Analytics (Last 30 Days)
  console.log('⏳ Generating 100 historical orders...');
  const orderCount = 100;
  const waiter = users.find(u => u.role === 'WAITER');
  
  for (let i = 0; i < orderCount; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = addMinutes(startOfDay(subDays(new Date(), daysAgo)), Math.random() * 1440);
    const tableNum = Math.floor(Math.random() * 20) + 1;
    
    // Pick 2-4 random items
    const itemCount = Math.floor(Math.random() * 3) + 2;
    const selectedItems = [];
    for (let j = 0; j < itemCount; j++) {
      selectedItems.push(menuItems[Math.floor(Math.random() * menuItems.length)]);
    }

    const totalAmount = selectedItems.reduce((acc, curr) => acc + Number(curr.price), 0);
    const tax = totalAmount * 0.05;
    const finalTotal = totalAmount + tax;

    const order = await prisma.orders.create({
      data: {
        restaurant_id: restaurant.id,
        order_number: `ORD-${2026}${String(i + 1).padStart(4, '0')}`,
        table_number: String(tableNum).padStart(2, '0'),
        status: 'PAID',
        total_amount: finalTotal,
        created_at: date,
        waiter_id: waiter.id,
        order_items: {
          create: selectedItems.map(item => ({
            menu_item_id: item.id,
            quantity: 1,
            price_snapshot: item.price,
          }))
        },
        invoices: {
          create: {
            subtotal: totalAmount,
            tax: tax,
            total: finalTotal,
            created_at: date,
            payments: {
              create: {
                method: i % 3 === 0 ? 'CARD' : (i % 3 === 1 ? 'UPI' : 'CASH'),
                amount: finalTotal,
                paid_at: date,
              }
            }
          }
        }
      }
    });
  }

  // 7. Create a few Active Orders for Dashboard
  console.log('⏳ Generating 5 active orders...');
  for (let i = 0; i < 5; i++) {
    const tableNum = (Math.floor(Math.random() * 10) + 21); // Tables 21-30
    const statuses = ['CONFIRMED', 'IN_KITCHEN', 'READY', 'SERVED'];
    const status = statuses[i % statuses.length];
    
    await prisma.orders.create({
      data: {
        restaurant_id: restaurant.id,
        order_number: `ACT-${String(i + 1).padStart(3, '0')}`,
        table_number: String(tableNum),
        status: status,
        total_amount: 500,
        waiter_id: waiter.id,
        order_items: {
          create: [
            { menu_item_id: menuItems[0].id, quantity: 2, price_snapshot: menuItems[0].price },
            { menu_item_id: menuItems[5].id, quantity: 1, price_snapshot: menuItems[5].price },
          ]
        }
      }
    });
  }

  console.log('\n🎉 COMPLETED: Seeding finished successfully!');
  console.log('--------------------------------------------------');
  console.log('Staff Portal Login:');
  console.log(`Email: admin@restosaas.com`);
  console.log(`Password: admin123`);
  console.log('--------------------------------------------------');
  console.log(`x-tenant-id for testing: ${restaurant.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
