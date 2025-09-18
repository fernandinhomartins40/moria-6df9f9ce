import React from 'react'

function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🚗 Moria Peças & Serviços</h1>
      <p>Sistema de gestão automotiva com Prisma</p>
      <p style={{ color: '#666' }}>
        Frontend containerizado com nginx + proxy reverso
      </p>
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => fetch('/api/health').then(r => r.text()).then(console.log)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Testar API Health
        </button>
      </div>
    </div>
  )
}

export default App