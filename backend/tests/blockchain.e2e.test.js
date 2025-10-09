const request = require('supertest');
const { app } = require('../server');
const { ec: EC } = require('elliptic');
const { Transaction } = require('verishare-blockchain');

const ec = new EC('secp256k1');

function makeSignedTx(fromKey, toPubHex, amount, data = null, type = 'transfer', timestamp = Date.now()) {
  const tx = new Transaction(fromKey.getPublic('hex'), toPubHex, amount, data, type, timestamp, null);
  tx.signTransaction(fromKey);
  return { body: { fromAddress: tx.fromAddress, toAddress: tx.toAddress, amount: tx.amount, data: tx.data, type: tx.type, timestamp: tx.timestamp, signature: tx.signature }, tx };
}

describe('Blockchain API', () => {
  const fromKey = ec.genKeyPair();
  const toKey = ec.genKeyPair();
  const minerKey = ec.genKeyPair();

  it('GET /health ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/blockchain/info returns node info', async () => {
    const res = await request(app).get('/api/blockchain/info');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nodeAddress');
    expect(res.body).toHaveProperty('isValid', true);
  });

  it('POST transaction then mine and check balance', async () => {
    const { body } = makeSignedTx(fromKey, toKey.getPublic('hex'), 1, null, 'transfer', 1700000000000);

    const create = await request(app).post('/api/blockchain/transaction').send(body);
    expect(create.status).toBe(201);

    const mine = await request(app).post('/api/blockchain/mine').send({ rewardAddress: minerKey.getPublic('hex') });
    expect(mine.status).toBe(200);

    const balanceFrom = await request(app).get(`/api/blockchain/address/${fromKey.getPublic('hex')}/balance`);
    expect(balanceFrom.status).toBe(200);

    const bal = balanceFrom.body.balance;
    // from sent 1, miner got 100 reward; sender has only -1 since reward to miner
    expect(bal).toBe(-1);

    const balanceMiner = await request(app).get(`/api/blockchain/address/${minerKey.getPublic('hex')}/balance`);
    expect(balanceMiner.status).toBe(200);
    expect(balanceMiner.body.balance).toBeGreaterThanOrEqual(100);
  });
});
