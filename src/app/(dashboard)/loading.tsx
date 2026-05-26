export default function Loading() {
  return (
    <div style={{
      padding: '32px 40px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      animation: 'pulse 1.4s ease-in-out infinite',
    }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
      <div style={{ height: 28, width: 180, borderRadius: 8, background: 'rgba(255,255,255,.06)' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginTop: 4 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 100, borderRadius: 12, background: 'rgba(255,255,255,.05)' }} />
        ))}
      </div>
      <div style={{ height: 320, borderRadius: 14, background: 'rgba(255,255,255,.04)', marginTop: 4 }} />
    </div>
  )
}
