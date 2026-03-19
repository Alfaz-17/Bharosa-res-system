import test from 'node:test';
import assert from 'node:assert';

const API_BASE = 'http://localhost:5000';
const AUTH_EMAIL = 'admin@restosaas.com';
const AUTH_PASS = 'admin123';

/**
 * Robust E2E Integration Test
 * Simulates a full customer-to-staff lifecycle programmatically.
 */

test('Complete Order-to-Billing Lifecycle Integration', async (t) => {
  let token = '';
  let restaurantId = '';
  let menuItemId = '';
  let orderId = '';
  let invoiceId = '';

  // 1. Authentication
  await t.test('Admin Login', async () => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: AUTH_EMAIL, password: AUTH_PASS })
    });
    const data = await res.json();
    
    assert.strictEqual(res.status, 200, 'Login should be successful');
    assert.ok(data.data.accessToken, 'Access token should be present');
    token = data.data.accessToken;
    restaurantId = data.data.user.restaurant_id;
    console.log('✅ Login successful');
  });

  // 2. Fetch Menu
  await t.test('Fetch Menu Items', async () => {
    const res = await fetch(`${API_BASE}/api/menu/items`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'X-Restaurant-Id': restaurantId 
      }
    });
    const data = await res.json();
    
    assert.strictEqual(res.status, 200, 'Should fetch menu items');
    assert.ok(data.data.length > 0, 'Menu should not be empty');
    menuItemId = data.data[0].id;
    console.log(`✅ Menu fetched, using item: ${data.data[0].name} (${menuItemId})`);
  });

  // 3. Place Order
  await t.test('Place Customer Order (Table 15)', async () => {
    const payload = {
      table_number: '15',
      items: [
        { menu_item_id: menuItemId, quantity: 2, notes: 'E2E Test Order' }
      ]
    };
    
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Restaurant-Id': restaurantId 
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    assert.strictEqual(res.status, 201, 'Order should be created');
    orderId = data.data.id;
    console.log(`✅ Order placed: ${data.data.order_number}`);
  });

  // 4. Kitchen Status Update
  await t.test('Kitchen accepts order', async () => {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Restaurant-Id': restaurantId 
      },
      body: JSON.stringify({ status: 'CONFIRMED' })
    });
    const data = await res.json();
    
    assert.strictEqual(res.status, 200, 'Status should update to CONFIRMED');
    assert.strictEqual(data.data.status, 'CONFIRMED');
    console.log('✅ Kitchen confirmed order');
  });

  // 5. Generate Invoice
  await t.test('Generate Billing Invoice', async () => {
    const res = await fetch(`${API_BASE}/api/billing/${orderId}/invoice`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'X-Restaurant-Id': restaurantId 
      }
    });
    const data = await res.json();
    
    assert.strictEqual(res.status, 201, 'Invoice should be generated');
    invoiceId = data.data.id;
    console.log(`✅ Invoice generated: ${data.data.invoice_number}`);
  });

  // 6. Complete Payment
  await t.test('Collect Cash Payment', async () => {
    // First we need to move order to SERVED to simulate real flow (TRANSITIONS requirement)
    // Confirm -> Kitchen -> Ready -> Served
    const statuses = ['IN_KITCHEN', 'READY', 'SERVED'];
    for (const status of statuses) {
       await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Restaurant-Id': restaurantId 
        },
        body: JSON.stringify({ status })
      });
    }

    const res = await fetch(`${API_BASE}/api/billing/${orderId}/payments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Restaurant-Id': restaurantId 
      },
      body: JSON.stringify({ 
        amount: 100, // In real world we'd use invoice total, but service handles logic
        method: 'CASH' 
      })
    });
    const data = await res.json();
    
    assert.strictEqual(res.status, 201, 'Payment should be recorded');
    console.log('✅ Payment collected and order closed');
  });

  // 7. Verify Order Status is PAID
  await t.test('Final Verification: Status is PAID', async () => {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'X-Restaurant-Id': restaurantId 
      }
    });
    const data = await res.json();
    
    assert.strictEqual(data.data.status, 'PAID', 'Order should now be in PAID status');
    console.log('🎯 E2E Verification PASSED: Full lifecycle integration is stable');
  });
});
