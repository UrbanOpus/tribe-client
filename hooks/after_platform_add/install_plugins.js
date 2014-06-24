#!/usr/bin/env node

// uses node to install plugin dependencies

var pluginlist = [
    "org.apache.cordova.statusbar"
];

var fs   = require('fs'),
    path = require('path'),
    sys  = require('sys'),
    exec = require('child_process').exec;

function puts(error, stdout, stderr) {
    sys.puts(stdout);
}

pluginlist.forEach(function (plug) {
    exec("cordova plugin add " + plug, puts);
});
