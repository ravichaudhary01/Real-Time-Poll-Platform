
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

const moods = [
  { emoji: '😄', label: 'Excellent', value: 'excellent' },
  { emoji: '😊', label: 'Good', value: 'good' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😔', label: 'Not Great', value: 'not-great' },
  { emoji: '😢', label: 'Terrible', value: 'terrible' }
];

export function MoodCheckIn({ open, onOpenChange, onSubmit }) {
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Choose how you're feeling today",
        variant: "destructive"
      });
      return;
    }

    const moodEmoji = moods.find(m => m.value === selectedMood)?.emoji || '😊';
    onSubmit(moodEmoji, note);
    
    // Reset form
    setSelectedMood('');
    setNote('');
    onOpenChange(false);
    
    toast({
      title: "Mood recorded! 🎉",
      description: "Thanks for checking in. You earned 10 XP!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-0 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            How are you feeling?
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-center">
            Take a moment to check in with yourself
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-5 gap-3">
            {moods.map((mood, index) => (
              <motion.button
                key={mood.value}
                type="button"
                onClick={() => setSelectedMood(mood.value)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedMood === mood.value
                    ? 'border-purple-400 bg-purple-400/20 scale-110'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-3xl mb-1">{mood.emoji}</div>
                <div className="text-xs text-gray-300">{mood.label}</div>
              </motion.button>
            ))}
          </div>
          
          <div>
            <Textarea
              placeholder="What's on your mind? (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              Save Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
