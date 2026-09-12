import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Findr — Multi-Keyword PDF Search';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #F5F5F7, #E5E5EA)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '40%',
            height: '40%',
            background: 'linear-gradient(to right, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
            filter: 'blur(100px)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '40%',
            height: '40%',
            background: 'linear-gradient(to left, rgba(59,130,246,0.2), rgba(34,211,238,0.2))',
            filter: 'blur(100px)',
            borderRadius: '50%',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.7)',
            padding: '60px 80px',
            borderRadius: '40px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          <div
            style={{
              fontSize: '84px',
              fontWeight: 800,
              color: '#1C1C1E',
              letterSpacing: '-2px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Findr
            <span style={{ color: '#3B82F6', marginLeft: '8px' }}>.</span>
          </div>
          
          <div
            style={{
              fontSize: '36px',
              fontWeight: 500,
              color: '#4B5563',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            Temukan setiap kata di PDF Anda sekaligus.
          </div>

          <div
            style={{
              marginTop: '40px',
              display: 'flex',
              background: '#F3F4F6',
              padding: '12px 24px',
              borderRadius: '20px',
              color: '#6B7280',
              fontSize: '24px',
              fontWeight: 600,
            }}
          >
            Aman · Lokal · Instan
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
