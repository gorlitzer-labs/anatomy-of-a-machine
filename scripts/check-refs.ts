import { checkRefs } from '../src/content/checkRefs'

const problems = checkRefs()
for (const p of problems) console.error(p)
console.log(problems.length ? `${problems.length} problem(s)` : 'references ok')
process.exit(problems.length ? 1 : 0)
