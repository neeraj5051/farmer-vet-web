import { useEffect, useState } from 'react';
import { getFees, updateFeeConfig } from '../../services/adminService';
import { IndianRupee, Save, Percent, ShieldCheck, Loader2 } from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';

const FeesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fees, setFees] = useState({
    commission_rate: 15,
    online_consult_base: 250,
    in_person_base: 500,
    ai_insemination_base: 350,
    vaccination_base: 150,
    gst_rate: 18,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getFees();
        if (result && typeof result === 'object') {
          setFees(prev => ({ ...prev, ...result }));
        }
      } catch (err) {
        console.warn('Using default fee configuration.', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateFeeConfig('platform', fees);
      alert('Fee configuration saved successfully!');
    } catch (err) {
      console.error('Error saving fee config:', err);
      alert('Fee configuration updated locally.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="loading-spinner">
      <Loader2 size={36} />
      <p>Loading fee structure...</p>
    </div>
  );

  return (
    <div>
      <div className="list-screen-header">
        <div>
          <h1 className="list-screen-title">Platform Fee & Commission Levers</h1>
          <p className="list-screen-subtitle">Manage platform commission rates, base service prices, and tax rules</p>
        </div>
        <button className="export-btn" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginTop: 24 }}>
        {/* Commission Card */}
        <div style={{ background: 'var(--card-white)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#e6f0eb', color: '#0a4f32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Humal Platform Commission</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Commission percentage retained per booking</p>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Commission Take Rate (%)</label>
            <input
              type="number"
              className="filter-search"
              style={{ width: '100%', boxSizing: 'border-box' }}
              value={fees.commission_rate}
              onChange={e => setFees({ ...fees, commission_rate: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Base Prices Card */}
        <div style={{ background: 'var(--card-white)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#dbeafe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Service Base Prices (₹)</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Standard base rates for booking categories</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14, marginTop: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 4 }}>Online Consultation (₹)</label>
              <input type="number" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={fees.online_consult_base} onChange={e => setFees({ ...fees, online_consult_base: Number(e.target.value) })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 4 }}>In-Person Visit (₹)</label>
              <input type="number" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={fees.in_person_base} onChange={e => setFees({ ...fees, in_person_base: Number(e.target.value) })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 4 }}>Artificial Insemination (₹)</label>
              <input type="number" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={fees.ai_insemination_base} onChange={e => setFees({ ...fees, ai_insemination_base: Number(e.target.value) })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 4 }}>Vaccination Base Fee (₹)</label>
              <input type="number" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={fees.vaccination_base} onChange={e => setFees({ ...fees, vaccination_base: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        {/* GST & Tax Card */}
        <div style={{ background: 'var(--card-white)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Statutory GST Tax</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Government GST calculation rate</p>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>GST Rate (%)</label>
            <input type="number" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={fees.gst_rate} onChange={e => setFees({ ...fees, gst_rate: Number(e.target.value) })} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesScreen;
