
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Zap, 
  Calendar, 
  Target, 
  Plus,
  Star,
  Flame,
  Award
} from 'lucide-react';
import { MoodCheckIn } from '@/components/MoodCheckIn';
import { useGameData } from '@/hooks/useGameData';
import { Link } from 'react-router-dom';

export function Dashboard({ user, onLogout }) {
  const { gameData, addXP, addMoodEntry, getXPProgress } = useGameData(user.id);
  const [showMoodDialog, setShowMoodDialog] = useState(false);

  const handleQuickAction = (action, xp) => {
    addXP(xp, action);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickActions = [
    { name: 'Complete Task', xp: 25, icon: Target, color: 'from-green-400 to-green-600' },
    { name: 'Study Session', xp: 30, icon: Star, color: 'from-blue-400 to-blue-600' },
    { name: 'Exercise', xp: 35, icon: Zap, color: 'from-orange-400 to-orange-600' },
    { name: 'Read Book', xp: 20, icon: Award, color: 'from-purple-400 to-purple-600' }
  ];

  return (
    <div className="min-h-screen p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16 ring-4 ring-white/20">
            {/* User provided images are not supported yet, using fallback */}
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {user.name}!</h1>
            <p className="text-gray-200">Ready to level up today?</p>
          </div>
        </div>
        {/* Logout button is now in MainLayout header */}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-effect border-0 text-white pulse-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{gameData.level}</div>
              <p className="text-xs text-gray-300">
                {gameData.xp} total XP
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-effect border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{gameData.streak}</div>
              <p className="text-xs text-gray-300">
                days in a row
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
              <Target className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{gameData.totalActions}</div>
              <p className="text-xs text-gray-300">
                completed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-effect border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Action</CardTitle>
              <Calendar className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {gameData.lastAction ? gameData.lastAction.type : 'None'}
              </div>
              <p className="text-xs text-gray-300">
                {gameData.lastAction ? formatDate(gameData.lastAction.timestamp) : 'Get started!'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-effect border-0 text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Level Progress</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              {Math.max(0, Math.round(100 - getXPProgress()))}% to level {gameData.level + 1}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={getXPProgress()} className="h-3" />
            <div className="flex justify-between text-sm text-gray-300 mt-2">
              <span>{gameData.xp - (gameData.level -1) * 100} XP / {100} XP</span>
              <span>Level {gameData.level}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-effect border-0 text-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription className="text-gray-300">
              Earn XP by completing activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <motion.div
                  key={action.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => handleQuickAction(action.name, action.xp)}
                    className={`w-full h-20 bg-gradient-to-r ${action.color} hover:opacity-90 text-white border-0 flex flex-col items-center justify-center space-y-1`}
                  >
                    <action.icon className="w-5 h-5" />
                    <span className="text-xs">{action.name}</span>
                    <span className="text-xs font-bold">+{action.xp} XP</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="glass-effect border-0 text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Mood Journal</span>
              <Button
                onClick={() => setShowMoodDialog(true)}
                size="sm"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Track your daily mood and thoughts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gameData.moodEntries.length > 0 ? (
              <div className="space-y-3">
                {gameData.moodEntries.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <span className="text-2xl">{entry.mood}</span>
                    <div className="flex-1">
                      <p className="text-sm">{entry.note}</p>
                      <p className="text-xs text-gray-400">{formatDate(entry.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No mood entries yet. Start tracking your daily mood!
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <MoodCheckIn
        open={showMoodDialog}
        onOpenChange={setShowMoodDialog}
        onSubmit={addMoodEntry}
      />
    </div>
  );
}
