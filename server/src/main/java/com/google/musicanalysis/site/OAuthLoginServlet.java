package com.google.musicanalysis.site;

import java.io.IOException;
import java.math.BigInteger;
import java.net.URLEncoder;
import java.security.SecureRandom;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/oauth/login/*")
public class OAuthLoginServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {
    var path = req.getPathInfo().substring(1);

    if (path == null) {
      res.setStatus(404);
      return;
    }

    // URI that user should be redirected to after logging in
    var redirectUri = System.getenv().get("OAUTH_CALLBACK_URI");
    // redirect to OAuth landing page
    var oauthLoginUri = new StringBuilder();

      // generate a nonce to prevent CSRF
    var state = new BigInteger(130, new SecureRandom()).toString(32);
    var session = req.getSession(true);
    session.setAttribute("oauth:state", state);

    if (path.equalsIgnoreCase("spotify")) {
      session.setAttribute("oauth:service", "spotify");

      oauthLoginUri.append("https://accounts.spotify.com/authorize");
      oauthLoginUri.append("?client_id=");
      oauthLoginUri.append(Constants.SPOTIFY_CLIENT_ID);
      oauthLoginUri.append("&response_type=code");
      oauthLoginUri.append("&scope=");
      oauthLoginUri
          .append(URLEncoder.encode("user-read-private user-top-read user-library-read", "UTF-8"));
      oauthLoginUri.append("&state=");
      oauthLoginUri.append(state);
    } else if (path.equalsIgnoreCase("youtube")) {
      session.setAttribute("oauth:service", "youtube");

      oauthLoginUri.append("https://accounts.google.com/o/oauth2/v2/auth");
      oauthLoginUri.append("?client_id=");
      oauthLoginUri.append(Constants.YOUTUBE_CLIENT_ID);
      oauthLoginUri.append("&response_type=code");
      oauthLoginUri.append("&scope=");
      oauthLoginUri
          .append(URLEncoder.encode("https://www.googleapis.com/auth/youtube.readonly", "UTF-8"));
      oauthLoginUri.append("&state=");
      oauthLoginUri.append(state);
    } else {
      res.setStatus(404);
      return;
    }


    oauthLoginUri.append("&redirect_uri=");
    oauthLoginUri.append(URLEncoder.encode(redirectUri, "UTF-8"));

    res.sendRedirect(oauthLoginUri.toString());

  }
}
