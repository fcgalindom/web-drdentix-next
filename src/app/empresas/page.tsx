'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { companyService } from '@/services';
import { usePaginator } from '@/hooks/usePaginator';
import { useDialogHandler } from '@/hooks/useDialogHandler';
import { useAsyncFormHandler } from '@/hooks/useAsyncFormHandler';
import { useAlert } from '@/hooks/useAlert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import SpinnerLoad from '@/components/web/SpinnerLoad';
import ErrorMessage from '@/components/web/ErrorMessage';
import AlertGeneric from '@/components/web/AlertGeneric';
import WebPaginator from '@/components/web/Paginator';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { companySchema, extractErrors } from '@/lib/schemas';
import type { PaginatedResponse } from '@/interfaces/index';

interface Company { id: number; name: string; email: string | null; phone: string | null; address: string | null; city: string | null; state: string; }

const empty = { id: 0, name: '', email: '', phone: '', address: '', city: '' };

export default function EmpresasPage() {
  const fetchCompanies = useCallback(async ({ page }: { page: number }) => {
    const { data } = await companyService.list(page);
    return { ...data.meta, data: data.data } as PaginatedResponse<Company>;
  }, []);

  const {
    items,
    paginator,
    page,
    setPage,
    loading: listLoading,
    refresh,
  } = usePaginator<Company, Record<string, never>>(fetchCompanies, {} as Record<string, never>);

  const { open, title, handleOpen, handleClose } = useDialogHandler({ create: 'Nueva empresa', edit: 'Editar empresa' });

  const [form, setForm] = useState<any>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isLoading: saving, execute } = useAsyncFormHandler();
  const { alert, showAlert, hideAlert } = useAlert();

  const handleOpenCreate = useCallback(() => {
    setForm(empty);
    setErrors({});
    handleOpen();
  }, [handleOpen]);

  const handleOpenEdit = useCallback((c: Company) => {
    setForm({ id: c.id, name: c.name, email: c.email ?? '', phone: c.phone ?? '', address: c.address ?? '', city: c.city ?? '' });
    setErrors({});
    handleOpen(c.id);
  }, [handleOpen]);

  const save = useCallback(async () => {
    const r = companySchema.safeParse(form);
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});

    const { id: formId, ...rest } = form;
    const payload: any = { ...rest };
    if (formId) payload.id = formId;

    const result = await execute(
      async (signal) => companyService.create(payload, signal),
      formId ? 'Empresa actualizada' : 'Empresa creada'
    );

    showAlert(result.message, result.alertSeverity);
    if (result.alertSeverity === 'success') {
      handleClose();
      refresh();
    }
  }, [form, execute, showAlert, handleClose, refresh]);

  const remove = useCallback(async (id: number) => {
    if (!confirm('¿Eliminar empresa?')) return;
    try {
      await companyService.delete(id);
      toast.success('Empresa eliminada');
      refresh();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Error al eliminar');
    }
  }, [refresh]);

  if (listLoading) return <SpinnerLoad />;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <AlertGeneric severity={alert.severity} message={alert.message} open={alert.open} onClose={hideAlert} />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-[#0F172A] text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Dr. Dentix
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-500 font-medium">
            <Link href="/#funciones" className="hover:text-[#0EA5E9] transition-colors">Funciones</Link>
            <Link href="/#precios" className="hover:text-[#0EA5E9] transition-colors">Precios</Link>
            <Link href="/#testimonios" className="hover:text-[#0EA5E9] transition-colors">Testimonios</Link>
            <Link href="/empresas" className="text-[#0EA5E9] font-semibold">Empresas</Link>
          </nav>
          <Link href="/login"
            className="px-4 py-2 bg-[#0EA5E9] text-white text-sm font-semibold rounded-lg hover:bg-[#0284C7] transition-colors">
            Empezar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-14 bg-[#F0F9FF]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mx-auto mb-4">
            <Building2 size={26} className="text-[#0EA5E9]" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Empresas
          </h1>
          <p className="text-slate-500 mt-3 text-sm max-w-md mx-auto">
            Conoce las empresas que confían en Dr. Dentix para gestionar sus clínicas.
          </p>
        </div>
      </section>

      {/* List */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>Nuestras empresas</h2>
            <Button onClick={handleOpenCreate}><Plus size={16} /> Nueva empresa</Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {items.map((c) => (
              <div key={c.id} className="bg-[#F0F9FF] rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>{c.name}</h3>
                    {c.city && <p className="text-slate-400 text-xs mt-0.5">{c.city}</p>}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.state === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {c.state}
                  </span>
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-slate-600">
                  {c.email && <p>{c.email}</p>}
                  {c.phone && <p>{c.phone}</p>}
                  {c.address && <p>{c.address}</p>}
                </div>
                <div className="mt-5 flex items-center justify-end gap-1 border-t border-slate-200 pt-3">
                  <button onClick={() => handleOpenEdit(c)} className="p-1.5 text-[#0F172A] hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                  <button onClick={() => remove(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
          <WebPaginator paginator={paginator} page={page} setPage={setPage} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-extrabold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Dr. Dentix</span>
          <p className="text-slate-400 text-sm">© 2026 Dr. Dentix. Todos los derechos reservados.</p>
          <Link href="/login" className="px-4 py-2 bg-[#0EA5E9] text-white text-sm font-semibold rounded-lg hover:bg-[#0284C7] transition-colors">
            Iniciar sesión
          </Link>
        </div>
      </footer>

      {/* Modal create/edit */}
      <Modal open={open} onClose={handleClose} title={title}>
        <div className="grid gap-3">
          <Input label="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <ErrorMessage message={errors.name} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <ErrorMessage message={errors.email} />
          <Input label="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Button onClick={save} loading={saving}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}