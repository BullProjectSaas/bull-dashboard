import { useMemo, useState } from 'react'
import { C } from '../../theme'
import { ACCOUNTS } from '../../utils/financeDefaults'
import { inputStyle, selectStyle } from '../admin/formStyles'
import { useCategories } from '../../hooks/useCategories'

const todayKey = () => new Date().toISOString().slice(0, 10)

export default function TransactionForm({ addTransaction, userEmail }) {
  const { categories, addCategory } = useCategories()
  const [type, setType] = useState('ingreso')
  const [accountId, setAccountId] = useState(ACCOUNTS[0].id)
  const [categoryChoice, setCategoryChoice] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayKey())
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const categoriesForType = useMemo(() => categories.filter((c) => c.type === type), [categories, type])

  const submit = async (e) => {
    e.preventDefault()
    const amountNum = Number(amount)
    if (!amountNum || amountNum <= 0 || !date) return
    const isNew = categoryChoice === '__new__'
    if (isNew && !newCategory.trim()) return
    if (!isNew && !categoryChoice) return

    setSaving(true)
    const categoryName = isNew ? newCategory.trim() : categories.find((c) => c.id === categoryChoice)?.name
    if (isNew) await addCategory(newCategory, type)

    await addTransaction({
      type,
      accountId,
      category: categoryName,
      amount: amountNum,
      currency: 'ARS',
      date,
      description: description.trim(),
      createdBy: userEmail,
    })

    setSaving(false)
    setCategoryChoice('')
    setNewCategory('')
    setAmount('')
    setDescription('')
    setDone(true)
    setTimeout(() => setDone(false), 4000)
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {['ingreso', 'pago'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t)
              setCategoryChoice('')
            }}
            style={{
              background: type === t ? (t === 'ingreso' ? C.green : C.red) : C.bg3,
              color: type === t ? C.bg : C.muted,
              border: `1px solid ${type === t ? 'transparent' : C.border}`,
              borderRadius: 10,
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {t === 'ingreso' ? 'Ingreso' : 'Pago'}
          </button>
        ))}
      </div>

      <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={selectStyle}>
        {ACCOUNTS.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>

      <select value={categoryChoice} onChange={(e) => setCategoryChoice(e.target.value)} style={selectStyle}>
        <option value="">Categoría…</option>
        {categoriesForType.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
        <option value="__new__">+ Nueva categoría</option>
      </select>

      {categoryChoice === '__new__' && (
        <input
          placeholder="Nombre de la categoría"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={inputStyle}
        />
      )}

      <input
        type="number"
        step="0.01"
        min="0"
        placeholder="Monto"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ ...inputStyle, flex: 'unset', width: 140 }}
      />

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, flex: 'unset', width: 150 }} />

      <input
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ ...inputStyle, flex: 2 }}
      />

      <button
        type="submit"
        disabled={saving}
        style={{
          background: C.gold,
          color: C.bg,
          border: 'none',
          borderRadius: 10,
          padding: '9px 18px',
          fontWeight: 700,
          fontSize: 13,
          cursor: saving ? 'default' : 'pointer',
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? 'Guardando…' : 'Registrar'}
      </button>

      {done && <span style={{ fontSize: 12, color: C.green, alignSelf: 'center' }}>✓ Movimiento registrado, queda pendiente de confirmar.</span>}
    </form>
  )
}
