'use client';
import { Suspense } from 'react';
import NuevaCitaAdminContent from './NuevaCitaAdminContent';

export default function NuevaCitaAdminPage() {
  return (
    <Suspense fallback={null}>
      <NuevaCitaAdminContent />
    </Suspense>
  );
}
