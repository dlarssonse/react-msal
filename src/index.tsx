import * as Msal from "msal";
import { useState } from "react";
import Cookies from "universal-cookie";

export type Props = {
  config: {
    auth: {
      clientId: string;
      authority?: string;
      redirectUri?: string;
    };
    cache: {
      cacheLocation?: "localStorage" | "sessionStorage";
      storeAuthStateInCookie?: boolean;
    };
  };
  loginType?: "REDIRECT" | "POPUP";
  scopes?: string[];
};

/**
 *
 * @param param0
 */
export const useReactMSAL = ({
  config,
  scopes = ["openid", "user.read", "email"],
  loginType = "POPUP"
}: Props) => {
  if (!config.auth.authority)
    config.auth.authority = "https://login.microsoftonline.com/common";
  if (!config.auth.redirectUri) window.location.origin;

  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const myMSALObj = new Msal.UserAgentApplication(config);

  /**
   *
   * @param errorCode
   */
  function requiresInteraction(errorCode: any) {
    if (!errorCode || !errorCode.length) {
      return false;
    }
    return (
      errorCode === "consent_required" ||
      errorCode === "interaction_required" ||
      errorCode === "login_required"
    );
  }

  /**
   *
   */
  const login = async () => {
    if (loginType === "REDIRECT") {
      await myMSALObj.loginRedirect({ scopes });
    } else {
      if (!myMSALObj.getAccount()) await myMSALObj.loginPopup({ scopes });
      const { accessToken, error } = await acquireAccessToken();
      if (accessToken && !error) setAccessToken(accessToken);
    }
  };

  /**
   *
   */
  const logout = async () => {
    const cookies = new Cookies();

    const keys: string[] = [];
    keys.push("msal.idtoken");
    keys.push("msal.error");
    keys.push("msal.error.description");
    keys.push("msal.client.info");
    keys.push(`msal.${process.env.MS_CLIENT_ID}.idtoken`);
    keys.push(`msal.${process.env.MS_CLIENT_ID}.error`);
    keys.push(`msal.${process.env.MS_CLIENT_ID}.error.description`);
    keys.push(`msal.${process.env.MS_CLIENT_ID}.client.info`);

    for (let key in keys) {
      if (cookies.get(key)) cookies.remove(key, { path: "/" });
      if (localStorage.getItem(key)) localStorage.removeItem(key);
    }
  };

  /**
   *
   */
  const acquireAccessToken = async () => {
    let tokenResponse;
    try {
      tokenResponse = await myMSALObj.acquireTokenSilent({ scopes });
    } catch (error) {
      if (requiresInteraction(error.errorCode)) {
        try {
          tokenResponse = await myMSALObj.acquireTokenPopup({ scopes });
        } catch (error) {
          return { accessToken: null, error };
        }
      } else {
        return { accessToken: null, error };
      }
    }

    if (tokenResponse)
      return { accessToken: tokenResponse.accessToken, error: null };
    return { accessToken: null, error: null };
  };

  return { login, logout, accessToken };
};

export default useReactMSAL;
