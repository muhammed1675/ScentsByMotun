# ScentsBymotun - Premium Perfume E-Commerce Website

A complete, production-ready full-stack perfume e-commerce website built with HTML5, CSS3, and Vanilla JavaScript (ES6+). This website integrates with Supabase for backend operations and Paystack for payments.

## Features

### Customer Features
- 🏠 **Home Page** - Marketing hero section with featured products and testimonials
- 🛍️ **Shop Page** - Browse products with filtering, searching, and sorting
- 📦 **Product Details** - Detailed product information with quantity selector
- 🛒 **Shopping Cart** - Persistent cart with quantity management
- 👤 **Authentication** - User signup and login with Supabase Auth
- 💳 **Checkout** - Complete order form with Paystack payment integration
- ✅ **Order Success** - Order confirmation page with details

### Admin Features
- 📊 **Dashboard** - Overview of orders and revenue
- 📦 **Order Management** - View, track, and update order statuses
- 🎨 **Product Management** - Add, edit, and delete products
- 📤 **Image Upload** - Upload product images to Supabase Storage

## Project Structure

```
scentsbymotun/
├── css/
│   └── style.css                 # Main stylesheet (1100+ lines, luxury theme)
├── js/
│   ├── config.js                 # Configuration file (API keys)
│   ├── supabase.js               # Supabase client wrapper
│   ├── auth.js                   # Authentication module
│   ├── products.js               # Products management
│   ├── cart.js                   # Shopping cart logic
│   ├── checkout.js               # Order and payment handling
│   └── admin.js                  # Admin operations
├── pages/
│   ├── shop.html                 # Shop/Products page
│   ├── product.html              # Product details page
│   ├── cart.html                 # Shopping cart page
│   ├── checkout.html             # Checkout page
│   ├── login.html                # Login page
│   ├── signup.html               # Sign up page
│   ├── success.html              # Order success page
│   └── admin.html                # Admin dashboard
├── index.html                    # Home page
└── README.md                     # This file
```

## Setup Instructions

### Prerequisites
- Supabase account (free tier available)
- Paystack account
- Modern web browser
- Basic understanding of HTML/CSS/JavaScript

### Step 1: Clone or Download Project
Download this project to your local machine or web server.

### Step 2: Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Create the following tables with Row Level Security enabled:

**Table: users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Table: products**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  scent_notes TEXT,
  image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Table: orders**
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR DEFAULT 'pending',
  shipping_address JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Table: order_items**
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Table: payments**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  reference VARCHAR UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR DEFAULT 'pending',
  provider VARCHAR DEFAULT 'paystack',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

4. Get your **Supabase URL** and **Anon Key** from Settings > API

### Step 3: Enable Supabase Auth

1. Go to Authentication > Providers
2. Enable Email/Password provider
3. Copy your auth credentials

### Step 4: Setup Paystack

1. Go to [paystack.com](https://paystack.com) and create account
2. Get your **Public Key** from Settings > API Keys & Webhooks
3. For production, replace test keys with live keys

### Step 5: Update Configuration

Edit `/config.js` and replace the placeholder values:

```javascript
const CONFIG = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here',
  PAYSTACK_PUBLIC_KEY: 'pk_test_your-paystack-public-key',
  // ... rest of config
};
```

### Step 6: Add Sample Products (Optional)

Insert sample products into your `products` table using Supabase Studio:

```sql
INSERT INTO products (name, price, category, description, scent_notes, image_url) VALUES
('Oud Premium', 25000, 'Men', 'Luxurious oud fragrance', 'Top: Bergamot, Heart: Oud, Base: Musk', 'https://via.placeholder.com/300'),
('Rose Garden', 22000, 'Women', 'Elegant floral scent', 'Top: Citrus, Heart: Rose, Base: Vanilla', 'https://via.placeholder.com/300'),
('Unisex Classic', 20000, 'Unisex', 'Versatile everyday fragrance', 'Top: Lemon, Heart: Lavender, Base: Cedar', 'https://via.placeholder.com/300');
```

### Step 7: Deploy

#### Option A: Vercel (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Connect your repository
4. Deploy automatically

#### Option B: Any Web Host
Simply upload all files to your web server using FTP or file manager.

## Usage Guide

### For Customers

1. **Browse Products**
   - Visit `/pages/shop.html`
   - Use filters and search to find products
   - Click "View Details" for more information

2. **Add to Cart**
   - On product page, select quantity and click "Add to Cart"
   - Cart persists in localStorage

3. **Checkout**
   - Click cart icon → "Proceed to Checkout"
   - Login or create account if needed
   - Fill shipping information
   - Click "Proceed to Payment"
   - Complete Paystack payment

4. **View Order**
   - After payment, see order confirmation page
   - Order status will update as it's processed

### For Admins

1. **Access Admin Dashboard**
   - Create admin account (mark user as admin in Supabase user metadata)
   - Navigate to `/pages/admin.html`

2. **Manage Orders**
   - View all orders and revenue stats
   - Update order status (pending → paid → shipped → delivered)

3. **Manage Products**
   - Add new products with name, price, category, description
   - Edit existing products
   - Delete products
   - Upload images

## Key Features Explained

### Authentication (auth.js)
- Uses Supabase Auth for secure user registration and login
- Sessions stored in localStorage
- Token refresh functionality
- Admin role detection

### Shopping Cart (cart.js)
- Client-side cart using localStorage
- Add, remove, and update product quantities
- Real-time cart count in header
- Persists across page refreshes

### Products (products.js)
- Fetch products from Supabase
- Filter by category
- Search functionality
- Caching for better performance

### Checkout (checkout.js)
- Create orders in Supabase
- Paystack payment initialization
- Payment verification via Edge Function
- Order status management

### Admin (admin.js)
- Dashboard statistics
- Order management
- Product CRUD operations
- Image upload to Supabase Storage

## Security Features

✅ **Row Level Security (RLS)** - Users only see their own orders
✅ **Environment Variables** - API keys not hardcoded
✅ **Password Hashing** - Supabase Auth handles security
✅ **HTTPS** - Use only on secure connections
✅ **Input Validation** - Frontend and backend validation
✅ **CORS** - Supabase handles cross-origin requests

## Styling

The website uses a **luxury dark theme** with:
- Gold (#d4af37) accent colors
- Deep black (#1a1a1a) primary color
- Cream (#f5f1ed) text color
- Responsive design (mobile-first)
- CSS custom properties for easy customization

### Customize Colors

Edit `/css/style.css` variables:

```css
:root {
  --primary: #1a1a1a;           /* Main color */
  --secondary: #d4af37;         /* Accent/Gold */
  --accent: #8b7355;            /* Brown tones */
  --neutral: #f5f1ed;           /* Cream */
  /* ... more variables */
}
```

## Troubleshooting

### "SUPABASE_URL is not set" Error
- Check that `/config.js` has valid Supabase URL
- Clear browser cache and refresh

### Cart not saving
- Check browser localStorage is enabled
- Try incognito/private mode
- Check browser console for errors

### Payment not processing
- Verify Paystack public key is correct
- Check Paystack account is live/test mode matches
- Review Paystack logs for errors

### Products not loading
- Verify products table exists in Supabase
- Check SUPABASE_ANON_KEY is correct
- Insert sample products if table is empty

### Admin access denied
- Mark user as admin in Supabase user metadata or email
- Verify user is marked with role: 'admin'
- Logout and login again

## API Integration Notes

### Supabase REST API
- All database queries use standard REST endpoints
- Anon key provides public access with RLS protection
- No additional libraries required

### Paystack Integration
- Uses Paystack inline JavaScript (CDN)
- Reference numbers generated client-side
- Payment verification happens server-side (Edge Function)

### Edge Functions (Not Included)
Create a Supabase Edge Function `/functions/verify-payment`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
)

serve(async (req) => {
  if (req.method === "POST") {
    const { reference, order_id } = await req.json()

    // Verify with Paystack API
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
        },
      }
    )

    const data = await response.json()

    if (data.status && data.data.status === "success") {
      // Update order and payment
      await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", order_id)

      await supabase.from("payments").insert({
        order_id,
        reference,
        amount: data.data.amount / 100,
        status: "success",
        paid_at: new Date(),
      })

      return new Response(
        JSON.stringify({ success: true, message: "Payment verified" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, message: "Payment verification failed" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Tips

1. Optimize product images (use WebP format)
2. Enable Supabase caching
3. Use CDN for assets
4. Minify CSS/JS in production
5. Enable gzip compression on server

## Future Enhancements

- [ ] Wishlist/favorites feature
- [ ] Product reviews and ratings
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced analytics
- [ ] Multi-currency support
- [ ] Subscription plans
- [ ] Mobile app version

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Check Paystack documentation: https://paystack.com/docs
- Review browser console for error messages
- Test with demo credentials first

## License

This is a custom e-commerce solution. Modify and use as needed for your business.

## Version

**v1.0.0** - Initial production release

---

**Built with ❤️ for perfume lovers everywhere**

Last Updated: January 2024
#   S c e n t s B y M o t u n  
 