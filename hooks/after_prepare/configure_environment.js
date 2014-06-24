#!/usr/bin/env node

var fs      = require('fs'),
    path    = require('path'),
    rootdir = process.argv[2];


if (process.env.TARGET) {
    var src_file = path.join(rootdir, 'config', 'config-' + process.env.TARGET + '.js'),
        files_to_replace = {
            'android': 'platforms/android/assets/www/js/config.js',
            'ios': 'platforms/ios/www/js/config.js'
        },
        platform, dest_file;

    for (platform in files_to_replace) {
        if (files_to_replace.hasOwnProperty(platform)) {
            dest_file = path.join(rootdir, files_to_replace[platform]);

            if (fs.existsSync(src_file)) {
                fs.createReadStream(src_file).pipe(fs.createWriteStream(dest_file));
            } else {
                throw "Missing config file: " + src_file;
            }
        }
    }
}