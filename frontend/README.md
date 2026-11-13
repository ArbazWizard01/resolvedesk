# ResolveDesk frontend

ResolveDesk is a responsive support-ticket dashboard built with Next.js, Tailwind CSS, and Ant Design.

## Run locally

```bash
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:4000` by default. Set `NEXT_PUBLIC_API_URL` in `.env.local` to use a different backend URL.

## SEO deployment URL

Set `NEXT_PUBLIC_SITE_URL` to the site's absolute public URL (for example, `https://support.example.com`) so generated Open Graph and Twitter preview images use the correct host. On Vercel, `VERCEL_URL` is used automatically when `NEXT_PUBLIC_SITE_URL` is not set.

The app sets page titles and descriptions in `src/app/layout.tsx` and generates a descriptive social preview image in `src/app/opengraph-image.tsx`.
