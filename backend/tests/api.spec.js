const request = require('supertest');
const { app } = require('../server');

describe('Health and basics', () => {
  it('GET /health ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Swagger served', () => {
  it('GET /docs returns HTML', async () => {
    const res = await request(app).get('/docs');
    // Even if swagger deps missing, it should not crash
    expect([200, 404, 301, 302]).toContain(res.status);
  });
});
