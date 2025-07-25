import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4">
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">ProductForge</h1>
          <p className="text-secondary">Product Management Suite</p>
        </div>

        {/* Auth form container */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="p-6 border-b border-light">
            <h2 className="text-xl font-semibold text-primary text-center">{title}</h2>
            <p className="text-secondary text-sm text-center mt-2">{subtitle}</p>
          </div>
          
          <div className="p-6">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-muted text-sm">
          <p>© 2024 ProductForge. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;