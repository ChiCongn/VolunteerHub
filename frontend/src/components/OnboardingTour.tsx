import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { CheckCircle } from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: '👋 Welcome to VolunteerHub!',
      description: 'Your journey to making a difference starts here. Let us show you around!',
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop',
    },
    {
      title: '📅 Discover Events',
      description: 'Browse through various volunteer opportunities filtered by category, location, and your interests. Click "Join Event" to register!',
      image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=400&h=300&fit=crop',
    },
    {
      title: '💬 Share Your Experience',
      description: 'Use the floating "+" button to create posts, share your volunteer stories, and inspire others in the community.',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop',
    },
    {
      title: '👤 Manage Your Profile',
      description: 'Track your volunteer hours, update your bio, and showcase your impact. Your profile helps us recommend relevant events.',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
    },
    {
      title: '🎉 You\'re All Set!',
      description: 'Start exploring events, connect with fellow volunteers, and make a positive impact in your community!',
      image: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=400&h=300&fit=crop',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{step.title}</DialogTitle>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg overflow-hidden mb-4">
            <img
              src={step.image}
              alt={step.title}
              className="w-full h-48 object-cover"
            />
          </div>

          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-[#43A047]'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isLastStep}
          >
            Skip Tour
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrev}>
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="bg-[#43A047] hover:bg-[#388E3C]"
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Get Started
                </>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
