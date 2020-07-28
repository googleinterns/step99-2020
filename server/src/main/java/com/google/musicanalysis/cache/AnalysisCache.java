package com.google.musicanalysis.cache;

import com.google.musicanalysis.types.*;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.HashMap;

enum FileStatus {
  SUCCESS,
  CREATED,
  EXISTS
}

/** Implementation of server side cache that stores API requests to save time and API quota. */
public class AnalysisCache {
  private HashMap<String, AnalysisGroup> responseMap;

  /* Constructor */
  public AnalysisCache() {
    this.responseMap = new HashMap<String, AnalysisGroup>();
  }

  /** Loads the cache file so that the code can manipulate its contents */
  public void loadCache() {
    try {
      FileInputStream inFile = new FileInputStream("cachedData.txt");
      ObjectInputStream inData = new ObjectInputStream(inFile);
      responseMap = (HashMap<String, AnalysisGroup>) inData.readObject();
      inData.close();
      inFile.close();
    } catch (IOException e) {
      e.printStackTrace();
      return;
    } catch (ClassNotFoundException c) {
      c.printStackTrace();
      return;
    }
  }

  /** Closes the cache file and stores it */
  public void saveCache() {
    try {
      FileOutputStream outFile = new FileOutputStream("cachedData.txt");
      ObjectOutputStream outData = new ObjectOutputStream(outFile);
      outData.writeObject(this.responseMap);
      outData.close();
      outFile.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  /**
   * Adds a <query, responseData> pair to the cache
   *
   * @param requestQuery the query string from the requestURL
   * @param responseData the response data associated with the query
   */
  public void add(String requestQuery, AnalysisGroup responseData) {
    this.responseMap.put(requestQuery, responseData);
  }

  /**
   * Searches for a match in the cache given a query string.
   *
   * @param requestQuery the query string from the requestURL
   */
  public AnalysisGroup search(String requestQuery) {
    // map.get() returns null if not match
    return this.responseMap.get(requestQuery);
  }

  /**
   * Deletes a key, value pair from the cache given a query string.
   *
   * @param requestQuery the query string from the requestURL
   */
  public void delete(String requestQuery) {
    this.responseMap.remove(requestQuery);
  }

  private int createFile() {
    // TODO: use this function to to create a file for the cache if needed.
    //       This will allow for multiple cache files for different types of
    //       data.
    try {
      File file = new File("cachedData.txt");
      if (file.createNewFile()) {
        return FileStatus.CREATED;
      } else {
        return FileStatus.EXISTS;
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
    return FileStatus.SUCCESS;
  }
}
