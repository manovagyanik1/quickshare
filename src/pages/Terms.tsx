import React from 'react';
import { Shield, FileText, AlertCircle, Scale } from 'lucide-react';

export const Terms = () => {
  const sections = [
    {
      icon: <Shield className="h-8 w-8 text-blue-400" />,
      title: "Usage Guidelines",
      content: "When using our screen recording service, you agree to respect privacy and intellectual property rights, not record any confidential information, and take full responsibility for your recorded content."
    },
    {
      icon: <FileText className="h-8 w-8 text-blue-400" />,
      title: "Content Policy",
      content: "You retain all rights to your recordings. However, you must ensure your recordings don't violate any laws or third-party rights. We reserve the right to terminate accounts that violate these terms."
    },
    {
      icon: <AlertCircle className="h-8 w-8 text-blue-400" />,
      title: "Limitations",
      content: "Our service is provided 'as is' without warranties. We're not liable for any damages arising from use or inability to use our service, including data loss or business interruption."
    },
    {
      icon: <Scale className="h-8 w-8 text-blue-400" />,
      title: "Legal Compliance",
      content: "You agree to comply with all applicable laws and regulations when using our service. Any disputes will be resolved under the laws of the United States."
    }
  ];

  return (
    <div className="bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-300">
              Please read these terms carefully before using ScreenCast.
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

          <div className="space-y-12 text-gray-300">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Account Terms</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate information when creating an account</li>
                <li>You're responsible for maintaining account security</li>
                <li>Accounts cannot be shared between multiple users</li>
                <li>We reserve the right to suspend accounts for violations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Service Modifications</h2>
              <p>
                We reserve the right to modify or discontinue any part of our service
                with or without notice. We shall not be liable to you or any third party
                for any modification, suspension, or discontinuance of the service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
              <p>
                Questions about these Terms should be sent to{' '}
                <a href="mailto:legal@screencast.com" className="text-blue-400 hover:text-blue-300">
                  legal@screencast.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};