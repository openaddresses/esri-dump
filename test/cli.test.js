import test from 'tape';
import { exec } from 'child_process';

test('./cli.js', (t) => {
    exec(new URL('../cli.js', import.meta.url).pathname, (err, stdout, stderr) => {
        t.ok(stderr.match(/url required/), 'error on missing URL');
        t.end();
    });
});
