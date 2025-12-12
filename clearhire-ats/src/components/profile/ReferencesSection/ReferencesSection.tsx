import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { ReferenceItem } from '../ReferenceItem';
import { Reference } from '../../../types/profile';

interface ReferencesSectionProps {
  references: Reference[];
  onUpdate: (references: Reference[]) => void;
}

export const ReferencesSection: React.FC<ReferencesSectionProps> = ({
  references,
  onUpdate,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    const newReference: Reference = {
      id: `ref-${Date.now()}`,
      name: '',
      email: '',
      phone: '',
      attachmentUrl: '',
    };

    onUpdate([...references, newReference]);
    setIsAdding(true);
  };

  const handleUpdate = (updatedReference: Reference) => {
    const updatedList = references.map(ref =>
      ref.id === updatedReference.id ? updatedReference : ref
    );
    onUpdate(updatedList);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    const updatedList = references.filter(ref => ref.id !== id);
    onUpdate(updatedList);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Referencias</h3>
          <p className="text-sm text-slate-600 mt-1">
            Agrega personas que puedan dar referencias sobre tu trabajo
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={isAdding}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar Referencia
        </button>
      </div>

      {/* References List */}
      <div className="space-y-4">
        {references.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No has agregado referencias</p>
            <p className="text-sm text-slate-500 mt-1">
              Haz clic en "Agregar Referencia" para comenzar
            </p>
          </div>
        ) : (
          references.map(ref => (
            <ReferenceItem
              key={ref.id}
              reference={ref}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};
