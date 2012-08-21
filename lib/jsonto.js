var comun = require('comun');

exports.csv = function(data) {
   var text = '';

   comun.loop(data[0], function(prop, val) {
      text += '"' + prop + '" , ';
   });
   text = text.substring(0, text.length - 2);
   text += '\r\n';
   
   comun.loop(data, function(i,item) {
      comun.loop(item, function(prop, val, obj) {
         text += '"' + val + '" , ';
         console.log(obj);
      });
      text = text.substring(0, text.length - 2);
      text += '\r\n';
   });

   return text;
};

/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
	Author:  Stefan Goessner/2006
	Web:     http://goessner.net/ 
*/
exports.xml = function(o, tab) {
   var toXml = function(v, name, ind) {
      if (name === '_id') {
         name = 'mongoID';
      }

      var xml = "";
      if (v instanceof Array) {
         for (var i=0, n=v.length; i<n; i++)
            xml += ind + toXml(v[i], name, ind+"\t") + "\n";
      }
      else if (typeof(v) == "object") {
         var hasChild = false;
         xml += ind + "<" + name;
         for (var m in v) {
            if (m.charAt(0) == "@")
               xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
            else
               hasChild = true;
         }
         xml += hasChild ? ">" : "/>";
         if (hasChild) {
            for (var m in v) {
               if (m == "#text")
                  xml += v[m];
               else if (m == "#cdata")
                  xml += "<![CDATA[" + v[m] + "]]>";
               else if (m.charAt(0) != "@")
                  xml += toXml(v[m], m, ind+"\t");
            }
            xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
         }
      }
      else {
         xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
      }
      return xml;
   }, xml="";
   for (var m in o)
      xml += toXml(o[m], 'item', "");
   return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}