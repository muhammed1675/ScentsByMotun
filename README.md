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
