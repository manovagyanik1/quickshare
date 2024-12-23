import React from 'react';
import { Shield, Lock, Eye, Server, UserCheck, Bell } from 'lucide-react';

export const Privacy = () => {
  const sections = [
    {
      icon: <Shield className="h-8 w-8 text-blue-400" />,
      title: "Data Protection",
      content: "We employ industry-standard encryption and security measures to protect your data. All recordings are processed locally on your device and are never transmitted to our servers without your explicit consent."
    },
    {
      icon: <Lock className="h-8 w-8 text-blue-400" />,
      title: "Information Security",
      content: "Our infrastructure is hosted on secure cloud providers with SOC 2 and ISO 27001 certifications. We regularly conduct security audits and penetration testing to ensure your data remains protected."
    },
    {
      icon: <Eye className="h-8 w-8 text-blue-400" />,
      title: "Privacy Controls",
      content: "You have complete control over your privacy settings. Choose what to record, when to record, and who can access your recordings. We never share your data with third parties without your permission."
    }
  ];

  return (
    <div className="bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-300">
              Your privacy is our top priority. We're committed to protecting your data
              and providing transparency about how we handle your information.
            </p>
          </div>

          <div className="grid gap-8 mb-16">
            {sections.map((section, index) => (
              <div key={index} className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <div className="flex items-center mb-4">
                  {section.icon}
                  <h2 className="text-2xl font-bold text-white ml-4">{section.title}</h2>
                </div>
                <p className="text-gray-300 text-lg">{section.content}</p>
              </div>
            ))}
          </div>
          
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Information We Collect</h2>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start">
                  <Server className="h-6 w-6 text-blue-400 mr-4 mt-1" />
                  <span>Screen recordings and audio recordings you create (stored locally)</span>
                </li>
                <li className="flex items-start">
                  <UserCheck className="h-6 w-6 text-blue-400 mr-4 mt-1" />
                  <span>Account information (if you create an account)</span>
                </li>
                <li className="flex items-start">
                  <Bell className="h-6 w-6 text-blue-400 mr-4 mt-1" />
                  <span>Technical information about your device and browser</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
              <p className="text-gray-300 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-8 text-gray-300 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to processing of your information</li>
                <li>Data portability</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                <a href="mailto:privacy@screencast.com" className="text-blue-400 hover:text-blue-300">
                  privacy@screencast.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};