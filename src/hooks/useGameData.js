
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export function useGameData(userId) {
  const [gameData, setGameData] = useState({
    xp: 0,
    level: 1,
    streak: 0,
    lastAction: null,
    totalActions: 0,
    achievements: [],
    moodEntries: []
  });

  const storageKey = `game_data_${userId}`;

  useEffect(() => {
    if (userId) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setGameData(JSON.parse(saved));
      }
    }
  }, [userId, storageKey]);

  const saveGameData = (newData) => {
    const updatedData = { ...gameData, ...newData };
    setGameData(updatedData);
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
  };

  const addXP = (amount, action) => {
    const newXP = gameData.xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const leveledUp = newLevel > gameData.level;
    
    const newData = {
      xp: newXP,
      level: newLevel,
      lastAction: {
        type: action,
        timestamp: new Date().toISOString(),
        xpGained: amount
      },
      totalActions: gameData.totalActions + 1
    };

    // Update streak logic
    const today = new Date().toDateString();
    const lastActionDate = gameData.lastAction ? new Date(gameData.lastAction.timestamp).toDateString() : null;
    
    if (lastActionDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();
      
      if (lastActionDate === yesterdayString) {
        newData.streak = gameData.streak + 1;
      } else if (lastActionDate !== today) {
        newData.streak = 1;
      }
    }

    saveGameData(newData);

    if (leveledUp) {
      toast({
        title: "🎉 Level Up!",
        description: `Congratulations! You've reached level ${newLevel}!`,
        duration: 5000,
      });
    }

    toast({
      title: `+${amount} XP`,
      description: `Great job! You earned XP for ${action}`,
      duration: 3000,
    });
  };

  const addMoodEntry = (mood, note) => {
    const entry = {
      id: Date.now(),
      mood,
      note,
      timestamp: new Date().toISOString()
    };

    const newMoodEntries = [entry, ...gameData.moodEntries].slice(0, 10); // Keep last 10 entries
    saveGameData({ moodEntries: newMoodEntries });
    addXP(10, 'mood check-in');
  };

  const getXPForNextLevel = () => {
    return gameData.level * 100;
  };

  const getXPProgress = () => {
    const currentLevelXP = (gameData.level - 1) * 100;
    const nextLevelXP = gameData.level * 100;
    const progressXP = gameData.xp - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    return (progressXP / neededXP) * 100;
  };

  return {
    gameData,
    addXP,
    addMoodEntry,
    getXPForNextLevel,
    getXPProgress
  };
}
