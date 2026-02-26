'use strict';

const AbstractResponseModel = require('./AbstractResponseModel');

/**
 * Class CollectResponse
 *
 * Response from collect method
 *
 * @property {string} orderRef - The orderRef in question
 * @property {string} status - The order status.
 *      pending: The order is being processed. hintCode describes the status of the order.
 *      failed: Something went wrong with the order. hintCode describes the error.
 *      complete: The order is complete. completionData holds user information
 * @property {string} hintCode - Only present for pending and failed orders.
 * @property {Object} completionData - Only present for complete orders.
 */
class CollectResponse extends AbstractResponseModel {}

CollectResponse.STATUS_COMPLETED = 'complete';
CollectResponse.STATUS_PENDING   = 'pending';
CollectResponse.STATUS_FAILED    = 'failed';

CollectResponse.HINT_COMPLETED = 'complete';

CollectResponse.HINT_PENDING_OUTSTANDING_TRANSACTION = 'outstandingTransaction';
CollectResponse.HINT_PENDING_NO_CLIENT               = 'noClient';
CollectResponse.HINT_PENDING_STARTED                 = 'started';
CollectResponse.HINT_PENDING_USER_SIGN               = 'userSign';

CollectResponse.HINT_FAILED_EXPIRED_TRANSACTION = 'expiredTransaction';
CollectResponse.HINT_FAILED_CERTIFICATE_ERR     = 'certificateErr';
CollectResponse.HINT_FAILED_USER_CANCEL         = 'userCancel';
CollectResponse.HINT_FAILED_CANCELLED           = 'cancelled';
CollectResponse.HINT_FAILED_START_FAILED        = 'startFailed';

module.exports = CollectResponse;
