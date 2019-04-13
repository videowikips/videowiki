export function splitter (str, l) {
  const strs = []

  while (str.length > l) {
    let pos = str.substring(0, l).lastIndexOf('.')
    let periodMatch = true

    if (pos <= 0) {
      periodMatch = false
      pos = str.substring(0, l).lastIndexOf(' ')
    }

    pos = pos <= 0 ? l : pos
    strs.push(str.substring(0, pos))
    let i
    if (periodMatch) {
      i = str.indexOf('.', pos) + 1
    } else {
      i = str.indexOf(' ', pos) + 1
    }
    if (i < pos || i > pos + l) {
      i = pos
    }

    str = str.substring(i)
  }

  strs.push(str)
  return strs
}

export function paragraphs (str) {
  if (str && str.length > 0) {
    return str.split(/\n+/).filter((i) => i).map((i) => i.trim()).filter((i) => i);
  } else {
    return []
  }
}
