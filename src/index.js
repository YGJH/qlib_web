import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { createRoot } from 'react-dom/client';
import './index.css';

// 數字格式化函數
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return Number(value).toFixed(decimals);
};

const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';

  const percentage = value * 100;

  // 對於非常小的數字（小於 0.001%），顯示更友好的格式
  if (Math.abs(percentage) < 0.001 && percentage !== 0) {
    return '<0.001%';
  }

  // 對於小數字（0.001% - 0.01%），顯示 4 位小數
  if (Math.abs(percentage) < 0.01 && percentage !== 0) {
    return `${percentage.toFixed(4)}%`;
  }

  // 對於小數字（0.01% - 0.1%），顯示 3 位小數
  if (Math.abs(percentage) < 0.1 && percentage !== 0) {
    return `${percentage.toFixed(3)}%`;
  }

  // 對於一般數字，使用指定的小數位數
  return `${percentage.toFixed(decimals)}%`;
};

const formatScore = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';

  const num = Number(value);

  // 對於評分類數字，通常是 0-100 範圍，最多顯示 2 位小數
  if (Math.abs(num) >= 10) {
    return num.toFixed(1); // 大於等於 10 只顯示 1 位小數
  } else {
    return num.toFixed(decimals); // 小於 10 顯示指定小數位數
  }
};

const formatLargeNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toString();
};

// 增強的 UI 組件
const Card = ({ children, className = "", hover = false }) => (
  <div className={`bg-white rounded-xl shadow-lg ${hover ? 'card-hover' : ''} transition-all ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-5 border-b border-gray-100 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "", style }) => (
  <div className={`px-6 py-5 ${className}`} style={style}>{children}</div>
);

const Input = ({ placeholder, value, onChange, id, className = "" }) => (
  <input
    id={id}
    className={`border-2 border-gray-200 rounded-lg px-4 py-3 w-full focus:border-blue-500 focus:outline-none transition-all ${className}`}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
  />
);

const Label = ({ htmlFor, children, className = "" }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-semibold mb-2 text-gray-700 ${className}`}>
    {children}
  </label>
);

// 增強的徽章組件
const Badge = ({ children, variant = "default", size = "md", glow = false }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 border-gray-200",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    danger: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    info: "bg-blue-100 text-blue-800 border-blue-200"
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <span className={`${sizes[size]} rounded-full font-medium border transition-all ${variants[variant]} ${glow ? 'badge-glow' : ''}`}>
      {children}
    </span>
  );
};

const Button = ({ children, onClick, variant = "primary", size = "md", disabled = false, className = "" }) => {
  const variants = {
    primary: "btn-primary text-white shadow-lg",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm rounded-lg",
    md: "px-5 py-3 text-base rounded-lg",
    lg: "px-7 py-4 text-lg rounded-xl"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-medium transition-all ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:transform hover:-translate-y-1'} ${className}`}
    >
      {children}
    </button>
  );
};

const Tabs = ({ value, onChange, children }) => {
  return (
    <div className="w-full">
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl p-2 space-x-2">
        {React.Children.map(children, (child, index) => {
          // 確保 child 是有效的 React 元素且有 props
          if (!React.isValidElement(child) || !child.props) {
            return null;
          }

          return (
            <button
              key={child.props.value || index}
              onClick={() => onChange(child.props.value)}
              className={`px-6 py-3 font-semibold text-sm rounded-lg transition-all ${value === child.props.value
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              {child.props.label}
            </button>
          );
        })}
      </div>
      <div className="mt-0">
        {React.Children.toArray(children).find(child =>
          React.isValidElement(child) && child.props && child.props.value === value
        )}
      </div>
    </div>
  );
};

const TabPanel = ({ children, value, label }) => {
  return <div className="p-6 bg-white rounded-b-xl shadow-lg">{children}</div>;
};

const Select = ({ value, onChange, children, id, className = "" }) => (
  <select
    id={id}
    value={value}
    onChange={onChange}
    className={`border-2 border-gray-200 rounded-lg px-4 py-3 bg-white focus:border-blue-500 focus:outline-none transition-all ${className}`}
  >
    {children}
  </select>
);

// 統計卡片組件
const StatCard = ({ title, value, subtitle, icon, color = "blue", isDarkMode = false }) => {
  const colors = {
    blue: "from-blue-400 to-blue-600",
    green: "from-emerald-400 to-emerald-600",
    yellow: "from-amber-400 to-amber-600",
    purple: "from-purple-400 to-purple-600",
    red: "from-red-400 to-red-600"
  };

  const darkModeColors = {
    blue: "text-blue-400",
    green: "text-emerald-400",
    yellow: "text-amber-400",
    purple: "text-purple-400",
    red: "text-red-400"
  };

  return (
    <div className={`stat-card p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white'
      }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>{title}</h3>
          <p className={`text-2xl font-bold number-display ${isDarkMode
              ? darkModeColors[color]
              : `bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent`
            }`}>
            {value}
          </p>
          {subtitle && <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{subtitle}</p>}
        </div>
        {icon && <div className={`text-3xl ${isDarkMode ? 'opacity-60' : 'opacity-70'
          }`}>{icon}</div>}
      </div>
    </div>
  );
};

function PredictionDashboard() {
  const [data, setData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStock, setSelectedStock] = useState('');
  const [sortBy, setSortBy] = useState('prediction');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table');
  const [isDarkMode, setIsDarkMode] = useState(false);
    // Fetch JSON on mount
  useEffect(() => {
    // 同時載入兩個 JSON 檔案
    Promise.all([
      fetch(`${process.env.PUBLIC_URL}/future.json`),
      fetch(`${process.env.PUBLIC_URL}/future_summary.json`)
    ])
      .then(async ([futureResponse, summaryResponse]) => {
        // 處理 future.json 中的 NaN 值
        const futureText = await futureResponse.text();
        const cleanedFutureText = futureText.replace(/:\s*NaN/g, ': null');
        const futureData = JSON.parse(cleanedFutureText);
        
        const summaryData = await summaryResponse.json();
        setData(futureData);
        setSummaryData(summaryData);
        setSelectedDate(futureData.metadata?.prediction_date?.split('T')[0] || '2025-06-15');
      })
      .catch((err) => console.error('❌ 加载数据失败:', err));
  }, []);if (!data || !summaryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">🚀 載入 AI 預測數據中...</h2>
          <p className="text-gray-500">正在分析股票市場趨勢與智能推薦</p>
        </Card>
      </div>
    );
  }

  // 更新為使用 future.json 的數據結構
  const stocks = Object.keys(data.comprehensive_predictions || {});
  const predictionDate = data.metadata?.prediction_date?.split('T')[0] || selectedDate;

  // 獲取當前股票數據
  const currentStockData = data.comprehensive_predictions || {};
  // 過濾和排序股票
  const filteredStocks = stocks
    .filter((stock) => stock.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aData = currentStockData[a];
      const bData = currentStockData[b];
      if (!aData || !bData) return 0;

      let aValue, bValue;
      switch (sortBy) {
        case 'prediction':
          aValue = aData.multi_horizon_returns?.['7d']?.expected_return || 0;
          bValue = bData.multi_horizon_returns?.['7d']?.expected_return || 0;
          break;
        case 'volatility':
          aValue = aData.risk_metrics?.volatility_7d || 0;
          bValue = bData.risk_metrics?.volatility_7d || 0;
          break;
        case 'confidence':
          aValue = aData.selection_scores?.composite_score || 0;
          bValue = bData.selection_scores?.composite_score || 0;
          break;
        case 'cumulative':
          aValue = aData.multi_horizon_returns?.['7d']?.cumulative_return || 0;
          bValue = bData.multi_horizon_returns?.['7d']?.cumulative_return || 0;
          break;
        case 'last_return':
          aValue = aData.basic_info?.last_known_return || 0;
          bValue = bData.basic_info?.last_known_return || 0;
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  // 準備圖表數據 - 使用多時間段預測
  const trendData = selectedStock ?
    ['1d', '3d', '5d', '7d'].map((period) => ({
      period: period,
      label: `${period.replace('d', '日')}`,
      expected: (currentStockData[selectedStock]?.multi_horizon_returns[period]?.expected_return || 0) * 100,
      cumulative: (currentStockData[selectedStock]?.multi_horizon_returns[period]?.cumulative_return || 0) * 100,
      days: parseInt(period.replace('d', ''))
    })) : [];
  // 詳細日回報數據
  const dailyReturnsData = selectedStock && currentStockData[selectedStock]?.multi_horizon_returns?.['7d']?.daily_returns ?
    currentStockData[selectedStock].multi_horizon_returns['7d'].daily_returns.map((ret, index) => ({
      day: `第${index + 1}日`,
      return: parseFloat(formatPercentage(ret).replace('%', '')),
      累積: parseFloat(formatPercentage(currentStockData[selectedStock].multi_horizon_returns['7d'].daily_returns.slice(0, index + 1).reduce((sum, r) => sum + r, 0)).replace('%', ''))
    })) : [];

  // 市場情緒分佈數據 - 基於綜合評分
  const sentimentData = (() => {
    const scores = stocks.map(stock => currentStockData[stock]?.selection_scores?.composite_score || 50);
    const positive = scores.filter(s => s > 60).length;
    const negative = scores.filter(s => s < 40).length;
    const neutral = stocks.length - positive - negative;

    return [
      { name: '看漲', value: Math.round((positive / stocks.length) * 100), color: '#10B981' },
      { name: '看跌', value: Math.round((negative / stocks.length) * 100), color: '#EF4444' },
      { name: '中性', value: Math.round((neutral / stocks.length) * 100), color: '#6B7280' }
    ];
  })();

  // 風險-收益散點圖數據
  const riskReturnData = filteredStocks.map(stock => {
    const stockData = currentStockData[stock];
    return {
      name: stock.toUpperCase(),
      risk: (stockData?.risk_metrics?.volatility_7d || 0) * 100,
      return: (stockData?.multi_horizon_returns?.['7d']?.expected_return || 0) * 100,
      confidence: stockData?.selection_scores?.composite_score || 0
    };
  });

  const getSignalColor = (score) => {
    if (score > 60) return 'success';
    if (score < 40) return 'danger';
    return 'warning';
  }; const getTrendIcon = (expectedReturn) => {
    if (expectedReturn > 0.03) return '🚀'; // 強烈上漲
    if (expectedReturn > 0.01) return '📈'; // 上漲
    if (expectedReturn > -0.01) return '➡️'; // 平穩
    if (expectedReturn > -0.03) return '📉'; // 下跌
    return '💀'; // 強烈下跌
  };

  const getRiskLevel = (volatility) => {
    if (volatility > 0.05) return { level: 'HIGH', variant: 'danger', label: '🔥高風險', color: 'text-red-600' };
    if (volatility > 0.02) return { level: 'MEDIUM', variant: 'warning', label: '⚠️中風險', color: 'text-amber-600' };
    if (volatility > 0.001) return { level: 'LOW', variant: 'success', label: '✅低風險', color: 'text-emerald-600' };
    return { level: 'MINIMAL', variant: 'info', label: '🛡️極低風險', color: 'text-blue-600' };
  };

  const getPerformanceRating = (compositeScore) => {
    if (compositeScore >= 90) return { rating: 'EXCELLENT', variant: 'success', label: '🏆優秀', color: 'text-emerald-600' };
    if (compositeScore >= 75) return { rating: 'VERY_GOOD', variant: 'success', label: '⭐很好', color: 'text-green-600' };
    if (compositeScore >= 60) return { rating: 'GOOD', variant: 'info', label: '👍良好', color: 'text-blue-600' };
    if (compositeScore >= 40) return { rating: 'FAIR', variant: 'warning', label: '🤔一般', color: 'text-amber-600' };
    return { rating: 'POOR', variant: 'danger', label: '👎較差', color: 'text-red-600' };
  }; return (
    <div className={`min-h-screen transition-all duration-300 ${isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark-mode'
        : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
      }`}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">        {/* 標題和市場概覽 */}
        <Card hover className={`${isDarkMode
            ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white'
            : 'bg-gradient-to-r from-white to-gray-50'
          }`}>
          <CardHeader className={`${isDarkMode
              ? 'bg-gradient-to-r from-blue-700 to-purple-700'
              : 'bg-gradient-to-r from-blue-600 to-purple-600'
            } text-white rounded-t-xl`}><div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold">qlib AI 股票預測儀表盤</h1>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  variant="secondary"
                  size="sm"
                  className={`transition-all ${isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {isDarkMode ? '☀️ 淺色' : '🌙 深色'}
                </Button>
                <Badge variant="info" size="lg" glow>
                  {stocks.length} 支股票
                </Badge>
                <Badge variant="success" size="lg" glow>
                  多時間段預測
                </Badge>
                <span className={`text-lg font-semibold px-4 py-2 rounded-lg border-2 ${isDarkMode
                    ? 'bg-gray-800 bg-opacity-80 text-white border-gray-600'
                    : 'bg-white bg-opacity-90 text-gray-800 border-gray-200'
                  }`}>
                  📅 {predictionDate}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <StatCard
                title="資料維度"
                value={Object.values(currentStockData)[0]?.basic_info?.feature_dimension || 'N/A'}
                subtitle="AI 特徵向量"
                icon="🧠"
                color="blue"
                isDarkMode={isDarkMode}
              />
              <StatCard
                title="平均7日預期"
                value={(() => {
                  const avgReturn = stocks.reduce((sum, stock) =>
                    sum + (currentStockData[stock]?.multi_horizon_returns?.['7d']?.expected_return || 0), 0) / stocks.length;
                  return formatPercentage(avgReturn);
                })()}
                subtitle="預期收益率"
                icon="📈"
                color="green"
                isDarkMode={isDarkMode}
              />
              <StatCard
                title="平均波動率"
                value={(() => {
                  const avgVol = stocks.reduce((sum, stock) =>
                    sum + (currentStockData[stock]?.risk_metrics?.volatility_7d || 0), 0) / stocks.length;
                  return formatPercentage(avgVol, 4);
                })()}
                subtitle="7日波動率"
                icon="📊"
                color="yellow"
                isDarkMode={isDarkMode}
              />
              <StatCard
                title="綜合評分"
                value={(() => {
                  const avgScore = stocks.reduce((sum, stock) =>
                    sum + (currentStockData[stock]?.selection_scores?.composite_score || 50), 0) / stocks.length;
                  return formatScore(avgScore);
                })()}
                subtitle="平均得分"
                icon="🎯"
                color="purple"
                isDarkMode={isDarkMode}
              />
              <StatCard
                title="平均夏普比率"
                value={(() => {
                  const avgSharpe = stocks.reduce((sum, stock) =>
                    sum + (currentStockData[stock]?.risk_metrics?.sharpe_ratio_7d || 0), 0) / stocks.length;
                  return formatNumber(avgSharpe, 2);
                })()}
                subtitle="風險調整回報"
                icon="⚖️"
                color="blue"
                isDarkMode={isDarkMode}
              />
              <StatCard
                title="模型訓練輪數"
                value={data.metadata?.model_epochs ? formatNumber(data.metadata.model_epochs, 1) : 'N/A'}
                subtitle="AI 訓練強度"
                icon="🤖"
                color="red"
                isDarkMode={isDarkMode}
              />
            </div>
          </CardContent>        </Card>        {/* 控制面板 */}
        <Card hover className={`${isDarkMode
            ? 'bg-gradient-to-r from-gray-800 to-gray-700'
            : 'bg-gradient-to-r from-white to-blue-50'
          }`}>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col min-w-[200px]">
                <Label htmlFor="stock-search" className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>🔍 搜索股票</Label>
                <Input
                  id="stock-search"
                  placeholder="輸入股票代碼 (如 AAPL)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`shadow-sm ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900'
                    }`}
                />
              </div>

              <div className="flex flex-col min-w-[150px]">
                <Label htmlFor="sort-by" className="text-gray-700 font-semibold">📊 排序依據</Label>
                <Select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="shadow-sm"
                >
                  <option value="prediction">7日預期收益</option>
                  <option value="volatility">波動率</option>
                  <option value="confidence">綜合評分</option>
                  <option value="cumulative">7日累積收益</option>
                  <option value="last_return">歷史收益</option>
                </Select>
              </div>

              <div className="flex flex-col min-w-[120px]">
                <Label htmlFor="sort-order" className="text-gray-700 font-semibold">🔄 排序順序</Label>
                <Select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="shadow-sm"
                >
                  <option value="desc">高到低</option>
                  <option value="asc">低到高</option>
                </Select>
              </div>

              <div className="flex flex-col min-w-[120px]">
                <Label htmlFor="view-mode" className="text-gray-700 font-semibold">👁️ 顯示模式</Label>
                <Select
                  id="view-mode"
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="shadow-sm"
                >
                  <option value="table">📋 表格</option>
                  <option value="cards">🗃️ 卡片</option>
                  <option value="chart">📊 圖表</option>
                </Select>
              </div>
            </div>
          </CardContent>        </Card>

        {/* 主要內容區域 */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <TabPanel value="overview" label="📊 市場概覽">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 市場情緒分佈 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">市場情緒分佈</h3>
                </CardHeader>
                <CardContent style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 風險-收益散點圖 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">風險-收益分析</h3>
                </CardHeader>
                <CardContent style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={riskReturnData}>
                      <XAxis dataKey="risk" name="風險" unit="%" />
                      <YAxis dataKey="return" name="收益" unit="%" />                      <Tooltip
                        formatter={(value, name) => [
                          `${formatNumber(value)}%`,
                          name === 'risk' ? '風險' : '收益'
                        ]}
                        labelFormatter={(label) => `股票: ${label}`}
                      />
                      <Scatter dataKey="return" fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabPanel>          <TabPanel value="stocks" label="📈 股票分析">
            {viewMode === 'table' && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">多時間段股票預測詳情</h3>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">                      <thead>
                      <tr className="bg-gray-200">
                        <th className="p-3 text-left">股票</th>
                        <th className="p-3 text-right">1日預期</th>
                        <th className="p-3 text-right">3日預期</th>
                        <th className="p-3 text-right">5日預期</th>
                        <th className="p-3 text-right">7日預期</th>
                        <th className="p-3 text-right">7日累積</th>
                        <th className="p-3 text-right">歷史收益</th>
                        <th className="p-3 text-center">綜合評分</th>
                        <th className="p-3 text-right">夏普比率</th>
                        <th className="p-3 text-right">波動率</th>
                        <th className="p-3 text-center">技術信號</th>
                        <th className="p-3 text-center">趨勢強度</th>
                        <th className="p-3 text-center">操作</th>
                      </tr>
                    </thead>                      <tbody>                        {filteredStocks.map((stock) => {
                      const stockData = currentStockData[stock] || {};
                      const oneDayReturn = stockData.multi_horizon_returns?.['1d']?.expected_return || 0;
                      const threeDayReturn = stockData.multi_horizon_returns?.['3d']?.expected_return || 0;
                      const fiveDayReturn = stockData.multi_horizon_returns?.['5d']?.expected_return || 0;
                      const sevenDayReturn = stockData.multi_horizon_returns?.['7d']?.expected_return || 0;
                      const cumulativeReturn = stockData.multi_horizon_returns?.['7d']?.cumulative_return || 0;
                      const lastKnownReturn = stockData.basic_info?.last_known_return || 0;
                      const compositeScore = stockData.selection_scores?.composite_score || 50;
                      const sharpeRatio = stockData.risk_metrics?.sharpe_ratio_7d || 0;
                      const volatility = stockData.risk_metrics?.volatility_7d || 0;
                      const technicalSignal = stockData.technical_signals?.predicted_signal || 'UNKNOWN';
                      const trendStrength = stockData.trend_analysis?.trend_strength || 0;
                      const performanceInfo = getPerformanceRating(compositeScore);

                      const getSignalBadge = (signal) => {
                        switch (signal) {
                          case 'BUY': return <Badge variant="success">🚀 買入</Badge>;
                          case 'SELL': return <Badge variant="danger">📉 賣出</Badge>;
                          case 'HOLD': return <Badge variant="warning">⏸️ 持有</Badge>;
                          default: return <Badge variant="default">❓ 未知</Badge>;
                        }
                      };

                      return (
                        <tr key={stock} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-bold text-blue-600 uppercase">{stock}</td>
                          <td className={`p-3 text-right font-semibold ${oneDayReturn >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {formatPercentage(oneDayReturn)}
                          </td>
                          <td className={`p-3 text-right font-semibold ${threeDayReturn >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {formatPercentage(threeDayReturn)}
                          </td>
                          <td className={`p-3 text-right font-semibold ${fiveDayReturn >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {formatPercentage(fiveDayReturn)}
                          </td>
                          <td className={`p-3 text-right font-semibold ${sevenDayReturn >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {formatPercentage(sevenDayReturn)}
                          </td>
                          <td className={`p-3 text-right ${cumulativeReturn >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {formatPercentage(cumulativeReturn)}
                          </td>
                          <td className={`p-3 text-right ${lastKnownReturn >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {formatPercentage(lastKnownReturn)}
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant={performanceInfo.variant}>
                              {formatScore(compositeScore)}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {performanceInfo.label}
                            </div>
                          </td>
                          <td className="p-3 text-right font-medium">
                            {formatNumber(sharpeRatio, 2)}
                          </td>
                          <td className="p-3 text-right">{formatPercentage(volatility)}</td>
                          <td className="p-3 text-center">
                            {getSignalBadge(technicalSignal)}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center">
                              <div className={`w-12 h-2 rounded-full ${trendStrength > 0.05 ? 'bg-green-500' :
                                  trendStrength > 0.02 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                              <span className="ml-2 text-xs">
                                {formatPercentage(trendStrength)}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              size="sm"
                              onClick={() => setSelectedStock(stock)}
                              variant="primary"
                            >
                              深度分析
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStocks.map((stock) => {
                  const stockData = currentStockData[stock] || {};
                  const oneDayReturn = stockData.multi_horizon_returns?.['1d']?.expected_return || 0;
                  const sevenDayReturn = stockData.multi_horizon_returns?.['7d']?.expected_return || 0;
                  const cumulativeReturn = stockData.multi_horizon_returns?.['7d']?.cumulative_return || 0;
                  const lastKnownReturn = stockData.basic_info?.last_known_return || 0;
                  const compositeScore = stockData.selection_scores?.composite_score || 50;
                  const volatility = stockData.risk_metrics?.volatility_7d || 0;
                  const riskInfo = getRiskLevel(volatility);
                  const performanceInfo = getPerformanceRating(compositeScore);

                  return (
                    <Card key={stock} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-lg uppercase">{stock}</h3>
                          <div className="flex space-x-1">
                            <Badge variant={performanceInfo.variant}>
                              {performanceInfo.label}
                            </Badge>
                            <Badge variant={riskInfo.variant}>
                              {riskInfo.label}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-gray-50 p-2 rounded">                              <div className="text-xs text-gray-500">1日預期收益</div>
                              <div className={`font-semibold ${oneDayReturn >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {formatPercentage(oneDayReturn)}
                              </div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-xs text-gray-500">7日預期收益</div>
                              <div className={`font-semibold ${sevenDayReturn >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {formatPercentage(sevenDayReturn)}
                              </div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-xs text-gray-500">7日累積收益</div>
                              <div className={`font-semibold ${cumulativeReturn >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {formatPercentage(cumulativeReturn)}
                              </div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-xs text-gray-500">歷史收益</div>
                              <div className={`font-semibold ${lastKnownReturn >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {formatPercentage(lastKnownReturn)}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-sm">
                            <span>綜合評分:</span>
                            <Badge variant={performanceInfo.variant}>
                              {formatScore(compositeScore)}/100
                            </Badge>
                          </div>

                          <div className="flex justify-between items-center text-sm">
                            <span>波動率:</span>
                            <span className="font-medium">{formatPercentage(volatility)}</span>
                          </div>

                          <div className="flex justify-between items-center text-sm">
                            <span>數據點數:</span>
                            <span className="font-medium">{stockData.basic_info?.data_points || 'N/A'}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm">趨勢:</span>
                            <span className="text-lg">{getTrendIcon(sevenDayReturn)}</span>
                          </div>

                          <Button
                            onClick={() => setSelectedStock(stock)}
                            variant="primary"
                            size="sm"
                            className="w-full mt-3"
                          >
                            查看多時間段趨勢
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}            {viewMode === 'chart' && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">股票多時間段預測分析圖表</h3>
                </CardHeader>
                <CardContent style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">                    <BarChart data={filteredStocks.slice(0, 15).map(stock => {
                    const stockData = currentStockData[stock] || {};
                    return {
                      name: stock.toUpperCase(),
                      '1日預期': parseFloat(formatPercentage(stockData.multi_horizon_returns?.['1d']?.expected_return || 0).replace('%', '')),
                      '7日預期': parseFloat(formatPercentage(stockData.multi_horizon_returns?.['7d']?.expected_return || 0).replace('%', '')),
                      '7日累積': parseFloat(formatPercentage(stockData.multi_horizon_returns?.['7d']?.cumulative_return || 0).replace('%', '')),
                      '波動率': parseFloat(formatPercentage(stockData.risk_metrics?.volatility_7d || 0).replace('%', '')),
                      '綜合評分': parseFloat(formatScore(stockData.selection_scores?.composite_score || 50))
                    };
                  })}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === '綜合評分' ? `${value}分` : `${value}%`,
                      name
                    ]} />
                    <Bar dataKey="1日預期" fill="#8884d8" />
                    <Bar dataKey="7日預期" fill="#82ca9d" />
                    <Bar dataKey="7日累積" fill="#ffc658" />
                    <Bar dataKey="波動率" fill="#ff7300" />
                  </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabPanel>          <TabPanel value="trends" label="📉 AI智能分析">
            <div className="space-y-6">
              {/* 全市場概覽儀表盤 */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold flex items-center">
                    🎯 全市場AI智能分析儀表盤
                    <Badge variant="success" className="ml-3">實時更新</Badge>
                  </h3>
                </CardHeader>
                <CardContent>                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* 技術信號分佈 */}
                  <div className={`bg-gradient-to-br p-6 rounded-xl ${isDarkMode
                      ? 'from-blue-900/30 to-blue-800/30 border border-blue-600/30'
                      : 'from-blue-50 to-blue-100'
                    }`}>
                    <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'
                      }`}>🚦 技術信號分佈</h4>
                    {(() => {
                      const signals = stocks.map(stock =>
                        currentStockData[stock]?.technical_signals?.predicted_signal || 'UNKNOWN'
                      );
                      const buyCount = signals.filter(s => s === 'BUY').length;
                      const sellCount = signals.filter(s => s === 'SELL').length;
                      const holdCount = signals.filter(s => s === 'HOLD').length;

                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'
                              }`}>🚀 買入信號</span>
                            <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>{buyCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'
                              }`}>📉 賣出信號</span>
                            <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>{sellCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                              }`}>⏸️ 持有信號</span>
                            <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>{holdCount}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  {/* 風險等級分佈 */}
                  <div className={`bg-gradient-to-br p-6 rounded-xl ${isDarkMode
                      ? 'from-green-900/30 to-green-800/30 border border-green-600/30'
                      : 'from-green-50 to-green-100'
                    }`}>
                    <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-green-300' : 'text-green-800'
                      }`}>⚖️ 風險等級分析</h4>
                    {(() => {
                      const avgVol = stocks.reduce((sum, stock) =>
                        sum + (currentStockData[stock]?.risk_metrics?.volatility_7d || 0), 0) / stocks.length;
                      const avgSharpe = stocks.reduce((sum, stock) =>
                        sum + (currentStockData[stock]?.risk_metrics?.sharpe_ratio_7d || 0), 0) / stocks.length;
                      const avgMaxDrawdown = stocks.reduce((sum, stock) =>
                        sum + (currentStockData[stock]?.risk_metrics?.max_drawdown_7d || 0), 0) / stocks.length;

                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>平均波動率</span>
                            <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>{formatPercentage(avgVol)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>平均夏普比率</span>
                            <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>{formatNumber(avgSharpe, 2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>平均最大回撤</span>
                            <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>{formatPercentage(avgMaxDrawdown)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  {/* 概率分析 */}
                  <div className={`bg-gradient-to-br p-6 rounded-xl ${isDarkMode
                      ? 'from-purple-900/30 to-purple-800/30 border border-purple-600/30'
                      : 'from-purple-50 to-purple-100'
                    }`}>
                    <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-purple-300' : 'text-purple-800'
                      }`}>🎲 概率預測分析</h4>
                    {(() => {
                      const avgProbPositive = stocks.reduce((sum, stock) =>
                        sum + (currentStockData[stock]?.probability_distributions?.prob_positive_7d || 0), 0) / stocks.length;
                      const avgProbGain5pct = stocks.reduce((sum, stock) =>
                        sum + (currentStockData[stock]?.probability_distributions?.prob_gain_5pct_7d || 0), 0) / stocks.length;
                      const avgProbOutperform = stocks.reduce((sum, stock) =>
                        sum + (currentStockData[stock]?.probability_distributions?.prob_outperform_market_7d || 0), 0) / stocks.length;

                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>正收益概率</span>
                            <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>{formatPercentage(avgProbPositive)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>獲利5%+概率</span>
                            <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>{formatPercentage(avgProbGain5pct)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>跑贏市場概率</span>
                            <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>{formatPercentage(avgProbOutperform)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  {/* 趨勢強度分析 */}
                  <div className={`bg-gradient-to-br p-6 rounded-xl ${isDarkMode
                      ? 'from-orange-900/30 to-orange-800/30 border border-orange-600/30'
                      : 'from-orange-50 to-orange-100'
                    }`}>
                    <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-orange-300' : 'text-orange-800'
                      }`}>📈 趨勢強度分析</h4>
                    {(() => {
                      const uptrends = stocks.filter(stock =>
                        currentStockData[stock]?.trend_analysis?.predicted_trend === 'UPTREND'
                      ).length;
                      const downtrends = stocks.filter(stock =>
                        currentStockData[stock]?.trend_analysis?.predicted_trend === 'DOWNTREND'
                      ).length;
                      const avgTrendConsistency = stocks.reduce((sum, stock) =>
                        sum + (currentStockData[stock]?.trend_analysis?.trend_consistency || 0), 0) / stocks.length;

                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'
                              }`}>📈 上升趨勢</span>
                            <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>{uptrends}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'
                              }`}>📉 下降趨勢</span>
                            <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>{downtrends}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>平均趨勢一致性</span>
                            <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>{formatPercentage(avgTrendConsistency)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                </CardContent>
              </Card>

              {/* 詳細股票對比分析 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 多維度評分雷達圖 */}
                <Card>
                  <CardHeader>
                    <h4 className="text-lg font-semibold">📊 多維度評分對比</h4>
                  </CardHeader>
                  <CardContent style={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stocks.map(stock => {
                        const stockData = currentStockData[stock] || {};
                        const scores = stockData.selection_scores || {};
                        return {
                          股票: stock.toUpperCase(),
                          收益評分: scores.return_score || 0,
                          風險評分: scores.risk_score || 0,
                          夏普評分: scores.sharpe_score || 0,
                          概率評分: scores.probability_score || 0,
                          趨勢評分: scores.trend_score || 0,
                          技術評分: scores.technical_score || 0
                        };
                      })}>
                        <XAxis dataKey="股票" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="收益評分" fill="#10B981" />
                        <Bar dataKey="風險評分" fill="#3B82F6" />
                        <Bar dataKey="夏普評分" fill="#8B5CF6" />
                        <Bar dataKey="概率評分" fill="#F59E0B" />
                        <Bar dataKey="趨勢評分" fill="#EF4444" />
                        <Bar dataKey="技術評分" fill="#6B7280" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* 風險-收益3D分析 */}
                <Card>
                  <CardHeader>
                    <h4 className="text-lg font-semibold">🎯 風險-收益-概率分析</h4>
                  </CardHeader>
                  <CardContent style={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={stocks.map(stock => {
                        const stockData = currentStockData[stock] || {};
                        return {
                          name: stock.toUpperCase(),
                          風險: (stockData.risk_metrics?.volatility_7d || 0) * 100,
                          收益: (stockData.multi_horizon_returns?.['7d']?.expected_return || 0) * 100,
                          概率: (stockData.probability_distributions?.prob_positive_7d || 0) * 100,
                          評分: stockData.selection_scores?.composite_score || 0
                        };
                      })}>
                        <XAxis dataKey="風險" name="風險" unit="%" />
                        <YAxis dataKey="收益" name="收益" unit="%" />
                        <Tooltip
                          formatter={(value, name) => [
                            `${formatNumber(value, 2)}${name === '概率' || name === '評分' ? (name === '評分' ? '分' : '%') : '%'}`,
                            name
                          ]}
                          labelFormatter={(label) => `股票: ${label}`}
                        />
                        <Scatter dataKey="收益" fill="#8884d8" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* AI模型訓練歷史 */}
              <Card>
                <CardHeader>
                  <h4 className="text-lg font-semibold">🤖 AI模型訓練歷程分析</h4>
                </CardHeader>
                <CardContent style={{ height: 400 }}>
                  {data.training_history && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.training_history.train.map((trainLoss, index) => ({
                        epoch: index + 1,
                        訓練損失: trainLoss,
                        驗證損失: data.training_history.valid[index] || 0
                      }))}>
                        <XAxis dataKey="epoch" name="訓練輪數" />
                        <YAxis name="損失值" />
                        <Tooltip formatter={(value, name) => [value.toFixed(4), name]} />
                        <Line type="monotone" dataKey="訓練損失" stroke="#3B82F6" strokeWidth={2} name="訓練損失" />
                        <Line type="monotone" dataKey="驗證損失" stroke="#EF4444" strokeWidth={2} name="驗證損失" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* 選股建議分析 */}
              {selectedStock && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">🔍 {selectedStock.toUpperCase()} 深度智能分析</h3>
                      <Button onClick={() => setSelectedStock('')} variant="secondary" size="sm">
                        關閉分析
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const stockData = currentStockData[selectedStock] || {};
                      const basic = stockData.basic_info || {};
                      const risk = stockData.risk_metrics || {};
                      const technical = stockData.technical_signals || {};
                      const trend = stockData.trend_analysis || {};
                      const prob = stockData.probability_distributions || {};
                      const scores = stockData.selection_scores || {};

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* 基本面分析 */}
                          <div className="bg-blue-50 p-6 rounded-xl">
                            <h5 className="font-bold text-blue-800 mb-4">📋 基本面數據</h5>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm">預測日期</span>
                                <span className="font-medium">{basic.prediction_date}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">數據點數</span>
                                <span className="font-medium">{basic.data_points}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">特徵維度</span>
                                <span className="font-medium">{basic.feature_dimension}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">歷史表現</span>
                                <span className={`font-medium ${basic.last_known_return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatPercentage(basic.last_known_return)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 風險管理分析 */}
                          <div className="bg-red-50 p-6 rounded-xl">
                            <h5 className="font-bold text-red-800 mb-4">⚠️ 風險管理指標</h5>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm">7日波動率</span>
                                <span className="font-medium">{formatPercentage(risk.volatility_7d)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">20日波動率</span>
                                <span className="font-medium">{formatPercentage(risk.volatility_20d)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">VaR 95%</span>
                                <span className="font-medium">{formatPercentage(risk.var_95_7d)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">VaR 99%</span>
                                <span className="font-medium">{formatPercentage(risk.var_99_7d)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">夏普比率</span>
                                <span className="font-medium">{formatNumber(risk.sharpe_ratio_7d, 2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">最大回撤</span>
                                <span className="font-medium">{formatPercentage(risk.max_drawdown_7d)}</span>
                              </div>
                            </div>
                          </div>

                          {/* 技術分析 & 趨勢 */}
                          <div className="bg-green-50 p-6 rounded-xl">
                            <h5 className="font-bold text-green-800 mb-4">📈 技術與趨勢分析</h5>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm">技術信號</span>
                                <Badge variant={technical.predicted_signal === 'BUY' ? 'success' : technical.predicted_signal === 'SELL' ? 'danger' : 'warning'}>
                                  {technical.predicted_signal}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">趨勢方向</span>
                                <Badge variant={trend.predicted_trend === 'UPTREND' ? 'success' : 'danger'}>
                                  {trend.predicted_trend}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">趨勢強度</span>
                                <span className="font-medium">{formatPercentage(trend.trend_strength)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">趨勢一致性</span>
                                <span className="font-medium">{formatPercentage(trend.trend_consistency)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">動量5日</span>
                                <span className={`font-medium ${technical.momentum_5d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatPercentage(technical.momentum_5d)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">歷史變化</span>
                                <Badge variant={trend.trend_change_vs_history === 'IMPROVING' ? 'success' : trend.trend_change_vs_history === 'DETERIORATING' ? 'danger' : 'warning'}>
                                  {trend.trend_change_vs_history}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* 快速選股工具 */}
              <Card>
                <CardHeader>
                  <h4 className="text-lg font-semibold">⚡ 智能選股工具</h4>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stocks.map(stock => {
                      const stockData = currentStockData[stock] || {};
                      const score = stockData.selection_scores?.composite_score || 0;
                      const signal = stockData.technical_signals?.predicted_signal || 'UNKNOWN';
                      const trend = stockData.trend_analysis?.predicted_trend || 'UNKNOWN';
                      const expectedReturn = stockData.multi_horizon_returns?.['7d']?.expected_return || 0;

                      return (
                        <div key={stock} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 transition-all cursor-pointer"
                          onClick={() => setSelectedStock(stock)}>
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-bold text-lg uppercase">{stock}</h5>
                            <Badge variant={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger'}>
                              {formatScore(score)}分
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>7日預期</span>
                              <span className={`font-medium ${expectedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(expectedReturn)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>技術信號</span>
                              <Badge variant={signal === 'BUY' ? 'success' : signal === 'SELL' ? 'danger' : 'warning'} size="sm">
                                {signal}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>趨勢</span>
                              <Badge variant={trend === 'UPTREND' ? 'success' : 'danger'} size="sm">
                                {trend}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabPanel><TabPanel value="analysis" label="🔍 深度分析">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 股票表現摘要 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">股票表現摘要 (前10名)</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(() => {
                      // 按7日預期收益排序，取前10名
                      const topStocks = stocks
                        .map(stock => ({
                          symbol: stock,
                          data: currentStockData[stock]
                        }))
                        .filter(item => item.data)
                        .sort((a, b) =>
                          (b.data.multi_horizon_returns?.['7d']?.expected_return || 0) -
                          (a.data.multi_horizon_returns?.['7d']?.expected_return || 0)
                        )
                        .slice(0, 10);

                      return topStocks.map(({ symbol, data }) => {
                        const sevenDayReturn = data.multi_horizon_returns?.['7d']?.expected_return || 0;
                        const compositeScore = data.selection_scores?.composite_score || 50;
                        const volatility = data.risk_metrics?.volatility_7d || 0;
                        const performanceInfo = getPerformanceRating(compositeScore);

                        return (
                          <div key={symbol} className="border-l-4 border-green-500 pl-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold uppercase">{symbol}</h4>
                              <Badge variant={performanceInfo.variant}>
                                {performanceInfo.label}
                              </Badge>
                            </div>                            <div className="text-sm text-gray-600 mt-1 grid grid-cols-3 gap-4">
                              <p>7日預期: <span className={sevenDayReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {formatPercentage(sevenDayReturn)}
                              </span></p>
                              <p>評分: {formatScore(compositeScore)}/100</p>
                              <p>波動率: {formatPercentage(volatility)}</p>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* 風險分析 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">風險分析概覽</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      // 統計風險等級分佈
                      const riskDistribution = stocks.reduce((acc, stock) => {
                        const volatility = currentStockData[stock]?.risk_metrics?.volatility_7d || 0;
                        const riskInfo = getRiskLevel(volatility);
                        acc[riskInfo.level] = (acc[riskInfo.level] || 0) + 1;
                        return acc;
                      }, {});

                      // 計算統計數據
                      const returns = stocks.map(stock =>
                        currentStockData[stock]?.multi_horizon_returns?.['7d']?.expected_return || 0
                      );
                      const volatilities = stocks.map(stock =>
                        currentStockData[stock]?.risk_metrics?.volatility_7d || 0
                      );

                      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
                      const avgVolatility = volatilities.reduce((sum, v) => sum + v, 0) / volatilities.length;
                      const maxReturn = Math.max(...returns);
                      const minReturn = Math.min(...returns);

                      return (
                        <>
                          <div className="bg-gray-50 p-4 rounded">
                            <h4 className="font-semibold mb-2">風險等級分佈</h4>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="text-center">
                                <div className="text-green-600 font-bold text-lg">{riskDistribution.LOW || 0}</div>
                                <div>低風險</div>
                              </div>
                              <div className="text-center">
                                <div className="text-yellow-600 font-bold text-lg">{riskDistribution.MEDIUM || 0}</div>
                                <div>中風險</div>
                              </div>
                              <div className="text-center">
                                <div className="text-red-600 font-bold text-lg">{riskDistribution.HIGH || 0}</div>
                                <div>高風險</div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-blue-50 p-4 rounded">
                            <h4 className="font-semibold mb-2">市場統計</h4>
                            <div className="text-sm space-y-1">
                              <p><strong>平均7日預期收益:</strong>
                                <span className={avgReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {(avgReturn * 100).toFixed(2)}%
                                </span>
                              </p>
                              <p><strong>平均波動率:</strong> {(avgVolatility * 100).toFixed(2)}%</p>
                              <p><strong>收益範圍:</strong>
                                <span className="text-red-600">{(minReturn * 100).toFixed(2)}%</span> ~
                                <span className="text-green-600">{(maxReturn * 100).toFixed(2)}%</span>
                              </p>
                              <p><strong>總股票數:</strong> {stocks.length}</p>
                            </div>
                          </div>

                          <div className="bg-purple-50 p-4 rounded">
                            <h4 className="font-semibold mb-2">AI 模型資訊</h4>
                            <div className="text-sm space-y-1">
                              <p><strong>特徵維度:</strong> {Object.values(currentStockData)[0]?.basic_info?.feature_dimension || 'N/A'}</p>
                              <p><strong>訓練數據點:</strong> {Object.values(currentStockData)[0]?.basic_info?.data_points || 'N/A'}</p>
                              <p><strong>預測時間範圍:</strong> 1-7日多時間段</p>
                              <p><strong>更新日期:</strong> {predictionDate}</p>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>          </TabPanel>

          <TabPanel value="recommendations" label="🎯 AI智能推薦">
            <div className="space-y-6">
              {/* AI 推薦概覽卡片 */}
              <Card className={`${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-white to-blue-50'}`}>
                <CardHeader className={`${isDarkMode ? 'bg-gradient-to-r from-purple-700 to-pink-700' : 'bg-gradient-to-r from-purple-600 to-pink-600'} text-white rounded-t-xl`}>
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">🤖 AI 智能推薦系統</h2>
                    <div className="flex items-center space-x-3">
                      <Badge variant="success" size="lg" glow>
                        分析了 {summaryData?.summary?.total_stocks_analyzed || 0} 支股票
                      </Badge>
                      <Badge variant="info" size="lg" glow>
                        預測成功率 {summaryData?.summary?.successful_predictions === summaryData?.summary?.total_stocks_analyzed ? '100%' : ((summaryData?.summary?.successful_predictions / summaryData?.summary?.total_stocks_analyzed) * 100).toFixed(1) + '%'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <StatCard
                      title="平均綜合評分"
                      value={formatScore(summaryData?.summary?.average_composite_score)}
                      subtitle="全市場平均"
                      icon="📊"
                      color="blue"
                      isDarkMode={isDarkMode}
                    />
                    <StatCard
                      title="最高評分"
                      value={formatScore(summaryData?.summary?.top_score)}
                      subtitle="市場領跑者"
                      icon="🏆"
                      color="yellow"
                      isDarkMode={isDarkMode}
                    />
                    <StatCard
                      title="強力買入"
                      value={summaryData?.summary?.rating_distribution?.STRONG_BUY || 0}
                      subtitle="AI 高度推薦"
                      icon="🚀"
                      color="green"
                      isDarkMode={isDarkMode}
                    />
                    <StatCard
                      title="建議買入"
                      value={summaryData?.summary?.rating_distribution?.BUY || 0}
                      subtitle="投資機會"
                      icon="📈"
                      color="green"
                      isDarkMode={isDarkMode}
                    />
                    <StatCard
                      title="避險建議"
                      value={(summaryData?.summary?.rating_distribution?.STRONG_SELL || 0) + (summaryData?.summary?.rating_distribution?.SELL || 0)}
                      subtitle="謹慎投資"
                      icon="⚠️"
                      color="red"
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 評級分佈視覺化 */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold flex items-center">
                    📈 AI 評級分佈分析
                    <Badge variant="info" className="ml-3">即時更新</Badge>
                  </h3>
                </CardHeader>
                <CardContent style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: '強力買入', value: summaryData?.summary?.rating_distribution?.STRONG_BUY || 0, color: '#10B981' },
                      { name: '建議買入', value: summaryData?.summary?.rating_distribution?.BUY || 0, color: '#34D399' },
                      { name: '持有觀望', value: summaryData?.summary?.rating_distribution?.HOLD || 0, color: '#FBBF24' },
                      { name: '建議賣出', value: summaryData?.summary?.rating_distribution?.SELL || 0, color: '#F87171' },
                      { name: '強力賣出', value: summaryData?.summary?.rating_distribution?.STRONG_SELL || 0, color: '#EF4444' }
                    ]}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} 支股票`, '數量']} />
                      <Bar dataKey="value">
                        {[
                          { name: '強力買入', value: summaryData?.summary?.rating_distribution?.STRONG_BUY || 0, color: '#10B981' },
                          { name: '建議買入', value: summaryData?.summary?.rating_distribution?.BUY || 0, color: '#34D399' },
                          { name: '持有觀望', value: summaryData?.summary?.rating_distribution?.HOLD || 0, color: '#FBBF24' },
                          { name: '建議賣出', value: summaryData?.summary?.rating_distribution?.SELL || 0, color: '#F87171' },
                          { name: '強力賣出', value: summaryData?.summary?.rating_distribution?.STRONG_SELL || 0, color: '#EF4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 頂級推薦與避險建議 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 頂級推薦 */}
                <Card className={`${isDarkMode ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-600/30' : 'bg-gradient-to-br from-green-50 to-emerald-50'}`}>
                  <CardHeader className={`${isDarkMode ? 'bg-gradient-to-r from-green-700 to-emerald-700' : 'bg-gradient-to-r from-green-600 to-emerald-600'} text-white rounded-t-xl`}>
                    <h3 className="text-lg font-bold flex items-center">
                      🌟 頂級投資推薦
                      <Badge variant="success" className="ml-3">AI 精選</Badge>
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(summaryData?.top_recommendations || {}).map(([symbol, data], index) => (
                        <div key={symbol} className={`p-4 rounded-xl border-2 ${isDarkMode 
                          ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-green-600/30' 
                          : 'bg-gradient-to-r from-white to-green-50 border-green-200'
                        } hover:scale-105 transition-all cursor-pointer`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-green-500'
                              }`}>
                                {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                              </div>
                              <div>
                                <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {symbol.toUpperCase()}
                                </h4>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  風險等級: {data.risk_level}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                {formatScore(data.score)}
                              </div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                綜合評分
                              </div>
                              <div className={`text-lg font-semibold ${data.expected_7d_return >= 0 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
                                {formatPercentage(data.expected_7d_return)}
                              </div>
                              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                7日預期收益
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 避險建議 */}
                <Card className={`${isDarkMode ? 'bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-600/30' : 'bg-gradient-to-br from-red-50 to-orange-50'}`}>
                  <CardHeader className={`${isDarkMode ? 'bg-gradient-to-r from-red-700 to-orange-700' : 'bg-gradient-to-r from-red-600 to-orange-600'} text-white rounded-t-xl`}>
                    <h3 className="text-lg font-bold flex items-center">
                      ⚠️ 避險投資建議
                      <Badge variant="danger" className="ml-3">謹慎觀察</Badge>
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(summaryData?.avoid_list || {}).map(([symbol, data], index) => (
                        <div key={symbol} className={`p-4 rounded-xl border-2 ${isDarkMode 
                          ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-red-600/30' 
                          : 'bg-gradient-to-r from-white to-red-50 border-red-200'
                        } hover:scale-105 transition-all cursor-pointer`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center font-bold text-white">
                                ⚠️
                              </div>
                              <div>
                                <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {symbol.toUpperCase()}
                                </h4>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {data.reason}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                {formatScore(data.score)}
                              </div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                綜合評分
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 智能投資組合建議 */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold flex items-center">
                    💼 智能投資組合建議
                    <Badge variant="info" className="ml-3">基於 AI 分析</Badge>
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 保守型組合 */}
                    <div className={`p-6 rounded-xl border-2 ${isDarkMode 
                      ? 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-600/30' 
                      : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
                    }`}>
                      <h4 className={`font-bold text-lg mb-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                        🛡️ 保守型組合
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(summaryData?.top_recommendations || {})
                          .filter(([, data]) => data.risk_level === 'LOW')
                          .slice(0, 3)
                          .map(([symbol, data]) => (
                            <div key={symbol} className="flex justify-between items-center">
                              <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                {symbol.toUpperCase()}
                              </span>
                              <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                {formatPercentage(data.expected_7d_return)}
                              </span>
                            </div>
                          ))}
                        <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                          <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                            <strong>建議配置:</strong> 適合穩健投資者，重視資本保值
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 平衡型組合 */}
                    <div className={`p-6 rounded-xl border-2 ${isDarkMode 
                      ? 'bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-600/30' 
                      : 'bg-gradient-to-br from-green-50 to-teal-50 border-green-200'
                    }`}>
                      <h4 className={`font-bold text-lg mb-4 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                        ⚖️ 平衡型組合
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(summaryData?.top_recommendations || {})
                          .slice(0, 4)
                          .map(([symbol, data]) => (
                            <div key={symbol} className="flex justify-between items-center">
                              <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                {symbol.toUpperCase()}
                              </span>
                              <span className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                {formatPercentage(data.expected_7d_return)}
                              </span>
                            </div>
                          ))}
                        <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                          <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                            <strong>建議配置:</strong> 風險收益平衡，適合大多數投資者
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 成長型組合 */}
                    <div className={`p-6 rounded-xl border-2 ${isDarkMode 
                      ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-600/30' 
                      : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                    }`}>
                      <h4 className={`font-bold text-lg mb-4 ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                        🚀 成長型組合
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(summaryData?.top_recommendations || {})
                          .sort(([,a], [,b]) => b.expected_7d_return - a.expected_7d_return)
                          .slice(0, 3)
                          .map(([symbol, data]) => (
                            <div key={symbol} className="flex justify-between items-center">
                              <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                {symbol.toUpperCase()}
                              </span>
                              <span className={`font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                {formatPercentage(data.expected_7d_return)}
                              </span>
                            </div>
                          ))}
                        <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                          <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                            <strong>建議配置:</strong> 追求高收益，適合積極投資者
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<PredictionDashboard />);
