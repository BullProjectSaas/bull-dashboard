import { C } from '../../theme'

export const inputStyle = {
  background: C.bg3,
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '9px 12px',
  fontSize: 13,
  flex: 1,
  minWidth: 140,
}

export const selectStyle = {
  ...inputStyle,
  flex: 'unset',
  minWidth: 170,
}
