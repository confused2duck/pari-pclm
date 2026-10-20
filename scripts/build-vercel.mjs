import {spawnSync} from 'node:child_process';
import {build} from 'esbuild';

await build({
  stdin: {contents: "export {upload} from '@vercel/blob/client';", resolveDir: process.cwd()},
  bundle: true, format: 'esm', platform: 'browser', minify: true,
  outfile: 'public/assets/vendor/blob-client.js',
});
const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build', '--webpack'], {
  stdio: 'inherit', env: {...process.env, NEXT_TELEMETRY_DISABLED: '1'},
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
