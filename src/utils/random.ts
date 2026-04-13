export function generateNumbers(count: number) {
  const out: number[] = []
  for (let i = 0; i < count; i++) out.push(1 + Math.floor(Math.random() * 100))
  return out
}

