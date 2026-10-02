import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { fileURLToPath, pathToFileURL } from 'node:url'

const srcRoot = fileURLToPath(new URL('../src/', import.meta.url))

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const abs = path.join(srcRoot, specifier.slice(2))
    return nextResolve(pathToFileURL(abs).href, context)
  }
  return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) {
    return { format: 'module', source: 'export default {}\n', shortCircuit: true }
  }
  if (url.endsWith('.tsx')) {
    const source = fs.readFileSync(new URL(url), 'utf8')
    const { outputText } = ts.transpileModule(source, {
      fileName: url,
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2023,
        jsx: ts.JsxEmit.ReactJSX,
      },
    })
    return { format: 'module', source: outputText, shortCircuit: true }
  }
  return nextLoad(url, context)
}
