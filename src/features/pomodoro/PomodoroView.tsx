import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { usePomodoroStore } from '../../stores/pomodoroStore';

const PomodoroView: React.FC = () => {
  const {
    sessions,
    currentSession,
    stats,
    isRunning,
    timeRemaining,
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    fetchSessions,
    startSession,
    completeSession,
    getStats,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimeRemaining
  } = usePomodoroStore();

  const [sessionType, setSessionType] = useState<'work' | 'short_break' | 'long_break'>('work');

  useEffect(() => {
    fetchSessions();
    getStats();
  }, [fetchSessions, getStats]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (timeRemaining === 0 && currentSession) {
      // 自动完成会话
      completeSession(currentSession.id);
      // 播放通知音效或显示通知
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('番茄钟完成！', {
          body: sessionType === 'work' ? '工作时间结束，该休息了！' : '休息时间结束，继续工作吧！',
          icon: '/favicon.ico'
        });
      }
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, currentSession, completeSession, sessionType, setTimeRemaining]);

  // 请求通知权限
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = async () => {
    if (!currentSession) {
      // 创建新会话
      const duration = sessionType === 'work' ? workDuration : 
                      sessionType === 'short_break' ? shortBreakDuration : longBreakDuration;
      
      await startSession({
        session_type: sessionType,
        duration_minutes: duration
      });
    }
    startTimer();
  };

  const handleResetTimer = () => {
    resetTimer();
    const duration = sessionType === 'work' ? workDuration : 
                    sessionType === 'short_break' ? shortBreakDuration : longBreakDuration;
    setTimeRemaining(duration * 60);
  };

  const switchSession = (type: 'work' | 'short_break' | 'long_break') => {
    setSessionType(type);
    pauseTimer();
    const duration = type === 'work' ? workDuration : 
                    type === 'short_break' ? shortBreakDuration : longBreakDuration;
    setTimeRemaining(duration * 60);
  };

  const getDuration = () => {
    return sessionType === 'work' ? workDuration : 
           sessionType === 'short_break' ? shortBreakDuration : longBreakDuration;
  };

  const progress = ((getDuration() * 60 - timeRemaining) / (getDuration() * 60)) * 100;

  const getSessionTypeText = () => {
    switch (sessionType) {
      case 'work': return '专注工作中';
      case 'short_break': return '短休息';
      case 'long_break': return '长休息';
      default: return '专注工作中';
    }
  };

  const getSessionIcon = () => {
    switch (sessionType) {
      case 'work': return '🍅';
      case 'short_break': return '☕';
      case 'long_break': return '🛋️';
      default: return '🍅';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="max-w-2xl mx-auto w-full">
        {/* 会话类型切换 */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => switchSession('work')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                sessionType === 'work'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🍅 工作时间
            </button>
            <button
              onClick={() => switchSession('short_break')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                sessionType === 'short_break'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ☕ 短休息
            </button>
            <button
              onClick={() => switchSession('long_break')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                sessionType === 'long_break'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🛋️ 长休息
            </button>
          </div>
        </div>

        {/* 计时器 */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-white to-gray-50 shadow-xl border-0 animate-fade-in">
          <div className="text-center">
            {/* 进度环 */}
            <div className="relative w-64 h-64 mx-auto mb-8 animate-bounce-in">
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 256 256">
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  fill="none"
                  stroke={sessionType === 'work' ? '#ef4444' : '#10b981'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 112}`}
                  strokeDashoffset={`${2 * Math.PI * 112 * (1 - progress / 100)}`}
                  className="transition-all duration-1000 ease-in-out drop-shadow-lg"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-7xl mb-4 animate-pulse">
                    {getSessionIcon()}
                  </div>
                  <div className="text-6xl font-mono font-bold text-gray-900 mb-2 tracking-wider">
                    {formatTime(timeRemaining)}
                  </div>
                  <Badge 
                     variant={sessionType === 'work' ? 'danger' : 'success'} 
                     size="lg"
                     className="text-sm font-medium"
                   >
                    {getSessionTypeText()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex justify-center space-x-4">
              {!isRunning ? (
                <Button 
                  onClick={handleStartTimer} 
                  size="lg" 
                  className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h10a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1z" />
                  </svg>
                  开始专注
                </Button>
              ) : (
                <Button 
                  onClick={pauseTimer} 
                  size="lg" 
                  variant="secondary" 
                  className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  </svg>
                  暂停
                </Button>
              )}
              
              <Button 
                onClick={handleResetTimer} 
                size="lg" 
                variant="ghost" 
                className="px-8 py-4 text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重置
              </Button>
            </div>
          </div>
        </Card>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="text-4xl font-bold text-blue-600 mb-2 animate-bounce-in">
              {stats?.sessions_today || 0}
            </div>
            <div className="text-sm text-gray-700 font-medium">今日完成</div>
            <div className="mt-2">
              <Badge variant="info" size="sm">🎯 专注次数</Badge>
            </div>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="text-4xl font-bold text-green-600 mb-2 animate-bounce-in">
              {stats?.focus_time_today || 0}
            </div>
            <div className="text-sm text-gray-700 font-medium">今日专注时间</div>
            <div className="mt-2">
              <Badge variant="success" size="sm">⏱️ 分钟</Badge>
            </div>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="text-4xl font-bold text-purple-600 mb-2 animate-bounce-in">
              {stats?.total_focus_time || 0}
            </div>
            <div className="text-sm text-gray-700 font-medium">总专注时间</div>
            <div className="mt-2">
              <Badge variant="primary" size="sm">🏆 分钟</Badge>
            </div>
          </Card>
        </div>

        {/* 最近会话 */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            最近会话
          </h3>
          <Card className="overflow-hidden animate-fade-in">
            {sessions.slice(0, 5).map((session, index) => (
              <div key={session.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 ${
                index < sessions.slice(0, 5).length - 1 ? 'border-b border-gray-200' : ''
              }`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full shadow-sm ${
                    session.session_type === 'work' ? 'bg-red-500' : 
                    session.session_type === 'short_break' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {session.session_type === 'work' ? '🍅 工作会话' : 
                       session.session_type === 'short_break' ? '☕ 短休息' : '🛋️ 长休息'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {session.duration_minutes} 分钟
                    </span>
                  </div>
                  {session.completed && (
                    <Badge variant="success" size="sm">
                      ✅ 已完成
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-gray-500 font-mono">
                  {new Date(session.started_at).toLocaleString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
            
            {sessions.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <div className="text-6xl mb-4 animate-bounce">🍅</div>
                <p className="text-lg font-medium text-gray-700 mb-2">还没有番茄钟会话记录</p>
                <p className="text-sm text-gray-500">开始你的第一个专注时间吧！</p>
                <div className="mt-4">
                  <Badge variant="info" size="sm">💡 提示：25分钟专注 + 5分钟休息</Badge>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PomodoroView;