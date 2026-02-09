'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Button,
  Radio,
  message,
  Modal,
  Progress,
  ConfigProvider,
  theme,
  Tag,
  Spin
} from 'antd';
import {
  ClockCircleOutlined,
  CheckOutlined,
  WarningOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SendOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { Clock, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';
import { quizAPI, quizResponseAPI } from '../../../utils/api';

export default function TakeQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId;
  const startTimeRef = useRef(Date.now());
  const questionStartTimeRef = useRef(Date.now());
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questionTimes, setQuestionTimes] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz && !loading) {
      handleSubmitQuiz(true);
    }
  }, [timeLeft, quiz, loading]);

  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentQuestion]);

  const fetchQuiz = async () => {
    try {
      const response = await quizAPI.getQuizById(quizId);
      if (response.data.success) {
        const quizData = response.data.data;
        if (!quizData.IsPublished) {
          message.error('This quiz is not available');
          router.push('/student');
          return;
        }
        setQuiz(quizData);
        setTimeLeft(quizData.TimeLimit * 60);
        startTimeRef.current = Date.now();
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      message.error('Failed to load quiz');
      router.push('/student');
    } finally {
      setLoading(false);
    }
  };

  const recordQuestionTime = () => {
    const currentQuestionId = quiz?.Questions[currentQuestion]?.QuestionID;
    if (currentQuestionId) {
      const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
      setQuestionTimes(prev => ({
        ...prev,
        [currentQuestionId]: (prev[currentQuestionId] || 0) + timeSpent
      }));
    }
  };

  const handleAnswerSelect = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleNext = () => {
    recordQuestionTime();
    if (currentQuestion < quiz.Questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    recordQuestionTime();
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuestionNav = (index) => {
    recordQuestionTime();
    setCurrentQuestion(index);
  };

  const handleSubmitQuiz = async (autoSubmit = false) => {
    if (!autoSubmit && Object.keys(answers).length < quiz.Questions.length) {
      Modal.confirm({
        title: <span className="text-gray-900">Incomplete Quiz</span>,
        content: (
          <span className="text-gray-700">
            You have answered {Object.keys(answers).length} out of {quiz.Questions.length} questions. 
            Do you want to submit anyway?
          </span>
        ),
        onOk: () => submitQuiz(),
        okText: 'Submit',
        cancelText: 'Continue Quiz',
        centered: true,
      });
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    recordQuestionTime();
    
    try {
      const totalTimeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      const formattedAnswers = quiz.Questions.map(question => ({
        questionId: question.QuestionID,
        selectedOptionId: answers[question.QuestionID] || null,
        timeTaken: questionTimes[question.QuestionID] || 0
      }));

      const response = await quizResponseAPI.submitQuiz({
        quizId: parseInt(quizId),
        timeSpent: totalTimeSpent,
        answers: formattedAnswers
      });

      if (response.data.success) {
        localStorage.setItem('lastQuizResponseId', response.data.data.responseId);
        localStorage.setItem('lastQuizResult', JSON.stringify({
          ...response.data.data,
          quizTitle: quiz.Title,
          totalQuestions: quiz.Questions.length
        }));
        
        message.success('Quiz submitted successfully!');
        router.push(`/quiz/${quizId}/result`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      
      let correctAnswers = 0;
      quiz.Questions.forEach(question => {
        const selectedOption = answers[question.QuestionID];
        const correctOption = question.Options.find(opt => opt.IsCorrect);
        if (selectedOption === correctOption?.OptionID) {
          correctAnswers++;
        }
      });

      const score = (correctAnswers / quiz.Questions.length) * 100;
      const result = {
        quizId: quiz.QuizID,
        quizTitle: quiz.Title,
        score: score.toFixed(2),
        percentage: score.toFixed(2),
        correctAnswers,
        totalQuestions: quiz.Questions.length,
        answers,
        questions: quiz.Questions,
        submittedAt: new Date().toISOString()
      };

      localStorage.setItem('lastQuizResult', JSON.stringify(result));
      message.warning('Submitted locally.');
      router.push(`/quiz/${quizId}/result`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((Object.keys(answers).length / quiz.Questions.length) * 100).toFixed(0);
  };

  const getTimeColor = () => {
    if (timeLeft <= 60) return 'text-red-600';
    if (timeLeft <= 300) return 'text-orange-600';
    return 'text-blue-600';
  };

  const customTheme = {
    token: {
      colorPrimary: '#4f46e5',
      colorBgContainer: 'rgba(255, 255, 255, 0.95)',
      colorBgElevated: 'rgba(255, 255, 255, 0.98)',
      colorBorder: 'rgba(226, 232, 240, 0.8)',
      colorText: 'rgb(30, 41, 59)',
      borderRadius: 12,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    },
    components: {
      Modal: {
        contentBg: 'white',
        headerBg: 'white',
        titleColor: 'rgb(30, 41, 59)',
      },
      Progress: {
        remainingColor: 'rgba(226, 232, 240, 0.5)',
      },
      Card: {
        colorBgContainer: 'rgba(255, 255, 255, 0.9)',
      },
      Radio: {
        colorPrimary: '#4f46e5',
        colorBorder: 'rgba(148, 163, 184, 0.5)',
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-gray-700 text-lg mt-4 font-medium">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-800 text-lg font-semibold">Quiz not found</p>
          <Button type="primary" onClick={() => router.push('/student')} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const question = quiz.Questions[currentQuestion];

  return (
    <ConfigProvider theme={customTheme}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
        {/* Background decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-80 h-80 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-xl shadow-blue-100/50 mb-6" bordered>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{quiz.Title}</h1>
                  <p className="text-gray-600 text-sm">{quiz.Description || quiz.Subject}</p>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-4 rounded-xl shadow-lg ${
                timeLeft <= 60 ? 'bg-red-50 border-2 border-red-300' : 
                timeLeft <= 300 ? 'bg-orange-50 border-2 border-orange-300' : 
                'bg-blue-50 border-2 border-blue-200'
              }`}>
                <Clock className={`w-7 h-7 ${getTimeColor()}`} />
                <div>
                  <p className={`text-2xl font-bold ${getTimeColor()}`}>{formatTime(timeLeft)}</p>
                  <p className="text-gray-600 text-xs font-medium">Time Remaining</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 text-sm font-medium">Progress</span>
                <span className="text-gray-700 text-sm">
                  <span className="text-blue-600 font-semibold">{Object.keys(answers).length}</span> / {quiz.Questions.length} answered
                </span>
              </div>
              <Progress 
                percent={parseInt(getProgress())} 
                strokeColor={{ from: '#4f46e5', to: '#6366f1' }}
                trailColor="rgba(226, 232, 240, 0.5)"
                showInfo={false}
                strokeWidth={8}
              />
            </div>
          </Card>

          {/* Question Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-indigo-200 shadow-xl shadow-indigo-100/50 mb-6" bordered>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                    <span className="text-white font-bold">{currentQuestion + 1}</span>
                  </div>
                  <span className="text-blue-600 font-semibold text-lg">
                    Question {currentQuestion + 1} of {quiz.Questions.length}
                  </span>
                </div>
                <Tag color="blue" className="text-sm px-3 py-1">
                  {question.Points} {question.Points === 1 ? 'point' : 'points'}
                </Tag>
              </div>
              <h2 className="text-xl text-gray-900 font-semibold leading-relaxed">{question.QuestionText}</h2>
            </div>
            
            <Radio.Group
              value={answers[question.QuestionID]}
              onChange={(e) => handleAnswerSelect(question.QuestionID, e.target.value)}
              className="w-full"
            >
              <div className="space-y-3">
                {question.Options.map((option, index) => (
                  <div
                    key={option.OptionID}
                    onClick={() => handleAnswerSelect(question.QuestionID, option.OptionID)}
                    className={`p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      answers[question.QuestionID] === option.OptionID
                        ? 'bg-blue-50 border-blue-500 shadow-lg shadow-blue-200/50 scale-[1.02]'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Radio value={option.OptionID} className="flex-shrink-0">
                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all ${
                          answers[question.QuestionID] === option.OptionID
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                      </Radio>
                      <span className={`flex-1 text-base ${
                        answers[question.QuestionID] === option.OptionID 
                          ? 'text-gray-900 font-medium' 
                          : 'text-gray-700'
                      }`}>
                        {option.OptionText}
                      </span>
                      {answers[question.QuestionID] === option.OptionID && (
                        <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Radio.Group>
          </Card>

          {/* Navigation Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-xl shadow-blue-100/50 mb-6" bordered>
            <p className="text-gray-700 text-sm font-medium mb-4">Quick Navigation</p>
            <div className="flex flex-wrap gap-2">
              {quiz.Questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuestionNav(idx)}
                  className={`w-11 h-11 rounded-lg font-semibold transition-all duration-200 ${
                    idx === currentQuestion
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                      : answers[quiz.Questions[idx].QuestionID]
                      ? 'bg-green-100 text-green-700 border-2 border-green-400 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="flex gap-6 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-600 to-indigo-600"></div>
                <span className="text-gray-600 font-medium">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-green-100 border-2 border-green-400"></div>
                <span className="text-gray-600 font-medium">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-300"></div>
                <span className="text-gray-600 font-medium">Not answered</span>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              Previous
            </Button>

            <Button
              type="text"
              danger
              onClick={() => setShowExitModal(true)}
              className="text-gray-600 hover:text-red-600 font-medium"
            >
              Exit Quiz
            </Button>

            {currentQuestion === quiz.Questions.length - 1 ? (
              <Button
                type="primary"
                size="large"
                icon={<SendOutlined />}
                onClick={() => handleSubmitQuiz(false)}
                loading={submitting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 font-medium shadow-lg shadow-green-200"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                type="primary"
                size="large"
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 font-medium shadow-lg shadow-blue-200"
              >
                Next <ArrowRightOutlined className="ml-1" />
              </Button>
            )}
          </div>

          {/* Exit Modal */}
          <Modal
            title={
              <div className="flex items-center gap-2 text-gray-900">
                <WarningOutlined className="text-orange-500" />
                <span>Leave Quiz?</span>
              </div>
            }
            open={showExitModal}
            onOk={() => router.push('/student')}
            onCancel={() => setShowExitModal(false)}
            okText="Leave"
            cancelText="Stay"
            okButtonProps={{ danger: true }}
            centered
          >
            <p className="text-gray-700">
              Your progress will be lost if you leave now. Are you sure you want to exit?
            </p>
          </Modal>
        </div>
      </div>
    </ConfigProvider>
  );
}
