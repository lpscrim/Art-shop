'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import type { AdminProduct } from './types';
import { deleteProduct, updateProduct, type DeleteProductState, type UpdateProductState } from './actions';

const initialUpdateState: UpdateProductState = { success: false };
const initialDeleteState: DeleteProductState = { success: false };
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MAX_SECONDARY = 4;

export default function EditProductClient({ products }: { products: AdminProduct[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [updateState, updateAction, isUpdating] = useActionState(updateProduct, initialUpdateState);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteProduct, initialDeleteState);

  useEffect(() => {
    if (selectedId === null && products.length > 0) {
      setSelectedId(products[0].id);
    }
  }, [selectedId, products]);

  useEffect(() => {
    if (updateState.success) {
      formRef.current?.reset();
      const timer = setTimeout(() => setFileError(null), 0);
      return () => clearTimeout(timer);
    }
  }, [updateState]);

  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId]
  );

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`Cover image exceeds 15 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
      e.target.value = '';
    }
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const files = Array.from(e.target.files ?? []);
    if (files.length > MAX_SECONDARY) {
      setFileError(`You can upload a maximum of ${MAX_SECONDARY} gallery images.`);
      e.target.value = '';
      return;
    }
    const oversized = files.find((f) => f.size > MAX_FILE_SIZE);
    if (oversized) {
      setFileError(`Gallery image "${oversized.name}" exceeds 15 MB limit.`);
      e.target.value = '';
    }
  }

  if (!selected) {
    return (
      <div className="min-h-screen bg-background text-foreground px-6 py-16">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl tracking-tight mb-4">EDIT PRODUCT</h1>
          <p className="text-sm text-muted-foreground">No products found.</p>
        </div>
      </div>
    );
  }

  const priceDisplay = (selected.price_hw / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl tracking-tight mb-2">EDIT PRODUCT</h1>
          <p className="text-sm text-muted-foreground">Current stock: {selected.stock_level}</p>
        </div>

        <label className="block">
          <span className="text-sm font-medium">Select Product</span>
          <select
            className="mt-1 block w-full rounded-md border border-muted bg-background px-3 py-2 text-sm"
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(Number(e.target.value))}
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (ID {product.id})
              </option>
            ))}
          </select>
        </label>

        {(updateState.error || deleteState.error || fileError) && (
          <div className="rounded-md border border-red-400 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {fileError || updateState.error || deleteState.error}
          </div>
        )}

        {(updateState.success || deleteState.success) && (
          <div className="rounded-md border border-green-400 bg-green-50 px-4 py-3 text-green-700 text-sm">
            {updateState.success ? 'Product updated successfully.' : 'Product removed successfully.'}
          </div>
        )}

        <form ref={formRef} action={updateAction} className="space-y-5" key={selected.id}>
          <input type="hidden" name="productId" value={selected.id} />

          <label className="block">
            <span className="text-sm font-medium">Name *</span>
            <input
              name="name"
              type="text"
              required
              defaultValue={selected.name}
              className="mt-1 block w-full rounded-md border border-muted bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Description</span>
            <textarea
              name="description"
              rows={3}
              defaultValue={selected.description}
              className="mt-1 block w-full rounded-md border border-muted bg-background px-3 py-2 text-sm"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Price (GBP) *</span>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                required
                defaultValue={priceDisplay}
                className="mt-1 block w-full rounded-md border border-muted bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Stock</span>
              <input
                name="stock"
                type="number"
                min="0"
                defaultValue={selected.stock_level}
                className="mt-1 block w-full rounded-md border border-muted bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Categories (comma-separated)</span>
            <input
              name="categories"
              type="text"
              defaultValue={selected.categories.join(', ')}
              className="mt-1 block w-full rounded-md border border-muted bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Year</span>
            <input
              name="year"
              type="text"
              defaultValue={selected.year}
              className="mt-1 block w-full rounded-md border border-muted bg-background px-3 py-2 text-sm"
            />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cover Image</span>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" name="removeCover" />
                Remove cover image
              </label>
            </div>
            {selected.image_url ? (
              <div className="relative aspect-4/5 max-w-60 overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.image_url} alt="Cover" className="h-full w-full object-cover" />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No cover image uploaded.</p>
            )}
            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="mt-1 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-sm file:font-medium file:text-background hover:file:opacity-80"
            />
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium">Gallery Images</span>
            {selected.gallery.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {selected.gallery.map((image) => (
                  <label key={image.path} className="space-y-2">
                    <div className="relative aspect-4/5 overflow-hidden rounded-md bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.url} alt="Gallery" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <input type="checkbox" name="removeGallery" value={image.path} />
                      Remove
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No gallery images uploaded.</p>
            )}
            <input
              name="secondary"
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
              className="mt-1 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-sm file:font-medium file:text-background hover:file:opacity-80"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isUpdating ? 'Updating…' : 'Update Product'}
          </button>
        </form>

        <form action={deleteAction} className="space-y-3">
          <input type="hidden" name="productId" value={selected.id} />
          <button
            type="submit"
            disabled={isDeleting}
            className="w-full rounded-md border border-red-400 px-4 py-2.5 text-sm font-medium text-red-500 transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {isDeleting ? 'Removing…' : 'Remove Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
