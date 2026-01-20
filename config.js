/**
 * ScentsBymotun - Configuration File
 * Replace these values with your actual API keys
 */

const CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: 'https://peemienpknqkrohszcys.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_gcywWLfZKMc1ebteAl3s9A_XuB4jQ13',

  // Paystack Configuration
  PAYSTACK_PUBLIC_KEY: 'pk_test_your-paystack-public-key',

  // Supabase Edge Function URLs
  VERIFY_PAYMENT_FUNCTION: '/functions/v1/verify-payment',

  // App Configuration
  APP_NAME: 'ScentsBymotun',
  CURRENCY: 'NGN',
  CURRENCY_SYMBOL: '₦',

  // Admin role identifier (stored in Supabase auth metadata or a roles table)
  ADMIN_EMAIL_DOMAIN: 'admin', // or use a roles table lookup

  // API Endpoints (if using Edge Functions)
  EDGE_FUNCTION_URL: (functionName) => `${CONFIG.SUPABASE_URL}/functions/v1/${functionName}`,
};

// Freeze config to prevent accidental modifications
Object.freeze(CONFIG);

export default CONFIG;
