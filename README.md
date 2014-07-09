# Pre-reqs, setting up Cordova

Install cordova like so:

```
npm install -g cordova
```

Install android dependencies via SDK and add it to path

And finally

```
cordova create tribe net.urbanopus.tribe Tribe
cordova platform add android
cordova platform add ios
```


### Optional (Setup Emulator)

You're probably using an x86 thing, so use this

```
android create avd -n tribe -t 33
```

### To Build

```
cordova build
```

### To Run

```
cordova emulate android
```
