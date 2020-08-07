package com.google.musicanalysis.cache;

import com.google.musicanalysis.types.*;
import com.google.musicanalysis.util.Secrets;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.EOFException;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.CipherOutputStream;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SealedObject;
import javax.crypto.spec.SecretKeySpec;
import java.time.Instant;

enum FileStatus {
  SUCCESS,
  CREATED,
  EXISTS
}

/** Implementation of server side cache that stores API requests to save time and API quota. */
public class AnalysisCache {
  private static final String CACHE_FILE = "cachedData.txt";
  private static final long ONE_DAY_IN_SECONDS = 24 * 60 * 60;

  private static HashMap<String, CacheValue> cacheMap = new HashMap<String, CacheValue>();
  private static Cipher cipher;
  private static FileStatus currentFileStatus;

  private static volatile AnalysisCache AnalysisCacheObject;

  private AnalysisCache() throws NoSuchAlgorithmException, NoSuchPaddingException {
    this.cipher = Cipher.getInstance("Blowfish");
    currentFileStatus = createFile();
  }

  // Singleton paradigm ensures cache can only be loaded once
  public static AnalysisCache getInstance()
      throws NoSuchAlgorithmException, NoSuchPaddingException {
    if (AnalysisCacheObject == null) {
      // Ensures thread safe
      synchronized (AnalysisCache.class) {
        if (AnalysisCacheObject == null) {
          AnalysisCacheObject = new AnalysisCache();
        }
      }
    }
    return AnalysisCacheObject;
  }
  
  /**
   * Loads the cache hashmap from the cache file
   */
  public static void loadCache()
      throws InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
    try {
      cipher.init(Cipher.DECRYPT_MODE, generateKey());
      CipherInputStream inFile =
          new CipherInputStream(new BufferedInputStream(new FileInputStream(CACHE_FILE)), cipher);
      ObjectInputStream inData = null;
      try {
        //double wrapping to determine if there's data to read
        inData = new ObjectInputStream(inFile);
        SealedObject encodedResponse = (SealedObject) inData.readObject();
        inData.close();
        cacheMap = (HashMap<String, CacheValue>) encodedResponse.getObject(cipher);
      } catch(EOFException err) {
        inFile.close();
        return;
      }
      inFile.close();
    } catch (IOException e) {
      e.printStackTrace();
      return;
    } catch (ClassNotFoundException c) {
      c.printStackTrace();
      return;
    }
  }

  /**
   * Saves and writes the cache hashmap into the file
   */
  public static void saveCache() throws InvalidKeyException, IllegalBlockSizeException {
    try {
      cipher.init(Cipher.ENCRYPT_MODE, generateKey());
      SealedObject sealedObject = new SealedObject(cacheMap, cipher);
      CipherOutputStream outFile =
          new CipherOutputStream(
              new BufferedOutputStream(new FileOutputStream(CACHE_FILE)), cipher);
      ObjectOutputStream outData = new ObjectOutputStream(outFile);
      outData.writeObject(sealedObject);
      outData.close();
      outFile.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  /**
   * Cleans entries that are a day or more old
   */
  public static void cleanDayOldEntries() {
    long now = Instant.now().getEpochSecond();

    for (Map.Entry cachePair : cacheMap.entrySet()) { 
      CacheValue currentCachedData = (CacheValue)cachePair.getValue();
      long timeOfCacheEntry = currentCachedData.timestamp.getEpochSecond();
      if (now - timeOfCacheEntry >= ONE_DAY_IN_SECONDS) {
        delete((String)cachePair.getKey());
      }
    } 
  }

  /**
   * Adds a value to the cache
   *
   * @param requestUrl the request url
   * @param responseData a VideoAnalysis object with all the data
   */
  public static void add(String requestUrl, VideoAnalysis responseData) {
    cacheMap.put(requestUrl, new CacheValue(responseData));
  }
 
  /**
   * Retrieves a value from the cache
   *
   * @param requestUrl the request url
   * @return a cached value pair
   */
  public static CacheValue retrieve(String requestUrl) {
    // map.get() returns null if not match
    return cacheMap.get(requestUrl);
  }

  /**
   * Deletes a value from the cache
   *
   * @param requestUrl the request url
   */
  public static void delete(String requestUrl) {
    cacheMap.remove(requestUrl);
  }

  private static FileStatus createFile() {
    try {
      File file = new File(CACHE_FILE);
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

  private static SecretKeySpec generateKey() throws IOException {
    String key = Secrets.getSecretString("CACHE_ENCRYPTION_KEY");
    byte[] keyData = key.getBytes();
    SecretKeySpec keySpec = new SecretKeySpec(keyData, "Blowfish");
    return keySpec;
  }
}
