import { strict as assert } from 'assert';

const BASE_URL = 'http://127.0.0.1:3000/api';
let adminToken = '';
let waiterToken = '';
let tenantId = '';
let categoryId = '';
let itemId = '';
let orderId = '';
let newUserId = '';

const headers = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
  'x-tenant-id': tenantId,
});

async function runTests() {
  console.log('🧪 Starting E2E API Tests...\n');

  try {
    // 1. Health Check
    let res = await fetch('http://127.0.0.1:3000/health');
    if (!res.ok) throw new Error('Health check failed');
    console.log('✅ Health check passed');

    // 2. Login as created Super Admin
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@bharosacafe.com', password: 'admin123' })
    });
    let data = await res.json();
    if (!res.ok) throw new Error('Super Admin login failed');
    adminToken = data.data.accessToken;
    tenantId = data.data.user.restaurant_id;
    console.log(`✅ Super Admin logged in (Tenant ID: ${tenantId})`);

    // 3. Update Restaurant Settings (SUPER_ADMIN only)
    res = await fetch(`${BASE_URL}/restaurant/settings`, {
      method: 'PUT',
      headers: headers(adminToken),
      body: JSON.stringify({ tax_rate: 18.0 })
    });
    data = await res.json();
    assert.equal(res.status, 200, `Failed to update restaurant settings: ${JSON.stringify(data)}`);
    assert.equal(data.data.tax_rate, '18');
    console.log('✅ Restaurant Settings API updated correctly');

    // 4. Create a Waiter (SUPER_ADMIN/ADMIN only)
    res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: headers(adminToken),
      body: JSON.stringify({
        name: 'Test Waiter',
        email: 'waiter.test@bharosacafe.com',
        password: 'waiterpass',
        role: 'WAITER'
      })
    });
    data = await res.json();
    if (res.status === 200) {
      newUserId = data.data.id;
      console.log('✅ Created Waiter user');
    } else {
      // Might already exist if script runs twice
      console.log('⚠️ Waiter creation skipped/failed:', data.message);
    }

    // 5. Create Menu Category & Item (ADMIN/MANAGER only)
    res = await fetch(`${BASE_URL}/menu/categories`, {
      method: 'POST',
      headers: headers(adminToken),
      body: JSON.stringify({ name: 'Snacks', description: 'Quick bites', position: 2 })
    });
    data = await res.json();
    if (res.status !== 200 && res.status !== 201) throw new Error(`Failed to create category: ${JSON.stringify(data)}`);
    categoryId = data.data.id;
    console.log('✅ Created Menu Category');

    res = await fetch(`${BASE_URL}/menu/items`, {
      method: 'POST',
      headers: headers(adminToken),
      body: JSON.stringify({
        category_id: categoryId,
        name: 'Samosa',
        description: 'Crispy potato pastry',
        price: 20.00
      })
    });
    data = await res.json();
    if (res.status !== 200 && res.status !== 201) throw new Error(`Failed to create category: ${JSON.stringify(data)}`);
    itemId = data.data.id;
    console.log('✅ Created Menu Item');

    // 6. Login as Waiter
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'waiter.test@bharosacafe.com', password: 'waiterpass' })
    });
    data = await res.json();
    if (res.status === 200) {
      waiterToken = data.data.accessToken;
      console.log('✅ Waiter logged in');
    } else {
      // Fallback to admin if waiter login failed above
      waiterToken = adminToken;
    }

    // 7. Create an Order (WAITER/MANAGER/ADMIN)
    res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: headers(waiterToken),
      body: JSON.stringify({
        table_number: 'Table 1',
        items: [{ menu_item_id: itemId, quantity: 2 }]
      })
    });
    data = await res.json();
    if (!res.ok) throw new Error(`Failed to create order: ${JSON.stringify(data)}`);
    orderId = data.data.id;
    assert.equal(data.data.total_amount, '40'); // 2 * 20
    console.log(`✅ Created Order (ID: ${orderId})`);

    // 8. Update Order Status (Kitchen Flow)
    const statuses = ['CONFIRMED', 'IN_KITCHEN', 'READY', 'SERVED'];
    for (const status of statuses) {
      res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: headers(adminToken),
        body: JSON.stringify({ status })
      });
      data = await res.json();
      if (!res.ok) throw new Error(`Failed to update status to ${status}: ${JSON.stringify(data)}`);
    }
    console.log('✅ Order fully processed (SERVED)');

    // 9. Generate Invoice (WAITER/MANAGER/ADMIN)
    res = await fetch(`${BASE_URL}/billing/${orderId}/invoice`, {
      method: 'POST',
      headers: headers(waiterToken),
      body: JSON.stringify({}) // Empty body since it calculates everything
    });
    data = await res.json();
    if (!res.ok) throw new Error(`Failed to generate invoice: ${JSON.stringify(data)}`);
    assert.equal(data.data.tax, '7.2'); // 18% of 40 is 7.2
    assert.equal(data.data.total, '47.2'); 
    console.log('✅ Invoice generated correctly with dynamic 18% tax');

    // 10. Process Payment
    res = await fetch(`${BASE_URL}/billing/${orderId}/payments`, {
      method: 'POST',
      headers: headers(waiterToken),
      body: JSON.stringify({ method: 'CASH', amount: 47.2 })
    });
    data = await res.json();
    if (!res.ok) throw new Error(`Failed to process payment: ${JSON.stringify(data)}`);
    console.log('✅ Payment processed successfully');

    // 11. Fetch Analytics (ADMIN/MANAGER only)
    // Waiter should fail
    res = await fetch(`${BASE_URL}/analytics/revenue?from=2020-01-01&to=2030-01-01`, {
      method: 'GET',
      headers: headers(waiterToken),
    });
    assert.equal(res.status, 403, 'Waiter incorrectly allowed to view analytics');

    // Admin should pass
    res = await fetch(`${BASE_URL}/analytics/revenue?from=2020-01-01&to=2030-01-01`, {
      method: 'GET',
      headers: headers(adminToken),
    });
    data = await res.json();
    if (!res.ok) throw new Error(`Admin failed to view analytics: ${res.status} | Data: ${JSON.stringify(data)}`);
    console.log('✅ Analytics fetched and role guards verified');

    console.log('\n🎉 All Systems Go! Every API feature passing with flying colors.');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    process.exit(1);
  }
}

runTests();
