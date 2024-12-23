import React from 'react';
import { Monitor, Mic, Share2, Shield, Zap, Video } from 'lucide-react';

export const Features = () => {
  const features = [
    {
      icon: <Monitor className="h-8 w-8 text-blue-400" />,
      title: 'Screen Capture',
      description: 'Record your entire screen or choose specific windows with crystal clear quality.'
    },
    {
      icon: <Mic className="h-8 w-8 text-blue-400" />,
      title: 'Audio Recording',
      description: 'Capture system audio and microphone input simultaneously with noise suppression.'
    },
    {
      icon: <Share2 className="h-8 w-8 text-blue-400" />,
      title: 'Easy Sharing',
      description: 'Share your recordings instantly with your team or download for later use.'
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-400" />,
      title: 'Secure Recording',
      description: 'Your recordings are processed locally and never stored on our servers.'
    },
    {
      icon: <Zap className="h-8 w-8 text-blue-400" />,
      title: 'Lightning Fast',
      description: 'Start recording with just one click - no setup or downloads required.'
    },
    {
      icon: <Video className="h-8 w-8 text-blue-400" />,
      title: 'HD Quality',
      description: 'Record in high definition with support for up to 4K resolution.'
    }
  ];

  return (
    <section className="py-24 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Everything You Need to Record
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Our screen recorder comes packed with all the essential features you need
            for professional screen capture and sharing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-gray-900 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors shadow-lg hover:shadow-xl"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};