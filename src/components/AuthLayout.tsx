
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">Regulation 44</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <p className="mt-2 text-gray-600">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
      
      {/* Right side - Background */}
      <div className="hidden lg:block flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative h-full flex items-center justify-center p-12">
            <div className="text-center text-white">
              <h3 className="text-4xl font-bold mb-6">Reporting Platform</h3>
              <p className="text-xl opacity-90 mb-8">Manage homes and create reports with ease</p>
              <div className="grid grid-cols-3 gap-8 text-center">
                <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
                  <div className="text-3xl font-bold">3</div>
                  <div className="text-sm opacity-75">Registered Homes</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
                  <div className="text-3xl font-bold">23</div>
                  <div className="text-sm opacity-75">Total Reports</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
                  <div className="text-3xl font-bold">3</div>
                  <div className="text-sm opacity-75">Visits Due</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
