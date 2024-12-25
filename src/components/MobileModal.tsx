import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Smartphone, Computer } from 'lucide-react';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileModal: React.FC<MobileModalProps> = ({ isOpen, onClose }) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog 
      as="div" 
      className="relative z-50"
      onClose={onClose}
    >
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-8 shadow-2xl transition-all">
              <div className="text-center relative">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute -right-2 -top-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Icons with animation */}
                <div className="flex justify-center items-center space-x-6 mb-8">
                  <div className="animate-bounce">
                    <Smartphone className="w-14 h-14 text-red-500" />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-gray-400 text-sm mb-1">Not Compatible</div>
                    <div className="w-24 h-1 bg-gray-700 rounded-full">
                      <div className="w-0 h-full bg-red-500 rounded-full animate-progress"></div>
                    </div>
                  </div>
                  <div className="animate-pulse">
                    <Computer className="w-14 h-14 text-green-500" />
                  </div>
                </div>

                {/* Content */}
                <Dialog.Title 
                  as="h2" 
                  className="text-2xl font-bold text-white mb-4"
                >
                  Desktop Magic Only! ✨
                </Dialog.Title>
                
                <Dialog.Description 
                  as="p" 
                  className="text-gray-300 mb-6 leading-relaxed"
                >
                  Just like you can't park a 🐘 in a 🚗 parking spot, 
                  screen recording needs the power of a desktop computer!
                </Dialog.Description>

                {/* Features list */}
                <div className="bg-gray-700/50 rounded-xl p-4 mb-6 text-left">
                  <h3 className="text-white font-semibold mb-3">Why Desktop?</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Better performance & quality
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Full screen capture support
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Professional recording tools
                    </li>
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Got it, I'll use a desktop!
                  </button>
                  <button
                    onClick={onClose}
                    className="text-gray-400 text-sm hover:text-gray-300 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
); 