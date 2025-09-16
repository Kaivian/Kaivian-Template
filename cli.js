#!/usr/bin/env node
import path from "node:path";
import fs from "fs-extra";
import { fileURLToPath } from "node:url";
import minimist from "minimist";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USAGE = `Usage:
  kailib init [app-name] [--template default] [--force]`;

function render(str, vars) {
  return str.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (_, k) => (k in vars ? String(vars[k]) : ""));
}

function copyTemplate(src, dst, vars) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const srcPath = path.join(src, e.name);
    const isTpl = e.name.endsWith(".tpl");
    const outName = isTpl ? e.name.slice(0, -4) : e.name;
    const dstPath = path.join(dst, outName);

    if (e.isDirectory()) {
      // Skip copying node_modules directories from templates
      if (e.name === "node_modules") {
        continue;
      }
      fs.mkdirpSync(dstPath);
      copyTemplate(srcPath, dstPath, vars);
    } else {
      const buf = fs.readFileSync(srcPath, "utf8");
      const out = isTpl ? render(buf, vars) : buf;
      fs.writeFileSync(dstPath, out, "utf8");
    }
  }
}

function ensureTarget(dir, force) {
  if (fs.existsSync(dir)) {
    const items = fs.readdirSync(dir);
    if (items.length && !force) {
      throw new Error(`Target "${dir}" is not empty. Use --force.`);
    }
    if (force) fs.emptyDirSync(dir);
  } else {
    fs.mkdirpSync(dir);
  }
}

function main() {
  const argv = minimist(process.argv.slice(2), { boolean: ["force"], string: ["template"] });
  const [cmd, name] = argv._;

  if (cmd !== "init") {
    console.log(USAGE);
    process.exit(0);
  }

  const cwd = process.cwd();
  let appName, targetDir;
  if (name) {
    appName = name;
    targetDir = path.resolve(cwd, appName);
  } else {
    appName = path.basename(cwd);
    targetDir = cwd;
  }

  const template = argv.template || "default";
  const templateDir = path.join(__dirname, "templates", template);
  if (!fs.existsSync(templateDir)) {
    console.error(`Template "${template}" not found`);
    process.exit(1);
  }

  try {
    ensureTarget(targetDir, argv.force);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  const vars = { appName, year: new Date().getFullYear(), licenseHolder: "Your Name" };
  copyTemplate(templateDir, targetDir, vars);

  console.log(`Successfully Created "${appName}" from template "${template}" at ${targetDir}`);
}

main();
