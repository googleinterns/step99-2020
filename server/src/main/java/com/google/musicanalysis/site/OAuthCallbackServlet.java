package com.google.musicanalysis.site;

import com.google.gson.JsonParser;
import com.google.musicanalysis.util.URLEncodedBuilder;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public abstract class OAuthCallbackServlet extends HttpServlet {
  /** @return The name of this OAuth service. Used for storing session cookies and the like. */
  protected abstract String getServiceName();

  /** @return The client ID for this OAuth provider. */
  protected abstract String getClientId();

  /** @return The client secret for this OAuth provider. */
  protected abstract String getClientSecret();

  /** @return The URI of the OAuth provider's token generator. */
  protected abstract String getTokenUri();

  /**
   * @return The URI of the page the user is redirected to after logging in. Should be the same as
   *     the URI of this servlet.
   */
  protected abstract String getRedirectUri();

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {
    var code = req.getParameter("code");
    var error = req.getParameter("error");
    var state = req.getParameter("state");

    // OAuth provider gave us an error
    if (error != null && !error.isEmpty()) {
      res.getWriter().print(error);
      res.setStatus(401);
      return;
    }

    // OAuth provider should have given us a code, otherwise something is wrong here
    if (code == null || code.isEmpty()) {
      res.setStatus(400);
      return;
    }

    var sessionOauthState =
        (String) req.getSession().getAttribute("oauth-state-" + getServiceName());

    if (!state.equals(sessionOauthState)) {
      res.setStatus(401);
      return;
    }

    var tokenReqBody =
        new URLEncodedBuilder()
            .add("grant_type", "authorization_code")
            .add("code", code)
            .add("redirect_uri", getRedirectUri())
            .add("client_id", getClientId())
            .add("client_secret", getClientSecret());

    var httpClient = HttpClient.newHttpClient();
    var tokenReq =
        HttpRequest.newBuilder(URI.create(getTokenUri()))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(BodyPublishers.ofString(tokenReqBody.build()))
            .build();

    var tokenRes = httpClient.sendAsync(tokenReq, BodyHandlers.ofString()).join();
    var tokenResBody = tokenRes.body();

    var tokenResObj = JsonParser.parseString(tokenResBody).getAsJsonObject();
    var accessToken = tokenResObj.get("access_token");

    res.setContentType("text/html");
    res.getWriter().printf("<h1>the access token for %s is %s</h1>", getServiceName(), accessToken);
  }
}
