// Drive API is free to use, no need to hide API key
const apiKey = 'AIzaSyC3wEaP6u8f6yKjraSz_V0rnVYKqc5BvG4';
const clientId =
  '343396465743-1hhob86pkvernjn21l5ui38sl92461cd.apps.googleusercontent.com';
const appId = '343396465743';
const scope = 'https://www.googleapis.com/auth/drive.file';

/* global gapi, google */

/** @type {gapi.auth2.GoogleAuth} */
let auth;

/**
 * Initialize Google authenication.
 *
 * @returns {Promise} A Promise that resolves when the authentication API has
 * been loaded and initialized.
 */
async function initAuthApi() {
  if (auth) return;

  await new Promise((resolve) => gapi.load('client:auth2', resolve));

  await gapi.client.init({
    apiKey,
    clientId,
    scope,
  });

  auth = gapi.auth2.getAuthInstance();
}

/**
 * Initialize Google Picker API.
 *
 * @returns {Promise} A Promise that resolves when the Picker API has been
 * loaded.
 */
async function initPickerApi() {
  if ('google' in window && google.picker) return;

  return new Promise((resolve) => gapi.load('picker', resolve));
}

/**
 * Constructs and shows a Google Drive file picker.
 *
 * @returns {Promise<Blob>} A Promise that resolves when the user picks a file
 * or rejects if they don't pick one. Will resolve with a Blob containing the
 * contents of the file.
 */
export async function showPicker() {
  await initAuthApi();
  await initPickerApi();

  if (!auth.isSignedIn.get()) {
    await auth.signIn();
  }

  const currentUser = auth.currentUser.get();
  const currentUserAuth = currentUser.getAuthResponse();
  const accessToken = currentUserAuth.access_token;

  const pickerView = new google.picker.DocsView(google.picker.ViewId.DOCS)
      .setMimeTypes('application/zip')
      .setIncludeFolders(true)
      .setMode(google.picker.DocsViewMode.LIST);

  return new Promise((resolve, reject) => {
    const picker = new google.picker.PickerBuilder()
        .addView(pickerView)
        .setAppId(appId)
        .setDeveloperKey(apiKey)
        .setOAuthToken(accessToken)
        .setCallback(async (response) => {
          switch (response.action) {
            case google.picker.Action.CANCEL:
              reject(new Error('User canceled the operation.'));
              break;
            case google.picker.Action.PICKED: {
              const {id} = response.docs[0];

              const download = await fetch(
                  // eslint-disable-next-line max-len
                  `https://www.googleapis.com/drive/v3/files/${id}?key=${apiKey}&alt=media`,
                  {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  },
              );

              download.blob().then(resolve);
              break;
            }
          }
        })
        .build();

    picker.setVisible(true);
  });
}
