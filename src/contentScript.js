var blockListTags = [
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

var observerConfig = {
  attributes: false,
  childList: true,
  characterData: false,
  subtree: true
};

function processNode(node) {
  var childNode = node.lastChild;

  if (isBlockListedTag(node)) {
    return;
  }

  while (childNode) {
    walkDOM(childNode);
    childNode = childNode.previousSibling;
  }
}

function isBlockListedTag(node) {
  return Boolean(node && node.tagName && blockListTags.indexOf(node.tagName.toLowerCase()) !== -1);
}

function walkDOM(node) {
  switch (node.nodeType) {
    case 3:
      if (!isBlockListedTag(node.parentElement)) {
        checkAndChangeText(node);
      }
      break;
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
  return sentenceCase(string, 3) === string || sentenceCase(string, 1) === string;
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
  var result = changeAllInstances(textNode.nodeValue);
  if (result) {
    textNode.nodeValue = result;
  }
}

function checkAndChangeTitle(doc) {
  var result = changeAllInstances(doc.title);
  if (result) {
    doc.title = result;
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
  } else if (isSentenceCase(textString)) {
    return sentenceCase(replaceWith);
  } else if (match[0].toLowerCase() !== match[0]) {
    return upperCaseFirst(replaceWith);
  }

  return replaceWith;
}

function createObserver(mutationObserverCtor, callback) {
  return new mutationObserverCtor(callback);
}

function init(doc, mutationObserverCtor) {
  if (!doc || !doc.body || !mutationObserverCtor) {
    return null;
  }

  walkDOM(doc.body);
  checkAndChangeTitle(doc);

  var observer = createObserver(mutationObserverCtor, function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList') {
        walkDOM(mutation.target);
      }
    });
  });

  observer.observe(doc.body, observerConfig);
  return observer;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    blockListTags: blockListTags,
    matchStrings: matchStrings,
    observerConfig: observerConfig,
    processNode: processNode,
    isBlockListedTag: isBlockListedTag,
    walkDOM: walkDOM,
    upperCaseFirst: upperCaseFirst,
    isSentenceCase: isSentenceCase,
    sentenceCase: sentenceCase,
    checkAndChangeText: checkAndChangeText,
    checkAndChangeTitle: checkAndChangeTitle,
    changeAllInstances: changeAllInstances,
    replaceText: replaceText,
    init: init
  };
}

if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
  init(document, MutationObserver);
}
