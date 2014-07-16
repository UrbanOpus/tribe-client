# Pre-reqs, setting up Cordova

Install cordova, ionic and gulp like so:

```
npm install -g cordova ionic gulp
```

Install dependencies by running

```
npm install
gulp install
```

Install android dependencies via SDK and add it to path

And finally

```
ionic platform add android
```


### Optional (Setup Emulator)

You're probably using an x86 thing, so use this

```
android create avd -n tribe -t 33
```

### To Build

```
ionic build android
```

The platform must be specified with ionic (unlike cordova)

### To Run

```
ionic emulate android
```

To run on ios, replace `android` with `ios` above (except for the emulator setup)