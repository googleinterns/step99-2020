package com.google.musicanalysis.site;

import java.io.IOException;
import java.math.BigInteger;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.musicanalysis.util.URLEncodedBuilder;

@WebServlet("/api/oauth/login/*")
public class OAuthLoginServlet extends HttpServlet {
  private static final Logger LOGGER = Logger.getLogger(OAuthLoginServlet.class.getName());

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {
    var path = req.getPathInfo().substring(1);

    if (path == null) {
      res.setStatus(404);
      return;
    }

    // URI that user should be redirected to after logging in
    URI domainUri;

    try {
      domainUri = new URI(System.getenv().get("DOMAIN"));
    } catch (URISyntaxException e) {
      LOGGER.log(Level.SEVERE, "The DOMAIN environment variable is invalid.");
      res.setStatus(500);
      return;
    } catch (NullPointerException e) {
      LOGGER.log(Level.SEVERE, "The DOMAIN environment variable is not set.");
      res.setStatus(500);
      return;
    }

    var redirectUri = domainUri.resolve("/api/oauth/callback");

    String oauthLoginUriBase;
    URLEncodedBuilder oauthLoginUriParams;

    // generate a nonce to prevent CSRF
    var state = new BigInteger(130, new SecureRandom()).toString(32);
    var session = req.getSession(true);
    session.setAttribute("oauth:state", state);

    if (path.equalsIgnoreCase("spotify")) {
      session.setAttribute("oauth:service", "spotify");

      oauthLoginUriBase = "https://accounts.spotify.com/authorize";
      oauthLoginUriParams = new URLEncodedBuilder().add("client_id", Constants.SPOTIFY_CLIENT_ID)
          .add("scope", "user-read-private user-top-read user-library-read");
    } else if (path.equalsIgnoreCase("youtube")) {
      session.setAttribute("oauth:service", "youtube");

      oauthLoginUriBase = "https://accounts.google.com/o/oauth2/v2/auth";
      oauthLoginUriParams = new URLEncodedBuilder().add("client_id", Constants.YOUTUBE_CLIENT_ID)
          .add("scope", "https://www.googleapis.com/auth/youtube.readonly");
    } else {
      res.setStatus(404);
      return;
    }

    oauthLoginUriParams = oauthLoginUriParams.add("response_type", "code").add("state", state)
        .add("redirect_uri", redirectUri.toString());

    // redirect to OAuth landing page
    res.sendRedirect(oauthLoginUriBase + "?" + oauthLoginUriParams.build());
  }
}
