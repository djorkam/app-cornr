import { useState } from 'react';
import { authService } from '../services/authService';

export const TestAuthButton = () => {
  const [testResult, setTestResult] = useState('');

  const handleTestSignup = async () => {
    setTestResult('Testing...');
    
    const result = await authService.signUp({
      email: 'testuser2@example.com',
      password: 'TestPass123!',
      name: 'Test User 2',
      birthdate: '1995-05-15',
      gender: 'man'
    });
    
    if (result.error) {
      setTestResult(`❌ Error: ${result.error.message}`);
      console.error('Signup failed:', result.error);
    } else {
      setTestResult(`✅ Success! User ID: ${result.data?.user.id}`);
      console.log('Signup success:', result.data);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '100px', 
      right: '20px', 
      background: 'white', 
      padding: '20px',
      border: '2px solid red',
      borderRadius: '8px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Test Signup</h3>
      <button 
        onClick={handleTestSignup}
        style={{ 
          padding: '10px 20px', 
          background: '#B19CD9',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          width: '100%',
          marginBottom: '10px'
        }}
      >
        Test Create User
      </button>
      {testResult && (
        <p style={{ 
          margin: 0, 
          fontSize: '14px',
          wordBreak: 'break-word'
        }}>
          {testResult}
        </p>
      )}
    </div>
  );
};