export const CLIENT_TAG_PAUSADO = 'PAUSADO'

export const CLIENT_TAGS = [
  { value: 'ISA', color: '#7C9CBF' },
  { value: 'CIRCULANDO OP', color: '#22C55E' },
  { value: 'CIRCULANDO ES', color: '#7BD98A' },
  { value: CLIENT_TAG_PAUSADO, color: '#EF4444' },
]

export const tagColor = (value) => CLIENT_TAGS.find((t) => t.value === value)?.color || '#8899AA'
