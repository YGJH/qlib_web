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
        const dates = Object.keys(json.daily_predictions);
        setSelectedDate(dates[0] || '');
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

  const dates = Object.keys(data.daily_predictions);
  const stocks = dates.length ? Object.keys(data.daily_predictions[dates[0]].stocks) : [];
  
  // 獲取當前日期的股票數據
  const currentDayData = data.daily_predictions[selectedDate]?.stocks || {};
  
  // 過濾和排序股票
  const filteredStocks = stocks
    .filter((stock) => stock.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aData = currentDayData[a];
      const bData = currentDayData[b];
      if (!aData || !bData) return 0;
      
      let aValue, bValue;
      switch (sortBy) {
        case 'prediction':
          aValue = aData.prediction || 0;
          bValue = bData.prediction || 0;
          break;
        case 'volatility':
          aValue = aData.volatility || 0;
          bValue = bData.volatility || 0;
          break;
        case 'confidence':
          aValue = aData.confidence || 0;
          bValue = bData.confidence || 0;
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  // 準備圖表數據
  const trendData = selectedStock ? dates.map((date) => ({
    date,
    prediction: (data.daily_predictions[date]?.stocks[selectedStock]?.prediction || 0) * 100,
    volatility: data.daily_predictions[date]?.stocks[selectedStock]?.volatility || 0
  })) : [];

  // 市場情緒分佈數據
  const sentimentData = [
    { name: '看漲', value: data.daily_predictions[selectedDate]?.market_stats?.bullish_ratio || 0, color: '#10B981' },
    { name: '看跌', value: data.daily_predictions[selectedDate]?.market_stats?.bearish_ratio || 0, color: '#EF4444' },
    { name: '中性', value: data.daily_predictions[selectedDate]?.market_stats?.neutral_ratio || 0, color: '#6B7280' }
  ];

  // 風險-收益散點圖數據
  const riskReturnData = filteredStocks.map(stock => {
    const stockData = currentDayData[stock];
    return {
      name: stock.toUpperCase(),
      risk: (stockData?.volatility || 0) * 100,
      return: (stockData?.prediction || 0) * 100,
      confidence: stockData?.confidence || 0
    };
  });

  const getSignalColor = (signal) => {
    switch (signal?.toLowerCase()) {
      case 'buy': return 'success';
      case 'sell': return 'danger';
      case 'hold': return 'warning';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend?.toLowerCase()) {
      case 'bullish': return '📈';
      case 'bearish': return '📉';
      case 'neutral': return '➡️';
      default: return '❓';
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 標題和市場概覽 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">股票預測儀表盤</h1>
              <div className="flex items-center space-x-2">
                <Badge variant={data.market_summary.overall_sentiment === 'BULLISH' ? 'success' : 'danger'}>
                  {data.market_summary.overall_sentiment}
                </Badge>
                <span className="text-lg font-semibold">
                  {(data.market_summary.avg_7day_prediction * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">預測期間</h3>
                <p className="text-sm text-blue-600">
                  {data.prediction_date_range.start} 至 {data.prediction_date_range.end}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">平均預測收益</h3>
                <p className="text-lg font-bold text-green-600">
                  {(data.market_summary.avg_7day_prediction * 100).toFixed(2)}%
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800">市場波動率</h3>
                <p className="text-lg font-bold text-yellow-600">
                  {(data.market_summary.volatility * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">推薦策略</h3>
                <p className="text-sm font-medium text-purple-600">
                  {data.market_summary.recommendation}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>        {/* 控制面板 */}
        <Card>
          <CardContent className="flex flex-wrap gap-4">
            <div className="flex flex-col min-w-[150px]">
              <Label htmlFor="date-select">選擇日期</Label>
              <Select
                id="date-select"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                {dates.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            </div>
            
            <div className="flex flex-col min-w-[200px]">
              <Label htmlFor="stock-search">搜索股票</Label>
              <Input
                id="stock-search"
                placeholder="輸入股票代碼 (如 AAPL)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col min-w-[150px]">
              <Label htmlFor="sort-by">排序依據</Label>
              <Select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="prediction">預測收益</option>
                <option value="volatility">波動率</option>
                <option value="confidence">信心度</option>
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
                  <h3 className="text-lg font-semibold">{selectedDate} 股票預測詳情</h3>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="p-3 text-left">股票</th>
                          <th className="p-3 text-right">預測收益</th>
                          <th className="p-3 text-center">信號</th>
                          <th className="p-3 text-center">趨勢</th>
                          <th className="p-3 text-right">信心度</th>
                          <th className="p-3 text-right">波動率</th>
                          <th className="p-3 text-center">風險等級</th>
                          <th className="p-3 text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStocks.map((stock) => {
                          const stockData = currentDayData[stock] || {};
                          return (
                            <tr key={stock} className="border-b hover:bg-gray-50">
                              <td className="p-3 font-medium uppercase">{stock}</td>
                              <td className={`p-3 text-right font-semibold ${
                                (stockData.prediction || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {((stockData.prediction || 0) * 100).toFixed(2)}%
                              </td>
                              <td className="p-3 text-center">
                                <Badge variant={getSignalColor(stockData.signal)}>
                                  {stockData.signal || 'N/A'}
                                </Badge>
                              </td>
                              <td className="p-3 text-center">
                                {getTrendIcon(stockData.trend)} {stockData.trend || 'N/A'}
                              </td>
                              <td className="p-3 text-right">{(stockData.confidence || 0).toFixed(2)}</td>
                              <td className="p-3 text-right">{((stockData.volatility || 0) * 100).toFixed(1)}%</td>
                              <td className="p-3 text-center">
                                <Badge variant={
                                  stockData.risk_level === 'HIGH' ? 'danger' :
                                  stockData.risk_level === 'MEDIUM' ? 'warning' : 'success'
                                }>
                                  {stockData.risk_level || 'N/A'}
                                </Badge>
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
            )}

            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStocks.map((stock) => {
                  const stockData = currentDayData[stock] || {};
                  return (
                    <Card key={stock} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-lg uppercase">{stock}</h3>
                          <Badge variant={getSignalColor(stockData.signal)}>
                            {stockData.signal || 'N/A'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>預測收益:</span>
                            <span className={`font-semibold ${
                              (stockData.prediction || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {((stockData.prediction || 0) * 100).toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>趨勢:</span>
                            <span>{getTrendIcon(stockData.trend)} {stockData.trend || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>信心度:</span>
                            <span>{(stockData.confidence || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>波動率:</span>
                            <span>{((stockData.volatility || 0) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>風險等級:</span>
                            <Badge variant={
                              stockData.risk_level === 'HIGH' ? 'danger' :
                              stockData.risk_level === 'MEDIUM' ? 'warning' : 'success'
                            }>
                              {stockData.risk_level || 'N/A'}
                            </Badge>
                          </div>
                          <Button 
                            onClick={() => setSelectedStock(stock)}
                            variant="primary"
                            size="sm"
                            className="w-full mt-3"
                          >
                            查看趨勢
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {viewMode === 'chart' && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">股票預測收益排行</h3>
                </CardHeader>
                <CardContent style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredStocks.slice(0, 10).map(stock => ({
                      name: stock.toUpperCase(),
                      prediction: ((currentDayData[stock]?.prediction || 0) * 100).toFixed(2),
                      volatility: ((currentDayData[stock]?.volatility || 0) * 100).toFixed(1)
                    }))}>
                      <XAxis dataKey="name" />
                      <YAxis unit="%" />
                      <Tooltip formatter={(value, name) => [`${value}%`, name === 'prediction' ? '預測收益' : '波動率']} />
                      <Bar dataKey="prediction" fill="#8884d8" />
                      <Bar dataKey="volatility" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabPanel>

          <TabPanel value="trends" label="📉 趨勢分析">
            {selectedStock && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{selectedStock.toUpperCase()} 趨勢分析</h3>
                    <Button onClick={() => setSelectedStock('')} variant="secondary" size="sm">
                      清除選擇
                    </Button>
                  </div>
                </CardHeader>
                <CardContent style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <XAxis dataKey="date" />
                      <YAxis unit="%" />
                      <Tooltip formatter={(value, name) => [
                        `${value.toFixed(2)}%`, 
                        name === 'prediction' ? '預測收益' : '波動率'
                      ]} />
                      <Line type="monotone" dataKey="prediction" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="volatility" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {!selectedStock && (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 text-lg">請從股票分析頁面選擇一個股票來查看趨勢</p>
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
          </TabPanel>

          <TabPanel value="analysis" label="🔍 深度分析">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 股票分析摘要 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">股票分析摘要</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(data.stock_analysis || {}).slice(0, 5).map(([stock, analysis]) => (
                      <div key={stock} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold uppercase">{stock}</h4>
                          <Badge variant={analysis.dominant_signal === 'SELL' ? 'danger' : 'warning'}>
                            {analysis.dominant_signal}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <p>7日平均: {(analysis['7day_avg_prediction'] * 100).toFixed(2)}%</p>
                          <p>趨勢方向: {analysis.trend_direction}</p>
                          <p>預測一致性: {analysis.prediction_consistency}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 市場統計 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">市場統計資訊</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="font-semibold mb-2">模型資訊</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>模型類型:</strong> {data.model_info.model_type}</p>
                        <p><strong>訓練期間:</strong> {data.model_info.train_period}</p>
                        <p><strong>股票數量:</strong> {data.model_info.num_stocks}</p>
                        <p><strong>預測基礎:</strong> {data.model_info.prediction_based_on}</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded">
                      <h4 className="font-semibold mb-2">當日市場狀況</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>平均預測:</strong> {((data.daily_predictions[selectedDate]?.market_stats?.avg_prediction || 0) * 100).toFixed(2)}%</p>
                        <p><strong>市場情緒:</strong> {data.daily_predictions[selectedDate]?.market_stats?.market_sentiment}</p>
                        <p><strong>總股票數:</strong> {data.daily_predictions[selectedDate]?.market_stats?.total_stocks}</p>
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
