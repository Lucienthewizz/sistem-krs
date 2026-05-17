import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import api from '../api';

export default function MahasiswaList() {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [dosenList, setDosenList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', nama: '', nim: '', dosen_pembimbing_id: '' });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [mhsRes, dosenRes] = await Promise.all([
        api.get('/mahasiswa'),
        api.get('/dosen')
      ]);
      setMahasiswa(mhsRes.data);
      setDosenList(dosenRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.id) {
        await api.put(`/mahasiswa/${formData.id}`, formData);
      } else {
        await api.post('/mahasiswa', formData);
      }
      setIsModalOpen(false);
      fetchData();
      setFormData({ id: '', nama: '', nim: '', dosen_pembimbing_id: '' });
    } catch (error) {
      console.error('Failed to save mahasiswa', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (m) => {
    setFormData({
      id: m.id,
      nama: m.nama,
      nim: m.nim,
      dosen_pembimbing_id: m.dosen_pembimbing_id
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus mahasiswa ini?')) {
      try {
        await api.delete(`/mahasiswa/${id}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete mahasiswa', error);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white border-l-4 border-primary pl-3">Data Mahasiswa</h2>
        <button 
          onClick={() => { setFormData({ id: '', nama: '', nim: '', dosen_pembimbing_id: '' }); setIsModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Mahasiswa
        </button>
      </div>

      <div className="card overflow-hidden !p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="table-header">NIM</th>
              <th className="table-header">Nama Mahasiswa</th>
              <th className="table-header">Dosen Pembimbing</th>
              <th className="table-header text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {mahasiswa.map((m) => (
              <tr key={m.id} className="hover:bg-dark-700/30 transition-colors group">
                <td className="table-cell font-mono">{m.nim}</td>
                <td className="table-cell font-medium text-white">{m.nama}</td>
                <td className="table-cell">
                  <span className="px-2 py-1 bg-dark-700 text-xs rounded border border-dark-600">
                    {m.dosen_pembimbing?.nama || 'Belum dipilih'}
                  </span>
                </td>
                <td className="table-cell text-right space-x-3">
                  <button onClick={() => handleEdit(m)} className="text-gray-400 hover:text-primary transition-colors">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {mahasiswa.length === 0 && (
              <tr>
                <td colSpan="4" className="table-cell text-center py-8 text-gray-500">Tidak ada data mahasiswa.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white">
              {formData.id ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">NIM</label>
                <input
                  type="text"
                  required
                  value={formData.nim}
                  onChange={(e) => setFormData({...formData, nim: e.target.value})}
                  className="input-field"
                  placeholder="Masukkan NIM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nama Mahasiswa</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="input-field"
                  placeholder="Nama Lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Dosen Pembimbing</label>
                <select
                  required
                  value={formData.dosen_pembimbing_id}
                  onChange={(e) => setFormData({...formData, dosen_pembimbing_id: e.target.value})}
                  className="input-field appearance-none"
                >
                  <option value="" disabled>Pilih Dosen Pembimbing</option>
                  {dosenList.map(d => (
                    <option key={d.id} value={d.id} className="bg-dark-800 text-white">{d.nama}</option>
                  ))}
                </select>
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
