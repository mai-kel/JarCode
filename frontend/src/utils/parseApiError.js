function cleanStringifiedList(s) {
  const inner = s.slice(1, -1)
  const parts = inner.split(/',\s*'|",\s*"|',\s*"|",\s*'/).map(x => x.replace(/^['\"]|['\"]$/g, '').trim()).filter(Boolean)
  return parts
}

export function parseApiErrorFields(err) {
  const out = {}
  if (!err) return out

  if (typeof err === 'string') {
    out._non_field = [err]
    return out
  }

  if (Array.isArray(err)) {
    out._non_field = err.map(e => (typeof e === 'string' ? e : String(e)))
    return out
  }

  if (typeof err === 'object') {
    const humanizeKey = (k) => {
      if (!k) return ''
      if (k === 'non_field_errors' || k === 'detail') return '_non_field'
      return k
    }

    Object.keys(err).forEach((key) => {
      const val = err[key]
      const outKey = humanizeKey(key)
      out[outKey] = out[outKey] || []

      if (Array.isArray(val)) {
        val.forEach((v) => {
          if (typeof v === 'string') {
            const s = v.trim()
            if ((s.startsWith("['") && s.endsWith("']")) || (s.startsWith('["') && s.endsWith('"]'))) {
              const parsed = cleanStringifiedList(s)
              parsed.forEach(p => out[outKey].push(p))
            } else {
              out[outKey].push(s)
            }
          } else {
            out[outKey].push(String(v))
          }
        })
      } else if (typeof val === 'string') {
        const s = val.trim()
        if ((s.startsWith("['") && s.endsWith("']")) || (s.startsWith('["') && s.endsWith('"]'))) {
          const parsed = cleanStringifiedList(s)
          parsed.forEach(p => out[outKey].push(p))
        } else {
          out[outKey].push(s)
        }
      } else {
        out[outKey].push(String(val))
      }
    })
    return out
  }

  return out
}

export default function parseApiError(err) {
  const fields = parseApiErrorFields(err)
  const parts = []
  Object.keys(fields).forEach(k => {
    const list = fields[k]
    if (!list || !list.length) return
    if (k === '_non_field') {
      list.forEach(m => parts.push(m))
    } else {
      list.forEach(m => parts.push(`${k.charAt(0).toUpperCase() + k.slice(1)}: ${m}`))
    }
  })
  return parts.join(' ')
}
