-- GoBD compliance: Prevent modification of finalized invoices
-- Only draft invoices can be freely edited/deleted.
-- Non-draft invoices may only update: status, sent_at, paid_at, cancelled_at, updated_at

create or replace function public.enforce_invoice_immutability()
returns trigger as $$
begin
  -- Allow all changes on draft invoices
  if old.status = 'draft' then
    return new;
  end if;

  -- For non-draft invoices, only allow changes to permitted fields
  if (
    old.user_id        is distinct from new.user_id        or
    old.customer_id    is distinct from new.customer_id    or
    old.invoice_number is distinct from new.invoice_number or
    old.issue_date     is distinct from new.issue_date     or
    old.due_date       is distinct from new.due_date       or
    old.items          is distinct from new.items          or
    old.subtotal       is distinct from new.subtotal       or
    old.tax_rate       is distinct from new.tax_rate       or
    old.tax_amount     is distinct from new.tax_amount     or
    old.total          is distinct from new.total          or
    old.notes          is distinct from new.notes
  ) then
    raise exception 'GoBD: Finalisierte Rechnungen duerfen nicht veraendert werden (Status: %)', old.status;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_invoice_immutability
  before update on public.invoices
  for each row
  execute function public.enforce_invoice_immutability();

-- Prevent deletion of non-draft invoices (GoBD retention requirement)
create or replace function public.prevent_invoice_deletion()
returns trigger as $$
begin
  if old.status != 'draft' then
    raise exception 'GoBD: Finalisierte Rechnungen duerfen nicht geloescht werden (Status: %)', old.status;
  end if;
  return old;
end;
$$ language plpgsql;

create trigger trg_prevent_invoice_deletion
  before delete on public.invoices
  for each row
  execute function public.prevent_invoice_deletion();
