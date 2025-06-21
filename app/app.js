import express from 'express';
import bpmnRoutes from './routes/bpmn.routes.js';
import sequelize from './config/db.js';

const PORT = 3000;

const app = express();

app.use(express.json());
app.use('/', bpmnRoutes);

await sequelize.sync();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
