'use strict';

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const path   = require('node:path');

const BankIDService   = require('../../src/Service/BankIDService');
const CollectResponse = require('../../src/Model/CollectResponse');
const OrderResponse   = require('../../src/Model/OrderResponse');

const TEST_PERSONAL_NUMBER = '199202271434';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** @type {BankIDService} */
let bankIDService;

before(() => {
  bankIDService = new BankIDService(
    'https://appapi2.test.bankid.com/rp/v5.1/',
    '127.0.0.1',
    {
      verify:  false,
      cert:    path.resolve(__dirname, '../FPTestcert3_20200618.p12'),
      // default password from BankID: qwerty123
    }
  );
});

describe('BankIDService', () => {

  /** @type {OrderResponse} */
  let signResponse;

  it('testSignResponse', async () => {
    signResponse = await bankIDService.getSignResponse(
      TEST_PERSONAL_NUMBER,
      'userVisibleData',
      'userNonVisibleData'
    );
    assert.ok(signResponse instanceof OrderResponse);
  });

  it('testCollectSignResponse', async () => {
    assert.ok(signResponse instanceof OrderResponse);

    let collectResponse;
    let attempts = 0;
    do {
      process.stdout.write('\nWaiting confirmation from BankID application...\n');
      await sleep(10000);
      collectResponse = await bankIDService.collectResponse(signResponse.orderRef);
      attempts++;
    } while (collectResponse.status !== CollectResponse.STATUS_COMPLETED && attempts <= 6);

    assert.ok(collectResponse instanceof CollectResponse);
    assert.equal(collectResponse.status, CollectResponse.STATUS_COMPLETED);
  });

  /** @type {OrderResponse} */
  let signResponseNoPersonal;

  it('testSignResponseWithoutPersonalNumber', async () => {
    signResponseNoPersonal = await bankIDService.getSignResponse(
      null,
      'userVisibleData',
      'userNonVisibleData'
    );
    assert.ok(signResponseNoPersonal instanceof OrderResponse);
  });

  it('testCollectSignResponseWithoutPersonalNumber', async () => {
    assert.ok(signResponseNoPersonal instanceof OrderResponse);

    let collectResponse;
    let attempts = 0;
    do {
      process.stdout.write('\nWaiting confirmation from BankID application...\n');
      await sleep(10000);
      collectResponse = await bankIDService.collectResponse(signResponseNoPersonal.orderRef);
      attempts++;
    } while (collectResponse.status !== CollectResponse.STATUS_COMPLETED && attempts <= 6);

    assert.ok(collectResponse instanceof CollectResponse);
    assert.equal(collectResponse.status, CollectResponse.STATUS_COMPLETED);
  });

  /** @type {OrderResponse} */
  let authResponse;

  it('testAuthResponse', async () => {
    authResponse = await bankIDService.getAuthResponse(TEST_PERSONAL_NUMBER);
    assert.ok(authResponse instanceof OrderResponse);
  });

  it('testCollectAuthResponse', async () => {
    assert.ok(authResponse instanceof OrderResponse);

    let collectResponse;
    let attempts = 0;
    do {
      process.stdout.write('\nWaiting confirmation from BankID application...\n');
      await sleep(10000);
      collectResponse = await bankIDService.collectResponse(authResponse.orderRef);
      attempts++;
    } while (collectResponse.status !== CollectResponse.STATUS_COMPLETED && attempts <= 6);

    assert.ok(collectResponse instanceof CollectResponse);
    assert.equal(collectResponse.status, CollectResponse.STATUS_COMPLETED);
  });

  /** @type {OrderResponse} */
  let authResponseNoPersonal;

  it('testAuthResponseWithoutPersonalNumber', async () => {
    authResponseNoPersonal = await bankIDService.getAuthResponse();
    assert.ok(authResponseNoPersonal instanceof OrderResponse);
  });

  it('testCollectAuthResponseWithoutPersonalNumber', async () => {
    assert.ok(authResponseNoPersonal instanceof OrderResponse);

    let collectResponse;
    let attempts = 0;
    do {
      process.stdout.write('\nWaiting confirmation from BankID application...\n');
      await sleep(10000);
      collectResponse = await bankIDService.collectResponse(authResponseNoPersonal.orderRef);
      attempts++;
    } while (collectResponse.status !== CollectResponse.STATUS_COMPLETED && attempts <= 6);

    assert.ok(collectResponse instanceof CollectResponse);
    assert.equal(collectResponse.status, CollectResponse.STATUS_COMPLETED);
  });

  it('testCancelResponse', async () => {
    const authResp = await bankIDService.getAuthResponse(TEST_PERSONAL_NUMBER);
    assert.ok(authResp instanceof OrderResponse);

    await sleep(3000);

    const cancelResponse = await bankIDService.cancelOrder(authResp.orderRef);
    assert.equal(cancelResponse, true);
  });

});
