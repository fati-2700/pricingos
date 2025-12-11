'use client';

import { useState, useMemo } from 'react';
import { Copy, Edit2, Save, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { GeneratedPackage } from '@/types/database';

interface PackagesListProps {
  packages: (GeneratedPackage & { project_types: { name: string } | null })[];
}

export default function PackagesList({ packages: initialPackages }: PackagesListProps) {
  const [packages, setPackages] = useState(initialPackages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ price: number; short_description: string; includes_text: string } | null>(null);
  // Memoize supabase client to prevent recreating on every render
  const supabase = useMemo(() => createClient(), []);

  const handleEdit = (pkg: typeof packages[0]) => {
    setEditingId(pkg.id);
    setEditData({
      price: pkg.price,
      short_description: pkg.short_description,
      includes_text: pkg.includes_text,
    });
  };

  const handleSave = async (id: string) => {
    if (!editData) return;

    const { error } = await (supabase as any)
      .from('generated_packages')
      .update({
        price: editData.price,
        short_description: editData.short_description,
        includes_text: editData.includes_text,
      })
      .eq('id', id);

    if (!error) {
      setPackages(
        packages.map((p) => (p.id === id ? { ...p, ...editData } : p))
      );
      setEditingId(null);
      setEditData(null);
    }
  };

  const handleCopy = (pkg: typeof packages[0]) => {
    const projectTypeName = pkg.project_types?.name || 'Project';
    const text = `${projectTypeName} - ${pkg.package_name} Package

${pkg.short_description}

Price: $${pkg.price}

What's Included:
${pkg.includes_text}

---

Ready to get started? Let me know if you have any questions!`;

    navigator.clipboard.writeText(text);
    alert('Package copied to clipboard!');
  };

  if (packages.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">No packages generated yet.</p>
        <p className="mt-2 text-sm text-gray-500">
          Use the wizard to generate your first packages.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => {
        const isEditing = editingId === pkg.id;
        const projectTypeName = pkg.project_types?.name || 'Project';

        return (
          <div
            key={pkg.id}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {projectTypeName}
                </h3>
                <p className="mt-1 text-sm font-medium text-primary-600">
                  {pkg.package_name}
                </p>
              </div>
            </div>

            {isEditing ? (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price (€)
                  </label>
                  <input
                    type="number"
                    value={editData?.price || 0}
                    onChange={(e) =>
                      setEditData({
                        ...editData!,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={editData?.short_description || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData!,
                        short_description: e.target.value,
                      })
                    }
                    rows={2}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Includes (one per line)
                  </label>
                  <textarea
                    value={editData?.includes_text || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData!,
                        includes_text: e.target.value,
                      })
                    }
                    rows={4}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSave(pkg.id)}
                    className="flex items-center space-x-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditData(null);
                    }}
                    className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">${pkg.price}</p>
                  <p className="mt-2 text-sm text-gray-600">{pkg.short_description}</p>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">What's Included:</h4>
                  <div className="mt-2 whitespace-pre-line text-sm text-gray-600">
                    {pkg.includes_text}
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="flex flex-1 items-center justify-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleCopy(pkg)}
                    className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}


