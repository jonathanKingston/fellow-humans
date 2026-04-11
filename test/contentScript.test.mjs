import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import contentScript from '../src/contentScript.js';

const manifestPath = new URL('../src/manifest.json', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function createDocument(html, title) {
  const dom = new JSDOM(
    `<!doctype html><html><head><title>${title || ''}</title></head><body>${html}</body></html>`,
    { url: 'https://example.com' }
  );
  return dom.window.document;
}

function createMockObserverCtor(registry) {
  function MockObserver(callback) {
    this.callback = callback;
    this.observedTarget = null;
    this.observedConfig = null;
    registry.push(this);
  }

  MockObserver.prototype.observe = function (target, config) {
    this.observedTarget = target;
    this.observedConfig = config;
  };

  MockObserver.prototype.trigger = function (mutations) {
    this.callback(mutations);
  };

  return MockObserver;
}

test('manifest uses MV3 and keeps content script configuration', function () {
  assert.equal(manifest.manifest_version, 3);
  assert.ok(Array.isArray(manifest.content_scripts));
  assert.equal(manifest.content_scripts.length, 1);
  assert.deepEqual(manifest.content_scripts[0].matches, ['*://*/*']);
  assert.deepEqual(manifest.content_scripts[0].js, ['contentScript.js']);
});

test('manifest asset paths resolve to real files', function () {
  Object.values(manifest.icons || {}).forEach(function (iconPath) {
    const resolvedPath = new URL(`../src/${iconPath}`, import.meta.url);
    assert.equal(fs.existsSync(resolvedPath), true, `Missing manifest asset: ${iconPath}`);
  });
});

test('changeAllInstances handles singular, plural, uppercase and misses', function () {
  assert.equal(contentScript.changeAllInstances('migrant'), 'fellow human');
  assert.equal(contentScript.changeAllInstances('migrants'), 'fellow humans');
  assert.equal(contentScript.changeAllInstances('MIGRATION'), 'MOVEMENT');
  assert.equal(contentScript.changeAllInstances('Migration Policy'), 'movement Policy');
  assert.equal(contentScript.changeAllInstances('No replacement here'), false);
});

test('isBlockListedTag handles null and blocked tags', function () {
  assert.equal(contentScript.isBlockListedTag(null), false);
  assert.equal(contentScript.isBlockListedTag({}), false);
  assert.equal(contentScript.isBlockListedTag({ tagName: 'STYLE' }), true);
  assert.equal(contentScript.isBlockListedTag({ tagName: 'SCRIPT' }), true);
  assert.equal(contentScript.isBlockListedTag({ tagName: 'DIV' }), false);
});

test('init rewrites body/title and ignores script/style tags', function () {
  const observers = [];
  const doc = createDocument(
    '<p id="target">Immigration impacts migrants.</p><style id="style">.migration { color: red; }</style><script id="script">const label = "migrant";</script>',
    'Migration update'
  );

  const observer = contentScript.init(doc, createMockObserverCtor(observers));

  assert.equal(doc.querySelector('#target').textContent, 'Movement impacts fellow humans.');
  assert.equal(doc.title, 'Movement update');
  assert.equal(doc.querySelector('#style').textContent, '.migration { color: red; }');
  assert.equal(doc.querySelector('#script').textContent, 'const label = "migrant";');
  assert.equal(observers.length, 1);
  assert.equal(observer, observers[0]);
  assert.equal(observer.observedTarget, doc.body);
  assert.deepEqual(observer.observedConfig, contentScript.observerConfig);
});

test('observer callback rewrites dynamically added content', function () {
  const observers = [];
  const doc = createDocument('<div id="container"></div>', '');
  const observer = contentScript.init(doc, createMockObserverCtor(observers));

  const dynamicNode = doc.createElement('p');
  dynamicNode.textContent = 'Migrated migrant';
  doc.querySelector('#container').appendChild(dynamicNode);

  observer.trigger([
    {
      type: 'childList',
      target: doc.querySelector('#container')
    }
  ]);

  assert.equal(dynamicNode.textContent, 'Moved fellow human');
});

test('observer ignores non-childList mutations', function () {
  const observers = [];
  const doc = createDocument('<div id="container"><p id="target">Migration</p></div>', '');
  const observer = contentScript.init(doc, createMockObserverCtor(observers));
  const target = doc.querySelector('#target');
  target.textContent = 'migration';

  observer.trigger([
    {
      type: 'attributes',
      target: doc.querySelector('#container')
    }
  ]);

  assert.equal(target.textContent, 'migration');
});

test('init fails fast for missing DOM prerequisites', function () {
  assert.equal(contentScript.init(null, function () {}), null);
  assert.equal(contentScript.init({ body: null }, function () {}), null);
  assert.equal(contentScript.init({ body: {} }, null), null);
});
