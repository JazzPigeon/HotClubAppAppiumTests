# apps/

Put your iOS build here.

- **Simulator builds** use the `.app` bundle (a folder). Build it from Xcode with a
  Simulator destination, or grab it from
  `~/Library/Developer/Xcode/DerivedData/<YourApp>/Build/Products/Debug-iphonesimulator/MyApp.app`.
- **Real-device builds** use a signed `.ipa`.

By default `wdio.conf.js` looks for `apps/MyApp.app`. Either rename your build to
`MyApp.app`, or point at it explicitly:

```bash
IOS_APP=/absolute/path/to/YourApp.app npm test
```
