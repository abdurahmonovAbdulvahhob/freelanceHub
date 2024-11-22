const config = require("config");
const jwt = require("jsonwebtoken");

class JwtService {
  constructor(accessKey, refreshKey, accessTime, refreshTime) {
    this.accessKey = accessKey;
    this.refreshKey = refreshKey;
    this.accessTime = accessTime;
    this.refreshTime = refreshTime;
  }

  generateTokens(payload) {
    const accessToken = jwt.sign(payload, this.accessKey, {
      expiresIn: this.accessTime,
    });
    const refreshToken = jwt.sign(payload, this.refreshKey, {
      expiresIn: this.refreshTime,
    });
    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessKey);
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }

  async verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshKey);
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }
}

module.exports = new JwtService(
  config.get("client_access_key"),
  config.get("client_refresh_key"),
  config.get("access_time"),
  config.get("refresh_time")
);
