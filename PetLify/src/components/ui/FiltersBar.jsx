import { useState } from 'react';

const speciesOptions = [
  { value: '', label: 'Wszystkie' },
  { value: 'dog', label: 'Pies' },
  { value: 'cat', label: 'Kot' },
  { value: 'bird', label: 'Ptak' },
  { value: 'rodent', label: 'Gryzoń' },
  { value: 'reptile', label: 'Gad' },
  { value: 'other', label: 'Inne' },
];

export default function FiltersBar({ initial, onApply, onReset }) {
  const [form, setForm] = useState({
    species: initial.species || '',
    breed: initial.breed || '',
    city: initial.city || '',
    // daty usunięte
    min_age: initial.min_age || '',
    max_age: initial.max_age || '',
    order: initial.order || 'newest',
  });

  function setField(k, v) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  // „obcinamy” 0 i minusy na wejściu
  function clampAge(v) {
    if (v === '' || v === null) return '';
    const n = Math.max(1, Number(v) || 1);
    return String(n);
  }

  return (
    <div className="w-full bg-main rounded-2xl p-3 flex flex-col gap-3 shadow-[0_6px_18px_rgba(0,0,0,.35)]">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {/* Gatunek */}
        <div className="md:col-span-1">
          <label className="block text-sm text-accent mb-1">Gatunek</label>
          <select
            className="w-full bg-secondary rounded-md px-2 py-2"
            value={form.species}
            onChange={(e) => setField('species', e.target.value)}
          >
            {speciesOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Rasa */}
        <div className="md:col-span-2">
          <label className="block text-sm text-accent mb-1">Rasa</label>
          <input
            className="w-full bg-secondary rounded-md px-2 py-2"
            placeholder="np. Dobermann"
            value={form.breed}
            onChange={(e) => setField('breed', e.target.value)}
          />
        </div>

        {/* Miasto */}
        <div className="md:col-span-1">
          <label className="block text-sm text-accent mb-1">Miasto</label>
          <input
            className="w-full bg-secondary rounded-md px-2 py-2"
            placeholder="np. Poznań"
            value={form.city}
            onChange={(e) => setField('city', e.target.value)}
          />
        </div>

        {/* (puste miejsca po datach zniknęły) */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        {/* Wiek od / do */}
        <div>
          <label className="block text-sm text-accent mb-1">Wiek od (lata)</label>
          <input
            type="number"
            min="1"
            className="w-full bg-secondary rounded-md px-2 py-2"
            value={form.min_age}
            onChange={(e) => setField('min_age', clampAge(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm text-accent mb-1">Wiek do (lata)</label>
          <input
            type="number"
            min="1"
            className="w-full bg-secondary rounded-md px-2 py-2"
            value={form.max_age}
            onChange={(e) => setField('max_age', clampAge(e.target.value))}
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm text-accent mb-1">Sortowanie</label>
          <select
            className="w-full bg-secondary rounded-md px-2 py-2"
            value={form.order}
            onChange={(e) => setField('order', e.target.value)}
          >
            <option value="newest">Najnowsze</option>
            <option value="oldest">Najstarsze</option>
          </select>
        </div>

        {/* Akcje */}
        <div className="md:col-span-3 flex gap-2 justify-end">
          <button
            className="bg-cta rounded-md px-4 py-2 cursor-pointer"
            onClick={() => onApply(form)}
          >
            Filtruj
          </button>
          <button
            className="bg-black/30 rounded-md px-4 py-2 cursor-pointer"
            onClick={onReset}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
