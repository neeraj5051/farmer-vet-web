import React from 'react';

interface RevenueSplitProps {
  farmerPaid?: number;
  gst?: number;
  humalShare?: number;
  vetShare?: number;
}

const RevenueSplitSankey: React.FC<RevenueSplitProps> = ({
  farmerPaid = 124560,
  gst = 18960,
  humalShare = 24912,
  vetShare = 80688,
}) => {
  const total = farmerPaid || 1;
  const gstPct = Math.round((gst / total) * 100);
  const humalPct = Math.round((humalShare / total) * 100);
  const vetPct = Math.round((vetShare / total) * 100);

  return (
    <div style={{
      backgroundColor: 'var(--card-white)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      height: '380px'
    }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 24px 0' }}>Revenue Split (Today)</h3>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '280px' }}>
        {/* Left: Source */}
        <div style={{ 
          flex: '0 0 140px', 
          height: '200px', 
          backgroundColor: '#dcfce7', 
          borderRadius: '12px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 500 }}>Farmer Paid</div>
          <div style={{ fontSize: '1.3rem', color: '#166534', fontWeight: 700, marginTop: 4 }}>₹{farmerPaid.toLocaleString()}</div>
        </div>

        {/* Center: Flow Lines (SVG) */}
        <div style={{ flex: 1, position: 'relative', height: '260px' }}>
          <svg width="100%" height="100%" viewBox="0 0 200 260" preserveAspectRatio="none">
            {/* GST Flow */}
            <path d="M 0,100 C 60,100 140,30 200,30" fill="none" stroke="#ef4444" strokeWidth="20" strokeOpacity="0.15" />
            <path d="M 0,100 C 60,100 140,30 200,30" fill="none" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.4" />
            
            {/* Humal Flow */}
            <path d="M 0,130 C 60,130 140,130 200,130" fill="none" stroke="#3b82f6" strokeWidth="28" strokeOpacity="0.12" />
            <path d="M 0,130 C 60,130 140,130 200,130" fill="none" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.4" />
            
            {/* Vet Flow */}
            <path d="M 0,160 C 60,160 140,230 200,230" fill="none" stroke="#10b981" strokeWidth="40" strokeOpacity="0.12" />
            <path d="M 0,160 C 60,160 140,230 200,230" fill="none" stroke="#10b981" strokeWidth="2" strokeOpacity="0.4" />
          </svg>
        </div>

        {/* Right: Destinations */}
        <div style={{ flex: '0 0 160px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* GST */}
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: '#fee2e2', 
            borderRadius: '10px', 
            border: '1px solid #fecaca'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>GST ({gstPct}%)</div>
            <div style={{ fontSize: '1.1rem', color: '#991b1b', fontWeight: 700, marginTop: 2 }}>₹{gst.toLocaleString()}</div>
          </div>
          
          {/* Humal */}
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: '#dbeafe', 
            borderRadius: '10px', 
            border: '1px solid #bfdbfe'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>Humal Share ({humalPct}%)</div>
            <div style={{ fontSize: '1.1rem', color: '#1e40af', fontWeight: 700, marginTop: 2 }}>₹{humalShare.toLocaleString()}</div>
          </div>
          
          {/* Vet */}
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: '#dcfce7', 
            borderRadius: '10px', 
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>Vet Share ({vetPct}%)</div>
            <div style={{ fontSize: '1.1rem', color: '#166534', fontWeight: 700, marginTop: 2 }}>₹{vetShare.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueSplitSankey;
