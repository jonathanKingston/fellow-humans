var blackListTags = [
  'script',
  'style'
];
var matchStrings = [
  {
    match: /\b(immigrant|migrant)(s)?\b/gi,
    replaceWith: 'fellow human',
    plural: 2
  },
  {
    match: /\b(immigration|migration)(s)?\b/gi,
    replaceWith: 'movement',
    plural: 2
  },
  {
    match: /\bmigrate(s)?\b/gi,
    replaceWith: 'move',
    plural: 1
  },
  {
    match: /\bmigrated\b/gi,
    replaceWith: 'moved',
    plural: false
  }
];

function processNode(node) {
  var childNode = node.lastChild;

  if (isBlackListedTag(node)) {
    return;
  }

  while (childNode) {
    walkDOM(childNode);
    childNode = childNode.previousSibling;
  }
}

function isBlackListedTag(node) {
  if (node.tagName && blackListTags.indexOf(node.tagName.toLowerCase()) !== -1) {
    return true;
  }
  return false;
}

function walkDOM(node) {
  switch (node.nodeType) {
    // Text
    case 3:
      if (!isBlackListedTag(node.parentElement)) {
        checkAndChangeText(node);
      }
      break;
    // Elements and documents
    case 1:
    case 9:
      processNode(node);
      break;
  }
}

function upperCaseFirst(string) {
  return string[0].toUpperCase() + string.slice(1);
}

function isSentenceCase(string) {
  if (sentenceCase(string,3) === string || sentenceCase(string, 1) === string) {
    return true;
  }
  return false;
}

function sentenceCase(string, limit) {
  var parts = string.split(/\s/);
  var sentence = [];
  parts.forEach(function (part) {
    var partOutput = part;
    if (part.length >= limit) {
      partOutput = upperCaseFirst(part);
    }
    sentence.push(partOutput);
  });

  return sentence.join(' ');
}

function checkAndChangeText(textNode) {
  var nodeValue = textNode.nodeValue;
  var result = changeAllInstances(nodeValue);

  if (result) {
    textNode.nodeValue = result;
  }
}

function checkAndChangeTitle() {
  var titleText = document.title;
  var result = changeAllInstances(titleText);

  if (result) {
    document.title = result;
  }
}

function changeAllInstances(textString) {
  var matches = false;
  
  matchStrings.forEach(function (matchString) {
    textString = textString.replace(matchString.match, function () {
      var plural = false;
      var string = arguments[arguments.length - 1];
      matches = true;

      if (matchString.plural && arguments[matchString.plural]) {
        plural = true;
      }

      return replaceText(arguments[0], matchString.replaceWith, string, plural);
    });
  });

  if (matches) {
    return textString;
  }
  return false;
}

function replaceText(match, replaceWith, textString, plural) {
  if (plural) {
    replaceWith += 's';
  }

  if (match === match.toLowerCase()) {
    return replaceWith;
  } else if (match[1].toLowerCase() !== match[1]) {
    return replaceWith.toUpperCase();
  } else if(isSentenceCase(textString)) {
    return sentenceCase(replaceWith);
  } else if (match[0].toLowerCase() !== match[0]) {
    return upperCaseFirst(replaceWith);
  } 

  return replaceWith;
}

walkDOM(document.body);
checkAndChangeTitle();

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type === 'childList') {
      walkDOM(mutation.target);
    }
  });    
});
 
var config = {
  attributes: false,
  childList: true,
  characterData: false,
  subtree: true
};
 
observer.observe(document.body, config);
