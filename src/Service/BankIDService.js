'use strict';

const https        = require('https');
const fs           = require('fs');
const CollectResponse = require('../Model/CollectResponse');
const OrderResponse   = require('../Model/OrderResponse');

/**
 * Class BankIDService
 *
 * @category JS
 * @package  Dimafe6\BankID\Service
 * @author   Dmytro Feshchenko <dimafe2000@gmail.com>
 */
class BankIDService {
  /**
   * @param {string} apiUrl     - BankID API base url
   * @param {string} endUserIp  - The user IP address as seen by RP. IPv4 and IPv6 is allowed.
   * @param {Object} options    - TLS/SSL options
   * @param {boolean|string} options.verify   - false to skip cert verification, or path to CA cert
   * @param {string}         options.cert     - Path to .pem/.crt client certificate
   * @param {string}         options.ssl_key  - Path to .key client private key
   */
  constructor(apiUrl, endUserIp, options = {}) {
    this.apiUrl    = apiUrl.endsWith('/') ? apiUrl : apiUrl + '/';
    this.endUserIp = endUserIp;
    this.options   = options;

    const agentOptions = {};

    if (options.verify === false) {
      agentOptions.rejectUnauthorized = false;
    } else if (typeof options.verify === 'string') {
      agentOptions.ca = fs.readFileSync(options.verify);
    }

    if (options.cert) {
      agentOptions.cert = fs.readFileSync(options.cert);
    }

    if (options.ssl_key) {
      agentOptions.key = fs.readFileSync(options.ssl_key);
    }

    this._agent = new https.Agent(agentOptions);
  }

  /**
   * @param {string|null} personalNumber - 12 digit personal number. Century must be included.
   * @returns {Promise<OrderResponse>}
   */
  async getAuthResponse(personalNumber = null) {
    const parameters = {
      endUserIp:   this.endUserIp,
      requirement: { allowFingerprint: true },
    };

    if (personalNumber) {
      parameters.personalNumber = personalNumber;
    }

    const data = await this._post('auth', parameters);
    return new OrderResponse(data);
  }

  /**
   * @param {string|null} personalNumber      - 12 digit personal number. Century must be included.
   * @param {string}      userVisibleData      - The text to be displayed and signed.
   * @param {string}      userHiddenData       - Data not displayed to the user.
   * @param {string|null} userVisibleDataFormat - Format for data displayed to the user.
   * @returns {Promise<OrderResponse>}
   */
  async getSignResponse(personalNumber, userVisibleData, userHiddenData = '', userVisibleDataFormat = null) {
    const parameters = {
      endUserIp:       this.endUserIp,
      userVisibleData: Buffer.from(userVisibleData).toString('base64'),
      requirement:     { allowFingerprint: true },
    };

    if (personalNumber) {
      parameters.personalNumber = personalNumber;
    }

    if (userHiddenData) {
      parameters.userNonVisibleData = Buffer.from(userHiddenData).toString('base64');
    }

    if (userVisibleDataFormat !== null) {
      parameters.userVisibleDataFormat = userVisibleDataFormat;
    }

    const data = await this._post('sign', parameters);
    return new OrderResponse(data);
  }

  /**
   * @param {string} orderRef - Used to collect the status of the order.
   * @returns {Promise<CollectResponse>}
   */
  async collectResponse(orderRef) {
    const data = await this._post('collect', { orderRef });
    return new CollectResponse(data);
  }

  /**
   * @param {string} orderRef - Used to collect the status of the order.
   * @returns {Promise<boolean>}
   */
  async cancelOrder(orderRef) {
    const response = await this._postRaw('cancel', { orderRef });
    return response.status === 200;
  }

  /**
   * @private
   * @param {string} endpoint
   * @param {Object} body
   * @returns {Promise<Object>}
   */
  async _post(endpoint, body) {
    const response = await this._postRaw(endpoint, body);
    return response.json();
  }

  /**
   * @private
   * @param {string} endpoint
   * @param {Object} body
   * @returns {Promise<Response>}
   */
  async _postRaw(endpoint, body) {
    const url = this.apiUrl + endpoint;

    const response = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
      // @ts-ignore - Node 18+ fetch supports dispatcher-like options via undici
      agent:   this._agent,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      const err = new Error(`BankID API error ${response.status}: ${errorBody}`);
      err.status   = response.status;
      err.response = errorBody;
      throw err;
    }

    return response;
  }
}

module.exports = BankIDService;
