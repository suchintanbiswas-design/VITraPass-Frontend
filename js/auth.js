/**
 * Reusable Cognito authentication utility for VITraPass.
 * Uses AmazonCognitoIdentity injected via CDN script.
 */

let userPool = null;

function getUserPool() {
  if (userPool) return userPool;
  if (!CONFIG.COGNITO_USER_POOL_ID || !CONFIG.COGNITO_CLIENT_ID) {
    console.error("Cognito configuration is missing in config.js");
    return null;
  }
  const poolData = {
    UserPoolId: CONFIG.COGNITO_USER_POOL_ID,
    ClientId: CONFIG.COGNITO_CLIENT_ID
  };
  userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  return userPool;
}

const Auth = {
  signUp: function (name, email, password, callback) {
    const pool = getUserPool();
    if (!pool) return callback(new Error("User pool not configured"), null);

    const attributeList = [
      new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email }),
      new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'name', Value: name })
    ];

    pool.signUp(email, password, attributeList, null, callback);
  },

  confirmSignUp: function (email, code, callback) {
    const pool = getUserPool();
    if (!pool) return callback(new Error("User pool not configured"), null);

    const userData = { Username: email, Pool: pool };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.confirmRegistration(code, true, callback);
  },

  signIn: function (email, password, callbacks) {
    const pool = getUserPool();
    if (!pool) return callbacks.onFailure(new Error("User pool not configured"));

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userData = { Username: email, Pool: pool };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        // Store necessary token in sessionStorage
        sessionStorage.setItem('idToken', result.getIdToken().getJwtToken());
        sessionStorage.setItem('email', email);
        if (callbacks.onSuccess) callbacks.onSuccess(result);
      },
      onFailure: function (err) {
        if (callbacks.onFailure) callbacks.onFailure(err);
      },
      newPasswordRequired: function (userAttributes, requiredAttributes) {
        if (callbacks.newPasswordRequired) {
          callbacks.newPasswordRequired(userAttributes, requiredAttributes, cognitoUser);
        }
      }
    });
  },

  signOut: function () {
    const pool = getUserPool();
    if (pool) {
      const cognitoUser = pool.getCurrentUser();
      if (cognitoUser != null) {
        cognitoUser.signOut();
      }
    }
    sessionStorage.removeItem('idToken');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('name');
  },

  getCurrentUser: function () {
    const pool = getUserPool();
    if (!pool) return null;
    return pool.getCurrentUser();
  },

  getIdToken: function () {
    return sessionStorage.getItem('idToken');
  },

  isAuthenticated: function () {
    return !!this.getIdToken();
  },

  forgotPassword: function (email, callbacks) {
    const pool = getUserPool();
    if (!pool) return callbacks.onFailure(new Error("User pool not configured"));

    const userData = { Username: email, Pool: pool };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.forgotPassword({
      onSuccess: function (data) {
        if (callbacks.onSuccess) callbacks.onSuccess(data);
      },
      onFailure: function (err) {
        if (callbacks.onFailure) callbacks.onFailure(err);
      },
      inputVerificationCode: function (data) {
        if (callbacks.inputVerificationCode) callbacks.inputVerificationCode(data);
      }
    });
  },

  confirmPassword: function(email, code, newPassword, callbacks) {
    const pool = getUserPool();
    if (!pool) return callbacks.onFailure(new Error("User pool not configured"));

    const userData = { Username: email, Pool: pool };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.confirmPassword(code, newPassword, callbacks);
  },

  requireAuth: function () {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
    }
  },

  parseJwt: function(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  },

  isVolunteer: function() {
    const token = this.getIdToken();
    if (!token) return false;
    const payload = this.parseJwt(token);
    if (!payload || !payload['cognito:groups']) return false;
    const groups = payload['cognito:groups'];
    return Array.isArray(groups) ? groups.includes('VOLUNTEER') : groups === 'VOLUNTEER';
  },

  requireVolunteer: function() {
    if (!this.isAuthenticated()) {
      window.location.href = 'volunteer-login.html';
      return;
    }
    if (!this.isVolunteer()) {
      this.signOut();
      alert("Access Denied: You must be a registered Volunteer to access this page.");
      window.location.href = 'volunteer-login.html';
    }
  }
};
