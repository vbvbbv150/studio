export async function importZipIntoWorkspace(file, { saveProject, openProject, confirmImport = async () => true, onProgress = () => {} }) {
  if (file.size > 250 * 1024 * 1024) throw new Error('ZIP exceeds the 250 MiB import limit.');
  onProgress({ stage: 'inspect', percent: 10 });
  const report = await importProjectArchive(file);
  const summary = { fileCount: report.files.size, framework: report.framework, packageManager: report.packageManager, projectRoot: report.projectRoot, scripts: report.scripts, dependencies: report.dependencies, compatibility: report.previewCompatibility, warnings: report.warnings };
  if (!await confirmImport(summary)) return { cancelled: true, summary };
  const defaultName = (file.name || 'Imported project').replace(/\.zip$/i, '');
  const project = makeProjectFromArchive(report, defaultName);
  onProgress({ stage: 'save', percent: 65 });
  await saveProject(project);
  onProgress({ stage: 'open', percent: 90 });
  await openProject(project.id);
  onProgress({ stage: 'complete', percent: 100 });
  return { project, summary };
}

export function exportSourceZip(project, download, { clean = false, confirmExclusions = async () => true } = {}) {
  const result = createProjectArchive(project, { clean });
  if (result.excluded.length && !confirmExclusions(result.excluded)) return { cancelled: true, excluded: result.excluded };
  download(result.blob, result.filename);
  return { filename: result.filename, excluded: result.excluded, fileCount: result.fileCount };
}
