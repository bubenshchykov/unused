
require("express");

var fs = require('fs');
var path = require('path');
var pjsonPath = path.join(__dirname, 'package.json');
var pjson = require(pjsonPath);

var sources = {
	include: [""],
	exclude: ["node_modules", ".git"]
};

var contents = "";
sources.include.forEach(function(dir){
	var absPath = path.join(__dirname, dir);
	mergeDirSources(absPath);
});

console.log('detecting unused dependencies.. ');
for(module in pjson.dependencies) {
	detect(module);
}
console.log('detecting unused devDependencies.. ');
for(module in pjson.devDependencies) {
	detect(module);
}

function detect(module) {
	var pattern = 'require( *)\((.*)'+ module + '\)(.*)';
	var reg = new RegExp(pattern, 'm');
	if (!reg.test(contents)) {
		console.log(module);
	}
}

function mergeDirSources(dir) {
	var entries = fs.readdirSync(dir);
	entries.forEach(function (filename) {
		var abspath = path.join(dir, filename);
		var stat = fs.statSync(abspath);
		if (stat.isFile()) {
			var content = fs.readFileSync(abspath);
			contents += content;
		} else if (stat.isDirectory() && !isExcluded(abspath)) {
			mergeDirSources(abspath);
		}
	});
}

function isExcluded(abspath){
	var excluded = sources.exclude.map(function(ex){
		return path.join(__dirname, ex);
	});
	return excluded.indexOf(abspath) !== -1;
}