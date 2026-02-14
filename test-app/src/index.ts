import 'dotenv/config';
import { app } from './app.js';

const PORT = process.env.PORT || 3040;
app.listen(PORT, () => console.log(`Test app running on port ${PORT}`));
