package com.google.musicanalysis.util;

import com.google.cloud.secretmanager.v1.SecretManagerServiceClient;
import com.google.cloud.secretmanager.v1.SecretVersionName;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

public final class Secrets {
  private static Object SYNC_OBJECT = new Object();
  private static SecretManagerServiceClient CLIENT;

  private static SecretManagerServiceClient getClient() throws IOException {
    var localRef = CLIENT;

    if (localRef == null) {
      synchronized (SYNC_OBJECT) {
        localRef = CLIENT;
        if (localRef == null) {
          CLIENT = localRef = SecretManagerServiceClient.create();
        }
      }
    }

    return localRef;
  }

  public static byte[] getSecretBytes(String name) throws IOException {
    var secretClient = getClient();
    var secretVersionName = SecretVersionName.of("capstone-t99-2020", name, "latest");
    return secretClient.accessSecretVersion(secretVersionName).getPayload().getData().toByteArray();
  }

  public static String getSecretString(String name) throws IOException {
    return new String(getSecretBytes(name), StandardCharsets.UTF_8);
  }
}
