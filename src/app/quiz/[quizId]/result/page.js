'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Button,
  Progress,
  Spin,
  Tabs,
  Tag,
  Collapse,
  ConfigProvider,
  theme,
  Empty,
  message
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  HomeOutlined,
  RobotOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  StarOutlined,
  WarningOutlined,
  ReloadOutlined,
  BookOutlined
} from '@ant-design/icons';
import {
  Trophy,
  Target,
  Brain,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Sparkles
} from 'lucide-react';
import { quizResponseAPI } from '../../../../utils/api';

const { Panel } = Collapse;

export default function QuizResultPage() {
  const router = useRouter();
  const params = useParams();
  const [result, setResult] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [responseDetails, setResponseDetails] = useState(null);

  useEffect(() => {
    const storedResult = localStorage.getItem('lastQuizResult');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    }

    const responseId = localStorage.getItem('lastQuizResponseId');
    if (responseId) {
      fetchResponseDetails(responseId);
    }
  }, []);

  const fetchResponseDetails = async (responseId) => {
    try {
      const response = await quizResponseAPI.getResponseById(responseId);
      if (response.data.success) {
        setResponseDetails(response.data.data);
        if (response.data.data.AIInsightsGenerated && response.data.data.AIInsights) {
          setInsights(response.data.data.AIInsights);
        }
      }
    } catch (error) {
      console.error('Error fetching response details:', error);
    }
  };

  const generateInsights = async () => {
    const responseId = localStorage.getItem('lastQuizResponseId');
    if (!responseId) {
      message.error('No response found to generate insights');
      return;
    }

    setGeneratingInsights(true);
    try {
      const response = await quizResponseAPI.generateInsights(responseId);
      if (response.data.success) {
        setInsights(response.data.data);
        message.success('AI insights generated successfully!');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      message.error('Failed to generate insights');
    } finally {
      setGeneratingInsights(false);
    }
  };

  const darkTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#6366f1',
      colorBgContainer: 'rgba(30, 41, 59, 0.5)',
      colorBgElevated: 'rgb(30, 41, 59)',
      colorBorder: 'rgb(51, 65, 85)',
      colorText: 'rgb(226, 232, 240)',
      borderRadius: 8,
    },
    components: {
      Tabs: {
        itemSelectedColor: 'white',
        itemHoverColor: '#a5b4fc',
        inkBarColor: '#6366f1',
      },
      Collapse: {
        headerBg: 'transparent',
        contentBg: 'transparent',
      },
    },
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const scoreNum = parseFloat(result.percentage || result.score);
  const isPassed = scoreNum >= 60;
  const grade = scoreNum >= 90 ? 'A' : scoreNum >= 80 ? 'B' : scoreNum >= 70 ? 'C' : scoreNum >= 60 ? 'D' : 'F';

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span className="flex items-center gap-2">
          <TrophyOutlined />
          Overview
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Score Circle */}
          <div className="text-center py-6">
            <div className={`inline-block p-6 rounded-full mb-4 ${
              isPassed ? 'bg-green-500/20' : 'bg-orange-500/20'
            }`}>
              <Trophy className={`w-16 h-16 ${isPassed ? 'text-green-400' : 'text-orange-400'}`} />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h1>
            <p className="text-slate-400 text-lg mb-6">{result.quizTitle}</p>

            <div className="max-w-xs mx-auto mb-6">
              <Progress
                type="circle"
                percent={scoreNum}
                strokeColor={{
                  '0%': isPassed ? '#22c55e' : '#f97316',
                  '100%': isPassed ? '#16a34a' : '#ea580c'
                }}
                trailColor="rgb(51, 65, 85)"
                strokeWidth={8}
                width={180}
                format={() => (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{scoreNum.toFixed(0)}%</div>
                    <div className="text-slate-400 text-sm mt-1">Your Score</div>
                  </div>
                )}
              />
            </div>

            {/* Grade Badge */}
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
              isPassed ? 'bg-green-500/20 border border-green-500/30' : 'bg-orange-500/20 border border-orange-500/30'
            }`}>
              <Award className={`w-6 h-6 ${isPassed ? 'text-green-400' : 'text-orange-400'}`} />
              <span className={`text-xl font-bold ${isPassed ? 'text-green-400' : 'text-orange-400'}`}>
                Grade: {grade}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900/50 border-slate-700" bordered>
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Total Questions</p>
                <p className="text-3xl font-bold text-white">{result.totalQuestions}</p>
              </div>
            </Card>
            <Card className="bg-slate-900/50 border-green-500/30" bordered>
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Correct Answers</p>
                <p className="text-3xl font-bold text-green-400">{result.correctAnswers || result.score}</p>
              </div>
            </Card>
            <Card className="bg-slate-900/50 border-red-500/30" bordered>
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Incorrect</p>
                <p className="text-3xl font-bold text-red-400">
                  {result.totalQuestions - (result.correctAnswers || result.score)}
                </p>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      key: 'review',
      label: (
        <span className="flex items-center gap-2">
          <BookOutlined />
          Answer Review
        </span>
      ),
      children: (
        <div className="space-y-4">
          {result.questions ? (
            result.questions.map((question, idx) => {
              const userAnswerId = result.answers[question.QuestionID];
              const correctOption = question.Options.find(opt => opt.IsCorrect);
              const isCorrect = userAnswerId === correctOption?.OptionID;

              return (
                <Card
                  key={question.QuestionID}
                  className={`bg-slate-900/50 ${
                    isCorrect ? 'border-green-500/30' : userAnswerId ? 'border-red-500/30' : 'border-orange-500/30'
                  }`}
                  bordered
                >
                  <div className="flex items-start gap-3 mb-4">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-400 mt-1 shrink-0" />
                    ) : userAnswerId ? (
                      <XCircle className="w-6 h-6 text-red-400 mt-1 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-orange-400 mt-1 shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 font-semibold">Question {idx + 1}</span>
                        <Tag color={isCorrect ? 'success' : userAnswerId ? 'error' : 'warning'}>
                          {isCorrect ? 'Correct' : userAnswerId ? 'Incorrect' : 'Not Answered'}
                        </Tag>
                      </div>
                      <p className="text-white text-lg mb-4">{question.QuestionText}</p>

                      <div className="space-y-2">
                        {question.Options.map((option) => {
                          const isUserAnswer = option.OptionID === userAnswerId;
                          const isCorrectAnswer = option.IsCorrect;

                          return (
                            <div
                              key={option.OptionID}
                              className={`p-3 rounded-lg border-2 ${
                                isCorrectAnswer
                                  ? 'bg-green-500/10 border-green-500/50'
                                  : isUserAnswer
                                  ? 'bg-red-500/10 border-red-500/50'
                                  : 'bg-slate-800/50 border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isCorrectAnswer && <CheckCircleOutlined className="text-green-400" />}
                                {isUserAnswer && !isCorrectAnswer && <CloseCircleOutlined className="text-red-400" />}
                                <span className={`flex-1 ${
                                  isCorrectAnswer ? 'text-green-400 font-medium' :
                                  isUserAnswer ? 'text-red-400' : 'text-slate-300'
                                }`}>
                                  {option.OptionText}
                                </span>
                                {isCorrectAnswer && (
                                  <Tag color="success" className="m-0">Correct</Tag>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <Tag color="error" className="m-0">Your Answer</Tag>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : responseDetails?.Answers ? (
            responseDetails.Answers.map((answer, idx) => (
              <Card
                key={answer.AnswerID}
                className={`bg-slate-900/50 ${
                  answer.IsCorrect ? 'border-green-500/30' : 'border-red-500/30'
                }`}
                bordered
              >
                <div className="flex items-start gap-3">
                  {answer.IsCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-400 mt-1 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400 mt-1 shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 font-semibold">Question {idx + 1}</span>
                      <Tag color={answer.IsCorrect ? 'success' : 'error'}>
                        {answer.IsCorrect ? 'Correct' : 'Incorrect'}
                      </Tag>
                    </div>
                    <p className="text-white text-lg mb-2">{answer.Question?.QuestionText}</p>
                    <p className="text-slate-400 text-sm">
                      Points earned: <span className="text-indigo-400 font-medium">{answer.PointsEarned}</span>
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Empty description={<span className="text-slate-400">No detailed review available</span>} />
          )}
        </div>
      ),
    },
    {
      key: 'insights',
      label: (
        <span className="flex items-center gap-2">
          <RobotOutlined />
          AI Insights
        </span>
      ),
      children: (
        <div className="space-y-6">
          {insights ? (
            <>
              {/* Overall Performance */}
              <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-500/30" bordered>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-indigo-500/20 rounded-xl">
                    <Brain className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Overall Performance</h3>
                    <p className="text-slate-400 text-sm">AI-generated analysis of your quiz attempt</p>
                  </div>
                </div>
                <p className="text-slate-300 mb-4">{insights.overallPerformance?.summary}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                      <ThunderboltOutlined />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {insights.overallPerformance?.strengths?.map((s, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                          <CheckCircleOutlined className="text-green-400 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                    <h4 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
                      <WarningOutlined />
                      Areas to Improve
                    </h4>
                    <ul className="space-y-1">
                      {insights.overallPerformance?.weaknesses?.map((w, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                          <BulbOutlined className="text-orange-400 mt-0.5" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Recommendations */}
              {insights.recommendations && insights.recommendations.length > 0 && (
                <Card className="bg-slate-900/50 border-purple-500/30" bordered>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <RocketOutlined className="text-purple-400" />
                    Recommendations
                  </h3>
                  <div className="space-y-3">
                    {insights.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <StarOutlined className="text-purple-400 mt-0.5" />
                        <p className="text-slate-300">{rec}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Next Steps */}
              {insights.nextSteps && insights.nextSteps.length > 0 && (
                <Card className="bg-slate-900/50 border-blue-500/30" bordered>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Next Steps
                  </h3>
                  <ol className="space-y-2">
                    {insights.nextSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-300">
                        <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-bold shrink-0">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </Card>
              )}

              {/* Motivational Message */}
              {insights.motivationalMessage && (
                <div className="p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl">
                  <p className="text-white text-center italic">
                    "{insights.motivationalMessage}"
                  </p>
                </div>
              )}
            </>
          ) : (
            <Card className="bg-slate-900/50 border-indigo-500/30" bordered>
              <div className="text-center py-8">
                <div className="p-4 bg-indigo-500/20 rounded-full inline-block mb-4">
                  <Sparkles className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Get AI-Powered Insights</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Generate personalized feedback and recommendations based on your quiz performance
                </p>
                <Button
                  type="primary"
                  size="large"
                  icon={<RobotOutlined />}
                  onClick={generateInsights}
                  loading={generatingInsights}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0"
                  style={{ background: 'linear-gradient(to right, rgb(79, 70, 229), rgb(147, 51, 234))' }}
                >
                  {generatingInsights ? 'Generating...' : 'Generate AI Insights'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      ),
    },
  ];

  return (
    <ConfigProvider theme={darkTheme}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-slate-800/50 border-indigo-500/30" bordered>
            <Tabs
              defaultActiveKey="overview"
              items={tabItems}
              size="large"
              className="custom-tabs"
            />
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={() => router.push('/student')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0"
              style={{ background: 'linear-gradient(to right, rgb(79, 70, 229), rgb(147, 51, 234))' }}
            >
              Back to Dashboard
            </Button>
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={() => router.push(`/quiz/${params.quizId}`)}
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              Retake Quiz
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-tabs .ant-tabs-nav::before {
          border-color: rgb(51, 65, 85) !important;
        }
        .custom-tabs .ant-tabs-tab {
          color: rgb(148, 163, 184) !important;
        }
        .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: white !important;
        }
      `}</style>
    </ConfigProvider>
  );
}
