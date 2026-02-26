'use strict';

/**
 * Class AbstractResponseModel
 *
 * Constructor converts response body JSON to object properties
 *
 * @category JS
 * @package  Dimafe6\BankID\Model
 * @author   Dmytro Feshchenko <dimafe2000@gmail.com>
 */
class AbstractResponseModel {
  /**
   * @param {Object|null} responseData - parsed JSON response body
   */
  constructor(responseData = null) {
    if (responseData !== null) {
      for (const [key, value] of Object.entries(responseData)) {
        this[key] = value;
      }
    }
  }
}

module.exports = AbstractResponseModel;
