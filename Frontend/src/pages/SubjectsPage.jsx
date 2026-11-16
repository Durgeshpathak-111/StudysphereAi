import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [semester, setSemester] = useState(1);
  const [unitTitle, setUnitTitle] = useState('');
  const [units, setUnits] = useState([]);
  const [error, setError] = useState('');

  const fetchSubjects = async () => {
    const { data } = await api.get('/subjects');
    setSubjects(data.data.subjects);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const addUnit = () => {
    if (!unitTitle.trim()) return;
    setUnits([...units, { unitNumber: units.length + 1, title: unitTitle.trim(), topics: [] }]);
    setUnitTitle('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/subjects', { name, code, semester, units });
      setName('');
      setCode('');
      setUnits([]);
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create subject');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <form onSubmit={handleCreate} className="lg:col-span-5 p-6 rounded-xl border border-current/10 space-y-4 h-fit">
        <h2 className="font-bold text-lg">Create Academic Subject</h2>
        {error && <p className="text-xs text-red-500">{error}</p>}

        <input
          required
          placeholder="Subject Name (e.g., Operating Systems)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Subject Code (e.g., KCS-401)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
          />
          <input
            type="number"
            min={1}
            max={12}
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              placeholder="Add Unit Title (e.g., Unit 1: Process Management)"
              value={unitTitle}
              onChange={(e) => setUnitTitle(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
            />
            <button type="button" onClick={addUnit} className="px-3 py-2 rounded-lg border border-current/20 text-xs font-semibold">
              + Unit
            </button>
          </div>
          {units.map((u) => (
            <div key={u.unitNumber} className="text-xs px-3 py-1.5 rounded bg-emerald-600/10 text-emerald-600">
              Unit {u.unitNumber}: {u.title}
            </div>
          ))}
        </div>

        <button className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold">
          Save Subject
        </button>
      </form>

      <div className="lg:col-span-7 space-y-3">
        <h2 className="font-bold text-lg">Your Subjects ({subjects.length})</h2>
        {subjects.length === 0 ? (
          <p className="text-sm opacity-60">No subjects created yet. Add your first subject on the left.</p>
        ) : (
          subjects.map((sub) => (
            <div key={sub._id} className="p-4 rounded-xl border border-current/10 flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-emerald-600">
                  Semester {sub.semester} {sub.code ? `• ${sub.code}` : ''}
                </span>
                <h3 className="font-bold text-base">{sub.name}</h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {sub.units?.map((u) => (
                    <span key={u.unitNumber} className="text-xs px-2 py-0.5 rounded border border-current/15">
                      U{u.unitNumber}: {u.title}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleDelete(sub._id)}
                className="text-xs text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}