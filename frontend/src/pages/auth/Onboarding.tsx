import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Users, Calendar, MessageSquare, UserCircle } from 'lucide-react';

const steps = [
  {
    title: 'Find Your Community',
    desc: 'Discover groups that share your interests, profession, or culture.',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    title: 'Attend Events',
    desc: 'Join online meetups or local in-person gatherings to connect.',
    icon: Calendar,
    color: 'bg-green-500'
  },
  {
    title: 'Meaningful Conversations',
    desc: 'Message leaders and members safely within the platform.',
    icon: MessageSquare,
    color: 'bg-purple-500'
  },
  {
    title: 'Set Up Your Profile',
    desc: 'Let others know a bit about you to foster better connections.',
    icon: UserCircle,
    color: 'bg-orange-500'
  }
];

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full text-center">
        
        <div className="w-full relative h-64 mb-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className={`w-32 h-32 ${steps[currentStep].color} text-white rounded-full flex items-center justify-center mb-8 shadow-xl`}>
                {React.createElement(steps[currentStep].icon, { size: 64 })}
              </div>
              <h2 className="text-3xl font-heading font-bold mb-4">{steps[currentStep].title}</h2>
              <p className="text-gray-600 text-lg">{steps[currentStep].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
      
      <div className="p-8 max-w-lg mx-auto w-full">
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-primary' : 'w-2 bg-gray-200'}`}
            />
          ))}
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            className="flex-1" 
            onClick={() => navigate('/dashboard')}
          >
            Skip
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
