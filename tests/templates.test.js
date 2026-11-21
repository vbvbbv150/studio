import test from 'node:test';
import assert from 'node:assert/strict';
import { templates } from '../src/templates.js';

test('starter template catalog has three complete templates', () => {
  assert.equal(templates.length, 3);
  for (const template of templates) {
    assert.ok(template.id);
    assert.ok(template.name);
    assert.ok(template.files['index.html']);
    assert.ok(template.files['style.css']);
    assert.ok(typeof template.files['app.js'] === 'string');
  }
});

test('template HTML documents contain viewport metadata', () => {
  for (const template of templates) {
    assert.match(template.files['index.html'], /name="viewport"/);
  }
});

test('starter JavaScript files parse as scripts', () => {
  for (const template of templates) {
    assert.doesNotThrow(() => new Function(template.files['app.js']));
  }
});
