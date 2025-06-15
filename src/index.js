import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { createRoot } from 'react-dom/client';
import './index.css';

// 簡化的 UI 組件（如果不使用 shadcn/ui）
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => (
  <div className="px-6 py-4 border-b">{children}</div>
);

const CardContent = ({ children, className = "", style }) => (
  <div className={`px-6 py-4 ${className}`} style={style}>{children}</div>
);

const Input = ({ placeholder, value, onChange, id }) => (
  <input
    id={id}
    className="border rounded px-3 py-2 w-full"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
  />
);

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">{children}</label>
);

// 新增更多 UI 組件
const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800"
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const Button = ({ children, onClick, variant = "primary", size = "md", disabled = false }) => {
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-500 hover:bg-red-600 text-white"
  };
  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded transition-colors ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const Tabs = ({ value, onChange, children }) => {
  return (
    <div className="w-full">
      <div className="flex border-b">
        {React.Children.map(children, (child, index) => {
          // 確保 child 是有效的 React 元素且有 props
          if (!React.isValidElement(child) || !child.props) {
            return null;
          }
          
          return (
            <button
              key={child.props.value || index}
              onClick={() => onChange(child.props.value)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                value === child.props.value
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {child.props.label}
            </button>
          );
        })}
      </div>      <div className="mt-4">
        {React.Children.toArray(children).find(child => 
          React.isValidElement(child) && child.props && child.props.value === value
        )}
      </div>
    </div>
  );
};

const TabPanel = ({ children, value, label }) => {
  return <div>{children}</div>;
};

const Select = ({ value, onChange, children, id }) => (
  <select id={id} value={value} onChange={onChange} className="border rounded px-3 py-2">
    {children}
  </select>
);

function PredictionDashboard() {
  const [data, setData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStock, setSelectedStock] = useState('');
  const [sortBy, setSortBy] = useState('prediction');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table');

  // Fetch JSON on mount
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/future.json`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        // 使用 comprehensive_predictions 作為股票數據源
        const stockSymbols = Object.keys(json.comprehensive_predictions);
        setSelectedDate(json.metadata?.prediction_date?.split('T')[0] || '2025-06-14');
      })
      .catch((err) => console.error('加载预测数据失败:', err));
  }, []);

  if (!data) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
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
      return: (ret * 100).toFixed(2),
      累積: ((currentStockData[selectedStock].multi_horizon_returns['7d'].daily_returns.slice(0, index + 1).reduce((sum, r) => sum + r, 0)) * 100).toFixed(2)
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
  };
  const getTrendIcon = (expectedReturn) => {
    if (expectedReturn > 0.02) return '📈';
    if (expectedReturn < -0.02) return '📉';
    return '➡️';
  };

  const getRiskLevel = (volatility) => {
    if (volatility > 0.05) return { level: 'HIGH', variant: 'danger', label: '高風險' };
    if (volatility > 0.02) return { level: 'MEDIUM', variant: 'warning', label: '中風險' };
    return { level: 'LOW', variant: 'success', label: '低風險' };
  };

  const getPerformanceRating = (compositeScore) => {
    if (compositeScore >= 70) return { rating: 'EXCELLENT', variant: 'success', label: '優秀' };
    if (compositeScore >= 60) return { rating: 'GOOD', variant: 'info', label: '良好' };
    if (compositeScore >= 40) return { rating: 'FAIR', variant: 'warning', label: '一般' };
    return { rating: 'POOR', variant: 'danger', label: '較差' };
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">        {/* 標題和市場概覽 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">AI 股票預測儀表盤</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="info">
                  {stocks.length} 支股票
                </Badge>
                <Badge variant="success">
                  多時間段預測
                </Badge>
                <span className="text-lg font-semibold">
                  預測日期: {predictionDate}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">資料維度</h3>
                <p className="text-lg font-bold text-blue-600">
                  {Object.values(currentStockData)[0]?.basic_info?.feature_dimension || 'N/A'}
                </p>
                <p className="text-xs text-blue-500">特徵向量</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">平均7日預期</h3>
                <p className="text-lg font-bold text-green-600">
                  {(() => {
                    const avgReturn = stocks.reduce((sum, stock) => 
                      sum + (currentStockData[stock]?.multi_horizon_returns?.['7d']?.expected_return || 0), 0) / stocks.length;
                    return (avgReturn * 100).toFixed(2);
                  })()}%
                </p>
                <p className="text-xs text-green-500">預期收益率</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800">平均波動率</h3>
                <p className="text-lg font-bold text-yellow-600">
                  {(() => {
                    const avgVol = stocks.reduce((sum, stock) => 
                      sum + (currentStockData[stock]?.risk_metrics?.volatility_7d || 0), 0) / stocks.length;
                    return (avgVol * 100).toFixed(2);
                  })()}%
                </p>
                <p className="text-xs text-yellow-500">7日波動率</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">綜合評分</h3>
                <p className="text-lg font-bold text-purple-600">
                  {(() => {
                    const avgScore = stocks.reduce((sum, stock) => 
                      sum + (currentStockData[stock]?.selection_scores?.composite_score || 50), 0) / stocks.length;
                    return avgScore.toFixed(1);
                  })()}
                </p>
                <p className="text-xs text-purple-500">平均得分</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800">資料點數</h3>
                <p className="text-lg font-bold text-red-600">
                  {Object.values(currentStockData)[0]?.basic_info?.data_points || 'N/A'}
                </p>
                <p className="text-xs text-red-500">訓練樣本</p>
              </div>
            </div>
          </CardContent>
        </Card>{/* 控制面板 */}
        <Card>
          <CardContent className="flex flex-wrap gap-4">
            <div className="flex flex-col min-w-[200px]">
              <Label htmlFor="stock-search">搜索股票</Label>
              <Input
                id="stock-search"
                placeholder="輸入股票代碼 (如 AAPL)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>            <div className="flex flex-col min-w-[150px]">
              <Label htmlFor="sort-by">排序依據</Label>
              <Select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="prediction">7日預期收益</option>
                <option value="volatility">波動率</option>
                <option value="confidence">綜合評分</option>
                <option value="cumulative">7日累積收益</option>
                <option value="last_return">歷史收益</option>
              </Select>
            </div>

            <div className="flex flex-col min-w-[120px]">
              <Label htmlFor="sort-order">排序順序</Label>
              <Select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">高到低</option>
                <option value="asc">低到高</option>
              </Select>
            </div>

            <div className="flex flex-col min-w-[120px]">
              <Label htmlFor="view-mode">顯示模式</Label>
              <Select
                id="view-mode"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
              >
                <option value="table">表格</option>
                <option value="cards">卡片</option>
                <option value="chart">圖表</option>
              </Select>
            </div>
          </CardContent>
        </Card>

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
                        label={({name, value}) => `${name}: ${value}%`}
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
                      <YAxis dataKey="return" name="收益" unit="%" />
                      <Tooltip 
                        formatter={(value, name) => [
                          `${value.toFixed(2)}%`, 
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
                          <th className="p-3 text-right">7日預期</th>
                          <th className="p-3 text-right">7日累積</th>
                          <th className="p-3 text-right">歷史收益</th>
                          <th className="p-3 text-center">綜合評分</th>
                          <th className="p-3 text-right">波動率</th>
                          <th className="p-3 text-center">風險等級</th>
                          <th className="p-3 text-center">趨勢</th>
                          <th className="p-3 text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody>                        {filteredStocks.map((stock) => {
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
                            <tr key={stock} className="border-b hover:bg-gray-50">
                              <td className="p-3 font-medium uppercase">{stock}</td>
                              <td className={`p-3 text-right font-semibold ${
                                oneDayReturn >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {(oneDayReturn * 100).toFixed(2)}%
                              </td>
                              <td className={`p-3 text-right font-semibold ${
                                sevenDayReturn >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {(sevenDayReturn * 100).toFixed(2)}%
                              </td>
                              <td className={`p-3 text-right ${
                                cumulativeReturn >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {(cumulativeReturn * 100).toFixed(2)}%
                              </td>
                              <td className={`p-3 text-right ${
                                lastKnownReturn >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {(lastKnownReturn * 100).toFixed(2)}%
                              </td>
                              <td className="p-3 text-center">
                                <Badge variant={performanceInfo.variant}>
                                  {compositeScore}
                                </Badge>
                                <div className="text-xs text-gray-500 mt-1">
                                  {performanceInfo.label}
                                </div>
                              </td>
                              <td className="p-3 text-right">{(volatility * 100).toFixed(2)}%</td>
                              <td className="p-3 text-center">
                                <Badge variant={riskInfo.variant}>
                                  {riskInfo.label}
                                </Badge>
                              </td>
                              <td className="p-3 text-center">
                                {getTrendIcon(sevenDayReturn)} 
                              </td>
                              <td className="p-3 text-center">
                                <Button 
                                  size="sm" 
                                  onClick={() => setSelectedStock(stock)}
                                  variant="secondary"
                                >
                                  詳情
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
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-xs text-gray-500">1日預期收益</div>
                              <div className={`font-semibold ${
                                oneDayReturn >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {(oneDayReturn * 100).toFixed(2)}%
                              </div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-xs text-gray-500">7日預期收益</div>
                              <div className={`font-semibold ${
                                sevenDayReturn >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {(sevenDayReturn * 100).toFixed(2)}%
                              </div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-xs text-gray-500">7日累積收益</div>
                              <div className={`font-semibold ${
                                cumulativeReturn >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {(cumulativeReturn * 100).toFixed(2)}%
                              </div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-xs text-gray-500">歷史收益</div>
                              <div className={`font-semibold ${
                                lastKnownReturn >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {(lastKnownReturn * 100).toFixed(2)}%
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span>綜合評分:</span>
                            <Badge variant={performanceInfo.variant}>
                              {compositeScore}/100
                            </Badge>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span>波動率:</span>
                            <span className="font-medium">{(volatility * 100).toFixed(2)}%</span>
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
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredStocks.slice(0, 15).map(stock => {
                      const stockData = currentStockData[stock] || {};
                      return {
                        name: stock.toUpperCase(),
                        '1日預期': ((stockData.multi_horizon_returns?.['1d']?.expected_return || 0) * 100).toFixed(2),
                        '7日預期': ((stockData.multi_horizon_returns?.['7d']?.expected_return || 0) * 100).toFixed(2),
                        '7日累積': ((stockData.multi_horizon_returns?.['7d']?.cumulative_return || 0) * 100).toFixed(2),
                        '波動率': ((stockData.risk_metrics?.volatility_7d || 0) * 100).toFixed(2),
                        '綜合評分': stockData.selection_scores?.composite_score || 50
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
          </TabPanel>          <TabPanel value="trends" label="📉 趨勢分析">
            {selectedStock && (
              <div className="space-y-6">
                {/* 股票基本資訊 */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">{selectedStock.toUpperCase()} 詳細分析</h3>
                      <Button onClick={() => setSelectedStock('')} variant="secondary" size="sm">
                        清除選擇
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {(() => {
                        const stockInfo = currentStockData[selectedStock]?.basic_info || {};
                        const riskMetrics = currentStockData[selectedStock]?.risk_metrics || {};
                        const scores = currentStockData[selectedStock]?.selection_scores || {};
                        
                        return (
                          <>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-blue-800">基本資訊</h4>
                              <div className="text-sm space-y-1 mt-2">
                                <p><strong>預測日期:</strong> {stockInfo.prediction_date}</p>
                                <p><strong>數據點數:</strong> {stockInfo.data_points}</p>
                                <p><strong>特徵維度:</strong> {stockInfo.feature_dimension}</p>
                              </div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-green-800">歷史表現</h4>
                              <div className="text-sm space-y-1 mt-2">
                                <p><strong>最近收益:</strong> 
                                  <span className={stockInfo.last_known_return >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {(stockInfo.last_known_return * 100).toFixed(2)}%
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-yellow-800">風險指標</h4>
                              <div className="text-sm space-y-1 mt-2">
                                <p><strong>7日波動率:</strong> {(riskMetrics.volatility_7d * 100).toFixed(2)}%</p>
                                <p><strong>預期範圍:</strong> {(riskMetrics.min_return_7d * 100).toFixed(2)}% ~ {(riskMetrics.max_return_7d * 100).toFixed(2)}%</p>
                              </div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-purple-800">評分</h4>
                              <div className="text-sm space-y-1 mt-2">
                                <p><strong>綜合評分:</strong> {scores.composite_score}/100</p>
                                <p><strong>風險調整收益:</strong> {scores.risk_adjusted_return}</p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* 多時間段趨勢圖表 */}
                <Card>
                  <CardHeader>
                    <h4 className="text-lg font-semibold">多時間段預測趨勢</h4>
                  </CardHeader>
                  <CardContent style={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <XAxis dataKey="label" />
                        <YAxis unit="%" />
                        <Tooltip formatter={(value, name) => [
                          `${value.toFixed(2)}%`, 
                          name === 'expected' ? '日預期收益' : '累積收益'
                        ]} />
                        <Line type="monotone" dataKey="expected" stroke="#8884d8" strokeWidth={3} name="日預期收益" />
                        <Line type="monotone" dataKey="cumulative" stroke="#82ca9d" strokeWidth={3} name="累積收益" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* 7日詳細預測 */}
                <Card>
                  <CardHeader>
                    <h4 className="text-lg font-semibold">7日逐日預測明細</h4>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold mb-3">逐日收益預測</h5>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={dailyReturnsData}>
                            <XAxis dataKey="day" />
                            <YAxis unit="%" />
                            <Tooltip formatter={(value) => [`${value}%`, '預期收益']} />
                            <Bar dataKey="return" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <h5 className="font-semibold mb-3">累積收益趨勢</h5>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={dailyReturnsData}>
                            <XAxis dataKey="day" />
                            <YAxis unit="%" />
                            <Tooltip formatter={(value) => [`${value}%`, '累積收益']} />
                            <Line type="monotone" dataKey="累積" stroke="#82ca9d" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {!selectedStock && (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 text-lg">請從股票分析頁面選擇一個股票來查看詳細趨勢分析</p>
                  <Button 
                    onClick={() => setActiveTab('stocks')} 
                    variant="primary" 
                    className="mt-4"
                  >
                    前往股票分析
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabPanel>          <TabPanel value="analysis" label="🔍 深度分析">
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
                            </div>
                            <div className="text-sm text-gray-600 mt-1 grid grid-cols-3 gap-4">
                              <p>7日預期: <span className={sevenDayReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {(sevenDayReturn * 100).toFixed(2)}%
                              </span></p>
                              <p>評分: {compositeScore}/100</p>
                              <p>波動率: {(volatility * 100).toFixed(2)}%</p>
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
