import express from 'express';
import cors from 'cors';
import { marked } from 'marked';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
  sanitize: false
});

app.post('/api/convert', (req, res) => {
  try {
    const { markdown } = req.body;
    const html = marked(markdown);
    res.json({ html });
  } catch (error) {
    res.status(500).json({ error: 'Error converting markdown' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});