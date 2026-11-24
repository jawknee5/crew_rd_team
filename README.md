# crew_rd_team
A fully equipped research and development team armed with the tools for scripting extensively deep research and unorthodox workarounds to tackle any job scope question or case and provide a multitude of dynamic solutions

## Local setup (Windows)

Install **Node.js LTS** from [nodejs.org](https://nodejs.org/en/download), keeping **Add to PATH** checked. Close and reopen Command Prompt, then verify:

```bat
node -v
npm -v
```

If `npm` is still not recognized, add `C:\Program Files\nodejs` to your user `PATH` and reopen the terminal. Run `npm` directly, not `bash npm`.

From the project folder:

```bat
npm install
npm run dev
```

Open <http://localhost:3000>. To build and launch the desktop app:

```bat
npm run desktop
```

### Ollama preset

Install [Ollama for Windows](https://ollama.com/download), then pull the model once and keep Ollama running (or run `ollama serve`):

```bat
ollama pull llama3.2
ollama list
```

In the app, open **SIM / LIVE AI** → **OLLAMA · LOCAL** → **FIND MODELS** → select `llama3.2:latest` → **TEST CONNECTION** → **SAVE SETTINGS**, then turn **LIVE MODE ON**. No API key is needed; the preset uses `http://127.0.0.1:11434/v1`. Start the app locally — a hosted or cloud preview cannot reach Ollama on your PC.

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
