import fetch from 'node-fetch';

export type GoogleTokens = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};

export class GoogleOAuthService {
  private clientId = process.env.OAUTH_GOOGLE_CLIENT_ID || '';
  private clientSecret = process.env.OAUTH_GOOGLE_CLIENT_SECRET || '';
  private redirectUri = process.env.OAUTH_GOOGLE_REDIRECT_URI || '';

  // PUBLIC_INTERFACE
  getAuthUrl(state?: string): string {
    /** Returns Google OAuth consent URL. */
    const base = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      ...(state ? { state } : {}),
    });
    return `${base}?${params.toString()}`;
  }

  // PUBLIC_INTERFACE
  async exchangeCode(code: string): Promise<GoogleTokens> {
    /** Exchanges authorization code for tokens. */
    const url = 'https://oauth2.googleapis.com/token';
    const body = new URLSearchParams({
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code',
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      throw new Error(`Google token exchange failed: ${res.status}`);
    }
    return (await res.json()) as GoogleTokens;
  }

  // PUBLIC_INTERFACE
  async getUserInfo(accessToken: string): Promise<{ sub: string; email: string; name?: string; picture?: string }> {
    /** Fetches Google userinfo. */
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Google userinfo failed: ${res.status}`);
    return (await res.json()) as any;
  }
}

export const googleOAuth = new GoogleOAuthService();
