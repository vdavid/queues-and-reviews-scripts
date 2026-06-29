import { build } from 'esbuild'
import { GasPlugin } from 'esbuild-gas-plugin'
import { copyFile, mkdir } from 'node:fs/promises'

const outDir = 'dist'

await mkdir(outDir, { recursive: true })

// Bundle the whole project into a single Google Apps Script file. esbuild wraps everything in an IIFE; the GasPlugin
// reads the `global.X = X` assignments in Code.ts and emits matching top-level stub functions plus `var global = this`,
// so every entry point ends up callable from GAS (menu, triggers, web app).
await build({
    entryPoints: ['Code.ts'], // Must be an array of strings; the plugin scans the first entry for global assignments.
    bundle: true,
    outfile: `${outDir}/Code.js`,
    target: 'es2019',
    platform: 'neutral',
    format: 'iife', // Produces a classic script so `var global = this` resolves to the GAS global object.
    plugins: [GasPlugin],
}).catch((error) => {
    console.error(error)
    process.exit(1)
})

// The manifest is pushed as-is alongside the bundle.
await copyFile('appsscript.json', `${outDir}/appsscript.json`)

console.log(`Built ${outDir}/Code.js and copied appsscript.json`)
