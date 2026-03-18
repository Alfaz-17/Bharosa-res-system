import fetch from 'node-fetch'; // Polyfill not needed in v22 usually, but for safe script
const run = async () => {
  console.log('Fetching order status info error...');
  try {
    const r = await fetch('http://127.0.0.1:3000/api/orders');
    console.log(r.status);
  } catch(e) {
    console.error(e);
  }
}
run();
