## Agentic Structural Studio

Agentic Structural Studio is a mobile-first web application for conceptual structural design, material exploration, and near real-time performance feedback. The experience is tuned for touch devices yet scales gracefully to large displays.

### Core Features

- **Drag-and-drop modeling**: Place walls, beams, columns, and supports directly onto a responsive 2D/3D canvas.
- **Rich material library**: Start with curated presets, adjust mechanical properties inline, or add custom records to suit project demands.
- **Interactive loads & constraints**: Apply point, shear, and moment loads, toggle boundary conditions, and iterate on component geometry.
- **Live analysis**: Color-coded stress, strain, and utilization calculations update instantly as you edit the model.
- **Reporting**: Generate shareable text reports capturing geometry, materials, load cases, and safety factors in a single click.

### Tech Stack

- [Next.js 14](https://nextjs.org/) with the App Router
- TypeScript & Tailwind CSS for type-safe styling
- HTML5 drag-and-drop and accessible keyboard controls

### Local Development

```bash
npm install
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to interact with the studio. The project includes ESLint and TypeScript checks that run automatically on `npm run build`.

### Production Build

```bash
npm run build
npm run start
```

### Deployment

The project is optimised for deployment on [Vercel](https://vercel.com/). Use `vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-c2d5f8d7` after building and verifying locally.
