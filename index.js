
require("express");

var fs = require('fs');
var path = require('path');
var pjsonPath = path.join(__dirname, 'package.json');
var pjson = require(pjsonPath);

var sources = {
	include: ["."],
	exclude: ["node_modules"]
};

var contents = "";
sources.include.forEach(function(dir){
	var absPath = path.join(__dirname, dir);
	mergeDirSources(absPath);
});

var found = false;
console.log('detecting unused modules.. ');
for(dep in pjson.dependencies) {
	var pattern = 'require( *)\((.*)'+ dep + '\)(.*)';
	var reg = new RegExp(pattern, 'm');
	if (!reg.test(contents)) {
		found = true;
		console.log(dep);
	}
}

if (!found) {
	console.log('each module is used, good job bro!');
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