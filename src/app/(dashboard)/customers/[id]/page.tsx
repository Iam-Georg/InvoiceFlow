'use client'

import { useEffect, useState, useCallback } from 'react'
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

function ReliabilityIndicator({ ratio }: { ratio: number }) {
  let color: string
  let label: string
  if (ratio <= 0.2) {
    color = '#16A34A'
    label = 'Zuverlässig'
  } else if (ratio <= 0.5) {
    color = '#B45309'
    label = 'Gelegentlich verspätet'
  } else {
    color = '#DC2626'
    label = 'Häufig verspätet'
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
  const supabase = createClient()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', company: '',
    address: '', city: '', zip: '', country: '',
  })

  // Stats
  const [totalBilled, setTotalBilled] = useState(0)
  const [totalPaid, setTotalPaid] = useState(0)
  const [outstanding, setOutstanding] = useState(0)
  const [avgPaymentDays, setAvgPaymentDays] = useState<number | null>(null)
  const [lateRatio, setLateRatio] = useState(0)

  const loadData = useCallback(async () => {
    const { data: cust } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
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
        country: cust.country || '',
      })
    }

    const { data: invs } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })

    const allInv = invs ?? []
    setInvoices(allInv)

    const billed = allInv.reduce((s, i) => s + i.total, 0)
    const paid = allInv.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0)
    setTotalBilled(billed)
    setTotalPaid(paid)
    setOutstanding(billed - paid)

    // Average payment days
    const paidInv = allInv.filter((i) => i.status === 'paid' && i.paid_at)
    if (paidInv.length > 0) {
      const totalDays = paidInv.reduce((s, i) => {
        const issued = new Date(i.issue_date)
        const paidDate = new Date(i.paid_at!)
        return s + Math.max(0, Math.floor((paidDate.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24)))
      }, 0)
      setAvgPaymentDays(Math.round(totalDays / paidInv.length))
    }

    // Late ratio
    if (allInv.length > 0) {
      const lateCount = allInv.filter((i) => {
        if (i.status === 'paid' && i.paid_at) {
          return new Date(i.paid_at) > new Date(i.due_date)
        }
        if (i.status === 'overdue') return true
        return false
      }).length
      setLateRatio(lateCount / allInv.length)
    }

    setLoading(false)
  }, [id, supabase])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadData() }, [loadData])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.name || !form.email) {
      toast.error('Name und E-Mail sind Pflichtfelder')
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('customers')
      .update({
        name: form.name,
        email: form.email,
        company: form.company || null,
        address: form.address || null,
        city: form.city || null,
        zip: form.zip || null,
        country: form.country || null,
      })
      .eq('id', id)

    if (error) {
      toast.error('Fehler beim Speichern')
    } else {
      toast.success('Kunde aktualisiert')
      setEditing(false)
      await loadData()
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <>
        <div className="max-w-4xl mx-auto space-y-5">
          <Skeleton className="h-5 w-16" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="card-elevated"><CardContent className="pt-6">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-7 w-24" />
              </CardContent></Card>
            ))}
          </div>
        </div>
      </>
    )
  }

  if (!customer) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--accent)' }}>
            <Users className="w-7 h-7" style={{ color: 'var(--primary)' }} />
          </div>
          <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            Kunde nicht gefunden
          </h3>
          <Link href="/customers">
            <Button variant="outline" size="sm" className="mt-2 btn-press"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              Zurück zu Kunden
            </Button>
          </Link>
        </div>
      </>
    )
  }

  const field = (label: string, key: string, placeholder: string, type = 'text') => (
    <div className="space-y-2">
      <Label style={{ color: 'var(--foreground)' }}>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={(form as Record<string, string>)[key]}
        onChange={(e) => set(key, e.target.value)}
        disabled={!editing}
        style={{
          borderColor: 'var(--border)',
          background: editing ? 'var(--background)' : 'var(--muted)',
        }}
      />
    </div>
  )

  return (
    <>

      <div className="max-w-4xl mx-auto space-y-5">
        <Link href="/customers" className="inline-flex items-center gap-1 text-sm"
          style={{ color: 'var(--muted-foreground)' }}>
          <ChevronLeft className="w-4 h-4" /> Zurück
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-elevated card-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium label-caps">Gesamt berechnet</CardTitle>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>{formatCurrency(totalBilled)}</p>
            </CardContent>
          </Card>
          <Card className="card-elevated card-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium label-caps">Bezahlt</CardTitle>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F0FDF4' }}>
                <TrendingUp className="w-4 h-4" style={{ color: '#16A34A' }} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>{formatCurrency(totalPaid)}</p>
            </CardContent>
          </Card>
          <Card className="card-elevated card-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium label-caps">Ausstehend</CardTitle>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FEF2F2' }}>
                <AlertTriangle className="w-4 h-4" style={{ color: '#DC2626' }} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>{formatCurrency(outstanding)}</p>
            </CardContent>
          </Card>
          <Card className="card-elevated card-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium label-caps">Ø Zahlung</CardTitle>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <Clock className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
                {avgPaymentDays !== null ? `${avgPaymentDays} T.` : '–'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reliability */}
        <Card className="card-elevated">
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

        {/* Edit Form */}
        <Card className="card-elevated">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm label-caps" style={{ fontWeight: 600 }}>Kundendaten</CardTitle>
            {!editing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Bearbeiten
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(false)
                    if (customer) {
                      setForm({
                        name: customer.name || '',
                        email: customer.email || '',
                        company: customer.company || '',
                        address: customer.address || '',
                        city: customer.city || '',
                        zip: customer.zip || '',
                        country: customer.country || '',
                      })
                    }
                  }}
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  Abbrechen
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
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

        {/* Invoices for this customer */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm label-caps" style={{ fontWeight: 600 }}>Rechnungen</CardTitle>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{invoices.length} gesamt</span>
          </CardHeader>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'var(--accent)' }}>
                  <FileText className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Noch keine Rechnungen für diesen Kunden.
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {invoices.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/invoices/${inv.id}`}
                    className="flex items-center justify-between px-5 py-3.5 invoice-row"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--accent)' }}>
                        <FileText className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                          {inv.invoice_number}
                        </p>
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
    </>
  )
}
