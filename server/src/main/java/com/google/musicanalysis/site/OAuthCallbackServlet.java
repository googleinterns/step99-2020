package com.google.musicanalysis.site;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.JsonParser;
import com.google.musicanalysis.util.Secrets;
import com.google.musicanalysis.util.URLEncodedBuilder;

@WebServlet("/api/oauth/callback")
public class OAuthCallbackServlet extends HttpServlet {
  private static final Logger LOGGER = Logger.getLogger(OAuthCallbackServlet.class.getName());
  
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

    var sessionOauthState = req.getSession().getAttribute("oauth:state");
    var sessionOauthService = req.getSession().getAttribute("oauth:service");

    if (!state.equals(sessionOauthState)) {
      res.setStatus(401);
      return;
    }

    String clientSecret;
    String clientId;
    URI tokenUri;

    if (sessionOauthService.equals("youtube")) {
      clientSecret = Secrets.getSecretString("YOUTUBE_CLIENT_SECRET");
      clientId = Constants.YOUTUBE_CLIENT_ID;
      tokenUri = URI.create("https://oauth2.googleapis.com/token");
    } else if (sessionOauthService.equals("spotify")) {
      clientSecret = Secrets.getSecretString("SPOTIFY_CLIENT_SECRET");
      clientId = Constants.SPOTIFY_CLIENT_ID;
      tokenUri = URI.create("https://accounts.spotify.com/api/token");
    } else {
      res.setStatus(400);
      return;
    }

     // URI that user should be redirected to after logging in
     URI domainUri;

     try {
       domainUri = new URI(System.getenv().get("DOMAIN"));
     } catch (URISyntaxException e) {
       LOGGER.severe("The DOMAIN environment variable is invalid.");
       res.setStatus(500);
       return;
     } catch (NullPointerException e) {
       LOGGER.severe("The DOMAIN environment variable is not set.");
       res.setStatus(500);
       return;
     }

    var redirectUri = domainUri.resolve("/api/oauth/callback");

    var tokenReqBody = new URLEncodedBuilder()
      .add("grant_type", "authorization_code")
      .add("code", code)
      .add("redirect_uri", redirectUri.toString())
      .add("client_id", clientId)
      .add("client_secret", clientSecret);

    var httpClient = HttpClient.newHttpClient();
    var tokenReq = HttpRequest.newBuilder(tokenUri)
        .header("Content-Type", "application/x-www-form-urlencoded")
        .POST(BodyPublishers.ofString(tokenReqBody.build())).build();

    var tokenRes = httpClient.sendAsync(tokenReq, BodyHandlers.ofString()).join();
    var tokenResBody = tokenRes.body();

    var tokenResObj = JsonParser.parseString(tokenResBody).getAsJsonObject();
    var accessToken = tokenResObj.get("access_token");

    res.setContentType("text/html");
    res.getWriter().printf("<h1>the access token for %s is %s</h1>", sessionOauthService, accessToken);
  }
}
