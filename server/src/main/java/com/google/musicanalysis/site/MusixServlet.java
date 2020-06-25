package com.google.musicanalysis.site;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/musix")
public class MusixServlet extends HttpServlet {
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {
    res.getWriter().write("<h1>See below api data:\n\n</h1>");

    // Setup variables, these will be given by the front end
    String trackName = "Baby";
    String artistName = "Justin Bieber";
    String trackId = "32184842";
    String use = "track.search";
    ParametersBuilder params;
    RequestBuilder request;

    // Getting id from song and artist name
    res.getWriter().write("\n<h3>Getting id from song and artist name</h3>");
    params = new ParametersBuilder(use, trackName, artistName);
    request = new RequestBuilder(use, params.filter());
    res.getWriter().println(request.grabResponse());

    // Getting lyrics from a given id
    res.getWriter().write("\n<h3>Getting lyrics from given id</h3>");
    use = "track.lyrics.get";
    params = new ParametersBuilder(use, trackId);
    request = new RequestBuilder(use, params.filter());
    res.getWriter().println(request.grabResponse());
  }
}
