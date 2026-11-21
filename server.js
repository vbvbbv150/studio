import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

const root = resolve(process.argv[2] || '.');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
const server = http.createServer(async (req,res)=>{
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const relative = pathname === '/' ? '/index.html' : pathname;
    const file = resolve(root, `.${relative}`);
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403); res.end('Forbidden'); return; }
    const data = await readFile(file);
    const ext = file.slice(file.lastIndexOf('.'));
    res.writeHead(200, {'content-type':types[ext] || 'application/octet-stream','x-content-type-options':'nosniff'});
    res.end(data);
  } catch { res.writeHead(404,{'content-type':'text/plain; charset=utf-8'}); res.end('Not found'); }
});
const port = Number(process.env.PORT || 5173);
server.listen(port,'0.0.0.0',()=>console.log(`Studio ready at http://localhost:${port}`));
