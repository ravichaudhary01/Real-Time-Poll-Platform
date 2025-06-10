import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LogIn, Send, BarChart3, Clock } from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28'];

export function UserPollSession({ userId }) {
  const [sessionCodeInput, setSessionCodeInput] = useState('');
  const [currentPoll, setCurrentPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [pollResults, setPollResults] = useState({});
  const [showResultsView, setShowResultsView] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const { toast } = useToast();

  const storageKeyActivePoll = `active_poll_session`;
  const userVotesKey = `user_votes_${userId || 'guest'}`;

  useEffect(() => {
    let interval;
    if (currentPoll) {
      interval = setInterval(() => {
        const pollData = JSON.parse(localStorage.getItem(storageKeyActivePoll));
        if (pollData && pollData.id === currentPoll.id) {
          const updatedPoll = {...currentPoll, ...pollData};
          setCurrentPoll(updatedPoll);
          setPollResults(updatedPoll.results || {});

          if (updatedPoll.endsAt) {
            const endsAtTime = new Date(updatedPoll.endsAt).getTime();
            const now = new Date().getTime();
            const newRemainingTime = Math.max(0, Math.floor((endsAtTime - now) / 1000));
            setRemainingTime(newRemainingTime);

            if (newRemainingTime === 0 && updatedPoll.isActive) {
              toast({ title: "Poll Ended", description: "Time's up! This poll has ended.", variant: "default" });
              setCurrentPoll(prev => ({...prev, isActive: false}));
              setShowResultsView(true);
            }
          }
        } else if (!pollData && currentPoll.isActive) {
          toast({ title: "Poll Ended", description: "The poll session has been closed by the admin.", variant: "default" });
          setCurrentPoll(prev => ({...prev, isActive: false}));
          setShowResultsView(true); // Show final results as poll is no longer active
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentPoll, storageKeyActivePoll, toast]);


  const handleJoinSession = () => {
    if (!sessionCodeInput.trim()) {
      toast({ title: "Session Code Required", description: "Please enter a session code.", variant: "destructive" });
      return;
    }
    const pollData = JSON.parse(localStorage.getItem(storageKeyActivePoll));
    const normalizedInputCode = sessionCodeInput.trim().toUpperCase();

    if (pollData && pollData.sessionCode === normalizedInputCode) {
      setCurrentPoll(pollData);
      setPollResults(pollData.results || {});
      
      const userVotes = JSON.parse(localStorage.getItem(userVotesKey)) || {};
      if (userVotes[pollData.id]) {
        setHasVoted(true);
        setSelectedOption(userVotes[pollData.id]);
        setShowResultsView(true);
      } else {
        setHasVoted(false);
        setShowResultsView(false);
      }

      if (pollData.endsAt) {
        const endsAtTime = new Date(pollData.endsAt).getTime();
        const now = new Date().getTime();
        setRemainingTime(Math.max(0, Math.floor((endsAtTime - now) / 1000)));
      } else {
        setRemainingTime(0); // No timer for this poll
      }

      if (!pollData.isActive) {
         toast({ title: "Poll Ended", description: "This poll has already ended. Showing final results.", variant: "default" });
         setShowResultsView(true);
      } else {
        toast({ title: "Session Joined!", description: `Joined poll: ${pollData.question}` });
      }

    } else {
      toast({ title: "Invalid Code", description: "No active poll found with this session code, or the code is incorrect.", variant: "destructive" });
    }
  };

  const handleVote = () => {
    if (!selectedOption) {
      toast({ title: "No Option Selected", description: "Please select an option to vote.", variant: "destructive" });
      return;
    }

    const pollData = JSON.parse(localStorage.getItem(storageKeyActivePoll));
    if (pollData && pollData.id === currentPoll.id && pollData.isActive) {
       if (pollData.endsAt && new Date(pollData.endsAt).getTime() < Date.now()){
        toast({ title: "Time's Up!", description: "Cannot vote, the poll has ended.", variant: "destructive" });
        setCurrentPoll(prev => ({...prev, isActive: false }));
        setShowResultsView(true);
        return;
      }

      const newResults = { ...pollData.results };
      newResults[selectedOption] = (newResults[selectedOption] || 0) + 1;
      
      const updatedPollData = { ...pollData, results: newResults };
      localStorage.setItem(storageKeyActivePoll, JSON.stringify(updatedPollData));
      
      const userVotes = JSON.parse(localStorage.getItem(userVotesKey)) || {};
      userVotes[currentPoll.id] = selectedOption;
      localStorage.setItem(userVotesKey, JSON.stringify(userVotes));

      setPollResults(newResults);
      setHasVoted(true);
      setShowResultsView(true);
      toast({ title: "Vote Submitted!", description: `You voted for: ${selectedOption}` });
    } else {
      toast({ title: "Poll Not Active", description: "This poll is no longer active or has changed.", variant: "destructive" });
      setCurrentPoll(prev => prev ? ({...prev, isActive: false }) : null);
      setShowResultsView(true);
    }
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const chartData = currentPoll ? Object.entries(pollResults).map(([name, value]) => ({ name, votes: value })) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 max-w-2xl mx-auto"
    >
      {!currentPoll ? (
        <Card className="glass-effect border-0 text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Join a Poll Session</CardTitle>
            <CardDescription className="text-gray-300">Enter the session code provided by the admin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              value={sessionCodeInput}
              onChange={(e) => setSessionCodeInput(e.target.value)}
              placeholder="Enter Session Code"
              className="bg-white/20 border-white/30 placeholder-gray-400 text-center text-lg tracking-wider"
              maxLength="6"
            />
            <Button onClick={handleJoinSession} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
              <LogIn className="w-5 h-5 mr-2" /> Join Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-effect border-0 text-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{currentPoll.question}</CardTitle>
            {(currentPoll.endsAt && currentPoll.isActive && remainingTime > 0) && (
                <CardDescription className="text-yellow-300 flex items-center"><Clock className="w-4 h-4 mr-1" /> Time Remaining: {formatTime(remainingTime)}</CardDescription>
            )}
            {!currentPoll.isActive && <CardDescription className="text-yellow-300">This poll has ended. Showing final results.</CardDescription>}
             {(currentPoll.endsAt && currentPoll.isActive && remainingTime === 0) && (
                <CardDescription className="text-red-400 flex items-center"><Clock className="w-4 h-4 mr-1" /> Time's up! This poll has ended.</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {currentPoll.isActive && !hasVoted && remainingTime > 0 && (
              <>
                <div className="space-y-2">
                  {currentPoll.options.map((option) => (
                    <Button
                      key={option}
                      variant={selectedOption === option ? "default" : "outline"}
                      onClick={() => setSelectedOption(option)}
                      className={`w-full justify-start text-left h-auto py-3 ${selectedOption === option ? 'bg-purple-600 border-purple-600' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                <Button onClick={handleVote} className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90">
                  <Send className="w-4 h-4 mr-2" /> Submit Vote
                </Button>
              </>
            )}
             {currentPoll.isActive && !hasVoted && currentPoll.endsAt && remainingTime === 0 && (
                <p className="text-red-400 text-center">Voting has closed for this poll.</p>
            )}


            {(hasVoted || !currentPoll.isActive || (currentPoll.endsAt && remainingTime === 0)) && (
                 <Button onClick={() => setShowResultsView(!showResultsView)} variant="outline" className="w-full bg-white/10 border-white/20 hover:bg-white/20 mb-4">
                    <BarChart3 className="w-4 h-4 mr-2" /> {showResultsView ? "Hide" : "View"} Results
                </Button>
            )}

            {showResultsView && (hasVoted || !currentPoll.isActive || (currentPoll.endsAt && remainingTime === 0)) && (
              <div className="space-y-6">
                <div className="h-[300px] mt-4">
                  {chartData.length > 0 && chartData.some(d => d.votes > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                        <XAxis dataKey="name" stroke="#fff" />
                        <YAxis allowDecimals={false} stroke="#fff" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '0.5rem' }} itemStyle={{ color: '#fff' }} />
                        <Legend wrapperStyle={{ color: '#fff' }} />
                        <Bar dataKey="votes" fill="#82ca9d" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-bar-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                     <p className="text-center text-gray-300 py-10">No votes yet or poll data is unavailable.</p>
                  )}
                </div>
                {chartData.length > 0 && chartData.some(d => d.votes > 0) && (
                  <div className="h-[300px] mt-4 flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.filter(d => d.votes > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="votes"
                          nameKey="name"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {chartData.filter(d => d.votes > 0).map((entry, index) => (
                            <Cell key={`cell-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '0.5rem' }} itemStyle={{ color: '#fff' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
            {currentPoll.isActive && hasVoted && <p className="text-center text-green-300">You have voted. Results may update live if shown.</p>}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}