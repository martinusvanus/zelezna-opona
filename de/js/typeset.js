// https://github.com/ekalinin/typogr.js/blob/master/typogr.js
// (\s+(?:<(?:a|em|span|strong|i|b)[^>]*?>)*?[^\s<>]+(?:<\/(?:a|em|span|strong|i|b)[^>]*?>)*\s+(?:<(?:a|em|span|strong|i|b)[^>]*?>)*?[^\s<>]+(?:<\/(?:a|em|span|strong|i|b)[^>]*?>)*)(?:\s+)([^<>\s]+(?:\s*<\/(?:a|em|span|strong|i|b)[^>]*?>\s*\.*)*?(?:\s*?<\/(?:p|h[1-6]|li|dt|dd)>|$))
var inlineTags = 'a|em|span|strong|i|b';
var fixWidows = (text) => {

  //   (?:
  //     <
  //       (?:${inlineTags})
  //       [^>]*?
  //     >
  //   )*?
  //   [^\\s<>]+
  //   (?:
  //     </
  //       (?:${inlineTags})
  //       [^>]*?
  //     >
  //   )*?
  var word = '(?:<(?:' + inlineTags + ')[^>]*?>)*?[^\\s<>]+(?:</(?:' + inlineTags + ')[^>]*?>)*?';

  var widow = '(' + // matching group 1
                '\\s+' + word + // space and a word with a possible bordering tag (match eg.: " word</tag>")
                '\\s+' + word + // space and a word with a possible bordering tag (match eg.: " word</tag>", together (match eg.: " word</tag> word")
                ')' +
                '(?:\\s+)' + // one or more space characters
                '(' + // matching group 2
                '[^<>\\s]+' + // nontag/nonspace characters
                '(?:\\s*</(?:' + inlineTags + ')[^>]*?>\\s*\\.*)*?' + // one or more inline closing tags, can be surrounded by spaces and followed by a period.
                '(?:\\s*?</(?:p|h[1-6]|li|dt|dd)>|$)' + // allowed closing tags or end of line
                ')';

  return text.replace(new RegExp(widow, 'gi'), '$1&nbsp;$2');
};


var fixOneChar = (text) => {
  // https://regexr.com/4apd3
  var oneChar = '((?:\\s|&nbsp;|<(?:/|' + inlineTags + '){1}[^>]+>[^<>\\s]*)(?:\\s|&nbsp;)*[a-ž0-9]{1}[\\.\\,]*?)\\s';

  return text.replace(new RegExp(oneChar, 'gi'), '$1&nbsp;').replace(new RegExp(oneChar, 'gi'), '$1&nbsp;');
};

var typeset = (text) => {

  if (text && text.length > 3) {
    var newText = text;
    newText = fixWidows(newText);
    newText = fixOneChar(newText);

    return newText;
  }

  return text || '';

};
