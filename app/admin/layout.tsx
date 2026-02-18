import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — Add Product',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
