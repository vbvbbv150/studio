import { cp, mkdir, rm } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
for (const path of ['index.html','src','docs','README.md','server.js']) {
  await cp(new URL(path,root),new URL(path,dist),{recursive:true});
}
console.log('Static production bundle created in dist/.');
