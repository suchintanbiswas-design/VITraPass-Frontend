/**
 * Frontend configuration.
 * Toggle the ENVIRONMENT variable between 'LOCAL' and 'PRODUCTION'.
 */
const ENVIRONMENT = 'PRODUCTION'; // Change to 'LOCAL' for local development

const ENV_CONFIG = {
  LOCAL: {
    API_BASE_URL: 'http://localhost:3000/api'
  },
  PRODUCTION: {
    API_BASE_URL: 'https://xlub261z40.execute-api.ap-south-1.amazonaws.com/prod'
  }
};

const CONFIG = {
  API_BASE_URL: ENV_CONFIG[ENVIRONMENT].API_BASE_URL
};
