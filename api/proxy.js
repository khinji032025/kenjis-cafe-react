export default async function handler(req, res) {
  const { endpoint, ...params } = req.query;
  
  const queryString = new URLSearchParams(params).toString();
  const url = `https://kenjiscafe.infinityfreeapp.com/api/${endpoint}${queryString ? '?' + queryString : ''}`;
  
  try {
    const response = await fetch(url, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });
    
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Proxy error' });
  }
}