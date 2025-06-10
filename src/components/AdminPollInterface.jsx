import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2, Play, Copy, Eye, ListChecks, Clock } from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28'];

export function AdminPollInterface({ userId }) {
  const [pollQuestion, setPollQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [activePoll, setActivePoll] = useState(null);
  const [pollResults, setPollResults] = useState({});
  const [sessionCode, setSessionCode] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [pollHistory, setPollHistory] = useState([]);
  const [selectedHistoryPoll, setSelectedHistoryPoll] = useState(null);
  const [pollTimer, setPollTimer] = useState(0); 
  const [timerIntervalId, setTimerIntervalId] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);

  const { toast } = useToast();

  const storageKeyPolls = `admin_polls_${userId}`;
  const storageKeyActivePoll = `active_poll_session`;

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem(storageKeyPolls)) || [];
    setPollHistory(storedHistory.filter(p => !p.isActive).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

    const currentActivePoll = JSON.parse(localStorage.getItem(storageKeyActivePoll));
    if (currentActivePoll && currentActivePoll.isActive && currentActivePoll.createdBy === userId) {
        setActivePoll(currentActivePoll);
        setSessionCode(currentActivePoll.sessionCode);
        setPollResults(currentActivePoll.results || {});
        setShowResults(true);
        if(currentActivePoll.endsAt) {
            const endsAtTime = new Date(currentActivePoll.endsAt).getTime();
            const now = new Date().getTime();
            const duration = Math.max(0, Math.floor((endsAtTime - now) / 1000));
            setRemainingTime(duration);
        }
    }


  }, [userId, storageKeyPolls, storageKeyActivePoll]);

  useEffect(() => {
    if (activePoll && activePoll.isActive) {
      const interval = setInterval(() => {
        const currentPollData = JSON.parse(localStorage.getItem(storageKeyActivePoll));
        if (currentPollData && currentPollData.id === activePoll.id) {
          setPollResults(currentPollData.results || {});
          if (currentPollData.endsAt) {
            const endsAtTime = new Date(currentPollData.endsAt).getTime();
            const now = new Date().getTime();
            const newRemainingTime = Math.max(0, Math.floor((endsAtTime - now) / 1000));
            setRemainingTime(newRemainingTime);
            if (newRemainingTime === 0 && activePoll.isActive) {
              handleEndPoll(false); 
            }
          }
        } else if (!currentPollData && activePoll.isActive) {
            // Poll was removed externally, treat as ended
            handleEndPoll(true);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activePoll, storageKeyActivePoll]);


  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    } else {
      toast({ title: "Max options reached", description: "You can add up to 6 options.", variant: "destructive" });
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    } else {
      toast({ title: "Min options required", description: "You need at least 2 options.", variant: "destructive" });
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const generateSessionCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleLaunchPoll = () => {
    if (!pollQuestion.trim()) {
      toast({ title: "Question Required", description: "Please enter a poll question.", variant: "destructive" });
      return;
    }
    if (options.some(opt => !opt.trim())) {
      toast({ title: "Empty Options", description: "All options must be filled.", variant: "destructive" });
      return;
    }

    const newSessionCode = generateSessionCode();
    const endsAt = pollTimer > 0 ? new Date(Date.now() + pollTimer * 60000).toISOString() : null;

    const newPoll = {
      id: Date.now(),
      question: pollQuestion,
      options: options.map(opt => opt.trim()),
      createdBy: userId,
      sessionCode: newSessionCode,
      isActive: true,
      results: options.reduce((acc, opt) => ({ ...acc, [opt]: 0 }), {}),
      createdAt: new Date().toISOString(),
      endsAt: endsAt,
    };

    localStorage.setItem(storageKeyActivePoll, JSON.stringify(newPoll));
    
    setActivePoll(newPoll);
    setSessionCode(newSessionCode);
    setPollResults(newPoll.results);
    setShowResults(true);
    setRemainingTime(pollTimer > 0 ? pollTimer * 60 : 0);
    setPollQuestion('');
    setOptions(['','']);
    setPollTimer(0);
    toast({ title: "Poll Launched!", description: `Session Code: ${newSessionCode}${endsAt ? `. Ends in ${pollTimer} min.` : ''}` });
  };

  const handleEndPoll = (isExternal = false) => {
    const currentActivePoll = JSON.parse(localStorage.getItem(storageKeyActivePoll));
    if (currentActivePoll && currentActivePoll.isActive) {
      const updatedPoll = { ...currentActivePoll, isActive: false, endedAt: new Date().toISOString() };
      localStorage.removeItem(storageKeyActivePoll); // Remove from active
      
      const existingPolls = JSON.parse(localStorage.getItem(storageKeyPolls)) || [];
      localStorage.setItem(storageKeyPolls, JSON.stringify([...existingPolls, updatedPoll]));

      setPollHistory(prev => [updatedPoll, ...prev].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setActivePoll(null);
      setSessionCode('');
      setRemainingTime(0);
      if (timerIntervalId) clearInterval(timerIntervalId);
      setTimerIntervalId(null);

      if (!isExternal) {
        toast({ title: "Poll Ended", description: "The poll session has been closed." });
      } else {
        toast({ title: "Poll Ended", description: "The poll session was ended externally or timed out.", variant: "destructive" });
      }
      setShowResults(true); 
    }
  };

  const copySessionCode = () => {
    if(sessionCode) {
      navigator.clipboard.writeText(sessionCode);
      toast({ title: "Copied!", description: "Session code copied to clipboard." });
    }
  };

  const viewHistoryPollResults = (poll) => {
    setSelectedHistoryPoll(poll);
    setPollResults(poll.results || {});
    setShowResults(true);
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const displayPoll = selectedHistoryPoll || activePoll;
  const currentChartData = displayPoll ? Object.entries(pollResults).map(([name, value]) => ({ name, votes: value })) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-effect border-0 text-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {activePoll ? "Active Poll Management" : "Create New Poll"}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {activePoll ? `Poll: "${activePoll.question}" (Session: ${sessionCode})` : "Launch a new poll for your audience."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!activePoll ? (
                <>
                  <div>
                    <label htmlFor="pollQuestion" className="block text-sm font-medium mb-1">Poll Question</label>
                    <Input
                      id="pollQuestion"
                      type="text"
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      placeholder="e.g., What's your favorite color?"
                      className="bg-white/20 border-white/30 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Options</label>
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <Input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="bg-white/20 border-white/30 placeholder-gray-400 flex-grow"
                        />
                        {options.length > 2 && (
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(index)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" onClick={handleAddOption} className="text-sm bg-white/10 border-white/20 hover:bg-white/20">
                      <PlusCircle className="w-4 h-4 mr-2" /> Add Option
                    </Button>
                  </div>
                  <div>
                    <label htmlFor="pollTimer" className="block text-sm font-medium mb-1">Poll Duration (minutes, 0 for no limit)</label>
                    <Input
                      id="pollTimer"
                      type="number"
                      min="0"
                      value={pollTimer}
                      onChange={(e) => setPollTimer(parseInt(e.target.value, 10))}
                      placeholder="e.g., 5"
                      className="bg-white/20 border-white/30 placeholder-gray-400"
                    />
                  </div>
                  <Button onClick={handleLaunchPoll} className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90">
                    <Play className="w-5 h-5 mr-2" /> Launch Poll
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <div>
                        <p className="text-lg">Session Code: <strong className="text-xl tracking-wider">{sessionCode}</strong></p>
                        {remainingTime > 0 && <p className="text-sm text-yellow-300">Time Remaining: {formatTime(remainingTime)}</p>}
                    </div>
                    <Button onClick={copySessionCode} variant="outline" size="sm" className="bg-white/20 border-white/30 hover:bg-white/30">
                      <Copy className="w-4 h-4 mr-2" /> Copy Code
                    </Button>
                  </div>
                  <Button onClick={() => handleEndPoll(false)} variant="destructive" className="w-full">
                    End Poll Now
                  </Button>
                  <Button onClick={() => { setShowResults(!showResults); setSelectedHistoryPoll(null); setPollResults(activePoll.results || {});}} variant="outline" className="w-full bg-white/10 border-white/20 hover:bg-white/20">
                    <Eye className="w-4 h-4 mr-2" /> {showResults && !selectedHistoryPoll ? "Hide" : "Show Current"} Results
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {showResults && displayPoll && (
            <Card className="glass-effect border-0 text-white mt-6">
              <CardHeader>
                <CardTitle>{selectedHistoryPoll ? "Historical" : "Live"} Poll Results: {displayPoll.question}</CardTitle>
                {selectedHistoryPoll && <CardDescription className="text-gray-400">Ended: {new Date(selectedHistoryPoll.endedAt).toLocaleString()}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[350px]">
                {currentChartData.length > 0 && currentChartData.some(d => d.votes > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                      <XAxis dataKey="name" stroke="#fff" />
                      <YAxis allowDecimals={false} stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '0.5rem' }} itemStyle={{ color: '#fff' }} />
                      <Legend wrapperStyle={{ color: '#fff' }} />
                      <Bar dataKey="votes" fill="#8884d8" radius={[4, 4, 0, 0]}>
                        {currentChartData.map((entry, index) => (
                          <Cell key={`cell-bar-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-300 py-10">No votes recorded for this poll.</p>
                )}
                </div>
                {currentChartData.length > 0 && currentChartData.some(d => d.votes > 0) && (
                  <div className="h-[350px] flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={currentChartData.filter(d => d.votes > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="votes"
                            nameKey="name"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                            {currentChartData.filter(d => d.votes > 0).map((entry, index) => (
                            <Cell key={`cell-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '0.5rem' }} itemStyle={{ color: '#fff' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="glass-effect border-0 text-white md:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center"><ListChecks className="mr-2 h-6 w-6 text-blue-300"/>Poll History</CardTitle>
                <CardDescription className="text-gray-300">Review past polls and their results.</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
                {pollHistory.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No past polls found.</p>
                ) : (
                    <ul className="space-y-3">
                        {pollHistory.map(poll => (
                            <li key={poll.id} className={`p-3 rounded-lg transition-all ${selectedHistoryPoll?.id === poll.id ? 'bg-white/20 ring-2 ring-purple-400' : 'bg-white/10 hover:bg-white/15'}`}>
                                <button onClick={() => viewHistoryPollResults(poll)} className="w-full text-left">
                                    <h4 className="font-semibold text-sm truncate">{poll.question}</h4>
                                    <p className="text-xs text-gray-400">
                                        Ended: {new Date(poll.endedAt || poll.createdAt).toLocaleDateString()} - Code: {poll.sessionCode}
                                    </p>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}