# crew_rd_team
A fully equipped research and development team armed with the tools for scripting extensively deep research and unorthodox workarounds to tackle any job scope question or case and provide a multitude of dynamic solutions

## Android release signing

Tagged builds (`v*`) sign the APK with a release keystore supplied through repository secrets. Branch builds still produce a debug APK.

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded `.keystore` or `.jks` file |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |

Create a keystore and encode it for the secret:

```sh
keytool -genkeypair -v -keystore crew-rd-release.keystore \
  -alias crew-rd -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 crew-rd-release.keystore > crew-rd-release.keystore.b64
# macOS: base64 -i crew-rd-release.keystore | tr -d '\n'
```

Keep the keystore and passwords somewhere safe: Android only accepts updates signed with the same key. Add the four values under the repository's **Settings → Secrets and variables → Actions**. Without them, a `v*` tag fails before uploading an APK instead of publishing a debug-signed build.

To sign a release build locally, point Gradle at the keystore:

```sh
cd android
ANDROID_KEYSTORE_PATH=/absolute/path/crew-rd-release.keystore \
ANDROID_KEYSTORE_PASSWORD=... ANDROID_KEY_ALIAS=crew-rd ANDROID_KEY_PASSWORD=... \
  ./gradlew assembleRelease
```
