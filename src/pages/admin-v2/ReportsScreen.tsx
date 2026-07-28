import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Filter } from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';

const REPORTS = [
  { id: 'rep-1', title: 'Consultations & Bookings Report', desc: 'Complete booking audit log with farmer, vet, status, and district details.', type: 'CSV' },
  { id: 'rep-2', title: 'Financial Revenue & Take Rate Summary', desc: 'Gross revenue, Humal commission, vet payouts, and statutory GST totals.', type: 'CSV' },
  { id: 'rep-3', title: 'Veterinarian Earnings & Settlement Statement', desc: 'Individual vet payout statements, bank account refs, and pending dues.', type: 'PDF' },
  { id: 'rep-4', title: 'State & District Performance Report', desc: 'District-wise breakdown of active farmers, consultation volume, and growth.', type: 'CSV' },
];

const ReportsScreen = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (id: string, title: string) => {
    setDownloading(id);
    setTimeout(() => {
      setDownloading(null);
      alert(`Report "${title}" generated and downloaded successfully!`);
    }, 1200);
  };

  return (
    <div>
      <div className="list-screen-header">
        <div>
          <h1 className="list-screen-title">Reports & Export Center</h1>
          <p className="list-screen-subtitle">Generate bulk operational, financial, and GST compliance reports</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {REPORTS.map(rep => (
          <div key={rep.id} style={{ background: 'var(--card-white)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: rep.type === 'CSV' ? '#dcfce7' : '#fee2e2', color: rep.type === 'CSV' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {rep.type === 'CSV' ? <FileSpreadsheet size={20} /> : <FileText size={20} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{rep.title}</h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Format: {rep.type}</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rep.desc}</p>
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Filter size={14} /> Respects global date & state filters
              </span>
              <button
                className="export-btn"
                onClick={() => handleDownload(rep.id, rep.title)}
                disabled={downloading === rep.id}
              >
                <Download size={15} />
                {downloading === rep.id ? 'Generating...' : `Export ${rep.type}`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsScreen;
