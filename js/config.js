/**
 * Frontend configuration.
 * Toggle the ENVIRONMENT variable between 'LOCAL' and 'PRODUCTION'.
 */
const ENVIRONMENT = 'PRODUCTION'; // Change to 'LOCAL' for local development

const ENV_CONFIG = {
  LOCAL: {
    API_BASE_URL: 'http://localhost:3000/api',
    COGNITO_REGION: 'ap-south-1',
    COGNITO_USER_POOL_ID: 'ap-south-1_SV13ujW05',
    COGNITO_CLIENT_ID: '250pevesklnfol2grddek43rt2',
    ALLOWED_EMAIL_DOMAIN: 'vitstudent.ac.in'
  },
  PRODUCTION: {
    API_BASE_URL: 'https://xlub261z40.execute-api.ap-south-1.amazonaws.com/prod',
    COGNITO_REGION: 'ap-south-1',
    COGNITO_USER_POOL_ID: 'ap-south-1_SV13ujW05',
    COGNITO_CLIENT_ID: '250pevesklnfol2grddek43rt2',
    ALLOWED_EMAIL_DOMAIN: 'vitstudent.ac.in'
  }
};

const CONFIG = {
  API_BASE_URL: ENV_CONFIG[ENVIRONMENT].API_BASE_URL,
  COGNITO_REGION: ENV_CONFIG[ENVIRONMENT].COGNITO_REGION,
  COGNITO_USER_POOL_ID: ENV_CONFIG[ENVIRONMENT].COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID: ENV_CONFIG[ENVIRONMENT].COGNITO_CLIENT_ID,
  ALLOWED_EMAIL_DOMAIN: ENV_CONFIG[ENVIRONMENT].ALLOWED_EMAIL_DOMAIN
};
