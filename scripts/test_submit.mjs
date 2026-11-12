process.env.NODE_ENV = 'test';
import { app } from '../backend/server.js';
import { EventEmitter } from 'events';
import { Readable } from 'stream';

function req(method, url, body) {
  return new Promise((resolve) => {
    const r = new Readable({ read() { this.push(JSON.stringify(body)); this.push(null); } });
    r.method = method; r.url = url; r.originalUrl = url;
    r.body = body; r.headers = { 'content-type': 'application/json' }; r.query = {};
    const res = new EventEmitter(); res.statusCode = 200; res._h = {};
    res.setHeader = (k, v) => { res._h[k] = v; }; res.getHeader = (k) => res._h[k];
    res.status = (c) => { res.statusCode = c; return res; }; let b = '';
    res.write = (c) => { b += c; return true; };
    res.end = (c) => { b += (c || ''); let p = b; try { p = JSON.parse(b); } catch(e) {} resolve({ status: res.statusCode, body: p }); };
    res.json = (o) => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(o)); };
    res.send = (v) => { if (typeof v === 'object') return res.json(v); res.end(v); };
    app.handle(r, res, (e) => resolve({ status: 500, body: { error: String(e) } }));
  });
}

// Test exactly what the phone sends
const result = await req('POST', '/api/challenges', {
  title: 'water leakage',
  description: 'severe water problems',
  district: 'Dumka',
  block: 'Jama',
  domain: 'General',
  idempotencyKey: 'SETU-IDEM-1794211871759-5785mphjt'
});

console.log('STATUS:', result.status);
console.log('BODY:', JSON.stringify(result.body).slice(0, 500));
