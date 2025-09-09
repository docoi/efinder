export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const results = Array.isArray(body?.results) ? body.results : [];
      const fields = ['ig_id', 'username', 'biography', 'followers', 'category', 'emails'];
  
      const lines = [fields.join(',')];
      for (const r of results) {
        const row = fields.map((f) => {
          let v = r?.[f];
          if (f === 'emails' && Array.isArray(v)) v = v.join('; ');
          if (typeof v === 'object' && v !== null) v = JSON.stringify(v);
          if (typeof v === 'string') v = `"${v.replaceAll('"', '""')}"`;
          return v ?? '';
        });
        lines.push(row.join(','));
      }
  
      const csv = lines.join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
      return res.status(200).send(csv);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'server_error' });
    }
  }
  