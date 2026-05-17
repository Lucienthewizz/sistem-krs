import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import api from '../api';

export default function DosenList() {
  const [dosen, setDosen] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', nama: '', nidn: '' });
  const [loading, setLoading] = useState(false);

  const fetchDosen = async () => {
    try {
      const res = await api.get('/dosen');
      setDosen(res.data);
    } catch (error) {
      console.error('Failed to fetch dosen', error);
    }
  };

  useEffect(() => {
    fetchDosen();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.id) {
        await api.put(`/dosen/${formData.id}`, { nama: formData.nama, nidn: formData.nidn });
      } else {
        await api.post('/dosen', { nama: formData.nama, nidn: formData.nidn });
      }
      setIsModalOpen(false);
      fetchDosen();
      setFormData({ id: '', nama: '', nidn: '' });
    } catch (error) {
      console.error('Failed to save dosen', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (d) => {
    setFormData(d);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus dosen ini?')) {
      try {
        await api.delete(`/dosen/${id}`);
        fetchDosen();
      } catch (error) {
        console.error('Failed to delete dosen', error);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white border-l-4 border-primary pl-3">Data Dosen</h2>
        <button 
          onClick={() => { setFormData({ id: '', nama: '', nidn: '' }); setIsModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Dosen
        </button>
      </div>

      <div className="card overflow-hidden !p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="table-header">NIDN</th>
              <th className="table-header">Nama Dosen</th>
              <th className="table-header text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {dosen.map((d) => (
              <tr key={d.id} className="hover:bg-dark-700/30 transition-colors group">
                <td className="table-cell font-mono">{d.nidn}</td>
                <td className="table-cell font-medium text-white">{d.nama}</td>
                <td className="table-cell text-right space-x-3">
                  <button onClick={() => handleEdit(d)} className="text-gray-400 hover:text-primary transition-colors">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {dosen.length === 0 && (
              <tr>
                <td colSpan="3" className="table-cell text-center py-8 text-gray-500">Tidak ada data dosen.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white">
              {formData.id ? 'Edit Dosen' : 'Tambah Dosen'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">NIDN</label>
                <input
                  type="text"
                  required
                  value={formData.nidn}
                  onChange={(e) => setFormData({...formData, nidn: e.target.value})}
                  className="input-field"
                  placeholder="Masukkan NIDN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nama Dosen</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="input-field"
                  placeholder="Nama Lengkap dengan Gelar"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
