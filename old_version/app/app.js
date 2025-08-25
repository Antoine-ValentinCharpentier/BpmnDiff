import express from 'express';
import bpmnRoutes from './routes/bpmn.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3000
const isProd = process.env.NODE_ENV === 'production'

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'views'))); // static ressources (ex: css) inside views folder

if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });
  app.use(vite.middlewares);
} else {
  app.use('/assets', express.static(path.resolve(__dirname, '../public/assets'))); // minimified js
}

app.use('/', bpmnRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
