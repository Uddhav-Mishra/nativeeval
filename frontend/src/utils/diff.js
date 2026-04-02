export function computeDiff(before, after) {
  return { before, after }
}

export function formatDiffForDisplay(diffs) {
  const result = []
  for (const [filename, diff] of Object.entries(diffs)) {
    const beforeLines = diff.before.split('\n')
    const afterLines = diff.after.split('\n')
    result.push({ filename, before: beforeLines, after: afterLines })
  }
  return result
}
