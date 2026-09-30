const integrationService = require('../services/integrationService');
const verificationService = require('../services/verificationService');

function getIntegrationStatus() { return { integrations: integrationService.getStatuses() }; }
async function checkDocument(body) { return verificationService.verifyDocument({ document: body?.document }); }

module.exports = { getIntegrationStatus, checkDocument };
