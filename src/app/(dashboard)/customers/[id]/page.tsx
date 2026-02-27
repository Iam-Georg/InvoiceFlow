'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Customer, Invoice } from '@/types'
import StatusBadge from '@/components/invoices/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  ChevronLeft, ChevronRight, FileText, Users,
  Loader2, Save, TrendingUp, AlertTriangle, Clock,
} from 'lucide-react'

interface CustomerForm {
  name: string
  email: string
  company: string
  address: string
  city: string
  zip: string
  country: string
}

function ReliabilityIndicator({ ratio }: { ratio: number }) {
  let color = '#16A34A'
  let label = 'Zuverlässig'

  if (ratio > 0.5) {
    color = '#DC2626'
    label = 'Häufig verspätet'
  } else if (ratio > 0.2) {
    color = '#B45309'
    label = 'Gelegentlich verspätet'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span className="text-sm" style={{ color }}>{label}</span>
    </div>
  )
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [form, setForm] = useState<CustomerForm>({
    name: '',
    email: '',
    company: '',
    address: '',
    city: '',
    zip: '',
    country: 'DE',
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data: cust } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (cust) {
        setCustomer(cust)
        setForm({
          name: cust.name || '',
          email: cust.email || '',
          company: cust.company || '',
          address: cust.address || '',
          city: cust.city || '',
          zip: cust.zip || '',
          country: cust.country || 'DE',
        })
      } else {
        setCustomer(null)
      }

      const { data: invs } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setInvoices(invs ?? [])
      setLoading(false)
    }

    loadData()
  }, [id, reloadKey])

  function set(field: keyof CustomerForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim() || !customer) {
      toast.error('Name und E-Mail sind Pflichtfelder')
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('customers')
      .update({
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        zip: form.zip.trim() || null,
        country: form.country.trim() || null,
      })
      .eq('id', customer.id)

    if (error) {
      toast.error(`Fehler beim Speichern: ${error.message}`)
    } else {
      toast.success('Kunde aktualisiert')
      setEditing(false)
      setReloadKey((v) => v + 1)
    }

    setSaving(false)
  }

  const totalBilled = useMemo(() => invoices.reduce((sum, inv) => sum + inv.total, 0), [invoices])
  const totalPaid = useMemo(
    () => invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
    [invoices],
  )
  const outstanding = totalBilled - totalPaid

  const avgPaymentDays = useMemo(() => {
    const paid = invoices.filter((inv) => inv.status === 'paid' && inv.paid_at)
    if (paid.length === 0) return null
    const totalDays = paid.reduce((sum, inv) => {
      const issued = new Date(inv.issue_date)
      const paidDate = new Date(inv.paid_at as string)
      return sum + Math.max(0, Math.floor((paidDate.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24)))
    }, 0)
    return Math.round(totalDays / paid.length)
  }, [invoices])

  const lateRatio = useMemo(() => {
    if (invoices.length === 0) return 0
    const lateCount = invoices.filter((inv) => {
      if (inv.status === 'paid' && inv.paid_at) return new Date(inv.paid_at) > new Date(inv.due_date)
      return inv.status === 'overdue'
    }).length
    return lateCount / invoices.length
  }, [invoices])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <Skeleton className="h-5 w-16" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-7 w-24" />
            </CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--accent)' }}>
          <Users className="w-7 h-7" style={{ color: 'var(--primary)' }} />
        </div>
        <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Kunde nicht gefunden
        </h3>
        <Link href="/customers">
          <Button variant="outline" size="sm">Zurück zu Kunden</Button>
        </Link>
      </div>
    )
  }

  const field = (label: string, key: keyof CustomerForm, placeholder: string, type = 'text') => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        disabled={!editing}
        style={{ background: editing ? 'var(--background)' : 'var(--muted)' }}
      />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link href="/customers" className="inline-flex items-center gap-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
        <ChevronLeft className="w-4 h-4" /> Zurück
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium label-caps">Gesamt berechnet</CardTitle>
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          </CardHeader>
          <CardContent><p className="text-xl font-bold tabular-nums">{formatCurrency(totalBilled)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium label-caps">Bezahlt</CardTitle>
            <TrendingUp className="w-4 h-4" style={{ color: '#16A34A' }} />
          </CardHeader>
          <CardContent><p className="text-xl font-bold tabular-nums">{formatCurrency(totalPaid)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium label-caps">Ausstehend</CardTitle>
            <AlertTriangle className="w-4 h-4" style={{ color: '#DC2626' }} />
          </CardHeader>
          <CardContent><p className="text-xl font-bold tabular-nums">{formatCurrency(outstanding)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium label-caps">Ø Zahlung</CardTitle>
            <Clock className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          </CardHeader>
          <CardContent><p className="text-xl font-bold tabular-nums">{avgPaymentDays !== null ? `${avgPaymentDays} T.` : '–'}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm label-caps" style={{ fontWeight: 600 }}>Zuverlässigkeit</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Noch keine Rechnungsdaten vorhanden.</p>
          ) : (
            <ReliabilityIndicator ratio={lateRatio} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm label-caps" style={{ fontWeight: 600 }}>Kundendaten</CardTitle>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Bearbeiten</Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(false)
                  setForm({
                    name: customer.name || '',
                    email: customer.email || '',
                    company: customer.company || '',
                    address: customer.address || '',
                    city: customer.city || '',
                    zip: customer.zip || '',
                    country: customer.country || 'DE',
                  })
                }}
              >
                Abbrechen
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {field('Name *', 'name', 'Max Mustermann')}
          {field('E-Mail *', 'email', 'max@firma.de', 'email')}
          <div className="col-span-2">{field('Firma', 'company', 'Muster GmbH')}</div>
          <div className="col-span-2">{field('Adresse', 'address', 'Musterstraße 1')}</div>
          {field('Stadt', 'city', 'Berlin')}
          {field('PLZ', 'zip', '10115')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm label-caps" style={{ fontWeight: 600 }}>Rechnungen</CardTitle>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{invoices.length} gesamt</span>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--accent)' }}>
                <FileText className="w-6 h-6" style={{ color: 'var(--primary)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Noch keine Rechnungen für diesen Kunden.
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {invoices.map((inv) => (
                <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between px-5 py-3.5 invoice-row">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                      <FileText className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{inv.invoice_number}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        Fällig {formatDate(inv.due_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={inv.status} />
                    <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
                      {formatCurrency(inv.total)}
                    </span>
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="pb-8" />
    </div>
  )
}
