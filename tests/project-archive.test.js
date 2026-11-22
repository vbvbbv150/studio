import test from 'node:test';
import assert from 'node:assert/strict';
import { createProjectArchive, importProjectArchive, makeProjectFromArchive } from '../src/project-archive.js';

test('project ZIP export/import preserves directory structure and source metadata', async () => {
  const source = { name: 'Demo project', files: { 'index.html': '<html></html>', 'src/app.js': 'export default 1', 'assets/a.svg': '<svg/>', '.env.example': 'URL=' } };
  const archive = createProjectArchive(source);
  const file = new File([archive.blob], archive.filename, { type: 'application/zip' });
  const report = await importProjectArchive(file);
  assert.equal(report.files.get('src/app.js'), 'export default 1');
  assert.equal(report.files.get('assets/a.svg'), '<svg/>');
  assert.equal(report.projectRoot, '/');
  const project = makeProjectFromArchive(report, 'Imported');
  assert.equal(project.activeFile, 'index.html');
  assert.equal(project.origin, 'zip');
});
