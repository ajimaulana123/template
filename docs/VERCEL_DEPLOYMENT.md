# Vercel Deployment Guide

## 🚀 Quick Deploy

### Prerequisites
- Akun Vercel (gratis)
- Supabase project sudah setup
- Groq API key

## Step 1: Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

## Step 2: Import ke Vercel

1. Buka [vercel.com](https://vercel.com)
2. Klik **"Add New Project"**
3. Import repository dari GitHub
4. Vercel akan auto-detect Next.js

## Step 3: Configure Environment Variables

Di Vercel dashboard, tambahkan environment variables:

### Database (Supabase)
```
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepared_statements=false&connection_limit=5&pool_timeout=10

DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
```

### App Config
```
NODE_ENV=production
SESSION_SECRET=[RANDOM-SECRET-32-CHARS]
REGISTRATION_TOKEN=[YOUR-REGISTRATION-TOKEN]
```

### AI (Groq)
```
GROQ_API_KEY=[YOUR-GROQ-API-KEY]
```

## Step 4: Deploy

1. Klik **"Deploy"**
2. Tunggu build selesai (~2-3 menit)
3. Vercel akan memberikan URL: `https://your-app.vercel.app`

## 🔧 Troubleshooting

### Error: Prisma Engine Not Found

**Sudah Fixed!** Konfigurasi sudah ditambahkan:
- `binaryTargets = ["native", "rhel-openssl-3.0.x"]` di schema.prisma
- Webpack externals di next.config.mjs
- Build command yang benar

### Error: Database Connection

**Check:**
1. DATABASE_URL menggunakan **pooler** (port 6543)
2. DIRECT_URL menggunakan **direct** (port 5432)
3. Connection string format benar
4. Supabase project tidak di-pause

### Error: Build Failed

**Common fixes:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Clear cache dan rebuild
vercel --prod --force
```

## 📊 Post-Deployment

### 1. Run Database Migrations

Migrations otomatis run saat build dengan:
```bash
prisma migrate deploy
```

### 2. Setup Admin User

Gunakan registration token untuk create admin pertama:
```
https://your-app.vercel.app/[REGISTRATION_TOKEN]/register
```

### 3. Test PWA Install

1. Buka di mobile browser
2. Popup install akan muncul
3. Install ke home screen

### 4. Monitor Performance

Vercel Analytics otomatis aktif:
- Speed Insights
- Web Vitals
- Real User Monitoring

## 🔄 Continuous Deployment

Setiap push ke `main` branch akan auto-deploy:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel akan:
1. Auto-detect changes
2. Run build
3. Deploy ke production
4. Update URL

## 🌍 Custom Domain

### Setup Custom Domain:

1. Vercel Dashboard → Project → Settings → Domains
2. Add domain: `yourdomain.com`
3. Update DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (~5-10 menit)

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Semua secrets di Vercel env vars
- ❌ Jangan commit `.env` ke git

### 2. Database Security
- ✅ Use connection pooling (pgBouncer)
- ✅ Enable RLS di Supabase
- ✅ Limit connection pool size

### 3. API Security
- ✅ Session-based auth
- ✅ CSRF protection
- ✅ Rate limiting (via Vercel)

## 📈 Performance Optimization

### Vercel Edge Network
- Global CDN
- Automatic caching
- Edge functions

### Database Optimization
- Connection pooling enabled
- Query caching (30-60s)
- Optimized indexes

### Image Optimization
- Automatic WebP/AVIF
- Responsive images
- Lazy loading

## 🐛 Debug Production Issues

### View Logs:
```bash
vercel logs [deployment-url]
```

### Or di Vercel Dashboard:
1. Project → Deployments
2. Click deployment
3. View "Runtime Logs"

### Common Issues:

**500 Error:**
- Check runtime logs
- Verify env vars
- Test database connection

**Slow Performance:**
- Check Vercel Analytics
- Review database queries
- Optimize images

## 🔄 Rollback Deployment

Jika ada masalah:

1. Vercel Dashboard → Deployments
2. Find working deployment
3. Click "..." → "Promote to Production"

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Supabase + Vercel](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## ✅ Deployment Checklist

- [ ] Push code ke GitHub
- [ ] Import ke Vercel
- [ ] Add all environment variables
- [ ] Deploy
- [ ] Test database connection
- [ ] Create admin user
- [ ] Test all features
- [ ] Setup custom domain (optional)
- [ ] Enable Vercel Analytics
- [ ] Monitor performance
