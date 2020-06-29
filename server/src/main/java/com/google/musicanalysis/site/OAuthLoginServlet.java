package com.google.musicanalysis.site;

import com.google.musicanalysis.util.Constants;
import com.google.musicanalysis.util.URLEncodedBuilder;
import java.io.IOException;
import java.math.BigInteger;
import java.security.SecureRandom;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public abstract class OAuthLoginServlet extends HttpServlet {
  /** @return The name of this OAuth service. Used for storing session cookies and the like. */
  protected abstract String getServiceName();

  /** @return The client ID for this OAuth provider. */
  protected abstract String getClientId();

  /** @return The OAuth scopes that are to be requested. */
  protected abstract String[] getScopes();

  /** @return The URI of the OAuth provider's login page. */
  protected abstract String getAuthUri();

  /** @return The URI of the page the user is redirected to after logging in. */
  protected abstract String getRedirectUri();

  protected String getSessionServiceKey() {
    return Constants.SESSION_KEY_SPOTIFY;
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {
    // generate a nonce to prevent CSRF
    var state = new BigInteger(130, new SecureRandom()).toString(32);
    var session = req.getSession(true);

    session.setAttribute(getSessionServiceKey(), state);

    var oauthLoginUriBase = getAuthUri();
    var params =
        new URLEncodedBuilder()
            .add("client_id", getClientId())
            .add("scope", String.join(" ", getScopes()))
            .add("response_type", "code")
            .add("state", state)
            .add("redirect_uri", getRedirectUri())
            .build();

    // redirect to OAuth landing page
    res.sendRedirect(oauthLoginUriBase + "?" + params);
  }
}
