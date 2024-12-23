import React from 'react';
import { Users, Shield, Zap, Globe } from 'lucide-react';

export const About = () => {
  const stats = [
    { label: 'Active Users', value: '100K+' },
    { label: 'Countries', value: '150+' },
    { label: 'Enterprise Clients', value: '500+' },
    { label: 'Recordings Made', value: '1M+' }
  ];

  const values = [
    {
      icon: <Shield className="h-8 w-8 text-blue-400" />,
      title: 'Privacy First',
      description: 'Your recordings stay on your device, ensuring complete privacy and security.'
    },
    {
      icon: <Zap className="h-8 w-8 text-blue-400" />,
      title: 'Lightning Fast',
      description: 'Start recording in seconds with our optimized recording engine.'
    },
    {
      icon: <Globe className="h-8 w-8 text-blue-400" />,
      title: 'Global Reach',
      description: 'Used by professionals across 150+ countries worldwide.'
    }
  ];

  return (
    <div className="bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            About <span className="text-blue-400">ScreenCast</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Founded in 2023, ScreenCast emerged from a simple vision: making screen recording accessible to everyone.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <p className="text-3xl font-bold text-blue-400">{stat.value}</p>
              <p className="text-gray-300">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-12 text-center border border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-6">Join Thousands of Satisfied Users</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From individual creators to Fortune 500 companies, ScreenCast is trusted by users worldwide
            for its reliability, ease of use, and powerful features.
          </p>
        </div>
      </div>
    </div>
  );
};